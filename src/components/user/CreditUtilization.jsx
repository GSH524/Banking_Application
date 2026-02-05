import React, { useEffect, useState } from 'react';
import { InfoCircle } from 'react-bootstrap-icons';

const CreditUtilization = ({ used, limit }) => {
    const [progress, setProgress] = useState(0);
    const utilization = limit > 0 ? (used / limit) * 100 : 0;
    const cappedUtilization = Math.min(100, Math.max(0, utilization));

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(cappedUtilization);
        }, 100);
        return () => clearTimeout(timer);
    }, [cappedUtilization]);

    const getStatusLabel = (val) => {
        if (val <= 30) return { label: 'Excellent', color: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-400/10' };
        if (val <= 50) return { label: 'Good', color: 'text-blue-400', stroke: '#3b82f6', bg: 'bg-blue-400/10' };
        if (val <= 75) return { label: 'High Usage', color: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-400/10' };
        return { label: 'Critical', color: 'text-rose-500', stroke: '#f43f5e', bg: 'bg-rose-500/10' };
    };

    const status = getStatusLabel(utilization);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    if (!limit || limit === 0) {
        return (
            <div className="h-[350px] p-10 flex flex-col items-center justify-center text-center bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/10 group hover:border-indigo-500/50 transition-all duration-500">
                <div className="text-5xl mb-6 opacity-30 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500">💳</div>
                <h4 className="text-white text-lg font-black uppercase tracking-tighter italic">No Active Credit</h4>
                <p className="text-slate-500 text-sm mt-2 max-w-[200px] leading-relaxed font-medium">Apply for a Vajra asset to initialize credit monitoring.</p>
            </div>
        );
    }

    return (
        <div className="h-[350px] p-6 flex flex-col justify-between bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 group">
            
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h4 className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase">Credit Utilization</h4>
                <div className="relative group/tooltip cursor-help">
                    <InfoCircle size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-950 text-white text-[10px] font-bold text-center rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all border border-white/10 shadow-xl z-20">
                        Lower utilization improves your tactical score.
                    </span>
                </div>
            </div>

            {/* PROGRESS RING */}
            <div className="relative flex items-center justify-center flex-1">
                <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {/* Background Track */}
                    <circle
                        cx="90" cy="90" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-white/[0.03]"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="90" cy="90" r={radius}
                        fill="none"
                        stroke={status.stroke}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        className="transition-all duration-1000 ease-out"
                        style={{
                            strokeDashoffset: offset,
                            strokeLinecap: 'round',
                        }}
                        transform="rotate(-90 90 90)"
                    />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className={`text-4xl font-black italic tracking-tighter leading-none ${status.color}`}>
                        {Math.round(utilization)}%
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        {status.label}
                    </span>
                </div>
            </div>

            {/* DETAILS FOOTER */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deployed Funds</span>
                    <span className="text-xs font-bold text-white font-mono">₹{used.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Capacity</span>
                    <span className="text-xs font-bold text-slate-300 font-mono">₹{limit.toLocaleString()}</span>
                </div>
                
                {/* Visual indicator bar */}
                <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${status.bg}`} 
                        style={{ width: `${progress}%`, backgroundColor: status.stroke }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreditUtilization;