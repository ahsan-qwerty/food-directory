import Link from 'next/link';
import { getSectorName } from '@/data/sectors';

export default function CompanyCard({ company }) {
  return (
    <Link href={`/companies/${company.id}`} >
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
        <h3 className="text-xl font-bold text-green-700 mb-2">
          {company.company_name}
        </h3>
        
        <div className="mb-3">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            {getSectorName(company.interested_sector_id)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {company.company_profile}
        </p>
        
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Products:</h4>
          <div className="flex flex-wrap gap-1">
            {company.products_to_be_displayed.slice(0, 3).map((product, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {product}
              </span>
            ))}
            {company.products_to_be_displayed.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{company.products_to_be_displayed.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {company.certification && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">Certifications:</h4>
            <p className="text-xs text-gray-600">{company.certification}</p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-green-600 font-medium">
          View Full Profile →
        </div>
      </div>
    </Link>
  );
}
