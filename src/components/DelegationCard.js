import Link from 'next/link';

// Status-colour map — all values reference CSS variables defined in globals.css
const STATUS_STYLES = {
    INCOMING: {
        headerBg: 'linear-gradient(135deg, rgba(37,99,235,0.55) 0%, rgba(59,130,246,0.40) 100%)',
        badgeClass: 'badge-blue',
        accentClass: 'text-accent-blue',
    },
    OUTGOING: {
        headerBg: 'linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(147,51,234,0.40) 100%)',
        badgeClass: 'badge-purple',
        accentClass: 'text-accent-blue',
    },
    CLOSED: {
        headerBg: 'linear-gradient(135deg, rgba(75,85,99,0.60) 0%, rgba(55,65,81,0.50) 100%)',
        badgeClass: 'badge-gray',
        accentClass: 'text-muted',
    },
};

export default function DelegationCard({ delegation }) {
    const country = delegation.type === 'INCOMING' ? delegation.fromCountry : delegation.toCountry;
    const countryLabel = delegation.type === 'INCOMING' ? 'From' : 'To';

    const key = delegation.status === 'CLOSED' ? 'CLOSED' : delegation.type;
    const style = STATUS_STYLES[key] ?? STATUS_STYLES.INCOMING;

    return (
        <Link href={`/delegations/${delegation.id}`} className="block h-full">
            <div className="glass-card overflow-hidden h-full flex flex-col cursor-pointer">

                {/* Card header */}
                <div className="p-5 text-white" style={{ background: style.headerBg }}>
                    <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                            {delegation.type}
                            {delegation.status === 'CLOSED' && ' · Closed'}
                        </span>
                        {delegation.status === 'CLOSED' && (
                            <span className="badge-gray text-xs">Closed</span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold mb-1 leading-snug">
                        {delegation.title || country || 'Delegation'}
                    </h3>
                    {delegation.title && country && (
                        <div className="flex items-center text-white/75 text-xs mb-1">
                            <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {country}
                        </div>
                    )}

                    {delegation.division && (
                        <div className="flex items-center text-white/75 text-xs mb-1">
                            <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            {delegation.division}
                        </div>
                    )}

                    {/* Show country row only when there's no title (already shown inline above when both exist) */}
                    {country && !delegation.title && (
                        <div className="flex items-center text-white/75 text-xs mb-1">
                            <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {country}
                        </div>
                    )}

                    {delegation.deskOfficer && (
                        <div className="flex items-center gap-1.5 text-sm mb-2">
                            <svg className="w-3.5 h-3.5 text-muted flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-secondary">{delegation.deskOfficer}</span>
                        </div>
                    )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Junction-table sectors (preferred) */}
                    {delegation.sectors && delegation.sectors.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {delegation.sectors.map((s) => (
                                <span key={s.id} className="badge-green text-xs">{s.name}</span>
                            ))}
                        </div>
                    )}
                    {/* Legacy text fallback for older records */}
                    {(!delegation.sectors || delegation.sectors.length === 0) && delegation.productSector && (
                        <p className="text-secondary text-sm mb-2">
                            <span className="font-semibold text-white/80">Product/Sector:</span>{' '}
                            {delegation.productSector}
                        </p>
                    )}

                    {delegation.expectedDelegates && (
                        <p className="text-secondary text-sm mb-2">
                            <span className="font-semibold text-white/80">Expected Delegates:</span>{' '}
                            {delegation.expectedDelegates}
                        </p>
                    )}

                    {delegation.allocatedBudget && (
                        <p className="text-secondary text-sm mb-2">
                            <span className="font-semibold text-white/80">Budget:</span>{' '}
                            PKR {Number(delegation.allocatedBudget).toLocaleString()}
                        </p>
                    )}

                    <div className="mt-auto pt-3 border-t glass-divider flex items-center justify-between">
                        <div className="text-xs text-secondary">
                            <span className="font-semibold text-white">
                                {delegation.participatingCompanyIds?.length ?? 0}
                            </span>{' '}
                            Companies
                        </div>
                        <div className={`font-medium text-sm flex items-center gap-1 ${style.accentClass}`}>
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
