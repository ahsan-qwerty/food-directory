import Link from 'next/link';

export default function CompanyCard({ company }) {
  return (
    <Link href={`/companies/${company.id}`} className="block h-full">
      <div className="glass-card p-6 h-full flex flex-col justify-between cursor-pointer">

        <div>
          <h3 className="text-lg font-bold text-accent-green mb-2 leading-snug">
            {company.name}
          </h3>

          {company.representativeName && (
            <p className="text-sm text-secondary mb-2">
              <span className="font-semibold text-white/80">Representative:</span>{' '}
              {company.representativeName}
            </p>
          )}

          <p className="text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
            {company.profile || company.address || 'View details for more information.'}
          </p>

          {company.productsToBeDisplayed && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-white/70 mb-1 uppercase tracking-wide">Products</h4>
              <p className="text-xs text-secondary line-clamp-2">{company.productsToBeDisplayed}</p>
            </div>
          )}
        </div>

        <div>
          <div className="space-y-1 text-xs text-secondary border-t glass-divider pt-3 mt-3">
            {company.email && (
              <div className="truncate">
                <span className="font-semibold text-white/70">Email:</span> {company.email}
              </div>
            )}
            {company.website && (
              <div className="truncate">
                <span className="font-semibold text-white/70">Website:</span> {company.website}
              </div>
            )}
          </div>

          <div className="mt-3 text-sm text-accent-green font-medium flex items-center gap-1">
            View Full Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
