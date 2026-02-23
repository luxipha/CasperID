import React from 'react';
import { FooterMarketing } from '../FooterMarketing';
import HeaderMarketing from '../HeaderMarketing';
import { Check, ShieldCheck, FileText, Award, ArrowRight } from 'lucide-react';

interface ApplySuccessPageProps {
    onReturnToCareers: () => void;
}

const ApplySuccessPage: React.FC<ApplySuccessPageProps> = ({ onReturnToCareers }) => {
    return (
        <div className="bg-bg-light min-h-screen">
            <HeaderMarketing />
            <div className="pt-28 pb-20 flex items-center justify-center px-4">
                <div className="max-w-3xl w-full bg-white rounded-[3rem] p-12 md:p-20 border border-gray-100 shadow-2xl shadow-primary/5 text-center relative overflow-hidden">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-primary/20 animate-fade-scale">
                        <Check size={48} strokeWidth={4} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight animate-fade-scale delay-100">
                        Application Submitted Successfully!
                    </h1>

                    <p className="text-lg text-text-sub mb-12 max-w-xl mx-auto leading-relaxed animate-fade-scale delay-200">
                        Thanks for applying using your CasperID. Your verified profile, including work experience, has been securely shared with our team in <span className="text-primary font-bold italic">under 10 seconds.</span>
                    </p>

                    {/* Summary Card */}
                    <div className="bg-slate-50 rounded-3xl p-8 text-left mb-12 animate-fade-scale delay-300">
                        <div className="mb-6">
                            <span className="text-[10px] font-black text-text-sub uppercase tracking-[0.2em] block mb-2">Applied For</span>
                            <h3 className="text-xl font-bold text-text-main">Senior Rust Engineer (Identity Protocol)</h3>
                        </div>

                        <div>
                            <span className="text-[10px] font-black text-text-sub uppercase tracking-[0.2em] block mb-4">Shared Data via CasperID</span>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Verified Identity', icon: ShieldCheck },
                                    { label: 'Professional Resume', icon: FileText },
                                    { label: 'Skills & Certifications', icon: Award }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
                                        <item.icon size={14} className="text-primary" />
                                        <span className="text-xs font-bold text-text-main">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="text-left max-w-xl mx-auto mb-12 animate-fade-scale delay-400">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                <ArrowRight size={20} />
                            </div>
                            <h4 className="text-xl font-black text-text-main tracking-tight">What happens now?</h4>
                        </div>

                        <ul className="space-y-6">
                            {[
                                'Our team will review your verified credentials.',
                                <>Track your application status directly in your <span className="text-primary font-bold cursor-pointer hover:underline">CasperID Dashboard</span>.</>,
                                'You will receive a notification at your linked email address.'
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-6 h-6 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-text-sub font-medium leading-relaxed">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-scale delay-500">
                        <button
                            onClick={onReturnToCareers}
                            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                        >
                            Return to Careers
                        </button>
                        <button className="px-10 py-4 bg-white border-2 border-gray-100 text-text-main rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                            Go to My Dashboard
                        </button>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                </div>
            </div>
            <FooterMarketing />
        </div>
    );
};

export default ApplySuccessPage;
