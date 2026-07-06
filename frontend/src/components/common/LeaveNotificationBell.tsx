import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, XCircle, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveNotif {
    id: number;
    leaveId: number;
    type: "leave_submitted" | "leave_approved" | "leave_rejected" | "reassignment_requested" | "leave_approval_requested" | "load_accepted" | "load_rejected";
    title: string;
    message: string;
    facultyName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    isRead: boolean;
    createdAt: string;
}


export function LeaveNotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<LeaveNotif[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchCount = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("/api/v1/leave/notifications/unread-count", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) setUnreadCount(data.data.count);
        } catch { }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const res = await fetch("/api/v1/leave/notifications", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) setNotifications(data.data || []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem("authToken");
            await fetch(`/api/v1/leave/notifications/${id}/read`, {
                method: "PUT",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("authToken");
            await fetch("/api/v1/leave/notifications/mark-all-read", {
                method: "PUT",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleActionResponse = async (notifId: number, leaveId: number, status: "accepted" | "rejected", notifTitle?: string, type?: string) => {
        try {
            setActionLoading(notifId);
            const token = localStorage.getItem("authToken");

            // Detect if this is an alteration-plan notification (Period Alteration Request)
            // In that case, leaveId is the FacultySubstitutes record ID
            const isAlterationPlan = notifTitle?.includes("Period Alteration Request");

            let res: Response;
            if (isAlterationPlan && leaveId && type === "reassignment_requested") {
                // Period-level substitution (FacultySubstitutes record ID)
                const action = status === "accepted" ? "accept" : "reject";
                res = await fetch(`/api/v1/faculty/alteration-plan/${leaveId}/${action}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ rejection_reason: "Declined via notification" }),
                });
            } else if (type === "alteration_requested" && leaveId) {
                // Full-leave substitution via new flow — leaveId is the Leave record ID
                const action = status === "accepted" ? "accept" : "reject";
                res = await fetch(`/api/v1/faculty/alteration/${leaveId}/${action}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ rejection_reason: "Declined via notification" }),
                });
            } else if (type === "leave_approval_requested" && leaveId) {
                // HOD leave approval
                const action = status === "accepted" ? "approve" : "reject";
                res = await fetch(`/api/v1/faculty/leave-approval/department/${leaveId}/${action}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
            } else if (leaveId) {
                // Legacy: reassignment response (old flow)
                res = await fetch(`/api/v1/leave/${leaveId}/reassignment-response`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ status }),
                });
            } else {
                // No valid leaveId — skip silently
                setActionLoading(null);
                return;
            }

            const data = await res.json();
            if (data.success) {
                // Mark current notification as read
                await markAsRead(notifId);
                // Refresh notifications
                fetchNotifications();
            } else {
                alert(data.error || "Failed to process request");
            }
        } catch (error) {
            console.error("Error processing reassignment:", error);
        } finally {
            setActionLoading(null);
        }
    };


    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30 * 1000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
            return () => document.removeEventListener("mousedown", handleOutsideClick);
        }
    }, [isOpen]);

    const getTypeIcon = (type: LeaveNotif["type"]) => {
        if (type === "leave_submitted") return <Clock className="w-5 h-5 text-warning" />;
        if (type === "leave_approved" || type === "load_accepted") return <CheckCircle2 className="w-5 h-5 text-success" />;
        if (type === "reassignment_requested" || type === "leave_approval_requested") return <CalendarDays className="w-5 h-5 text-primary" />;
        return <XCircle className="w-5 h-5 text-destructive" />;
    };


    const getTypeBg = (type: LeaveNotif["type"]) => {
        if (type === "leave_submitted") return "bg-warning/10";
        if (type === "leave_approved" || type === "load_accepted") return "bg-success/10";
        if (type === "reassignment_requested" || type === "leave_approval_requested") return "bg-primary/10";
        return "bg-destructive/10";
    };


    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
                aria-label="Leave Notifications"
            >
                <CalendarDays className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 bg-destructive text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-background"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                            <div>
                                <h3 className="font-bold text-foreground">Leave Notifications</h3>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                    Leave requests & approvals
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.some((n) => !n.isRead) && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] text-primary hover:underline font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">No leave notifications</p>
                                    <p className="text-xs text-muted-foreground mt-1">Leave requests will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                                            className={cn(
                                                "p-4 transition-colors cursor-pointer group",
                                                notif.isRead
                                                    ? "hover:bg-muted/20"
                                                    : "bg-primary/5 hover:bg-primary/10"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        getTypeBg(notif.type)
                                                    )}
                                                >
                                                    {getTypeIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className={cn(
                                                            "font-semibold text-sm line-clamp-1",
                                                            notif.isRead ? "text-muted-foreground" : "text-foreground"
                                                        )}>
                                                            {notif.title}
                                                        </h4>
                                                        {!notif.isRead && (
                                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1 ml-2" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </p>
                                                    {(notif.type === "reassignment_requested" || notif.type === "alteration_requested" || notif.type === "leave_approval_requested") && !notif.isRead && (
                                                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleActionResponse(notif.id, notif.leaveId, "accepted", notif.title, notif.type)}
                                                                disabled={actionLoading === notif.id}
                                                                className="px-3 py-1 bg-success text-white text-[10px] font-bold rounded-lg hover:bg-success/90 transition-colors"
                                                            >
                                                                {actionLoading === notif.id ? "..." : "Accept"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionResponse(notif.id, notif.leaveId, "rejected", notif.title, notif.type)}
                                                                disabled={actionLoading === notif.id}
                                                                className="px-3 py-1 bg-destructive text-white text-[10px] font-bold rounded-lg hover:bg-destructive/90 transition-colors"
                                                            >
                                                                {actionLoading === notif.id ? "..." : "Reject"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
