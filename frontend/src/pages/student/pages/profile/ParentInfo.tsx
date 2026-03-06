import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, Briefcase, Users, Edit, Clock, Mail, Heart, Shield, GraduationCap, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';
import { getMyProfile, updateMyProfile } from '@/pages/student/services/studentApi';
import { Loader2 } from 'lucide-react';

interface ParentDetails {
  name: string;
  occupation: string;
  phone: string;
  email: string;
  qualification: string;
  annualIncome: string;
}

interface GuardianDetails {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

interface SiblingDetails {
  name: string;
  age: number;
  education: string;
  phone: string;
}

export default function ParentInfo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [editingParent, setEditingParent] = useState<'father' | 'mother' | 'guardian' | null>(null);
  const [editingSiblingIndex, setEditingSiblingIndex] = useState<number | null>(null);
  const [siblings, setSiblings] = useState<SiblingDetails[]>([]);
  const [formData, setFormData] = useState({
    father: {
      name: '',
      occupation: '',
      phone: '',
      email: '',
      qualification: '',
      annualIncome: '',
    } as ParentDetails,
    mother: {
      name: '',
      occupation: '',
      phone: '',
      email: '',
      qualification: '',
      annualIncome: '',
    } as ParentDetails,
    guardian: {
      name: '',
      relation: '',
      phone: '',
      address: '',
    } as GuardianDetails,
  });
  const [dialogFormData, setDialogFormData] = useState({
    name: '',
    occupation: '',
    phone: '',
    email: '',
    qualification: '',
    annualIncome: '',
    relation: '',
    address: '',
    age: '',
    education: '',
  });

  const fetchParentInfo = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile() as any;
      if (res.success && res.data?.bio) {
        const bio = res.data.bio;
        if (bio.parentInfo) {
          const pi = bio.parentInfo;
          setFormData({
            father: {
              name: pi.father?.name || '',
              occupation: pi.father?.occupation || '',
              phone: pi.father?.phone || '',
              email: pi.father?.email || '',
              qualification: pi.father?.qualification || '',
              annualIncome: pi.father?.annualIncome || '',
            },
            mother: {
              name: pi.mother?.name || '',
              occupation: pi.mother?.occupation || '',
              phone: pi.mother?.phone || '',
              email: pi.mother?.email || '',
              qualification: pi.mother?.qualification || '',
              annualIncome: pi.mother?.annualIncome || '',
            },
            guardian: {
              name: pi.guardian?.name || '',
              relation: pi.guardian?.relation || '',
              phone: pi.guardian?.phone || '',
              address: pi.guardian?.address || '',
            },
          });
          if (pi.siblings) {
            setSiblings(pi.siblings);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch parent info', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentInfo();
  }, []);

  const handleEditClick = (parent: 'father' | 'mother' | 'guardian') => {
    setEditingParent(parent);
    setEditingSiblingIndex(null);
    if (parent === 'father' || parent === 'mother') {
      const data = formData[parent];
      setDialogFormData({
        name: data.name,
        occupation: data.occupation,
        phone: data.phone,
        email: data.email,
        qualification: data.qualification,
        annualIncome: data.annualIncome,
        relation: '',
        address: '',
        age: '',
        education: '',
      });
    } else {
      setDialogFormData({
        name: formData.guardian.name,
        occupation: '',
        phone: formData.guardian.phone,
        email: '',
        qualification: '',
        annualIncome: '',
        relation: formData.guardian.relation,
        address: formData.guardian.address,
        age: '',
        education: '',
      });
    }
    setShowDialog(true);
  };

  const handleEditSiblingClick = (index: number) => {
    setEditingSiblingIndex(index);
    setEditingParent(null);
    setDialogFormData({
      name: siblings[index].name,
      occupation: '',
      phone: siblings[index].phone,
      email: '',
      qualification: '',
      annualIncome: '',
      relation: '',
      address: '',
      age: siblings[index].age.toString(),
      education: siblings[index].education,
    });
    setShowDialog(true);
  };

  const handleSaveDialog = async () => {
    setIsSaving(true);
    let updatedFormData = { ...formData };
    let updatedSiblings = [...siblings];

    if (editingSiblingIndex !== null) {
      updatedSiblings[editingSiblingIndex] = {
        ...updatedSiblings[editingSiblingIndex],
        name: dialogFormData.name,
        phone: dialogFormData.phone,
        age: parseInt(dialogFormData.age) || updatedSiblings[editingSiblingIndex].age,
        education: dialogFormData.education,
      };
    } else if (editingParent === 'father' || editingParent === 'mother') {
      updatedFormData[editingParent] = {
        ...updatedFormData[editingParent],
        name: dialogFormData.name,
        occupation: dialogFormData.occupation,
        phone: dialogFormData.phone,
        email: dialogFormData.email,
        qualification: dialogFormData.qualification,
        annualIncome: dialogFormData.annualIncome,
      };
    } else if (editingParent === 'guardian') {
      updatedFormData.guardian = {
        ...updatedFormData.guardian,
        name: dialogFormData.name,
        phone: dialogFormData.phone,
        relation: dialogFormData.relation,
        address: dialogFormData.address,
      };
    }

    try {
      const parentInfoToSave = {
        ...updatedFormData,
        siblings: updatedSiblings
      };

      await updateMyProfile({ parentInfo: parentInfoToSave });

      setFormData(updatedFormData);
      setSiblings(updatedSiblings);
      setPendingRequest(true);
      toast({
        title: 'Request Submitted',
        description: 'Your changes have been saved and submitted for faculty approval.',
      });
    } catch (error) {
      console.error('Failed to save parent info', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
      setShowDialog(false);
      setEditingParent(null);
      setEditingSiblingIndex(null);
    }
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
    setEditingParent(null);
    setEditingSiblingIndex(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Parent Information"
        subtitle="Manage family and guardian records"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Parent Info' },
        ]}
      />

      <ProfileNavBar />

      <div className="grid gap-8">
        {pendingRequest && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm animate-pulse">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Request Under Review</h3>
              <p className="text-sm text-amber-800 font-medium">Your changes are waiting for faculty approval.</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Father Section */}
          <SectionCard
            title="Father's Details"
            icon={Heart}
            className="shadow-xl"
            actions={
              <button
                onClick={() => handleEditClick('father')}
                disabled={pendingRequest}
                className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-all border border-primary/10"
              >
                <Edit className="w-4 h-4" />
              </button>
            }
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{formData.father.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {formData.father.occupation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Phone className="w-4 h-4 text-primary" />
                    {formData.father.phone}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Qualification</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {formData.father.qualification}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Email Address</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold truncate">
                    <Mail className="w-4 h-4 text-primary" />
                    {formData.father.email}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Annual Income</label>
                  <div className="flex items-center gap-2 text-primary font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    {formData.father.annualIncome}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Mother Section */}
          <SectionCard
            title="Mother's Details"
            icon={Heart}
            className="shadow-xl"
            actions={
              <button
                onClick={() => handleEditClick('mother')}
                disabled={pendingRequest}
                className="p-2.5 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary/10 transition-all border border-secondary/10"
              >
                <Edit className="w-4 h-4" />
              </button>
            }
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{formData.mother.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {formData.mother.occupation}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Phone className="w-4 h-4 text-secondary" />
                    {formData.mother.phone}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Qualification</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    {formData.mother.qualification}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Email Address</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold truncate">
                    <Mail className="w-4 h-4 text-secondary" />
                    {formData.mother.email}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Annual Income</label>
                  <div className="flex items-center gap-2 text-secondary font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    {formData.mother.annualIncome}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Local Guardian Section */}
          <SectionCard
            title="Local Guardian"
            subtitle="Alternative contact person"
            icon={Shield}
            className="shadow-xl"
            actions={
              <button
                onClick={() => handleEditClick('guardian')}
                disabled={pendingRequest}
                className="p-2.5 rounded-xl bg-accent/5 text-accent hover:bg-accent/10 transition-all border border-accent/10"
              >
                <Edit className="w-4 h-4" />
              </button>
            }
          >
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Name</label>
                  <p className="font-bold text-foreground">{formData.guardian.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Relation</label>
                  <p className="font-bold text-accent">{formData.guardian.relation}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone</label>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Phone className="w-4 h-4 text-accent" />
                    {formData.guardian.phone}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <label className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">Address</label>
                <p className="text-sm font-medium leading-relaxed">{formData.guardian.address}</p>
              </div>
            </div>
          </SectionCard>

          {/* Siblings Section */}
          <SectionCard
            title="Siblings"
            icon={Users}
            className="shadow-xl"
          >
            <div className="space-y-4">
              {siblings.map((sibling, index) => (
                <div key={index} className="group relative p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{sibling.name}</h4>
                        <p className="text-xs text-muted-foreground font-medium">Age: {sibling.age} • {sibling.education}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditSiblingClick(index)}
                      disabled={pendingRequest}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-card transition-colors disabled:opacity-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {sibling.phone}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
              {editingSiblingIndex !== null ? 'Update Sibling Info' : `Update ${(editingParent || 'Parent').charAt(0).toUpperCase() + (editingParent || 'Parent').slice(1)}'s Info`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Submit your changes for verification by the academic office.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground ml-1">Full Name</label>
              <input
                type="text"
                value={dialogFormData.name}
                onChange={(e) => setDialogFormData({ ...dialogFormData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {(editingParent === 'father' || editingParent === 'mother') && (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Occupation</label>
                  <input
                    type="text"
                    value={dialogFormData.occupation}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, occupation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Phone</label>
                  <input
                    type="text"
                    value={dialogFormData.phone}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
                  <input
                    type="email"
                    value={dialogFormData.email}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {editingParent === 'guardian' && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Relation</label>
                    <input
                      type="text"
                      value={dialogFormData.relation}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, relation: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground ml-1">Phone</label>
                    <input
                      type="text"
                      value={dialogFormData.phone}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Address</label>
                  <textarea
                    value={dialogFormData.address}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>
              </>
            )}

            {editingSiblingIndex !== null && (
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Age</label>
                  <input
                    type="number"
                    value={dialogFormData.age}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Education</label>
                  <input
                    type="text"
                    value={dialogFormData.education}
                    onChange={(e) => setDialogFormData({ ...dialogFormData, education: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              onClick={handleCancelDialog}
              className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-foreground hover:bg-muted transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSaveDialog}
              disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
