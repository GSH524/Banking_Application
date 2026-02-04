import React, { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { feedbackService } from '../../services/feedbackService';
import { ChatLeftQuote, Send, CheckCircle } from 'react-bootstrap-icons';


export default function Feedback() {
  const { currentUser } = useCurrentUser();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);

    const ticket = {
      userId: currentUser?.uid || 'guest',
      userName: currentUser?.displayName || currentUser?.firstName || 'Guest User',
      userEmail: currentUser?.email || 'N/A',
      subject,
      message,
      category
    };

    // Simulate network delay for better UX
    setTimeout(() => {
      feedbackService.addTicket(ticket);
      setLoading(false);
      setSubmitted(true);
      // Reset form
      setSubject('');
      setMessage('');
      setCategory('General');
    }, 800);
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-card success-state">
          <div className="success-icon-wrapper">
            <CheckCircle className="success-icon" />
          </div>
          <h2>Request Submitted!</h2>
          <p>
            Thank you for your feedback. Our support team has received your request
            and will review it shortly. You can submit another request if needed.
          </p>
          <button
            className="feedback-btn-primary"
            onClick={() => setSubmitted(false)}
          >
            Submit New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1><ChatLeftQuote /> Help & Support</h1>
        <p>Have a question or issue? We are here to help you 24/7.</p>
      </div>

      <div className="feedback-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="feedback-input"
            >
              <option value="General">General Inquiry</option>
              <option value="Technical">Technical Issue</option>
              <option value="Billing">Billing & Payments</option>
              <option value="Feature Request">Feature Request</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe the issue..."
              className="feedback-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us more about what you're experiencing..."
              className="feedback-input"
              required
            ></textarea>
          </div>

          <div className="form-note">
            <p>
              Submitting as: <strong>{currentUser?.displayName || currentUser?.email || 'Guest'}</strong>
            </p>
          </div>

          <button type="submit" className="feedback-btn-primary" disabled={loading}>
            {loading ? 'Sending...' : <><Send /> Submit Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}
