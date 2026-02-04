import React, { useState, useMemo } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Download, Filter, X } from 'react-bootstrap-icons';


export default function Transactions() {
  const { currentUser, loading } = useCurrentUser();
  const [filterType, setFilterType] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [page, setPage] = useState(1);

  // GET REAL TRANSACTIONS
  const allTransactions = useMemo(() => {
    if (!currentUser || !currentUser.transactions) return [];

    return currentUser.transactions.map(t => ({
      ...t,
      description: t.reason || (t.type === 'Deposit' ? 'Deposit' : 'Withdrawal'),
      date: new Date(t.date).toLocaleDateString(),
      status: 'Success'
    }));
  }, [currentUser]);

  // FILTER & PAGINATE
  const filteredTxns = useMemo(() => {
    return allTransactions.filter(t => filterType === 'All' || t.type === filterType);
  }, [allTransactions, filterType]);

  const pagedTxns = filteredTxns.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filteredTxns.length / 10);

  if (loading || !currentUser) return <div className="p-10 text-center">Loading Ledger...</div>;

  return (
    <div className="transactions-main">

      {/* HEADER & FILTERS */}
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <div className="transactions-controls">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="All">All Transactions</option>
            <option value="Credit">Credits Only</option>
            <option value="Debit">Debits Only</option>
          </select>
          <button className="export-btn">
            <Download /> Export
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {filteredTxns.length === 0 ? (
        <div className="table-container empty-transactions">
          <div className="empty-icon">💸</div>
          <h3 className="empty-title">No Transactions Yet</h3>
          <p className="empty-p">Your transaction history will appear here once you start using your account.</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Ref ID</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pagedTxns.map(txn => (
                  <tr key={txn.id} onClick={() => setSelectedTxn(txn)}>
                    <td>{txn.date}</td>
                    <td>
                      <div className="txn-desc-cell">
                        <div className={`txn-icon ${txn.type === 'Credit' ? 'credit' : 'debit'}`}>
                          {txn.type === 'Credit' ? '↓' : '↑'}
                        </div>
                        {txn.description}
                      </div>
                    </td>
                    <td className="txn-id-cell">{txn.id}</td>
                    <td className={`txn-amount-cell ${txn.type === 'Credit' ? 'credit' : ''}`}>
                      {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="txn-status-badge">Success</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="pagination-container">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="page-btn">Previous</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="page-btn">Next</button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTxn && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <X size={24} className="cursor-pointer" onClick={() => setSelectedTxn(null)} />
            </div>
            <div className="modal-body">
              <div className="modal-amount-hero">
                <h2 className={`amount-display ${selectedTxn.type === 'Credit' ? 'credit' : 'debit'}`}>
                  {selectedTxn.type === 'Credit' ? '+' : '-'}₹{selectedTxn.amount.toLocaleString()}
                </h2>
                <span className="status-label-pill">{selectedTxn.status}</span>
              </div>
              <div className="modal-detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{selectedTxn.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Merchant</span>
                  <span className="detail-value">{selectedTxn.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reference ID</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace' }}>{selectedTxn.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Closing Balance</span>
                  <span className="detail-value">₹{(selectedTxn.balanceAfter || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="receipt-btn">Download Receipt</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
