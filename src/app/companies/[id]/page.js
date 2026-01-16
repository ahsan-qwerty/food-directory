import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCompanyById } from '@/data/companies';
import { getSectorName } from '@/data/sectors';

export async function generateMetadata({ params }) {
  const company = getCompanyById(params.id);
  
  if (!company) {
    return {
      title: 'Company Not Found'
    };
  }

  return {
    title: `${company.company_name} - TDAP Food Directory`,
    description: company.company_profile.substring(0, 160),
    keywords: company.products_to_be_displayed.join(', '),
  };
}

export default function CompanyProfilePage({ params }) {
  const company = getCompanyById(params.id);

  if (!company || company.status !== 'Approved') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/companies" className="hover:text-green-700">Companies</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{company.company_name}</span>
          </nav>
        </div>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {company.company_name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  {getSectorName(company.interested_sector_id)}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  Since {company.year_of_incorporation}
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                  {company.no_of_employees} Employees
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Profile */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Profile</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {company.company_profile}
              </p>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {company.products_to_be_displayed.map((product, index) => (
                  <div 
                    key={index}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                  >
                    <p className="text-green-800 font-medium">{product}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Competence */}
            {company.company_competence && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Competencies</h2>
                <p className="text-gray-700">{company.company_competence}</p>
              </div>
            )}

            {/* Certifications */}
            {company.certification && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {company.certification.split(',').map((cert, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium"
                    >
                      {cert.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                {/* Address */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Address</h3>
                  <p className="text-gray-600 text-sm">{company.company_address}</p>
                </div>

                {/* Email */}
                {company.company_email_address && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Email</h3>
                    <a 
                      href={`mailto:${company.company_email_address}`}
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.company_email_address}
                    </a>
                  </div>
                )}

                {/* Website */}
                {company.web_address && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Website</h3>
                    <a 
                      href={company.web_address}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.web_address}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Person</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Name</h3>
                  <p className="text-gray-600">{company.person_name}</p>
                </div>

                {company.person_designation && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Designation</h3>
                    <p className="text-gray-600">{company.person_designation}</p>
                  </div>
                )}

                {company.person_cell_no && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Phone</h3>
                    <a 
                      href={`tel:${company.person_cell_no}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      {company.person_cell_no}
                    </a>
                  </div>
                )}

                {company.person_whatsapp_no && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/${company.person_whatsapp_no.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      {company.person_whatsapp_no}
                    </a>
                  </div>
                )}

                {company.person_email_address && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Email</h3>
                    <a 
                      href={`mailto:${company.person_email_address}`}
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.person_email_address}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                Interested in this company?
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Contact them directly using the information provided.
              </p>
              <Link 
                href="/companies"
                className="inline-block px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
              >
                Browse More Companies
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
