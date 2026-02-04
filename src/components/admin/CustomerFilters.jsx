import React from 'react';
import { Search } from 'react-bootstrap-icons';

export default function CustomerFilters({ filters, setFilters }) {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="admin-filters-container">
            {/* Search Section */}
            <div className="admin-search-wrapper">
                <Search className="search-icon" />
                <input
                    type="text"
                    name="search"
                    placeholder="Search by Customer ID..."
                    value={filters.search}
                    onChange={handleChange}
                    className="admin-search-input"
                />
            </div>

            {/* Filters Section */}
            <div className="admin-dropdowns-wrapper">
                <select
                    name="riskLevel"
                    value={filters.riskLevel}
                    onChange={handleChange}
                    className="admin-filter-select"
                >
                    <option value="All">All Risks</option>
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                </select>

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="admin-filter-select"
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
        </div>
    );
}
