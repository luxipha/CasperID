
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const RecentActivity: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivity();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await apiService.getActivityLog();
      if (response && response.activities) {
        setActivities(response.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login': return { icon: 'login', color: 'bg-blue-100 text-blue-600' };
      case 'verification': return { icon: 'verified_user', color: 'bg-green-100 text-green-600' };
      case 'cns_register': return { icon: 'badge', color: 'bg-purple-100 text-purple-600' };
      default: return { icon: 'event_note', color: 'bg-gray-100 text-gray-600' };
    }
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-10 text-center text-text-sub">
            <span className="material-icons-outlined text-3xl mb-2 opacity-20">history</span>
            <p className="text-sm">No recent activity found.</p>
          </div>
        ) : (
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
              {activities.map((item, idx) => {
                const iconInfo = getEventIcon(item.type);
                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${iconInfo.color} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-sm">{iconInfo.icon}</span>
                        </div>
                        <span className="font-bold text-sm text-text-main">{item.title || item.event}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text-main">{item.application || 'CasperID System'}</div>
                      <div className="text-[10px] font-medium text-text-sub">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-text-sub">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {item.status || 'Complete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      <button className="text-primary hover:text-primary/80 transition-colors">Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
