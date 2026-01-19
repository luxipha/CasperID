
import React, { useState, useEffect } from 'react';
import { Check, Menu, UserCircle2, Scan, ShoppingCart, CreditCard, UtensilsCrossed, ChevronRight, ChevronLeft, Search, Plus, MapPin } from 'lucide-react';

export const ZaloIntegration: React.FC = () => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, 4500); // 4.5 seconds per step for a comfortable viewing pace
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "1. Identification",
      desc: "CasperID identifies Alex instantly upon scanning the table QR.",
      color: "text-blue-500"
    },
    {
      title: "2. Visual Browsing",
      desc: "A personalized menu appears with his favorite Wagyu selection.",
      color: "text-orange-500"
    },
    {
      title: "3. Group Ordering",
      desc: "Friends join the session. Items fly into a shared real-time cart.",
      color: "text-green-500"
    },
    {
      title: "4. Instant Payment",
      desc: "One-tap checkout with ZaloPay. Points are credited immediately.",
      color: "text-primary"
    }
  ];

  return (
    <div className="py-32 bg-background-dark text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">The Fluid Guest Journey</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the frictionless bridge between your physical tables and digital loyalty.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Animated Descriptions */}
          <div className="space-y-12">
            <div className="relative pl-8 border-l-2 border-white/10 space-y-10">
              {/* Progress Indicator Line */}
              <div 
                className="absolute left-[-2px] top-0 w-[2px] bg-primary transition-all duration-700 ease-in-out"
                style={{ height: `${((step + 1) / totalSteps) * 100}%` }}
              ></div>

              {steps.map((s, i) => (
                <div 
                  key={i} 
                  className={`transition-all duration-700 transform ${step === i ? 'opacity-100 translate-x-4 scale-105' : 'opacity-20 translate-x-0 scale-100'}`}
                >
                  <h3 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${step === i ? s.color : 'text-white'}`}>
                    {step === i && <span className="size-2 rounded-full bg-current animate-ping"></span>}
                    {s.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md">{s.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-8">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-12 bg-primary' : 'w-4 bg-white/10'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Mockup with Fluid Internal Transitions */}
          <div className="flex justify-center relative">
            <div className="relative w-full max-w-[340px] group">
              {/* Phone Frame */}
              <div className="w-full aspect-[9/18.5] bg-black rounded-[3.5rem] border-[10px] border-gray-800 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative">
                
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-7 bg-black z-50 flex justify-center items-end pb-1">
                  <div className="w-20 h-4 bg-gray-900 rounded-b-2xl"></div>
                </div>

                {/* APP HEADER - Sticky across steps */}
                <div className="absolute top-7 inset-x-0 h-14 bg-white/95 backdrop-blur-sm z-40 flex items-center justify-between px-6 border-b border-gray-100">
                  <Menu size={18} className="text-midnight/40" />
                  <span className="font-black text-[10px] tracking-widest text-midnight">BISTRO PRIME</span>
                  <div className="size-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCircle2 size={16} className="text-midnight/60" />
                  </div>
                </div>

                {/* CONTENT LAYER */}
                <div className="h-full w-full bg-[#F8F9FA] relative pt-20 overflow-hidden text-midnight">
                  
                  {/* STEP 1: IDENTIFY */}
                  <div className={`absolute inset-x-0 top-20 bottom-0 px-6 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20 pointer-events-none'}`}>
                    <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 mt-4">
                      <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Welcome Back</p>
                      <p className="text-xl font-extrabold">Alex Nguyen</p>
                    </div>
                    
                    <div className="aspect-square bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                       <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl animate-pulse"></div>
                       <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl animate-pulse"></div>
                       <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl animate-pulse"></div>
                       <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl animate-pulse"></div>
                       
                       <Scan className="text-primary w-12 h-12 mb-4" strokeWidth={1.5} />
                       <p className="text-center text-xs font-bold leading-tight px-4 opacity-60">Scanning Table 14...</p>
                    </div>

                    <button className="w-full bg-[#007BFF] text-white text-[10px] font-black py-4 rounded-2xl mt-8 shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                      Identified via Zalo
                    </button>
                  </div>

                  {/* STEP 2: BROWSE */}
                  <div className={`absolute inset-x-0 top-20 bottom-0 px-6 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 1 ? 'opacity-100 translate-y-0' : step < 1 ? 'opacity-0 translate-y-20' : 'opacity-0 -translate-y-20'} pointer-events-none`}>
                    <div className="flex items-center gap-2 mb-6 mt-4 overflow-x-auto no-scrollbar">
                      <span className="bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">STEAKS</span>
                      <span className="bg-gray-100 text-gray-400 text-[9px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">SEAFOOD</span>
                      <span className="bg-gray-100 text-gray-400 text-[9px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">WINES</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex gap-4">
                        <div className="size-20 rounded-xl bg-cover bg-center shrink-0" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200)'}}></div>
                        <div className="flex flex-col justify-center flex-grow">
                          <p className="font-bold text-sm">Wagyu Ribeye</p>
                          <p className="text-xs text-gray-400 mb-2">A5 Japanese Grade</p>
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-black text-sm">$85.00</span>
                            <div className="size-6 bg-primary text-white rounded-lg flex items-center justify-center"><Plus size={14} strokeWidth={3} /></div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex gap-4 opacity-50">
                        <div className="size-20 rounded-xl bg-gray-100 shrink-0"></div>
                        <div className="flex flex-col justify-center flex-grow">
                          <div className="h-3 w-20 bg-gray-100 rounded mb-2"></div>
                          <div className="h-2 w-full bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: GROUP CART */}
                  <div className={`absolute inset-x-0 top-20 bottom-0 px-6 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 2 ? 'opacity-100 translate-y-0' : step < 2 ? 'opacity-0 translate-y-20' : 'opacity-0 -translate-y-20'} pointer-events-none`}>
                    <div className="flex items-center justify-between mt-4 mb-6">
                      <h3 className="font-black text-lg">Group Cart</h3>
                      <div className="flex -space-x-2">
                        <img src="https://i.pravatar.cc/40?u=1" className="size-6 rounded-full border-2 border-white" alt="u1" />
                        <img src="https://i.pravatar.cc/40?u=2" className="size-6 rounded-full border-2 border-white" alt="u2" />
                        <div className="size-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">+3</div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-3xl shadow-sm mb-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">AN</div>
                        <div className="flex-grow"><p className="text-xs font-bold">Alex: Wagyu Ribeye</p></div>
                        <span className="text-xs font-black">$85.00</span>
                      </div>
                      <div className="h-px bg-gray-50"></div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold">JD</div>
                        <div className="flex-grow"><p className="text-xs font-bold">Jane: Malbec Glass</p></div>
                        <span className="text-xs font-black">$22.00</span>
                      </div>
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="size-8 bg-gray-50 rounded-full"></div>
                        <div className="flex-grow"><div className="h-2 w-24 bg-gray-50 rounded"></div></div>
                      </div>
                    </div>

                    <div className="bg-midnight rounded-3xl p-6 text-white">
                      <div className="flex justify-between mb-4">
                        <span className="text-xs opacity-60">Subtotal</span>
                        <span className="text-sm font-black">$107.00</span>
                      </div>
                      <button className="w-full bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Place Order</button>
                    </div>
                  </div>

                  {/* STEP 4: SUCCESS */}
                  <div className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                     <div className="h-full bg-blue-600 flex flex-col items-center justify-center p-8 text-white text-center">
                        <div className="size-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                           <Check size={40} strokeWidth={4} />
                        </div>
                        <h4 className="text-xl font-black mb-2">Payment Complete</h4>
                        <p className="text-xs text-white/60 mb-8 leading-relaxed">Receipt sent to your Zalo message</p>
                        
                        <div className="bg-white/10 w-full p-5 rounded-[2rem] border border-white/20 mb-8 backdrop-blur-md">
                           <p className="text-[9px] font-black uppercase opacity-60 mb-2">Loyalty Points Earned</p>
                           <p className="text-3xl font-black mb-1">+450 CSPR</p>
                           <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-4">
                              <div className="h-full bg-white w-3/4"></div>
                           </div>
                           <p className="text-[8px] mt-2 opacity-60">Next reward: Free Cocktail at 500 CSPR</p>
                        </div>

                        <button className="w-full bg-white text-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                           Return to Home
                        </button>
                     </div>
                  </div>

                </div>

                {/* Status Bar */}
                <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center">
                  <div className="w-24 h-full bg-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Floaties around the phone */}
              <div className="absolute -right-8 top-1/4 size-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex flex-col items-center justify-center animate-float-delayed p-2 text-center">
                 <MapPin className="text-primary size-5 mb-1" />
                 <span className="text-[8px] font-black">TABLE 14</span>
              </div>
              <div className="absolute -left-10 bottom-1/4 size-20 bg-primary/20 backdrop-blur-md rounded-full border border-primary/20 shadow-xl flex flex-col items-center justify-center animate-float p-2 text-center">
                 <ShoppingCart className="text-white size-6 mb-1" />
                 <span className="text-[9px] font-black text-white">SYNCING</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
