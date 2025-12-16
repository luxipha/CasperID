// Background service worker for CasperID Connect

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('[CasperID] Extension installed');

    // Initialize storage
    chrome.storage.local.set({
        connected: false,
        userData: null,
        autoApprove: false,
        notifications: true,
        permissions: []
    });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[CasperID Background] Received message:', message);

    if (message.type === 'CASPERID_LOGIN_REQUEST') {
        handleLoginRequest(message, sender, sendResponse);
        return true; // Keep channel open for async response
    }

    if (message.type === 'CHECK_CONNECTION') {
        handleCheckConnection(sendResponse);
        return true;
    }

    if (message.type === 'GRANT_PERMISSION') {
        handleGrantPermission(message, sendResponse);
        return true;
    }

    // [NEW] Handle profile request for autofill
    if (message.type === 'GET_USER_PROFILE') {
        handleGetUserProfile(sendResponse);
        return true;
    }

    // [NEW] Handle identity sync from dashboard
    if (message.type === 'SYNC_IDENTITY_DATA') {
        handleSyncIdentityData(message.data);
        return true;
    }
});

// Handle identity sync
async function handleSyncIdentityData(data) {
    console.log('[CasperID Background] Syncing identity data:', data);

    // Update storage with authoritative data from dashboard
    await chrome.storage.local.set({
        connected: true,
        userData: data
    });

    // Hydrate with full public profile if possible
    if (data.wallet) {
        try {
            const profile = await fetchProfile(data.wallet);
            if (profile) {
                await chrome.storage.local.set({
                    userData: { ...data, profile }
                });
                console.log('[CasperID Background] Profile hydrated for autofill');
            }
        } catch (e) {
            console.error('[CasperID Background] Failed to hydrate profile', e);
        }
    }
}

// Handle profile data request
async function handleGetUserProfile(sendResponse) {
    // In production, we should ask for permission per-domain again or check allowance
    let { connected, userData } = await chrome.storage.local.get(['connected', 'userData']);

    if (connected && userData) {
        // Hydrate profile on-demand if missing
        if (!userData.profile && userData.wallet) {
            try {
                const profile = await fetchProfile(userData.wallet);
                if (profile) {
                    userData = { ...userData, profile };
                    await chrome.storage.local.set({ userData });
                }
            } catch (e) {
                console.error('[CasperID] Profile hydrate failed in GET_USER_PROFILE', e);
            }
        }
        sendResponse({ userData });
        return;
    }

    sendResponse({ userData: null });
}

// Handle login request from website
async function handleLoginRequest(message, sender, sendResponse) {
    const domain = message.domain;

    console.log(`[CasperID] Login request from ${domain}`);

    // Check if already connected
    const { connected, userData } = await chrome.storage.local.get(['connected', 'userData']);

    if (!connected || !userData) {
        // Open popup to connect
        chrome.action.openPopup();
        sendResponse({ success: false, error: 'Not connected' });
        return;
    }

    // Check auto-approve setting
    const { autoApprove } = await chrome.storage.local.get('autoApprove');

    if (autoApprove) {
        // Auto-approve for trusted sites
        sendResponse({
            success: true,
            data: {
                wallet: userData.wallet,
                cnsName: userData.cnsName,
                verified: userData.verified,
                tier: userData.tier
            }
        });
    } else {
        // Open popup for manual approval
        chrome.action.openPopup();

        // Store pending request
        chrome.storage.local.set({
            pendingRequest: {
                domain,
                tabId: sender.tab.id,
                timestamp: Date.now()
            }
        });

        sendResponse({ success: false, error: 'Approval required' });
    }
}

// Handle connection check
async function handleCheckConnection(sendResponse) {
    const { connected, userData } = await chrome.storage.local.get(['connected', 'userData']);
    sendResponse({ connected, userData });
}

// Handle permission grant
async function handleGrantPermission(message, sendResponse) {
    const { domain, permissions } = message;

    // Get current permissions
    const { permissions: currentPermissions } = await chrome.storage.local.get('permissions');

    // Add new permission
    const newPermission = {
        domain,
        permissions,
        grantedAt: Date.now()
    };

    currentPermissions.push(newPermission);

    // Save
    await chrome.storage.local.set({ permissions: currentPermissions });

    sendResponse({ success: true });
}

// Listen for tab updates to inject CasperID hints
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if site supports CasperID
        chrome.tabs.sendMessage(tabId, {
            type: 'CHECK_CASPERID_SUPPORT'
        }).catch(() => {
            // Tab might not have content script loaded yet
        });
    }
});

// Badge to show connection status
chrome.storage.local.get(['connected'], (result) => {
    if (result.connected) {
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    }
});

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes) => {
    if (changes.connected) {
        if (changes.connected.newValue) {
            chrome.action.setBadgeText({ text: '✓' });
            chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    }
});

// [NEW] Notification Polling
const POLLING_INTERVAL = 30000; // 30 seconds

async function pollNotifications() {
    const { token, notifications: notificationsEnabled } = await chrome.storage.local.get(['token', 'notifications']);

    if (!token || !notificationsEnabled) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.notifications && data.notifications.length > 0) {
                // Show latest notification
                const latest = data.notifications[0];

                // Check if we've already shown this one (simple dedup by ID)
                const { lastNotificationId } = await chrome.storage.local.get('lastNotificationId');

                if (latest._id !== lastNotificationId) {
                    showSystemNotification(latest);
                    // Update last shown
                    await chrome.storage.local.set({ lastNotificationId: latest._id });
                }
            }
        }
    } catch (error) {
        console.error('[CasperID] Notification poll failed:', error);
    }
}

function showSystemNotification(notification) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'CasperID Alert',
        message: notification.message,
        priority: 2
    });
}

// Start polling
setInterval(pollNotifications, POLLING_INTERVAL);
pollNotifications(); // Initial check

// Helper: fetch full public profile for autofill
async function fetchProfile(wallet) {
    try {
        const res = await fetch(`http://localhost:3001/api/public-profile/${wallet}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('[CasperID] Profile fetch failed', error);
        return null;
    }
}

console.log('[CasperID] Background service worker loaded');
