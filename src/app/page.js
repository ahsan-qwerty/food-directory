'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const metadata = {
  title: 'TDAP Food Directory - Pakistani Food Companies',
  description: 'Official directory of Pakistani food companies registered with Trade Development Authority of Pakistan (TDAP). Discover exporters, manufacturers, and suppliers in the food sector.',
  keywords: 'TDAP, Pakistan food export, food companies Pakistan, rice exporters, spices exporters, food directory'
};

export default function Home() {

  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events);
    }
    fetchEvents();
  }, []);
  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data.companies);
    }
    fetchCompanies();
  }, []);
  useEffect(() => {
    const fetchSectors = async () => {
      const res = await fetch('/api/sectors');
      const data = await res.json();
      setSectors(data.sectors);
    }
    fetchSectors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-700 to-green-600 text-white px-4">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Agro & Food Division Companies Directory
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Your gateway to discovering quality food exporters and manufacturers from Pakistan
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/companies"
                  className="px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Browse Companies
                </Link>
                <Link
                  href="/events"
                  className="px-8 py-3 bg-green-800 text-white rounded-lg font-semibold hover:bg-green-900 transition-colors"
                >
                  View Events
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">{companies.length}</div>
                <div className="text-gray-600">Registered Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">{sectors.length}</div>
                <div className="text-gray-600">Food Sectors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-700 mb-2">{events.length}</div>
                <div className="text-gray-600">Upcoming Events</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Use TDAP Food Directory?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                A comprehensive platform connecting Pakistani food businesses with global opportunities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Companies</h3>
                <p className="text-gray-600">
                  All companies are verified and approved by TDAP, ensuring credibility and quality
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Search</h3>
                <p className="text-gray-600">
                  Filter by sector, product, certification, and more to find exactly what you need
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trade Events</h3>
                <p className="text-gray-600">
                  Stay updated on exhibitions, conferences, and networking opportunities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sectors Section */}
        <section className="py-16 bg-white px-4">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Browse by Sector
              </h2>
              <p className="text-gray-600 text-lg">
                Explore companies across various food sectors
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'Cereals',
                'Spices',
                'Fruits & Vegetables',
                'Dairy',
                'Meat & Poultry',
                'Seafood',
                'Bakery & Confectionery',
                'Beverages',
                'Processed Foods',
                'Organic Products'
              ].map((sector, index) => (
                <Link
                  key={index}
                  href="/companies"
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <p className="font-medium text-gray-900">{sector}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-green-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="text-center bg-white/10 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Find Business Partners
                </h2>
                <p className="text-green-100 mb-6">
                  Explore Pakistani food companies and discover your next business partner
                </p>
                <Link
                  href="/companies"
                  className="inline-block px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Browse Directory
                </Link>
              </div>

              <div className="text-center bg-white/10 rounded-lg p-8 backdrop-blur-sm">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Register Your Company
                </h2>
                <p className="text-green-100 mb-6">
                  Join Pakistan's premier food industry directory and expand your reach
                </p>
                <Link
                  href="/register"
                  className="inline-block px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
