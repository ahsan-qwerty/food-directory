# Testing Guide

This guide helps you test all features of the TDAP Food Directory application.

## Prerequisites

Make sure the development server is running:

```bash
pnpm dev
```

The application should be accessible at [http://localhost:3000](http://localhost:3000)

## Manual Testing Checklist

### 1. Home Page (`/`)

**Test Cases:**
- [ ] Page loads without errors
- [ ] Header displays with TDAP branding
- [ ] Navigation links work (Home, Companies, Events)
- [ ] Hero section displays correctly
- [ ] Stats section shows correct numbers
- [ ] Features section displays 3 feature cards
- [ ] Sectors grid displays 8 sectors
- [ ] Footer displays with contact information
- [ ] "Browse Companies" button navigates to `/companies`
- [ ] "View Events" button navigates to `/events`
- [ ] Responsive design works on mobile/tablet

**Expected Results:**
- Clean, professional government-style UI
- All links functional
- No console errors

---

### 2. Companies Listing Page (`/companies`)

**Test Cases:**
- [ ] Page loads and displays all 8 companies
- [ ] Search filter works (try "rice", "spice")
- [ ] Sector filter works (select different sectors)
- [ ] Product filter works (select different products)
- [ ] Certification filter works (select certifications)
- [ ] Multiple filters work together
- [ ] "Clear All Filters" button resets filters
- [ ] Company count updates when filtering
- [ ] "No companies found" message shows when no results
- [ ] Company cards display correct information
- [ ] Clicking a company card navigates to profile page
- [ ] Loading state shows while fetching data

**Test Specific Filters:**

1. **Search Test:**
   - Search "rice" → Should show JJ RICE, Golden Grain Mills
   - Search "spice" → Should show Spice King International
   - Search "dairy" → Should show Himalayan Dairy Products

2. **Sector Filter:**
   - Select "Rice & Grains" → Should show companies in that sector
   - Select "Spices & Seasonings" → Should show Spice King

3. **Product Filter:**
   - Select "Basmati Rice" → Should show JJ RICE
   - Select "Cheese" → Should show Himalayan Dairy Products

4. **Certification Filter:**
   - Select "ISO 9001" → Should show companies with ISO 9001
   - Select "HACCP" → Should show companies with HACCP

**Expected Results:**
- Filters work independently and in combination
- Results update immediately
- No page reload when filtering

---

### 3. Company Profile Page (`/companies/[id]`)

**Test Cases:**

Test with Company ID 1 (JJ RICE):
- [ ] Navigate to `/companies/1`
- [ ] Page loads without errors
- [ ] Breadcrumb navigation works
- [ ] Company name displays correctly
- [ ] Sector badge shows "Export Trading"
- [ ] Year badge shows "Since 2000"
- [ ] Employee count shows "20 Employees"
- [ ] Company profile text displays fully
- [ ] All products display in grid
- [ ] Core competencies section shows
- [ ] Certifications display as badges (ISO 9001, HACCP)
- [ ] Contact information sidebar displays
- [ ] Company address shows correctly
- [ ] Email link is clickable (mailto:)
- [ ] Website link opens in new tab
- [ ] Contact person details display
- [ ] Phone number is clickable (tel:)
- [ ] WhatsApp link works and opens WhatsApp
- [ ] "Browse More Companies" button works

Test with invalid ID:
- [ ] Navigate to `/companies/999`
- [ ] 404 page displays
- [ ] "Company Not Found" message shows
- [ ] Navigation links work from 404 page

**Test All Companies:**
- [ ] `/companies/1` - JJ RICE
- [ ] `/companies/2` - Spice King International
- [ ] `/companies/3` - Fresh Harvest Exports
- [ ] `/companies/4` - Himalayan Dairy Products
- [ ] `/companies/5` - Golden Grain Mills
- [ ] `/companies/6` - Ocean Fresh Seafood
- [ ] `/companies/7` - Sweet Delights Confectionery
- [ ] `/companies/8` - Pure Beverages Ltd

**Expected Results:**
- Each profile displays complete company information
- All contact links work correctly
- SEO metadata is present (check page title)

---

### 4. Events Listing Page (`/events`)

**Test Cases:**
- [ ] Page loads and displays all 5 events
- [ ] Event cards display correctly
- [ ] Event count shows "Showing 5 events"
- [ ] Each event card shows:
  - [ ] Event name
  - [ ] Date with calendar icon
  - [ ] Location with map icon
  - [ ] Description (truncated)
  - [ ] Number of participating companies
- [ ] Clicking event card navigates to event detail
- [ ] Loading state shows while fetching
- [ ] Responsive grid layout works

**Expected Results:**
- All 5 events display
- Cards are visually appealing with gradient headers
- Navigation works smoothly

---

### 5. Event Detail Page (`/events/[id]`)

**Test Cases:**

Test with Event ID 1 (Pakistan Food & Hospitality Expo 2026):
- [ ] Navigate to `/events/1`
- [ ] Page loads without errors
- [ ] Breadcrumb navigation works
- [ ] Event header displays with gradient background
- [ ] Event name shows correctly
- [ ] Date displays with icon
- [ ] Location displays with icon
- [ ] Participant count shows (6 companies)
- [ ] Event description displays fully
- [ ] Event highlights show as bullet list with checkmarks
- [ ] All 6 participating companies display
- [ ] Company cards are clickable
- [ ] Quick information sidebar shows
- [ ] "Interested in Exhibiting?" CTA displays
- [ ] TDAP contact information shows
- [ ] "View All Events" button works

Test all events:
- [ ] `/events/1` - Pakistan Food & Hospitality Expo 2026 (6 companies)
- [ ] `/events/2` - International Rice Conference 2026 (2 companies)
- [ ] `/events/3` - Organic & Healthy Foods Summit 2026 (3 companies)
- [ ] `/events/4` - Seafood & Fisheries Expo 2026 (1 company)
- [ ] `/events/5` - Bakery & Confectionery Trade Fair 2026 (2 companies)

Test with invalid ID:
- [ ] Navigate to `/events/999`
- [ ] 404 page displays
- [ ] "Event Not Found" message shows

**Expected Results:**
- Complete event information displays
- Participating companies are correctly linked
- All interactive elements work

---

### 6. API Endpoints

Test using browser or curl:

**Companies API:**

```bash
# Get all companies
curl http://localhost:3000/api/companies

# Get single company
curl http://localhost:3000/api/companies?id=1

# Filter by sector
curl http://localhost:3000/api/companies?sector=52

# Filter by product
curl http://localhost:3000/api/companies?product=Rice

# Filter by certification
curl http://localhost:3000/api/companies?certification=ISO

# Search companies
curl http://localhost:3000/api/companies?q=rice

# Get filter options
curl http://localhost:3000/api/companies?action=filters
```

**Events API:**

```bash
# Get all events
curl http://localhost:3000/api/events

# Get single event
curl http://localhost:3000/api/events?id=1

# Get event by slug
curl http://localhost:3000/api/events?slug=pakistan-food-hospitality-expo-2026
```

**Sectors API:**

```bash
# Get all sectors
curl http://localhost:3000/api/sectors

# Get single sector
curl http://localhost:3000/api/sectors?id=1
```

**Expected Results:**
- All endpoints return valid JSON
- Status codes are correct (200 for success, 404 for not found)
- Data structure matches expected format

---

### 7. Navigation & Links

**Test Cases:**
- [ ] Header logo links to home page
- [ ] Header "Home" link works
- [ ] Header "Companies" link works
- [ ] Header "Events" link works
- [ ] Footer "Browse Companies" link works
- [ ] Footer "Events & Exhibitions" link works
- [ ] All breadcrumb links work
- [ ] Back navigation works correctly
- [ ] Browser back/forward buttons work

**Expected Results:**
- All navigation is smooth
- No broken links
- URLs are clean and semantic

---

### 8. Responsive Design

Test on different screen sizes:

**Desktop (1920x1080):**
- [ ] Layout uses full width appropriately
- [ ] 3-column grid for companies
- [ ] All content readable
- [ ] No horizontal scroll

**Tablet (768x1024):**
- [ ] Layout adjusts to 2 columns
- [ ] Navigation remains accessible
- [ ] Filters stack properly
- [ ] Cards resize appropriately

**Mobile (375x667):**
- [ ] Layout switches to single column
- [ ] Header navigation stacks or collapses
- [ ] Filters stack vertically
- [ ] Touch targets are adequate size
- [ ] Text remains readable
- [ ] No horizontal scroll

**Expected Results:**
- Smooth responsive behavior
- No layout breaks
- Content accessible on all devices

---

### 9. SEO & Metadata

**Test Cases:**
- [ ] Home page has proper title and description
- [ ] Company listing page has proper metadata
- [ ] Company profile pages have dynamic titles
- [ ] Event pages have dynamic titles
- [ ] Meta descriptions are present
- [ ] Open Graph tags are present (check page source)

**How to Check:**
1. Right-click → View Page Source
2. Look for `<title>` tag
3. Look for `<meta name="description">` tag
4. Look for Open Graph tags

**Expected Results:**
- Each page has unique, descriptive title
- Meta descriptions are informative
- Titles include "TDAP Food Directory"

---

### 10. Performance

**Test Cases:**
- [ ] Initial page load is fast (< 2 seconds)
- [ ] Navigation between pages is instant
- [ ] Filter changes are immediate
- [ ] No unnecessary re-renders
- [ ] Images load efficiently
- [ ] No console errors or warnings

**How to Check:**
1. Open Chrome DevTools
2. Go to Network tab
3. Reload page
4. Check load time and resource sizes

**Expected Results:**
- Fast page loads
- Minimal JavaScript bundle size
- No performance warnings

---

### 11. Error Handling

**Test Cases:**
- [ ] Invalid company ID shows 404
- [ ] Invalid event ID shows 404
- [ ] Invalid API requests return proper errors
- [ ] Network errors are handled gracefully
- [ ] Empty search results show helpful message

**Expected Results:**
- User-friendly error messages
- No crashes or blank pages
- Clear guidance on what to do next

---

### 12. Data Integrity

**Test Cases:**
- [ ] All 8 companies are visible
- [ ] All 5 events are visible
- [ ] All 11 sectors are available in filters
- [ ] Product list is complete and sorted
- [ ] Certification list is complete
- [ ] Event participant counts are correct
- [ ] Company contact information is complete

**Expected Results:**
- No missing data
- All relationships intact
- Data displays correctly

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Expected Results:**
- Consistent appearance across browsers
- All features work in all browsers
- No browser-specific bugs

---

## Accessibility Testing

**Test Cases:**
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus indicators are visible
- [ ] Color contrast is sufficient
- [ ] Alt text for icons (if any images added)
- [ ] Semantic HTML structure
- [ ] Screen reader friendly

**How to Check:**
1. Try navigating with keyboard only
2. Use Chrome Lighthouse accessibility audit
3. Test with screen reader (optional)

**Expected Results:**
- Site is keyboard accessible
- No accessibility warnings in Lighthouse
- Semantic HTML structure

---

## Production Build Testing

Before deploying, test production build:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

**Test Cases:**
- [ ] Build completes without errors
- [ ] Production server starts successfully
- [ ] All pages work in production mode
- [ ] Performance is good
- [ ] No console errors

**Expected Results:**
- Successful build
- Faster performance than dev mode
- All features work correctly

---

## Automated Testing (Future)

Consider adding these tests:

1. **Unit Tests** (Jest + React Testing Library)
   - Component rendering
   - Filter logic
   - Helper functions

2. **Integration Tests**
   - API routes
   - Data fetching
   - User flows

3. **E2E Tests** (Playwright/Cypress)
   - Complete user journeys
   - Form submissions
   - Navigation flows

---

## Bug Reporting Template

If you find a bug, document it:

```
**Bug Description:**
[What went wrong?]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior:**
[What should happen?]

**Actual Behavior:**
[What actually happened?]

**Browser/Device:**
[Chrome 120 on Windows 11]

**Screenshots:**
[If applicable]

**Console Errors:**
[Any error messages]
```

---

## Testing Checklist Summary

Before considering the project complete:

- [ ] All pages load without errors
- [ ] All filters work correctly
- [ ] All navigation works
- [ ] All API endpoints return correct data
- [ ] Responsive design works on all devices
- [ ] SEO metadata is present
- [ ] No console errors or warnings
- [ ] Production build works
- [ ] Cross-browser compatibility verified
- [ ] Accessibility standards met

---

## Need Help?

If you encounter issues:

1. Check browser console for errors
2. Review the README.md for setup instructions
3. Check MIGRATION_GUIDE.md for database setup
4. Verify all dependencies are installed
5. Ensure development server is running

---

Happy Testing! 🧪
