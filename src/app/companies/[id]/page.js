import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) {
    return { title: 'Company Not Found' };
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return {
      title: 'Company Not Found'
    };
  }

  return {
    title: `${company.name} - TDAP Food Directory`,
    description: (company?.profile || '').substring(0, 160),
  };
}

export default async function CompanyProfilePage({ params }) {
  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    notFound();
  }

  console.log('CompanyProfilePage DB company ::', company);

  // Fetch related sector and sub-sector using foreign keys on Company
  const [sector, subSector] = await Promise.all([
    company.sectorId
      ? prisma.sector.findUnique({ where: { id: company.sectorId } })
      : Promise.resolve(null),
    company.subSectorId
      ? prisma.subSector.findUnique({ where: { id: company.subSectorId } })
      : Promise.resolve(null),
  ]);

  // console.log('CompanyProfilePage DB company:', { ...company, sector, subSector });

  return (
    <div className="min-h-screen bg-gray-50 px-4">

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/companies" className="hover:text-green-700">Companies</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{company.name}</span>
          </nav>
        </div>

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {company.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {sector && (
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    {sector.name}
                  </span>
                )}
                {subSector && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                    {subSector.name}
                  </span>
                )}
              </div>
              {company.address && (
                <p className="text-gray-600">{company.address}</p>
              )}
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
                {company.profile || '—'}
              </p>
            </div>

            {company.productsToBeDisplayed && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Products To Be Displayed</h2>
                <p className="text-gray-700 whitespace-pre-line">{company.productsToBeDisplayed}</p>
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
                {company.address && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Address</h3>
                    <p className="text-gray-600 text-sm">{company.address}</p>
                  </div>
                )}

                {/* Email */}
                {company.email && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Email</h3>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {company.website && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Website</h3>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Representative</h2>

              <div className="space-y-3">
                {company.representativeName ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Name</h3>
                    <p className="text-gray-600">{company.representativeName}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">—</p>
                )}

                {company.representativeTel && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Phone</h3>
                    <a href={`tel:${company.representativeTel}`} className="text-green-600 hover:text-green-700">
                      {company.representativeTel}
                    </a>
                  </div>
                )}

                {company.representativeWhatsapp && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">WhatsApp</h3>
                    <a
                      href={`https://wa.me/${company.representativeWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      {company.representativeWhatsapp}
                    </a>
                  </div>
                )}

                {company.representativeEmail && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Email</h3>
                    <a
                      href={`mailto:${company.representativeEmail}`}
                      className="text-green-600 hover:text-green-700 text-sm break-all"
                    >
                      {company.representativeEmail}
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
    </div>
  );
}
