import { supabase } from '@/lib/supabase/client';

/**
 * Create a notification for a user
 */
export async function createNotification(userId, type, title, message, payload = {}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        type,
        title,
        message,
        payload,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count;
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(userId, callback) {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Notification templates for different events
 */
export const notificationTemplates = {
  shipment_created: (trackingCode) => ({
    title: 'Shipment Created',
    message: `Your shipment ${trackingCode} has been created successfully.`,
  }),
  assigned: (trackingCode, courierName) => ({
    title: 'Courier Assigned',
    message: `${courierName} has been assigned to deliver your shipment ${trackingCode}.`,
  }),
  picked_up: (trackingCode) => ({
    title: 'Package Picked Up',
    message: `Your shipment ${trackingCode} has been picked up and is on its way.`,
  }),
  out_for_delivery: (trackingCode, eta) => ({
    title: 'Out for Delivery',
    message: `Your shipment ${trackingCode} is out for delivery. Expected arrival: ${eta}.`,
  }),
  delivered: (trackingCode) => ({
    title: 'Delivered',
    message: `Your shipment ${trackingCode} has been delivered successfully.`,
  }),
  exception: (trackingCode, reason) => ({
    title: 'Delivery Exception',
    message: `There was an issue with shipment ${trackingCode}: ${reason}`,
  }),
  eta_update: (trackingCode, newEta) => ({
    title: 'ETA Updated',
    message: `Delivery time for ${trackingCode} has been updated to ${newEta}.`,
  }),
};

