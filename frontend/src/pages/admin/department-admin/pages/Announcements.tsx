import { useState } from "react";
import { AnnouncementsList } from '@/components/common/AnnouncementsList';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { toast } from '@/components/ui/sonner';

export default function DepartmentAdminAnnouncementsPage() {
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        message: "",
        category: "General",
        targetRole: ["faculty", "student"] as string[],
        files: [] as File[],
    });

    const handlePostAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.message) {
            toast.warning("Please fill in title and message");
            return;
        }

        const formData = new FormData();
        formData.append('title', newAnnouncement.title);
        formData.append('message', newAnnouncement.message);
        formData.append('category', newAnnouncement.category);
        formData.append('targetRole', newAnnouncement.targetRole.join(','));

        newAnnouncement.files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/v1/announcements', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Announcement posted successfully!");
                setShowAnnouncementForm(false);
                setNewAnnouncement({
                    title: "",
                    message: "",
                    category: "General",
                    targetRole: ["faculty", "student"],
                    files: [],
                });
                setRefreshKey(prev => prev + 1); // trigger refetch in AnnouncementsList
            } else {
                toast.error(data.error || "Failed to post announcement");
            }
        } catch (err) {
            toast.error("An error occurred while posting");
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
                <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="bg-primary hover:bg-primary/90">
                    {showAnnouncementForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showAnnouncementForm ? "Cancel" : "New Announcement"}
                </Button>
            </div>

            <AnimatePresence>
                {showAnnouncementForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-8 p-6 bg-card rounded-2xl border border-primary/20 shadow-xl"
                    >
                        <h3 className="text-lg font-bold mb-4">Post New Announcement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Announcement Title</label>
                                <Input
                                    placeholder="e.g. Mid-term Exam Schedule"
                                    value={newAnnouncement.title}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Category</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={newAnnouncement.category}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Examination">Examination</option>
                                    <option value="Events">Events</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold">Message Content</label>
                                <Textarea
                                    placeholder="Write your announcement message here..."
                                    rows={4}
                                    value={newAnnouncement.message}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Attachments</label>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={e => {
                                        if (e.target.files) {
                                            setNewAnnouncement({ ...newAnnouncement, files: Array.from(e.target.files) });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold block mb-2">Target Audience</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newAnnouncement.targetRole.includes('faculty')}
                                            onChange={e => {
                                                const roles = e.target.checked
                                                    ? [...newAnnouncement.targetRole, 'faculty']
                                                    : newAnnouncement.targetRole.filter(r => r !== 'faculty');
                                                setNewAnnouncement({ ...newAnnouncement, targetRole: roles });
                                            }}
                                        /> Faculty
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newAnnouncement.targetRole.includes('student')}
                                            onChange={e => {
                                                const roles = e.target.checked
                                                    ? [...newAnnouncement.targetRole, 'student']
                                                    : newAnnouncement.targetRole.filter(r => r !== 'student');
                                                setNewAnnouncement({ ...newAnnouncement, targetRole: roles });
                                            }}
                                        /> Students
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
                            <Button onClick={handlePostAnnouncement}>Post Announcement</Button>
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
