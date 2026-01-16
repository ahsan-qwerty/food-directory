import { NextResponse } from 'next/server';
import { 
  companies, 
  getCompanyById, 
  getApprovedCompanies,
  filterCompaniesBySector,
  filterCompaniesByProduct,
  filterCompaniesByCertification,
  searchCompanies,
  getAllProducts,
  getAllCertifications
} from '@/data/companies';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get single company by ID
  const id = searchParams.get('id');
  if (id) {
    const company = getCompanyById(id);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(company);
  }
  
  // Get filter options
  if (searchParams.get('action') === 'filters') {
    return NextResponse.json({
      products: getAllProducts(),
      certifications: getAllCertifications()
    });
  }
  
  // Apply filters
  const sector = searchParams.get('sector');
  const product = searchParams.get('product');
  const certification = searchParams.get('certification');
  const query = searchParams.get('q');
  
  let result = getApprovedCompanies();
  
  if (query) {
    result = searchCompanies(query);
  } else {
    if (sector) {
      result = filterCompaniesBySector(sector);
    }
    if (product) {
      result = result.filter(c => 
        c.products_to_be_displayed.some(p => 
          p.toLowerCase().includes(product.toLowerCase())
        )
      );
    }
    if (certification) {
      result = result.filter(c => 
        c.certification.toLowerCase().includes(certification.toLowerCase())
      );
    }
  }
  
  return NextResponse.json({
    companies: result,
    total: result.length
  });
}
