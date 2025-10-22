# ShipEase Deployment Guide

## Quick Start

For fastest deployment, use Vercel (recommended for Next.js apps).

---

## Deployment on Vercel

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Supabase project set up

### Steps

1. **Push code to Git repository**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   
   In Vercel project settings, add:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - (Add any optional variables as needed)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-5 minutes)
   - Your app is live! 🎉

5. **Configure OAuth Redirect (if using Google Auth)**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add redirect URL: \`https://your-app.vercel.app/auth/callback\`
   - Update Google Cloud Console with same URL

### Automatic Deployments

Every push to \`main\` branch triggers automatic deployment.

---

## Deployment on Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - New site from Git
   - Connect your repository

2. **Build Settings**
   - Build command: \`npm run build\`
   - Publish directory: \`.next\`

3. **Environment Variables**
   - Add all required environment variables
   - Same as Vercel setup

4. **Deploy**

---

## Docker Deployment

### Build Docker Image

Create \`Dockerfile\`:
\`\`\`dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

Create \`.dockerignore\`:
\`\`\`
node_modules
.next
.git
.env.local
.env*.local
\`\`\`

### Build & Run

\`\`\`bash
# Build
docker build -t shipease .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  shipease
\`\`\`

### Docker Compose

Create \`docker-compose.yml\`:
\`\`\`yaml
version: '3.8'

services:
  shipease:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
\`\`\`

Run:
\`\`\`bash
docker-compose up -d
\`\`\`

---

## VPS Deployment (Ubuntu)

### Prerequisites
- Ubuntu 20.04+ server
- Domain name pointed to server IP
- SSH access

### Steps

1. **Connect to Server**
   \`\`\`bash
   ssh user@your-server-ip
   \`\`\`

2. **Install Node.js**
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   \`\`\`

3. **Install PM2 (Process Manager)**
   \`\`\`bash
   sudo npm install -g pm2
   \`\`\`

4. **Clone Repository**
   \`\`\`bash
   git clone <your-repo-url> /var/www/shipease
   cd /var/www/shipease
   \`\`\`

5. **Install Dependencies & Build**
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

6. **Create Environment File**
   \`\`\`bash
   nano .env.local
   # Add your environment variables
   \`\`\`

7. **Start with PM2**
   \`\`\`bash
   pm2 start npm --name "shipease" -- start
   pm2 save
   pm2 startup
   \`\`\`

8. **Set Up Nginx Reverse Proxy**
   \`\`\`bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/shipease
   \`\`\`

   Add:
   \`\`\`nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

   Enable:
   \`\`\`bash
   sudo ln -s /etc/nginx/sites-available/shipease /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

9. **Set Up SSL with Let's Encrypt**
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   \`\`\`

---

## Environment Variables Checklist

### Required (Minimum)
- [ ] \`NEXT_PUBLIC_SUPABASE_URL\`
- [ ] \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

### Recommended for Production
- [ ] \`NEXT_PUBLIC_MAPBOX_TOKEN\` (for maps)
- [ ] \`SENDGRID_API_KEY\` or \`RESEND_API_KEY\` (for emails)
- [ ] \`NEXT_PUBLIC_SENTRY_DSN\` (error tracking)

### Optional Enhancements
- [ ] \`TWILIO_ACCOUNT_SID\`, \`TWILIO_AUTH_TOKEN\` (SMS)
- [ ] \`STRIPE_SECRET_KEY\` (payments)
- [ ] \`NEXT_PUBLIC_POSTHOG_KEY\` (analytics)

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables set securely
- [ ] HTTPS enabled
- [ ] Supabase RLS policies active
- [ ] OAuth redirect URLs configured
- [ ] API keys rotated from defaults

### Performance
- [ ] Build succeeded without errors
- [ ] Images optimized
- [ ] Database indexes created
- [ ] CDN configured (automatic on Vercel)

### Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Analytics tracking (PostHog)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring enabled

### Functionality
- [ ] Test user sign up
- [ ] Test user sign in
- [ ] Create test shipment
- [ ] Track test shipment
- [ ] Real-time updates working
- [ ] Notifications working
- [ ] 3D visualization rendering

---

## Rollback Strategy

### Vercel
- Go to Deployments
- Click on previous successful deployment
- Click "Promote to Production"

### PM2
\`\`\`bash
cd /var/www/shipease
git pull origin main
npm install
npm run build
pm2 restart shipease
\`\`\`

### Docker
\`\`\`bash
docker pull yourimage:previous-tag
docker-compose up -d
\`\`\`

---

## Scaling Considerations

### Database
- Monitor connection pool usage
- Enable connection pooling (PgBouncer) via Supabase
- Consider read replicas for heavy read loads
- Partition large tables (\`tracking_events\`)

### Application
- Horizontal scaling via load balancer
- CDN for static assets
- Redis for caching (optional)

### Monitoring
- Set up alerts for:
  - High CPU/memory usage
  - Slow database queries
  - Error rate spikes
  - Realtime connection limits

---

## Troubleshooting

### Build Fails
1. Check Node.js version (should be 18+)
2. Clear \`.next\` folder and rebuild
3. Check for linting errors
4. Verify all dependencies installed

### Runtime Errors
1. Check environment variables
2. Check Supabase connection
3. Check browser console for errors
4. Check server logs

### Database Connection Issues
1. Verify Supabase URL and key
2. Check Supabase project status
3. Verify RLS policies
4. Check connection pool limits

---

## Support & Resources

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

---

Last Updated: 2025-10-21

