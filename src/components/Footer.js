export default function Footer() {
  return (
    <footer className="glass-footer px-4 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-lg font-bold text-white mb-3">TDAP Food Directory</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Trade Development Authority of Pakistan (TDAP) — Agro Food Division
            </p>
            <p className="text-secondary text-sm mt-2 leading-relaxed">
              Connecting Pakistani food exporters with global markets.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/companies" className="text-secondary hover:text-accent-green transition-colors">
                  Browse Companies
                </a>
              </li>
              <li>
                <a href="/events" className="text-secondary hover:text-accent-green transition-colors">
                  Events &amp; Exhibitions
                </a>
              </li>
              <li>
                <a href="/delegations?tab=incoming" className="text-secondary hover:text-accent-green transition-colors">
                  Incoming Delegations
                </a>
              </li>
              <li>
                <a href="/delegations?tab=outgoing" className="text-secondary hover:text-accent-green transition-colors">
                  Outgoing Delegations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Contact TDAP</h3>
            <p className="text-secondary text-sm">Trade Development Authority of Pakistan</p>
            <p className="text-secondary text-sm mt-2">
              Email:{' '}
              <a href="mailto:info@tdap.gov.pk" className="text-accent-green hover:underline">
                info@tdap.gov.pk
              </a>
            </p>
            <p className="text-secondary text-sm">
              Website:{' '}
              <a
                href="https://www.tdap.gov.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue hover:underline"
              >
                www.tdap.gov.pk
              </a>
            </p>
          </div>
        </div>

        <div className="border-t glass-divider mt-8 pt-6 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} Trade Development Authority of Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
