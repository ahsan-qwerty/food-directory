'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import logo from '../../public/logo.png';

export default function Header() {
  const router = useRouter();

  function renderUpdateLink(u) {
    const isStaticFile = typeof u.href === 'string' && u.href.startsWith('/update/');
    const encodedHref = typeof u.href === 'string' ? encodeURI(u.href) : u.href;
    const className = "inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-white transition-colors";

    // Static files (PDFs) should use a normal <a> so the browser opens/downloads it directly.
    if (isStaticFile) {
      return (
        <a
          key={u.id}
          href={encodedHref}
          download
          className={className}
          title={u.label}
        >
          <span className="px-2 py-0.5 rounded-full border border-sky-500/30 text-sky-300 bg-sky-500/10">
            {u.kind}
          </span>
          <span className="truncate max-w-[70vw] sm:max-w-none">{u.label}</span>
          <span className="text-muted">→</span>
        </a>
      );
    }

    return (
      <Link
        key={u.id}
        href={encodedHref}
        className={className}
        title={u.label}
      >
        <span className="px-2 py-0.5 rounded-full border border-sky-500/30 text-sky-300 bg-sky-500/10">
          {u.kind}
        </span>
        <span className="truncate max-w-[70vw] sm:max-w-none">{u.label}</span>
        <span className="text-muted">→</span>
      </Link>
    );
  }

  const updates = [
    {
      id: 'vessel-update-ssf-valence-v0074',
      label: 'Vessel Update – SSF VALENCE V-0074 – DOCX',
      href: '/update/Vessel Update.docx',
      kind: 'Vessel',
    },
    {
      id: 'cargo-ssf-valence-v0074',
      label: 'Cargo: SSF VALENCE V-0074 – Jeddah, ~500 TEUs, ETD 21 Apr 2026',
      href: '/updates#cargo-ssf-valence-v0074',
      kind: 'Cargo',
    },
    {
      id: 'oict-tariff-book-2026',
      label: 'OICT Tariff Book 2026 v1.0 – PDF',
      href: '/update/OICT-Tariff-Book-2026-v1.0.pdf',
      kind: 'Tariff',
    },
    {
      id: 'uae-alt-routes-2026-04-06',
      label: 'UAE Alternate Trade Routes (06 Apr 2026) – PDF',
      href: '/update/UAE Alternate Trade Routes_06-04-2026.pdf',
      kind: 'Freight',
    },
    {
      id: 'advisory-2026-04-01',
      label: 'Customer Advisory: Withholding of Ad-hoc Charges (1 Apr 2026)',
      href: '/updates#advisory-2026-04-01',
      kind: 'Advisory',
    },
  ];

  return (
    <header className="glass-header sticky top-0 z-50 px-4">
      {/* Updates marquee */}
      <div className="glass-marquee -mx-4 px-4">
        <div className="container mx-auto px-4">
          <div className="marquee py-2">
            <div className="marquee-inner" aria-label="Latest updates ticker">
              <div className="marquee-track">
                {updates.map(renderUpdateLink)}
                <span className="text-muted text-xs">•</span>
                <Link
                  href="/updates"
                  className="text-xs font-semibold text-accent-green hover:underline"
                  title="View all updates"
                >
                  View all updates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt="TDAP Logo"
              width={56}
              height={56}
              className="rounded-full shrink-0"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                Agro Food Division
              </h1>
              <p className="text-xs text-muted">Trade Development Authority of Pakistan</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-1 md:gap-2 items-center">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Home
            </Link>
            {/* <Link
              href="/companies"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Companies
            </Link> */}
            <Link
              href="/events"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Exhibitions
            </Link>
            {/* <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) { router.push(e.target.value); e.target.value = ''; } }}
              className="glass-input px-3 py-1.5 text-sm font-medium cursor-pointer"
            >
              <option value="" disabled>Seminars</option>
              <option value="/seminars">Seminars</option>
              <option value="/seminars?type=webinar">Webinars</option>
              <option value="/seminars?type=virtual-b2b">Virtual B2Bs</option>
            </select> */}
            {/* <Link
              href="/seminars"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Seminars/Webinars
            </Link>
            <Link
              href="/seminars?type=virtual-b2b"
              className="px-3 py-1.5 rounded-md text-secondary hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
            >
              Virtual B2B
            </Link>
            <select
              defaultValue=""
              onChange={(e) => { if (e.target.value) { router.push(e.target.value); e.target.value = ''; } }}
              className="glass-input px-3 py-1.5 text-sm font-medium cursor-pointer"
            >
              <option value="" disabled>Delegations</option>
              <option value="/delegations?tab=incoming">Incoming</option>
              <option value="/delegations?tab=outgoing">Outgoing</option>
            </select> */}
            <Link
              href="/register"
              className="btn-primary px-4 py-2 text-sm ml-2"
            >
              Register Company
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
