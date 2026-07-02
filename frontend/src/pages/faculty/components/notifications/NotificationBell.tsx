import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useNotification } from "@/pages/faculty/context";
import { NotificationItem } from "@/pages/faculty/components/notifications/NotificationItem";
import { NotificationDetailModal } from "@/pages/faculty/components/notifications/NotificationDetailModal";
import { Notification } from "@/pages/faculty/context/NotificationContextType";
import { Button } from "@/pages/faculty/components/ui/button";
import { cn } from "@/lib/utils";

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

export function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle ESC key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleBellClick = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsOpen(false);
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "student":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "admin":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "system":
        return "bg-green-500/10 text-green-600 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <>
      <div className="relative">
        <motion.button
          ref={buttonRef}
          onClick={handleBellClick}
          whileHover="hover"
          whileTap="tap"
          animate={unreadCount > 0 && !isOpen ? "ringing" : "idle"}
          className={cn(
            "relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center overflow-visible",
            unreadCount > 0
              ? "bg-primary/5 hover:bg-primary/10 border border-primary/25 hover:border-primary/45 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
              : "bg-transparent hover:bg-accent border border-transparent hover:border-border/60"
          )}
          aria-label="Notifications"
        >
          {/* Glowing ring animation for unread notifications */}
          {unreadCount > 0 && !isOpen && (
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0px rgba(59, 130, 246, 0.4)",
                  "0 0 0 8px rgba(59, 130, 246, 0)"
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

          <motion.div variants={bellVariants}>
            <Bell className={cn(
              "w-5 h-5 transition-colors duration-300",
              unreadCount > 0 
                ? "text-primary fill-primary/10" 
                : "text-foreground"
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
                className="absolute bg-destructive rounded-full w-4 h-4"
              />
              <div className="relative bg-destructive text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-background shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            </motion.div>
          )}
        </motion.button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-xl shadow-lg z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground">
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        sourceColor={getSourceColor(notification.source)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 sm:p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      markAllAsRead();
                      setIsOpen(false);
                    }}
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </>
  );
}




