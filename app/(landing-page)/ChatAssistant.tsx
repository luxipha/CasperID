
"use client";

import React, { useState, useRef, useEffect } from 'react';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Hello! I'm Casper, your identity assistant. How can I help you simplify your verification process today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Simulate AI response with predefined responses
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responses = [
      "CasperID allows you to verify your identity once and reuse it everywhere. No more repetitive KYC processes!",
      "With our decentralized identity layer, you maintain control of your data while enjoying seamless verification across platforms.",
      "Our CNS domains give you a human-readable identity that works across Web2 and Web3. Think of it as your digital passport.",
      "Privacy-first KYC means you can prove who you are without exposing sensitive personal information unnecessarily.",
      "Our developer SDKs make it easy to integrate CasperID into any platform. Would you like to learn more about our APIs?",
      "CasperID eliminates the need to repeatedly submit documents. One verification, infinite possibilities!"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setMessages(prev => [...prev, { role: 'assistant', text: randomResponse }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-900 w-96 h-[500px] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300">
          <div className="p-4 bg-purple-600 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <div className="font-black text-sm uppercase tracking-widest">Identity Assistant</div>
                <div className="text-[10px] opacity-70">Powered by CasperID</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded transition-colors">
              <span className="text-xl">✕</span>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-gray-900 dark:text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex gap-1 border border-gray-100 dark:border-gray-700">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about verification..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-purple-600 transition-all text-gray-900 dark:text-white"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-purple-600 text-white shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center group relative"
        >
          <span className="text-3xl">💬</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
          <div className="absolute right-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Need help? Ask Casper
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
