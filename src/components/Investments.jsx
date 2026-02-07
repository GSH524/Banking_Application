import React, { useState } from 'react';
import { 
  GraphUpArrow, 
  ShieldLock, 
  LightningCharge, 
  PieChart, 
  Gem, 
  ArrowRight, 
  CheckCircleFill, 
  GlobeCentralSouthAsia,
  BarChartSteps,
  Buildings
} from 'react-bootstrap-icons';

export default function Investments() {
  const [activeTab, setActiveTab] = useState('mutual-funds');

  const stats = [
    { label: "Assets Managed", value: "₹45,000Cr+" },
    { label: "Active Investors", value: "2.4M" },
    { label: "Avg. Returns", value: "14.2% p.a" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-['Outfit'] selection:bg-indigo-500/30">
      
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Gem className="text-indigo-400" size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Vajra Wealth Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Grow Wealth. <br />
            <span className="text-slate-500">With Precision.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Institutional-grade investment tools now at your fingertips. From automated SIPs to curated 
            equity portfolios, build your future with India's most advanced wealth engine.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
              Start Investing Now
            </button>
            <button className="px-8 py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
              Talk to Advisor
            </button>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-950/50 border border-white/5 rounded-[2.5rem] backdrop-blur-md">
          {stats.map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INVESTMENT CATEGORIES */}
      <section className="py-20 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Our Investment <span className="text-indigo-500">Verticals</span></h2>
              <p className="text-slate-500">Diversified instruments tailored for your risk appetite.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* MUTUAL FUNDS */}
            <div className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900/60 transition-all hover:border-indigo-500/30">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                <PieChart size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Direct Mutual Funds</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Invest in 2,500+ direct mutual funds with zero commission. Maximize your returns by up to 1.5% annually.</p>
              <ul className="space-y-3 mb-8">
                {['Paperless SIP Setup', 'Tax-Saver ELSS', 'Smart Rebalancing'].map(li => (
                  <li key={li} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <CheckCircleFill className="text-indigo-500" size={14} /> {li}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                Explore Funds <ArrowRight size={14} />
              </button>
            </div>

            {/* STOCKS */}
            <div className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900/60 transition-all hover:border-emerald-500/30">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                <GraphUpArrow size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Equity Markets</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Real-time trading on NSE & BSE. Advanced charting tools and expert research reports for informed decisions.</p>
              <ul className="space-y-3 mb-8">
                {['Intraday Leverage', 'GTT Orders', 'Curated Smallcases'].map(li => (
                  <li key={li} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <CheckCircleFill className="text-emerald-500" size={14} /> {li}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                Open Demat <ArrowRight size={14} />
              </button>
            </div>

            {/* CORPORATE BONDS */}
            <div className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900/60 transition-all hover:border-amber-500/30">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Buildings size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fixed Income</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Get steady returns with Corporate Bonds, G-Secs, and T-Bills. Higher interest rates than traditional FDs.</p>
              <ul className="space-y-3 mb-8">
                {['Sovereign Gold Bonds', 'Secured Debentures', 'Tax-Free Bonds'].map(li => (
                  <li key={li} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <CheckCircleFill className="text-amber-500" size={14} /> {li}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                View Bonds <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED: VAJRA QUANT PORTFOLIOS */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-white/10 rounded-[3rem] p-10 md:p-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                <LightningCharge /> Next-Gen Investing
              </div>
              <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                Vajra Quant <br />
                <span className="text-slate-500">AI Portfolios</span>
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Our proprietary AI models analyze 10,000+ data points daily to rebalance your equity portfolio. 
                Get institutional-level quantitative strategies starting at just ₹5,000.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-2xl font-black text-white">22.4%</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Model 3-Year CAGR</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-2xl font-black text-white">Active</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Risk Management</div>
                </div>
              </div>
              <button className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-400 transition-all">
                Access Quant Models
              </button>
            </div>
            <div className="relative">
              <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold">Portfolio Alpha</span>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase">Outperforming</div>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg opacity-80" />
                  ))}
                </div>
                <div className="mt-6 flex justify-around text-slate-600 font-mono text-[10px]">
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-6 p-6 bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl animate-bounce">
                <ShieldLock size={32} className="text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLOSURE */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600 text-[10px] leading-relaxed uppercase tracking-tighter">
            Investment in securities market are subject to market risks. Read all the related documents carefully before investing. 
            Mutual Fund investments are subject to market risks, read all scheme related documents carefully. 
            VajraBank Ltd. is a SEBI registered investment advisor INA000012345.
          </p>
        </div>
      </section>
    </div>
  );
}