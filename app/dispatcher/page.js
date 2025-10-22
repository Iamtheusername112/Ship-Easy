'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { notifyCourierAssigned, notifyCustomerAssigned } from '@/utils/createNotification';
import { 
  Package, 
  Truck, 
  TrendingUp,
  Calendar,
  Radio,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Navigation,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DispatcherPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    deliveredToday: 0,
    activeCouriers: 0,
    pendingAssignment: 0,
    urgent: 0,
  });
  const [shipments, setShipments] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (profile && profile.role === 'dispatcher') {
      fetchDispatcherData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchDispatcherData, 30000);
      return () => clearInterval(interval);
    } else if (profile && profile.role !== 'dispatcher') {
      router.push('/dashboard');
      toast.error('Access denied - Dispatcher only');
    }
  }, [profile, router]);

  const fetchDispatcherData = async () => {
    try {
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (shipmentsError) throw shipmentsError;
      setShipments(shipmentsData || []);

      const { data: couriersData, error: couriersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'courier');

      if (couriersError) throw couriersError;
      setCouriers(couriersData || []);

      const { data: vehiclesData } = await supabase.from('vehicles').select('*');
      setVehicles(vehiclesData || []);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        totalShipments: shipmentsData?.length || 0,
        activeShipments: shipmentsData?.filter(s => 
          ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)
        ).length || 0,
        deliveredToday: shipmentsData?.filter(
          s => s.status === 'delivered' && new Date(s.actual_delivery) >= today
        ).length || 0,
        activeCouriers: couriersData?.length || 0,
        pendingAssignment: shipmentsData?.filter(s => s.status === 'pending').length || 0,
        urgent: shipmentsData?.filter(s => 
          new Date(s.estimated_delivery) < new Date(Date.now() + 2 * 60 * 60 * 1000)
        ).length || 0,
      });
    } catch (error) {
      console.error('Error fetching dispatcher data:', error);
      toast.error('Failed to load dispatcher data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourier = async (shipmentId, courierId) => {
    try {
      // Get shipment and courier details for notifications
      const { data: shipment } = await supabase
        .from('shipments')
        .select('customer_id, tracking_code, recipient_address')
        .eq('id', shipmentId)
        .single();

      const { data: courier } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', courierId)
        .single();

      const { error } = await supabase
        .from('shipments')
        .update({ 
          assigned_courier_id: courierId,
          status: 'assigned'
        })
        .eq('id', shipmentId);

      if (error) throw error;

      await supabase.from('tracking_events').insert([
        {
          shipment_id: shipmentId,
          event_type: 'assigned',
          description: 'Courier assigned by dispatcher',
        },
      ]);

      // Send notifications
      if (shipment && courier) {
        const recipientCity = shipment.recipient_address?.city || 'destination';
        await notifyCourierAssigned(courierId, shipment.tracking_code, recipientCity);
        await notifyCustomerAssigned(shipment.customer_id, shipment.tracking_code, courier.full_name);
      }

      toast.success('Courier assigned successfully');
      fetchDispatcherData();
    } catch (error) {
      console.error('Error assigning courier:', error);
      toast.error('Failed to assign courier');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Command Center Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div>
                  <Badge className="mb-2 bg-white/30 text-white">Dispatch Control</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    Operations Center
                  </h1>
                  <p className="text-orange-100">
                    {profile?.full_name} • Live Fleet Management
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-right">
                  <p className="text-white/70 text-xs uppercase">Live Updates</p>
                  <p className="text-white font-bold">Every 30s</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-Time Stats Grid - Operations Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Jobs', value: stats.totalShipments, icon: Package, color: 'from-blue-600 to-cyan-600' },
            { label: 'In Progress', value: stats.activeShipments, icon: Navigation, color: 'from-purple-600 to-pink-600' },
            { label: 'Pending', value: stats.pendingAssignment, icon: Clock, color: 'from-yellow-600 to-orange-600' },
            { label: 'Urgent', value: stats.urgent, icon: AlertTriangle, color: 'from-red-600 to-orange-600' },
            { label: 'Delivered', value: stats.deliveredToday, icon: CheckCircle2, color: 'from-green-600 to-emerald-600' },
            { label: 'Drivers', value: stats.activeCouriers, icon: Users, color: 'from-indigo-600 to-purple-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`relative overflow-hidden bg-gradient-to-br ${stat.color} rounded-xl p-4 shadow-lg`}>
                <div className="absolute top-0 right-0 opacity-20">
                  <stat.icon className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/80 text-xs uppercase font-semibold mb-1">{stat.label}</p>
                  <p className="text-white text-3xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Operations Grid - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Assignment Queue */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <CardTitle className="text-white text-xl">Assignment Queue</CardTitle>
                  {stats.pendingAssignment > 0 ? (
                    <Badge className="bg-red-600 text-white animate-pulse">
                      {stats.pendingAssignment} Urgent
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600/30 text-green-200">
                      All Assigned
                    </Badge>
                  )}
                </div>
                  <Button 
                    onClick={fetchDispatcherData}
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 text-slate-200"
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {shipments
                    .filter(s => s.status === 'pending' || !s.assigned_courier_id)
                    .map((shipment, index) => (
                      <motion.div
                        key={shipment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="bg-slate-900/70 border-2 border-yellow-600/30 rounded-xl p-4 hover:border-yellow-600/60 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white font-bold">{shipment.tracking_code}</p>
                              <Badge className="bg-yellow-600/20 text-yellow-300 text-xs">
                                NEEDS ASSIGNMENT
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-400" />
                                <span className="truncate">{shipment.recipient_address?.city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-orange-400" />
                                <span>{new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <select
                              onChange={(e) => handleAssignCourier(shipment.id, e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                              defaultValue=""
                            >
                              <option value="" disabled>Select Driver</option>
                              {couriers.map((courier) => (
                                <option key={courier.id} value={courier.id}>
                                  {courier.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  {shipments.filter(s => s.status === 'pending').length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                      <p className="font-medium">All shipments assigned!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Active Drivers */}
          <div>
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white text-xl">Active Drivers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {couriers.map((courier, i) => (
                    <motion.div
                      key={courier.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {courier.full_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{courier.full_name}</p>
                          <p className="text-slate-400 text-xs">{courier.phone}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                      <div className="text-xs text-slate-400">
                        <p>
                          {shipments.filter(s => s.assigned_courier_id === courier.id && 
                            ['assigned', 'picked_up', 'in_transit'].includes(s.status)).length} active jobs
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Shipments Overview */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-white text-xl">All Active Shipments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shipments
                .filter(s => ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status))
                .map((shipment, i) => (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-bold text-sm">{shipment.tracking_code}</p>
                      <Badge className={`text-xs ${
                        shipment.status === 'in_transit' ? 'bg-purple-600/20 text-purple-300' :
                        shipment.status === 'picked_up' ? 'bg-orange-600/20 text-orange-300' :
                        'bg-blue-600/20 text-blue-300'
                      }`}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="truncate">To: {shipment.recipient_name}</p>
                      <p className="truncate">{shipment.recipient_address?.city}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
