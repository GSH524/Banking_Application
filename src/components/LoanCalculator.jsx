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
    <div className="loan-calculator glass">
      {/* LEFT SIDE */}
      <div className="loan-form">
        <h3 style={{color:"white"}}>Loan EMI calculator</h3>
        <p className="loan-sub">
          Estimate an approximate monthly instalment for a term loan based on
          the loan amount, interest rate, and tenure.
        </p>

        <div className="loan-field">
          <label>Loan amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <small>Enter the total principal amount you plan to borrow.</small>
        </div>

        <div className="loan-field">
          <label>Annual interest rate (percent per year)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <small>Use the nominal annual rate, not including fees.</small>
        </div>

        <div className="loan-field">
          <label>Tenure (months)</label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
          />
          <small>Total number of monthly instalments.</small>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="loan-results">
        <h4 style={{color:"white"}}>Estimated results</h4>

        <div className="result-row">
          <span style={{color:"white"}}>Approximate monthly EMI</span>
          <span className="result-value">
            ₹{emi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="result-row">
          <span style={{color:"white"}}>Total interest over tenure</span>
          <span className="result-value">
            ₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="result-row">
          <span style={{color:"white"}}>Total amount payable</span>
          <span className="result-value">
            ₹{totalPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="loan-disclaimer">
          The information on this site is provided solely for informational and
          educational purposes. It does not constitute financial or legal advice.
        </div>
      </div>
    </div>
  );
}
