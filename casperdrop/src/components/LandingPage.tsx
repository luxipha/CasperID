import { motion } from 'motion/react';
import { ShieldCheck, Rocket, LogIn, UserCheck, Repeat, Lock, Shield, EyeOff } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center px-12 z-10 py-32">
        <div className="absolute top-0 right-0 w-[45%] h-full bg-grey-muted z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Editorial Architecture" 
            className="w-full h-full object-cover editorial-img"
          />
          <div className="absolute inset-0 noise-overlay"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 max-w-5xl"
        >
          <div className="relative">
            <h2 className="text-[120px] md:text-[180px] font-serif font-black leading-[0.8] tracking-tighter mb-4 text-primary">
              THE<br />GLASS
            </h2>
            <h2 className="text-[120px] md:text-[180px] font-serif font-black leading-[0.8] tracking-tighter outline-text ml-20 md:ml-40">
              PAVILION
            </h2>
            
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
              <div className="w-[1px] h-32 bg-primary opacity-20"></div>
              <span className="font-mono text-[10px] vertical-text tracking-[0.3em] uppercase opacity-60">
                Featured Protocol
              </span>
              <div className="w-[1px] h-32 bg-primary opacity-20"></div>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row items-start gap-12 max-w-2xl">
            <p className="text-sm leading-relaxed text-text-body font-normal">
              An exploration of transparency and high-fidelity token distribution. 
              Join the next generation of privacy-first airdrops, where security 
              meets refined digital craftsmanship.
            </p>
            
            <div className="flex gap-6 items-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full border border-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <ShieldCheck size={20} strokeWidth={1.5} />
              </motion.button>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">Begin Verification</span>
                <span className="text-xs font-serif italic opacity-60">Handshake powered by CasperID</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Prize Details Section (Restyled as Editorial Grid) */}
      <section className="px-12 py-32 border-t border-primary/5 bg-grey-muted/30">
        <div className="grid grid-cols-12 gap-12 items-end">
          <div className="col-span-12 md:col-span-4 flex flex-col gap-12">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 mb-4 block">Section 01 / Allocation</span>
              <h3 className="text-5xl font-serif font-bold italic tracking-tighter mb-6 text-primary">The Prize Portfolio</h3>
              <p className="text-sm leading-relaxed text-text-body">
                A total pool of <span className="italic font-serif font-bold">10,000 $CASPER</span> tokens has been curated for this volume. 
                Our methodology uses CasperID verified claims to protect user privacy and ensure integrity.
              </p>
            </div>
            
            <div className="flex justify-between w-full font-mono text-[9px] uppercase tracking-tighter opacity-60 border-t border-primary/10 pt-4">
              <span>Status: Live Now</span>
              <span>Ends: D+4</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <div className="relative aspect-[16/9] overflow-hidden grayscale contrast-125">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9HavSDttCRoYc5fOCMyk3toHhYSiJGp7KqPDj-tdtW_txU8t1CaQILhFlwDELZ8rzBGhbGTjPIou_mWC7e57puxp5aBgEAIwRbuFPrSoxvO3gevNFoZ6D0gO56zb_qOIrecXsFfMivYMMc13-LRdu9eiEyC4VtEmUfBdV2IqthdwpnRKmIaMZ391tfQAbpePaDnfe-nW4OLds_bJ9lQ2xGLHr0KX4rhxaVm7lGMwmG_DmhoM4M3HyX7f3HMsuPR7L8J8bbD4iDQ" 
                className="w-full h-full object-cover editorial-img"
                alt="Architecture Prize"
              />
              <div className="absolute bottom-12 left-12">
                <span className="font-serif italic text-6xl text-white outline-text">10,000</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white ml-6">Units Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Bento Grid Editorial) */}
      <section className="px-12 py-32 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex justify-between items-end">
            <h2 className="text-7xl font-serif font-bold italic tracking-tighter">Process</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40">Methodology / Protocol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            <div className="bg-primary py-20 pr-12">
              <span className="font-serif italic text-4xl mb-8 block opacity-40">001</span>
              <h4 className="text-2xl font-serif font-bold mb-6 tracking-tight">Authenticate</h4>
              <p className="font-sans text-sm font-light leading-relaxed opacity-60">
                Connect your digital vault and initialize the handshake protocol. 
                Secured via modern cryptographic standards.
              </p>
            </div>
            <div className="bg-primary py-20 px-12 border-l border-white/10">
              <span className="font-serif italic text-4xl mb-8 block opacity-40">002</span>
              <h4 className="text-2xl font-serif font-bold mb-6 tracking-tight">Verify Humanity</h4>
              <p className="font-sans text-sm font-light leading-relaxed opacity-60">
                A rapid local scan confirms your unique identity without 
                ever storing personal biometric artifacts.
              </p>
            </div>
            <div className="bg-primary py-20 px-12 border-l border-white/10">
              <span className="font-serif italic text-4xl mb-8 block opacity-40">003</span>
              <h4 className="text-2xl font-serif font-bold mb-6 tracking-tight">Claim</h4>
              <p className="font-sans text-sm font-light leading-relaxed opacity-60">
                Upon successful verification, assets are transitioned to 
                your portfolio with absolute transparency.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
