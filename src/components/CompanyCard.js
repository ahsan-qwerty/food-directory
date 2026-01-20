import Link from 'next/link';
import { getSectorName } from '@/data/sectors';
import { getSubSectorName } from '@/data/categories';
import { getProductName } from '@/data/subcategories';

export default function CompanyCard({ company }) {
  return (
    <Link href={`/companies/${company.id}`} >
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
        <h3 className="text-xl font-bold text-green-700 mb-2">
          {company.company_name}
        </h3>

        <div className="mb-3 flex flex-wrap gap-1">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {getSectorName(company.sector_id)}
          </span>
          {company.category_id && (
            <>
              {(Array.isArray(company.category_id) ? company.category_id : [company.category_id]).slice(0, 2).map((subSectorId, idx) => (
                <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {getSubSectorName(subSectorId)}
                </span>
              ))}
              {Array.isArray(company.category_id) && company.category_id.length > 2 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{company.category_id.length - 2} more
                </span>
              )}
            </>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {company.company_profile || company.company_competence}
        </p>

        {company.sub_category_ids && company.sub_category_ids.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">Products:</h4>
            <div className="flex flex-wrap gap-1">
              {company.sub_category_ids.slice(0, 3).map((subCatId, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {getProductName(subCatId)}
                </span>
              ))}
              {company.sub_category_ids.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{company.sub_category_ids.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {company.certification && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">Certifications:</h4>
            <p className="text-xs text-gray-600 line-clamp-1">{company.certification}</p>
          </div>
        )}

        <div className="mt-4 text-sm text-green-600 font-medium">
          View Full Profile →
        </div>
      </div>
    </Link>
  );
}
