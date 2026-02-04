import { useState } from 'react';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';

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

const initialSports: Sport[] = [
    {
        id: '1',
        name: 'Football',
        category: 'Team Sports',
        status: 'active',
        joinedDate: '2024-01-15',
        achievements: 'Winner',
        approvalStatus: 'approved',
    },
    {
        id: '2',
        name: 'Basketball',
        category: 'Team Sports',
        status: 'active',
        joinedDate: '2024-02-01',
        achievements: 'Winner',
        approvalStatus: 'approved',
    },
    {
        id: '3',
        name: 'Tennis',
        category: 'Individual Sports',
        status: 'inactive',
        joinedDate: '2023-06-10',
        achievements: 'Runner-up',
        approvalStatus: 'approved',
    },
];

interface SportsProps {
    onPendingChange?: (hasPending: boolean) => void;
}

export default function Sports({ onPendingChange }: SportsProps) {
    const { toast } = useToast();
    const [sports, setSports] = useState<Sport[]>(initialSports);
    const [showDialog, setShowDialog] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Sport>({
        id: '',
        name: '',
        category: '',
        status: 'active',
        joinedDate: '',
        achievements: '',
        approvalStatus: 'pending',
    });

    const hasPendingItems = sports.some(s => s.approvalStatus === 'pending');

    const handleEdit = (sport: Sport) => {
        setEditingId(sport.id);
        setFormData({ ...sport, approvalStatus: 'pending' });
        setShowDialog(true);
        if (onPendingChange) onPendingChange(true);
    };

    const handleAdd = () => {
        setEditingId(null);
        setFormData({
            id: Math.random().toString(),
            name: '',
            category: '',
            status: 'active',
            joinedDate: '',
            achievements: '',
            approvalStatus: 'pending',
        });
        setShowDialog(true);
        if (onPendingChange) onPendingChange(true);
    };

    const handleDelete = async (id: string) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setSports(sports.filter(s => s.id !== id));
        setIsSaving(false);
        toast({
            title: 'Success',
            description: 'Sport deleted successfully.',
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({
                title: 'Error',
                description: 'Sport name is required.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (editingId) {
            setSports(sports.map(s => s.id === editingId ? { ...formData, approvalStatus: 'pending' } : s));
            toast({
                title: 'Request Submitted',
                description: 'Your changes have been submitted to faculty for approval.',
            });
        } else {
            setSports([...sports, { ...formData, approvalStatus: 'pending' }]);
            toast({
                title: 'Request Submitted',
                description: 'Your changes have been submitted to faculty for approval.',
            });
        }

        setIsSaving(false);
        setShowDialog(false);
    };

    const handleCancel = () => {
        setShowDialog(false);
        setEditingId(null);
        setFormData({
            id: '',
            name: '',
            category: '',
            status: 'active',
            joinedDate: '',
            achievements: '',
            approvalStatus: 'pending',
        });
    };

    const getApprovalBadgeVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'danger';
            case 'pending': return 'warning';
            default: return 'warning';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAdd}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Sport
                </button>
            </div>

            <div className="grid gap-4">

                {sports.map((sport) => (
                    <SectionCard
                        key={sport.id}
                        title={sport.name}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        actions={
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(sport)}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(sport.id)}
                                    disabled={isSaving}
                                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        }
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Category: {sport.category}</p>
                                <p className="text-sm text-muted-foreground">Joined: {sport.joinedDate}</p>
                                <p className="text-sm text-muted-foreground">Achievements: {sport.achievements}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Badge variant={sport.status === 'active' ? 'success' : 'info'}>
                                    Status: {sport.status}
                                </Badge>
                                <Badge variant={getApprovalBadgeVariant(sport.approvalStatus)}>
                                    {sport.approvalStatus || 'approved'}
                                </Badge>
                            </div>
                        </div>
                    </SectionCard>
                ))}

                {/* Edit/Add Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingId ? 'Edit Sport' : 'Add New Sport'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Sport Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter sport name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Team Sports, Individual Sports"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Joined Date</label>
                                <input
                                    type="date"
                                    value={formData.joinedDate}
                                    onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Achievements</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Winner, Runner-up"
                                    value={formData.achievements}
                                    onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <DialogClose asChild>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </DialogClose>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
