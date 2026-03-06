import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, Briefcase, Users, Edit, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/pages/student/components/ui/dialog';
import { useToast } from '@/pages/student/hooks/use-toast';

const parentData = {
  father: {
    name: 'Rajesh Sharma',
    occupation: 'Business Owner',
    phone: '+91 98765 11111',
    email: 'rajesh.sharma@email.com',
    qualification: 'MBA',
    annualIncome: 'â‚¹12,00,000',
  },
  mother: {
    name: 'Sunita Sharma',
    occupation: 'Teacher',
    phone: '+91 98765 22222',
    email: 'sunita.sharma@email.com',
    qualification: 'M.Ed',
    annualIncome: 'â‚¹6,00,000',
  },
  guardian: {
    name: 'Vikram Sharma',
    relation: 'Uncle',
    phone: '+91 98765 33333',
    address: '456 Park Avenue, Sector 10, Mumbai',
  },
  siblings: [
    {
      name: 'Arjun Sharma',
      age: 19,
      education: 'B.Tech Computer Science',
      phone: '+91 98765 77777',
    },
    {
      name: 'Anjali Sharma',
      age: 16,
      education: '12th Grade',
      phone: '+91 98765 88888',
    },
  ],
};

export default function ParentInfo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [editingParent, setEditingParent] = useState<'father' | 'mother' | 'guardian' | null>(null);
  const [editingSiblingIndex, setEditingSiblingIndex] = useState<number | null>(null);
  const [siblings, setSiblings] = useState(parentData.siblings);
  const [formData, setFormData] = useState({
    father: { ...parentData.father },
    mother: { ...parentData.mother },
    guardian: { ...parentData.guardian },
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

  const handleEditClick = (parent: 'father' | 'mother' | 'guardian') => {
    setEditingParent(parent);
    setEditingSiblingIndex(null);
    if (parent === 'father' || parent === 'mother') {
      setDialogFormData({
        name: formData[parent].name,
        occupation: formData[parent].occupation,
        phone: formData[parent].phone,
        email: formData[parent].email,
        qualification: formData[parent].qualification,
        annualIncome: formData[parent].annualIncome,
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
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingSiblingIndex !== null) {
      const updatedSiblings = [...siblings];
      updatedSiblings[editingSiblingIndex] = {
        ...updatedSiblings[editingSiblingIndex],
        name: dialogFormData.name,
        phone: dialogFormData.phone,
        age: parseInt(dialogFormData.age) || updatedSiblings[editingSiblingIndex].age,
        education: dialogFormData.education,
      };
      setSiblings(updatedSiblings);
      setPendingRequest(true);
      toast({
        title: 'Request Submitted',
        description: 'Your changes have been submitted to faculty for approval.',
      });
    } else if (editingParent === 'father' || editingParent === 'mother') {
      setFormData(prev => ({
        ...prev,
        [editingParent]: {
          ...prev[editingParent],
          name: dialogFormData.name,
          occupation: dialogFormData.occupation,
          phone: dialogFormData.phone,
          email: dialogFormData.email,
          qualification: dialogFormData.qualification,
          annualIncome: dialogFormData.annualIncome,
        },
      }));
      setPendingRequest(true);
      toast({
        title: 'Request Submitted',
        description: 'Your changes have been submitted to faculty for approval.',
      });
    } else if (editingParent === 'guardian') {
      setFormData(prev => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          name: dialogFormData.name,
          phone: dialogFormData.phone,
          relation: dialogFormData.relation,
          address: dialogFormData.address,
        },
      }));
      setPendingRequest(true);
      toast({
        title: 'Request Submitted',
        description: 'Your changes have been submitted to faculty for approval.',
      });
    }

    setIsSaving(false);
    setShowDialog(false);
    setEditingParent(null);
    setEditingSiblingIndex(null);
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
    setEditingParent(null);
    setEditingSiblingIndex(null);
    setDialogFormData({
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
  };



  return (
    <div className="animate-fade-in w-full">
      <PageHeader
        title="Parent Information"
        subtitle="Family and guardian details"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Parent Info' },
        ]}
      />

      <ProfileNavBar />

      <div className="grid gap-6">
        {/* Pending Request Alert */}
        {pendingRequest && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Change Request Pending</h3>
              <p className="text-sm text-amber-800 mt-1">
                Your changes have been submitted to faculty for approval. You will be notified once they review your request.
              </p>
            </div>
          </div>
        )}

        <SectionCard
          title="Parent & Guardian Details"
        >
          <div className="space-y-8">
            {/* Father & Mother in a single responsive row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Father */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-start gap-3 mb-4 justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                        Father
                      </p>
                      <h3 className="font-semibold">{formData.father.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{formData.father.occupation}</span>
                      </div>
                    </div>
                  </div>
                  {formData.father.name && formData.father.name !== 'Rajesh Sharma' && (
                    <button
                      onClick={() => handleEditClick('father')}
                      disabled={pendingRequest}
                      className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Edit father's information"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Phone</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formData.father.phone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Email</span>
                    <p className="font-medium break-all">{formData.father.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground text-xs">Qualification</span>
                      <p className="font-medium">{formData.father.qualification}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Annual Income</span>
                      <p className="font-medium">{formData.father.annualIncome}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mother */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-start gap-3 mb-4 justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                        Mother
                      </p>
                      <h3 className="font-semibold">{formData.mother.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{formData.mother.occupation}</span>
                      </div>
                    </div>
                  </div>
                  {formData.mother.name && formData.mother.name !== 'Sunita Sharma' && (
                    <button
                      onClick={() => handleEditClick('mother')}
                      disabled={pendingRequest}
                      className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Edit mother's information"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Phone</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formData.mother.phone}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Email</span>
                    <p className="font-medium break-all">{formData.mother.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground text-xs">Qualification</span>
                      <p className="font-medium">{formData.mother.qualification}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Annual Income</span>
                      <p className="font-medium">{formData.mother.annualIncome}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian block */}
            <div className="rounded-xl border border-dashed border-border/60 bg-background/40 p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Local Guardian (if any)
                </p>
                {formData.guardian.name && formData.guardian.name !== 'Vikram Sharma' && (
                  <button
                    onClick={() => handleEditClick('guardian')}
                    disabled={pendingRequest}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit guardian's information"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Name</label>
                  <p className="font-medium">{formData.guardian.name}</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Relation</label>
                  <p className="font-medium">{formData.guardian.relation}</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                  <p className="font-medium">{formData.guardian.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Address</label>
                  <p className="font-medium">{formData.guardian.address}</p>
                </div>
              </div>
            </div>

            {/* Siblings */}
            {siblings && siblings.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-semibold">Siblings</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {siblings.map((sibling, index) => (
                    <div key={index} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-start gap-3 mb-4 justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{sibling.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Age: {sibling.age}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditSiblingClick(index)}
                          disabled={pendingRequest}
                          className="p-2 rounded-lg hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title={`Edit ${sibling.name}'s information`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Education</span>
                          <p className="font-medium">{sibling.education}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Phone</span>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{sibling.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Dialog for editing parent information */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSiblingIndex !== null
                  ? `Edit ${siblings[editingSiblingIndex]?.name || 'Sibling'}`
                  : editingParent === 'father'
                    ? "Edit Father's Information"
                    : editingParent === 'mother'
                      ? "Edit Mother's Information"
                      : "Edit Guardian's Information"}
              </DialogTitle>
              <DialogDescription>
                Please fill out or update the parent/guardian details below. Fields with an asterisk (*) are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={dialogFormData.name}
                  onChange={(e) => setDialogFormData({ ...dialogFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>

              {(editingParent === 'father' || editingParent === 'mother') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Occupation</label>
                    <input
                      type="text"
                      placeholder="Enter occupation"
                      value={dialogFormData.occupation}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, occupation: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={dialogFormData.phone}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={dialogFormData.email}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Qualification</label>
                    <input
                      type="text"
                      placeholder="Enter qualification"
                      value={dialogFormData.qualification}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, qualification: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Annual Income</label>
                    <input
                      type="text"
                      placeholder="Enter annual income"
                      value={dialogFormData.annualIncome}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, annualIncome: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                </>
              )}

              {editingParent === 'guardian' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Relation</label>
                    <input
                      type="text"
                      placeholder="Enter relation"
                      value={dialogFormData.relation}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, relation: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={dialogFormData.phone}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea
                      placeholder="Enter address"
                      value={dialogFormData.address}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                </>
              )}

              {editingSiblingIndex !== null && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="Enter sibling name"
                      value={dialogFormData.name}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      value={dialogFormData.age}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, age: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Education</label>
                    <input
                      type="text"
                      placeholder="Enter education"
                      value={dialogFormData.education}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, education: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={dialogFormData.phone}
                      onChange={(e) => setDialogFormData({ ...dialogFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <DialogClose asChild>
                  <button
                    onClick={handleCancelDialog}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  onClick={handleSaveDialog}
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


