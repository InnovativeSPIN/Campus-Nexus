import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/pages/admin/superadmin/components/layout/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Megaphone,
    Plus,
    X,
    FileText,
    Image as ImageIcon,
    File as FileIcon,
    Trash2,
    Download,
    Search,
    Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Attachment {
    name: string;
    url: string;
    type: string;
}

interface Announcement {
    id: number;
    title: string;
    message: string;
    targetRole: string[];
    department?: string;
    attachments: Attachment[];
    createdBy: {
        id?: number;
        name: string;
        avatar?: string;
    };
    creatorRole: string;
    createdAt: string;
}

export default function SuperAdminAnnouncements() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        message: "",
        targetRole: ["all"] as string[],
        department: "",
        files: [] as File[]
    });

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/v1/announcements/admin', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();
            if (result.success) {
                // Normalize targetRole and attachments to ensure they're always arrays
                const normalizedData = result.data.map((announcement: any) => ({
                    ...announcement,
                    targetRole: Array.isArray(announcement.targetRole) 
                        ? announcement.targetRole 
                        : (typeof announcement.targetRole === 'string' 
                            ? announcement.targetRole.split(',').map((r: string) => r.trim())
                            : ['all']),
                    attachments: Array.isArray(announcement.attachments) 
                        ? announcement.attachments 
                        : []
                }));
                setAnnouncements(normalizedData);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newAnnouncement.title || !newAnnouncement.message) {
            toast.error('Please fill in required fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', newAnnouncement.title);
        formData.append('message', newAnnouncement.message);
        formData.append('targetRole', newAnnouncement.targetRole.join(','));

        if (newAnnouncement.department) {
            formData.append('department', newAnnouncement.department);
        }

        newAnnouncement.files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/v1/announcements', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                toast.success('Announcement posted successfully');
                setShowForm(false);
                setNewAnnouncement({
                    title: "",
                    message: "",
                    targetRole: ["all"],
                    department: "",
                    files: []
                });
                fetchAnnouncements();
            } else {
                toast.error(result.error || 'Failed to post announcement');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error('Error posting announcement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/v1/announcements/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();

            if (result.success) {
                toast.success('Announcement deleted');
                fetchAnnouncements();
            } else {
                toast.error(result.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error('Error deleting announcement');
        }
    };

    const handleRoleToggle = (role: string) => {
        setNewAnnouncement(prev => {
            if (role === 'all') return { ...prev, targetRole: ['all'] };

            let roles = prev.targetRole.filter(r => r !== 'all');
            if (roles.includes(role)) {
                roles = roles.filter(r => r !== role);
                if (roles.length === 0) roles = ['all'];
            } else {
                roles.push(role);
            }
            return { ...prev, targetRole: roles };
        });
    };

    const filteredAnnouncements = announcements.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.message.toLowerCase().includes(searchTerm.toLowerCase());
        const targetRoles = Array.isArray(a.targetRole) ? a.targetRole : [];
        const matchesRole = filterRole === 'all' || targetRoles.includes(filterRole);
        return matchesSearch && matchesRole;
    });

    const getAttachmentIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
        if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
        return <FileIcon className="w-4 h-4 text-blue-500" />;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
                        <p className="text-muted-foreground">Post and manage announcements across the institution</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {showForm ? 'Cancel POST' : 'New Announcement'}
                    </Button>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-card p-6 rounded-2xl border border-border shadow-xl ring-1 ring-black/5"
                        >
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80">Title</label>
                                            <Input
                                                placeholder="e.g., Annual Sports Meet 2026"
                                                value={newAnnouncement.title}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                className="bg-background/50 border-border/60 focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80">Target Audience</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['all', 'faculty', 'student', 'department-admin'].map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => handleRoleToggle(role)}
                                                        className={cn(
                                                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                                            newAnnouncement.targetRole.includes(role)
                                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                                : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                                        )}
                                                    >
                                                        {role === 'all' ? 'All Roles' : role === 'department-admin' ? 'HODs' : role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80">Attachments</label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setNewAnnouncement({ ...newAnnouncement, files: Array.from(e.target.files) });
                                                        }
                                                    }}
                                                    className="bg-background/50 border-dashed border-2 cursor-pointer hover:bg-background/80 transition-colors"
                                                />
                                            </div>
                                            {newAnnouncement.files.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {newAnnouncement.files.map((file, i) => (
                                                        <Badge key={i} variant="secondary" className="px-2 py-1 gap-1">
                                                            {getAttachmentIcon(file.type)}
                                                            {file.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground/80">Description</label>
                                            <Textarea
                                                placeholder="Details of the announcement..."
                                                value={newAnnouncement.message}
                                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                                className="min-h-[220px] bg-background/50 border-border/60 focus:ring-primary/20 leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Discard</Button>
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">Post Announcement</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/40">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search announcements..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                        {['all', 'faculty', 'student', 'department-admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                    filterRole === role
                                        ? "bg-secondary text-white border-secondary"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                                )}
                            >
                                {role === 'all' ? 'All' : role === 'department-admin' ? 'HODs' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-card/50 rounded-2xl animate-pulse border border-border/40" />
                        ))}
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
                        <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground/70">No Announcements Found</h3>
                        <p className="text-muted-foreground text-sm">Post a new announcement or try changing filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnnouncements.map((announcement) => (
                            <motion.div
                                key={announcement.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => navigate(`/admin/superadmin/announcements/${announcement.id}`)}
                                className="bg-card group rounded-2xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer"
                            >
                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex -space-x-1">
                                            {(Array.isArray(announcement.targetRole) ? announcement.targetRole : []).map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant="secondary"
                                                    className={cn(
                                                        "px-2 py-0.5 text-[10px] uppercase font-black border border-white/10",
                                                        role === 'faculty' && "bg-blue-500 text-white",
                                                        role === 'student' && "bg-green-500 text-white",
                                                        role === 'department-admin' && "bg-amber-500 text-white",
                                                        role === 'all' && "bg-gray-500 text-white"
                                                    )}
                                                >
                                                    {role === 'department-admin' ? 'HOD' : role}
                                                </Badge>
                                            ))}
                                        </div>
                                        {(user?.role === 'superadmin' || user?.role === 'super-admin') && (
                                            <button
                                                onClick={() => handleDelete(String(announcement.id))}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                        {announcement.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-4 mb-4 flex-grow">
                                        {announcement.message}
                                    </p>

                                    <div className="space-y-4">
                                        {(announcement.attachments || []).length > 0 && (
                                            <div className="flex flex-wrap gap-2 py-3 border-y border-border/40">
                                                {(announcement.attachments || []).map((file, i) => (
                                                    <a
                                                        key={i}
                                                        href={file.url}
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 text-[10px] font-bold text-foreground hover:bg-muted transition-colors border border-border/60"
                                                    >
                                                        {getAttachmentIcon(file.type)}
                                                        <span className="max-w-[100px] truncate">{file.name}</span>
                                                        <Download className="w-2.5 h-2.5 ml-1" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    {announcement.createdBy?.avatar ? (
                                                        <img src={announcement.createdBy.avatar} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-black">{announcement.createdBy?.name?.charAt(0) || 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold">{announcement.createdBy?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-muted-foreground">{announcement.creatorRole}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
