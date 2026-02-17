'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DelegationCard from '../../components/DelegationCard';

export default function DelegationsPage() {
    const router = useRouter();
    const [delegations, setDelegations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL'); // ALL, INCOMING, OUTGOING
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, ACTIVE, CLOSED

    useEffect(() => {
        async function fetchDelegations() {
            try {
                const params = new URLSearchParams();
                if (filterType !== 'ALL') {
                    params.append('type', filterType);
                }
                if (filterStatus !== 'ALL') {
                    params.append('status', filterStatus);
                }

                const queryString = params.toString();
                const url = `/api/delegations${queryString ? `?${queryString}` : ''}`;

                const res = await fetch(url);
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

    const incomingCount = delegations.filter(d => d.type === 'INCOMING').length;
    const outgoingCount = delegations.filter(d => d.type === 'OUTGOING').length;
    const activeCount = delegations.filter(d => d.status === 'ACTIVE').length;
    const closedCount = delegations.filter(d => d.status === 'CLOSED').length;

    return (
        <div className="min-h-screen bg-gray-50 px-4">
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
                        onClick={() => router.push('/delegations/create')}
                        className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-medium"
                    >
                        + Create Delegation
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 text-gray-950 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="ALL">All Types</option>
                                <option value="INCOMING">Incoming</option>
                                <option value="OUTGOING">Outgoing</option>
                            </select>
                        </div>

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
                                <span className="text-gray-600">Incoming: </span>
                                <span className="font-semibold text-blue-600">{incomingCount}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Outgoing: </span>
                                <span className="font-semibold text-purple-600">{outgoingCount}</span>
                            </div>
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
                        <p className="mt-4 text-gray-600">Loading delegations...</p>
                    </div>
                ) : delegations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-600 text-lg">No delegations found.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-gray-600">
                                Showing <span className="font-semibold">{delegations.length}</span> delegation{delegations.length !== 1 ? 's' : ''}
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
