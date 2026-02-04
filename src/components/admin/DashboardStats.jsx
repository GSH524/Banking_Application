import React from 'react';

export default function DashboardStats({ data }) {
    // CALCULATE STATS
    const totalCustomers = data.length;
    const frozenCount = data.filter(d => d.isFrozen).length;
    const activeCount = data.filter(d => d.activeStatus === 'Active').length;
    const inactiveCount = data.filter(d => d.activeStatus === 'Inactive').length;

    // FORMAT CURRENCY
    const totalBalance = data.reduce((acc, curr) => acc + curr.balance, 0);
    const formattedBalance = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(totalBalance);

    return (
        <div className="admin-stats-grid">

            <div className="stat-card-admin">
                <p className="stat-label-admin">Total Customers</p>
                <h2 className="stat-value-admin">{totalCustomers.toLocaleString()}</h2>
                <p className="stat-trend-admin pos">+12% this month</p>
            </div>

            <div className="stat-card-admin liquidity">
                <p className="stat-label-admin">Total Liquidity</p>
                <h2 className="stat-value-admin" style={{ color: '#1e40af' }}>{formattedBalance}</h2>
                <p className="stat-trend-admin neut">Across all accounts</p>
            </div>

            <div className="stat-card-admin">
                <p className="stat-label-admin">Active Status</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <h2 className="stat-value-admin">{activeCount}</h2>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>/ {inactiveCount} Inactive</span>
                </div>
                <p className="stat-trend-admin pos">Healthy Ratio</p>
            </div>

            <div className="stat-card-admin">
                <p className="stat-label-admin" style={{ color: '#ef4444' }}>Frozen Accounts</p>
                <h2 className="stat-value-admin" style={{ color: '#ef4444' }}>{frozenCount.toLocaleString()}</h2>
                <p className="stat-trend-admin neut">Requires Review</p>
            </div>

        </div>
    );
}
