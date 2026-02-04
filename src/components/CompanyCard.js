import Link from 'next/link';

export default function CompanyCard({ company }) {
  return (
    <Link href={`/companies/${company.id}`} >
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
        <h3 className="text-xl font-bold text-green-700 mb-2">
          {company.name}
        </h3>

        {company.representativeName && (
          <div className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Representative:</span> {company.representativeName}
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {company.profile || company.address || 'View details'}
        </p>

        <div className="space-y-1 text-xs text-gray-600">
          {company.email && <div className="truncate"><span className="font-semibold">Email:</span> {company.email}</div>}
          {company.website && <div className="truncate"><span className="font-semibold">Website:</span> {company.website}</div>}
        </div>

        <div className="mt-4 text-sm text-green-600 font-medium">
          View Full Profile →
        </div>
      </div>
    </Link>
  );
}
