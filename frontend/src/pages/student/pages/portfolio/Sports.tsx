import { useState, useEffect } from 'react';
import Badge from '@/pages/student/components/common/Badge';
import { Edit, Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/pages/student/components/ui/dialog';
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
    documentUrl?: string;
}

interface SportFormData extends Omit<Sport, 'id'> {
    document?: File | null;
}

interface SportsProps {
    onPendingChange?: (hasPending: boolean) => void;
}

const emptyForm: SportFormData = {
    name: '',
    category: '',
    status: 'active',
    joinedDate: '',
    achievements: '',
    approvalStatus: 'pending',
    documentUrl: '',
    document: null,
};

export default function Sports({ onPendingChange }: SportsProps) {
    const { toast } = useToast();
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<SportFormData>(emptyForm);

    useEffect(() => {
        setLoading(true);
        getMySports()
            .then((res: any) => setSports(res.data || []))
            .catch(() => setSports([]))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = (sport: Sport) => {
        setEditingId(sport.id);
        setFormData({
            name: sport.name,
            category: sport.category,
            status: sport.status,
            joinedDate: sport.joinedDate,
            achievements: sport.achievements,
            approvalStatus: 'pending',
            documentUrl: sport.documentUrl || '',
            document: null
        });
        setShowDialog(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData(emptyForm);
        setShowDialog(true);
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
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('category', formData.category);
        submitData.append('status', formData.status);
        submitData.append('joinedDate', formData.joinedDate);
        if (formData.achievements) submitData.append('achievements', formData.achievements);

        if (formData.document) {
            submitData.append('documentUrl', formData.document);
        }

        try {
            if (editingId) {
                const res: any = await updateSport(editingId, submitData);
                setSports((prev) => prev.map((s) => (s.id === editingId ? res.data : s)));
                toast({ title: 'Request Submitted', description: 'Changes submitted for faculty approval.' });
            } else {
                const res: any = await createSport(submitData);
                setSports((prev) => [res.data, ...prev]);
                toast({ title: 'Request Submitted', description: 'Sport submitted for faculty approval.' });
            }
            if (onPendingChange) onPendingChange(true);
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
                <div className="grid gap-6 md:grid-cols-2">
                    {sports.map((sport) => (
                        <div key={sport.id} className="section-card group hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Edit className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{sport.name}</h3>
                                            <p className="text-sm text-primary font-medium">{sport.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {sport.approvalStatus !== 'pending' && (
                                            <>
                                                <button onClick={() => handleEdit(sport)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sport.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                        <span className="font-bold text-foreground min-w-[100px]">Joined Date:</span>
                                        {sport.joinedDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                        <span className="font-bold text-foreground min-w-[100px]">Achievements:</span>
                                        {sport.achievements}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <Badge variant={sport.status === 'active' ? 'success' : 'info'} className="px-4 py-1 uppercase tracking-tighter text-[10px] font-bold">
                                        {sport.status}
                                    </Badge>
                                    <Badge variant={getApprovalBadgeVariant(sport.approvalStatus)} className="px-4 py-1 shadow-sm">
                                        {sport.approvalStatus || 'pending'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details about your sports participation and achievements.
                        </DialogDescription>
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
                        <div>
                            <label className="block text-sm font-medium mb-2">Upload Certificate (Optional)</label>
                            <input type="file" onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })} className="w-full px-3 py-1.5 border border-input rounded-lg bg-background" accept=".jpg,.jpeg,.png,.pdf" />
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
