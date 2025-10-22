'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Package, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle,
  Truck,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatETA, getStatusColor, getStatusLabel } from '@/utils/tracking';
import TrackingMap from '@/components/TrackingMap';
import TrackingTimeline from '@/components/TrackingTimeline';

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingCode, setTrackingCode] = useState(searchParams.get('code') || '');
  const [shipment, setShipment] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [latestPosition, setLatestPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    if (searchParams.get('code')) {
      handleTrack();
    }
  }, [searchParams]);

  useEffect(() => {
    if (!shipment) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`shipment:${shipment.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_events',
          filter: `shipment_id=eq.${shipment.id}`,
        },
        (payload) => {
          setTrackingEvents((prev) => [payload.new, ...prev]);
          toast.success('New tracking update', {
            description: payload.new.description,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipment.id}`,
        },
        (payload) => {
          setShipment(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [shipment]);

  const handleTrack = async () => {
    if (!trackingCode.trim()) {
      toast.error('Please enter a tracking code');
      return;
    }

    setLoading(true);

    try {
      // Fetch shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_code', trackingCode.toUpperCase().trim())
        .single();

      if (shipmentError) {
        toast.error('Shipment not found', {
          description: 'Please check your tracking code and try again',
        });
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('recorded_at', { ascending: false });

      if (!eventsError) {
        setTrackingEvents(eventsData || []);
      }

      // Fetch latest position
      const { data: positionData } = await supabase
        .from('latest_positions')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .single();

      if (positionData) {
        setLatestPosition(positionData);
      }

      toast.success('Shipment found!');
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('An error occurred while tracking');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = shipment ? getStatusColor(shipment.status) : 'gray';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ShipEase</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Search */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Track Your Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Enter tracking code (e.g., SE-XXXX-XXXX-XXXX)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleTrack}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Tracking...' : 'Track'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Details */}
          <AnimatePresence>
            {shipment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Status Overview */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-400">Tracking Number</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{shipment.tracking_code}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-400">Status</span>
                        </div>
                        <Badge className={`bg-${statusColor}-500 text-white text-lg px-3 py-1`}>
                          {getStatusLabel(shipment.status)}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-400">Estimated Delivery</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {shipment.estimated_delivery
                            ? new Date(shipment.estimated_delivery).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Calculating...'}
                        </p>
                      </div>
                    </div>

                    {shipment.status === 'delivered' && (
                      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">
                            Delivered on{' '}
                            {new Date(shipment.actual_delivery).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {shipment.delivered_to && (
                          <p className="text-sm text-green-300 mt-1">
                            Received by: {shipment.delivered_to}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-700">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'map'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Map View
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'timeline'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="inline h-4 w-4 mr-2" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Package className="inline h-4 w-4 mr-2" />
                    Details
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'map' && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-0">
                      <TrackingMap
                        shipment={shipment}
                        trackingEvents={trackingEvents}
                        latestPosition={latestPosition}
                      />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'timeline' && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6">
                      <TrackingTimeline events={trackingEvents} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Sender</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">{shipment.sender_name}</p>
                            <p className="text-sm text-slate-400">
                              {shipment.sender_address?.line1}
                              {shipment.sender_address?.line2 && `, ${shipment.sender_address.line2}`}
                            </p>
                            <p className="text-sm text-slate-400">
                              {shipment.sender_address?.city}, {shipment.sender_address?.state}{' '}
                              {shipment.sender_address?.postal_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <p className="text-slate-300">{shipment.sender_phone}</p>
                        </div>
                        {shipment.sender_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <p className="text-slate-300">{shipment.sender_email}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Recipient</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">{shipment.recipient_name}</p>
                            <p className="text-sm text-slate-400">
                              {shipment.recipient_address?.line1}
                              {shipment.recipient_address?.line2 && `, ${shipment.recipient_address.line2}`}
                            </p>
                            <p className="text-sm text-slate-400">
                              {shipment.recipient_address?.city}, {shipment.recipient_address?.state}{' '}
                              {shipment.recipient_address?.postal_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <p className="text-slate-300">{shipment.recipient_phone}</p>
                        </div>
                        {shipment.recipient_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <p className="text-slate-300">{shipment.recipient_email}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-white">Package Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-slate-400 mb-1">Weight</p>
                            <p className="text-white font-medium">{shipment.weight_kg} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400 mb-1">Service</p>
                            <p className="text-white font-medium capitalize">
                              {shipment.service_type.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400 mb-1">Created</p>
                            <p className="text-white font-medium">
                              {new Date(shipment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {shipment.price_quoted && (
                            <div>
                              <p className="text-sm text-slate-400 mb-1">Cost</p>
                              <p className="text-white font-medium">
                                ${shipment.price_quoted.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        {shipment.special_instructions && (
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-300">Special Instructions</p>
                                <p className="text-sm text-blue-200">{shipment.special_instructions}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <TrackingContent />
    </Suspense>
  );
}

