# CasperID Login Test Website

This is a demo website to test the CasperID browser extension login functionality.

## Setup Instructions

### 1. Start the Test Website
```bash
# Navigate to the test website directory
cd /Users/abisoye/Projects/casperId/test-website

# Start a simple HTTP server (choose one):
# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js (if you have http-server installed)
npx http-server . -p 8080

# Option 3: PHP
php -S localhost:8080
```

### 2. Install the CasperID Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder: `/Users/abisoye/Projects/casperId/extension`
5. The CasperID Connect extension should now appear in your extensions list

### 3. Start Backend Services
Make sure your backend is running:
```bash
# In the main casperId directory
cd /Users/abisoye/Projects/casperId/server
npm start  # Should run on localhost:3001
```

### 4. Test the Login Flow
1. Visit `http://localhost:8080` in Chrome
2. Look for the "Sign in with CasperID" button injected by the extension
3. Click the button to start the login flow
4. The extension popup should open asking for permission
5. Select what data to share and click "Allow Access"
6. You should see login success with user data displayed

## Test Scenarios

### Basic Login Test
- ✅ Extension injects login button on the page
- ✅ Clicking button opens extension popup
- ✅ User can select permissions and login
- ✅ Website receives user data and shows logged-in state

### Permission Management Test
- ✅ Check extension popup → Permissions tab
- ✅ Verify the test site appears in permissions list
- ✅ Test revoking access from extension
- ✅ Verify logout behavior

### Form Autofill Test
- ✅ Look for CasperID icons next to form fields
- ✅ Click icons to autofill with verified profile data
- ✅ Test with different form field types (name, email, phone, etc.)

### Error Handling Test
- ❌ Test with backend server offline
- ❌ Test with Casper Signer not installed
- ❌ Test with wallet not connected

## Expected Behavior

### Successful Flow:
1. Page loads → Extension content script runs
2. "Sign in with CasperID" button appears
3. User clicks → Extension popup opens
4. User grants permissions → Login succeeds
5. Page displays user data → Extension tracks permission

### Error Cases:
- No Casper Signer: Shows install prompt
- Wallet not connected: Opens extension popup to connect
- Backend offline: Shows connection error
- User denies permission: Login fails gracefully

## Debug Tips

### Check Browser Console
- Look for CasperID log messages
- Verify content script injection
- Check for JavaScript errors

### Check Extension Console
- Right-click extension icon → "Inspect popup"
- Check background script logs in `chrome://extensions/`
- Verify storage data in Application tab

### Verify Network Calls
- Check Network tab for API calls to localhost:3001
- Verify correct data format in responses
- Look for CORS issues

## Common Issues

1. **Login button not appearing**: 
   - Check if extension is loaded and enabled
   - Verify content script permissions in manifest

2. **Popup not opening**:
   - Check background script errors
   - Verify message passing between content and background

3. **API calls failing**:
   - Ensure backend server is running on port 3001
   - Check CORS configuration
   - Verify API endpoint URLs

4. **Permission data not persisting**:
   - Check chrome.storage permissions
   - Verify storage.local calls are working
   - Check for storage quota limits