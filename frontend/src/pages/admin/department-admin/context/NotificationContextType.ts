export interface Notification {
  id: string;
  title: string;
  description: string;
  message: string;
  relatedStudent?: string;
  source: "student" | "admin" | "system";
  type: "leave" | "attendance" | "counseling" | "academic" | "message" | "announcement";
  timestamp: Date;
  isRead: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "isRead">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}
