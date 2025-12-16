# CasperID Connect - Chrome Extension

A browser extension that enables "Sign in with CasperID" functionality across the web.

## Features

- 🔐 **One-Click Login**: Sign in to websites with your verified CasperID
- ✅ **Verified Identity**: Share your blockchain-verified identity with trusted sites
- 🎯 **Granular Permissions**: Control exactly what data you share with each website
- 📊 **Permission Dashboard**: View and manage all your granted permissions
- 🚀 **Seamless UX**: Beautiful, intuitive interface

## Installation (Development Mode)

1. **Open Chrome Extensions Management**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)

2. **Load Unpacked Extension**
   - Click "Load unpacked"
   - Select the `/extension` folder from your CasperID project

3. **Verify Installation**
   - You should see the CasperID Connect icon in your extensions bar
   - Click it to open the popup

## How to Use

### For Users

1. **Connect Your Wallet**
   - Click the extension icon
   - Click "Connect Casper Wallet"
   - (Demo: Connects automatically with mock data)

2. **Use on Websites**
   - Visit any website
   - Look for the "Sign in with CasperID" button (auto-injected)
   - Click to share your verified identity

3. **Manage Permissions**
   - Click the extension icon
   - Go to the "Permissions" tab
   - View and revoke access for any website

### For Developers

Websites can listen for CasperID login events:

```javascript
// Listen for CasperID login
window.addEventListener('casperid-login', (event) => {
    const userData = event.detail;
    console.log('User logged in:', userData);
    
    // userData contains:
    // - wallet: User's Casper wallet address
    // - cnsName: User's Casper name (if they have one)
    // - verified: Whether user is verified
    // - tier: Verification tier
});

// Or check if user is already logged in
const userData = localStorage.getItem('casperid_user');
if (userData) {
    console.log('User already signed in:', JSON.parse(userData));
}
```

## Architecture

### Files

- **manifest.json**: Extension configuration
- **popup.html**: Extension popup UI
- **popup.js**: Popup logic and state management
- **content.js**: Content script that injects login buttons
- **background.js**: Background service worker for extension-wide logic

### Mock Data (Current Implementation)

The extension currently uses mock data for demonstration:

```javascript
{
    wallet: '0155...94415',
    cnsName: 'alice.cspr',
    verified: true,
    tier: 'Tier 2 - Full KYC'
}
```

### Production Integration (TODO)

To connect to real data:

1. **Wallet Integration**: Replace mock connection with Casper Signer API
2. **Blockchain Queries**: Query actual CasperID smart contract
3. **Signature Verification**: Implement message signing for authentication

## Extension Permissions

The extension requires:

- `storage`: Store user preferences and connection state
- `activeTab`: Inject login buttons on websites
- `tabs`: Open dashboard in new tabs

## Development

### Testing Locally

1. Make changes to any extension files
2. Go to `chrome://extensions/`
3. Click the reload icon on the CasperID Connect extension
4. Test on any website

### Debugging

- **Popup**: Right-click extension icon → "Inspect popup"
- **Content Script**: Open DevTools on any website, check Console for `[CasperID]` logs
- **Background**: Go to `chrome://extensions/` → Click "Inspect views: background page"

## Roadmap

- [ ] Real Casper Signer integration
- [ ] Smart contract interaction
- [ ] Domain whitelist/blacklist
- [ ] Auto-approve for trusted sites
- [ ] Multi-wallet support
- [ ] Export/import permissions

## Security

- Never stores private keys
- All permissions are revocable
- Data is only shared with explicit user consent
- No tracking or analytics

## License

MIT
