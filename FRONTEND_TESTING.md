# Frontend Testing Instructions

## ✅ Setup Complete!

**Backend**: Running on http://localhost:3001  
**Frontend**: Running on http://localhost:3000  
**Database**: MongoDB Atlas (connected)

---

## Quick Testing Guide

### 1. Landing Page ✅ WORKING
- URL: http://localhost:3000
- **What to test**:
  - Page loads without errors
  - Three navigation cards visible (User Dashboard, Admin Console, Verify Identity)
  - Gradient background + responsive design
  
**Status**: ✅ Tested and working

---

### 2. User Dashboard (`/me`)
- URL: http://localhost:3000/me
- **What to test**:
  - Click "User Dashboard" card from landing page
  - Should show wallet connection prompt
  - Try connecting Casper wallet (if you have Casper Signer installed)
  - Submit a verification request
  
**Expected Behavior**:
- Shows "Connect Casper Wallet" button
- After connection: Shows wallet address and DID
- Can click "Request Verification" to open modal
- Can select tier (Basic or Full KYC)
- Can submit request to backend

---

### 3. Admin Console (`/admin`)
- URL: http://localhost:3000/admin
- **What to test**:
  - Click "Admin Console" card from landing page
  - Enter password: `admin123`
  - Click "Login"
  - View pending requests
  - Approve or reject a request
  
**Expected Behavior**:
- Login screen with password input
- After login: Shows verification requests table
- Can filter by status (All, Pending, Approved, Rejected)
- Can click "Approve" or "Reject" on pending requests
- Success message after action

---

### 4. Public Verify Page (`/verify`)
- URL: http://localhost:3000/verify
- **What to test**:
  - Click "Verify Identity" card from landing page
  - Enter a wallet address:  `account-hash-test-1763982713`
  - Click "Check"
  - View verification results
  
**Expected Behavior**:
- Input field for wallet address
- After check: Shows verification status
- If verified: Shows tier, issuer, last KYC date, last liveness date
- If unverified: Shows "Not Verified" message
- API documentation section visible at bottom

---

## Testing Wallets

### Already Verified Wallet (from backend tests):
```
account-hash-test-1763982713
```
Use this on the `/verify` page to see a verified result.

### For New Requests:
1. Go to `/me`
2. Connect wallet (or enter test address)
3. Request verification
4. Go to `/admin` (password: `admin123`)
5. Approve the request
6. Go to `/verify` and check the status

---

## Common Issues & Solutions

### Issue: "Casper Signer not found"
**Solution**: Casper Signer is a browser extension. For testing without it:
- The app will show an alert
- You can still use the admin and verify pages
- Admin page doesn't require wallet connection

### Issue: Page shows errors
**Solution**: 
- Check that both servers are running:
  - Backend: `cd server && npm run dev`
  - Frontend: `npm run dev`
- Check `.env.local` exists with: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Issue: API calls fail
**Solution**:
- Verify backend is running on port 3001
- Check `server/.env` has MongoDB Atlas connection string
- Test backend directly: `curl http://localhost:3001/health`

---

## Manual Test Checklist

Mark each as you test:

### Landing Page
- [ ] Page loads
- [ ] Three cards visible
- [ ] Cards are clickable
- [ ] Responsive on mobile

### User Dashboard
- [ ] `/me` page loads
- [ ] Wallet connection UI shows
- [ ] Request verification modal works
- [ ] Tier selection works  
- [ ] Form submission works

### Admin Console
- [ ] `/admin` page loads
- [ ] Login form works
- [ ] Password `admin123` works
- [ ] Requests table loads
- [ ] Filter buttons work
- [ ] Approve action works
- [ ] Reject action works

### Verify Page
- [ ] `/verify` page loads
- [ ] Wallet input works
- [ ] Check button works
- [ ] Results display for verified wallet
- [ ] Results display for unverified wallet
- [ ] API docs section visible

---

## Screenshots & Videos

Landing page screenshot saved to:
```
file:///Users/abisoye/.gemini/antigravity/brain/.../casperid_landing_page_1763983840084.png
```

Browser recording:
```
file:///Users/abisoye/.gemini/antigravity/brain/.../landing_page_fixed_1763983813352.webp
```

---

## Next Steps

1. ✅ **Landing page** - Working!
2. ⏳ **Test `/me` page** - Click "User Dashboard" 
3. ⏳ **Test `/admin` page** - Click "Admin Console"
4. ⏳ **Test `/verify` page** - Click "Verify Identity"
5. ⏳ **Test full flow** - Request → Approve → Verify

---

## Quick Commands

**Start backend**:
```bash
cd server
npm run dev
```

**Start frontend** (new terminal):
```bash
npm run dev
```

**Test backend API**:
```bash
cd server
./test-api-simple.sh
```

**View logs**:
- Backend: Check terminal running `server/npm run dev`
- Frontend: Check terminal running `npm run dev`
- Browser: Open DevTools (F12) → Console tab
