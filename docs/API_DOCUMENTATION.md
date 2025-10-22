# ShipEase API Documentation

## Overview

ShipEase uses Supabase as its backend, providing a RESTful API through Supabase's auto-generated API and real-time subscriptions.

---

## Authentication

### Sign Up
\`\`\`javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '+1234567890',
      role: 'customer'
    }
  }
});
\`\`\`

### Sign In
\`\`\`javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});
\`\`\`

### Sign In with Google
\`\`\`javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
\`\`\`

### Sign Out
\`\`\`javascript
const { error } = await supabase.auth.signOut();
\`\`\`

### Get Current User
\`\`\`javascript
const { data: { user } } = await supabase.auth.getUser();
\`\`\`

---

## Shipments

### Create Shipment
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .insert([{
    tracking_code: 'SE-XXXX-XXXX-XXXX',
    customer_id: userId,
    sender_name: 'John Doe',
    sender_phone: '+1234567890',
    sender_address: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US'
    },
    recipient_name: 'Jane Smith',
    recipient_phone: '+0987654321',
    recipient_address: {
      line1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postal_code: '90001',
      country: 'US'
    },
    weight_kg: 2.5,
    service_type: 'standard',
    status: 'pending'
  }])
  .select()
  .single();
\`\`\`

### Get Shipment by ID
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .select('*')
  .eq('id', shipmentId)
  .single();
\`\`\`

### Get Shipment by Tracking Code
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .select('*')
  .eq('tracking_code', 'SE-XXXX-XXXX-XXXX')
  .single();
\`\`\`

### Get Customer Shipments
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .select('*')
  .eq('customer_id', userId)
  .order('created_at', { ascending: false });
\`\`\`

### Update Shipment Status
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .update({ status: 'in_transit' })
  .eq('id', shipmentId);
\`\`\`

### Assign Courier
\`\`\`javascript
const { data, error } = await supabase
  .from('shipments')
  .update({ 
    assigned_courier_id: courierId,
    status: 'assigned'
  })
  .eq('id', shipmentId);
\`\`\`

---

## Tracking Events

### Create Tracking Event
\`\`\`javascript
const { data, error } = await supabase
  .from('tracking_events')
  .insert([{
    shipment_id: shipmentId,
    event_type: 'location_update',
    lat: 40.7128,
    lng: -74.0060,
    speed_kmh: 45.5,
    accuracy_m: 10,
    heading: 180,
    description: 'Package in transit'
  }]);
\`\`\`

### Get Tracking Events for Shipment
\`\`\`javascript
const { data, error } = await supabase
  .from('tracking_events')
  .select('*')
  .eq('shipment_id', shipmentId)
  .order('recorded_at', { ascending: false });
\`\`\`

### Subscribe to Tracking Events (Real-time)
\`\`\`javascript
const subscription = supabase
  .channel('tracking-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'tracking_events',
      filter: \`shipment_id=eq.\${shipmentId}\`
    },
    (payload) => {
      console.log('New tracking event:', payload.new);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
\`\`\`

---

## Latest Positions

### Get Latest Position
\`\`\`javascript
const { data, error } = await supabase
  .from('latest_positions')
  .select('*')
  .eq('shipment_id', shipmentId)
  .single();
\`\`\`

### Get All Active Vehicle Positions
\`\`\`javascript
const { data, error } = await supabase
  .from('latest_positions')
  .select('*, shipments(*)')
  .not('vehicle_id', 'is', null);
\`\`\`

---

## Notifications

### Create Notification
\`\`\`javascript
const { data, error } = await supabase
  .from('notifications')
  .insert([{
    user_id: userId,
    type: 'shipment_created',
    title: 'Shipment Created',
    message: 'Your shipment SE-XXXX-XXXX-XXXX has been created',
    payload: { tracking_code: 'SE-XXXX-XXXX-XXXX' }
  }]);
\`\`\`

### Get User Notifications
\`\`\`javascript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
\`\`\`

### Mark as Read
\`\`\`javascript
const { error } = await supabase
  .from('notifications')
  .update({ 
    read: true,
    read_at: new Date().toISOString()
  })
  .eq('id', notificationId);
\`\`\`

### Subscribe to Notifications (Real-time)
\`\`\`javascript
const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: \`user_id=eq.\${userId}\`
    },
    (payload) => {
      toast.success(payload.new.title, {
        description: payload.new.message
      });
    }
  )
  .subscribe();
\`\`\`

---

## Profiles

### Get Profile
\`\`\`javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
\`\`\`

### Update Profile
\`\`\`javascript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'John Doe Updated',
    phone: '+1234567890',
    notification_preferences: {
      email: true,
      sms: false,
      push: true,
      in_app: true
    }
  })
  .eq('id', userId);
\`\`\`

### Get Couriers
\`\`\`javascript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'courier');
\`\`\`

---

## Vehicles

### Get All Vehicles
\`\`\`javascript
const { data, error } = await supabase
  .from('vehicles')
  .select('*');
\`\`\`

### Get Vehicle by ID
\`\`\`javascript
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', vehicleId)
  .single();
\`\`\`

### Create Vehicle
\`\`\`javascript
const { data, error } = await supabase
  .from('vehicles')
  .insert([{
    vehicle_no: 'VAN-001',
    type: 'van',
    capacity_kg: 1000,
    capacity_m3: 10,
    is_active: true
  }]);
\`\`\`

### Assign Driver to Vehicle
\`\`\`javascript
const { data, error } = await supabase
  .from('vehicles')
  .update({ driver_id: driverId })
  .eq('id', vehicleId);
\`\`\`

---

## Real-time Subscriptions

### Subscribe to Shipment Updates
\`\`\`javascript
const channel = supabase
  .channel(\`shipment:\${shipmentId}\`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'shipments',
      filter: \`id=eq.\${shipmentId}\`
    },
    (payload) => {
      console.log('Shipment updated:', payload);
    }
  )
  .subscribe();
\`\`\`

---

## Error Handling

All Supabase operations return an object with \`data\` and \`error\`:

\`\`\`javascript
const { data, error } = await supabase.from('shipments').select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error
} else {
  console.log('Data:', data);
  // Use data
}
\`\`\`

---

## Rate Limits

Supabase Free Tier:
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50k monthly active users
- Unlimited API requests

For production, upgrade to Pro tier for higher limits.

---

## Security

All API requests are automatically secured with:
1. Row Level Security (RLS) policies
2. JWT token validation
3. HTTPS encryption

Never expose your \`service_role\` key in client-side code!

---

For more information, visit [Supabase Documentation](https://supabase.com/docs).

