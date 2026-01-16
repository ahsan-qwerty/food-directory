export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">TDAP Food Directory</h3>
            <p className="text-gray-300 text-sm">
              Trade Development Authority of Pakistan (TDAP) - Food Division
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Connecting Pakistani food exporters with global markets.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/companies" className="text-gray-300 hover:text-white transition-colors">
                  Browse Companies
                </a>
              </li>
              <li>
                <a href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Events & Exhibitions
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact TDAP</h3>
            <p className="text-gray-300 text-sm">
              Trade Development Authority of Pakistan
            </p>
            <p className="text-gray-300 text-sm mt-2">
              Email: info@tdap.gov.pk
            </p>
            <p className="text-gray-300 text-sm">
              Website: www.tdap.gov.pk
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Trade Development Authority of Pakistan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
