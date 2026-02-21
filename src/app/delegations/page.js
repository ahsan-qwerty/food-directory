'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DelegationCard from '../../components/DelegationCard';

function DelegationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tab = searchParams.get('tab') || 'incoming'; // 'incoming' or 'outgoing'
    const filterType = tab === 'outgoing' ? 'OUTGOING' : 'INCOMING';

    const [delegations, setDelegations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        setLoading(true);
        async function fetchDelegations() {
            try {
                const params = new URLSearchParams();
                params.append('type', filterType);
                if (filterStatus !== 'ALL') {
                    params.append('status', filterStatus);
                }

                const res = await fetch(`/api/delegations?${params.toString()}`);
                const data = await res.json();
                setDelegations(data.delegations || []);
            } catch (error) {
                console.error('Error fetching delegations:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDelegations();
    }, [filterType, filterStatus]);

    const activeCount = delegations.filter(d => d.status === 'ACTIVE').length;
    const closedCount = delegations.filter(d => d.status === 'CLOSED').length;

    const isIncoming = tab === 'incoming';
    const tabColor = isIncoming ? 'blue' : 'purple';

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Delegations Management
                        </h1>
                        <p className="text-gray-600">
                            Manage incoming and outgoing delegations with companies and budget tracking
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/delegations/create?type=${filterType}`)}
                        className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-medium"
                    >
                        + Create Delegation
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex border-b-2 border-gray-200">
                    <Link
                        href="/delegations?tab=incoming"
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 ${isIncoming
                            ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-lg'
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        Incoming Delegations
                    </Link>
                    <Link
                        href="/delegations?tab=outgoing"
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 ${!isIncoming
                            ? 'border-purple-600 text-purple-600 bg-purple-50 rounded-t-lg'
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Outgoing Delegations
                    </Link>
                </div>

                {/* Status Filter */}
                <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 text-gray-950 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="ml-auto flex gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Active: </span>
                                <span className="font-semibold text-green-600">{activeCount}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Closed: </span>
                                <span className="font-semibold text-gray-600">{closedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delegations Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                        <p className="mt-4 text-gray-600">Loading {isIncoming ? 'incoming' : 'outgoing'} delegations...</p>
                    </div>
                ) : delegations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isIncoming ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            <svg className={`w-8 h-8 ${isIncoming ? 'text-blue-500' : 'text-purple-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg font-medium">No {isIncoming ? 'incoming' : 'outgoing'} delegations found.</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {filterStatus !== 'ALL' ? `Try changing the status filter.` : `Create one to get started.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-gray-600">
                                Showing <span className="font-semibold">{delegations.length}</span> {isIncoming ? 'incoming' : 'outgoing'} delegation{delegations.length !== 1 ? 's' : ''}
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
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        }>
            <DelegationsContent />
        </Suspense>
    );
}
