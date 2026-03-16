import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/pages/student/components/ui/dialog';
import { Button } from '@/pages/student/components/ui/button';
import { cn } from '@/pages/student/lib/utils';

export interface Notification {
  id: number;
  user_id: number;
  entity_type: string;
  entity_id: number;
  title: string;
  message: string;
  action_type: string;
  status: 'unread' | 'read';
  related_data?: Record<string, any>;
  created_at: string;
}

interface NotificationCenterProps {
  role?: 'student' | 'faculty' | 'admin';
}

export function NotificationCenter({ role }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        setUnreadCount(
          (data.data || []).filter((n: Notification) => n.status === 'unread').length
        );
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: 'read' } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (actionType: string) => {
    switch (actionType) {
      case 'leave_submitted':
      case 'leave_pending_approval':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'leave_approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'leave_rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (actionType: string) => {
    switch (actionType) {
      case 'leave_submitted':
      case 'leave_pending_approval':
        return 'bg-yellow-50 border-yellow-200';
      case 'leave_approved':
        return 'bg-green-50 border-green-200';
      case 'leave_rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-96 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-sm',
                  notification.status === 'unread'
                    ? getNotificationColor(notification.action_type)
                    : 'bg-gray-50 border-gray-200'
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="mt-1">{getNotificationIcon(notification.action_type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.created_at).toLocaleDateString()} at{' '}
                    {new Date(notification.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NotificationCenter;
