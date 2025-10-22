'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

export default function TrackingMap({ shipment, trackingEvents, latestPosition }) {
  const [mapReady, setMapReady] = useState(false);
  const [use3D, setUse3D] = useState(false);

  // Extract coordinates from events
  const coordinates = trackingEvents
    .filter(event => event.lat && event.lng)
    .map(event => ({ lat: event.lat, lng: event.lng, time: event.recorded_at }));

  return (
    <div className="relative w-full h-[500px] bg-slate-900 rounded-lg overflow-hidden">
      {/* Map Placeholder / Simple Map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Map Visualization</p>
          <p className="text-sm text-slate-400">
            {latestPosition
              ? `Last updated: ${new Date(latestPosition.recorded_at).toLocaleString()}`
              : 'Tracking updates will appear here'}
          </p>
          
          {latestPosition && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-slate-300">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">
                  Current Position: {latestPosition.lat.toFixed(6)}, {latestPosition.lng.toFixed(6)}
                </span>
              </div>
              {latestPosition.speed_kmh && (
                <p className="text-sm text-slate-400 mt-2">
                  Speed: {latestPosition.speed_kmh.toFixed(1)} km/h
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => setUse3D(!use3D)}
          className="px-3 py-2 bg-slate-800/90 backdrop-blur text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
        >
          {use3D ? '2D View' : '3D View'}
        </button>
      </div>

      {/* Route overlay visualization */}
      {coordinates.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur p-4 rounded-lg">
          <p className="text-white text-sm font-medium mb-2">Route Points</p>
          <div className="space-y-1">
            {coordinates.slice(0, 3).map((coord, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-xs text-slate-400">
                  {new Date(coord.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {coordinates.length > 3 && (
              <p className="text-xs text-slate-500">+{coordinates.length - 3} more updates</p>
            )}
          </div>
        </div>
      )}

      {/* Note about map integration */}
      <div className="absolute bottom-4 right-4 bg-blue-600/20 backdrop-blur border border-blue-500/30 p-3 rounded-lg max-w-xs">
        <p className="text-xs text-blue-200">
          <strong>Note:</strong> For production, integrate with Mapbox GL JS or Google Maps API for full interactive map experience
        </p>
      </div>
    </div>
  );
}

