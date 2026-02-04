import React, { useState } from 'react';

export default function CustomerTable({ data, onView }) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50; // Increased slightly for better density

    // PAGINATION LOGIC
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (data.length === 0) {
        return (
            <div className="admin-table-wrapper" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '18px', fontWeight: '700' }}>No matching records found.</p>
                <p style={{ fontSize: '14px' }}>Try adjusting your filters or search criteria.</p>
            </div>
        );
    }

    return (
        <div className="admin-table-wrapper">
            <div className="admin-table-scroll">
                <table className="admin-table-custom">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Account Type</th>
                            <th>Balance</th>
                            <th>Risk Assessment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((customer) => (
                            <tr
                                key={customer.customerId}
                                className={customer.isHighRisk ? 'high-risk' : ''}
                            >
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{customer.customerId}</td>
                                <td>
                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{customer.fullName}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{customer.email}</div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{customer.accountType}</td>
                                <td style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>₹{customer.balance.toLocaleString()}</td>
                                <td>
                                    <span
                                        className={`risk-badge risk-${customer.riskLevel.toLowerCase()}`}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            backgroundColor: customer.riskLevel === 'High' ? '#fee2e2' : customer.riskLevel === 'Medium' ? '#fef3c7' : '#dcfce7',
                                            color: customer.riskLevel === 'High' ? '#991b1b' : customer.riskLevel === 'Medium' ? '#92400e' : '#166534',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        {customer.riskLevel}
                                    </span>
                                    {customer.isFrozen && <span style={{ marginLeft: '8px', fontSize: '14px' }}>❄️</span>}
                                </td>
                                <td>
                                    <span style={{
                                        fontWeight: 700,
                                        color: customer.activeStatus === 'Active' ? '#10b981' : '#94a3b8'
                                    }}>
                                        {customer.activeStatus}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => onView(customer)} className="pg-btn">
                                        Surveillance
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="admin-pagination">
                <span className="pagination-info">
                    Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, data.length)} of {data.length} records
                </span>
                <div className="pagination-controls">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pg-btn"
                    >
                        Previous
                    </button>
                    <span className="pg-current">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pg-btn"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
