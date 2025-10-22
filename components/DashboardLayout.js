'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Package, 
  Truck, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell,
  User as UserIcon,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import NotificationBell from './NotificationBell';

export default function DashboardLayout({ children }) {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ...(profile?.role === 'customer' ? [
      { icon: Package, label: 'My Shipments', href: '/dashboard/shipments' },
    ] : []),
    ...(profile?.role === 'courier' ? [
      { icon: Truck, label: 'My Deliveries', href: '/courier' },
    ] : []),
    ...(profile?.role === 'dispatcher' ? [
      { icon: Shield, label: 'Dispatcher', href: '/dispatcher' },
    ] : []),
    ...(profile?.role === 'admin' ? [
      { icon: Shield, label: 'Admin', href: '/admin' },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ShipEase</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Quick Track */}
            <Button variant="outline" className="border-slate-600 text-slate-200" asChild>
              <Link href="/track">Track Package</Link>
            </Button>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                <DropdownMenuLabel className="text-slate-200">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {profile?.role === 'customer' ? 'Customer' : 
                       profile?.role === 'courier' ? 'Deliverer' :
                       profile?.role === 'dispatcher' ? 'Dispatcher' :
                       profile?.role === 'admin' ? 'Administrator' : profile?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-200 cursor-pointer" asChild>
                  <Link href="/dashboard/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-200 cursor-pointer" asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-red-400 cursor-pointer" 
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-t-lg"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

