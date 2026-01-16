# Quick Start Guide

Get the TDAP Food Directory up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- pnpm installed (or npm/yarn)

## Installation

```bash
# 1. Navigate to project directory
cd food-directory

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open browser
# Visit http://localhost:3000
```

That's it! The application should now be running.

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server (http://localhost:3000)

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint
```

## Project Structure

```
food-directory/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # Reusable React components
│   └── data/            # Data layer (JS arrays)
├── public/              # Static assets
└── package.json         # Dependencies
```

## Key URLs

Once running, visit:

- **Home**: http://localhost:3000
- **Companies**: http://localhost:3000/companies
- **Events**: http://localhost:3000/events
- **API**: http://localhost:3000/api/companies

## Adding Data

### Add a Company

Edit `src/data/companies.js`:

```javascript
{
  id: 9,  // Next available ID
  company_name: 'Your Company',
  company_profile: 'Description...',
  interested_sector_id: 1,
  // ... rest of fields
  status: 'Approved'
}
```

### Add an Event

Edit `src/data/events.js`:

```javascript
{
  id: 6,
  name: 'Your Event',
  slug: 'your-event',
  // ... rest of fields
  participatingCompanyIds: [1, 2, 3]
}
```

### Add a Sector

Edit `src/data/sectors.js`:

```javascript
{ id: 12, name: 'New Sector' }
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
pnpm dev -- -p 3001
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Clean Next.js cache
rm -rf .next
pnpm build
```

## Next Steps

1. ✅ Browse the application
2. ✅ Review `README.md` for detailed documentation
3. ✅ Check `TESTING_GUIDE.md` for testing instructions
4. ✅ See `MIGRATION_GUIDE.md` for MySQL migration
5. ✅ Customize data in `src/data/` files

## Need Help?

- Check browser console for errors
- Review error messages carefully
- Ensure all dependencies installed
- Verify Node.js version (18+)

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (zero configuration needed!)

### Deploy to Other Platforms

```bash
# Build production bundle
pnpm build

# The output will be in .next/ folder
# Upload to your hosting provider
```

## Features at a Glance

✅ **8 Sample Companies** with complete profiles  
✅ **5 Sample Events** with participants  
✅ **Advanced Filtering** by sector, product, certification  
✅ **Search Functionality** across all companies  
✅ **Responsive Design** works on all devices  
✅ **SEO Optimized** with proper metadata  
✅ **API Routes** for data access  
✅ **Migration Ready** for MySQL database  

## Support

For questions or issues:
- Email: info@tdap.gov.pk
- Website: www.tdap.gov.pk

---

**Happy Coding! 🚀**
