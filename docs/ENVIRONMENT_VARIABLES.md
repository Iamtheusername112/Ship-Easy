# Environment Variables Guide

## Overview

ShipEase uses environment variables to configure external services and API keys. This guide explains what each variable does and where to get it.

---

## 🔴 Required Variables

### Supabase

These are **absolutely required** for the app to function.

#### NEXT_PUBLIC_SUPABASE_URL
- **What**: Your Supabase project URL
- **Where to get**: 
  1. Go to [Supabase Dashboard](https://app.supabase.com/)
  2. Select your project
  3. Go to Settings → API
  4. Copy "Project URL"
- **Example**: \`https://abcdefgh.supabase.co\`
- **Cost**: FREE (up to 500 MB database)

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **What**: Your Supabase anonymous (public) key
- **Where to get**: 
  1. Same location as URL above
  2. Copy "anon public" key
- **Example**: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
- **Cost**: FREE
- **Note**: This key is safe to expose in client-side code (protected by RLS)

---

## 🟡 Recommended Variables

These enhance the user experience significantly.

### Maps & Geolocation

#### NEXT_PUBLIC_MAPBOX_TOKEN
- **What**: Mapbox access token for interactive maps
- **Where to get**:
  1. Sign up at [Mapbox](https://account.mapbox.com/)
  2. Go to Access tokens
  3. Copy default public token or create new one
- **Free Tier**: 50,000 map loads/month
- **Why use**: Beautiful interactive maps, better than browser geolocation visualization
- **Alternative**: Google Maps API

#### NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- **What**: Google Maps API key (alternative to Mapbox)
- **Where to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Maps JavaScript API
  3. Create credentials → API key
- **Free Tier**: $200 credit/month (covers ~28,000 map loads)
- **Note**: Requires billing account (but won't charge until you exceed free tier)

---

## 🟢 Optional - Notifications

### Email

#### SENDGRID_API_KEY
- **What**: SendGrid API key for sending emails
- **Where to get**:
  1. Sign up at [SendGrid](https://sendgrid.com/)
  2. Settings → API Keys
  3. Create API Key with "Mail Send" permission
- **Free Tier**: 100 emails/day forever
- **Use for**: Shipment notifications, status updates, receipts

#### RESEND_API_KEY
- **What**: Resend API key (alternative to SendGrid)
- **Where to get**:
  1. Sign up at [Resend](https://resend.com/)
  2. API Keys → Create API Key
- **Free Tier**: 3,000 emails/month, 100/day
- **Why use**: Simpler API, better for React developers

### SMS

#### TWILIO_ACCOUNT_SID
#### TWILIO_AUTH_TOKEN
#### TWILIO_PHONE_NUMBER
- **What**: Twilio credentials for SMS notifications
- **Where to get**:
  1. Sign up at [Twilio](https://www.twilio.com/)
  2. Console Dashboard shows Account SID and Auth Token
  3. Buy a phone number (or use trial number)
- **Free Tier**: Trial credit ($15.50) for testing
- **Cost**: ~$0.0075/SMS after trial
- **Use for**: Delivery notifications, OTP codes

---

## 🟢 Optional - Payments

### Stripe

#### STRIPE_SECRET_KEY
#### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
#### STRIPE_WEBHOOK_SECRET
- **What**: Stripe credentials for payment processing
- **Where to get**:
  1. Sign up at [Stripe](https://stripe.com/)
  2. Developers → API keys
  3. Copy publishable and secret keys
  4. Webhooks → Add endpoint → Get signing secret
- **Free Tier**: No monthly fee, just transaction fees
- **Transaction Fee**: 2.9% + $0.30 per charge
- **Use for**: Shipment payments, invoicing

---

## 🟢 Optional - Route Optimization

### GraphHopper

#### GRAPHHOPPER_API_KEY
- **What**: Route optimization and directions
- **Where to get**:
  1. Sign up at [GraphHopper](https://www.graphhopper.com/)
  2. Get API key from dashboard
- **Free Tier**: 500 requests/day
- **Use for**: Optimizing delivery routes, ETA calculations

### OpenRouteService

#### OPENROUTESERVICE_API_KEY
- **What**: Alternative routing engine
- **Where to get**:
  1. Sign up at [OpenRouteService](https://openrouteservice.org/)
  2. Request API key
- **Free Tier**: 2,000 requests/day
- **Use for**: Route planning, isochrones

---

## 🟢 Optional - Analytics & Monitoring

### PostHog

#### NEXT_PUBLIC_POSTHOG_KEY
#### NEXT_PUBLIC_POSTHOG_HOST
- **What**: Product analytics and feature flags
- **Where to get**:
  1. Sign up at [PostHog](https://posthog.com/)
  2. Project settings → Project API Key
  3. Host: \`https://app.posthog.com\` or self-hosted URL
- **Free Tier**: 1M events/month
- **Use for**: User behavior tracking, A/B testing

### Sentry

#### NEXT_PUBLIC_SENTRY_DSN
- **What**: Error tracking and monitoring
- **Where to get**:
  1. Sign up at [Sentry](https://sentry.io/)
  2. Create project
  3. Copy DSN from project settings
- **Free Tier**: 5,000 errors/month
- **Use for**: Catching and debugging production errors

---

## 🟢 Optional - File Storage

### Cloudinary

#### CLOUDINARY_CLOUD_NAME
#### CLOUDINARY_API_KEY
#### CLOUDINARY_API_SECRET
- **What**: Image/file hosting and transformation
- **Where to get**:
  1. Sign up at [Cloudinary](https://cloudinary.com/)
  2. Dashboard shows all credentials
- **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **Use for**: Proof of delivery photos, user avatars
- **Note**: Supabase Storage can be used instead

---

## Setting Up Environment Variables

### Local Development

1. Copy \`.env.local.example\` to \`.env.local\`
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your values
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   \`\`\`

3. Restart dev server
   \`\`\`bash
   npm run dev
   \`\`\`

### Production (Vercel)

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add each variable:
   - Name: \`NEXT_PUBLIC_SUPABASE_URL\`
   - Value: \`https://yourproject.supabase.co\`
   - Environments: Production, Preview, Development

4. Redeploy

### Production (Docker)

Pass via Docker run:
\`\`\`bash
docker run -e NEXT_PUBLIC_SUPABASE_URL=value -e NEXT_PUBLIC_SUPABASE_ANON_KEY=value app
\`\`\`

Or via \`.env\` file:
\`\`\`bash
docker run --env-file .env app
\`\`\`

---

## Security Best Practices

### ✅ DO
- Use different keys for dev/staging/prod
- Rotate keys regularly (every 90 days)
- Use \`NEXT_PUBLIC_\` prefix ONLY for public keys
- Keep \`.env.local\` in \`.gitignore\`
- Use environment-specific keys in CI/CD

### ❌ DON'T
- Commit \`.env.local\` to Git
- Share keys in Slack/email
- Use production keys in development
- Hardcode keys in source code
- Use \`NEXT_PUBLIC_\` for secret keys

---

## Validation

Check if variables are loaded:
\`\`\`javascript
// In any component
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
\`\`\`

---

## Cost Summary (All Free Tiers)

| Service | Free Tier | Typical Cost After |
|---------|-----------|-------------------|
| Supabase | 500 MB DB, 1 GB storage | $25/mo (Pro) |
| Mapbox | 50k loads/month | $5/1000 loads |
| SendGrid | 100 emails/day | $15/mo (40k) |
| Resend | 3k emails/month | $20/mo (50k) |
| Twilio | $15 trial credit | $0.0075/SMS |
| Stripe | $0/month | 2.9% + $0.30/charge |
| PostHog | 1M events/month | $0/mo (self-host) |
| Sentry | 5k errors/month | $26/mo (50k) |

**Total Monthly Cost for Starter App**: $0 (using all free tiers)

---

## Common Issues

### "Supabase is not defined"
- Ensure \`NEXT_PUBLIC_SUPABASE_URL\` and \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` are set
- Restart dev server after adding variables

### Environment variables not updating
- Restart Next.js dev server
- In production, redeploy the application

### "Invalid API key" errors
- Double-check you copied the entire key
- Ensure no trailing spaces
- Verify key is for correct environment (dev/prod)

---

Last Updated: 2025-10-21

