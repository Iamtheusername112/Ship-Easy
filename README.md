# ShipEase - Global Delivery Platform

> A comprehensive full-stack delivery platform with real-time tracking, 3D visualization, and intelligent logistics management.

![ShipEase Banner](https://via.placeholder.com/1200x400/0f172a/3b82f6?text=ShipEase+-+Global+Delivery+Platform)

## 🚀 Features

### Core Features
- ✅ **Multi-Role Authentication** - Customer, Courier, Dispatcher, and Admin roles
- ✅ **Real-Time Tracking** - Live GPS tracking with Supabase Realtime
- ✅ **3D/4D/5D Visualization** - Advanced WebGL tracking with react-three-fiber
- ✅ **PWA for Couriers** - Installable app with offline support
- ✅ **Smart Notifications** - In-app toasts with Sonner
- ✅ **Multiple Service Types** - Same-day, next-day, standard, express, freight, pallet, cross-border
- ✅ **Admin Dashboard** - Fleet management and shipment assignment
- ✅ **Proof of Delivery** - Photo and signature capture (framework ready)
- ✅ **Timeline View** - Detailed shipment history
- ✅ **ETA Calculations** - Dynamic delivery estimates

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- JavaScript (strict mode)
- Tailwind CSS 4
- shadcn/ui components
- Framer Motion animations
- react-three-fiber (3D visualization)
- Sonner (notifications)
- Lucide React (icons)

**Backend:**
- Supabase (Authentication, Database, Realtime, Storage)
- PostgreSQL with PostGIS
- Row Level Security (RLS)

**Maps & Location:**
- Mapbox GL JS (ready for integration)
- Browser Geolocation API

---

## 📋 Prerequisites

- Node.js 20+ (recommended) or 18+
- npm or yarn
- Supabase account (free tier)
- Optional: Mapbox account for maps (free tier)

---

## 🛠️ Installation

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd ship-ease
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Mapbox for advanced maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Optional: SendGrid for email notifications
SENDGRID_API_KEY=your_sendgrid_api_key

# Optional: Twilio for SMS notifications
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Optional: Stripe for payments
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
\`\`\`

### 4. Set up Supabase

#### Option A: Using Supabase CLI (Recommended)

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
\`\`\`

#### Option B: Manual Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Go to **SQL Editor**
4. Copy and paste the contents of \`supabase/migrations/00001_initial_schema.sql\`
5. Run the migration

### 5. Configure Authentication

In your Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google OAuth**:
   - Add your Google OAuth credentials
   - Add redirect URL: \`http://localhost:3000/auth/callback\` (dev) or \`https://yourdomain.com/auth/callback\` (prod)

### 6. Set up Row Level Security

The migration file automatically sets up RLS policies. Verify in Supabase Dashboard:
- Go to **Authentication** → **Policies**
- Ensure all tables have policies enabled

---

## 🚀 Running the Application

### Development Mode

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

---

## 📱 User Roles & Features

### Customer
- Create shipments
- Track packages in real-time
- View 3D tracking visualization
- Receive notifications
- Access shipment history

### Courier
- View assigned deliveries
- Accept jobs
- Start/stop GPS tracking
- Mark deliveries as complete
- Proof of delivery (photo + signature)

### Dispatcher/Admin
- View all shipments
- Assign couriers to shipments
- Manage fleet vehicles
- View analytics and stats
- Monitor real-time fleet positions

---

## 🗺️ API Routes

### Authentication
- Uses Supabase Auth (email/password, OAuth)

### Shipments
- \`POST /api/shipments\` - Create shipment (planned)
- \`GET /api/shipments/:id\` - Get shipment details (planned)
- Direct Supabase client queries used currently

### Tracking
- Real-time subscriptions via Supabase Realtime
- GPS pings stored in \`tracking_events\` table

---

## 🗄️ Database Schema

### Key Tables

**profiles**
- User information and roles
- Notification preferences

**shipments**
- Core shipment records
- Sender/recipient information
- Pricing and timing
- Status tracking

**tracking_events**
- GPS location updates
- Status change events
- Telemetry data (speed, temperature, battery)

**latest_positions**
- Denormalized current positions
- Fast lookup for map rendering

**notifications**
- In-app notifications
- Read status tracking

**vehicles**
- Fleet vehicle information
- Driver assignments

**routes**
- Multi-stop route planning
- Route optimization ready

See \`supabase/DATABASE_SCHEMA.md\` for complete schema documentation.

---

## 🎨 UI Components

Built with shadcn/ui:
- Button, Card, Input, Label
- Select, Tabs, Dialog
- Dropdown Menu, Avatar, Badge
- Sheet, Slider

All components are customized for the ShipEase dark theme.

---

## 🔐 Security

- **Row Level Security (RLS)** - Enforced on all tables
- **Server-side auth** - Secure token validation
- **HTTPS only** - Required in production
- **Environment variables** - Secrets never committed
- **Data encryption** - Supabase handles at rest and in transit

---

## 📈 Performance Optimization

- **Server Components** - Default for static content
- **Client Components** - Only where needed (interactivity)
- **Image Optimization** - Next.js automatic optimization
- **Code Splitting** - Automatic route-based splitting
- **Realtime Subscriptions** - Efficient Postgres Change Data Capture
- **Indexed Queries** - All foreign keys and common queries indexed

---

## 🧪 Testing (Future)

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint
\`\`\`

---

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Docker (Alternative)

\`\`\`bash
docker build -t shipease .
docker run -p 3000:3000 shipease
\`\`\`

### Environment Variables

Ensure all required variables are set in production:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

---

## 🔧 Configuration

### Tailwind Config
Located in \`app/globals.css\` (Tailwind v4 uses CSS-first config)

### Next.js Config
Located in \`next.config.mjs\`

### shadcn/ui Config
Located in \`components.json\`

---

## 🚦 Roadmap

### Phase 1 (MVP) ✅
- [x] Authentication & user roles
- [x] Shipment creation
- [x] Real-time tracking
- [x] Courier PWA
- [x] Admin dashboard
- [x] 3D visualization

### Phase 2 (In Progress)
- [ ] Proof of delivery (photo + signature)
- [ ] Mapbox integration for real maps
- [ ] Payment processing (Stripe)
- [ ] Email & SMS notifications

### Phase 3 (Planned)
- [ ] Route optimization
- [ ] Multi-carrier integration
- [ ] Advanced analytics
- [ ] Mobile apps (React Native)
- [ ] IoT sensor integration
- [ ] ML-powered ETA predictions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit changes (\`git commit -m 'Add amazing feature'\`)
4. Push to branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber/) - 3D rendering
- [Lucide](https://lucide.dev/) - Icons

---

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Email: support@shipease.com (example)
- Documentation: See \`docs/\` folder

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
# Ship-Easy
