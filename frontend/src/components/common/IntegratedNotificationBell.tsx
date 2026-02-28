import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Megaphone, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/pages/admin/department-admin/components/ui/badge";
import { cn } from "@/lib/utils";

interface Announcement {
    id: number;
    title: string;
    message: string;
    creatorRole: string;
    createdAt: string;
}

interface IntegratedNotificationBellProps {
    // No props needed - uses location context for routing
}

export function IntegratedNotificationBell({}: IntegratedNotificationBellProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/v1/announcements', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();
            if (result.success) {
                setAnnouncements(result.data.slice(0, 10)); // Top 10
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Navigate to announcements list (detail will show in modal on list page)
    const getAnnouncementsListUrl = () => {
        const pathname = location.pathname;
        
        if (pathname.includes('/admin/superadmin')) {
            return `/admin/superadmin/announcements`;
        }
        if (pathname.includes('/admin/executive')) {
            return `/admin/executive/announcements`;
        }
        if (pathname.includes('/admin/academic')) {
            return `/admin/academic/announcements`;
        }
        if (pathname.includes('/admin/department-admin')) {
            return `/admin/department-admin/announcements`;
        }
        if (pathname.includes('/faculty')) {
            return `/faculty/announcements`;
        }
        if (pathname.includes('/student')) {
            return `/student/announcements`;
        }
        
        return `/announcements`;
    };

    const handleAnnouncementClick = (announcement: Announcement) => {
        // Navigate to announcements list - modal will open on list page
        const url = getAnnouncementsListUrl();
        setIsOpen(false);
        // Navigate with state to indicate which announcement to open
        navigate(url, { state: { openAnnouncementId: announcement.id } });
    };

    useEffect(() => {
        fetchAnnouncements();
        // Poll every 5 minutes
        const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

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

    const unreadCount = announcements.length; // For now, treat all as new until clicked

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-accent rounded-lg transition-colors duration-200 group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
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
                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                            <div>
                                <h3 className="font-bold text-foreground">Announcements</h3>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Stay updated with latest news</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-accent rounded-full transition-colors flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                                    <p className="text-xs text-muted-foreground mt-1">No new announcements at the moment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {announcements.map((ann) => (
                                        <div
                                            key={ann.id}
                                            onClick={() => handleAnnouncementClick(ann)}
                                            className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    ann.creatorRole === 'superadmin' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                                                )}>
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                            {ann.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                                                        {ann.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            <span className="mx-1">•</span>
                                                            <Badge variant="outline" className="text-[8px] py-0 px-1 font-black uppercase tracking-tighter">
                                                                {ann.creatorRole}
                                                            </Badge>
                                                        </div>
                                                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-border bg-muted/20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs font-bold gap-2 text-primary hover:bg-primary/5"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(getAnnouncementsListUrl());
                                }}
                            >
                                View all notifications
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
