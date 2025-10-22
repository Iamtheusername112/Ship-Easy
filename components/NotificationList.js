'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCheck, 
  Trash2, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Clock,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  shipment_created: Package,
  assigned: Truck,
  picked_up: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  exception: AlertCircle,
  eta_update: Clock,
  payment: DollarSign,
};

const notificationColors = {
  shipment_created: 'blue',
  assigned: 'purple',
  picked_up: 'orange',
  out_for_delivery: 'cyan',
  delivered: 'green',
  exception: 'red',
  eta_update: 'yellow',
  payment: 'green',
};

export default function NotificationList({ onClose }) {
  const { 
    notifications, 
    unreadCount, 
    loading,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllRead 
  } = useNotifications();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onClose?.();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
        />
        <p className="mt-3 text-sm">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          {notifications.some(n => n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteAllRead}
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1 max-h-[500px]">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">All caught up!</p>
            <p className="text-slate-500 text-sm mt-1">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {notifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type] || Package;
              const color = notificationColors[notification.type] || 'blue';
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`relative p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-600/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  <div className="flex items-start gap-3 ml-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 bg-${color}-600/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${color}-400`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-white' : 'text-slate-300'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tracking code if available */}
                  {notification.payload?.tracking_code && (
                    <Link 
                      href={`/track?code=${notification.payload.tracking_code}`}
                      className="block mt-2 ml-16"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-600">
                        {notification.payload.tracking_code}
                      </Badge>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

