# TDAP Food Directory

A comprehensive company directory for Pakistani food companies, built for the Trade Development Authority of Pakistan (TDAP) - Food Division.

## Overview

This Next.js application provides a centralized, searchable directory of food-related companies in Pakistan with support for:

- **Company Listings** with advanced filtering (by sector, product, certification)
- **Company Profile Pages** (digital brochures)
- **Event/Exhibition Pages** listing participating companies
- **Search Functionality** to find companies quickly

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS 4
- **Data Layer**: JavaScript arrays (Phase 1) - designed for easy MySQL migration

## Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── companies/
│   │   ├── events/
│   │   └── sectors/
│   ├── companies/              # Company pages
│   │   ├── [id]/              # Dynamic company profile
│   │   └── page.js            # Company listing
│   ├── events/                # Event pages
│   │   ├── [id]/              # Dynamic event detail
│   │   └── page.js            # Events listing
│   ├── layout.js              # Root layout
│   └── page.js                # Home page
├── components/                 # Reusable components
│   ├── Header.js
│   ├── Footer.js
│   ├── CompanyCard.js
│   └── EventCard.js
└── data/                      # Data layer (Phase 1)
    ├── companies.js           # Company data & helpers
    ├── events.js              # Event data & helpers
    └── sectors.js             # Sector data & helpers
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd food-directory
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

### 1. Company Directory

- Browse all approved companies
- Filter by sector, product, and certification
- Search by company name, profile, or products
- View detailed company profiles with:
  - Company overview
  - Products offered
  - Certifications
  - Contact information
  - Contact person details

### 2. Events & Exhibitions

- View upcoming trade fairs and exhibitions
- See event details and highlights
- Browse participating companies
- Access event location and dates

### 3. API Endpoints

#### Companies
- `GET /api/companies` - Get all approved companies
- `GET /api/companies?id={id}` - Get single company
- `GET /api/companies?sector={id}` - Filter by sector
- `GET /api/companies?product={name}` - Filter by product
- `GET /api/companies?certification={name}` - Filter by certification
- `GET /api/companies?q={query}` - Search companies
- `GET /api/companies?action=filters` - Get filter options

#### Events
- `GET /api/events` - Get all events
- `GET /api/events?id={id}` - Get single event
- `GET /api/events?slug={slug}` - Get event by slug

#### Sectors
- `GET /api/sectors` - Get all sectors
- `GET /api/sectors?id={id}` - Get single sector

## Data Management

### Phase 1: JavaScript Arrays (Current)

All data is stored in JavaScript arrays in the `src/data/` directory:

- `companies.js` - Company data with helper functions
- `events.js` - Event data with helper functions
- `sectors.js` - Sector/category definitions

### Phase 2: MySQL Migration (Future)

The architecture is designed for easy migration to MySQL:

1. All data access goes through helper functions
2. API routes abstract data layer from frontend
3. Frontend components use API routes exclusively
4. No direct data imports in components

**Migration Steps**:
1. Set up MySQL database with Prisma ORM
2. Create database schema matching current data structure
3. Replace helper functions in `src/data/` with database queries
4. No frontend changes required!

## Adding New Data

### Add a New Company

Edit `src/data/companies.js`:

```javascript
{
  id: 9,  // Increment ID
  company_name: 'Your Company Name',
  company_profile: 'Detailed description...',
  interested_sector_id: 1,  // Reference sectors.js
  company_competence: 'Main competencies',
  year_of_incorporation: 2020,
  no_of_employees: 50,
  certification: 'ISO 9001, HACCP',
  products_to_be_displayed: ['Product 1', 'Product 2'],
  company_address: 'Full address',
  company_email_address: 'info@company.com',
  web_address: 'https://company.com',
  person_name: 'Contact Person',
  person_designation: 'Manager',
  person_cell_no: '03001234567',
  person_whatsapp_no: '03001234567',
  person_email_address: 'person@company.com',
  status: 'Approved'  // Only 'Approved' companies are visible
}
```

### Add a New Event

Edit `src/data/events.js`:

```javascript
{
  id: 6,
  name: 'Event Name',
  slug: 'event-slug',
  location: 'Venue Name, City',
  date: '2026-08-15 to 2026-08-17',
  start_date: '2026-08-15',
  end_date: '2026-08-17',
  description: 'Event description...',
  participatingCompanyIds: [1, 2, 3],  // Company IDs
  highlights: [
    'Highlight 1',
    'Highlight 2'
  ]
}
```

### Add a New Sector

Edit `src/data/sectors.js`:

```javascript
{ id: 12, name: 'New Sector Name' }
```

## Deployment

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Deploy to Vercel

This project is optimized for Vercel deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Deploy (zero configuration needed)

## SEO Features

- Dynamic metadata for each page
- Semantic HTML structure
- Optimized meta descriptions
- Structured URLs
- Open Graph tags

## Future Enhancements

1. **Admin Panel**
   - CRUD operations for companies and events
   - Approval workflow
   - Data validation

2. **Advanced Features**
   - PDF brochure uploads
   - Full-text search
   - Analytics dashboard
   - Multilingual support (English/Urdu)

3. **Database Migration**
   - MySQL with Prisma ORM
   - User authentication
   - Data backup and recovery

## Compliance

- Government-grade UI design
- Structured, verifiable company data
- Export and trade-focused taxonomy
- Data approval workflow

## Support

For questions or issues, contact:
- **TDAP**: info@tdap.gov.pk
- **Website**: www.tdap.gov.pk

## License

This project is developed for Trade Development Authority of Pakistan (TDAP).

---

Built with ❤️ for Pakistani food exporters
