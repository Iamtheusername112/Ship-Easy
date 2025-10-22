'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Clock, CheckCircle, Plus, Truck, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    in_transit: 0,
    delivered: 0,
    pending: 0,
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newShipmentsCount, setNewShipmentsCount] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: shipments?.length || 0,
        in_transit: shipments?.filter(s => s.status === 'in_transit').length || 0,
        delivered: shipments?.filter(s => s.status === 'delivered').length || 0,
        pending: shipments?.filter(s => s.status === 'pending').length || 0,
      };

      setStats(stats);
      setRecentShipments(shipments || []);

      // Count new shipments (created in last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newCount = shipments?.filter(
        s => new Date(s.created_at) > yesterday && s.status === 'pending'
      ).length || 0;
      setNewShipmentsCount(newCount);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.total,
      icon: Package,
      color: 'blue',
    },
    {
      title: 'In Transit',
      value: stats.in_transit,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'green',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Premium Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 shadow-xl"
        >
          <div className="absolute right-8 top-8 opacity-20">
            <Package className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <Badge className="mb-3 bg-white/20 text-white">Customer Portal</Badge>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-50 text-lg">Manage your shipments and track deliveries in real-time</p>
            </div>
            {profile?.role === 'customer' && (
              <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-6 font-semibold shadow-lg" asChild>
                <Link href="/dashboard/create">
                  <Plus className="mr-2 h-5 w-5" />
                  New Shipment
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TrendingUp className="h-4 w-4 text-green-400 opacity-50" />
                    </motion.div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Shipments with Enhanced Design */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white text-2xl">Active Shipments</CardTitle>
                  {newShipmentsCount > 0 && (
                    <Badge className="bg-green-600 text-white animate-pulse">
                      {newShipmentsCount} New
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-slate-400">
                  Track and manage your recent deliveries
                </CardDescription>
              </div>
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" asChild>
                <Link href="/dashboard/shipments">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                />
                <p className="text-slate-400 mt-4">Loading shipments...</p>
              </div>
            ) : recentShipments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-slate-900/50 rounded-xl border border-dashed border-slate-700"
              >
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No shipments yet</h3>
                <p className="text-slate-400 mb-6">Start shipping with ShipEase today</p>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg" asChild>
                  <Link href="/dashboard/create">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Shipment
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {recentShipments.map((shipment, index) => (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative p-5 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-white text-lg">{shipment.tracking_code}</p>
                            <Badge className={`
                              ${shipment.status === 'delivered' ? 'bg-green-600/20 text-green-300' : ''}
                              ${shipment.status === 'in_transit' ? 'bg-blue-600/20 text-blue-300' : ''}
                              ${shipment.status === 'pending' ? 'bg-yellow-600/20 text-yellow-300' : ''}
                            `}>
                              {shipment.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{shipment.recipient_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(shipment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          className="border-slate-600 text-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all" 
                          asChild
                        >
                          <Link href={`/track?code=${shipment.tracking_code}`}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Track Live
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

