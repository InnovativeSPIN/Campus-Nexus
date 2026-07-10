import { useState } from "react";
import { AnnouncementsList } from '@/components/common/AnnouncementsList';
import { MainLayout } from '../components/layout/MainLayout';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Plus, X } from "lucide-react";

function getAuthToken(): string {
  return localStorage.getItem("authToken") ?? "";
}

export default function FacultyAnnouncementsPage() {
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [form, setForm] = useState({
        title:      "",
        message:    "",
        type:       "General",
        priority:   "normal",
        targetRole: "student",
        semester:   "",
        year:       "",
        term:       "",
        attachment: null as File | null,
    });

    const handlePost = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            alert("Title and message are required.");
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("title",      form.title);
            fd.append("message",    form.message);
            fd.append("type",       form.type);
            fd.append("priority",   form.priority);
            fd.append("targetRole", JSON.stringify([form.targetRole]));
            if (form.semester) fd.append("semester", form.semester);
            if (form.year)     fd.append("year",     form.year);
            if (form.term)     fd.append("term",     form.term);
            if (form.attachment) fd.append("files",  form.attachment);

            const res  = await fetch("/api/v1/announcements", {
                method:  "POST",
                headers: { Authorization: `Bearer ${getAuthToken()}` },
                body:    fd,
            });
            const data = await res.json();

            if (data.success) {
                setShowForm(false);
                setForm({ title: "", message: "", type: "General", priority: "normal", targetRole: "student", semester: "", year: "", term: "", attachment: null });
                setRefreshKey(prev => prev + 1); // trigger refetch in AnnouncementsList
            } else {
                alert(data.error ?? "Failed to post announcement.");
            }
        } catch {
            alert("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="page-header font-serif text-2xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground mt-1">
                        View announcements and post new ones
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
                    {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showForm ? "Cancel" : "Make Announcement"}
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                    >
                        <h3 className="text-lg font-bold text-foreground mb-4">Create New Announcement</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
                                value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
                                <option value="">All Semesters</option>
                                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={String(s)}>Sem {s}</option>)}
                            </select>

                            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
                                value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                                <option value="">Both Terms</option>
                                <option value="even">Even</option>
                                <option value="odd">Odd</option>
                            </select>

                            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
                                value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                                <option value="">All Years</option>
                                {["I","II","III","IV"].map((y) => <option key={y} value={y}>{y} Year</option>)}
                            </select>

                            <select className="h-10 rounded-md border border-input px-3 text-sm bg-background"
                                value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                                <option value="student">Students</option>
                                <option value="faculty">Faculty</option>
                                <option value="all">Everyone</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input placeholder="Announcement title" value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value="General">General</option>
                                    <option value="Examination">Examination</option>
                                    <option value="Training">Training</option>
                                    <option value="Placement">Placement</option>
                                    <option value="Events">Events</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea placeholder="Enter announcement details..." className="min-h-[100px]"
                                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <div className="flex gap-4 pt-1">
                                    {(["high","normal","low"] as const).map((p) => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="priority" value={p} checked={form.priority === p}
                                                onChange={() => setForm({ ...form, priority: p })} />
                                            <span className="text-sm capitalize">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Attachment (PDF / Image)</label>
                                <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button onClick={handlePost} disabled={submitting}>
                                {submitting ? "Posting…" : "Post Announcement"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pb-8">
                <AnnouncementsList key={refreshKey} />
            </div>
        </MainLayout>
    );
}
