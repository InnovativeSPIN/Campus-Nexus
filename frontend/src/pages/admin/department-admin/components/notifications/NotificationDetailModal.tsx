import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, User, Tag } from "lucide-react";
import { Notification } from "@/pages/admin/department-admin/context/NotificationContextType";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/pages/admin/department-admin/components/ui/button";

interface NotificationDetailModalProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationDetailModal({
  notification,
  onClose,
}: NotificationDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
        className="bg-background border border-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col z-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">{getTypeEmoji(notification.type)}</span>
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
              Notification Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0 ml-2"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                {notification.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs px-3 py-1.5 rounded-md border font-medium ${getSourceColor(
                    notification.source
                  )}`}
                >
                  {notification.source === "student"
                    ? "From Student"
                    : notification.source === "admin"
                      ? "From Admin"
                      : "System Update"}
                </span>
              </div>
            </div>

            {/* Main Message */}
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">Message</p>
              <p className="text-foreground text-sm leading-relaxed bg-accent/50 p-4 rounded-lg">
                {notification.message}
              </p>
            </div>

            {/* Related Student */}
            {notification.relatedStudent && (
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-primary/5 rounded-lg">
                <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">Related Student</p>
                  <p className="text-sm font-semibold text-foreground break-words">
                    {notification.relatedStudent}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-accent/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Date & Time</p>
                <p className="text-sm font-semibold text-foreground break-words">
                  {notification.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-start gap-3 p-3 sm:p-4 bg-accent/50 rounded-lg">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Notification Type</p>
                <p className="text-sm font-semibold text-foreground capitalize break-words">
                  {notification.type.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="p-4 sm:p-6 border-t border-border bg-background flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
          >
            Close Details
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}




