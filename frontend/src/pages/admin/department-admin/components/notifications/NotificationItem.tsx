import { motion } from "framer-motion";
import { Notification } from "@/pages/admin/department-admin/context/NotificationContextType";
import { Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  sourceColor: string;
}

export function NotificationItem({ notification, onClick, sourceColor }: NotificationItemProps) {
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "leave":
        return "";
      case "attendance":
        return "";
      case "counseling":
        return "";
      case "academic":
        return "";
      case "message":
        return "";
      case "announcement":
        return "";
      default:
        return "";
    }
  };

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-3 sm:p-4 hover:bg-accent transition-colors duration-200 focus:outline-none"
      whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
    >
      <div className="flex gap-2 sm:gap-3">
        <div className="text-base sm:text-lg flex-shrink-0 mt-0.5">{getTypeEmoji(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-foreground text-xs sm:text-sm truncate">
              {notification.title}
            </p>
            {!notification.isRead && (
              <Circle className="w-2 h-2 fill-primary text-primary flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mb-2">
            {notification.description}
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-md border ${sourceColor}`}>
              {notification.source === "student"
                ? "Student"
                : notification.source === "admin"
                  ? "Admin"
                  : "System"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}



