# Environment Variables Template

Copy these to your `.env.local` file and fill in your actual values.

## ⚠️ IMPORTANT: NEVER commit .env.local to git!

```env
# ===========================================
# SUPABASE (Required)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# Server-side only (NEVER expose to client!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# ===========================================
# MAPBOX (Optional - for maps)
# ===========================================
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0

# ===========================================
# STRIPE (Optional - for payments)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# ===========================================
# TWILIO (Optional - for SMS)
# ===========================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================================
# SENDGRID (Optional - for email)
# ===========================================
SENDGRID_API_KEY=SG.your-api-key
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# ===========================================
# CLOUDINARY (Optional - for images)
# ===========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# ===========================================
# SENTRY (Optional - for errors)
# ===========================================
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token

# ===========================================
# POSTHOG (Optional - for analytics)
# ===========================================
NEXT_PUBLIC_POSTHOG_KEY=phc_your-project-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ShipEase
```

## How to Use:

1. Create a file named `.env.local` in your project root
2. Copy the variables above
3. Replace the placeholder values with your actual keys
4. Save the file
5. Restart your dev server

## Security Notes:

- ✅ **NEXT_PUBLIC_** variables are exposed to the browser (safe for Supabase anon key, Mapbox token, etc.)
- ⚠️ **Non-NEXT_PUBLIC_** variables are server-side only (keep these secret!)
- 🔒 Never commit `.env.local` to git (it's already in .gitignore)

