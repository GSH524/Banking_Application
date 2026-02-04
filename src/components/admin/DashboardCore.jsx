import React from 'react';
import DashboardStats from './DashboardStats';
import AdminAnalytics from './AdminAnalytics';
import AuditLogPanel from './AuditLogPanel';

import { NavLink } from 'react-router-dom';
import { ArrowRight, ExclamationTriangle, FileText, CreditCard, CheckCircle, XCircle } from 'react-bootstrap-icons';

export default function DashboardCore({
    role = 'ADMIN',
    data = [],
    pendingUsers = [],
    loadingUsers = false,
    approveUser,
    rejectUser,
    auditLogs = []
}) {
    const isAdmin = role === 'ADMIN';

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8 text-slate-800">
            {/* HEADER */}
            <div className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h1>
                <p className="text-slate-500 font-medium">Live Operations & Security Overview</p>
            </div>

            {/* ROW 1: OVERVIEW METRICS */}
            <section>
                <DashboardStats data={data} />
            </section>

            {/* ANALYTICS SECTION */}
            <section>
                <AdminAnalytics data={data} />
            </section>

            {/* ADMIN ONLY SECTIONS */}
            {isAdmin && (
                <>
                    {/* ROW 2: RISK & ALERTS */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Risk & Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* CARD 1: HIGH RISK */}
                            <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                        <ExclamationTriangle size={24} />
                                    </div>
                                    <NavLink to="/admin/customers" className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                                        View All <ArrowRight size={12} />
                                    </NavLink>
                                </div>
                                <span className="text-sm font-medium text-slate-500">High Risk Accounts</span>
                                <div className="text-3xl font-bold text-slate-900 my-1">
                                    {data.filter(d => d.isHighRisk).length}
                                </div>
                                <p className="text-xs font-bold text-red-500 uppercase">Immediate Attention Required</p>
                            </div>

                            {/* CARD 2: KYC PENDING */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <NavLink to="/admin/kyc" className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                                        Review Queue <ArrowRight size={12} />
                                    </NavLink>
                                </div>
                                <span className="text-sm font-medium text-slate-500">Pending KYC</span>
                                <div className="text-3xl font-bold text-slate-900 my-1">{data.length}</div>
                                <p className="text-xs font-bold text-amber-500 uppercase">Identity Verifications</p>
                            </div>

                            {/* CARD 3: CARD REQUESTS */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <CreditCard size={24} />
                                    </div>
                                    <NavLink to="/admin/cards" className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                                        Manage <ArrowRight size={12} />
                                    </NavLink>
                                </div>
                                <span className="text-sm font-medium text-slate-500">New Card Requests</span>
                                <div className="text-3xl font-bold text-slate-900 my-1">12</div>
                                <p className="text-xs font-bold text-emerald-500 uppercase">+4 Recent Requests</p>
                            </div>
                        </div>
                    </section>

                    {/* USER APPROVAL SECTION */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Pending Approvals</h3>
                        {loadingUsers ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center animate-pulse text-slate-400">
                                Loading queue...
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
                                <CheckCircle size={40} className="text-emerald-500" />
                                <p className="font-bold text-slate-600">Approval queue clear</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {pendingUsers.map((user) => (
                                    <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-300 transition-colors">
                                        <div className="text-center md:text-left">
                                            <h4 className="font-bold text-slate-900">{user.firstName} {user.lastName}</h4>
                                            <p className="text-sm text-slate-500">{user.email} • <span className="font-semibold">{user.accountType}</span></p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Requested: {user.createdAt?.toDate().toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => approveUser(user.id)} 
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => rejectUser(user.id)} 
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* AUDIT LOG & SYSTEM STATUS */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <AuditLogPanel logs={auditLogs} />
                        </div>

                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">System Health</h3>
                            <div className="space-y-6 flex-grow">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <span className="text-sm text-slate-300">Banking Engine</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> ONLINE
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <span className="text-sm text-slate-300">Firestore DB</span>
                                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> CONNECTED
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                    <span className="text-sm text-slate-300">API Latency</span>
                                    <span className="text-xs font-bold text-blue-400 font-mono">18ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300">Last Backup</span>
                                    <span className="text-xs font-semibold text-slate-500 text-right">6 mins ago</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                                VajraOS v2.9.5-PRO
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}