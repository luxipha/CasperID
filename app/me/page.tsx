'use client';

import dynamic from 'next/dynamic';
import UserDashboard from './dashboard';

// Load Navbar only on client-side to avoid hydration issues with wallet-dependent buttons
const Navbar = dynamic(() => import('@/components/navbar/navbar'), {
    ssr: false,
});

export default function MePage() {
    return (
        <div>
            <Navbar />
            <UserDashboard />
        </div>
    );
}
