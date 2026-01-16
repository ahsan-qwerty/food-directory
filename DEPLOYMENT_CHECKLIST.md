# Deployment Checklist

Use this checklist before deploying the TDAP Food Directory to production.

## Pre-Deployment Checklist

### ✅ Code Quality

- [ ] All linter errors resolved
- [ ] No console errors in browser
- [ ] No console warnings in browser
- [ ] Code is properly formatted
- [ ] All files have proper structure
- [ ] Comments added where necessary

### ✅ Data Verification

- [ ] All 8 companies have complete information
- [ ] All 5 events have complete information
- [ ] All 11 sectors are defined
- [ ] All company statuses are "Approved"
- [ ] All contact information is valid
- [ ] All URLs are properly formatted
- [ ] All email addresses are valid
- [ ] All phone numbers are formatted correctly

### ✅ Functionality Testing

- [ ] Home page loads correctly
- [ ] Company listing page works
- [ ] All filters work (sector, product, certification)
- [ ] Search functionality works
- [ ] Company profile pages load
- [ ] Event listing page works
- [ ] Event detail pages load
- [ ] All navigation links work
- [ ] All API endpoints return correct data
- [ ] 404 pages display correctly
- [ ] Loading states work
- [ ] Error handling works

### ✅ Responsive Design

- [ ] Desktop layout (1920x1080) works
- [ ] Tablet layout (768x1024) works
- [ ] Mobile layout (375x667) works
- [ ] No horizontal scroll on any device
- [ ] Touch targets are adequate size on mobile
- [ ] Text is readable on all devices
- [ ] Images scale properly
- [ ] Navigation works on mobile

### ✅ SEO & Metadata

- [ ] Page titles are descriptive
- [ ] Meta descriptions are present
- [ ] Open Graph tags are set
- [ ] Favicon is present
- [ ] URLs are clean and semantic
- [ ] Breadcrumbs are implemented
- [ ] Heading hierarchy is correct (h1, h2, h3)

### ✅ Performance

- [ ] Production build completes successfully
- [ ] Initial load time < 2 seconds
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] CSS is minified
- [ ] JavaScript is minified
- [ ] No memory leaks

### ✅ Browser Compatibility

- [ ] Chrome (latest) tested
- [ ] Firefox (latest) tested
- [ ] Safari (latest) tested
- [ ] Edge (latest) tested
- [ ] Mobile Safari tested
- [ ] Chrome Mobile tested

### ✅ Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Screen reader friendly

### ✅ Security

- [ ] No API keys exposed in frontend
- [ ] Environment variables properly set
- [ ] HTTPS enabled (in production)
- [ ] External links use rel="noopener noreferrer"
- [ ] Input validation in place
- [ ] No XSS vulnerabilities

---

## Deployment Steps

### Option 1: Vercel (Recommended)

**Step 1: Prepare Repository**

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TDAP Food Directory"

# Create GitHub repository and push
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build` (or leave default)
   - Output Directory: `.next` (default)
6. Click "Deploy"

**Step 3: Verify Deployment**

- [ ] Visit deployment URL
- [ ] Test all pages
- [ ] Test all functionality
- [ ] Check console for errors
- [ ] Verify SEO metadata

**Step 4: Custom Domain (Optional)**

1. Go to project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation
6. Verify SSL certificate is active

---

### Option 2: Traditional Hosting (VPS/Shared Hosting)

**Step 1: Build Production Bundle**

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Test production build locally
pnpm start
```

**Step 2: Prepare Server**

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js 18+ (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

**Step 3: Upload Files**

```bash
# From local machine, upload files
scp -r ./* user@your-server.com:/var/www/food-directory/

# Or use Git
ssh user@your-server.com
cd /var/www/food-directory
git clone <your-repo-url> .
```

**Step 4: Install & Build on Server**

```bash
# On server
cd /var/www/food-directory

# Install dependencies
pnpm install

# Build
pnpm build
```

**Step 5: Start with PM2**

```bash
# Start application
pm2 start pnpm --name "food-directory" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Step 6: Configure Nginx (Reverse Proxy)**

Create `/etc/nginx/sites-available/food-directory`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/food-directory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Step 7: Setup SSL with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: Docker Deployment

**Step 1: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Step 2: Update next.config.mjs**

Add to `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'standalone',
};
```

**Step 3: Build & Run Docker Container**

```bash
# Build image
docker build -t food-directory .

# Run container
docker run -p 3000:3000 food-directory
```

---

## Post-Deployment Checklist

### ✅ Immediate Verification

- [ ] Site is accessible via URL
- [ ] All pages load correctly
- [ ] No 404 errors
- [ ] No console errors
- [ ] SSL certificate is active (HTTPS)
- [ ] Favicon displays correctly
- [ ] All images load
- [ ] All links work

### ✅ Functionality Testing

- [ ] Search works
- [ ] Filters work
- [ ] Navigation works
- [ ] Company profiles load
- [ ] Event pages load
- [ ] API endpoints respond
- [ ] Contact links work (email, phone, WhatsApp)
- [ ] External links open correctly

### ✅ Performance Testing

- [ ] Run Google PageSpeed Insights
- [ ] Check Core Web Vitals
- [ ] Verify load times
- [ ] Test on slow 3G connection
- [ ] Check mobile performance

### ✅ SEO Verification

- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt
- [ ] Check meta tags with SEO tools
- [ ] Test social media previews (Open Graph)
- [ ] Verify structured data (if any)

### ✅ Monitoring Setup

- [ ] Setup error monitoring (e.g., Sentry)
- [ ] Setup analytics (e.g., Google Analytics)
- [ ] Setup uptime monitoring
- [ ] Configure alerts for downtime
- [ ] Setup performance monitoring

---

## Environment Variables

If using environment variables, ensure they're set:

```bash
# .env.production (example)
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# For future MySQL migration
DATABASE_URL=mysql://user:password@host:3306/database
```

**Vercel**: Set in Project Settings → Environment Variables  
**Traditional Hosting**: Create `.env.production` file  
**Docker**: Pass via `-e` flag or docker-compose

---

## Rollback Plan

If deployment fails:

1. **Vercel**: 
   - Go to Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Traditional Hosting**:
   ```bash
   pm2 stop food-directory
   git checkout <previous-commit>
   pnpm install
   pnpm build
   pm2 restart food-directory
   ```

3. **Docker**:
   ```bash
   docker stop <container-id>
   docker run <previous-image-tag>
   ```

---

## Maintenance Tasks

### Regular Tasks

- [ ] Monitor error logs weekly
- [ ] Check analytics monthly
- [ ] Update dependencies quarterly
- [ ] Backup data regularly (when using database)
- [ ] Review and update company data as needed
- [ ] Add new events as they're scheduled

### Security Updates

- [ ] Update Next.js when new versions release
- [ ] Update dependencies for security patches
- [ ] Review and update SSL certificates
- [ ] Monitor for security vulnerabilities

---

## Support & Documentation

After deployment, ensure team has access to:

- [ ] Deployment URL
- [ ] Admin credentials (if applicable)
- [ ] Documentation files (README, guides)
- [ ] Repository access
- [ ] Hosting platform access
- [ ] Domain registrar access
- [ ] SSL certificate details

---

## Success Criteria

Deployment is successful when:

✅ Site is live and accessible  
✅ All functionality works  
✅ No critical errors  
✅ Performance is acceptable  
✅ SEO is configured  
✅ SSL is active  
✅ Monitoring is setup  
✅ Team is trained  
✅ Documentation is complete  

---

## Next Steps After Deployment

1. **Announce Launch**
   - Notify TDAP stakeholders
   - Share with food companies
   - Promote on social media

2. **Gather Feedback**
   - Monitor user behavior
   - Collect feedback from companies
   - Track common issues

3. **Plan Enhancements**
   - Review feature requests
   - Plan MySQL migration
   - Consider admin panel development

4. **Ongoing Maintenance**
   - Keep data updated
   - Add new companies
   - Update events regularly
   - Monitor performance

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Production URL**: _______________  
**Status**: _______________

---

Good luck with your deployment! 🚀
