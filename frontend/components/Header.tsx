
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Get network name from environment

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const Header: React.FC = () => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Check server status on mount
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await apiService.checkHealth();
      setServerOnline(isOnline);
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await apiService.getNotifications();
        if (response.success && response.notifications) {
          setNotifications(response.notifications);
        }
      } catch (error) {
        // Silently fail for notifications
      }
    };
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border-color flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-text-sub">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-bold text-lg text-text-main">CasperID</span>
      </div>

      <div className="hidden md:flex items-center gap-4 w-full max-w-xl">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-sub group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-bg-light text-text-main placeholder-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all sm:text-sm"
            placeholder="Search connected apps or credentials..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Server Status Indicator */}
        <div className={`hidden sm:flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${serverOnline === null
          ? 'bg-gray-50 text-gray-500 border-gray-100'
          : serverOnline
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-red-50 text-red-700 border-red-100'
          }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${serverOnline === null
            ? 'bg-gray-400'
            : serverOnline
              ? 'bg-green-500 animate-pulse'
              : 'bg-red-500'
            }`}></div>
          {serverOnline === null ? 'Checking...' : serverOnline ? 'Online' : 'Offline'}
        </div>

        {/* Network Badge */}
        <div className="hidden sm:flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
          Testnet
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-text-sub hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-alerts text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-text-main">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-text-sub">{unreadCount} unread</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">notifications_off</span>
                    <p className="text-text-sub text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-text-main">{notif.title}</p>
                          <p className="text-xs text-text-sub mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-text-sub mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-sm text-primary">mark_email_read</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add to Chrome Link - Hidden on Mobile */}
        <a
          href="https://chromewebstore.google.com/detail/oecccgmhmojgniechnclmffchodmdjmd?utm_source=item-share-cb"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">extension</span>
          <span className="text-sm">Add to Chrome</span>
        </a>
      </div>
    </header>
  );
};
