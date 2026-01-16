# MySQL Migration Guide

This guide explains how to migrate the TDAP Food Directory from JavaScript arrays to MySQL database without breaking the frontend.

## Phase 1: Current Architecture (JS Arrays)

```
Frontend Components
    ↓ (fetch)
API Routes (/api/companies, /api/events)
    ↓ (import)
Data Layer (src/data/*.js - JS Arrays)
```

## Phase 2: Target Architecture (MySQL)

```
Frontend Components (NO CHANGES)
    ↓ (fetch)
API Routes (MINOR CHANGES)
    ↓ (Prisma queries)
MySQL Database
```

## Migration Steps

### Step 1: Install Dependencies

```bash
pnpm add prisma @prisma/client
pnpm add -D prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Database connection string

### Step 3: Configure Database Connection

Edit `.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/tdap_food_directory"
```

### Step 4: Define Database Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Sector {
  id        Int       @id @default(autoincrement())
  name      String    @db.VarChar(100)
  companies Company[]
  
  @@map("sectors")
}

model Company {
  id                        Int      @id @default(autoincrement())
  company_name              String   @db.VarChar(255)
  company_profile           String   @db.Text
  interested_sector_id      Int
  company_competence        String   @db.VarChar(500)
  year_of_incorporation     Int
  no_of_employees           Int
  certification             String?  @db.VarChar(500)
  products_to_be_displayed  Json     // Store as JSON array
  company_address           String   @db.Text
  company_email_address     String   @db.VarChar(255)
  web_address               String?  @db.VarChar(255)
  person_name               String   @db.VarChar(255)
  person_designation        String?  @db.VarChar(100)
  person_cell_no            String?  @db.VarChar(20)
  person_whatsapp_no        String?  @db.VarChar(20)
  person_email_address      String   @db.VarChar(255)
  status                    String   @default("Pending") @db.VarChar(20)
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  
  sector                    Sector   @relation(fields: [interested_sector_id], references: [id])
  eventParticipations       EventParticipation[]
  
  @@index([status])
  @@index([interested_sector_id])
  @@map("companies")
}

model Event {
  id                        Int      @id @default(autoincrement())
  name                      String   @db.VarChar(255)
  slug                      String   @unique @db.VarChar(255)
  location                  String   @db.VarChar(255)
  date                      String   @db.VarChar(100)
  start_date                DateTime
  end_date                  DateTime
  description               String   @db.Text
  image                     String?  @db.VarChar(255)
  highlights                Json?    // Store as JSON array
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  
  participants              EventParticipation[]
  
  @@index([slug])
  @@map("events")
}

model EventParticipation {
  id         Int     @id @default(autoincrement())
  event_id   Int
  company_id Int
  
  event      Event   @relation(fields: [event_id], references: [id], onDelete: Cascade)
  company    Company @relation(fields: [company_id], references: [id], onDelete: Cascade)
  
  @@unique([event_id, company_id])
  @@map("event_participations")
}
```

### Step 5: Create and Run Migration

```bash
npx prisma migrate dev --name init
```

### Step 6: Seed Database with Existing Data

Create `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import existing data
const { sectors } = require('../src/data/sectors');
const { companies } = require('../src/data/companies');
const { events } = require('../src/data/events');

async function main() {
  console.log('Seeding database...');

  // Seed sectors
  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { id: sector.id },
      update: {},
      create: sector,
    });
  }
  console.log('✓ Sectors seeded');

  // Seed companies
  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {},
      create: {
        ...company,
        products_to_be_displayed: company.products_to_be_displayed,
      },
    });
  }
  console.log('✓ Companies seeded');

  // Seed events
  for (const event of events) {
    const { participatingCompanyIds, ...eventData } = event;
    
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        ...eventData,
        start_date: new Date(event.start_date),
        end_date: new Date(event.end_date),
      },
    });

    // Create event participations
    for (const companyId of participatingCompanyIds) {
      await prisma.eventParticipation.create({
        data: {
          event_id: event.id,
          company_id: companyId,
        },
      });
    }
  }
  console.log('✓ Events seeded');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

Run seed:

```bash
npx prisma db seed
```

### Step 7: Create Prisma Client Instance

Create `src/lib/prisma.js`:

```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 8: Update Data Layer Functions

Replace `src/data/companies.js` with database queries:

```javascript
import { prisma } from '@/lib/prisma';

export async function getCompanyById(id) {
  return await prisma.company.findUnique({
    where: { id: parseInt(id) },
    include: { sector: true },
  });
}

export async function getApprovedCompanies() {
  return await prisma.company.findMany({
    where: { status: 'Approved' },
    include: { sector: true },
    orderBy: { company_name: 'asc' },
  });
}

export async function filterCompaniesBySector(sectorId) {
  return await prisma.company.findMany({
    where: {
      status: 'Approved',
      interested_sector_id: parseInt(sectorId),
    },
    include: { sector: true },
  });
}

export async function filterCompaniesByProduct(product) {
  return await prisma.company.findMany({
    where: {
      status: 'Approved',
      products_to_be_displayed: {
        array_contains: product,
      },
    },
    include: { sector: true },
  });
}

export async function searchCompanies(query) {
  return await prisma.company.findMany({
    where: {
      status: 'Approved',
      OR: [
        { company_name: { contains: query } },
        { company_profile: { contains: query } },
        { company_competence: { contains: query } },
      ],
    },
    include: { sector: true },
  });
}

export async function getAllProducts() {
  const companies = await prisma.company.findMany({
    where: { status: 'Approved' },
    select: { products_to_be_displayed: true },
  });
  
  const productsSet = new Set();
  companies.forEach(company => {
    company.products_to_be_displayed.forEach(product => {
      productsSet.add(product);
    });
  });
  
  return Array.from(productsSet).sort();
}

export async function getAllCertifications() {
  const companies = await prisma.company.findMany({
    where: { status: 'Approved' },
    select: { certification: true },
  });
  
  const certificationsSet = new Set();
  companies.forEach(company => {
    if (company.certification) {
      const certs = company.certification.split(',').map(c => c.trim());
      certs.forEach(cert => certificationsSet.add(cert));
    }
  });
  
  return Array.from(certificationsSet).sort();
}
```

### Step 9: Update API Routes

Update `src/app/api/companies/route.js` to use async/await:

```javascript
import { NextResponse } from 'next/server';
import { 
  getCompanyById, 
  getApprovedCompanies,
  filterCompaniesBySector,
  filterCompaniesByProduct,
  searchCompanies,
  getAllProducts,
  getAllCertifications
} from '@/data/companies';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Get single company by ID
    const id = searchParams.get('id');
    if (id) {
      const company = await getCompanyById(id);
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(company);
    }
    
    // Get filter options
    if (searchParams.get('action') === 'filters') {
      const [products, certifications] = await Promise.all([
        getAllProducts(),
        getAllCertifications()
      ]);
      return NextResponse.json({ products, certifications });
    }
    
    // Apply filters
    const sector = searchParams.get('sector');
    const product = searchParams.get('product');
    const query = searchParams.get('q');
    
    let result;
    
    if (query) {
      result = await searchCompanies(query);
    } else if (sector) {
      result = await filterCompaniesBySector(sector);
    } else if (product) {
      result = await filterCompaniesByProduct(product);
    } else {
      result = await getApprovedCompanies();
    }
    
    return NextResponse.json({
      companies: result,
      total: result.length
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 10: Update Company Profile Pages

Update `src/app/companies/[id]/page.js` to use async data fetching:

```javascript
import { notFound } from 'next/navigation';
import { getCompanyById } from '@/data/companies';
// ... rest of imports

export async function generateMetadata({ params }) {
  const company = await getCompanyById(params.id);
  // ... rest of metadata
}

export default async function CompanyProfilePage({ params }) {
  const company = await getCompanyById(params.id);
  // ... rest of component
}
```

### Step 11: Test Migration

1. **Test API endpoints**:
```bash
curl http://localhost:3000/api/companies
curl http://localhost:3000/api/companies?id=1
curl http://localhost:3000/api/events
```

2. **Test frontend pages**:
- Visit `/companies`
- Visit `/companies/1`
- Visit `/events`
- Test all filters

3. **Verify data integrity**:
```bash
npx prisma studio
```

### Step 12: Deploy

1. **Update environment variables** on your hosting platform
2. **Run migrations** on production database:
```bash
npx prisma migrate deploy
```

3. **Deploy application**

## Rollback Plan

If issues occur, you can quickly rollback:

1. Keep the old `src/data/*.js` files as backups
2. Revert API route changes
3. Remove Prisma imports
4. Redeploy

## Benefits of This Architecture

✅ **Zero frontend changes** - Components don't know about database  
✅ **Easy testing** - Can test with mock data  
✅ **Gradual migration** - Can migrate one API route at a time  
✅ **Type safety** - Prisma provides TypeScript types  
✅ **Performance** - Database queries are optimized  
✅ **Scalability** - Can handle thousands of companies  

## Future Enhancements

After migration, you can add:

1. **Full-text search** using MySQL FULLTEXT indexes
2. **Pagination** for large datasets
3. **Caching** with Redis
4. **Admin authentication** with NextAuth.js
5. **Image uploads** with cloud storage
6. **Analytics** tracking

## Support

For migration assistance, refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Database Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
