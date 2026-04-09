import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Calendar,
    Search,
    AlertCircle,
    User,
    X,
    Download,
    Megaphone,
    ChevronRight,
    FileText,
    Tag,
    Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Attachment {
    name: string;
    url:  string;
    type: string;
}

interface Announcement {
    id:          number;
    title:       string;
    message:     string;
    type?:       string;
    priority?:   string;
    creatorRole: string;
    createdAt:   string;
    department?: string;
    semester?:   string;
    year?:       string;
    term?:       string;
    attachments?: Attachment[];
    createdBy?: { id: number; name: string; avatar?: string };
}

// ─── Priority colour ──────────────────────────────────────────────────────────
const PRIORITY_COLOURS: Record<string, string> = {
    urgent: "bg-red-500",
    high:   "bg-orange-500",
    medium: "bg-yellow-500",
    normal: "bg-blue-500",
    low:    "bg-gray-400",
};

const ROLE_LABEL: Record<string, string> = {
    "superadmin":       "Super Admin",
    "super-admin":      "Super Admin",
    "executiveadmin":   "Executive Admin",
    "academicadmin":    "Academic Admin",
    "department-admin": "HOD",
    "faculty":          "Faculty",
};

// ─════════════════════════════════════════════════════════════════════════════─
export function AnnouncementsList() {
    const location = useLocation();

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading,       setLoading]       = useState(true);
    const [searchTerm,    setSearchTerm]    = useState("");
    const [selected,      setSelected]      = useState<Announcement | null>(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch_ = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("authToken");
                const res   = await fetch("/api/v1/announcements", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const result = await res.json();
                if (result.success) {
                    const unique = Array.from(
                        new Map((result.data as Announcement[]).map(a => [a.id, a])).values()
                    );
                    setAnnouncements(unique);
                }
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, []);

    // Auto-open from notification bell
    useEffect(() => {
        const state = location.state as { openAnnouncementId?: number } | null;
        if (state?.openAnnouncementId && announcements.length > 0) {
            const ann = announcements.find(a => a.id === state.openAnnouncementId);
            if (ann) setSelected(ann);
        }
    }, [announcements, location]);

    // ── Filter ───────────────────────────────────────────────────────────────
    const filtered = announcements.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatDate = (d: string, opts?: Intl.DateTimeFormatOptions) =>
        new Date(d).toLocaleDateString(undefined, {
            month: "long", day: "numeric", year: "numeric", ...opts
        });

    const attachList = (ann: Announcement): Attachment[] =>
        Array.isArray(ann.attachments) ? ann.attachments : [];

    // ═════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* ── List panel ──────────────────────────────────────────────── */}
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
                            <p className="text-muted-foreground text-sm">Stay updated with the latest news</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search announcements…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No announcements</h3>
                        <p className="text-muted-foreground text-sm">
                            {searchTerm ? "No announcements match your search." : "No announcements available at the moment."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((ann, idx) => (
                            <motion.div
                                key={ann.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                onClick={() => setSelected(ann)}
                                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
<<<<<<< Updated upstream
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        ann.creatorRole === "superadmin" || ann.creatorRole === "super-admin"
                                            ? "bg-primary/10 text-primary"
                                            : ann.creatorRole === "department-admin"
                                            ? "bg-secondary/10 text-secondary"
                                            : "bg-muted text-muted-foreground"
                                    }`}>
                                        <Megaphone className="w-5 h-5" />
=======
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${announcement.creatorRole === 'superadmin'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-secondary/10 text-secondary'
                                        }`}>
                                        <Bell className="w-5 h-5" />
>>>>>>> Stashed changes
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                {ann.title}
                                            </h3>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-0.5" />
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {ann.message}
                                        </p>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {/* Priority dot */}
                                            {ann.priority && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <span className={`w-2 h-2 rounded-full ${PRIORITY_COLOURS[ann.priority] ?? "bg-gray-400"}`} />
                                                    {ann.priority}
                                                </span>
                                            )}
                                            {/* Role badge */}
                                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                {ROLE_LABEL[ann.creatorRole] ?? ann.creatorRole}
                                            </span>
                                            {/* Date */}
                                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(ann.createdAt)}
                                            </span>
                                            {/* Attachment indicator */}
                                            {attachList(ann).length > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                                                    <FileText className="w-3 h-3" />
                                                    {attachList(ann).length} attachment{attachList(ann).length > 1 ? "s" : ""}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Detail slide-over / modal ────────────────────────────────── */}
            <AnimatePresence>
                {selected && (
                    <>
                        {/* backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setSelected(null)}
                        />

                        {/* panel */}
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 right-0 w-full max-w-lg bg-card shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Megaphone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Announcement
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {ROLE_LABEL[selected.creatorRole] ?? selected.creatorRole}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body — scrollable */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                {/* Title + priority */}
                                <div>
                                    {selected.priority && (
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-full mb-3 ${PRIORITY_COLOURS[selected.priority] ?? "bg-gray-500"}`}>
                                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                            {selected.priority}
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                                        {selected.title}
                                    </h2>
                                </div>

                                {/* Meta chips */}
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(selected.createdAt, { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                    {selected.createdBy?.name && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                            <User className="w-3.5 h-3.5" />
                                            {selected.createdBy.name}
                                        </div>
                                    )}
                                    {selected.department && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                            <Building2 className="w-3.5 h-3.5" />
                                            {selected.department}
                                        </div>
                                    )}
                                    {selected.type && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                            <Tag className="w-3.5 h-3.5" />
                                            {selected.type}
                                        </div>
                                    )}
                                    {selected.semester && (
                                        <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                            Sem {selected.semester}
                                        </div>
                                    )}
                                    {selected.year && (
                                        <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                            {selected.year} Year
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border" />

                                {/* Message body */}
                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {selected.message}
                                </div>

                                {/* Attachments */}
                                {attachList(selected).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Attachments ({attachList(selected).length})
                                        </p>
                                        <div className="grid gap-2">
                                            {attachList(selected).map((file, i) => {
                                                const isPdf  = file.type?.includes("pdf") || file.name?.endsWith(".pdf");
                                                const isImg  = file.type?.startsWith("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                                                return (
                                                    <a
                                                        key={i}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-muted/60 hover:bg-muted rounded-xl border border-border transition-colors group/file"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                            {isPdf ? (
                                                                <FileText className="w-5 h-5" />
                                                            ) : isImg ? (
                                                                <img src={file.url} alt={file.name}
                                                                    className="w-10 h-10 object-cover rounded-lg" />
                                                            ) : (
                                                                <FileText className="w-5 h-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate group-hover/file:text-primary transition-colors">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground uppercase">
                                                                {file.type ?? "File"}
                                                            </p>
                                                        </div>
                                                        <Download className="w-4 h-4 text-muted-foreground group-hover/file:text-primary transition-colors shrink-0" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
