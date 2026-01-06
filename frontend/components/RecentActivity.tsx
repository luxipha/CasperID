
import React from 'react';

export const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-main">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest">Filter:</span>
          <select className="text-xs font-bold border-gray-200 rounded-lg text-text-main focus:ring-primary focus:border-primary cursor-pointer px-3 py-1.5 bg-gray-50">
            <option>All Activity</option>
            <option>Logins</option>
            <option>Verifications</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-extrabold text-text-sub uppercase tracking-wider">Event</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-text-sub uppercase tracking-wider">Application</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-text-sub uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-text-sub uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-text-sub uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm icon-filled">person_add</span>
                  </div>
                  <span className="font-bold text-sm text-text-main">Identity Created</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-text-main">CasperID System</div>
                <div className="text-[10px] font-medium text-text-sub">Basic Verification</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-text-sub">
                Just now
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                <button className="text-primary hover:text-primary/80 transition-colors">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
