'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Globe, Zap, Shield, BarChart3, MapPin, Clock, Box } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import DeliveryTruck3D from '@/components/3D/DeliveryTruck3D';
import PackageBox3D from '@/components/3D/PackageBox3D';
import Globe3D from '@/components/3D/Globe3D';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const features = [
    {
      icon: Globe,
      title: 'Global Shipping Network',
      description: 'Deliver to 195+ countries with real-time GPS tracking',
      color: 'blue',
    },
    {
      icon: Truck,
      title: 'Fleet Management',
      description: 'Manage delivery vehicles and optimize routes in real-time',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Same-Day Delivery',
      description: 'Lightning-fast delivery with guaranteed time windows',
      color: 'purple',
    },
    {
      icon: MapPin,
      title: 'Live Tracking',
      description: '3D visualization with live courier location updates',
      color: 'orange',
    },
    {
      icon: Shield,
      title: 'Proof of Delivery',
      description: 'Photo verification and digital signatures for security',
      color: 'red',
    },
    {
      icon: Box,
      title: 'Multi-Package Support',
      description: 'Handle parcels, pallets, freight, and cross-border shipping',
      color: 'indigo',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section with 3D */}
      <div className="relative overflow-hidden min-h-screen">
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-40">
          <Canvas>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[0, 0, 10]} />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
              <DeliveryTruck3D />
              <PackageBox3D position={[-3, 2, -2]} delay={0} />
              <PackageBox3D position={[3, 1, -3]} delay={1} />
              <PackageBox3D position={[2, -1, -1]} delay={2} />
            </Suspense>
          </Canvas>
        </div>
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Truck className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-white">ShipEase</span>
            <Badge className="ml-2 bg-blue-600/20 text-blue-300 text-xs">Logistics Platform</Badge>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Truck className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-200 font-medium">Professional Shipping & Logistics Platform</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Global Delivery{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text">
                Made Simple
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-slate-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Ship parcels, pallets & freight worldwide with real-time GPS tracking,
              <br/>proof of delivery, and 3D route visualization
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {['Same-Day Delivery', 'International Shipping', 'Fleet Management', 'Live Tracking'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 h-14" asChild>
                <Link href="/auth/signup">
                  <Box className="mr-2 h-5 w-5" />
                  Ship Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 text-lg px-8 h-14" asChild>
                <Link href="/track">
                  <MapPin className="mr-2 h-5 w-5" />
                  Track Shipment
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 text-lg px-8 h-14" asChild>
                <Link href="/courier">
                  <Truck className="mr-2 h-5 w-5" />
                  For Drivers
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-600/20 text-blue-300">Enterprise-Grade Platform</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Complete Shipping Solutions
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From small parcels to international freight - manage all your deliveries with 
            cutting-edge technology and real-time visibility
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              <div className={`w-14 h-14 bg-${feature.color}-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {[
            { value: '195+', label: 'Countries Served' },
            { value: '50K+', label: 'Daily Deliveries' },
            { value: '98%', label: 'On-Time Rate' },
            { value: '24/7', label: 'Live Support' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl p-12 text-center"
        >
          {/* Animated truck background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 animate-pulse">
              <Truck className="w-20 h-20" />
            </div>
            <div className="absolute bottom-10 right-10 animate-pulse delay-75">
              <Box className="w-16 h-16" />
            </div>
            <div className="absolute top-1/2 right-1/4 animate-bounce">
              <MapPin className="w-12 h-12" />
            </div>
          </div>
          
          <div className="relative z-10">
            <Badge className="mb-4 bg-white/20 text-white">Start Today</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Deliveries?
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses shipping smarter with real-time tracking, 
              proof of delivery, and 24/7 support
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-14 bg-white text-blue-600 hover:bg-blue-50" asChild>
                <Link href="/auth/signup">
                  <Package className="mr-2 h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/track">
                  <MapPin className="mr-2 h-5 w-5" />
                  Track a Shipment
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 border-t border-slate-800">
        <div className="text-center text-slate-400">
          <p>&copy; 2025 ShipEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
