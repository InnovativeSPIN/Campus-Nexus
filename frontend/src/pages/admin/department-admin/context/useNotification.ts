import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import { NotificationContextType } from "./NotificationContextType";

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
