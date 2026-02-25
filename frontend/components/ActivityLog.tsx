
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ActivityLogProps {
  onViewDetail?: (id: string) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ onViewDetail }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });

  const formatTimeAgo = (date: string | number) => {
    const timestamp = typeof date === 'string' ? new Date(date).getTime() : date;
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const getProfileSlug = (url?: string) => {
    if (!url || !url.includes('/api/public-profile/')) return null;
    return url.split('/').pop();
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getActivityLog({
        page: currentPage,
        limit: 10,
        type: eventType || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      setActivities(response.activities);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
      setError(err.message || 'Failed to load activity log');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchActivities();
  }, [currentPage, eventType, statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchActivities();
      } else {
        setCurrentPage(1); // Reset to page 1, will trigger fetch
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-sm px-3 text-text-main placeholder:text-text-sub/50"
                placeholder="Search by App name or Action type..."
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Event Type</label>
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-text-main focus:ring-2 focus:ring-primary/10 focus:border-primary px-3 cursor-pointer appearance-none outline-none"
              >
                <option value="">All Events</option>
                <option value="key">Logins</option>
                <option value="verified_user">Verifications</option>
                <option value="visibility">Profile Views</option>
                <option value="card_membership">Credentials</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-text-sub">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <label className="block text-[11px] font-extrabold text-text-sub uppercase tracking-wider mb-2">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-text-main focus:ring-2 focus:ring-primary/10 focus:border-primary px-3 cursor-pointer appearance-none outline-none"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
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
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <span className="material-symbols-outlined text-5xl text-red-500 mb-4">error</span>
            <p className="text-text-main font-bold text-lg mb-2">Failed to load activity log</p>
            <p className="text-text-sub text-sm mb-4">{error}</p>
            <button onClick={fetchActivities} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Retry</button>
          </div>
        )}
        {!loading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">inbox</span>
            <p className="text-text-main font-bold text-lg mb-2">No activity yet</p>
            <p className="text-text-sub text-sm">Your activity will appear here as you use CasperID</p>
          </div>
        )}
        {!loading && !error && activities.length > 0 && (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30">
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest w-20 hidden sm:table-cell">Type</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Action</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest">Entity / App</th>
                  <th className="px-6 py-5 text-[10px] font-extrabold text-text-sub uppercase tracking-widest hidden lg:table-cell">Date & Time</th>
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
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <div className={`size-10 rounded-full flex items-center justify-center ${item.typeColor}`}>
                        <span className="material-symbols-outlined text-[20px]">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-text-main line-clamp-1">{item.action}</p>
                      {item.type === 'visibility' && (
                        <p className="text-[11px] text-text-sub font-medium line-clamp-1">
                          {getProfileSlug(item.subText) || 'Public Profile'}
                        </p>
                      )}
                      {/* Date visible only on smaller screens here */}
                      <p className="text-[10px] text-text-sub/60 mt-1 lg:hidden">
                        {formatTimeAgo(item.timestamp)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col max-w-[120px] sm:max-w-none">
                        <span className="text-sm font-bold text-text-main truncate">{item.entity}</span>
                        {item.location && (
                          <span className="text-[10px] text-text-sub font-medium w-fit mt-1 truncate">
                            {item.location}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <p className="text-sm font-bold text-text-main truncate">{formatTimeAgo(item.timestamp)}</p>
                      <p className="text-[11px] text-text-sub font-medium truncate">{item.date} {item.time}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${item.statusClass}`}>
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
        )}

        {/* Pagination */}
        {!loading && !error && activities.length > 0 && (
          <div className="px-6 md:px-8 py-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
            <span className="text-xs font-bold text-text-sub order-2 md:order-1">
              Showing <span className="text-text-main">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-text-main">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-text-main">{pagination.total}</span> results
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 order-1 md:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-text-sub disabled:opacity-50 hover:bg-gray-50 transition-all active:scale-95"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.pages, 3) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-9 rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-main hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                {pagination.pages > 3 && <span className="size-9 flex items-center justify-center text-text-sub">...</span>}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={currentPage >= pagination.pages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-text-main disabled:opacity-50 hover:bg-gray-50 transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
