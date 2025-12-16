# CasperID Frontend Guide

Complete Next.js frontend application for CasperID with three distinct user interfaces.

## Overview

The frontend provides three main interfaces:
1. **User Dashboard** (`/me`) - For users requesting and managing verification
2. **Admin Console** (`/admin`) - For issuers to review and approve requests
3. **Public Verify** (`/verify`) - For anyone to check verification status

## Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Casper Signer browser extension

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will run at `http://localhost:3000`.

## Configuration

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Features

### 1. User Dashboard (`/me`)

**Path**: `/me`

**Features**:
- Casper wallet connection via Casper Signer
- Display wallet address and DID (did:casper:xxx)
- Verification status display:
  - ✅ Verified: Shows tier, last KYC date, last liveness date, issuer
  - ⚠️ Not Verified: Shows "Request Verification" button
- Request verification modal:
  - Choose tier: Basic or Full KYC
  - Enter email (optional)
  - Submit to backend API

**Tech Stack**:
- CasperProvider context for wallet state management
- API client for backend communication
- Gradient UI with glassmorphism effects

### 2. Admin Console (`/admin`)

**Path**: `/admin`

**Features**:
- Password-based authentication
- Filter requests by status (all, pending, approved, rejected)
- Verification requests table showing:
  - Wallet address
  - Tier
  - Email (if provided)
  - Created date
  - Action buttons (Approve/Reject for pending)
- Approve workflow:
  - Issues credential via backend
  - Writes to Casper blockchain
  - Updates request status
- Reject workflow:
  - Marks request as rejected

**Authentication**:
- Uses admin password from backend `.env`
- Sends password in `Authorization: Bearer <password>` header

### 3. Public Verify Page (`/verify`)

**Path**: `/verify`

**Features**:
- Wallet address input
- Check button to query verification status
- Results display:
  - ✅ Verified: Shows all details (tier, issuer, KYC/liveness dates)
  - ⚠️ Not Verified: Shows unverified message
- API documentation section with examples
- Clean, minimal UI for quick lookups

## Components

### Wallet Integration

**File**: `/lib/casper-context.tsx`

Provides Casper wallet functionality:
```typescript
const { isConnected, account, publicKey, connect, disconnect } = useCasper();
```

**Usage**:
```tsx
<CasperProvider>
  <YourApp />
</CasperProvider>
```

### API Client

**File**: `/lib/api-client.ts`

TypeScript client for backend API:
```typescript
// Request verification
await apiClient.requestVerification({ wallet, tier, email });

// Get status
const status = await apiClient.getIdentityStatus(wallet);

// Admin: Issue credential
await apiClient.issueCredential(adminPassword, requestId, approve);
```

## UI/UX Design

**Design System**:
- **Colors**: Purple-blue gradients, dark theme
- **Effects**: Glassmorphism, backdrop blur, smooth transitions
- **Typography**: System fonts with monospace for addresses
- **Responsive**: Mobile-first design

**Key Components**:
- Gradient cards with `backdrop-blur-lg`
- Status badges (green for verified, gray for unverified)
- Smooth hover effects and transitions
- Loading states with spinners

## User Flows

### Flow 1: User Requests Verification

1. Visit `/me`
2. Click "Connect Casper Wallet"
3. Approve connection in Casper Signer extension
4. Dashboard shows wallet address and unverified status
5. Click "Request Verification"
6. Choose tier (Basic or Full KYC)
7. Enter email (optional)
8. Submit request
9. Status shows "Pending"

### Flow 2: Admin Approves Request

1. Visit `/admin`
2. Enter admin password
3. See list of pending requests
4. Click "Approve" on a request
5. Backend issues credential and writes to blockchain
6. Request status changes to "Approved"

### Flow 3: Public Checks Status

1. Visit `/verify`
2. Enter wallet address
3. Click "Check"
4. See verification status with all details

## Development

### Running Locally

```bash
# Start backend API (in /server directory)
cd server
npm run dev  # Runs on port 3001

# Start frontend (in root directory)
npm run dev  # Runs on port 3000
```

### Building for Production

```bash
npm run build
npm start
```

## Testing

### Manual Testing Checklist

- [ ] Wallet connection works with Casper Signer
- [ ] User can request verification
- [ ] Admin can login and see requests
- [ ] Admin can approve/reject requests
- [ ] Public verify page shows correct status
- [ ] All API calls succeed
- [ ] UI is responsive on mobile

### Browser Compatibility

- Chrome/Edge (recommended for Casper Signer)
- Firefox
- Safari (desktop)

## Deployment

### Environment Variables

Production `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://api.casperid.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

### Deploy to Other Platforms

Compatible with:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Self-hosted (Node.js server)

## Troubleshooting

### "Casper Signer not found"
- Install Casper Signer extension from Chrome Web Store
- Refresh the page after installation

### "Failed to connect wallet"
- Check browser console for errors
- Ensure Casper Signer is unlocked
- Try disconnecting and reconnecting

### "API request failed"
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Open browser network tab to see request details

### TypeScript errors
- Run `npm install` to install all dependencies
- These errors are expected during development without node_modules

## Next Steps

1. Install Casper Signer extension
2. Start backend API server
3. Start frontend dev server
4. Test wallet connection
5. Test full verification flow
6. Customize branding and colors as needed

## Resources

- [Casper Signer Extension](https://docs.casper.network/users/caspersigner/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
