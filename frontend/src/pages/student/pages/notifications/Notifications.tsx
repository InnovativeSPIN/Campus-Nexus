import { useMemo, useState, useEffect } from "react";
import PageHeader from "@/pages/student/components/layout/PageHeader";
import SectionCard from "@/pages/student/components/common/SectionCard";
import Badge from "@/pages/student/components/common/Badge";
import { Bell, CheckCheck, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type NotificationType = "info" | "warning" | "success" | "approval";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  date: string; // ISO
  type: NotificationType;
  isRead: boolean;
  referenceType?: string;
  priority?: string;
  actionUrl?: string;
}

function getVariant(type: NotificationType): "info" | "warning" | "success" {
  if (type === "approval") return "info";
  return type as "info" | "warning" | "success";
}

function getIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case "approval":
      return <Bell className="w-5 h-5 text-blue-600" />;
    default:
      return <Bell className="w-5 h-5 text-blue-600" />;
  }
}

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "portfolio">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/v1/student/me/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (filter === "unread") result = items.filter((n) => !n.isRead);
    if (filter === "read") result = items.filter((n) => n.isRead);
    if (filter === "portfolio") result = items.filter((n) => ['sport', 'event', 'certification', 'project'].includes(n.referenceType?.toLowerCase() || ''));
    return result;
  }, [items, filter]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/v1/student/me/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/v1/student/me/notifications/clear-all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const toggleRead = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/v1/student/me/notifications/${id}/toggle-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error toggling notification:', err);
    }
  };

  const getStatusBadge = (type: NotificationType) => {
    if (type === 'success') return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Approved</span>;
    if (type === 'warning') return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">✗ Rejected</span>;
    return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Pending</span>;
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader
        title="Notifications"
        subtitle="Manage and review your notifications"
        breadcrumbs={[
          { label: "Dashboard", path: "/student/dashboard" },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input-field py-2 pr-8"
              aria-label="Filter notifications"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="portfolio">Portfolio Updates</option>
            </select>
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button onClick={clearAll} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        }
      />

      <SectionCard
        title="Inbox"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      >
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50 animate-spin" />
            <p>Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            No notifications to show.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((n) => (
              <div 
                key={n.id} 
                className={`py-4 px-4 flex gap-4 items-start hover:bg-muted/30 transition-colors cursor-pointer rounded-lg ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                onClick={() => {
                  if (n.actionUrl) {
                    window.location.href = n.actionUrl;
                  }
                }}
              >
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getIcon(n.type)}
                          <p className={`font-semibold ${n.isRead ? "text-muted-foreground" : ""}`}>{n.title}</p>
                        </div>
                        {n.referenceType && ['sport', 'event', 'certification', 'project'].includes(n.referenceType?.toLowerCase() || '') && (
                          <>
                            {getStatusBadge(n.type)}
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full capitalize">
                              {n.referenceType}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{n.message}</p>
                      {n.priority === 'high' && (
                        <p className="text-xs text-red-600 mt-2">⚠️ Important - Action required</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRead(n.id);
                        }}
                        className="mt-2 text-xs px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors"
                      >
                        {n.isRead ? "Unread" : "Read"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}



