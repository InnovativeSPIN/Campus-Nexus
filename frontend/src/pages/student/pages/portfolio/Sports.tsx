import { useState, useEffect } from 'react';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { Edit, Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';
import {
    getMySports,
    createSport,
    updateSport,
    deleteSport,
} from '@/pages/student/services/studentApi';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Sport {
    id: string;
    name: string;
    category: string;
    status: 'active' | 'inactive';
    joinedDate: string;
    achievements: string;
    approvalStatus?: ApprovalStatus;
}

interface SportsProps {
    onPendingChange?: (hasPending: boolean) => void;
}

const emptyForm: Omit<Sport, 'id'> = {
    name: '',
    category: '',
    status: 'active',
    joinedDate: '',
    achievements: '',
    approvalStatus: 'pending',
};

export default function Sports({ onPendingChange }: SportsProps) {
    const { toast } = useToast();
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Sport, 'id'>>(emptyForm);

    useEffect(() => {
        setLoading(true);
        getMySports()
            .then((res: any) => setSports(res.data || []))
            .catch(() => setSports([]))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = (sport: Sport) => {
        setEditingId(sport.id);
        setFormData({ name: sport.name, category: sport.category, status: sport.status, joinedDate: sport.joinedDate, achievements: sport.achievements, approvalStatus: 'pending' });
        setShowDialog(true);
        if (onPendingChange) onPendingChange(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setShowDialog(true);
        if (onPendingChange) onPendingChange(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSport(id);
            setSports((prev) => prev.filter((s) => s.id !== id));
            toast({ title: 'Sport deleted successfully.' });
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: 'Error', description: 'Sport name is required.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                const res: any = await updateSport(editingId, formData);
                setSports((prev) => prev.map((s) => (s.id === editingId ? res.data : s)));
                toast({ title: 'Request Submitted', description: 'Changes submitted for faculty approval.' });
            } else {
                const res: any = await createSport(formData);
                setSports((prev) => [res.data, ...prev]);
                toast({ title: 'Request Submitted', description: 'Sport submitted for faculty approval.' });
            }
            setShowDialog(false);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setShowDialog(false);
        setEditingId(null);
        setFormData(emptyForm);
    };

    const getApprovalBadgeVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Sport
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : sports.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-sm">No sports added yet.</div>
            ) : (
                <div className="grid gap-4">
                    {sports.map((sport) => (
                        <SectionCard
                            key={sport.id}
                            title={sport.name}
                            actions={
                                sport.approvalStatus !== 'pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(sport)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(sport.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )
                            }
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Category: {sport.category}</p>
                                    <p className="text-sm text-muted-foreground">Joined: {sport.joinedDate}</p>
                                    <p className="text-sm text-muted-foreground">Achievements: {sport.achievements}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Badge variant={sport.status === 'active' ? 'success' : 'info'}>Status: {sport.status}</Badge>
                                    <Badge variant={getApprovalBadgeVariant(sport.approvalStatus)}>{sport.approvalStatus || 'pending'}</Badge>
                                </div>
                            </div>
                        </SectionCard>
                    ))}
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Sport Name *</label>
                            <input type="text" placeholder="Enter sport name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                                <option value="">Select category</option>
                                <option value="Team Sports">Team Sports</option>
                                <option value="Individual Sports">Individual Sports</option>
                                <option value="Aquatics">Aquatics</option>
                                <option value="Combat Sports">Combat Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Joined Date</label>
                            <input type="date" value={formData.joinedDate} onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Achievements</label>
                            <input type="text" placeholder="e.g., Winner, Runner-up" value={formData.achievements} onChange={(e) => setFormData({ ...formData, achievements: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <DialogClose asChild>
                                <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
                            </DialogClose>
                            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
