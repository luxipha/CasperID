import { Link, useLocation } from 'react-router-dom';
import { Bell, Wallet, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F1EE]/80 backdrop-blur-md border-b border-primary/5">
      <nav className="flex justify-between items-center w-full px-12 h-24 max-w-7xl mx-auto">
        <Link to="/" className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] mb-1">Volume 04 / Issue 01</span>
          <h1 className="text-2xl font-serif font-bold italic tracking-tighter text-primary">
            VESTIGE STUDIO
          </h1>
        </Link>
        
        <div className="hidden md:flex gap-16 font-mono text-[10px] uppercase tracking-[0.2em] pt-2">
          <Link 
            to="/" 
            className={`${location.pathname === '/' ? 'line-through' : 'hover:line-through'} transition-all`}
          >
            Explore
          </Link>
          <Link 
            to="/dashboard" 
            className={`${isDashboard ? 'line-through' : 'hover:line-through'} transition-all`}
          >
            Dashboard
          </Link>
          <a className="hover:line-through transition-all" href="#">Journal</a>
          <a className="hover:line-through transition-all" href="#">Contact</a>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-primary hover:opacity-50 transition-all">
            <Bell size={18} strokeWidth={1.5} />
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-mono text-[10px] uppercase tracking-widest border border-primary px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            Connect Wallet
          </motion.button>
        </div>
      </nav>
    </header>
  );
}
