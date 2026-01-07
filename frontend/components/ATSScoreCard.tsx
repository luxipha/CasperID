import React from 'react';

interface ATSScoreData {
    score: number;
    breakdown: {
        actionVerbs: number;
        metrics: number;
        keywords: number;
        contactInfo: number;
        formatting: number;
    };
    feedback: string[];
}

interface ATSScoreCardProps {
    data: ATSScoreData | null;
    className?: string;
    onClickReport?: () => void;
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({ data, className = '' }) => {
    if (!data) return null;

    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const scoreColor = getScoreColor(data.score);

    return (
        <div className={`bg-gradient-to-b from-indigo-800 to-indigo-950 rounded-[32px] p-6 text-white shadow-xl relative overflow-visible flex flex-col items-center gap-6 border border-white/5 ${className}`}>

            {/* Abstract Background Noise - constrained to inner visual but simpler to keep absolute */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none rounded-[32px]"></div>

            {/* Header */}
            <div className="w-full flex justify-between items-start z-10">
                <h3 className="text-lg font-bold">ATS Score</h3>
                <div className="p-2 bg-white/10 rounded-xl relative">
                    <span className="material-symbols-outlined text-yellow-400">psychology</span>
                </div>
            </div>

            {/* Circular Progress */}
            <div className="relative size-32 flex items-center justify-center z-10">
                {/* Background Circle */}
                <svg className="size-full -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                    {/* Progress Circle */}
                    <circle
                        cx="64" cy="64" r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className={`${scoreColor} transition-all duration-1000`}
                        strokeDasharray={`${data.score * 3.51} 351`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black">{data.score}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Score</span>
                </div>
            </div>

            {/* Stats List */}
            <div className="w-full space-y-3 z-10">
                {/* Action Verbs */}
                <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-between px-4 border border-white/5">
                    <span className="text-sm font-medium text-white/80">Action Verbs</span>
                    <span className={`text-sm font-black ${data.breakdown.actionVerbs >= 25 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {data.breakdown.actionVerbs}/25
                    </span>
                </div>

                {/* Keywords */}
                <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-between px-4 border border-white/5">
                    <span className="text-sm font-medium text-white/80">Keywords</span>
                    <span className={`text-sm font-black ${data.breakdown.keywords >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {data.breakdown.keywords}/20
                    </span>
                </div>

                {/* Metrics */}
                <div className="w-full h-12 bg-white/5 rounded-xl flex items-center justify-between px-4 border border-white/5">
                    <span className="text-sm font-medium text-white/80">Metrics</span>
                    <span className={`text-sm font-black ${data.breakdown.metrics >= 25 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {data.breakdown.metrics}/25
                    </span>
                </div>
            </div>

            {/* Button with Tooltip */}
            <div className="w-full relative group z-20">
                <button
                    className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group-hover:border-white/20"
                >
                    <span className="material-symbols-outlined text-yellow-300 text-lg">lightbulb</span>
                    Improvement Tips
                </button>

                {/* Tooltip Content */}
                {data.feedback.length > 0 ? (
                    <div className="absolute right-0 bottom-14 w-64 bg-gray-900 border border-white/10 p-4 rounded-2xl shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Suggested Actions</p>
                        <ul className="space-y-3">
                            {data.feedback.map((tip, idx) => (
                                <li key={idx} className="text-xs text-indigo-100 flex items-start gap-2 leading-relaxed">
                                    <span className="text-green-400 mt-0.5 text-[10px]">●</span> {tip}
                                </li>
                            ))}
                        </ul>
                        {/* Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-white/10 rotate-45"></div>
                    </div>
                ) : (
                    <div className="absolute right-0 bottom-14 w-48 bg-gray-900 border border-white/10 p-3 rounded-xl shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 text-center">
                        <p className="text-xs text-green-400 font-bold">Great job! Profile is optimized.</p>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-white/10 rotate-45"></div>
                    </div>
                )}
            </div>

        </div>
    );
};
