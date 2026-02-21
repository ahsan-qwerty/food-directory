'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DelegationCard from '../../components/DelegationCard';

function DelegationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab        = searchParams.get('tab') || 'incoming';
  const filterType = tab === 'outgoing' ? 'OUTGOING' : 'INCOMING';
  const isIncoming = tab === 'incoming';

  const [delegations, setDelegations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: filterType });
    if (filterStatus !== 'ALL') params.append('status', filterStatus);

    fetch(`/api/delegations?${params}`)
      .then(r => r.json())
      .then(d => setDelegations(d.delegations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterType, filterStatus]);

  const activeCount = delegations.filter(d => d.status === 'ACTIVE').length;
  const closedCount = delegations.filter(d => d.status === 'CLOSED').length;

  return (
    <div className="page-wrapper">
      <main className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Delegations Management
            </h1>
            <p className="text-secondary">
              Manage incoming and outgoing delegations with companies and budget tracking
            </p>
          </div>
          <button
            onClick={() => router.push(`/delegations/create?type=${filterType}`)}
            className="btn-primary px-6 py-2 whitespace-nowrap"
          >
            + Create Delegation
          </button>
        </div>

        {/* Tab Bar */}
        <div className="glass-tab-bar mb-6 flex">
          <Link
            href="/delegations?tab=incoming"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all -mb-px ${
              isIncoming ? 'glass-tab-active-incoming' : 'glass-tab-inactive'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            Incoming Delegations
          </Link>
          <Link
            href="/delegations?tab=outgoing"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all -mb-px ${
              !isIncoming ? 'glass-tab-active-outgoing' : 'glass-tab-inactive'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Outgoing Delegations
          </Link>
        </div>

        {/* Status Filter */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="glass-input px-3 py-2 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="ml-auto flex gap-5 text-sm">
              <div>
                <span className="text-secondary">Active: </span>
                <span className="font-semibold text-accent-green">{activeCount}</span>
              </div>
              <div>
                <span className="text-secondary">Closed: </span>
                <span className="font-semibold text-muted">{closedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
            <p className="mt-4 text-secondary">
              Loading {isIncoming ? 'incoming' : 'outgoing'} delegations…
            </p>
          </div>
        ) : delegations.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isIncoming ? 'icon-circle-blue' : 'badge-purple'
            }`}>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white text-lg font-medium">
              No {isIncoming ? 'incoming' : 'outgoing'} delegations found.
            </p>
            <p className="text-muted text-sm mt-1">
              {filterStatus !== 'ALL' ? 'Try changing the status filter.' : 'Create one to get started.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-secondary">
                Showing{' '}
                <span className="font-semibold text-white">{delegations.length}</span>{' '}
                {isIncoming ? 'incoming' : 'outgoing'} delegation{delegations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {delegations.map(delegation => (
                <DelegationCard key={delegation.id} delegation={delegation} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function DelegationsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-wrapper flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 glass-spinner"></div>
        </div>
      }
    >
      <DelegationsContent />
    </Suspense>
  );
}
