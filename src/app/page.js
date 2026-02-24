'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [events, setEvents] = useState([]);
  const [seminars, setSeminars] = useState([]);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(d => setEvents(d.events || []));
    fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.companies || []));
    fetch('/api/sectors').then(r => r.json()).then(d => setSectors(d.sectors || []));
    fetch('/api/seminars').then(r => r.json()).then(d => setSeminars(d.seminars || []));
  }, []);

  return (
    <div className="page-wrapper">
      <main>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto">
            <div className="glass-hero p-10 md:p-16 max-w-4xl">
              <div className="inline-block badge-green mb-4 text-xs uppercase tracking-widest">
                Official Directory
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
                Agro &amp; Food Division<br />
                <span className="text-accent-green">Companies Directory</span>
              </h1>
              <p className="text-xl text-secondary mb-8 max-w-2xl leading-relaxed">
                Your gateway to discovering quality food exporters and manufacturers from Pakistan
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/companies" className="btn-primary px-8 py-3 inline-block">
                  Browse Companies
                </Link>
                <Link href="/events" className="btn-outline px-8 py-3 inline-block">
                  View Events
                </Link>
                <Link
                  href="/seminars"
                  className="btn-outline px-8 py-3 inline-block"
                >
                  Seminars
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: companies.length, label: 'Registered Companies', color: 'text-accent-green' },
                { value: sectors.length, label: 'Food Sectors', color: 'text-accent-blue' },
                { value: events.length, label: 'Events &amp; Exhibitions', color: 'text-accent-green' },
                { value: seminars.length, label: 'Seminars &amp; Webinars', color: 'text-orange-400' },
              ].map(({ value, label, color }) => (
                <div key={label} className="glass-card p-8">
                  <div className={`text-5xl font-bold mb-2 ${color}`}>{value}</div>
                  <div
                    className="text-secondary font-medium"
                    dangerouslySetInnerHTML={{ __html: label }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Use TDAP Food Directory?
              </h2>
              <p className="text-secondary text-lg max-w-2xl mx-auto">
                A comprehensive platform connecting Pakistani food businesses with global opportunities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  ),
                  title: 'Verified Companies',
                  desc: 'All companies are verified and approved by TDAP, ensuring credibility and quality.',
                  circleClass: 'icon-circle-green',
                },
                {
                  icon: (
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  ),
                  title: 'Advanced Search',
                  desc: 'Filter by sector, product, certification and more to find exactly what you need.',
                  circleClass: 'icon-circle-blue',
                },
                {
                  icon: (
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  ),
                  title: 'Trade Events',
                  desc: 'Stay updated on exhibitions, conferences, and networking opportunities.',
                  circleClass: 'icon-circle-green',
                },
              ].map(({ icon, title, desc, circleClass }) => (
                <div key={title} className="glass-card p-8 text-center">
                  <div className={`${circleClass} w-16 h-16 mx-auto mb-5`}>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">{icon}</svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Browse by Sector ──────────────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Browse by Sector
              </h2>
              <p className="text-secondary text-lg">
                Explore companies across various food sectors
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[
                'Cereals', 'Spices', 'Fruits & Vegetables', 'Dairy',
                'Meat & Poultry', 'Seafood', 'Bakery & Confectionery',
                'Beverages', 'Processed Foods', 'Organic Products',
              ].map((sector) => (
                <Link key={sector} href="/companies" className="sector-chip font-medium">
                  {sector}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="glass-card-strong p-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Find Business Partners
                </h2>
                <p className="text-secondary mb-6 leading-relaxed">
                  Explore Pakistani food companies and discover your next business partner.
                </p>
                <Link href="/companies" className="btn-primary px-8 py-3 inline-block">
                  Browse Directory
                </Link>
              </div>

              <div className="glass-card-strong p-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Register Your Company
                </h2>
                <p className="text-secondary mb-6 leading-relaxed">
                  Join Pakistan's premier food industry directory and expand your global reach.
                </p>
                <Link href="/register" className="btn-primary px-8 py-3 inline-block">
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
