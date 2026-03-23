import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, MapPin, Briefcase, Heart, UserPlus, Loader2, Edit, Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/pages/student/components/ui/dialog';
import { Input } from '@/pages/student/components/ui/input';
import { Label } from '@/pages/student/components/ui/label';
import { Button } from '@/pages/student/components/ui/button';
import { useToast } from '@/pages/student/hooks/use-toast';
import { getMyProfile, updateMyProfile } from '@/pages/student/services/studentApi';

export default function ReferenceInfo() {
  const [referenceList, setReferenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editReferenceIndex, setEditReferenceIndex] = useState<number | null>(null);
  const [referenceForm, setReferenceForm] = useState({ name: '', relation: '', phone: '', address: '', occupation: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile() as any;
        if (res.success && res.data?.bio?.references) {
          setReferenceList(res.data.bio.references);
        }
      } catch (error) {
        console.error('Failed to fetch references', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReferences();
  }, []);

  const openReferenceDialog = (index: number | null = null) => {
    if (index !== null && referenceList[index]) {
      setReferenceForm({
        name: referenceList[index].name || '',
        relation: referenceList[index].relation || '',
        phone: referenceList[index].phone || '',
        address: referenceList[index].address || '',
        occupation: referenceList[index].occupation || '',
      });
      setEditReferenceIndex(index);
    } else {
      setReferenceForm({ name: '', relation: '', phone: '', address: '', occupation: '' });
      setEditReferenceIndex(null);
    }
    setDialogOpen(true);
  };

  const closeReferenceDialog = () => {
    setDialogOpen(false);
    setEditReferenceIndex(null);
  };

  const saveReference = async () => {
    setSaving(true);
    try {
      const updated = [...referenceList];
      if (editReferenceIndex === null) {
        updated.push(referenceForm);
      } else {
        updated[editReferenceIndex] = referenceForm;
      }

      const res = (await updateMyProfile({ references: updated })) as any;
      if (res.success) {
        setReferenceList(updated);
        setDialogOpen(false);
        setEditReferenceIndex(null);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        toast({ title: 'Saved', description: 'Reference updated successfully' });
      } else {
        toast({ title: 'Error', description: res.error || 'Unable to save reference', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Reference save failed', error);
      toast({ title: 'Error', description: error.message || 'Unable to save reference', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteReference = async (index: number) => {
    const updated = referenceList.filter((_, i) => i !== index);
    setSaving(true);
    try {
      const res = (await updateMyProfile({ references: updated })) as any;
      if (res.success) {
        setReferenceList(updated);
        toast({ title: 'Deleted', description: 'Reference removed successfully' });
      } else {
        toast({ title: 'Error', description: res.error || 'Unable to delete reference', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Failed to delete reference', error);
      toast({ title: 'Error', description: error.message || 'Unable to delete reference', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="References & Institution Relatives"
        subtitle="Emergency contacts and verified references"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'References' },
        ]}
      />

      <ProfileNavBar />

      <div className="flex justify-end mb-4">
        <Button size="sm" variant="outline" onClick={() => openReferenceDialog(null)}>
          <Plus className="w-4 h-4" /> Add Reference
        </Button>
      </div>

      <div className="grid gap-8">
        {referenceList.length === 0 ? (
          <div className="section-card flex flex-col items-center justify-center py-20 bg-muted/20 border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">No References Added</p>
            <p className="text-sm text-muted-foreground mt-2">Verified institution relatives will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {referenceList.map((ref, index) => (
              <SectionCard
                key={`${ref.id || index}-${ref.name}`}
                title={`Reference #${index + 1}`}
                icon={Heart}
                className="shadow-xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-base text-foreground">{ref.name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openReferenceDialog(index)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteReference(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{ref.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-orange-700 font-bold uppercase tracking-wider">
                        <span>{ref.relation}</span>
                        <span className="w-1 h-1 rounded-full bg-orange-300" />
                        <span>{ref.occupation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone Number</label>
                      <div className="flex items-center gap-3 text-foreground font-bold">
                        <Phone className="w-4 h-4 text-orange-500" />
                        {ref.phone}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Contact Address</label>
                      <div className="flex items-start gap-3 text-sm text-foreground font-semibold leading-relaxed">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        {ref.address}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeReferenceDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editReferenceIndex !== null ? 'Edit Reference' : 'Add Reference'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 mt-4">
            <div>
              <Label>Name</Label>
              <Input value={referenceForm.name} onChange={(e) => setReferenceForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Relation</Label>
              <Input value={referenceForm.relation} onChange={(e) => setReferenceForm((prev) => ({ ...prev, relation: e.target.value }))} />
            </div>
            <div>
              <Label>Occupation</Label>
              <Input value={referenceForm.occupation} onChange={(e) => setReferenceForm((prev) => ({ ...prev, occupation: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={referenceForm.phone} onChange={(e) => setReferenceForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={referenceForm.address} onChange={(e) => setReferenceForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReferenceDialog} disabled={saving}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={saveReference} disabled={saving}>
              {saving ? 'Saving...' : editReferenceIndex !== null ? 'Save Changes' : 'Add Reference'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
