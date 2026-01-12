// Notifications permission (referenced in background.js but missing)
chrome.runtime.onInstalled.addListener(() => {
    // Request notification permission
    if (chrome.notifications) {
        chrome.notifications.getPermissionLevel((level) => {
            if (level !== 'granted') {
                console.log('[CasperID] Notification permission not granted');
            }
        });
    }
});