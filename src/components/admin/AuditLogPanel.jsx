import React from 'react';

export default function AuditLogPanel({ logs }) {
    return (
        <div className="audit-log-container">
            <h3 className="audit-log-title">
                🛡️ Operational Audit Log
            </h3>

            <div className="audit-log-list">
                {logs.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                        No actions recorded in current session.
                    </p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="audit-log-item">
                            <div className="audit-log-header">
                                <strong className="audit-log-action">{log.action.replace(/_/g, ' ')}</strong>
                                <span className="audit-log-time">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="audit-log-customer">
                                Customer: <span>{log.customerId}</span>
                            </div>
                            <div className="audit-log-details">
                                {log.details}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
