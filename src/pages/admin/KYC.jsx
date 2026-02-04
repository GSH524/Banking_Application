import React, { useMemo } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';

export default function KYC() {
  const { data, loading } = useBankData();
  const { overrides, updateKYC } = useAdminActions();

  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      kycStatus: overrides[item.customerId]?.kycStatus || 'Pending'
    }));
  }, [data, overrides]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px', color: 'black' }}>
      <h1>KYC Verification Queue</h1>
      <div style={{ background: 'white', borderRadius: '8px', marginTop: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>ID Proof</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData.slice(0, 50).map(customer => (
              <tr key={customer.customerId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{customer.fullName}</strong><br />
                  <span style={{ fontSize: '12px', color: '#666' }}>{customer.customerId}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  AADHAAR: **** **** {Math.floor(1000 + Math.random() * 9000)}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                    background: customer.kycStatus === 'Verified' ? '#dcfce7' : customer.kycStatus === 'Rejected' ? '#fee2e2' : '#fef9c3',
                    color: customer.kycStatus === 'Verified' ? '#166534' : customer.kycStatus === 'Rejected' ? '#991b1b' : '#854d0e'
                  }}>
                    {customer.kycStatus}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {customer.kycStatus === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateKYC(customer.customerId, 'Verified')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => updateKYC(customer.customerId, 'Rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
