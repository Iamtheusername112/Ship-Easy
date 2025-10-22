# 🔔 Notifications System Documentation

## Overview
Complete real-time notification system with badges and counts throughout ShipEase.

## Features Implemented

### 1. **Real-Time Notification Bell** 🛎️
- **Location**: Top navigation bar (DashboardLayout)
- **Features**:
  - Red badge showing unread count (animated)
  - Real-time updates via Supabase Realtime
  - Shows "99+" for counts over 99
  - Dropdown notification panel

### 2. **Notification Dropdown Panel** 📋
- **Full Notification List** with:
  - Title, message, and timestamp
  - Relative time display ("2 hours ago")
  - Color-coded icons by notification type
  - Tracking code links (clickable badges)
  - Unread indicator (blue dot on left)
  - Mark as read on click
  - Delete individual notifications
  - "Mark all as read" button
  - "Delete all read" button
- **Empty State**: "All caught up!" message
- **Smooth Animations**: Framer Motion for all transitions

### 3. **Notification Types** 📬

| Type | Icon | Color | Trigger Event |
|------|------|-------|---------------|
| `shipment_created` | Package | Blue | Customer creates shipment |
| `assigned` | Truck | Purple | Courier assigned to shipment |
| `picked_up` | Package | Orange | Courier picks up package |
| `out_for_delivery` | Truck | Cyan | Package out for delivery |
| `delivered` | CheckCircle | Green | Package delivered |
| `exception` | AlertCircle | Red | Delivery issue |
| `eta_update` | Clock | Yellow | ETA changes |
| `payment` | DollarSign | Green | Payment processed |

### 4. **Auto-Notification Triggers** 🤖

#### Customer Notifications:
- ✅ Shipment created
- ✅ Courier assigned (with courier name)
- ✅ Package picked up
- ✅ Out for delivery
- ✅ Delivered successfully

#### Courier Notifications:
- ✅ New delivery assigned (with destination)

#### Dispatcher Notifications:
- *(Can be added for system alerts)*

#### Admin Notifications:
- *(Can be added for system issues)*

### 5. **Dashboard Badges** 🏷️

#### Customer Dashboard:
- **"X New" badge** on "Active Shipments" section
  - Shows shipments created in last 24 hours
  - Green background with pulse animation

#### Courier Dashboard:
- **"X New" badge** on "Today's Stops" heading
  - Shows assignments from last 2 hours
  - Blue background with pulse animation

#### Dispatcher Dashboard:
- **"X Urgent" badge** on "Assignment Queue"
  - Red background when pending assignments exist
  - Green "All Assigned" badge when queue is empty
  - Pulse animation for urgent items

#### Admin Dashboard:
- System health indicators with status dots
- Issue count on Issues card

### 6. **Real-Time Updates** ⚡
- **Supabase Realtime Subscriptions**:
  - Automatically receive new notifications
  - Update unread count instantly
  - No page refresh needed
- **Auto-Refresh Intervals**:
  - Dispatcher: Every 30 seconds
  - Admin: Every 60 seconds

## Technical Implementation

### Files Created/Modified:

1. **`hooks/useNotifications.js`**
   - Custom React hook for notification management
   - Real-time Supabase subscriptions
   - CRUD operations for notifications

2. **`components/NotificationBell.js`**
   - Bell icon with badge in header
   - Dropdown trigger component

3. **`components/NotificationList.js`**
   - Full notification list UI
   - Mark as read/delete functionality
   - Relative time formatting

4. **`utils/createNotification.js`**
   - Helper functions for creating notifications
   - Pre-built notification templates
   - Bulk notification support

5. **`components/DashboardLayout.js`**
   - Integrated NotificationBell component
   - Replaced placeholder bell

6. **Updated Pages**:
   - `app/dashboard/create/page.js` - Create notification on shipment creation
   - `app/courier/page.js` - Notifications for pickup and delivery
   - `app/dispatcher/page.js` - Notifications on courier assignment
   - `app/dashboard/page.js` - New shipment badges
   - `app/admin/page.js` - (Ready for system alerts)

### Database Schema:
Already exists in `supabase/migrations/00001_initial_schema.sql`:

```sql
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
```

## Usage Examples

### Creating a Custom Notification:

```javascript
import { createNotification } from '@/utils/createNotification';

await createNotification({
  userId: 'user-uuid',
  type: 'shipment_created',
  title: 'New Shipment',
  message: 'Your shipment SE123456 has been created',
  payload: {
    tracking_code: 'SE123456',
    shipment_id: 'shipment-uuid'
  }
});
```

### Using Helper Functions:

```javascript
import { 
  notifyShipmentCreated,
  notifyDelivered 
} from '@/utils/createNotification';

// Notify customer about new shipment
await notifyShipmentCreated(customerId, trackingCode, recipientName);

// Notify delivery
await notifyDelivered(customerId, trackingCode);
```

### Using the Hook:

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      <button onClick={markAllAsRead}>Mark all as read</button>
    </div>
  );
}
```

## Future Enhancements (Optional)

- [ ] Push notifications (Web Push API)
- [ ] Email notifications (SendGrid integration)
- [ ] SMS notifications (Twilio integration)
- [ ] Notification preferences per user
- [ ] Notification history page
- [ ] Sound alerts for urgent notifications
- [ ] Desktop notifications
- [ ] Notification templates editor for admins

## Testing

### Test Scenarios:

1. **Create Shipment** → Customer receives "shipment_created" notification
2. **Assign Courier** → Both customer and courier receive notifications
3. **Start Tracking** → Customer receives "picked_up" notification
4. **Mark Delivered** → Customer receives "delivered" notification
5. **Bell Badge** → Shows correct unread count
6. **Click Notification** → Marks as read and removes blue dot
7. **Dashboard Badges** → Show correct counts

### Manual Testing:
1. Create a test shipment as customer
2. Check notification bell for new notification
3. Assign courier as dispatcher
4. Check both customer and courier receive notifications
5. Complete delivery flow
6. Verify all notifications appear correctly

---

**Status**: ✅ **FULLY IMPLEMENTED AND READY FOR PRODUCTION**

