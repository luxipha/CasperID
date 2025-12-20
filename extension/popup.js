// Popup script for CasperID Connect extension

// Mock user data (in production, this would come from wallet/blockchain)
const MOCK_USER_DATA = {
    wallet: '0155...94415',
    cnsName: 'alice.cspr',
    verified: true,
    tier: 'Tier 2 - Full KYC',
    verifiedDate: '2024-11-25',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    // Earnings data
    totalEarned: 1247,
    totalEarnedUSD: 62.35,
    monthlyEarnings: 387,
    recentEarnings: [
        { platform: 'defi-app.com', amount: 10, time: '2 hours ago' },
        { platform: 'nft-market.io', amount: 15, time: '1 day ago' },
        { platform: 'game-platform.com', amount: 5, time: '3 days ago' }
    ],
    permissions: [
        { domain: 'defi-app.com', granted: ['wallet', 'verification_status'], date: '2024-11-20' },
        { domain: 'nft-marketplace.io', granted: ['wallet', 'name'], date: '2024-11-22' }
    ]
};

// State
let currentTab = 'wallet';
let isConnected = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    setupEventListeners();
    renderCurrentState();
});

// Load data from chrome.storage
function loadStoredData() {
    chrome.storage.local.get(['connected', 'userData', 'pendingRequest', 'autoApprove', 'notifications'], (result) => {
        // [NEW] Check for pending request first
        if (result.pendingRequest) {
            handlePendingRequest(result.pendingRequest);
        }

        if (result.connected && result.userData) {
            isConnected = true;
            // Use stored data and update UI immediately
            const storedData = result.userData;

            // Update UI elements with stored data
            document.getElementById('human-id').textContent = storedData.humanId || 'user-id';
            document.getElementById('cns-name').textContent = storedData.cnsName || 'user.cid';
            document.getElementById('verification-tier').textContent = storedData.tier || 'Unverified';

            // Update verification status
            updateVerificationStatus(storedData.verified, storedData.tier);

            // Render the connected state
            renderCurrentState();

            if (storedData.wallet) {
                // Try to refresh from API in background
                fetchRealData(storedData.wallet);
            }
        }

        // Load settings
        const autoApproveCheckbox = document.getElementById('auto-approve');
        const notificationsCheckbox = document.getElementById('notifications');

        if (autoApproveCheckbox) {
            autoApproveCheckbox.checked = result.autoApprove !== undefined ? result.autoApprove : false;
        }

        if (notificationsCheckbox) {
            notificationsCheckbox.checked = result.notifications !== undefined ? result.notifications : true;
        }
    });
}

// Update verification status UI
function updateVerificationStatus(isVerified, tier) {
    const statusText = document.querySelector('.status-text h3');
    const badge = document.querySelector('.verification-badge');
    const icon = document.querySelector('.status-icon');

    if (isVerified) {
        statusText.textContent = 'Verified Identity';
        badge.style.display = 'inline-flex';
        icon.classList.add('verified');
        icon.textContent = '✓';
        icon.style.background = '#10b981';
        icon.style.color = 'white';
    } else {
        statusText.textContent = 'Unverified Identity';
        badge.style.display = 'none';
        icon.classList.remove('verified');
        icon.textContent = '!';
        icon.style.background = 'rgba(239, 68, 68, 0.2)';
        icon.style.color = '#ef4444';
    }
}

// Fetch real data from Backend
async function fetchRealData(walletAddress) {
    try {
        if (!walletAddress) return;

        // Use localhost backend
        const response = await fetch(`http://localhost:3001/api/identity-status?wallet=${walletAddress}`);
        const data = await response.json();

        // Map backend API format to extension UI format
        const realUserData = {
            wallet: data.wallet,
            humanId: data.human_id || 'unknown-id',
            cnsName: data.profile?.cns_name || (data.human_id ? `${data.human_id.replace(/-/g, '')}.cid` : 'user.cid'),
            verified: data.verified,
            tier: data.tier || 'Unverified',
            verifiedDate: data.last_kyc_at ? new Date(data.last_kyc_at * 1000).toISOString().split('T')[0] : '-',
            // Keep existing earnings mock data or fetch if available
            totalEarned: 1247,
            totalEarnedUSD: 62.35,
            monthlyEarnings: 387,
            recentEarnings: MOCK_USER_DATA.recentEarnings,
            permissions: MOCK_USER_DATA.permissions
        };

        // Update UI
        document.getElementById('human-id').textContent = realUserData.humanId || 'user-id';
        document.getElementById('cns-name').textContent = realUserData.cnsName;
        document.getElementById('verification-tier').textContent = realUserData.tier;

        // Update verification status
        updateVerificationStatus(realUserData.verified, realUserData.tier);
    } catch (error) {
        console.error('Failed to fetch real data', error);
    }
}

// [NEW] Handle pending connection request
async function handlePendingRequest(request) {
    if (!request) return;

    // Show data selector immediately
    const dataToShare = await showDataSelector(request.domain);

    if (dataToShare.length > 0) {
        // Get real stored user data and permissions
        const result = await chrome.storage.local.get(['userData', 'permissions']);
        const userData = result.userData;
        const permissions = result.permissions || [];

        // Save permission for this domain
        const newPermission = {
            domain: request.domain,
            granted: dataToShare,
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        // Update permissions array (remove existing for same domain, add new)
        const updatedPermissions = permissions.filter(p => p.domain !== request.domain);
        updatedPermissions.push(newPermission);

        // Store updated permissions
        await chrome.storage.local.set({ permissions: updatedPermissions });
        console.log(`[CasperID] Saved permission for ${request.domain}:`, newPermission);

        // Grant & Notify Tab
        chrome.tabs.sendMessage(request.tabId, {
            type: 'CASPERID_AUTH_SUCCESS',
            data: {
                wallet: userData?.wallet || 'No wallet connected',
                humanId: userData?.humanId || 'unknown-id',
                cnsName: userData?.cnsName || 'user.cid',
                verified: userData?.verified || false,
                tier: userData?.tier || 'Unverified',
                requestedData: dataToShare
            }
        });

        // Clear pending
        chrome.storage.local.remove('pendingRequest');
        window.close(); // Close popup after action
    } else {
        // If cancelled, just clear request
        chrome.storage.local.remove('pendingRequest');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation Tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active to current
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            currentTab = tabName;

            // Load permissions when switching to permissions tab
            if (tabName === 'permissions' && isConnected) {
                renderPermissions();
            }
        });
    });

    // Connect Button
    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnect);
    }

    // Disconnect Button (if exists)
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleDisconnect);
    }

    // Share Identity Button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShareIdentity);
    }

    // Settings checkboxes
    const autoApproveCheckbox = document.getElementById('auto-approve');
    const notificationsCheckbox = document.getElementById('notifications');

    if (autoApproveCheckbox) {
        autoApproveCheckbox.addEventListener('change', async () => {
            await chrome.storage.local.set({ autoApprove: autoApproveCheckbox.checked });
            console.log('Auto-approve setting updated:', autoApproveCheckbox.checked);
        });
    }

    if (notificationsCheckbox) {
        notificationsCheckbox.addEventListener('change', async () => {
            await chrome.storage.local.set({ notifications: notificationsCheckbox.checked });
            console.log('Notifications setting updated:', notificationsCheckbox.checked);
        });
    }

    // Copy buttons
    const copyIdBtn = document.getElementById('copy-id');
    const copyCnsBtn = document.getElementById('copy-cns');

    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', () => {
            const humanId = document.getElementById('human-id').textContent;
            copyToClipboard(humanId, copyIdBtn);
        });
    }

    if (copyCnsBtn) {
        copyCnsBtn.addEventListener('click', () => {
            const cnsName = document.getElementById('cns-name').textContent;
            copyToClipboard(cnsName, copyCnsBtn);
        });
    }

    // Job Assistant
    setupJobAssistant();
}

// Job Assistant Logic
let currentJob = null;
let generatedCoverLetter = null;

function setupJobAssistant() {
    const scrapeBtn = document.getElementById('scrape-job-btn');
    const generateBtn = document.getElementById('generate-cover-letter-btn');
    const fillBtn = document.getElementById('fill-cover-letter-btn');

    if (scrapeBtn) {
        scrapeBtn.addEventListener('click', async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            chrome.tabs.sendMessage(tab.id, { type: 'GET_JOB_DETAILS' }, (response) => {
                if (response && response.description) {
                    currentJob = response;
                    document.getElementById('job-details-card').classList.remove('hidden');
                    document.getElementById('no-job-detected').classList.add('hidden');
                    document.getElementById('job-title-display').textContent = response.title || 'Found Job';
                    document.getElementById('job-desc-preview').textContent = response.description.slice(0, 150) + '...';
                    generateBtn.disabled = false;
                } else {
                    alert('Could not find a clear job description on this page. Try scrolling down or clicking on the job details.');
                }
            });
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            if (!currentJob) return;

            const loading = document.getElementById('job-loading');
            loading.classList.remove('hidden');
            generateBtn.disabled = true;

            const result = await chrome.storage.local.get(['userData']);
            const userData = result.userData;

            try {
                const response = await fetch('http://localhost:3001/api/ai/generate-cover-letter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profileData: userData,
                        jobDescription: currentJob.description
                    })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                generatedCoverLetter = data.content || data.cover_letter;

                document.getElementById('cover-letter-text').value = generatedCoverLetter;
                document.getElementById('cover-letter-preview-card').classList.remove('hidden');
            } catch (error) {
                console.error('Failed to generate cover letter', error);
                alert('Generation failed: ' + error.message);
            } finally {
                loading.classList.add('hidden');
                generateBtn.disabled = false;
            }
        });
    }

    if (fillBtn) {
        fillBtn.addEventListener('click', async () => {
            const content = document.getElementById('cover-letter-text').value;
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            chrome.tabs.sendMessage(tab.id, {
                type: 'FILL_COVER_LETTER',
                content: content
            });

            alert('Cover letter injected into form!');
        });
    }
}

// Copy to clipboard function with visual feedback
async function copyToClipboard(text, buttonElement) {
    try {
        await navigator.clipboard.writeText(text);

        // Show success feedback
        buttonElement.classList.add('copy-success');

        // Reset after 1 second
        setTimeout(() => {
            buttonElement.classList.remove('copy-success');
        }, 1000);

        console.log(`[CasperID] Copied to clipboard: ${text}`);
    } catch (error) {
        console.error('[CasperID] Failed to copy to clipboard:', error);

        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            // Show success feedback
            buttonElement.classList.add('copy-success');
            setTimeout(() => {
                buttonElement.classList.remove('copy-success');
            }, 1000);

            console.log(`[CasperID] Copied to clipboard (fallback): ${text}`);
        } catch (fallbackError) {
            console.error('[CasperID] Fallback copy failed:', fallbackError);
        }
    }
}

// Render current state (Connected vs Disconnected)
function renderCurrentState() {
    const connectedView = document.getElementById('connected-view');
    const notConnectedView = document.getElementById('not-connected-view');

    if (isConnected) {
        connectedView.classList.remove('hidden');
        notConnectedView.classList.add('hidden');
        renderPermissions(); // If on permissions tab
    } else {
        connectedView.classList.add('hidden');
        notConnectedView.classList.remove('hidden');
    }
}

// Show connection error with retry option
function showConnectionError(message, openInstallPage = false) {
    const errorContainer = document.createElement('div');
    errorContainer.id = 'connection-error';
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 16px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    errorContainer.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">Connection Failed</div>
        <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.4;">${message}</div>
        <div style="display: flex; gap: 8px;">
            ${openInstallPage ? `
                <button id="install-signer-btn" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                ">Install Casper Signer</button>
            ` : `
                <button id="retry-connection-btn" style="
                    background: #dc2626;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                ">Retry Connection</button>
            `}
            <button id="dismiss-error-btn" style="
                background: transparent;
                color: #dc2626;
                border: 1px solid #dc2626;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                font-weight: 600;
            ">Dismiss</button>
        </div>
    `;

    // Remove existing error if any
    const existing = document.getElementById('connection-error');
    if (existing) existing.remove();

    document.body.appendChild(errorContainer);

    // Handle buttons
    const dismissBtn = document.getElementById('dismiss-error-btn');
    const retryBtn = document.getElementById('retry-connection-btn');
    const installBtn = document.getElementById('install-signer-btn');

    dismissBtn.addEventListener('click', () => errorContainer.remove());

    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            errorContainer.remove();
            handleConnect();
        });
    }

    if (installBtn) {
        installBtn.addEventListener('click', () => {
            window.open('https://www.casperwallet.io/', '_blank');
            errorContainer.remove();
        });
    }

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (document.getElementById('connection-error')) {
            errorContainer.remove();
        }
    }, 10000);
}

// Handle wallet connection - DIRECT INTEGRATION
async function handleConnect() {
    const loading = document.getElementById('loading');
    const notConnectedView = document.getElementById('not-connected-view');

    try {
        console.log('[CasperID] Starting connection...');

        // Show loading with progress feedback
        if (loading) {
            loading.classList.remove('hidden');
            const loadingText = loading.querySelector('p') || loading;
            loadingText.textContent = 'Connecting to Casper wallet...';
        }
        if (notConnectedView) notConnectedView.classList.add('hidden');

        // Add timeout protection
        const connectionTimeout = setTimeout(() => {
            console.error('[CasperID] Connection timeout after 30 seconds');
            showConnectionError('Connection timed out. Please try again or check if Casper Signer is running.');
            if (loading) loading.classList.add('hidden');
            if (notConnectedView) notConnectedView.classList.remove('hidden');
        }, 30000); // 30 second timeout

        // Strategy: Use content script bridge to access Casper Signer
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        let targetTab = tabs[0];
        let createdTab = false;

        // If no tab or special page, create a real one
        if (!targetTab || targetTab.url.startsWith('chrome://') || targetTab.url.startsWith('chrome-extension://')) {
            console.log('[CasperID] Creating connection bridge tab...');
            targetTab = await chrome.tabs.create({
                url: 'http://localhost:3000',
                active: false
            });
            createdTab = true;
            // Wait for page to load and Casper Signer to inject
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('[CasperID] Injecting wallet connection script...');

        // Update loading text
        if (loading) {
            const loadingText = loading.querySelector('p') || loading;
            loadingText.textContent = 'Requesting wallet connection...';
        }

        // Inject wallet connection script
        const results = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            world: 'MAIN',
            func: async () => {
                try {
                    if (!window.CasperWalletProvider) {
                        return { error: 'Casper Signer not installed' };
                    }

                    const provider = window.CasperWalletProvider();
                    await provider.requestConnection();
                    const activeKey = await provider.getActivePublicKey();

                    return { success: true, wallet: activeKey };
                } catch (err) {
                    return { error: err.message || 'Connection failed' };
                }
            }
        });

        const result = results[0].result;
        console.log('[CasperID] Script result:', result);

        if (result.error) {
            throw new Error(result.error);
        }

        const walletAddress = result.wallet;
        console.log('[CasperID] Wallet connected:', walletAddress);

        // Fetch identity data from backend
        console.log('[CasperID] Fetching identity data...');

        // Update loading text
        if (loading) {
            const loadingText = loading.querySelector('p') || loading;
            loadingText.textContent = 'Fetching your identity data...';
        }
        const response = await fetch(`http://localhost:3001/api/identity-status?wallet=${walletAddress}`);

        if (!response.ok) {
            throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('[CasperID] Identity data received:', data);

        // Map to extension format
        const userData = {
            wallet: walletAddress,
            humanId: data.human_id || 'unknown-id',
            cnsName: data.profile?.cns_name || (data.human_id ? `${data.human_id.replace(/-/g, '')}.cid` : 'user.cid'),
            verified: data.verified || false,
            tier: data.tier || 'Unverified',
            name: data.profile?.name || `${data.profile?.first_name || ''} ${data.profile?.last_name || ''}`.trim(),
            first_name: data.profile?.first_name,
            last_name: data.profile?.last_name,
            email: data.profile?.email,
            phone: data.profile?.phone_number,
            address: data.profile?.home_address,
            location: data.profile?.location
        };

        // Store in chrome.storage
        await chrome.storage.local.set({
            connected: true,
            userData: userData
        });

        console.log('[CasperID] Data stored successfully');

        // Update loading text
        if (loading) {
            const loadingText = loading.querySelector('p') || loading;
            loadingText.textContent = 'Connection successful!';
        }

        // Clear timeout
        clearTimeout(connectionTimeout);

        // Update state
        isConnected = true;

        // Close the temporary tab if we created one
        if (createdTab) {
            chrome.tabs.remove(targetTab.id);
        }

        // Hide loading and update UI
        if (loading) loading.classList.add('hidden');
        renderCurrentState();

        // Fetch and update UI elements
        if (userData.wallet) {
            fetchRealData(userData.wallet);
        }

        console.log('[CasperID] Connection complete!');

    } catch (error) {
        console.error('[CasperID] Connection error:', error);

        // Show specific error messages instead of redirecting
        if (error.message.includes('Signer not installed')) {
            showConnectionError('⚠️ Casper Signer extension not detected.\n\nPlease install Casper Signer first, then try again.', true);
        } else if (error.message.includes('timeout')) {
            showConnectionError('Connection timed out. Please try again.');
        } else if (error.message.includes('Backend')) {
            showConnectionError('Backend service unavailable. Please check if the server is running and try again.');
        } else if (error.message.includes('Connection failed')) {
            showConnectionError('Failed to connect to Casper wallet. Please make sure Casper Signer is unlocked and try again.');
        } else {
            showConnectionError(`Connection failed: ${error.message}`);
        }

        // Reset UI
        if (loading) loading.classList.add('hidden');
        if (notConnectedView) notConnectedView.classList.remove('hidden');
    }
}

// Handle sharing identity with current website
async function handleShareIdentity() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = new URL(tab.url).hostname;

    // Show permission request
    const dataToShare = await showDataSelector(domain);

    if (dataToShare.length > 0) {
        // Get real user data from storage
        const result = await chrome.storage.local.get(['userData', 'permissions']);
        const userData = result.userData || {};
        const permissions = result.permissions || [];

        // Add new permission
        const newPermission = {
            domain,
            granted: dataToShare,
            date: new Date().toISOString().split('T')[0]
        };

        // Update permissions array
        const updatedPermissions = permissions.filter(p => p.domain !== domain); // Remove existing
        updatedPermissions.push(newPermission); // Add new

        // Store updated permissions
        await chrome.storage.local.set({ permissions: updatedPermissions });

        // Send data to content script using real user data
        chrome.tabs.sendMessage(tab.id, {
            type: 'CASPERID_AUTH_SUCCESS',
            data: {
                wallet: userData.wallet,
                cnsName: userData.cnsName,
                verified: userData.verified,
                tier: userData.tier,
                requestedData: dataToShare
            }
        });

        alert(`Successfully shared your identity with ${domain}`);
    }
}

// Show data selector (simplified for demo)
async function showDataSelector(domain = 'website') {
    return new Promise((resolve) => {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'data-selector-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const dataOptions = [
            { id: 'wallet', label: 'Wallet Address', required: true },
            { id: 'verified', label: 'Verification Status', required: true },
            { id: 'tier', label: 'Verification Tier', required: false },
            { id: 'cnsName', label: 'Casper Name', required: false },
            { id: 'name', label: 'Full Name', required: false },
            { id: 'email', label: 'Email Address', required: false }
        ];

        // Add styles for hover effects
        const style = document.createElement('style');
        style.textContent = `
            .option-label {
                background: #ffffff;
                border: 1px solid #e5e7eb;
            }
            .option-label:hover {
                background: #f9fafb;
            }
            .option-label.required {
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                cursor: not-allowed;
            }
            .option-label.required:hover {
                background: #f3f4f6;
            }
            .cancel-btn:hover {
                background: #f9fafb !important;
            }
            .allow-btn:hover {
                opacity: 0.9;
            }
        `;
        content.appendChild(style);

        content.innerHTML += `
            <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 20px; font-weight: 700;">
                Share Your Data
            </h3>
            <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
                Select what information to share with <strong>${domain}</strong>
            </p>
            <div id="data-options" style="margin-bottom: 20px;">
                ${dataOptions.map(option => `
                    <label class="option-label ${option.required ? 'required' : ''}" style="
                        display: flex;
                        align-items: center;
                        padding: 12px;
                        margin-bottom: 8px;
                        border-radius: 8px;
                        cursor: ${option.required ? 'not-allowed' : 'pointer'};
                        transition: all 0.2s;
                    ">
                        <input 
                            type="checkbox" 
                            id="${option.id}" 
                            value="${option.id}"
                            ${option.required ? 'checked disabled' : ''}
                            style="
                                width: 18px;
                                height: 18px;
                                margin-right: 12px;
                                cursor: ${option.required ? 'not-allowed' : 'pointer'};
                            "
                        >
                        <div style="flex: 1;">
                            <div style="color: #1f2937; font-weight: 600; font-size: 14px;">
                                ${option.label}
                            </div>
                            ${option.required ? `
                                <div style="color: #9ca3af; font-size: 11px; margin-top: 2px;">
                                    Required
                                </div>
                            ` : ''}
                        </div>
                    </label>
                `).join('')}
            </div>
            <div style="display: flex; gap: 12px;">
                <button id="cancel-btn" class="cancel-btn" style="
                    flex: 1;
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #374151;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Cancel
                </button>
                <button id="allow-btn" class="allow-btn" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Allow Access
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Handle cancel
        document.getElementById('cancel-btn').addEventListener('click', () => {
            modal.remove();
            resolve([]);
        });

        // Handle allow
        document.getElementById('allow-btn').addEventListener('click', () => {
            const selected = [];
            dataOptions.forEach(option => {
                const checkbox = document.getElementById(option.id);
                if (checkbox && checkbox.checked) {
                    selected.push(option.id);
                }
            });
            modal.remove();
            resolve(selected);
        });
    });
}

// Handle disconnect
function handleDisconnect() {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
        isConnected = false;
        chrome.storage.local.set({ connected: false, userData: null });
        renderCurrentState();
    }
}

// Render permissions list
async function renderPermissions() {
    const permissionsList = document.getElementById('permissions-list');

    if (!isConnected) {
        permissionsList.innerHTML = '<p style="opacity: 0.7; font-size: 13px;">Connect your wallet to view permissions</p>';
        return;
    }

    // Get real permissions from storage
    const result = await chrome.storage.local.get(['permissions']);
    const permissions = result.permissions || [];

    console.log('[CasperID] Current permissions:', permissions);

    if (permissions.length === 0) {
        permissionsList.innerHTML = '<p style="opacity: 0.7; font-size: 13px;">No permissions granted yet</p>';
        return;
    }

    permissionsList.innerHTML = permissions.map(perm => `
        <div class="permission-item">
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px;">${perm.domain}</div>
                <div style="font-size: 11px; opacity: 0.7;">
                    ${perm.granted.join(', ')} - ${perm.date}
                </div>
            </div>
            <button class="revoke-btn" data-domain="${perm.domain}" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                Revoke
            </button>
        </div>
    `).join('');

    // Add revoke handlers
    document.querySelectorAll('.revoke-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const domain = btn.getAttribute('data-domain');
            if (confirm(`Revoke access for ${domain}?\n\nThis will log you out of the website and remove all stored permissions.`)) {
                await revokePermissionForDomain(domain);
                renderPermissions();
            }
        });
    });
}

// Revoke permission for a specific domain
async function revokePermissionForDomain(domain) {
    try {
        // Remove from local storage
        const result = await chrome.storage.local.get(['permissions']);
        const permissions = result.permissions || [];
        const updatedPermissions = permissions.filter(p => p.domain !== domain);
        await chrome.storage.local.set({ permissions: updatedPermissions });

        // Find all tabs with this domain and notify them of revocation
        const tabs = await chrome.tabs.query({});
        const matchingTabs = tabs.filter(tab => {
            try {
                const url = new URL(tab.url);
                return url.hostname === domain;
            } catch (e) {
                return false;
            }
        });

        // Send revocation message to all matching tabs
        for (const tab of matchingTabs) {
            try {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'CASPERID_ACCESS_REVOKED',
                    domain: domain
                });
            } catch (error) {
                console.warn(`Failed to notify tab ${tab.id} of revocation:`, error);
            }
        }

        console.log(`[CasperID] Revoked access for ${domain}`);

        // Show success feedback
        const permissionsList = document.getElementById('permissions-list');
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #10b981;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 10px;
        `;
        successMsg.textContent = `Access revoked for ${domain}`;

        permissionsList.insertBefore(successMsg, permissionsList.firstChild);

        // Remove success message after 3 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 3000);

    } catch (error) {
        console.error('[CasperID] Failed to revoke permission:', error);
        alert(`Failed to revoke access for ${domain}. Please try again.`);
    }
}
