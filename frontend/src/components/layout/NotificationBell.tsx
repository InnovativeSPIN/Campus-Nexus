import { useEffect, useState } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const bellVariants = {
  idle: { scale: 1, rotate: 0 },
  ringing: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 4,
      ease: "easeInOut"
    }
  },
  hover: {
    scale: 1.15,
    rotate: [0, -15, 12, -10, 8, -4, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    rotate: 0
  }
};

const badgeVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  hover: {
    scale: 1.15,
    transition: {
      duration: 0.2
    }
  }
};

interface PortfolioNotif {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    studentId: string;
    firstName: string;
    lastName: string;
  };
}

export function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<PortfolioNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.faculty_id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/student/portfolio-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
        
        // Get unread count
        const unreadRes = await fetch('/api/v1/student/portfolio-notifications/unread-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (unreadRes.ok) {
          const countData = await unreadRes.json();
          setUnreadCount(countData.count || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user?.faculty_id && isOpen) {
      fetchNotifications();
    }
  }, [user?.faculty_id, isOpen]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.faculty_id) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.faculty_id]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/v1/student/portfolio-notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications(); // Refresh list
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (!user?.faculty_id) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center overflow-visible",
            unreadCount > 0
              ? "bg-white/10 border border-white/20 hover:border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
              : "bg-transparent hover:bg-white/10 border border-transparent"
          )}
          aria-label="Notifications"
        >
          {unreadCount > 0 && !isOpen && (
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0px rgba(255, 255, 255, 0.4)",
                  "0 0 0 8px rgba(255, 255, 255, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-xl pointer-events-none"
            />
          )}

          <motion.div
            variants={bellVariants}
            animate={unreadCount > 0 && !isOpen ? "ringing" : "idle"}
            whileHover="hover"
            whileTap="tap"
          >
            <Bell className={cn(
              "w-5 h-5 transition-colors duration-300 text-white",
              unreadCount > 0 && "fill-white/10"
            )} />
          </motion.div>

          {unreadCount > 0 && (
            <motion.div
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none"
            >
              {/* Pulse effect behind badge */}
              <motion.div
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute bg-red-500 rounded-full w-4 h-4"
              />
              <span className="relative w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold border border-white/20">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Portfolio Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Bell className="w-8 h-8 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={cn(
                  "p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  !notif.isRead && "bg-blue-50/50"
                )}
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {notif.sender?.firstName} {notif.sender?.lastName}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
