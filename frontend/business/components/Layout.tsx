
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
      ? 'bg-primary/10 text-primary font-semibold'
      : 'text-text-muted hover:bg-background-light font-medium'
      }`}
  >
    <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{icon}</span>
    <p className="text-sm">{label}</p>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSandbox, setIsSandbox] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Removed Global Modal state and logic in favor of centralized APIManagement modal
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'API Key Rotated', desc: 'The production key for Uniswap Clone was rotated successfully.', time: '2m ago', type: 'info', read: false },
    { id: 2, title: 'New Verification', desc: 'A new user has verified their identity via Job Board Pro.', time: '15m ago', type: 'success', read: false },
    { id: 3, title: 'Webhook Failure', desc: 'Endpoint https://api.lab.io returned a 500 error.', time: '1h ago', type: 'warning', read: true },
    { id: 4, title: 'System Update', desc: 'CasperID B-Platform v2.4 is now live with Maps Grounding.', time: '4h ago', type: 'info', read: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { to: '/business', icon: 'dashboard', label: 'Overview' },
    { to: '/business/integrations', icon: 'account_tree', label: 'Integrations' },
    { to: '/business/api-management', icon: 'api', label: 'API Management' },
    { to: '/business/webhooks', icon: 'webhook', label: 'Webhooks' },
    { to: '/business/analytics', icon: 'bar_chart', label: 'Analytics' },
    { to: '/business/billing', icon: 'payments', label: 'Billing' },
    { to: '/business/docs', icon: 'description', label: 'Docs' },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeSidebar}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border-muted h-full
        transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6 p-6 h-full justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <Link to="/business" className="flex items-center gap-3" onClick={closeSidebar}>
                <Logo className="h-8 w-auto text-primary" showName={false} />
                <h1 className="text-xl font-black tracking-tight text-text-main">
                  CasperID
                </h1>
              </Link>
              <button
                onClick={closeSidebar}
                className="md:hidden text-text-muted hover:text-text-main p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={closeSidebar}
                  isActive={
                    item.to === '/business'
                      ? location.pathname === '/business'
                      : location.pathname.startsWith(item.to)
                  }
                />
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-border-muted pt-6">
            <NavItem
              to="/business/settings"
              icon="settings"
              label="Settings"
              onClick={closeSidebar}
              isActive={location.pathname === '/business/settings'}
            />
            <div className="flex items-center gap-3 p-2 bg-background-light rounded-xl border border-border-muted/50">
              <div className="bg-primary/10 flex items-center justify-center rounded-full size-10 shrink-0 border border-border-muted">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-text-main text-sm font-bold truncate">{user?.display_name || user?.cns_name || 'Guest'}</h1>
                <p className="text-text-muted text-xs font-normal">{user?.email || (user ? 'Authenticated' : 'Offline')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex items-center justify-between bg-white border-b border-border-muted px-4 md:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden flex items-center justify-center rounded-xl h-10 w-10 text-text-muted hover:bg-background-light border border-border-muted"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-1 max-w-xl">
              <div className="flex w-full items-stretch rounded-xl bg-background-light border border-border-muted h-10">
                <div className="text-text-muted flex items-center justify-center pl-4">
                  <span className="material-symbols-outlined !text-lg">search</span>
                </div>
                <input
                  className="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-text-muted px-3"
                  placeholder="Search apps or logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <button
              onClick={() => setIsSandbox(!isSandbox)}
              className={`flex items-center justify-center rounded-xl h-10 px-4 transition-all border shadow-sm gap-2 ${isSandbox
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-green-50 text-green-700 border-green-200'
                }`}
            >
              <span className={`size-2 rounded-full animate-pulse ${isSandbox ? 'bg-secondary' : 'bg-green-500'}`}></span>
              <span className="text-sm font-black tracking-tight">{isSandbox ? 'Sandbox' : 'Mainnet'}</span>
            </button>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`flex items-center justify-center rounded-xl h-10 w-10 transition-colors border ${isNotificationOpen ? 'bg-primary text-white border-primary' : 'bg-background-light text-text-main border-border-muted'
                  }`}
              >
                <span className="material-symbols-outlined !text-xl">notifications</span>
                {!isNotificationOpen && <span className="absolute top-2 right-2.5 size-2 bg-red-500 border-2 border-white rounded-full"></span>}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl border border-border-muted shadow-2xl z-50 overflow-hidden animate-notification-enter">
                  <div className="px-6 py-4 border-b border-border-muted flex items-center justify-between bg-background-light/30">
                    <h3 className="font-bold text-text-main text-sm">Notifications</h3>
                    <button className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-6 py-4 border-b border-border-muted hover:bg-background-light/50 transition-colors cursor-pointer flex gap-4 ${!n.read ? 'bg-primary/[0.02]' : ''}`}>
                        <div className={`mt-1 size-8 shrink-0 rounded-full flex items-center justify-center ${n.type === 'success' ? 'bg-green-100 text-green-600' :
                          n.type === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          <span className="material-symbols-outlined !text-base">
                            {n.type === 'success' ? 'check_circle' : n.type === 'warning' ? 'error' : 'info'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-main leading-tight">{n.title}</span>
                            <span className="text-[10px] text-text-muted">{n.time}</span>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{n.desc}</p>
                        </div>
                        {!n.read && <div className="mt-2 size-2 shrink-0 bg-primary rounded-full"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/business/api-management?create=true')}
              className="flex items-center justify-center rounded-xl h-10 px-4 md:px-6 bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all active:scale-95"
            >
              <span className="hidden sm:inline">+ Create New</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
