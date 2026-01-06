
import React from 'react';

interface ActivityLogProps {
  onViewDetail?: (id: string) => void;
}

const activities = [
  {
    id: 'c237ffeb74d142359404fe7c1c7c4aa1',
    type: 'verified_user',
    typeColor: 'bg-primary/10 text-primary',
    action: 'KYC Verification',
    subText: 'Level 2 Identity Check',
    entity: 'CasperID Core',
    date: 'Oct 24, 2023',
    time: '10:42 AM',
    status: 'Success',
    statusClass: 'bg-green-100 text-green-800'
  },
  {
    id: 'auth-233',
    type: 'key',
    typeColor: 'bg-blue-50 text-blue-600',
    action: 'Login with Casper',
    subText: 'Authentication Request',
    entity: 'Uniswap',
    date: 'Oct 23, 2023',
    time: '08:15 PM',
    status: 'Success',
    statusClass: 'bg-green-100 text-green-800'
  },
  {
    id: 'share-99',
    type: 'share',
    typeColor: 'bg-purple-50 text-purple-600',
    action: 'Data Sharing',
    subText: 'Email, Name Access',
    entity: 'MortgageApp',
    date: 'Oct 21, 2023',
    time: '02:00 PM',
    status: 'Revoked',
    statusClass: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'suspicious-1',
    type: 'warning',
    typeColor: 'bg-red-100 text-alerts',
    action: 'Login Attempt',
    subText: 'Suspicious Activity',
    entity: 'Unknown Device',
    entitySub: 'IP: 192.168.x.x',
    date: 'Oct 20, 2023',
    time: '11:30 AM',
    status: 'Failed',
    statusClass: 'bg-red-100 text-alerts'
  },
  {
    id: 'cred-001',
    type: 'card_membership',
    typeColor: 'bg-indigo-50 text-indigo-600',
    action: 'Credential Issued',
    subText: 'Added to Wallet',
    entity: 'DAO Member Card',
    date: 'Oct 18, 2023',
    time: '09:15 AM',
    status: 'Success',
    statusClass: 'bg-green-100 text-green-800'
  }
];

export const ActivityLog: React.FC<ActivityLogProps> = ({ onViewDetail }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main">Activity Log</h1>
          <p className="text-text-sub text-base max-w-2xl leading-relaxed">
            Monitor your identity usage, verifications, and logins across Web2 and Web3.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap active:scale-95">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-[24px] shadow-soft border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 lg:col-span-5">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Search</label>
            <div className="relative flex items-center w-full h-11 rounded-xl bg-bg-light border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
              <div className="pl-3 text-text-sub flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input 
                className="w-full h-full bg-transparent border-none focus:ring-0 text-sm px-3 text-text-main placeholder:text-text-sub/50" 
                placeholder="Search by App name or Action type..."
              />
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Event Type</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-text-main focus:ring-2 focus:ring-primary/10 focus:border-primary px-3 cursor-pointer appearance-none outline-none">
                <option>All Events</option>
                <option>Logins</option>
                <option>Verifications</option>
                <option>Data Sharing</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-sub">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Status</label>
            <div className="relative">
              <select className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-text-main focus:ring-2 focus:ring-primary/10 focus:border-primary px-3 cursor-pointer appearance-none outline-none">
                <option>All Statuses</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Pending</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-sub">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-3">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Date Range</label>
            <div className="relative flex items-center w-full h-11 rounded-xl border border-gray-200 bg-white px-3 cursor-pointer hover:border-primary transition-colors">
              <input className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-text-main placeholder:text-text-sub/50 pointer-events-none" placeholder="Select dates" readOnly />
              <div className="text-text-sub flex items-center justify-center pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[32px] shadow-soft border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest w-20">Type</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Action</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Entity / App</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => onViewDetail?.(item.id)}
                  className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <div className={`size-10 rounded-full flex items-center justify-center ${item.typeColor}`}>
                      <span className="material-symbols-outlined text-[20px]">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-text-main">{item.action}</p>
                    <p className="text-[11px] text-text-sub font-medium">{item.subText}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">{item.entity}</span>
                      {item.entitySub && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-text-sub font-mono w-fit mt-1">{item.entitySub}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-text-main">{item.date}</p>
                    <p className="text-[11px] text-text-sub font-medium">{item.time}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.statusClass}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-text-sub group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between bg-white">
          <span className="text-xs font-bold text-text-sub">
            Showing <span className="text-text-main">1</span> to <span className="text-text-main">5</span> of <span className="text-text-main">42</span> results
          </span>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-text-sub disabled:opacity-50 hover:bg-gray-50 transition-all active:scale-95" disabled>
              Previous
            </button>
            <div className="flex gap-1">
              <button className="size-9 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20">1</button>
              <button className="size-9 text-text-main hover:bg-gray-50 rounded-xl text-xs font-bold transition-all">2</button>
              <button className="size-9 text-text-main hover:bg-gray-50 rounded-xl text-xs font-bold transition-all">3</button>
              <span className="size-9 flex items-center justify-center text-text-sub">...</span>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-text-main hover:bg-gray-50 transition-all active:scale-95">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
