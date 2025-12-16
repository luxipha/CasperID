// Content script - Injects "Sign in with CasperID" button into websites

// Only run on non-extension pages
if (!window.location.href.startsWith('chrome-extension://')) {
    injectLoginButton();
}

function injectLoginButton() {
    // Look for common login button patterns
    const loginSelectors = [
        'button[aria-label*="login" i]',
        'button[aria-label*="sign in" i]',
        'a[href*="login"]',
        'a[href*="signin"]',
        '.login-button',
        '#login-btn'
    ];

    // Try to find a login area
    let loginArea = document.querySelector('nav, header, .header, .navbar');

    if (!loginArea) {
        // If no login area found, inject at top right of page
        loginArea = document.createElement('div');
        loginArea.style.position = 'fixed';
        loginArea.style.top = '20px';
        loginArea.style.right = '20px';
        loginArea.style.zIndex = '999999';
        document.body.appendChild(loginArea);
    }

    // Create CasperID login button
    const casperIdBtn = document.createElement('button');
    casperIdBtn.id = 'casperid-login-btn';
    casperIdBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
            <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
            <path d="M10 14l-3-3 1.41-1.41L10 11.17l5.59-5.58L17 7l-7 7z" fill="white"/>
        </svg>
        Sign in with CasperID
    `;

    casperIdBtn.style.cssText = `
        display: inline-flex;
        align-items: center;
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 8px;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    `;

    casperIdBtn.addEventListener('mouseenter', () => {
        casperIdBtn.style.transform = 'translateY(-2px)';
        casperIdBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });

    casperIdBtn.addEventListener('mouseleave', () => {
        casperIdBtn.style.transform = 'translateY(0)';
        casperIdBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });

    casperIdBtn.addEventListener('click', handleCasperIDLogin);

    // Insert button
    if (loginArea.tagName === 'NAV' || loginArea.tagName === 'HEADER') {
        loginArea.appendChild(casperIdBtn);
    } else {
        loginArea.insertBefore(casperIdBtn, loginArea.firstChild);
    }

    console.log('[CasperID] Login button injected');
}

function handleCasperIDLogin() {
    console.log('[CasperID] Login button clicked');

    // Send message to background script to open extension popup
    chrome.runtime.sendMessage({
        type: 'CASPERID_LOGIN_REQUEST',
        domain: window.location.hostname
    }, (response) => {
        if (response && response.success) {
            handleLoginSuccess(response.data);
        }
    });

    // Show loading state
    showLoadingModal();
}

function showLoadingModal() {
    const modal = document.createElement('div');
    modal.id = 'casperid-loading-modal';
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
        z-index: 1000000;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            max-width: 400px;
        ">
            <div style="
                width: 60px;
                height: 60px;
                border: 4px solid #f3f4f6;
                border-top-color: #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h3 style="margin: 0 0 10px; color: #1f2937;">Connecting to CasperID</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Please approve the connection in the extension popup
            </p>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    document.body.appendChild(modal);
}

function hideLoadingModal() {
    const modal = document.getElementById('casperid-loading-modal');
    if (modal) {
        modal.remove();
    }
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
});

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
    };

    function matchesField(input, key) {
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

    function detectForms() {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([data-casper-id])');
        inputs.forEach((input) => {
            const fillable =
                matchesField(input, 'first_name') ||
                matchesField(input, 'last_name') ||
                matchesField(input, 'full_name') ||
                matchesField(input, 'email') ||
                matchesField(input, 'phone_number') ||
                matchesField(input, 'home_address') ||
                matchesField(input, 'street') ||
                matchesField(input, 'address_line2') ||
                matchesField(input, 'postal_code') ||
                matchesField(input, 'state') ||
                matchesField(input, 'city') ||
                matchesField(input, 'country') ||
                matchesField(input, 'date_of_birth') ||
                matchesField(input, 'company_name') ||
                matchesField(input, 'job_title') ||
                matchesField(input, 'school_name') ||
                matchesField(input, 'degree') ||
                matchesField(input, 'linkedin') ||
                matchesField(input, 'website');

            if (fillable) {
                injectAutofillIcon(input);
            }
        });
    }

    function injectAutofillIcon(inputElement) {
        inputElement.dataset.casperId = "true"; // Mark as processed

        const container = document.createElement('div');
        container.className = 'casperid-autofill-icon';
        container.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0.5;
            transition: opacity 0.2s;
        `;

        container.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                 <circle cx="12" cy="12" r="10" fill="#667eea"/>
                 <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        container.title = "Fill with CasperID";

        container.onmouseenter = () => { container.style.opacity = '1'; };
        container.onmouseleave = () => { container.style.opacity = '0.5'; };

        container.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerAutofill();
        };

        const parent = inputElement.parentElement;
        if (parent) {
            const computedStyle = window.getComputedStyle(parent);
            if (computedStyle.position === 'static') {
                parent.style.position = 'relative';
            }
            parent.appendChild(container);
        }
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
            default:
                return null;
        }
    }

    function fillForms(data) {
        const inputs = document.querySelectorAll('input');
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

    // Observe DOM for new inputs
    const observer = new MutationObserver(() => detectForms());
    observer.observe(document.body, { childList: true, subtree: true });
    detectForms(); // initial pass
})();

// [SYNC LOGIC] Scrape dashboard for identity status
function syncIdentityStatus() {
    const syncElement = document.getElementById('casperid-extension-sync');
    if (syncElement) {
        let data = {
            wallet: syncElement.dataset.wallet,
            cnsName: syncElement.dataset.cns,
            verified: syncElement.dataset.verified === 'true',
            tier: syncElement.dataset.tier,
            lastKycAt: syncElement.dataset.kycDate,
            lastLivenessAt: syncElement.dataset.livenessDate
        };

        const fullDataElement = document.getElementById('casperid-extension-full-data');
        if (fullDataElement && fullDataElement.dataset.json) {
            try {
                const extended = JSON.parse(fullDataElement.dataset.json);
                console.log('[CasperID Sync] Found extended profile data', extended);
                data = { ...data, ...extended };
            } catch (e) {
                console.error('[CasperID Sync] Failed to parse full data JSON', e);
            }
        }

        console.log('[CasperID Sync] Found identity data:', data);

        // Send to background to save
        chrome.runtime.sendMessage({
            type: 'SYNC_IDENTITY_DATA',
            data: data
        });
    }
}

// Check periodically if on dashboard
if (window.location.href.includes('/me') || window.location.href.includes('/dashboard')) {
    setInterval(syncIdentityStatus, 1000);
}
