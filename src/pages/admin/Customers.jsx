import React, { useState, useMemo } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';
import CustomerTable from '../../components/admin/CustomerTable';
import CustomerFilters from '../../components/admin/CustomerFilters';
import CustomerModal from '../../components/admin/CustomerModal';


export default function Customers() {
  const { data, loading, error } = useBankData();
  const { overrides, toggleFreeze, toggleFlag, addRemark } = useAdminActions();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({ search: '', riskLevel: 'All', status: 'All' });

  // MERGE OVERRIDES
  const processedData = useMemo(() => {
    return data.map(item => {
      const override = overrides[item.customerId];
      if (override) {
        return {
          ...item,
          isFrozen: override.isFrozen ?? item.isFrozen,
          isFlagged: override.flagged || false,
          riskLevel: override.flagged ? 'High' : item.riskLevel
        };
      }
      return item;
    });
  }, [data, overrides]);

  // FILTER
  const filteredData = useMemo(() => {
    return processedData.filter(customer => {
      if (filters.search && !customer.customerId.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.riskLevel !== 'All' && customer.riskLevel !== filters.riskLevel) return false;
      if (filters.status !== 'All' && customer.activeStatus !== filters.status) return false;
      return true;
    });
  }, [processedData, filters]);

  if (loading) return <div className="p-10 text-center">Loading Customer Directory...</div>;

  return (
    <div className="customers-main">
      <h1 className="customers-title">Customer Registry</h1>

      <CustomerFilters filters={filters} setFilters={setFilters} />

      <CustomerTable data={filteredData} onView={setSelectedCustomer} />

      <CustomerModal
        customer={selectedCustomer}
        overrides={selectedCustomer ? overrides[selectedCustomer.customerId] : {}}
        onAction={{ toggleFreeze, toggleFlag, addRemark }}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
