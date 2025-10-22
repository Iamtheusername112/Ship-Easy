# ShipEase Database Schema Documentation

## Overview
This document describes the complete database schema for the ShipEase global delivery platform.

## Tables

### profiles
Extends Supabase auth.users with application-specific user data.

**Columns:**
- `id` (UUID, PK): Links to auth.users
- `email` (TEXT): User email address
- `full_name` (TEXT): User's full name
- `phone` (TEXT): Contact phone number
- `role` (ENUM): user_role - customer, courier, dispatcher, admin
- `avatar_url` (TEXT): Profile picture URL
- `notification_preferences` (JSONB): User notification settings
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- Primary key on id
- Unique on email

---

### vehicles
Fleet vehicle information.

**Columns:**
- `id` (UUID, PK)
- `vehicle_no` (TEXT, UNIQUE): Vehicle registration/identifier
- `type` (ENUM): bike, scooter, van, truck, cargo
- `driver_id` (UUID, FK → profiles): Currently assigned driver
- `capacity_kg` (NUMERIC): Weight capacity
- `capacity_m3` (NUMERIC): Volume capacity
- `current_location` (GEOGRAPHY): PostGIS point
- `is_active` (BOOLEAN): Vehicle operational status
- `metadata` (JSONB): Additional vehicle data
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- driver_id
- current_location (GIST)

---

### shipments
Core shipment/parcel records.

**Columns:**
- `id` (UUID, PK)
- `tracking_code` (TEXT, UNIQUE): Public tracking identifier (SE-XXXX-XXXX-XXXX)
- `customer_id` (UUID, FK → profiles)
- Sender fields: name, phone, email, address (JSONB with lat/lng)
- Recipient fields: name, phone, email, address (JSONB)
- `weight_kg`, `volume_m3`, `dimensions` (JSONB)
- `service_type` (ENUM): same_day, next_day, standard, express, freight, pallet, cross_border
- `status` (ENUM): draft, pending, assigned, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled, exception
- `assigned_courier_id`, `assigned_vehicle_id` (FK)
- Pricing: `price_quoted`, `price_final`, `currency`
- Timing: `estimated_pickup`, `estimated_delivery`, `actual_pickup`, `actual_delivery`
- `special_instructions` (TEXT)
- POD: `pod_signature_url`, `pod_photo_url`, `pod_notes`, `delivered_to`
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- tracking_code
- customer_id
- assigned_courier_id
- status
- created_at DESC

---

### tracking_events
Location and status events for shipments.

**Columns:**
- `id` (UUID, PK)
- `shipment_id` (UUID, FK → shipments)
- `event_type` (ENUM): created, assigned, picked_up, in_transit, location_update, out_for_delivery, delivery_attempted, delivered, exception, cancelled
- `location` (GEOGRAPHY): PostGIS point
- `lat`, `lng` (NUMERIC)
- `address` (TEXT): Reverse-geocoded address
- `recorded_at` (TIMESTAMPTZ): When event occurred
- Telemetry: `speed_kmh`, `accuracy_m`, `heading`, `battery_percent`, `temperature_c`
- `description` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- (shipment_id, recorded_at DESC)
- location (GIST)
- recorded_at DESC

**Triggers:**
- Auto-updates `latest_positions` table

---

### latest_positions
Denormalized table for fast access to current shipment/vehicle locations.

**Columns:**
- `id` (UUID, PK)
- `shipment_id` (UUID, UNIQUE FK → shipments)
- `vehicle_id` (UUID, FK → vehicles)
- `location` (GEOGRAPHY)
- `lat`, `lng` (NUMERIC)
- `heading`, `speed_kmh` (NUMERIC)
- `recorded_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- shipment_id (unique)
- vehicle_id
- location (GIST)

**Note:** Automatically updated by trigger on `tracking_events` inserts.

---

### notifications
In-app notification records.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `type` (ENUM): shipment_created, assigned, picked_up, out_for_delivery, delivered, exception, eta_update, payment
- `title`, `message` (TEXT)
- `payload` (JSONB): Additional data
- `read` (BOOLEAN)
- `read_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- (user_id, created_at DESC)
- (user_id, read) where read = false

---

### invoices
Billing and payment records.

**Columns:**
- `id` (UUID, PK)
- `shipment_id` (UUID, FK → shipments)
- `customer_id` (UUID, FK → profiles)
- `amount`, `currency` (NUMERIC, TEXT)
- `status` (TEXT): pending, paid, failed, refunded
- Stripe integration: `stripe_invoice_id`, `stripe_payment_intent_id`, `payment_method`
- `pdf_url` (TEXT)
- `paid_at`, `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- shipment_id
- customer_id
- status

---

### routes
Route optimization and multi-stop delivery plans.

**Columns:**
- `id` (UUID, PK)
- `vehicle_id`, `driver_id` (UUID, FK)
- `shipment_ids` (UUID[]): Array of shipment IDs
- `waypoints` (JSONB): Ordered array of {lat, lng, sequence, shipment_id, type}
- `polyline` (TEXT): Encoded route polyline
- `distance_km`, `duration_minutes` (NUMERIC, INTEGER)
- `status` (TEXT): planned, active, completed, cancelled
- `started_at`, `completed_at`, `created_at`, `updated_at` (TIMESTAMPTZ)

**Indexes:**
- vehicle_id
- driver_id
- status

---

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### profiles
- Users can view and update their own profile
- Admins can view all profiles

### shipments
- Customers can view their own shipments
- Couriers can view assigned shipments
- Admins/dispatchers can view all shipments
- Customers can create shipments
- Couriers can update assigned shipments
- Admins can update all shipments

### tracking_events
- Users can view events for their shipments (customer or assigned courier)
- Couriers can insert events for assigned shipments
- Admins can view all events

### latest_positions
- Users can view positions for their shipments
- Admins can view all positions

### notifications
- Users can view and update their own notifications

### invoices
- Customers can view their own invoices
- Admins can view all invoices

### vehicles & routes
- Drivers can view assigned vehicles/routes
- Admins/dispatchers can view all

---

## Functions

### generate_tracking_code()
Generates unique tracking codes in format: `SE-XXXX-XXXX-XXXX`

### update_latest_position()
Trigger function that automatically updates `latest_positions` when new tracking events are inserted.

### update_updated_at_column()
Trigger function that updates `updated_at` timestamp on row updates.

---

## Realtime Subscriptions

The following tables are published for realtime subscriptions:
- `tracking_events`
- `shipments`
- `latest_positions`
- `notifications`

---

## Performance Considerations

1. **Partitioning**: For high-volume deployments, consider partitioning `tracking_events` by date
2. **Indexing**: All foreign keys and commonly queried fields are indexed
3. **PostGIS**: Spatial queries use GIST indexes for optimal performance
4. **Denormalization**: `latest_positions` provides O(1) access to current locations

---

## Scaling Notes

- Use connection pooling (PgBouncer) for high concurrent loads
- Consider read replicas for analytics queries
- Archive old tracking_events to separate table after 90 days
- Use materialized views for dashboard aggregations

