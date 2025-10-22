# 🔑 Environment Variables You Need for ShipEase

## Quick Reference Guide

This document tells you exactly what environment variables you need and where to get them (all using **FREE tier** services).

---

## ✅ **REQUIRED** - Must Have (2 variables)

### Supabase (FREE - No Credit Card Required)

1. **NEXT_PUBLIC_SUPABASE_URL**
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**

**Where to get:**
1. Go to [supabase.com](https://supabase.com) and sign up (FREE)
2. Create a new project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

**Cost:** 100% FREE
- 500 MB database
- 1 GB file storage  
- 2 GB bandwidth
- Unlimited API requests
- Everything you need to get started!

---

## 🎁 **OPTIONAL** - Enhance Your App (All FREE Tier)

### 🗺️ Maps (Pick ONE)

#### Option 1: Mapbox (Recommended)
- **Variable:** \`NEXT_PUBLIC_MAPBOX_TOKEN\`
- **Get it:** [mapbox.com](https://account.mapbox.com/access-tokens/)
- **FREE Tier:** 50,000 map loads/month
- **Why:** Beautiful maps, easy integration

#### Option 2: Google Maps
- **Variable:** \`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\`
- **Get it:** [console.cloud.google.com](https://console.cloud.google.com/)
- **FREE Tier:** $200 credit/month (~28,000 map loads)
- **Why:** More familiar, Google ecosystem

---

### 📧 Email Notifications (Pick ONE)

#### Option 1: SendGrid
- **Variable:** \`SENDGRID_API_KEY\`
- **Get it:** [sendgrid.com](https://app.sendgrid.com/settings/api_keys)
- **FREE Tier:** 100 emails/day FOREVER
- **Why:** Established, reliable

#### Option 2: Resend (Easier)
- **Variable:** \`RESEND_API_KEY\`
- **Get it:** [resend.com](https://resend.com/api-keys)
- **FREE Tier:** 3,000 emails/month
- **Why:** Simpler, developer-friendly

---

### 📱 SMS Notifications

#### Twilio
- **Variables:**
  - \`TWILIO_ACCOUNT_SID\`
  - \`TWILIO_AUTH_TOKEN\`
  - \`TWILIO_PHONE_NUMBER\`
- **Get it:** [twilio.com](https://console.twilio.com/)
- **FREE Tier:** $15 trial credit
- **Cost after:** ~$0.0075 per SMS
- **Why:** Industry standard for SMS

---

### 💳 Payments

#### Stripe
- **Variables:**
  - \`STRIPE_SECRET_KEY\`
  - \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\`
- **Get it:** [stripe.com](https://dashboard.stripe.com/apikeys)
- **FREE Tier:** No monthly fees
- **Cost:** 2.9% + $0.30 per transaction
- **Why:** Most popular payment processor

---

### 🛣️ Route Optimization (Pick ONE)

#### Option 1: GraphHopper
- **Variable:** \`GRAPHHOPPER_API_KEY\`
- **Get it:** [graphhopper.com](https://www.graphhopper.com/)
- **FREE Tier:** 500 requests/day
- **Why:** Good for route optimization

#### Option 2: OpenRouteService
- **Variable:** \`OPENROUTESERVICE_API_KEY\`
- **Get it:** [openrouteservice.org](https://openrouteservice.org/dev/#/signup)
- **FREE Tier:** 2,000 requests/day
- **Why:** More generous free tier

---

### 📊 Analytics

#### PostHog
- **Variables:**
  - \`NEXT_PUBLIC_POSTHOG_KEY\`
  - \`NEXT_PUBLIC_POSTHOG_HOST\`
- **Get it:** [posthog.com](https://app.posthog.com/)
- **FREE Tier:** 1 million events/month
- **Why:** Product analytics, feature flags, session recording

---

### 🐛 Error Tracking

#### Sentry
- **Variable:** \`NEXT_PUBLIC_SENTRY_DSN\`
- **Get it:** [sentry.io](https://sentry.io/signup/)
- **FREE Tier:** 5,000 errors/month
- **Why:** Catch and fix bugs in production

---

### 📦 File Storage

#### Cloudinary
- **Variables:**
  - \`CLOUDINARY_CLOUD_NAME\`
  - \`CLOUDINARY_API_KEY\`
  - \`CLOUDINARY_API_SECRET\`
- **Get it:** [cloudinary.com](https://cloudinary.com/console)
- **FREE Tier:** 25 GB storage + 25 GB bandwidth/month
- **Why:** Easy image uploads for proof of delivery
- **Note:** Supabase Storage works too (included in Supabase free tier)

---

## 📝 How to Add Environment Variables

### For Local Development

1. Copy the example file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Edit \`.env.local\` and add your keys:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
   \`\`\`

3. Restart your dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

### For Production (Vercel)

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable one by one
4. Redeploy

---

## 🎯 Recommended Setup Phases

### Phase 1: MVP (Start Here)
Just these 2 variables to get started:
- ✅ \`NEXT_PUBLIC_SUPABASE_URL\`
- ✅ \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

**You can create shipments, track packages, and use the entire platform!**

### Phase 2: Better UX
Add maps for visual tracking:
- 🗺️ \`NEXT_PUBLIC_MAPBOX_TOKEN\` **OR** \`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\`

### Phase 3: Notifications
Keep users informed:
- 📧 \`SENDGRID_API_KEY\` **OR** \`RESEND_API_KEY\`
- 📱 Twilio variables (optional)

### Phase 4: Monetization
Accept payments:
- 💳 Stripe variables

### Phase 5: Scale & Monitor
Track and optimize:
- 📊 PostHog variables
- 🐛 Sentry variable

---

## 💰 Total Cost Estimate

### FREE Forever (Perfect for Testing/MVP)
Using all FREE tiers:
- **Supabase:** $0/month (free tier)
- **Mapbox:** $0/month (free tier)
- **SendGrid:** $0/month (free tier)
- **Stripe:** $0/month (just transaction fees)

**Total: $0/month** 🎉

### Small Business (1,000 shipments/month)
- **Supabase Pro:** $25/month
- **Mapbox:** ~$5/month (if exceed free tier)
- **SendGrid:** $15/month (or stay free with 100/day)
- **SMS:** ~$7.50/month (1,000 SMS)
- **Stripe fees:** ~$30 on $1,000 revenue

**Total: ~$50-80/month**

### Growing Business (10,000 shipments/month)
- **Supabase:** $25/month
- **Mapbox:** ~$30/month
- **Email:** $20/month
- **SMS:** ~$75/month
- **Stripe fees:** ~$300

**Total: ~$450/month** (including payment processing)

---

## 🔒 Security Reminders

- ✅ **NEVER** commit \`.env.local\` to Git (already in .gitignore)
- ✅ **NEVER** share your secret keys
- ✅ Use \`NEXT_PUBLIC_\` prefix **ONLY** for public keys
- ✅ Rotate keys every 90 days
- ✅ Use different keys for dev/staging/production

---

## ✨ Quick Start (Copy & Paste)

1. Create \`.env.local\`:
\`\`\`env
# REQUIRED
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OPTIONAL (add as you need them)
NEXT_PUBLIC_MAPBOX_TOKEN=
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
\`\`\`

2. Fill in the values
3. Run \`npm run dev\`
4. Start shipping! 🚀

---

## 📚 Need More Help?

- **Full Environment Variables Guide:** \`docs/ENVIRONMENT_VARIABLES.md\`
- **Setup Guide:** \`SETUP_GUIDE.md\`
- **API Documentation:** \`docs/API_DOCUMENTATION.md\`
- **Deployment Guide:** \`docs/DEPLOYMENT.md\`

---

**Remember:** Start with just Supabase. Add other services as you need them!

Happy coding! 🎉

