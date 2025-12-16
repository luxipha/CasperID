'use client';

import dynamic from 'next/dynamic';
import { CasperProvider } from '@/lib/casper-context';
import UserDashboard from './dashboard';

// Load Navbar only on client-side to avoid hydration issues with wallet-dependent buttons
const Navbar = dynamic(() => import('@/components/navbar/navbar'), {
    ssr: false,
});

export default function MePage() {
    return (
        <CasperProvider>
            <div>
                <Navbar />
                <UserDashboard />
            </div>
        </CasperProvider>
    );
}
