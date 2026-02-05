import { useState, useEffect } from "react";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [amount, rate, tenure]);

  const calculateEMI = () => {
    const principal = Number(amount);
    const monthlyRate = rate / 12 / 100;
    const months = Number(tenure);

    if (principal && monthlyRate && months) {
      const emiValue =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      const totalPayment = emiValue * months;
      const interest = totalPayment - principal;

      setEmi(emiValue);
      setTotalPayable(totalPayment);
      setTotalInterest(interest);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl shadow-2xl">
        
        {/* LEFT SIDE: INPUT FORM */}
        <div className="p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5">
          <h3 className="text-2xl font-bold text-white mb-2">Loan EMI Calculator</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Estimate an approximate monthly instalment for a term loan based on
            the loan amount, interest rate, and tenure.
          </p>

          <div className="space-y-6">
            {/* Amount Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-blue-400">Loan amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
              />
              <small className="text-slate-500 italic">Total principal amount to borrow.</small>
            </div>

            {/* Interest Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-blue-400">Annual interest rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
              />
              <small className="text-slate-500 italic">Nominal annual rate, excluding fees.</small>
            </div>

            {/* Tenure Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-blue-400">Tenure (months)</label>
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-lg"
              />
              <small className="text-slate-500 italic">Total number of monthly instalments.</small>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: RESULTS DISPLAY */}
        <div className="p-8 md:p-12 bg-blue-600/5 flex flex-col justify-center">
          <h4 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Estimated Results</h4>

          <div className="space-y-8">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-sm">Approximate monthly EMI</span>
              <span className="text-3xl md:text-4xl font-black text-blue-400 tracking-tight">
                ₹{emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 text-xs uppercase tracking-widest">Total Interest</span>
                <span className="text-xl font-bold text-white">
                  ₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 text-xs uppercase tracking-widest">Total Payable</span>
                <span className="text-xl font-bold text-white">
                  ₹{totalPayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 p-4 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-500 leading-relaxed italic">
            <strong>Disclaimer:</strong> The information on this site is provided solely for informational and
            educational purposes. It does not constitute financial or legal advice.
          </div>
        </div>
      </div>
    </div>
  );
}