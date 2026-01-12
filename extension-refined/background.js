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

    // [NEW] Handle Revoke Permission
    if (message.type === 'REVOKE_PERMISSION') {
        handleRevokePermission(message.domain, sendResponse);
        return true;
    }

    // [NEW] Handle Total Disconnect
    if (message.type === 'DISCONNECT_IDENTITY') {
        handleDisconnectIdentity(sendResponse);
        return true;
    }

    // [NEW] Handle AI Cover Letter Generation
    if (message.type === 'GENERATE_COVER_LETTER') {
        handleGenerateCoverLetter(message.jobDescription, sendResponse);
        return true;
    }

    // [NEW] Handle Sync Job Data
    if (message.type === 'SYNC_JOB_DATA') {
        handleSyncJobData(message.data);
        return true;
    }

    // [NEW] Handle Match Job
    if (message.type === 'MATCH_JOB') {
        handleMatchJob(message.jobDescription, sendResponse);
        return true;
    }
});

// Handle identity sync
async function handleSyncIdentityData(data) {
    if (!data) return;
    console.log('[CasperID Background] Syncing identity data:', data);

    const { sessionToken } = await chrome.storage.local.get(['sessionToken']);

    // Save basic data first
    await chrome.storage.local.set({
        connected: true,
        userData: data,
        lastSyncAt: Date.now()
    });

    // If we have a session token or one was just passed, hydrate extra data
    const token = data.sessionToken || sessionToken;
    if (token) {
        try {
            const [profile, permissions] = await Promise.all([
                fetchProfile(data.wallet, token),
                fetchPermissions(data.wallet, token)
            ]);

            const updates = {};
            if (profile) {
                updates.userData = { ...data, profile };
            }
            if (permissions) {
                updates.permissions = permissions;
                console.log('[CasperID Background] Permissions (Connected Apps) synced');
            }

            if (Object.keys(updates).length > 0) {
                await chrome.storage.local.set(updates);
            }
        } catch (e) {
            console.error('[CasperID Background] Failed to hydrate extra data', e);
        }
    }
}

// Handle job data sync from various platforms
async function handleSyncJobData(data) {
    if (!data) return;
    console.log('[CasperID Background] Syncing job data:', data.title, 'at', data.company);
    await chrome.storage.local.set({ currentJob: data });
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

// Handle permission revoke
async function handleRevokePermission(domain, sendResponse) {
    console.log(`[CasperID Background] Revoking permission for ${domain}`);

    const { permissions } = await chrome.storage.local.get('permissions');
    const filtered = (permissions || []).filter(p => p.domain !== domain);

    await chrome.storage.local.set({ permissions: filtered });

    // Notify the actual tab if it exists
    const tabs = await chrome.tabs.query({ url: `*://${domain}/*` });
    tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
            type: 'CASPERID_ACCESS_REVOKED',
            domain: domain
        }).catch(() => { });
    });

    sendResponse({ success: true });
}

// Handle total disconnect
async function handleDisconnectIdentity(sendResponse) {
    console.log('[CasperID Background] Total disconnect requested');

    await chrome.storage.local.set({
        connected: false,
        userData: null,
        permissions: [],
        sessionToken: null
    });

    chrome.action.setBadgeText({ text: '' });
    sendResponse({ success: true });
}

// Handle AI Cover Letter Generation
async function handleGenerateCoverLetter(jobDescription, sendResponse) {
    console.log('[CasperID Background] Requesting AI cover letter generation');

    try {
        const { userData, sessionToken } = await chrome.storage.local.get(['userData', 'sessionToken']);

        if (!userData || !sessionToken) {
            sendResponse({ success: false, error: 'User data or session token missing' });
            return;
        }

        const profileData = userData.profile || userData;
        console.log('[CasperID Background] Sending cover letter request to server...');

        const response = await fetch('http://localhost:3001/api/ai/generate-cover-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ profileData, jobDescription })
        });

        console.log('[CasperID Background] Server response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('[CasperID Background] Cover letter generated:', data.subject);

            // Save cover letter to storage for display
            const { currentJob } = await chrome.storage.local.get('currentJob');
            if (currentJob) {
                await chrome.storage.local.set({
                    currentJob: { ...currentJob, coverLetter: data }
                });
            }

            sendResponse({ success: true, data });
        } else {
            const error = await response.json();
            console.error('[CasperID Background] Cover letter error:', error);
            sendResponse({ success: false, error: error.details || error.error || 'Backend error' });
        }
    } catch (error) {
        console.error('[CasperID Background] AI generation failed:', error);
        sendResponse({ success: false, error: 'Connection failed: ' + error.message });
    }
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
        type: 'layer_1',
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
async function fetchProfile(wallet, token) {
    try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`http://localhost:3001/api/public-profile/${wallet}`, { headers });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('[CasperID] Profile fetch failed', error);
        return null;
    }
}

// Helper: fetch real permissions/connected apps
async function fetchPermissions(token) {
    try {
        const res = await fetch(`http://localhost:3001/api/metamask/user/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        const data = await res.json();

        // Map to extension format if needed (extension expects an array of apps)
        if (data.success && data.userPermissions && data.userPermissions.permissions) {
            return data.userPermissions.permissions.map(grant => ({
                grantId: grant.grantId,
                name: grant.dappName,
                domain: grant.dappName.toLowerCase().replace(/\s+/g, '') + '.io', // Mock domain if missing
                type: 'Web3',
                lastActive: grant.updatedAt || grant.createdAt,
                permissions: grant.permissions.map(p => p.action)
            }));
        }
        return [];
    } catch (error) {
        console.error('[CasperID] Permissions fetch failed', error);
        return [];
    }
}

// Helper: Match job with profile via backend AI
async function handleMatchJob(jobDescription, sendResponse) {
    console.log('[CasperID Background] handleMatchJob started');
    try {
        const { userData, sessionToken } = await chrome.storage.local.get(['userData', 'sessionToken']);
        console.log('[CasperID Background] Data fetched from storage:', {
            hasUserData: !!userData,
            hasToken: !!sessionToken,
            wallet: userData?.wallet
        });

        if (!userData || !sessionToken) {
            console.error('[CasperID Background] Missing data for matching');
            sendResponse({ success: false, error: 'User data or session token missing' });
            return;
        }

        const profileData = userData.profile || userData;
        console.log('[CasperID Background] Sending fetch to server on port 3001...');

        const res = await fetch(`http://localhost:3001/api/ai/match-job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                profileData: profileData,
                jobDescription: jobDescription
            })
        });

        console.log('[CasperID Background] Server response status:', res.status);

        if (!res.ok) {
            const err = await res.json();
            console.error('[CasperID Background] Server error:', err);
            throw new Error(err.error || 'Failed to match job');
        }

        const result = await res.json();
        console.log('[CasperID Background] Match results received from AI:', result);

        // Save match results to storage so they persist in the popup
        const { currentJob } = await chrome.storage.local.get('currentJob');
        if (currentJob) {
            const updatedJob = { ...currentJob, matchResults: result };
            console.log('[CasperID Background] Updating currentJob with results in storage');
            await chrome.storage.local.set({ currentJob: updatedJob });
        }

        sendResponse({ success: true, data: result });
    } catch (error) {
        console.error('[CasperID Background] Job matching failed extension-side:', error);
        sendResponse({ success: false, error: error.message });
    }
}

console.log('[CasperID] Background service worker loaded');
