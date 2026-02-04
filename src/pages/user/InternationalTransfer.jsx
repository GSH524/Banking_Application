import React, { useState } from "react";


const InternationalTransfer = () => {
  const [amount, setAmount] = useState("1000");
  const [currency, setCurrency] = useState("USD");

  const rates = {
    USD: 83.25,
    EUR: 90.12,
    GBP: 105.45,
    AED: 22.67,
  };

  const calculated = (amount * rates[currency]).toFixed(2);

  return (
    <div className="intl-main">
      <h1 className="intl-title">International Transfers</h1>

      <div className="intl-grid">
        {/* CALCULATOR */}
        <div className="intl-card">
          <h2 className="card-label-intl">Exchange Calculator</h2>

          <div className="calc-container">
            <div className="input-group-intl">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input-intl"
              />

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="currency-select-intl"
              >
                {Object.keys(rates).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="equals-divider">=</div>

            <div className="result-box-intl">
              <span className="converted-value">₹ {calculated}</span>
              <span className="converted-label">Estimated INR Amount</span>
            </div>
          </div>

          <p className="rate-info-text">
            1 {currency} = ₹{rates[currency]} • Real-time Market Rate
          </p>

          <button className="initiate-btn-intl">Initiate Global Transfer</button>
        </div>

        {/* COUNTRIES */}
        <div className="intl-card">
          <h2 className="card-label-intl">Popular Destinations</h2>

          <div className="destinations-grid">
            {["USA", "UK", "UAE", "Canada", "Germany", "Singapore"].map(
              (country) => (
                <div key={country} className="destination-item">
                  <span className="dest-emoji">🌍</span>
                  <span className="dest-name">{country}</span>
                </div>
              )
            )}
          </div>

          <button className="view-all-btn">View All 180+ Countries</button>
        </div>

        {/* INFO */}
        <div className="intl-card full-width">
          <div className="intl-info-wrapper">
            <div className="intl-info-icon">🌐</div>
            <div className="intl-info-content">
              <h3>Fast & Secure Global Transfers</h3>
              <p>
                Send money to 180+ countries with competitive FX rates and no
                hidden charges. Most transfers complete within 24 hours with end-to-end tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalTransfer;
