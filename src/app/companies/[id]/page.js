import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) return { title: 'Company Not Found' };

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return { title: 'Company Not Found' };

  return {
    title: `${company.name} - TDAP Food Directory`,
    description: (company?.profile || '').substring(0, 160),
  };
}

export default async function CompanyProfilePage({ params }) {
  const { id } = await params;
  const companyId = Number(id);
  if (Number.isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  // Fetch all sectors/sub-sectors from junction tables (multi-select)
  const [companySectors, companySubSectors] = await Promise.all([
    prisma.companySector.findMany({
      where: { companyId },
      include: { sector: { select: { id: true, name: true } } },
    }),
    prisma.companySubSector.findMany({
      where: { companyId },
      include: { subSector: { select: { id: true, name: true } } },
    }),
  ]);

  // Fall back to the legacy single-FK fields for older records that predate the junction tables
  const allSectors = companySectors.length > 0
    ? companySectors.map(cs => cs.sector)
    : company.sectorId
      ? [await prisma.sector.findUnique({ where: { id: company.sectorId }, select: { id: true, name: true } })]
      : [];

  const allSubSectors = companySubSectors.length > 0
    ? companySubSectors.map(css => css.subSector)
    : company.subSectorId
      ? [await prisma.subSector.findUnique({ where: { id: company.subSectorId }, select: { id: true, name: true } })]
      : [];
  return (
    <div className="page-wrapper px-4">
      <main className="container mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex text-sm text-secondary mb-6 flex-wrap gap-1">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="mx-2 text-muted">/</span>
          <Link href="/companies" className="breadcrumb-link">Companies</Link>
          <span className="mx-2 text-muted">/</span>
          <span className="text-white">{company.name}</span>
        </nav>

        {/* Company Header */}
        <div className="glass-card p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {company.name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {allSectors.filter(Boolean).map(s => (
              <span key={s.id} className="badge-green">{s.name}</span>
            ))}
            {allSubSectors.filter(Boolean).map(ss => (
              <span key={ss.id} className="badge-blue">{ss.name}</span>
            ))}
          </div>
          {company.address && (
            <p className="text-secondary">{company.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Company Profile</h2>
              <p className="text-secondary leading-relaxed whitespace-pre-line">
                {company.profile || '—'}
              </p>
            </div>

            {company.productsToBeDisplayed && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Products To Be Displayed</h2>
                <p className="text-secondary whitespace-pre-line">{company.productsToBeDisplayed}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                {company.address && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Address</h3>
                    <p className="text-secondary text-sm">{company.address}</p>
                  </div>
                )}
                {company.email && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Email</h3>
                    <a href={`mailto:${company.email}`} className="text-accent-green hover:underline text-sm break-all">
                      {company.email}
                    </a>
                  </div>
                )}
                {company.website && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Website</h3>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline text-sm break-all"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Representative */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Representative</h2>
              <div className="space-y-3">
                {company.representativeName ? (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Name</h3>
                    <p className="text-secondary">{company.representativeName}</p>
                  </div>
                ) : (
                  <p className="text-muted text-sm">—</p>
                )}
                {company.representativeTel && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Phone</h3>
                    <a href={`tel:${company.representativeTel}`} className="text-accent-green hover:underline">
                      {company.representativeTel}
                    </a>
                  </div>
                )}
                {company.representativeWhatsapp && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">WhatsApp</h3>
                    <a
                      href={`https://wa.me/${company.representativeWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-green hover:underline"
                    >
                      {company.representativeWhatsapp}
                    </a>
                  </div>
                )}
                {company.representativeEmail && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Email</h3>
                    <a href={`mailto:${company.representativeEmail}`} className="text-accent-green hover:underline text-sm break-all">
                      {company.representativeEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card-strong p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                Interested in this company?
              </h3>
              <p className="text-secondary text-sm mb-4">
                Contact them directly using the information provided above.
              </p>
              <Link href="/companies" className="btn-primary px-6 py-2 inline-block">
                Browse More Companies
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
