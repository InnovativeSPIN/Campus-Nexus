import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Megaphone, Clock, ChevronRight, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/pages/admin/department-admin/components/ui/badge";
import { cn } from "@/lib/utils";

interface Announcement {
    id: number;
    title: string;
    message: string;
    creatorRole: string;
    createdAt: string;
    type: 'announcement';
}

interface CourseLessonPlanApprovalBatch {
    batch_id: string;
    topics_count: number;
    faculty: {
        Name: string;
    };
    subject: {
        subject_name: string;
    };
    batch_submission_date: string;
    type: 'course_plan_approval_batch';
}

type Notification = Announcement | CourseLessonPlanApprovalBatch;

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

interface IntegratedNotificationBellProps {
    // No props needed - uses location context for routing
}

const CLEARED_NOTIFS_KEY = 'cn_cleared_notification_ids';
const SEEN_NOTIFS_KEY = 'cn_seen_notification_ids';

function getClearedIds(): Set<string> {
    try {
        const raw = localStorage.getItem(CLEARED_NOTIFS_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set();
    }
}

function persistClearedIds(ids: Set<string>) {
    try {
        localStorage.setItem(CLEARED_NOTIFS_KEY, JSON.stringify([...ids]));
    } catch { /* ignore */ }
}

function getSeenIds(): Set<string> {
    try {
        const raw = sessionStorage.getItem(SEEN_NOTIFS_KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set();
    }
}

function persistSeenIds(ids: Set<string>) {
    try {
        sessionStorage.setItem(SEEN_NOTIFS_KEY, JSON.stringify([...ids]));
    } catch { /* ignore */ }
}

export function IntegratedNotificationBell({ }: IntegratedNotificationBellProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [coursePlanApprovals, setCoursePlanApprovals] = useState<CourseLessonPlanApprovalBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearedIds, setClearedIds] = useState<Set<string>>(getClearedIds);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch announcements
            const announcementRes = await fetch('/api/v1/announcements', { headers });
            const announcementResult = await announcementRes.json().catch(() => ({ success: false, message: 'Invalid server response' }));
            if (announcementResult.success) {
                setAnnouncements(announcementResult.data.slice(0, 10).map((ann: any) => ({ ...ann, type: 'announcement' })));
            }

            // Fetch course lesson plan approvals if user is department admin
            if (location.pathname.includes('/admin/department-admin')) {
                try {
                    const approvalRes = await fetch('/api/v1/department-admin/academics/course-plans/pending', { headers });
                    const approvalResult = await approvalRes.json().catch(() => ({ success: false, message: 'Invalid server response' }));
                    if (approvalResult.success && approvalResult.data && Array.isArray(approvalResult.data)) {
                        setCoursePlanApprovals(
                            approvalResult.data
                                .slice(0, 5)
                                .map((batch: any) => ({
                                    ...batch,
                                    type: 'course_plan_approval_batch'
                                }))
                        );
                    }
                } catch (error) {
                    console.error('Error fetching course plan approvals:', error);
                }
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

    // Mark newly fetched notifications as seen (once per session)
    useEffect(() => {
        const seenIds = getSeenIds();
        let changed = false;
        announcements.forEach(a => {
            const key = `ann-${a.id}`;
            if (!seenIds.has(key)) { seenIds.add(key); changed = true; }
        });
        coursePlanApprovals.forEach(b => {
            const key = `batch-${b.batch_id}`;
            if (!seenIds.has(key)) { seenIds.add(key); changed = true; }
        });
        if (changed) persistSeenIds(seenIds);
    }, [announcements, coursePlanApprovals]);

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

    // Filter out cleared notifications
    const visibleAnnouncements = announcements.filter(a => !clearedIds.has(`ann-${a.id}`));
    const visibleCoursePlanApprovals = coursePlanApprovals.filter(b => !clearedIds.has(`batch-${b.batch_id}`));

    // For dashboard: only count truly new (not yet seen this session) as badge count
    const seenIds = getSeenIds();
    const newAnnCount = visibleAnnouncements.filter(a => !seenIds.has(`ann-${a.id}`) || clearedIds.size === 0).length;
    const newBatchCount = visibleCoursePlanApprovals.filter(b => !seenIds.has(`batch-${b.batch_id}`) || clearedIds.size === 0).length;
    const unreadCount = visibleAnnouncements.length + visibleCoursePlanApprovals.length;

    const handleClearAll = () => {
        const newCleared = new Set(clearedIds);
        visibleAnnouncements.forEach(a => newCleared.add(`ann-${a.id}`));
        visibleCoursePlanApprovals.forEach(b => newCleared.add(`batch-${b.batch_id}`));
        persistClearedIds(newCleared);
        setClearedIds(newCleared);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <motion.button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
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
                            ) : visibleAnnouncements.length === 0 && visibleCoursePlanApprovals.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">All caught up!</p>
                                    <p className="text-xs text-muted-foreground mt-1">No new announcements or pending approvals.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {/* Course Plan Approval Batches */}
                                    {visibleCoursePlanApprovals.map((batch) => (
                                        <div
                                            key={`batch-${batch.batch_id}`}
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate('/admin/department-admin/course-plan-approvals');
                                            }}
                                            className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                            Course Plan Batch Review
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                                                        <span className="font-semibold">{batch.faculty.Name}</span> • {batch.topics_count} topics • {batch.subject.subject_name}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(batch.batch_submission_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            <span className="mx-1">•</span>
                                                            <Badge variant="outline" className="text-[8px] py-0 px-1 font-black uppercase tracking-tighter bg-amber-500/10 text-amber-700">
                                                                Pending
                                                            </Badge>
                                                        </div>
                                                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Announcements */}
                                    {visibleAnnouncements.map((ann) => (
                                        <div
                                            key={`ann-${ann.id}`}
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
                        <div className="p-3 border-t border-border bg-muted/20 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 text-xs font-bold gap-2 text-primary hover:bg-primary/5"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(getAnnouncementsListUrl());
                                }}
                            >
                                View all notifications
                            </Button>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-bold gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 flex-shrink-0"
                                    onClick={handleClearAll}
                                    title="Clear all notifications"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear all
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
