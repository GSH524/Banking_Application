import React, { useState } from "react";
import { CreditCard, QrCodeScan, PersonPlus, Wallet2, Send, LightningCharge } from 'react-bootstrap-icons';


const Payments = () => {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  const quickTransfers = [
    { id: 1, name: "Rahul S.", avatar: "RS" },
    { id: 2, name: "Priya K.", avatar: "PK" },
    { id: 3, name: "Amit V.", avatar: "AV" },
    { id: 4, name: "Sonia M.", avatar: "SM" },
  ];

  return (
    <div className="payments-main">
      <h1 className="payments-title"><Wallet2 className="text-blue-600 mb-1" /> Payments & Transfers</h1>

      <div className="payments-grid">
        {/* UPI CARD */}
        <div className="payment-card">
          <h2 className="card-title"><CreditCard className="mb-1" /> Your UPI ID</h2>

          <div className="upi-info-box">
            <span className="upi-id-text">mahesh@vajrabank</span>
            <button className="copy-btn">Copy</button>
          </div>

          <div className="qr-trigger-box">
            <div className="qr-icon"><QrCodeScan /></div>
            <p className="qr-hint">Show My QR Code</p>
          </div>
        </div>

        {/* QUICK TRANSFER */}
        <div className="payment-card">
          <h2 className="card-title"><LightningCharge className="mb-1 text-yellow-500" /> Quick Transfer</h2>

          <div className="quick-transfer-scroller">
            {quickTransfers.map((p) => (
              <div key={p.id} className="quick-person">
                <div className="person-avatar">{p.avatar}</div>
                <span className="person-name">{p.name}</span>
              </div>
            ))}
            <div className="add-person-btn"><PersonPlus /></div>
          </div>
        </div>

        {/* SEND MONEY */}
        <div className="payment-card full-width">
          <h2 className="card-title"><Send className="mb-1 rotate-45" /> Send Money</h2>

          <div className="transfer-form">
            <div className="form-group">
              <label className="form-label">Recipient</label>
              <input
                className="form-input"
                placeholder="UPI ID / Mobile / Account"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button className="pay-primary-btn">
              Proceed to Pay <Send className="ms-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
