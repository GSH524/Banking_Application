import React from "react";


const Rewards = () => {
  const rewards = [
    { id: 1, title: "Amazon Voucher", points: 500, icon: "🌟", color: "#FF9900" },
    { id: 2, title: "Fuel Cashback", points: 250, icon: "⛽", color: "#10b981" },
    { id: 3, title: "Movie Tickets", points: 400, icon: "🎬", color: "#ef4444" },
    { id: 4, title: "Starbucks Card", points: 300, icon: "☕", color: "#00704A" },
  ];

  return (
    <div className="rewards-main">
      <h1 className="rewards-title">Rewards & Offers</h1>

      {/* HERO */}
      <div className="rewards-hero">
        <div className="balance-info">
          <p className="balance-label">Vajra Points Balance</p>
          <h2 className="balance-value">
            2,450 <span className="pts-unit">Points</span>
          </h2>
        </div>

        <div className="hero-actions">
          <button className="hero-btn secondary">History</button>
          <button className="hero-btn primary">Redeem Points</button>
        </div>
      </div>

      {/* OFFERS */}
      <h2 className="rewards-section-title">Exclusive Offers</h2>

      <div className="rewards-grid">
        {rewards.map((r) => (
          <div key={r.id} className="reward-card">
            <div
              className="reward-icon-box"
              style={{
                background: `${r.color}15`,
                color: r.color,
              }}
            >
              {r.icon}
            </div>

            <h3 className="reward-item-title">{r.title}</h3>
            <p className="reward-item-pts">{r.points} Points Required</p>

            <button className="redeem-btn">Redeem Now</button>
          </div>
        ))}
      </div>

      {/* REFERRAL */}
      <div className="referral-banner">
        <div className="referral-info">
          <h3>Refer a Friend</h3>
          <p>
            Earn 1,000 bonus points per successful referral.
          </p>
        </div>

        <button className="invite-btn">Invite Friends</button>
      </div>
    </div>
  );
};

export default Rewards;
