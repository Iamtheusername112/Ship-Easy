import { supabase } from '@/lib/supabase/client';

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} options.userId - User ID to send notification to
 * @param {string} options.type - Notification type (from notification_type enum)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {Object} options.payload - Additional data (tracking_code, shipment_id, etc.)
 */
export async function createNotification({ userId, type, title, message, payload = {} }) {
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        type,
        title,
        message,
        payload,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create shipment-related notification
 */
export async function notifyShipmentCreated(customerId, trackingCode, recipientName) {
  return createNotification({
    userId: customerId,
    type: 'shipment_created',
    title: 'Shipment Created',
    message: `Your shipment to ${recipientName} has been created successfully.`,
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify courier about assignment
 */
export async function notifyCourierAssigned(courierId, trackingCode, recipientAddress) {
  return createNotification({
    userId: courierId,
    type: 'assigned',
    title: 'New Delivery Assigned',
    message: `You have a new delivery to ${recipientAddress}`,
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify customer about courier assignment
 */
export async function notifyCustomerAssigned(customerId, trackingCode, courierName) {
  return createNotification({
    userId: customerId,
    type: 'assigned',
    title: 'Courier Assigned',
    message: `${courierName || 'A courier'} has been assigned to your shipment.`,
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify about pickup
 */
export async function notifyPickedUp(customerId, trackingCode) {
  return createNotification({
    userId: customerId,
    type: 'picked_up',
    title: 'Package Picked Up',
    message: 'Your package has been picked up and is on its way!',
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify out for delivery
 */
export async function notifyOutForDelivery(customerId, trackingCode) {
  return createNotification({
    userId: customerId,
    type: 'out_for_delivery',
    title: 'Out for Delivery',
    message: 'Your package is out for delivery and will arrive soon!',
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify delivery completed
 */
export async function notifyDelivered(customerId, trackingCode) {
  return createNotification({
    userId: customerId,
    type: 'delivered',
    title: 'Delivered Successfully',
    message: 'Your package has been delivered! Thank you for using ShipEase.',
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify about exception/issue
 */
export async function notifyException(customerId, trackingCode, reason) {
  return createNotification({
    userId: customerId,
    type: 'exception',
    title: 'Delivery Issue',
    message: `There's an issue with your shipment: ${reason}`,
    payload: { tracking_code: trackingCode },
  });
}

/**
 * Notify about ETA update
 */
export async function notifyETAUpdate(customerId, trackingCode, newETA) {
  return createNotification({
    userId: customerId,
    type: 'eta_update',
    title: 'Delivery Time Updated',
    message: `Your delivery time has been updated to ${new Date(newETA).toLocaleString()}`,
    payload: { tracking_code: trackingCode, new_eta: newETA },
  });
}

/**
 * Notify multiple users at once (for broadcast notifications)
 */
export async function notifyMultipleUsers(userIds, type, title, message, payload = {}) {
  try {
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      payload,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notifications:', error);
    return { success: false, error };
  }
}

