'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CompanyCard from '../../components/CompanyCard';
import SearchableSelect from '../../components/SearchableSelect';

const GCC_COUNTRIES = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // 'country' or 'all' or null
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'gcc-directory'
  const [selectedGccCountry, setSelectedGccCountry] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    sector: '',
    subSector: '',
    gcc: '',
    gccCountries: [],
  });
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

        // In GCC directory mode, filter by selected country only (no gcc toggle requirement)
        if (viewMode === 'gcc-directory' && selectedGccCountry) {
          params.append('gcc_country', selectedGccCountry);
        } else {
          // In all companies mode, use existing filters
          if (filters.gcc) params.append('gcc', filters.gcc);
          filters.gccCountries.forEach(c => params.append('gcc_country', c));
        }

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
  }, [filters, viewMode, selectedGccCountry]);

  useEffect(() => {
    fetch('/api/sectors')
      .then(r => r.json())
      .then(d => setSectors(d.sectors || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setSubSectors(d.subSectors || []))
      .catch(console.error);
  }, []);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleGccCountry = (country) => {
    setFilters(prev => ({
      ...prev,
      gccCountries: prev.gccCountries.includes(country)
        ? prev.gccCountries.filter(c => c !== country)
        : [...prev.gccCountries, country],
    }));
  };

  const clearFilters = () => {
    if (viewMode === 'gcc-directory') {
      setSelectedGccCountry('');
      setFilters({ search: '', sector: '', subSector: '', gcc: '', gccCountries: [] });
    } else {
      setFilters({ search: '', sector: '', subSector: '', gcc: '', gccCountries: [] });
    }
  };

  const handleDownloadDirectory = async (country) => {
    try {
      setDownloading(country);
      const url = `/api/companies/gcc-directory?country=${encodeURIComponent(country)}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to download directory');
        setDownloading(null);
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = country === 'all'
        ? 'gcc-all-countries-directory.pdf'
        : `${country.toLowerCase()}-company-directory.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setDownloading(null);
    } catch (error) {
      console.error('Error downloading directory:', error);
      alert('Failed to download directory. Please try again.');
      setDownloading(null);
    }
  };
  const hasActiveFilters = filters.search || filters.sector || filters.subSector || filters.gcc || filters.gccCountries.length > 0 || (viewMode === 'gcc-directory' && selectedGccCountry);

  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {viewMode === 'gcc-directory' && selectedGccCountry
                  ? `${selectedGccCountry} Company Directory`
                  : 'Company Directory'}
              </h1>
              <p className="text-secondary">
                {viewMode === 'gcc-directory' && selectedGccCountry
                  ? `Companies targeting ${selectedGccCountry} market`
                  : 'Browse and discover food companies registered with TDAP'}
              </p>
            </div>

            {/* View Mode Toggle & Download Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setViewMode('all');
                    setSelectedGccCountry('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-secondary hover:bg-white/20'
                    }`}
                >
                  All Companies
                </button>
                <button
                  onClick={() => setViewMode('gcc-directory')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'gcc-directory'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-secondary hover:bg-white/20'
                    }`}
                >
                  GCC Directory
                </button>
              </div>

              {/* Download Buttons */}
              {viewMode === 'gcc-directory' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedGccCountry && (
                    <Link
                      href={`/countries/${encodeURIComponent(selectedGccCountry)}`}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-white/10 text-secondary hover:bg-white/20 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      {selectedGccCountry} Profile
                    </Link>
                  )}
                  {selectedGccCountry && (
                    <button
                      onClick={() => handleDownloadDirectory(selectedGccCountry)}
                      disabled={downloading !== null}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${downloading === selectedGccCountry
                        ? 'bg-blue-500 text-white cursor-wait'
                        : downloading !== null
                          ? 'bg-blue-400 text-white cursor-not-allowed opacity-60'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {downloading === selectedGccCountry ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download {selectedGccCountry} Directory
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadDirectory('all')}
                    disabled={downloading !== null}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${downloading === 'all'
                      ? 'bg-purple-500 text-white cursor-wait'
                      : downloading !== null
                        ? 'bg-purple-400 text-white cursor-not-allowed opacity-60'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                  >
                    {downloading === 'all' ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download All GCC Directory
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
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

          {viewMode === 'gcc-directory' ? (
            /* GCC Directory Mode - Single Country Selector */
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select GCC Country Directory
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {GCC_COUNTRIES.map(country => {
                    const selected = selectedGccCountry === country;
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => setSelectedGccCountry(selected ? '' : country)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${selected
                          ? 'bg-green-600 text-white border-green-600 shadow-lg scale-105'
                          : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white hover:bg-white/20'
                          }`}
                      >
                        {selected && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {country}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional filters for GCC directory */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-secondary mb-2">Products</label>
                  <SearchableSelect
                    options={subSectors.map(ss => ({ value: ss.id, label: ss.name }))}
                    value={filters.subSector}
                    onChange={val => handleFilterChange('subSector', val)}
                    placeholder="All Products"
                  />
                </div>
              </div> */}
            </div>
          ) : (
            /* All Companies Mode - Original Filters */
            <>
              {/* Row 1 — dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
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
                  <label className="block text-sm font-medium text-secondary mb-2">Products</label>
                  <SearchableSelect
                    options={subSectors.map(ss => ({ value: ss.id, label: ss.name }))}
                    value={filters.subSector}
                    onChange={val => handleFilterChange('subSector', val)}
                    placeholder="All Products"
                  />
                </div>
              </div>

              {/* Row 2 — GCC country multi-select */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  GCC Target Countries
                  {filters.gccCountries.length > 0 && (
                    <span className="ml-2 text-xs font-semibold text-accent-green">
                      {filters.gccCountries.length} selected
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {GCC_COUNTRIES.map(country => {
                    const selected = filters.gccCountries.includes(country);
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleGccCountry(country)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${selected
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                          }`}
                      >
                        {selected && (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {country}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
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
                {viewMode === 'gcc-directory' && selectedGccCountry ? (
                  <>
                    Showing <span className="font-semibold text-white">{companies.length}</span> companies targeting{' '}
                    <span className="font-semibold text-accent-green">{selectedGccCountry}</span>
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold text-white">{companies.length}</span> companies
                  </>
                )}
              </p>
            </div>

            {viewMode === 'gcc-directory' && !selectedGccCountry ? (
              <div className="glass-card p-12 text-center">
                <p className="text-secondary text-lg mb-4">
                  Please select a GCC country to view its company directory.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {GCC_COUNTRIES.map(country => (
                    <button
                      key={country}
                      onClick={() => setSelectedGccCountry(country)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            ) : companies.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-secondary text-lg mb-4">
                  {viewMode === 'gcc-directory' && selectedGccCountry
                    ? `No companies found targeting ${selectedGccCountry}.`
                    : 'No companies found matching your filters.'}
                </p>
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
