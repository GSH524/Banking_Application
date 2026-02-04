import React, { useMemo } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';

export default function Accounts() {
  const { data, loading } = useBankData();
  const { overrides, toggleFreeze } = useAdminActions();

  // Similar to Dashboard but simplified for Account focus
  const processedData = useMemo(() => {
    return data.slice(0, 100).map(item => {
      const override = overrides[item.customerId];
      return {
        ...item,
        isFrozen: override?.isFrozen ?? item.isFrozen
      };
    });
  }, [data, overrides]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px',color: 'black' }}>
      <h1>Active Accounts</h1>
      <div style={{ marginTop: '20px' }}>
        <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Account Holder</th>
              <th style={{ padding: '12px' }}>Type</th>
              <th style={{ padding: '12px' }}>Balance</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(acc => (
              <tr key={acc.customerId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{acc.fullName}</td>
                <td style={{ padding: '12px' }}>{acc.accountType}</td>
                <td style={{ padding: '12px' }}>₹{acc.balance.toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  {!acc.isFrozen ? (
                    <span style={{ color: 'green' }}>● Active</span>
                  ) : (
                    <span style={{ color: 'red' }}>● Frozen</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => toggleFreeze(acc.customerId, acc.isFrozen)}
                    style={{
                      padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', border: 'none',
                      background: acc.isFrozen ? '#22c55e' : '#f43f5e',
                      color: 'white'
                    }}
                  >
                    {acc.isFrozen ? 'Activate' : 'Freeze'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
