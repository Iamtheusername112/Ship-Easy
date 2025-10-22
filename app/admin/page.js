'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  Users, 
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Database,
  Server,
  Zap,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    deliveredToday: 0,
    deliveredThisWeek: 0,
    deliveredThisMonth: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    avgDeliveryTime: 0,
    onTimeRate: 0,
    activeCouriers: 0,
    totalCustomers: 0,
    vehicles: 0,
    pendingIssues: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (profile && profile.role === 'admin') {
      fetchAdminData();
      // Auto-refresh every minute
      const interval = setInterval(fetchAdminData, 60000);
      return () => clearInterval(interval);
    } else if (profile && profile.role === 'dispatcher') {
      router.push('/dispatcher');
      toast.info('Redirecting to Dispatcher dashboard');
    } else if (profile && profile.role !== 'admin') {
      router.push('/dashboard');
      toast.error('Access denied - Admin only');
    }
  }, [profile, router]);

  const fetchAdminData = async () => {
    try {
      const { data: shipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: couriersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'courier');

      const { data: customersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      const { data: vehiclesData } = await supabase.from('vehicles').select('*');
      
      const { data: eventsData } = await supabase
        .from('tracking_events')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(10);

      const shipments = shipmentsData || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const deliveredToday = shipments.filter(
        s => s.status === 'delivered' && new Date(s.actual_delivery) >= today
      ).length;

      const deliveredThisWeek = shipments.filter(
        s => s.status === 'delivered' && new Date(s.actual_delivery) >= weekAgo
      ).length;

      const deliveredThisMonth = shipments.filter(
        s => s.status === 'delivered' && new Date(s.actual_delivery) >= monthStart
      ).length;

      const totalRevenue = shipments
        .filter(s => s.status === 'delivered')
        .reduce((sum, s) => sum + (s.price_final || s.price_quoted || 0), 0);

      const monthlyRevenue = shipments
        .filter(s => s.status === 'delivered' && new Date(s.actual_delivery) >= monthStart)
        .reduce((sum, s) => sum + (s.price_final || s.price_quoted || 0), 0);

      const deliveredShipments = shipments.filter(s => s.status === 'delivered' && s.actual_delivery && s.estimated_delivery);
      const onTimeDeliveries = deliveredShipments.filter(s => 
        new Date(s.actual_delivery) <= new Date(s.estimated_delivery)
      ).length;
      const onTimeRate = deliveredShipments.length > 0 
        ? (onTimeDeliveries / deliveredShipments.length * 100).toFixed(1)
        : 0;

      setStats({
        totalShipments: shipments.length,
        activeShipments: shipments.filter(s => 
          ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)
        ).length,
        deliveredToday,
        deliveredThisWeek,
        deliveredThisMonth,
        totalRevenue,
        monthlyRevenue,
        avgDeliveryTime: 24, // Mock data
        onTimeRate,
        activeCouriers: couriersData?.length || 0,
        totalCustomers: customersData?.length || 0,
        vehicles: vehiclesData?.length || 0,
        pendingIssues: shipments.filter(s => s.status === 'exception').length,
      });

      setRecentActivity(eventsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Executive Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-8 shadow-2xl"
        >
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-red-500/30 text-white border border-red-400/50">
                      Administrator
                    </Badge>
                    <Badge className="bg-white/20 text-white border border-white/30">
                      Executive Dashboard
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-1">
                    System Overview
                  </h1>
                  <p className="text-purple-200">
                    {profile?.full_name} • Full Platform Control & Analytics
                  </p>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span className="text-white text-sm">All Systems Operational</span>
                  </div>
                </div>
                <Button 
                  onClick={fetchAdminData}
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12%' },
                { label: 'Active Shipments', value: stats.activeShipments, icon: Package, trend: '+5%' },
                { label: 'On-Time Rate', value: `${stats.onTimeRate}%`, icon: CheckCircle2, trend: '+2%' },
                { label: 'Total Customers', value: stats.totalCustomers, icon: Users, trend: '+18%' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/10 backdrop-blur rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className="w-5 h-5 text-white/70" />
                    <span className="text-green-300 text-xs font-semibold">{item.trend}</span>
                  </div>
                  <p className="text-white/70 text-xs mb-1">{item.label}</p>
                  <p className="text-white text-2xl font-bold">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Today', value: stats.deliveredToday, icon: Calendar, color: 'blue' },
                  { label: 'This Week', value: stats.deliveredThisWeek, icon: TrendingUp, color: 'green' },
                  { label: 'This Month', value: stats.deliveredThisMonth, icon: PieChart, color: 'purple' },
                  { label: 'Avg Time', value: `${stats.avgDeliveryTime}h`, icon: Activity, color: 'orange' },
                ].map((metric, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className={`bg-gradient-to-br from-${metric.color}-600/20 to-${metric.color}-800/20 border border-${metric.color}-500/30 rounded-xl p-4`}
                  >
                    <metric.icon className={`w-8 h-8 text-${metric.color}-400 mb-3`} />
                    <p className="text-white text-3xl font-bold mb-1">{metric.value}</p>
                    <p className="text-slate-400 text-sm">{metric.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-green-400" />
                <CardTitle className="text-white">System Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'API Status', status: 'Operational', value: 99.9, color: 'green' },
                  { name: 'Database', status: 'Healthy', value: 98.5, color: 'green' },
                  { name: 'GPS Tracking', status: 'Active', value: 100, color: 'green' },
                  { name: 'Notifications', status: 'Running', value: 97.2, color: 'yellow' },
                ].map((system, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 bg-${system.color}-400 rounded-full animate-pulse`} />
                      <div>
                        <p className="text-white text-sm font-medium">{system.name}</p>
                        <p className="text-slate-400 text-xs">{system.status}</p>
                      </div>
                    </div>
                    <Badge className={`bg-${system.color}-600/20 text-${system.color}-300`}>
                      {system.value}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Monthly Revenue',
              value: `$${stats.monthlyRevenue.toLocaleString()}`,
              icon: DollarSign,
              gradient: 'from-green-600 to-emerald-700',
              description: 'Current month earnings',
            },
            {
              title: 'Fleet Size',
              value: stats.vehicles,
              icon: Truck,
              gradient: 'from-blue-600 to-cyan-700',
              description: `${stats.activeCouriers} active drivers`,
            },
            {
              title: 'Total Shipments',
              value: stats.totalShipments,
              icon: Package,
              gradient: 'from-purple-600 to-pink-700',
              description: 'All-time deliveries',
            },
            {
              title: 'Issues',
              value: stats.pendingIssues,
              icon: AlertCircle,
              gradient: stats.pendingIssues > 0 ? 'from-red-600 to-orange-700' : 'from-slate-600 to-slate-700',
              description: stats.pendingIssues > 0 ? 'Requires attention' : 'All clear',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <Card className={`bg-gradient-to-br ${card.gradient} border-none shadow-lg`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <Award className="w-5 h-5 text-white/50" />
                  </div>
                  <p className="text-white/80 text-sm mb-2">{card.title}</p>
                  <p className="text-white text-3xl font-bold mb-1">{card.value}</p>
                  <p className="text-white/60 text-xs">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-white">Live Activity Stream</CardTitle>
                <Badge className="bg-purple-600/20 text-purple-300 ml-auto">Real-time</Badge>
              </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {recentActivity.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-white text-sm">{event.description || event.event_type}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(event.recorded_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-white">User Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Customers', value: stats.totalCustomers, color: 'blue', icon: Users },
                  { label: 'Couriers', value: stats.activeCouriers, color: 'green', icon: Truck },
                  { label: 'Vehicles', value: stats.vehicles, color: 'purple', icon: Truck },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className={`bg-${stat.color}-600/10 border border-${stat.color}-500/30 rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${stat.color}-600/20 rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        <p className="text-white font-medium">{stat.label}</p>
                      </div>
                      <p className="text-white text-2xl font-bold">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
