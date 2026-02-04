'use client';

import { useState, useEffect } from 'react';
import CompanyCard from '../../components/CompanyCard';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: ''
  });

  // Fetch companies based on filters
  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('q', filters.search);

        const res = await fetch(`/api/companies?${params}`);
        const data = await res.json();
        console.log('CompaniesPage DB companies:', data.companies[0]);
        setCompanies(data.companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: ''
    });
  };

  const hasActiveFilters = filters.search;

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Company Directory
          </h1>
          <p className="text-gray-600">
            Browse and discover food companies registered with TDAP
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Companies</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Company name, email, website..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-1 lg:col-span-3 flex items-end">
              <p className="text-sm text-gray-500">
                Sector/Sub-sector/Product filtering will be re-enabled once company-to-sector relations are added to the database.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{companies.length}</span> companies
              </p>
            </div>

            {companies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">No companies found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
