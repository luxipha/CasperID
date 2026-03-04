import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { TrustScoreBreakdown, APPLY_THRESHOLD, getScoreGradient } from '../../utils/trustScore';

interface ProfileCompletionModalProps {
    score: TrustScoreBreakdown;
    jobTitle: string;
    onClose: () => void;
    onApplyAnyway: () => void;
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
    score,
    jobTitle,
    onClose,
    onApplyAnyway,
}) => {
    const navigate = useNavigate();
    const pct = score.total;
    const gradient = getScoreGradient(pct);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-scale">

                {/* Score Header */}
                <div className={`bg-gradient-to-br ${gradient} p-8 text-white text-center`}>
                    <div className="flex justify-end mb-2">
                        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                        <span className="text-3xl font-black">{pct}</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight mb-1">Profile Score Too Low</h2>
                    <p className="text-sm opacity-80">
                        You need <strong className="font-black">{APPLY_THRESHOLD}</strong>/100 to apply for
                        <br /><em>"{jobTitle}"</em>
                    </p>
                </div>

                {/* Score Bar */}
                <div className="px-8 pt-5">
                    <div className="flex justify-between text-xs font-bold text-text-sub mb-1.5">
                        <span>Your Score: {pct}</span>
                        <span>Required: {APPLY_THRESHOLD}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {/* Threshold Marker */}
                    <div className="relative h-0" style={{ marginTop: '-6px' }}>
                        <div
                            className="absolute top-0 w-0.5 h-5 bg-gray-900 rounded-full"
                            style={{ left: `${APPLY_THRESHOLD}%`, transform: 'translateX(-50%)' }}
                        />
                    </div>
                </div>

                {/* Missing Items */}
                {score.missing.length > 0 && (
                    <div className="px-8 pt-5">
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-3">
                            Top Ways to Improve
                        </p>
                        <ul className="space-y-2">
                            {score.missing.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-text-sub font-medium">
                                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="p-8 space-y-3">
                    {/* Primary: Complete Profile */}
                    <button
                        onClick={() => { window.location.href = '/dashboard?view=profile'; }}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={18} />
                            <div className="text-left">
                                <div className="text-sm font-black">Complete Your Profile</div>
                                <div className="text-[11px] opacity-75">Add missing info to unlock Apply</div>
                            </div>
                        </div>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Secondary: Verify Identity */}
                    <button
                        onClick={() => { window.location.href = '/dashboard?view=kyc'; }}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-100 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={18} />
                            <div className="text-left">
                                <div className="text-sm font-black">Verify Your Identity</div>
                                <div className="text-[11px] opacity-75">Liveness or Full KYC = +15 to +25 pts</div>
                            </div>
                        </div>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Tertiary: Apply Anyway */}
                    <button
                        onClick={onApplyAnyway}
                        className="w-full text-center text-xs text-text-sub font-medium hover:text-text-main transition-colors py-2"
                    >
                        Apply anyway with incomplete profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;
