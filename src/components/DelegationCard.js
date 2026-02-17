import Link from 'next/link';

export default function DelegationCard({ delegation }) {
    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const countryLabel = delegation.type === 'INCOMING' ? 'From' : 'To';
    const statusColor = delegation.status === 'CLOSED'
        ? 'bg-gray-600'
        : delegation.type === 'INCOMING'
            ? 'bg-blue-600'
            : 'bg-purple-600';

    const statusTextColor = delegation.status === 'CLOSED'
        ? 'text-gray-100'
        : 'text-white';

    return (
        <Link href={`/delegations/${delegation.id}`}>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className={`bg-gradient-to-r ${statusColor} p-6 ${statusTextColor}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                            {delegation.type} {delegation.status === 'CLOSED' ? '(Closed)' : ''}
                        </span>
                        {delegation.status === 'CLOSED' && (
                            <span className="text-xs bg-gray-900 text-white bg-opacity-20 px-2 py-1 rounded">Closed</span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold mb-2">
                        {country || 'Delegation'}
                    </h3>

                    {delegation.division && (
                        <div className="flex items-center text-sm opacity-90 mb-1">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            {delegation.division}
                        </div>
                    )}

                    {country && (
                        <div className="flex items-center text-sm opacity-90">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {countryLabel}: {country}
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {delegation.productSector && (
                        <p className="text-gray-600 text-sm mb-2">
                            <span className="font-semibold">Product/Sector:</span> {delegation.productSector}
                        </p>
                    )}

                    {delegation.expectedDelegates && (
                        <p className="text-gray-600 text-sm mb-2">
                            <span className="font-semibold">Expected Delegates:</span> {delegation.expectedDelegates}
                        </p>
                    )}

                    {delegation.allocatedBudget && (
                        <p className="text-gray-700 text-sm mb-2">
                            <span className="font-semibold">Budget:</span> PKR {delegation.allocatedBudget.toLocaleString()}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-700">
                            <span className="font-semibold">{delegation.participatingCompanyIds?.length || 0}</span> Companies
                        </div>
                        <div className={`font-medium text-sm ${delegation.type === 'INCOMING' ? 'text-blue-600' : 'text-purple-600'}`}>
                            View Details →
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
