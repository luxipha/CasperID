import React, { useState } from 'react';
import { FooterMarketing } from '../FooterMarketing';
import HeaderMarketing from '../HeaderMarketing';
import { ArrowLeft, Share2, CheckCircle, Hourglass, Rocket, BarChart3, Headphones, Award, Wand2, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AffiliatePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [isApplying, setIsApplying] = useState(false);
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001/api' : '/api');

    const handleApply = async () => {
        if (!isAuthenticated || !user) {
            window.location.href = '/dashboard';
            return;
        }

        setIsApplying(true);
        try {
            await axios.post(`${API_URL}/affiliates/apply`, {
                applicantName: user.display_name || user.cns_name || 'CasperID User',
                applicantEmail: user.email || 'no-email-linked',
                applicantId: user.human_id || user.wallet || 'Unknown ID',
                location: 'Not Specified' // Could add a prompt for this if needed
            });
            alert('Application submitted successfully! Check your email.');
        } catch (error) {
            console.error('Failed to apply:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="bg-bg-light min-h-screen">
            <HeaderMarketing />
            <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">

                {/* Header Card */}
                <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-primary/10 relative overflow-hidden mb-12">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full -ml-20 -mb-20"></div>
                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">Sales & Partnerships</span>
                            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">Nigeria / Vietnam</span>
                            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">Commission-Based</span>
                            <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-slate-800 text-sm font-bold border border-secondary/20">High Growth</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-text-main leading-tight">
                            Relationship Manager <span className="text-primary font-medium text-2xl md:text-3xl block mt-2">(anra Partner)</span>
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold text-text-sub mb-8 max-w-2xl">
                            Turn Every Restaurant in Your City Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Passive Income.</span>
                        </p>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="w-full md:w-auto px-10 py-4 rounded-full bg-primary text-white text-lg font-bold hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isApplying ? <Loader2 className="animate-spin" size={20} /> : null}
                                {isAuthenticated ? 'Apply Now' : 'Log in to Apply'}
                            </button>
                            <button className="w-full md:w-auto px-6 py-4 rounded-full border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <Share2 size={20} className="text-primary" />
                                <span className="font-semibold text-text-main">Share Opportunity</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Opportunity Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-text-main">
                            <span className="w-8 h-1 bg-primary rounded-full"></span>
                            The Opportunity
                        </h2>
                        <p className="text-lg text-text-sub leading-relaxed mb-6">
                            anra is the next-gen Operating System designed specifically for the modern restaurant. From seamless inventory management to integrated payments via CasperID, we empower local business owners with tools that were previously only available to global chains.
                        </p>
                        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                            <p className="font-bold text-primary text-lg mb-1">Pro Tip Highlight</p>
                            <p className="text-text-main">You keep <span className="font-extrabold">100% of the $10 setup fee</span> for every shop you onboard. Immediate cash flow from day one.</p>
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-slate-900 text-white p-8 rounded-lg shadow-xl h-full flex flex-col justify-center">
                            <h3 className="text-secondary font-bold text-xl mb-4">Simple Model</h3>
                            <ul className="space-y-6">
                                <li>
                                    <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Restaurant Cost</p>
                                    <p className="text-2xl font-bold">$15/mo <span className="text-sm font-normal text-slate-400">(Flat)</span></p>
                                </li>
                                <li>
                                    <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Your Mission</p>
                                    <p className="text-lg font-medium">Onboard once, collect monthly residuals.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Residual Payout Structure */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center text-text-main">Residual Payout Structure</h2>
                    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-8 py-5 font-bold text-text-main">Rank Level</th>
                                    <th className="px-8 py-5 font-bold text-text-main">Portfolio Size</th>
                                    <th className="px-8 py-5 font-bold text-primary">Your Monthly Payout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-semibold">Associate</td>
                                    <td className="px-8 py-6 text-text-sub">1-10 shops</td>
                                    <td className="px-8 py-6 font-bold text-lg">$3/shop/mo</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6 font-semibold">Specialist</td>
                                    <td className="px-8 py-6 text-text-sub">11-50 shops</td>
                                    <td className="px-8 py-6 font-bold text-lg">$4/shop/mo</td>
                                </tr>
                                <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-primary">Elite RM</span>
                                        <span className="ml-2 px-2 py-0.5 bg-primary text-white text-[10px] rounded uppercase font-bold">Top Tier</span>
                                    </td>
                                    <td className="px-8 py-6 text-text-main font-medium">51+ shops</td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-primary text-xl">$5/shop/mo</div>
                                        <div className="text-xs text-slate-500 font-medium mt-1">Build a $500+/mo business</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Is This For You? */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center text-text-main">Is This For You?</h2>
                    <div className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-slate-200 shadow-lg">
                        <div className="bg-slate-50 p-10 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200">
                            <Hourglass size={48} className="text-slate-400 mb-4" />
                            <h3 className="text-xl font-bold text-text-main mb-4">The Holder</h3>
                            <ul className="space-y-3 text-text-sub text-sm">
                                <li>Waits for leads to arrive</li>
                                <li>Over-explains technical features</li>
                                <li>Give up after the first "No"</li>
                                <li>Comfortable with static income</li>
                            </ul>
                            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">To Avoid</p>
                        </div>
                        <div className="bg-white p-10 flex flex-col items-center text-center relative">
                            <div className="absolute inset-0 border-4 border-secondary/20 pointer-events-none"></div>
                            <Rocket size={48} className="text-secondary mb-4" />
                            <h3 className="text-xl font-bold text-text-main mb-4">The Hunter</h3>
                            <ul className="space-y-3 text-text-sub text-sm font-medium">
                                <li className="flex items-center justify-center gap-2"><CheckCircle size={14} className="text-secondary" /> Map out the city & walk in</li>
                                <li className="flex items-center justify-center gap-2"><CheckCircle size={14} className="text-secondary" /> Sells the business benefit (ROI)</li>
                                <li className="flex items-center justify-center gap-2"><CheckCircle size={14} className="text-secondary" /> Persistence is their superpower</li>
                                <li className="flex items-center justify-center gap-2"><CheckCircle size={14} className="text-secondary" /> Driven by recurring growth</li>
                            </ul>
                            <p className="mt-8 text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-4 py-1 rounded-full">To Join</p>
                        </div>
                    </div>
                </section>

                {/* The anra Edge */}
                <section className="mb-20">
                    <h2 className="text-2xl font-bold mb-8 text-center text-text-main">The anra Edge</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 size={24} className="text-primary" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Instant Tracking</h4>
                            <p className="text-text-sub text-sm">Real-time mobile dashboard to monitor every shop's status and your pending residuals.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Headphones size={24} className="text-secondary" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Direct Tech Support</h4>
                            <p className="text-text-sub text-sm">Dedicated channel to our engineering team. We fix issues so you can focus on sales.</p>
                        </div>
                        <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award size={24} className="text-primary" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">The Founder’s Club</h4>
                            <p className="text-text-sub text-sm">Top 5% of Partners get direct equity bonuses and quarterly strategy invites.</p>
                        </div>
                    </div>
                </section>

                {/* Get Started */}
                <section className="bg-slate-900 rounded-lg p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                    <div className="grid md:grid-cols-5 gap-12 items-center">
                        <div className="md:col-span-3">
                            <h2 className="text-3xl font-extrabold mb-6">Get Started in 24 Hours</h2>
                            <ul className="space-y-6 mb-10">
                                <li className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">1</span>
                                    <div>
                                        <p className="font-bold text-lg">Find 3 Restaurants</p>
                                        <p className="text-slate-400 text-sm">Identify three local spots that need a digital upgrade.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">2</span>
                                    <div>
                                        <p className="font-bold text-lg">Get Owner Details</p>
                                        <p className="text-slate-400 text-sm">Collect basic contact info and their current pain points.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">3</span>
                                    <div>
                                        <p className="font-bold text-lg">Submit & Close</p>
                                        <p className="text-slate-400 text-sm">Onboard them through the platform and earn your first $30.</p>
                                    </div>
                                </li>
                            </ul>
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-primary rounded-full text-white text-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/30 w-full md:w-auto disabled:opacity-70"
                            >
                                {isApplying ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                                {isAuthenticated ? 'Apply with CasperID' : 'Log in to Apply'}
                            </button>
                            <p className="mt-4 text-xs text-slate-500 text-center md:text-left">Apply using your CasperID for a 10-second magic experience.</p>
                        </div>
                        <div className="md:col-span-2 flex flex-col items-center">
                            <div className="bg-white p-6 rounded-2xl shadow-inner mb-4 w-48 h-48 flex flex-col items-center justify-center gap-4">
                                <div className="w-32 h-32 border-2 border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50">
                                    <QrCode size={48} className="text-slate-300" />
                                </div>
                                <p className="text-[10px] text-slate-800 font-bold uppercase tracking-tight text-center leading-tight">Scan to Submit<br />First Lead</p>
                            </div>
                            <p className="text-secondary text-sm font-bold">Fast-track your application</p>
                        </div>
                    </div>
                </section>
            </main>
            <FooterMarketing />
        </div>
    );
};

export default AffiliatePage;
