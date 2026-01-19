
import React from 'react';
import { Utensils, Globe, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <Utensils className="text-white w-4 h-4" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">RestoTech</h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            The modern operating system for the world's best dining experiences.
          </p>
          <div className="flex gap-4">
            <div className="size-8 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-midnight dark:text-white cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
              <Globe className="w-4 h-4" />
            </div>
            <div className="size-8 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-midnight dark:text-white cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
              <Mail className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a className="hover:text-primary transition-colors" href="#">Loyalty Engine</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Zalo Integration</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">CasperID Identity</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Analytics</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4">Stay updated with the latest in hospitality tech.</p>
          <div className="flex gap-2">
            <input 
              className="bg-gray-100 dark:bg-white/5 border-none rounded-xl text-sm w-full focus:ring-primary" 
              placeholder="Email address" 
              type="email"
            />
            <button className="bg-primary text-white p-2 rounded-xl flex items-center justify-center group">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between gap-4">
        <p className="text-xs text-gray-400">© 2024 RestoTech SaaS. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-gray-400">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
