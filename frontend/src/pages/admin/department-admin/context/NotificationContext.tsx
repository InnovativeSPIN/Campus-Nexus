import React, { createContext, useState, useCallback, ReactNode } from "react";
import { Notification, NotificationContextType } from "./NotificationContextType";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Sample notifications data
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Leave Request from Aditya Kumar",
    description: "Submitted a leave request for 2 days",
    message: "Aditya Kumar has submitted a leave request for 2 consecutive days (Feb 1-2, 2026). Please review and approve/reject.",
    relatedStudent: "Aditya Kumar",
    source: "student",
    type: "leave",
    timestamp: new Date(Date.now() - 5 * 60000), // 5 mins ago
    isRead: false,
  },
  {
    id: "2",
    title: "Attendance Updated",
    description: "CSE202 attendance marked for Feb 28",
    message: "Attendance has been marked for CSE202 class on Feb 28, 2026. 42 students present, 3 absent.",
    source: "system",
    type: "attendance",
    timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
    isRead: false,
  },
  {
    id: "3",
    title: "Counseling Feedback from Priya Sharma",
    description: "Feedback submitted after counseling session",
    message: "Priya Sharma has submitted feedback for the counseling session conducted on Feb 20. Overall positive feedback received.",
    relatedStudent: "Priya Sharma",
    source: "student",
    type: "counseling",
    timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    isRead: false,
  },
  {
    id: "4",
    title: "Academic Review Request",
    description: "Student requested academic performance review",
    message: "Yash Patel has requested an academic review meeting to discuss their current performance and improvement areas.",
    relatedStudent: "Yash Patel",
    source: "student",
    type: "academic",
    timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
    isRead: true,
  },
  {
    id: "5",
    title: "Timetable Updated",
    description: "Admin updated class timetable",
    message: "The department timetable has been updated. Please check the new schedule for CSE class timings.",
    source: "admin",
    type: "announcement",
    timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
    isRead: true,
  },
];

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "isRead">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
export type { NotificationContextType } from "./NotificationContextType";
