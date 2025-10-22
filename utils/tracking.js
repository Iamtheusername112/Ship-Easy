/**
 * Generate a unique tracking code
 * Format: SE-XXXX-XXXX-XXXX
 */
export function generateTrackingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SE-';
  
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) {
      code += '-';
    }
  }
  
  return code;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate ETA based on distance and average speed
 */
export function calculateETA(distanceKm, averageSpeedKmh = 40) {
  const hours = distanceKm / averageSpeedKmh;
  const now = new Date();
  const eta = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return eta;
}

/**
 * Format ETA for display
 */
export function formatETA(eta) {
  const now = new Date();
  const diff = eta - now;
  
  if (diff < 0) return 'Delayed';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status) {
  const colors = {
    draft: 'gray',
    pending: 'yellow',
    assigned: 'blue',
    picked_up: 'indigo',
    in_transit: 'purple',
    out_for_delivery: 'orange',
    delivered: 'green',
    failed: 'red',
    cancelled: 'gray',
    exception: 'red',
  };
  
  return colors[status] || 'gray';
}

/**
 * Get status label for display
 */
export function getStatusLabel(status) {
  const labels = {
    draft: 'Draft',
    pending: 'Pending',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed: 'Failed',
    cancelled: 'Cancelled',
    exception: 'Exception',
  };
  
  return labels[status] || status;
}

/**
 * Calculate price based on weight, distance and service type
 * This is a simplified pricing model
 */
export function calculatePrice(weightKg, distanceKm, serviceType) {
  const baseRate = {
    same_day: 15,
    next_day: 10,
    standard: 5,
    express: 20,
    freight: 50,
    pallet: 40,
    cross_border: 100,
  };
  
  const base = baseRate[serviceType] || 10;
  const weightCost = weightKg * 0.5;
  const distanceCost = distanceKm * 0.3;
  
  return Math.max(base, base + weightCost + distanceCost);
}

/**
 * Validate tracking code format
 */
export function isValidTrackingCode(code) {
  const pattern = /^SE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(code);
}

