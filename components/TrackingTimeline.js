'use client';

import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  AlertCircle,
  Clock,
  Navigation,
} from 'lucide-react';

const eventIcons = {
  created: Package,
  assigned: Truck,
  picked_up: Navigation,
  in_transit: Truck,
  location_update: MapPin,
  out_for_delivery: Truck,
  delivery_attempted: AlertCircle,
  delivered: CheckCircle,
  exception: AlertCircle,
  cancelled: AlertCircle,
};

const eventColors = {
  created: 'blue',
  assigned: 'purple',
  picked_up: 'indigo',
  in_transit: 'cyan',
  location_update: 'gray',
  out_for_delivery: 'orange',
  delivery_attempted: 'yellow',
  delivered: 'green',
  exception: 'red',
  cancelled: 'gray',
};

export default function TrackingTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No tracking events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = eventIcons[event.event_type] || MapPin;
        const color = eventColors[event.event_type] || 'gray';
        const isLatest = index === 0;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4"
          >
            {/* Timeline line */}
            {index < events.length - 1 && (
              <div className="absolute left-[19px] top-[48px] w-0.5 h-full bg-slate-700" />
            )}

            {/* Event icon */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full bg-${color}-500/20 border-2 border-${color}-500 flex items-center justify-center flex-shrink-0 ${
                isLatest ? 'ring-4 ring-' + color + '-500/30' : ''
              }`}
            >
              <Icon className={`h-5 w-5 text-${color}-400`} />
            </div>

            {/* Event content */}
            <div className="flex-1 pb-8">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold capitalize">
                      {event.event_type.replace(/_/g, ' ')}
                      {isLatest && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-400`}>
                          Latest
                        </span>
                      )}
                    </h3>
                    {event.description && (
                      <p className="text-slate-400 text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <p>{new Date(event.recorded_at).toLocaleDateString()}</p>
                    <p>{new Date(event.recorded_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                {/* Location info */}
                {event.lat && event.lng && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.address || `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`}
                    </span>
                  </div>
                )}

                {/* Telemetry data */}
                {(event.speed_kmh || event.temperature_c || event.battery_percent) && (
                  <div className="mt-3 flex gap-4 text-sm">
                    {event.speed_kmh && (
                      <div className="text-slate-400">
                        <span className="text-slate-500">Speed:</span> {event.speed_kmh} km/h
                      </div>
                    )}
                    {event.temperature_c && (
                      <div className="text-slate-400">
                        <span className="text-slate-500">Temp:</span> {event.temperature_c}°C
                      </div>
                    )}
                    {event.battery_percent && (
                      <div className="text-slate-400">
                        <span className="text-slate-500">Battery:</span> {event.battery_percent}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

