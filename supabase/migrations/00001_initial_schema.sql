-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'courier', 'dispatcher', 'admin');
CREATE TYPE shipment_status AS ENUM (
  'draft', 'pending', 'assigned', 'picked_up', 
  'in_transit', 'out_for_delivery', 'delivered', 
  'failed', 'cancelled', 'exception'
);
CREATE TYPE service_type AS ENUM (
  'same_day', 'next_day', 'standard', 'express', 
  'freight', 'pallet', 'cross_border'
);
CREATE TYPE event_type AS ENUM (
  'created', 'assigned', 'picked_up', 'in_transit', 
  'location_update', 'out_for_delivery', 'delivery_attempted', 
  'delivered', 'exception', 'cancelled'
);
CREATE TYPE notification_type AS ENUM (
  'shipment_created', 'assigned', 'picked_up', 'out_for_delivery', 
  'delivered', 'exception', 'eta_update', 'payment'
);
CREATE TYPE vehicle_type AS ENUM ('bike', 'scooter', 'van', 'truck', 'cargo');

-- =============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true, "in_app": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VEHICLES TABLE
-- =============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_no TEXT UNIQUE NOT NULL,
  type vehicle_type NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  capacity_kg NUMERIC(10, 2),
  capacity_m3 NUMERIC(10, 2),
  current_location GEOGRAPHY(POINT, 4326),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(current_location);

-- =============================================
-- SHIPMENTS TABLE
-- =============================================
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  sender_address JSONB NOT NULL, -- {line1, line2, city, state, postal_code, country, lat, lng}
  
  -- Recipient information
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  recipient_address JSONB NOT NULL,
  
  -- Package details
  weight_kg NUMERIC(10, 2),
  volume_m3 NUMERIC(10, 2),
  dimensions JSONB, -- {length, width, height, unit}
  service_type service_type NOT NULL,
  
  -- Delivery information
  status shipment_status NOT NULL DEFAULT 'pending',
  assigned_courier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Pricing and timing
  price_quoted NUMERIC(10, 2),
  price_final NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  estimated_pickup TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_pickup TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  
  -- Additional data
  special_instructions TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Proof of delivery
  pod_signature_url TEXT,
  pod_photo_url TEXT,
  pod_notes TEXT,
  delivered_to TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_tracking ON shipments(tracking_code);
CREATE INDEX idx_shipments_customer ON shipments(customer_id);
CREATE INDEX idx_shipments_courier ON shipments(assigned_courier_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created ON shipments(created_at DESC);

-- =============================================
-- TRACKING EVENTS TABLE
-- =============================================
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  
  -- Location data
  location GEOGRAPHY(POINT, 4326),
  lat NUMERIC(10, 8),
  lng NUMERIC(10, 8),
  address TEXT,
  
  -- Timing
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional telemetry
  speed_kmh NUMERIC(6, 2),
  accuracy_m NUMERIC(8, 2),
  heading NUMERIC(5, 2),
  battery_percent INTEGER,
  temperature_c NUMERIC(5, 2),
  
  -- Event details
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracking_shipment ON tracking_events(shipment_id, recorded_at DESC);
CREATE INDEX idx_tracking_location ON tracking_events USING GIST(location);
CREATE INDEX idx_tracking_recorded ON tracking_events(recorded_at DESC);

-- =============================================
-- LATEST POSITIONS TABLE (denormalized for performance)
-- =============================================
CREATE TABLE latest_positions (
  id UUID PRIMARY KEY,
  shipment_id UUID UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  lat NUMERIC(10, 8) NOT NULL,
  lng NUMERIC(10, 8) NOT NULL,
  heading NUMERIC(5, 2),
  speed_kmh NUMERIC(6, 2),
  recorded_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_latest_positions_shipment ON latest_positions(shipment_id);
CREATE INDEX idx_latest_positions_vehicle ON latest_positions(vehicle_id);
CREATE INDEX idx_latest_positions_location ON latest_positions USING GIST(location);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_method TEXT,
  
  pdf_url TEXT,
  
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_shipment ON invoices(shipment_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- =============================================
-- ROUTES TABLE (for route optimization)
-- =============================================
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  shipment_ids UUID[] NOT NULL,
  waypoints JSONB NOT NULL, -- Array of {lat, lng, sequence, shipment_id, type: 'pickup'|'delivery'}
  polyline TEXT, -- Encoded polyline
  
  distance_km NUMERIC(10, 2),
  duration_minutes INTEGER,
  
  status TEXT DEFAULT 'planned', -- planned, active, completed, cancelled
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_status ON routes(status);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_latest_positions_updated_at BEFORE UPDATE ON latest_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique tracking code
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'SE-';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    IF i % 4 = 0 AND i < 12 THEN
      result := result || '-';
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update latest_positions from tracking_events
CREATE OR REPLACE FUNCTION update_latest_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location IS NOT NULL THEN
    INSERT INTO latest_positions (id, shipment_id, location, lat, lng, heading, speed_kmh, recorded_at)
    VALUES (uuid_generate_v4(), NEW.shipment_id, NEW.location, NEW.lat, NEW.lng, NEW.heading, NEW.speed_kmh, NEW.recorded_at)
    ON CONFLICT (shipment_id) DO UPDATE SET
      location = EXCLUDED.location,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      heading = EXCLUDED.heading,
      speed_kmh = EXCLUDED.speed_kmh,
      recorded_at = EXCLUDED.recorded_at,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_latest_position_trigger
AFTER INSERT ON tracking_events
FOR EACH ROW EXECUTE FUNCTION update_latest_position();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE latest_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Shipments policies
CREATE POLICY "Customers can view own shipments"
  ON shipments FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Couriers can view assigned shipments"
  ON shipments FOR SELECT
  USING (assigned_courier_id = auth.uid());

CREATE POLICY "Admins and dispatchers can view all shipments"
  ON shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

CREATE POLICY "Customers can create shipments"
  ON shipments FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );

CREATE POLICY "Couriers can update assigned shipments"
  ON shipments FOR UPDATE
  USING (assigned_courier_id = auth.uid());

CREATE POLICY "Admins can update all shipments"
  ON shipments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

-- Tracking events policies
CREATE POLICY "Users can view tracking for their shipments"
  ON tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = tracking_events.shipment_id
      AND (shipments.customer_id = auth.uid() OR shipments.assigned_courier_id = auth.uid())
    )
  );

CREATE POLICY "Couriers can insert tracking events"
  ON tracking_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_id
      AND shipments.assigned_courier_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tracking events"
  ON tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

-- Latest positions policies
CREATE POLICY "Users can view positions for their shipments"
  ON latest_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = latest_positions.shipment_id
      AND (shipments.customer_id = auth.uid() OR shipments.assigned_courier_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all positions"
  ON latest_positions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Invoices policies
CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vehicles policies
CREATE POLICY "Drivers can view assigned vehicles"
  ON vehicles FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Admins can view all vehicles"
  ON vehicles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

-- Routes policies
CREATE POLICY "Drivers can view assigned routes"
  ON routes FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Admins can view all routes"
  ON routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'dispatcher')
    )
  );

-- =============================================
-- REALTIME PUBLICATIONS
-- =============================================

-- Enable realtime for tracking events
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_events;
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE latest_positions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- INITIAL DATA / SEED
-- =============================================

-- This can be populated with initial admin user or test data
-- Will be handled separately in seed file

