'use client';

import Navbar from '@/components/navbar/navbar';
import AdminDashboard from './dashboard';

export default function AdminPage() {
    return (
        <div>
            <Navbar />
            <AdminDashboard />
        </div>
    );
}
