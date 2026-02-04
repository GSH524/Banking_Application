import React, { useMemo, useState, useEffect } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';
import DashboardStats from '../../components/admin/DashboardStats';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import AuditLogPanel from '../../components/admin/AuditLogPanel';
import DashboardCore from '../../components/admin/DashboardCore';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ExclamationTriangle, FileText, CreditCard, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { userDB } from '../../firebaseUser';


export default function AdminDashboard() {
  const { data, loading, error } = useBankData();
  const { overrides, auditLogs } = useAdminActions();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch pending users from Firestore
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const q = query(collection(userDB, 'users'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        setPendingUsers(users);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchPendingUsers();
  }, []);

  // Approve user function
  const approveUser = async (userId) => {
    try {
      await updateDoc(doc(userDB, 'users', userId), {
        status: 'approved'
      });
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      console.log(`User ${userId} approved`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    }
  };

  // Reject user function
  const rejectUser = async (userId) => {
    try {
      await updateDoc(doc(userDB, 'users', userId), {
        status: 'rejected'
      });
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      console.log(`User ${userId} rejected`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Please try again.');
    }
  };

  const processedData = useMemo(() => {
    return data.map(item => {
      const override = overrides[item.customerId];
      if (override) {
        return {
          ...item,
          isFrozen: override.isFrozen ?? item.isFrozen,
          isHighRisk: override.flagged ? true : item.isHighRisk
        };
      }
      return item;
    });
  }, [data, overrides]);

  if (loading) return <div className="p-10 text-center">Loading Admin Surveillance...</div>;
  if (error) return <div className="p-10 text-red-500">System Error: {error}</div>;

  return (
    <main className="admin-dashboard-main">
      <DashboardCore
        role="ADMIN"
        data={processedData}
        pendingUsers={pendingUsers}
        loadingUsers={loadingUsers}
        approveUser={approveUser}
        rejectUser={rejectUser}
        auditLogs={auditLogs}
      />
    </main>
  );
}
