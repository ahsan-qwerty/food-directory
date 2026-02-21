'use client';

import { useState, useEffect } from 'react';
import CompanyCard from '../../components/CompanyCard';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', sector: '', subSector: '' });
  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('q', filters.search);
        if (filters.sector) params.append('sector', filters.sector);
        if (filters.subSector) params.append('sub_sector', filters.subSector);
        const res = await fetch(`/api/companies?${params}`);
        const data = await res.json();
        setCompanies(data.companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [filters]);

  useEffect(() => {
    fetch('/api/sectors')
      .then(r => r.json())
      .then(d => setSectors(d.sectors || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.sector) params.append('sector_id', filters.sector);
    fetch(`/api/categories?${params}`)
      .then(r => r.json())
      .then(d => setSubSectors(d.subSectors || []))
      .catch(console.error);
  }, [filters.sector]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'sector' ? { subSector: '' } : {}),
    }));
  };

  const clearFilters = () => setFilters({ search: '', sector: '', subSector: '' });
  const hasActiveFilters = filters.search || filters.sector || filters.subSector;

  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Company Directory
          </h1>
          <p className="text-secondary">
            Browse and discover food companies registered with TDAP
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-white">Filter Companies</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Search</label>
              <input
                type="text"
                placeholder="Company name, email, website…"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="glass-input w-full px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Sector</label>
              <select
                value={filters.sector}
                onChange={e => handleFilterChange('sector', e.target.value)}
                className="glass-input w-full px-3 py-2"
              >
                <option value="">All Sectors</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Sub-Sector</label>
              <select
                value={filters.subSector}
                onChange={e => handleFilterChange('subSector', e.target.value)}
                className="glass-input w-full px-3 py-2"
                disabled={!filters.sector}
              >
                <option value="">
                  {filters.sector ? 'All Sub-Sectors' : 'Select a sector first'}
                </option>
                {subSectors.map(ss => (
                  <option key={ss.id} value={ss.id}>{ss.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
            <p className="mt-4 text-secondary">Loading companies…</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-secondary">
                Showing <span className="font-semibold text-white">{companies.length}</span> companies
              </p>
            </div>

            {companies.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-secondary text-lg mb-4">No companies found matching your filters.</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary px-6 py-2"
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
