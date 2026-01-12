// Only run on non-extension pages
if (!window.location.href.startsWith('chrome-extension://')) {
    initSmartWidgets();
}

/**
 * Helper to check if the extension context is still valid.
 * When an extension is reloaded/updated, the content script's context becomes "dead".
 */
function isContextValid() {
    return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
}

async function initSmartWidgets() {
    // Guard: Don't run if extension context is dead
    if (!isContextValid()) {
        console.log('[CasperID] Skipping widget init - context invalidated');
        return;
    }

    try {
        const { anchorHiddenUntil } = await chrome.storage.local.get(['anchorHiddenUntil']);
        if (anchorHiddenUntil && Date.now() < anchorHiddenUntil) {
            console.log('[CasperID] Anchor is hidden by user request');
        } else {
            injectDraggableAnchor();
        }
        initGhostIcons();
    } catch (e) {
        // Extension context was invalidated during async operation
        console.log('[CasperID] Widget init aborted - context lost');
    }
}

async function injectDraggableAnchor() {
    if (!isContextValid()) return;
    if (document.getElementById('casperid-draggable-anchor')) return;

    let anchorPos = null;
    try {
        const result = await chrome.storage.local.get(['anchorPos']);
        anchorPos = result.anchorPos;
    } catch (e) {
        // Context invalidated, abort
        return;
    }

    const anchor = document.createElement('div');
    anchor.id = 'casperid-draggable-anchor';
    anchor.style.cssText = `
        position: fixed;
        width: 52px;
        height: 52px;
        left: ${anchorPos?.x || (window.innerWidth - 72)}px;
        top: ${anchorPos?.y || (window.innerHeight - 100)}px;
        background: rgba(134, 82, 226, 0.2);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        z-index: 999999;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, background 0.2s, border-color 0.2s;
        user-select: none;
    `;

    anchor.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#8652E2"/>
            <path d="M10 14l-3-3 1.41-1.41L10 11.17l5.59-5.58L17 7l-7 7z" fill="white"/>
        </svg>
        <div id="casperid-anchor-close" style="
            position: absolute;
            top: -6px;
            right: -6px;
            width: 18px;
            height: 18px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            font-size: 10px;
            display: none;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">×</div>
    `;

    anchor.onmouseenter = () => {
        anchor.style.background = 'rgba(134, 82, 226, 0.3)';
        anchor.style.borderColor = 'rgba(134, 82, 226, 0.4)';
        document.getElementById('casperid-anchor-close').style.display = 'flex';
    };

    anchor.onmouseleave = () => {
        anchor.style.background = 'rgba(134, 82, 226, 0.2)';
        anchor.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        document.getElementById('casperid-anchor-close').style.display = 'none';
    };

    // Drag Logic
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    anchor.onmousedown = (e) => {
        if (e.target.id === 'casperid-anchor-close') return;
        isDragging = true;
        anchor.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = anchor.offsetLeft;
        initialTop = anchor.offsetTop;
        e.preventDefault();
    };

    document.onmousemove = (e) => {
        if (!isContextValid()) return; // Stop if extension context died
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialLeft + dx;
        let newY = initialTop + dy;

        // Containment
        newX = Math.max(10, Math.min(newX, window.innerWidth - 62));
        newY = Math.max(10, Math.min(newY, window.innerHeight - 62));

        anchor.style.left = newX + 'px';
        anchor.style.top = newY + 'px';
    };

    document.onmouseup = async () => {
        if (!isContextValid()) return; // Stop if extension context died
        if (!isDragging) return;
        isDragging = false;
        anchor.style.cursor = 'grab';

        // Snap to edges
        const currentLeft = anchor.offsetLeft;
        const targetLeft = currentLeft < window.innerWidth / 2 ? 20 : window.innerWidth - 72;

        anchor.style.transition = 'left 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), top 0.2s';
        anchor.style.left = targetLeft + 'px';

        // Save position
        try {
            await chrome.storage.local.set({
                anchorPos: { x: targetLeft, y: anchor.offsetTop }
            });
        } catch (e) {
            // Context invalidated
        }

        setTimeout(() => {
            if (isContextValid()) anchor.style.transition = 'transform 0.2s, background 0.2s, border-color 0.2s';
        }, 300);
    };

    anchor.onclick = (e) => {
        // Only trigger if not dragging
        if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5) {
            if (e.target.id === 'casperid-anchor-close') {
                handleDismissAnchor();
            } else {
                handleCasperIDLogin();
            }
        }
    };

    document.body.appendChild(anchor);
    console.log('[CasperID] Draggable anchor injected');
}

async function handleDismissAnchor() {
    if (!isContextValid()) return;

    const anchor = document.getElementById('casperid-draggable-anchor');
    if (anchor) {
        anchor.style.transform = 'scale(0)';
        anchor.style.opacity = '0';
        setTimeout(() => anchor.remove(), 200);

        // Hide for 24 hours
        const hideUntil = Date.now() + (24 * 60 * 60 * 1000);
        try {
            await chrome.storage.local.set({ anchorHiddenUntil: hideUntil });
        } catch (e) {
            // Context invalidated
        }
    }
}

/**
 * Handle CasperID login/autofill when the draggable anchor is clicked.
 * - If already connected: triggers autofill
 * - If not connected: shows popup for login
 */
function handleCasperIDLogin() {
    if (!isContextValid()) return;

    console.log('[CasperID] Anchor clicked - checking connection status');

    chrome.storage.local.get(['connected', 'userData'], (result) => {
        if (result.connected && result.userData) {
            // Already connected - trigger autofill
            console.log('[CasperID] User connected, triggering autofill');
            triggerAutofill();
        } else {
            // Not connected - show loading and redirect to dashboard for login
            console.log('[CasperID] User not connected, opening popup');
            showLoadingModal();

            // Open the extension popup or redirect to CasperID dashboard
            chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }, (response) => {
                // Popup API doesn't support programmatic opening, so we can:
                // 1. Show a modal prompting user to click extension icon
                // 2. Or redirect to dashboard
                hideLoadingModal();

                // Show a tooltip near the anchor
                const anchor = document.getElementById('casperid-draggable-anchor');
                if (anchor) {
                    showTooltip(anchor, 'Click the CasperID extension icon to connect!');
                }
            });
        }
    });
}

function showLoadingModal() {
    const existing = document.getElementById('casperid-loading-modal');
    if (existing) return;

    const modal = document.createElement('div');
    modal.id = 'casperid-loading-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 24px 32px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        z-index: 1000001;
        text-align: center;
    `;
    modal.innerHTML = `
        <div style="font-size: 14px; color: #1A1A2E; font-weight: 600;">Connecting to CasperID...</div>
    `;
    document.body.appendChild(modal);
}

function hideLoadingModal() {
    const modal = document.getElementById('casperid-loading-modal');
    if (modal) modal.remove();
}

function showTooltip(anchor, message) {
    const tooltip = document.createElement('div');
    tooltip.id = 'casperid-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        top: ${anchor.offsetTop - 50}px;
        left: ${anchor.offsetLeft}px;
        background: #1A1A2E;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    setTimeout(() => tooltip.remove(), 3000);
}

function handleLoginSuccess(userData) {
    hideLoadingModal();

    console.log('[CasperID] Login successful', userData);

    // Dispatch custom event that websites can listen to
    window.dispatchEvent(new CustomEvent('casperid-login', {
        detail: userData
    }));

    // Show success message
    showSuccessMessage(userData);

    // Mock: Set a cookie or localStorage to simulate being logged in
    localStorage.setItem('casperid_user', JSON.stringify(userData));
    localStorage.setItem('casperid_wallet', userData.wallet);
}

function showSuccessMessage(userData) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        z-index: 1000000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;

    message.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
            <div style="font-weight: 600;">Signed in with CasperID</div>
            <div style="font-size: 12px; opacity: 0.9;">Welcome, ${userData.cnsName || userData.wallet}</div>
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 4000);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CASPERID_AUTH_SUCCESS') {
        handleLoginSuccess(message.data);
    }

    if (message.type === 'CASPERID_ACCESS_REVOKED') {
        handleAccessRevoked(message.domain);
    }

    if (message.type === 'GET_JOB_DETAILS') {
        sendResponse(scrapeJobDetails());
    }

    if (message.type === 'FILL_COVER_LETTER') {
        fillForms({ cover_letter: message.content });
    }
});

function scrapeJobDetails() {
    console.log('[CasperID] Scraping job details...');

    // Look for common job description containers
    const selectors = [
        '.job-description',
        '#job-details',
        '.description__text',
        '[data-job-description]',
        'section.description',
        '.jobs-description__content' // LinkedIn
    ];

    let description = '';
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
            description = el.innerText;
            break;
        }
    }

    // Fallback: search for long text blocks if nothing specific found
    if (!description || description.length < 200) {
        const elements = Array.from(document.querySelectorAll('p, li, div'))
            .filter(el => {
                const text = el.innerText || '';
                return text.length > 200 && text.length < 5000;
            });

        // Pick the longest one as the primary description
        const longest = elements.sort((a, b) => b.innerText.length - a.innerText.length)[0];
        if (longest) description = longest.innerText;
    }

    const title = document.querySelector('h1')?.innerText || document.title;

    return {
        title: title,
        description: description.slice(0, 10000), // Cap for LLM
        url: window.location.href
    };
}

function handleAccessRevoked(domain) {
    console.log(`[CasperID] Access revoked for ${domain}`);

    // Clear any stored login data
    localStorage.removeItem('casperid_user');
    localStorage.removeItem('casperid_wallet');

    // Dispatch logout event for websites to handle
    window.dispatchEvent(new CustomEvent('casperid-logout', {
        detail: { domain, reason: 'access_revoked' }
    }));

    // Show logout notification
    showLogoutMessage(domain);
}

function showLogoutMessage(domain) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        z-index: 1000000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
        max-width: 320px;
    `;

    message.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/>
            <path d="M15 9l-6 6m0-6l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <div>
            <div style="font-weight: 600;">CasperID Access Revoked</div>
            <div style="font-size: 12px; opacity: 0.9;">You have been logged out from ${domain}</div>
        </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// [NEW] Form Detection & Autofill
(function () {
    console.log('[CasperID Autofill] Initializing...');

    const fieldMap = {
        first_name: ['first', 'given'],
        last_name: ['last', 'family', 'surname'],
        full_name: ['name', 'fullname', 'full name'],
        email: ['email'],
        phone_number: ['phone', 'mobile', 'tel'],
        home_address: ['address', 'street'],
        street: ['street', 'line1', 'line 1'],
        address_line2: ['line2', 'line 2', 'apt', 'suite', 'unit'],
        postal_code: ['zip', 'postal', 'postcode'],
        state: ['state', 'province', 'region'],
        city: ['city', 'town'],
        country: ['country'],
        date_of_birth: ['dob', 'birth', 'birthday', 'bday', 'dateofbirth'],
        company_name: ['company', 'employer', 'org'],
        job_title: ['title', 'role', 'position'],
        school_name: ['school', 'university', 'college', 'institution'],
        degree: ['degree', 'major'],
        linkedin: ['linkedin'],
        website: ['website', 'portfolio', 'url'],
        cover_letter: ['cover letter', 'coverletter', 'personal statement', 'message to hiring manager', 'cover_letter'],
    };

    function matchesField(input, key) {
        const tagName = input.tagName.toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const autocomplete = (input.autocomplete || '').toLowerCase();
        const type = (input.type || '').toLowerCase();
        const labelText = getLabelText(input);
        const tokens = fieldMap[key] || [];
        return tokens.some((t) =>
            name.includes(t) ||
            id.includes(t) ||
            placeholder.includes(t) ||
            autocomplete.includes(t) ||
            (labelText && labelText.includes(t)) ||
            (type === t)
        );
    }

    function getLabelText(input) {
        const id = input.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label && label.textContent) return label.textContent.toLowerCase();
        }
        const parentLabel = input.closest('label');
        if (parentLabel && parentLabel.textContent) return parentLabel.textContent.toLowerCase();
        return '';
    }

    function initGhostIcons() {
        // Global listener for focus events to inject icons dynamically
        document.addEventListener('focusin', (e) => {
            if (!isContextValid()) return; // Stop if context is dead
            const el = e.target;
            if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && !el.dataset.casperId) {
                if (isFieldRelevant(el)) {
                    injectGhostIcon(el);
                }
            }
        });
    }

    function isFieldRelevant(input) {
        const relevantKeys = ['first_name', 'last_name', 'full_name', 'email', 'phone_number', 'job_title', 'company_name', 'cover_letter'];
        return relevantKeys.some(key => matchesField(input, key));
    }

    function injectGhostIcon(inputElement) {
        inputElement.dataset.casperId = "true"; // Mark as processed

        const icon = document.createElement('div');
        icon.className = 'casperid-ghost-icon';
        icon.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s, transform 0.2s;
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: scale(0.8);
        `;

        icon.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                 <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="#8652E2"/>
                 <path d="M10 14l-3-3 1.41-1.41L10 11.17l5.59-5.58L17 7l-7 7z" fill="white"/>
            </svg>
        `;

        icon.title = "Autofill with CasperID";

        // Positioning logic
        const updatePosition = () => {
            const rect = inputElement.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            icon.style.left = (rect.right + scrollX - 28) + 'px';
            icon.style.top = (rect.top + scrollY + (rect.height / 2) - 10) + 'px';
        };

        inputElement.addEventListener('focus', () => {
            updatePosition();
            icon.style.opacity = '0.6';
            icon.style.transform = 'scale(1)';
        });

        inputElement.addEventListener('blur', () => {
            setTimeout(() => {
                icon.style.opacity = '0';
                icon.style.transform = 'scale(0.8)';
            }, 200);
        });

        icon.onmouseenter = () => { icon.style.opacity = '1'; icon.style.transform = 'scale(1.1)'; };
        icon.onmouseleave = () => { icon.style.opacity = '0.6'; icon.style.transform = 'scale(1)'; };

        icon.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerAutofill();
        };

        // Inject into body to avoid overflow issues with parents
        document.body.appendChild(icon);
        updatePosition();
    }

    function triggerAutofill() {
        chrome.runtime.sendMessage({ type: 'GET_USER_PROFILE' }, (response) => {
            if (response && response.userData) {
                fillForms(response.userData);
            } else {
                console.warn('[CasperID Autofill] No user data available. Connect extension first.');
            }
        });
    }

    function pickValue(key, data) {
        if (!data) return null;
        switch (key) {
            case 'first_name':
            case 'last_name':
            case 'email':
            case 'phone_number':
            case 'home_address':
            case 'city':
            case 'country':
            case 'date_of_birth':
                return data.profile?.[key] ?? data[key] ?? null;
            case 'full_name': {
                const first = data.profile?.first_name ?? data.first_name ?? '';
                const last = data.profile?.last_name ?? data.last_name ?? '';
                const full = [first, last].filter(Boolean).join(' ').trim();
                return full || null;
            }
            case 'street':
            case 'address_line2':
            case 'postal_code':
            case 'state': {
                const addr = data.profile?.home_address || data.home_address;
                if (addr && typeof addr === 'object') {
                    if (key === 'street') return addr.street || addr.line1 || null;
                    if (key === 'address_line2') return addr.line2 || addr.apartment || null;
                    if (key === 'postal_code') return addr.postal_code || addr.zip || null;
                    if (key === 'state') return addr.state || addr.province || null;
                }
                if (key === 'street') return typeof addr === 'string' ? addr : null;
                return null;
            }
            case 'company_name':
            case 'job_title': {
                const exp = (data.profile?.experiences || data.experiences || [])[0];
                if (!exp) return null;
                return key === 'company_name' ? exp.company_name : exp.job_title;
            }
            case 'school_name':
            case 'degree': {
                const edu = (data.profile?.education || data.education || [])[0];
                if (!edu) return null;
                return key === 'school_name' ? edu.school_name : edu.degree;
            }
            case 'linkedin':
                return data.profile?.socials?.linkedin || data.socials?.linkedin || null;
            case 'website':
                return data.profile?.website || data.website || null;
            case 'cover_letter':
                return data.cover_letter || null;
            default:
                return null;
        }
    }

    function fillForms(data) {
        const inputs = document.querySelectorAll('input, textarea');
        let filledCount = 0;

        inputs.forEach((input) => {
            const name = (input.name || '').toLowerCase();
            const id = (input.id || '').toLowerCase();
            const autocomplete = (input.autocomplete || '').toLowerCase();
            const type = (input.type || '').toLowerCase();

            const candidateKeys = Object.keys(fieldMap).filter((k) =>
                matchesField(input, k)
            );

            let valueToFill = null;
            for (const key of candidateKeys) {
                const val = pickValue(key, data);
                if (val) {
                    if (key === 'date_of_birth' && type === 'date') {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                            valueToFill = d.toISOString().split('T')[0];
                        } else {
                            valueToFill = val;
                        }
                    } else {
                        valueToFill = val;
                    }
                    break;
                }
            }

            if (valueToFill) {
                input.value = valueToFill;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.style.backgroundColor = '#f0fdf4';
                input.style.transition = 'background-color 0.5s';
                setTimeout(() => (input.style.backgroundColor = ''), 800);
                filledCount++;
            }
        });

        if (filledCount > 0) {
            showSuccessMessage({ cnsName: 'Autofill Complete' });
        } else {
            console.log('[CasperID Autofill] No matching fields found for data:', data);
        }
    }

    // Initial pass (handled by initSmartWidgets calling initGhostIcons)
})();

// [SYNC LOGIC] Scrape dashboard for identity status
let lastSyncedData = null;

function syncIdentityStatus(force = false) {
    const syncElement = document.getElementById('casperid-extension-sync');

    // Fallback: Read session token directly from localStorage (content scripts have access)
    let sessionToken = null;
    try {
        sessionToken = localStorage.getItem('casperid_session_token');
    } catch (e) {
        console.warn('[CasperID Sync] Could not read localStorage:', e);
    }

    if (syncElement) {
        let data = {
            wallet: syncElement.dataset.wallet,
            humanId: syncElement.dataset.humanId,
            cnsName: syncElement.dataset.cns,
            verified: syncElement.dataset.verified === 'true',
            tier: syncElement.dataset.tier,
            lastKycAt: syncElement.dataset.kycDate,
            lastLivenessAt: syncElement.dataset.livenessDate,
            sessionToken: syncElement.dataset.token || sessionToken
        };

        const fullDataElement = document.getElementById('casperid-extension-full-data');
        if (fullDataElement && fullDataElement.dataset.json) {
            try {
                const extended = JSON.parse(fullDataElement.dataset.json);
                data = { ...data, ...extended };
            } catch (e) {
                console.error('[CasperID Sync] Failed to parse full data JSON', e);
            }
        }

        // Sync if forced or data has changed
        const dataString = JSON.stringify(data);
        if (force || dataString !== lastSyncedData) {
            console.log(`[CasperID Sync] Syncing identity data (force=${force}):`, data);
            lastSyncedData = dataString;

            // Send to background to save
            try {
                chrome.runtime.sendMessage({
                    type: 'SYNC_IDENTITY_DATA',
                    data: data
                });
            } catch (e) {
                // Silently fail if context invalidated
            }
        }
    } else if (sessionToken) {
        // No sync element but we have a token - still sync what we can
        console.log('[CasperID Sync] No sync element, but found session token in localStorage');
        const data = {
            sessionToken: sessionToken,
            wallet: null,
            verified: false,
            tier: 'layer_0'
        };
        const dataString = JSON.stringify(data);
        if (force || dataString !== lastSyncedData) {
            console.log(`[CasperID Sync] Syncing minimal token-only data (force=${force}):`, data);
            lastSyncedData = dataString;
            try {
                chrome.runtime.sendMessage({
                    type: 'SYNC_IDENTITY_DATA',
                    data: data
                });
            } catch (e) {
                // Silently fail
            }
        }
    } else {
        console.log('[CasperID Sync] No sync element and no session token found');
    }
}

// Run sync on CasperID dashboard (localhost:3000)
// Poll every 3 seconds to catch login even after SPA navigation
const isCasperIdHost = window.location.hostname === 'localhost' && window.location.port === '3000';

if (isCasperIdHost) {
    console.log('[CasperID Sync] CasperID dashboard detected, starting sync...');
    // Initial sync
    syncIdentityStatus();
    // Poll every 3 seconds to catch new logins
    const syncInterval = setInterval(() => {
        if (!isContextValid()) {
            clearInterval(syncInterval);
            return;
        }
        syncIdentityStatus();
    }, 3000);
}

// Listen for sync requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TRIGGER_SYNC') {
        console.log('[CasperID Sync] Popup requested sync, re-reading localStorage (forced)...');
        syncIdentityStatus(true); // Force sync
        // Return success after a brief delay to let the sync complete
        setTimeout(() => {
            sendResponse({ success: true });
        }, 800);
        return true; // Keep channel open for async response
    }
});

// --- JOB ASSISTANT LOGIC ---

function initJobAssistant() {
    console.log('[CasperID Job] Initializing Job Assistant scanner...');

    // Initial check
    checkAndScrapeJob();

    // LinkedIn is an SPA, so we need to watch for URL changes or DOM mutations
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (!isContextValid()) {
            observer.disconnect();
            return;
        }
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            console.log('[CasperID Job] URL changed, re-checking for job details...');
            setTimeout(() => {
                if (isContextValid()) checkAndScrapeJob();
            }, 2000); // Wait for content to load
        }
    });

    observer.observe(document.body, { subtree: true, childList: true });

    // Also periodic check as a fallback
    const jobInterval = setInterval(() => {
        if (!isContextValid()) {
            clearInterval(jobInterval);
            return;
        }
        checkAndScrapeJob();
    }, 5000);
}

function checkAndScrapeJob() {
    if (!isContextValid()) return;

    const url = window.location.href;

    // LinkedIn Job Page Detection
    if (url.includes('linkedin.com/jobs/view/') || url.includes('linkedin.com/jobs/search/')) {
        scrapeLinkedInJob();
        return;
    }

    // Indeed Job Page Detection
    if (url.includes('indeed.com/viewjob') || url.includes('indeed.com/jobs')) {
        scrapeIndeedJob();
        return;
    }

    // If we're on a supported platform but NOT on a job page, clear the job data
    if (url.includes('linkedin.com') || url.includes('indeed.com')) {
        // Not on a job detail page, so clear old job data
        clearCurrentJob();
    }
}

function clearCurrentJob() {
    try {
        chrome.storage.local.get('currentJob', (result) => {
            if (result.currentJob) {
                console.log('[CasperID Job] Clearing stale job data (navigated away from job page)');
                chrome.storage.local.remove('currentJob');
            }
        });
    } catch (e) {
        // Context invalidated
    }
}

function scrapeIndeedJob() {
    try {
        // Indeed job page selectors
        const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title, h1[class*="JobInfoHeader"], .jcs-JobTitle');
        const companyEl = document.querySelector('[data-company-name], .css-1h7lukg, .icl-u-lg-mr--sm, .companyName');
        const descriptionEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText, .job-description');

        if (!titleEl || !companyEl) {
            console.log('[CasperID Job] Indeed: Job title/company not found on page yet');
            return;
        }

        const jobData = {
            platform: 'Indeed',
            url: window.location.href,
            title: titleEl.innerText.trim(),
            company: companyEl.innerText.trim(),
            description: descriptionEl ? descriptionEl.innerText.trim() : '',
            timestamp: Date.now()
        };

        // Avoid spamming if data is identical
        const jobDataKey = `last_scraped_job_${jobData.title}_${jobData.company}`;
        if (sessionStorage.getItem(jobDataKey)) return;

        console.log('[CasperID Job] Scraped Indeed job:', jobData.title, 'at', jobData.company);
        sessionStorage.setItem(jobDataKey, 'true');

        // Send to background to store
        try {
            chrome.runtime.sendMessage({
                type: 'SYNC_JOB_DATA',
                data: jobData
            });
        } catch (e) {
            // Silently fail
        }
    } catch (e) {
        console.error('[CasperID Job] Indeed scraping error:', e);
    }
}

function scrapeLinkedInJob() {
    try {
        // Try multiple selectors as LinkedIn often A/B tests classes
        const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .jobs-details-top-card__job-title h1');
        const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name, .jobs-details-top-card__company-url');
        const descriptionEl = document.querySelector('#job-details, .jobs-description__content, .jobs-box__html-content');

        if (!titleEl || !companyEl) {
            // console.log('[CasperID Job] Job title/company not found on page yet');
            return;
        }

        const jobData = {
            platform: 'LinkedIn',
            url: window.location.href,
            title: titleEl.innerText.trim(),
            company: companyEl.innerText.trim(),
            description: descriptionEl ? descriptionEl.innerText.trim() : '',
            timestamp: Date.now()
        };

        // Avoid spamming if data is identical
        const jobDataKey = `last_scraped_job_${jobData.title}_${jobData.company}`;
        if (sessionStorage.getItem(jobDataKey)) return;

        console.log('[CasperID Job] Scraped job details:', jobData.title, 'at', jobData.company);
        sessionStorage.setItem(jobDataKey, 'true');

        // Send to background to store
        try {
            chrome.runtime.sendMessage({
                type: 'SYNC_JOB_DATA',
                data: jobData
            });
        } catch (e) {
            // Silently fail
        }
    } catch (e) {
        console.error('[CasperID Job] Scraping error:', e);
    }
}

// Start Job Assistant if on a supported site
if (window.location.hostname.includes('linkedin.com') || window.location.hostname.includes('indeed.com')) {
    initJobAssistant();
}
