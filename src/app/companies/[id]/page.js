import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prismaClient';
import DeleteCompanyButton from './_components/DeleteCompanyButton';

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

export default async function CompanyProfilePage({ params, searchParams }) {
  const { id } = await params;
  const { dev } = await searchParams;
  const isDev = dev === '1';
  const companyId = Number(id);
  if (Number.isNaN(companyId)) notFound();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) notFound();

  // Fetch all sectors/sub-sectors from junction tables (multi-select)
  const [companySectors, companySubSectors, eventParticipations, delegationParticipations] = await Promise.all([
    prisma.companySector.findMany({
      where: { companyId },
      include: { sector: { select: { id: true, name: true } } },
    }),
    prisma.companySubSector.findMany({
      where: { companyId },
      include: { subSector: { select: { id: true, name: true } } },
    }),
    prisma.eventCompany.findMany({
      where: { companyId },
      include: {
        event: {
          select: {
            id: true, name: true, status: true,
            city: true, country: true, datesText: true,
            startDate: true, endDate: true, eventDate: true,
          },
        },
      },
      orderBy: { event: { eventDate: 'desc' } },
    }),
    prisma.delegationCompany.findMany({
      where: { companyId },
      include: {
        delegation: {
          select: {
            id: true, title: true, type: true, status: true,
            toCountry: true, fromCountry: true,
            startDate: true, endDate: true, division: true,
          },
        },
      },
      orderBy: { id: 'desc' },
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

            {/* Events participated in */}
            {eventParticipations.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Participation in TDAP Sponsored Events
                  <span className="ml-auto text-sm font-normal text-muted">{eventParticipations.length + delegationParticipations.length} total</span>
                </h2>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-blue shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Exhibitions
                    <span className="ml-auto text-sm font-normal text-muted">{eventParticipations.length} total</span>
                  </h3>
                  {eventParticipations.map(({ event }) => {
                    const dateLabel = event.datesText
                      || (event.startDate && event.endDate
                        ? `${new Date(event.startDate).toISOString().slice(0, 10)} – ${new Date(event.endDate).toISOString().slice(0, 10)}`
                        : event.eventDate
                          ? new Date(event.eventDate).toISOString().slice(0, 10)
                          : null);
                    const locationLabel = [event.city, event.country].filter(Boolean).join(', ') || null;
                    const statusColors = {
                      PLANNED: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
                      COMPLETED: 'border-green-500/40 text-green-300 bg-green-500/10',
                      CANCELLED: 'border-red-500/40 text-red-300 bg-red-500/10',
                    };
                    const statusLabels = { PLANNED: 'Planned', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm group-hover:text-accent-green transition-colors line-clamp-1">
                            {event.name}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {dateLabel && (
                              <span className="text-xs text-muted">{dateLabel}</span>
                            )}
                            {locationLabel && (
                              <span className="text-xs text-muted">{locationLabel}</span>
                            )}
                          </div>
                        </div>
                        {event.status && (
                          <span className={`shrink-0 self-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[event.status] || statusColors.PLANNED}`}>
                            {statusLabels[event.status] || event.status}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white mt-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-blue shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Delegations
                    <span className="ml-auto text-sm font-normal text-muted">{delegationParticipations.length} total</span>
                  </h3>
                  <div className="space-y-3">
                    {delegationParticipations.map(({ delegation }) => {
                      const typeLabels = { OUTGOING: 'Outgoing', INCOMING: 'Incoming' };
                      const statusColors = {
                        ACTIVE: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
                        CLOSED: 'border-green-500/40 text-green-300 bg-green-500/10',
                        CANCELLED: 'border-red-500/40 text-red-300 bg-red-500/10',
                      };
                      const statusLabels = { ACTIVE: 'Active', CLOSED: 'Closed', CANCELLED: 'Cancelled' };
                      const countryLabel = delegation.type === 'OUTGOING'
                        ? delegation.toCountry
                        : delegation.fromCountry;
                      const dateLabel = delegation.startDate && delegation.endDate
                        ? `${new Date(delegation.startDate).toISOString().slice(0, 10)} – ${new Date(delegation.endDate).toISOString().slice(0, 10)}`
                        : delegation.startDate
                          ? new Date(delegation.startDate).toISOString().slice(0, 10)
                          : null;
                      return (
                        <Link
                          key={delegation.id}
                          href={`/delegations/${delegation.id}`}
                          className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm group-hover:text-accent-blue transition-colors line-clamp-1">
                              {delegation.title || `${typeLabels[delegation.type] || delegation.type} Delegation`}
                              {delegation.division && (
                                <span className="font-normal text-muted"> — {delegation.division}</span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                              {typeLabels[delegation.type] && (
                                <span className="text-xs text-muted">{typeLabels[delegation.type]}</span>
                              )}
                              {countryLabel && (
                                <span className="text-xs text-muted">{countryLabel}</span>
                              )}
                              {dateLabel && (
                                <span className="text-xs text-muted">{dateLabel}</span>
                              )}
                            </div>
                          </div>
                          <span className={`shrink-0 self-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[delegation.status] || statusColors.ACTIVE}`}>
                            {statusLabels[delegation.status] || delegation.status}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Delegations participated in */}
            {/* {delegationParticipations.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-blue shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Delegations
                  <span className="ml-auto text-sm font-normal text-muted">{delegationParticipations.length} total</span>
                </h2>
                <div className="space-y-3">
                  {delegationParticipations.map(({ delegation }) => {
                    const typeLabels = { OUTGOING: 'Outgoing', INCOMING: 'Incoming' };
                    const statusColors = {
                      ACTIVE: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
                      CLOSED: 'border-green-500/40 text-green-300 bg-green-500/10',
                      CANCELLED: 'border-red-500/40 text-red-300 bg-red-500/10',
                    };
                    const statusLabels = { ACTIVE: 'Active', CLOSED: 'Closed', CANCELLED: 'Cancelled' };
                    const countryLabel = delegation.type === 'OUTGOING'
                      ? delegation.toCountry
                      : delegation.fromCountry;
                    const dateLabel = delegation.startDate && delegation.endDate
                      ? `${new Date(delegation.startDate).toISOString().slice(0, 10)} – ${new Date(delegation.endDate).toISOString().slice(0, 10)}`
                      : delegation.startDate
                        ? new Date(delegation.startDate).toISOString().slice(0, 10)
                        : null;
                    return (
                      <Link
                        key={delegation.id}
                        href={`/delegations/${delegation.id}`}
                        className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm group-hover:text-accent-blue transition-colors line-clamp-1">
                            {delegation.title || `${typeLabels[delegation.type] || delegation.type} Delegation`}
                            {delegation.division && (
                              <span className="font-normal text-muted"> — {delegation.division}</span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {typeLabels[delegation.type] && (
                              <span className="text-xs text-muted">{typeLabels[delegation.type]}</span>
                            )}
                            {countryLabel && (
                              <span className="text-xs text-muted">{countryLabel}</span>
                            )}
                            {dateLabel && (
                              <span className="text-xs text-muted">{dateLabel}</span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 self-center text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[delegation.status] || statusColors.ACTIVE}`}>
                          {statusLabels[delegation.status] || delegation.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )} */}
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

            {/* Manage Company */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Manage Company</h3>
              <div className="flex flex-col gap-3">
                <Link
                  href={`/companies/${company.id}/edit`}
                  className="btn-outline px-4 py-2 text-sm text-center"
                >
                  Edit Company Details
                </Link>
                {isDev && (
                  <div className="pt-2 mt-1 border-t border-red-500/20">
                    <DeleteCompanyButton companyId={company.id} companyName={company.name} />
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
