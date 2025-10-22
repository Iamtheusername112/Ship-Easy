'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  notifyCourierAssigned, 
  notifyCustomerAssigned,
  notifyPickedUp,
  notifyDelivered 
} from '@/utils/createNotification';
import { 
  Package, 
  Navigation, 
  MapPin, 
  Phone, 
  CheckCircle,
  Camera,
  PenTool
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CourierPage() {
  const { profile } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [activeShipment, setActiveShipment] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAssignmentsCount, setNewAssignmentsCount] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchAssignedShipments();
    }
  }, [profile]);

  useEffect(() => {
    if (tracking && activeShipment) {
      // Start GPS tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          sendLocationUpdate(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get location');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [tracking, activeShipment]);

  const fetchAssignedShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('assigned_courier_id', profile.id)
        .in('status', ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'])
        .order('estimated_delivery', { ascending: true });

      if (error) throw error;
      setShipments(data || []);

      // Count new assignments (assigned in last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const newCount = data?.filter(
        s => s.status === 'assigned' && new Date(s.updated_at) > twoHoursAgo
      ).length || 0;
      setNewAssignmentsCount(newCount);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const sendLocationUpdate = async (position) => {
    if (!activeShipment) return;

    try {
      const { error } = await supabase.from('tracking_events').insert([
        {
          shipment_id: activeShipment.id,
          event_type: 'location_update',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed_kmh: position.coords.speed ? (position.coords.speed * 3.6).toFixed(2) : null,
          accuracy_m: position.coords.accuracy,
          heading: position.coords.heading,
          description: 'Location updated',
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  };

  const handleAcceptJob = async (shipmentId) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'assigned' })
        .eq('id', shipmentId);

      if (error) throw error;

      await supabase.from('tracking_events').insert([
        {
          shipment_id: shipmentId,
          event_type: 'assigned',
          description: `Assigned to ${profile.full_name}`,
        },
      ]);

      toast.success('Job accepted!');
      fetchAssignedShipments();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error('Failed to accept job');
    }
  };

  const handleStartTracking = async (shipment) => {
    setActiveShipment(shipment);
    setTracking(true);

    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'picked_up', actual_pickup: new Date().toISOString() })
        .eq('id', shipment.id);

      if (error) throw error;

      await supabase.from('tracking_events').insert([
        {
          shipment_id: shipment.id,
          event_type: 'picked_up',
          description: 'Package picked up by courier',
        },
      ]);

      // Notify customer about pickup
      await notifyPickedUp(shipment.customer_id, shipment.tracking_code);

      toast.success('Tracking started');
      fetchAssignedShipments();
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start tracking');
    }
  };

  const handleStopTracking = () => {
    setTracking(false);
    setActiveShipment(null);
    toast.info('Tracking stopped');
  };

  const handleMarkDelivered = async (shipmentId) => {
    try {
      // Get shipment details for notification
      const { data: shipment } = await supabase
        .from('shipments')
        .select('customer_id, tracking_code')
        .eq('id', shipmentId)
        .single();

      const { error } = await supabase
        .from('shipments')
        .update({ 
          status: 'delivered',
          actual_delivery: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (error) throw error;

      await supabase.from('tracking_events').insert([
        {
          shipment_id: shipmentId,
          event_type: 'delivered',
          description: 'Package delivered successfully',
        },
      ]);

      // Notify customer about delivery
      if (shipment) {
        await notifyDelivered(shipment.customer_id, shipment.tracking_code);
      }

      toast.success('Marked as delivered!');
      fetchAssignedShipments();
      setActiveShipment(null);
      setTracking(false);
    } catch (error) {
      console.error('Error marking delivered:', error);
      toast.error('Failed to mark as delivered');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-4xl">
        {/* Mobile-First Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <Badge className="mb-1 bg-white/20 text-white text-xs">Driver Portal</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {profile?.full_name?.split(' ')[0]}'s Route
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Active</p>
              <p className="text-white text-2xl font-bold">{shipments.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Tracking</p>
              <p className="text-white text-2xl font-bold">{tracking ? '1' : '0'}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs mb-1">Today</p>
              <p className="text-white text-2xl font-bold">{shipments.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Active Tracking - Full Width Mobile Alert */}
        {tracking && activeShipment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 shadow-2xl border-4 border-green-400/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
              >
                <Navigation className="w-8 h-8 text-green-600" />
              </motion.div>
              <div className="flex-1">
                <Badge className="mb-1 bg-white/30 text-white">LIVE GPS TRACKING</Badge>
                <p className="text-white font-bold text-xl">{activeShipment.tracking_code}</p>
                <p className="text-green-100 text-sm">Location updates active</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => handleMarkDelivered(activeShipment.id)}
                className="bg-white text-green-700 hover:bg-green-50 h-14 text-lg font-bold shadow-lg"
              >
                <CheckCircle className="mr-2 h-6 w-6" />
                Complete Delivery
              </Button>
              <Button
                onClick={handleStopTracking}
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 h-14 text-lg"
              >
                Pause Tracking
              </Button>
            </div>
          </motion.div>
        )}

        {/* Deliveries - Mobile-First Cards */}
        <div>
          <h2 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Today's Stops ({shipments.length})
            {newAssignmentsCount > 0 && (
              <Badge className="bg-blue-600 text-white animate-pulse ml-2">
                {newAssignmentsCount} New
              </Badge>
            )}
          </h2>
          
          {loading ? (
            <div className="text-center py-16 bg-slate-800/50 rounded-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
              />
              <p className="text-slate-400 mt-4">Loading your route...</p>
            </div>
          ) : shipments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700"
            >
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Deliveries</h3>
              <p className="text-slate-400">You're all caught up! New jobs will appear here.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {shipments.map((shipment, index) => (
                <motion.div
                  key={shipment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{shipment.tracking_code}</p>
                      <Badge className={`
                        ${shipment.status === 'assigned' ? 'bg-blue-600/30 text-blue-200' : ''}
                        ${shipment.status === 'picked_up' ? 'bg-orange-600/30 text-orange-200' : ''}
                        ${shipment.status === 'in_transit' ? 'bg-purple-600/30 text-purple-200' : ''}
                      `}>
                        {shipment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Recipient Info - Large & Clear */}
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                    <p className="text-slate-400 text-xs uppercase font-semibold mb-2">Deliver To:</p>
                    <p className="text-white font-bold text-xl mb-2">{shipment.recipient_name}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-red-400" />
                        <span className="text-sm">
                          {shipment.recipient_address?.street}, {shipment.recipient_address?.city}, {shipment.recipient_address?.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 flex-shrink-0 text-green-400" />
                        <a href={`tel:${shipment.recipient_phone}`} className="text-sm underline">
                          {shipment.recipient_phone}
                        </a>
                      </div>
                    </div>
                    {shipment.special_instructions && (
                      <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-300 text-xs font-semibold">⚠️ SPECIAL INSTRUCTIONS:</p>
                        <p className="text-yellow-200 text-sm mt-1">{shipment.special_instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/30 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">Weight</p>
                      <p className="text-white font-bold">{shipment.weight_kg} kg</p>
                    </div>
                    <div className="bg-slate-900/30 rounded-lg p-3">
                      <p className="text-slate-500 text-xs mb-1">Due By</p>
                      <p className="text-white font-bold text-sm">
                        {new Date(shipment.estimated_delivery).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons - Big & Thumb-Friendly */}
                  <div className="grid grid-cols-1 gap-2">
                    {shipment.status === 'pending' && (
                      <Button
                        onClick={() => handleAcceptJob(shipment.id)}
                        className="bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold"
                      >
                        Accept This Job
                      </Button>
                    )}
                    {shipment.status === 'assigned' && !tracking && (
                      <>
                        <Button
                          onClick={() => handleStartTracking(shipment)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-16 text-lg font-bold shadow-lg"
                        >
                          <Navigation className="mr-2 h-6 w-6" />
                          Start GPS Tracking
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-200 h-12"
                          asChild
                        >
                          <a href={`https://maps.google.com/?q=${shipment.recipient_address?.street}, ${shipment.recipient_address?.city}`} target="_blank" rel="noopener noreferrer">
                            <MapPin className="mr-2 h-4 w-4" />
                            Open in Maps
                          </a>
                        </Button>
                      </>
                    )}
                    {(shipment.status === 'picked_up' || shipment.status === 'in_transit') &&
                      tracking &&
                      activeShipment?.id === shipment.id && (
                        <Button
                          onClick={() => handleMarkDelivered(shipment.id)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-16 text-lg font-bold shadow-xl"
                        >
                          <CheckCircle className="mr-2 h-6 w-6" />
                          Mark as Delivered
                        </Button>
                      )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install - Driver Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Driver Pro Tip</p>
              <p className="text-indigo-200 text-sm">
                Add ShipEase to your home screen for instant access and work offline during poor signal
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

