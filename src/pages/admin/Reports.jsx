import React from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';
import { FileEarmarkSpreadsheet } from 'react-bootstrap-icons';
import { feedbackService } from '../../services/feedbackService';

export default function Reports() {
  const { data, loading } = useBankData();
  const { overrides } = useAdminActions();

  const [tickets, setTickets] = React.useState([]);

  React.useEffect(() => {
    setTickets(feedbackService.getAllTickets());
    // Subscribe to changes
    const unsubscribe = feedbackService.subscribe(() => {
      setTickets(feedbackService.getAllTickets());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    feedbackService.updateTicketStatus(id, newStatus);
  };

  const handleExport = (type) => {
    let exportData = data;

    // Apply overrides logic for fresh data
    const merged = data.map(d => ({
      ...d,
      isFrozen: overrides[d.customerId]?.isFrozen ?? d.isFrozen,
      isHighRisk: overrides[d.customerId]?.flagged ? true : d.isHighRisk
    }));

    if (type === 'HIGH_RISK') {
      exportData = merged.filter(d => d.isHighRisk);
    } else if (type === 'FROZEN') {
      exportData = merged.filter(d => d.isFrozen);
    } else if (type === 'KYC_PENDING') {
      // Mock logic for kyc pending since overrides handle it
      const pendingIds = Object.keys(overrides).filter(id => overrides[id].kycStatus === 'Pending');
      exportData = merged.filter(d => pendingIds.includes(d.customerId));
    }

    const headers = ["Customer ID", "Name", "Email", "Balance", "Risk Level", "Status"];
    const rows = exportData.map(c => [
      c.customerId, c.fullName, c.email, c.balance, c.riskLevel, c.activeStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${type.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px', color: 'black', maxWidth: '1600px', margin: '0 auto' }}>
      <h1>Analytics & Reports</h1>
      <p style={{ color: '#94a3b8' }}>Generate compliant reports for audit and risk analysis.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '32px', marginBottom: '48px' }}>
        {/* EXISTING CARDS */}
        <div style={{ background: '#eef1f5ff', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3>High Risk Customers</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Export all customers flagged as high risk (Automated + Manual).</p>
          <button
            onClick={() => handleExport('HIGH_RISK')}
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}
          >
            <FileEarmarkSpreadsheet /> Download CSV
          </button>
        </div>

        <div style={{ background: '#eff1f4ff', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3>Frozen Accounts</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Details of all currently frozen or suspended accounts.</p>
          <button
            onClick={() => handleExport('FROZEN')}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}
          >
            <FileEarmarkSpreadsheet /> Download CSV
          </button>
        </div>

        <div style={{ background: '#f2f6fdff', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <h3>Full Database</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Complete snapshot of all customer records.</p>
          <button
            onClick={() => handleExport('ALL')}
            style={{ background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}
          >
            <FileEarmarkSpreadsheet /> Download CSV
          </button>
        </div>
      </div>

      {/* FEEDBACK SECTION */}
      <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        User Feedback & Support
        <span style={{ fontSize: '12px', background: '#d3dae3ff', padding: '4px 10px', borderRadius: '20px' }}>{tickets.length} Total</span>
      </h2>

      <div style={{ background: '#dee1e7ff', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#343944ff', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px' }}>Status</th>
              <th style={{ padding: '16px 24px' }}>Submission</th>
              <th style={{ padding: '16px 24px' }}>User Details</th>
              <th style={{ padding: '16px 24px' }}>Category</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No feedback tickets found.</td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} style={{ borderTop: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: ticket.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: ticket.status === 'Pending' ? '#facc15' : '#4ade80'
                    }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>{ticket.subject}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '400px', lineHeight: '1.4' }}>{ticket.message}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{new Date(ticket.createdAt).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#e2e8f0' }}>{ticket.userName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{ticket.userEmail}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{ticket.category}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {ticket.status === 'Pending' && (
                      <button
                        onClick={() => handleToggleStatus(ticket.id, ticket.status)}
                        style={{
                          padding: '6px 16px', background: '#2563eb', color: 'white', border: 'none',
                          borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        Mark Resolved
                      </button>
                    )}
                    {ticket.status === 'Resolved' && (
                      <button
                        onClick={() => handleToggleStatus(ticket.id, ticket.status)}
                        style={{
                          padding: '6px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569',
                          borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
                        }}
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
