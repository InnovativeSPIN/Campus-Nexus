import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, Users, Edit, Mail, Heart, Shield, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/pages/student/components/ui/dialog';
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

type FamilyMemberType = 'father' | 'mother' | 'guardian';

export default function ParentInfo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSiblingDialog, setShowSiblingDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<FamilyMemberType>('father');
  const [editingGuardianIndex, setEditingGuardianIndex] = useState<number | null>(null);
  const [siblings, setSiblings] = useState<SiblingDetails[]>([]);
  const [siblingCount, setSiblingCount] = useState(0);
  const [guardians, setGuardians] = useState<GuardianDetails[]>([]);
  
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
  });

  const [formValues, setFormValues] = useState({
    name: '',
    occupation: '',
    phone: '',
    email: '',
    qualification: '',
    annualIncome: '',
    relation: '',
    address: '',
  });

  const fetchParentInfo = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile() as any;
      console.log('Fetched profile from DB:', res);
      
      if (res.success && res.data?.bio) {
        const bio = res.data.bio;
        console.log('Bio data from DB:', bio);
        console.log('parentInfo from DB:', bio.parentInfo);
        
        if (bio.parentInfo) {
          let pi = bio.parentInfo;
          
          // Handle case where parentInfo might be a JSON string
          if (typeof pi === 'string') {
            try {
              pi = JSON.parse(pi);
            } catch (e) {
              console.error('Failed to parse parentInfo JSON:', e);
              pi = {};
            }
          }
          
          console.log('Parsed parentInfo:', pi);
          
          // Set parent data
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
          });
          
          // Set guardians - handle different scenarios
          if (Array.isArray(pi.guardians) && pi.guardians.length > 0) {
            console.log('Setting guardians from array:', pi.guardians);
            setGuardians(pi.guardians);
          } else if (pi.guardian && typeof pi.guardian === 'object') {
            console.log('Setting guardians from single object:', pi.guardian);
            setGuardians([pi.guardian]);
          } else {
            console.log('No guardians found');
            setGuardians([]);
          }
          
          // Set siblings
          if (Array.isArray(pi.siblings) && pi.siblings.length > 0) {
            console.log('Setting siblings:', pi.siblings);
            setSiblings(pi.siblings);
          } else {
            console.log('No siblings found');
            setSiblings([]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch parent info from DB:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentInfo();
  }, []);

  const resetFormValues = () => {
    setFormValues({
      name: '',
      occupation: '',
      phone: '',
      email: '',
      qualification: '',
      annualIncome: '',
      relation: '',
      address: '',
    });
  };

  const populateFormValues = (type: FamilyMemberType, guardianIndex?: number) => {
    setSelectedType(type);
    setEditingGuardianIndex(guardianIndex ?? null);
    setShowForm(true);
    
    if (type === 'guardian' && guardianIndex !== undefined) {
      const guardian = guardians[guardianIndex];
      setFormValues({
        name: guardian.name,
        occupation: '',
        phone: guardian.phone,
        email: '',
        qualification: '',
        annualIncome: '',
        relation: guardian.relation,
        address: guardian.address,
      });
    } else if (type === 'guardian') {
      resetFormValues();
    } else {
      const data = formData[type];
      setFormValues({
        name: data.name,
        occupation: data.occupation,
        phone: data.phone,
        email: data.email,
        qualification: data.qualification,
        annualIncome: data.annualIncome,
        relation: '',
        address: '',
      });
    }
  };

  const handleSaveForm = async () => {
    if (!formValues.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    let updatedFormData = { ...formData };
    let updatedGuardians = [...guardians];

    try {
      if (selectedType === 'guardian') {
        if (editingGuardianIndex !== null) {
          updatedGuardians[editingGuardianIndex] = {
            name: formValues.name,
            relation: formValues.relation,
            phone: formValues.phone,
            address: formValues.address,
          };
        } else {
          updatedGuardians.push({
            name: formValues.name,
            relation: formValues.relation,
            phone: formValues.phone,
            address: formValues.address,
          });
        }
      } else {
        updatedFormData[selectedType] = {
          ...updatedFormData[selectedType],
          name: formValues.name,
          occupation: formValues.occupation,
          phone: formValues.phone,
          email: formValues.email,
          qualification: formValues.qualification,
          annualIncome: formValues.annualIncome,
        };
      }

      const parentInfoToSave = {
        ...updatedFormData,
        guardians: updatedGuardians,
        siblings: siblings
      };

      console.log('Saving to database:', parentInfoToSave);
      
      // Save to database
      const response = await updateMyProfile({ parentInfo: parentInfoToSave });
      console.log('Database response:', response);

      toast({
        title: 'Saved Successfully',
        description: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} information has been saved to database.`,
      });
      
      // Close form immediately
      resetFormValues();
      setShowForm(false);
      
      // Refresh profile from database to load all updated data
      console.log('Fetching updated data from database...');
      await fetchParentInfo();
      console.log('Data refreshed from database');
    } catch (error) {
      console.error('Database save error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Calculate if there's any family data
  const hasParentData = formData.father.name || formData.mother.name;
  const hasGuardianData = guardians.filter(g => g.name && g.name.trim()).length > 0;
  const hasFamilyData = hasParentData || hasGuardianData;

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <PageHeader
            title="Family Information"
            subtitle="Manage your parents, guardians and siblings details"
            breadcrumbs={[
              { label: 'Profile', path: '/student/profile/personal' },
              { label: 'Family Info' },
            ]}
          />
        </div>
        
        {/* EDIT BUTTON - Show only when there's data */}
        {hasFamilyData && !showForm && (
          <button
            onClick={() => {
              setSelectedType('father');
              resetFormValues();
              setShowForm(true);
            }}
            className="mt-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold flex items-center gap-2 flex-shrink-0"
          >
            <Edit className="w-4 h-4" /> Edit Family Info
          </button>
        )}
      </div>

      <ProfileNavBar />

      {showForm ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-border/50 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Add / Edit Family Member</h2>
              <p className="text-muted-foreground">Select a family member type and fill in their details</p>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                resetFormValues();
              }}
              className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-all"
              title="Close form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'father' as FamilyMemberType, label: '👨 Father', color: 'blue' },
              { type: 'mother' as FamilyMemberType, label: '👩 Mother', color: 'pink' },
              { type: 'guardian' as FamilyMemberType, label: '🛡️ Guardian', color: 'amber' },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => populateFormValues(type)}
                className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                  selectedType === type
                    ? color === 'blue'
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-lg'
                      : color === 'pink'
                      ? 'bg-pink-50 dark:bg-pink-950/30 border-pink-300 dark:border-pink-700 shadow-lg'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-lg'
                    : 'bg-white/50 dark:bg-slate-800/50 border-border/30 hover:border-border/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* PARENT DATA PREVIEW - Show when editing guardian */}
          {selectedType === 'guardian' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border/30 p-6 space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">Family Context</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Father Preview */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  formData.father.name 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-blue-500'
                    : 'bg-slate-50/50 dark:bg-slate-900/20 border-l-slate-300'
                }`}>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Father</p>
                  {formData.father.name ? (
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-foreground">{formData.father.name}</p>
                      <p className="text-muted-foreground">{formData.father.phone || '—'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not added</p>
                  )}
                </div>

                {/* Mother Preview */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  formData.mother.name 
                    ? 'bg-pink-50/50 dark:bg-pink-950/20 border-l-pink-500'
                    : 'bg-slate-50/50 dark:bg-slate-900/20 border-l-slate-300'
                }`}>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Mother</p>
                  {formData.mother.name ? (
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-foreground">{formData.mother.name}</p>
                      <p className="text-muted-foreground">{formData.mother.phone || '—'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not added</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Master Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border/30 p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground block">Full Name *</label>
              <input
                type="text"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {/* Parent Fields */}
            {(selectedType === 'father' || selectedType === 'mother') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Occupation</label>
                    <input
                      type="text"
                      value={formValues.occupation}
                      onChange={(e) => setFormValues({ ...formValues, occupation: e.target.value })}
                      placeholder="e.g., Engineer, Doctor"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Phone</label>
                    <input
                      type="text"
                      value={formValues.phone}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Qualification</label>
                    <input
                      type="text"
                      value={formValues.qualification}
                      onChange={(e) => setFormValues({ ...formValues, qualification: e.target.value })}
                      placeholder="e.g., B.Tech, MBA"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Annual Income</label>
                    <input
                      type="text"
                      value={formValues.annualIncome}
                      onChange={(e) => setFormValues({ ...formValues, annualIncome: e.target.value })}
                      placeholder="e.g., 5,00,000"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground block">Email Address</label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </>
            )}

            {/* Guardian Fields */}
            {selectedType === 'guardian' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Relation</label>
                    <input
                      type="text"
                      value={formValues.relation}
                      onChange={(e) => setFormValues({ ...formValues, relation: e.target.value })}
                      placeholder="e.g., Uncle, Aunt"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">Phone</label>
                    <input
                      type="text"
                      value={formValues.phone}
                      onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground block">Address</label>
                  <textarea
                    value={formValues.address}
                    onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                    placeholder="Full address"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveForm}
              disabled={isSaving || !formValues.name}
              className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      ) : (
        // Show this only when form is NOT visible AND there's NO data
        !hasFamilyData ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/30 rounded-2xl border border-border/50 p-12 flex flex-col items-center justify-center min-h-96 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-foreground">Add Family Member Details</h2>
              <p className="text-muted-foreground max-w-md">Keep your family contact information up to date</p>
            </div>
            <button
              onClick={() => {
                setSelectedType('father');
                resetFormValues();
                setShowForm(true);
              }}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition-all text-base"
            >
              + Add Parent Info
            </button>
          </div>
        ) : null
      )}

      {/* DISPLAY SECTION - Parents */}
      {(formData.father.name || formData.mother.name) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Parents Information</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Father Card - Only show if has data */}
            {formData.father.name && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-foreground">Father</h4>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => populateFormValues('father')}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-all"
                      title="Edit father"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          console.log('Deleting father information and saving to database');
                          
                          const response = await updateMyProfile({ 
                            parentInfo: { 
                              ...formData, 
                              father: { name: '', occupation: '', phone: '', email: '', qualification: '', annualIncome: '' },
                              guardians, 
                              siblings 
                            } 
                          });
                          console.log('Database delete response:', response);
                          
                          toast({
                            title: 'Deleted',
                            description: 'Father information removed from database.',
                          });
                          
                          // Refresh data from database
                          await fetchParentInfo();
                        } catch (error) {
                          console.error('Database delete error:', error);
                          toast({
                            title: 'Error',
                            description: error instanceof Error ? error.message : 'Failed to delete.',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all"
                      title="Delete father"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {formData.father.name}</p>
                  <p><span className="font-semibold">Email:</span> {formData.father.email || 'N/A'}</p>
                  <p><span className="font-semibold">Phone:</span> {formData.father.phone || 'N/A'}</p>
                  <p><span className="font-semibold">Occupation:</span> {formData.father.occupation || 'N/A'}</p>
                  <p><span className="font-semibold">Qualification:</span> {formData.father.qualification || 'N/A'}</p>
                  <p><span className="font-semibold">Annual Income:</span> {formData.father.annualIncome || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Mother Card - Only show if has data */}
            {formData.mother.name && (
              <div className="bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border-2 border-pink-200 dark:border-pink-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <h4 className="font-bold text-foreground">Mother</h4>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => populateFormValues('mother')}
                      className="p-2 rounded-lg text-pink-600 hover:bg-pink-100/50 dark:hover:bg-pink-900/30 transition-all"
                      title="Edit mother"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          console.log('Deleting mother information and saving to database');
                          
                          const response = await updateMyProfile({ 
                            parentInfo: { 
                              ...formData, 
                              mother: { name: '', occupation: '', phone: '', email: '', qualification: '', annualIncome: '' },
                              guardians, 
                              siblings 
                            } 
                          });
                          console.log('Database delete response:', response);
                          
                          toast({
                            title: 'Deleted',
                            description: 'Mother information removed from database.',
                          });
                          
                          // Refresh data from database
                          await fetchParentInfo();
                        } catch (error) {
                          console.error('Database delete error:', error);
                          toast({
                            title: 'Error',
                            description: error instanceof Error ? error.message : 'Failed to delete.',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all"
                      title="Delete mother"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {formData.mother.name}</p>
                  <p><span className="font-semibold">Email:</span> {formData.mother.email || 'N/A'}</p>
                  <p><span className="font-semibold">Phone:</span> {formData.mother.phone || 'N/A'}</p>
                  <p><span className="font-semibold">Occupation:</span> {formData.mother.occupation || 'N/A'}</p>
                  <p><span className="font-semibold">Qualification:</span> {formData.mother.qualification || 'N/A'}</p>
                  <p><span className="font-semibold">Annual Income:</span> {formData.mother.annualIncome || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISPLAY SECTION - Guardians */}
      {guardians.filter(g => g.name && g.name.trim()).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Guardians Information</h3>
            <button
              onClick={() => {
                setSelectedType('guardian');
                setEditingGuardianIndex(null);
                populateFormValues('guardian');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 transition-all font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Guardian
            </button>
          </div>

          <div className="grid gap-4">
            {guardians.filter(g => g.name && g.name.trim()).map((guardian, idx) => (
              <div key={idx} className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">{guardian.name}</h4>
                    <div className="space-y-1 text-sm">
                      {guardian.relation && <p className="text-muted-foreground"><span className="font-semibold">Relation:</span> {guardian.relation}</p>}
                      {guardian.phone && <p className="text-muted-foreground"><span className="font-semibold">Phone:</span> {guardian.phone}</p>}
                      {guardian.address && <p className="text-muted-foreground"><span className="font-semibold">Address:</span> {guardian.address}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedType('guardian');
                        populateFormValues('guardian', idx);
                      }}
                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-all"
                      title="Edit guardian"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const newGuardians = guardians.filter((_, i) => i !== idx);
                          console.log('Deleting guardian and saving to database:', newGuardians);
                          
                          const response = await updateMyProfile({ 
                            parentInfo: { 
                              ...formData, 
                              guardians: newGuardians, 
                              siblings 
                            } 
                          });
                          console.log('Database delete response:', response);
                          
                          toast({
                            title: 'Deleted',
                            description: 'Guardian information removed from database.',
                          });
                          
                          // Refresh data from database
                          await fetchParentInfo();
                        } catch (error) {
                          console.error('Database delete error:', error);
                          toast({
                            title: 'Error',
                            description: error instanceof Error ? error.message : 'Failed to delete.',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all"
                      title="Delete guardian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Guardian button when no guardians exist with data */}
      {guardians.filter(g => g.name && g.name.trim()).length === 0 && (formData.father.name || formData.mother.name) && (
        <div className="flex items-center justify-between mt-8">
          <h3 className="text-xl font-bold text-foreground">Guardians Information</h3>
          <button
            onClick={() => {
              setSelectedType('guardian');
              setEditingGuardianIndex(null);
              populateFormValues('guardian');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/10 text-amber-600 hover:bg-amber-600/20 transition-all font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Guardian
          </button>
        </div>
      )}

      {/* SIBLINGS SECTION */}
      {siblings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Siblings Information</h3>
            <button
              onClick={() => {
                setSiblingCount(siblings.length);
                setShowSiblingDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-all font-semibold"
            >
              <Plus className="w-4 h-4" /> Manage Siblings
            </button>
          </div>

          <div className="grid gap-3">
            {siblings.map((sibling, index) => (
              <div key={index} className="bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{sibling.name}</h4>
                    <p className="text-xs text-muted-foreground">Age: {sibling.age} • {sibling.education} • {sibling.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Manage Siblings button when parent data exists */}
      {(formData.father.name || formData.mother.name) && siblings.length === 0 && (
        <div className="flex items-center justify-between mt-8">
          <h3 className="text-xl font-bold text-foreground">Siblings Information</h3>
          <button
            onClick={() => {
              setSiblingCount(0);
              setShowSiblingDialog(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/10 text-green-600 hover:bg-green-600/20 transition-all font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Siblings
          </button>
        </div>
      )}

      {/* Sibling Dialog */}
      <Dialog open={showSiblingDialog} onOpenChange={setShowSiblingDialog}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold text-foreground">👨‍👩‍👧‍👦 Manage Siblings</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-80 overflow-y-auto">
            <div>
              <label className="text-sm font-bold text-foreground ml-1 block mb-2">Number of Siblings</label>
              <input 
                type="number" 
                min="0" 
                value={siblingCount} 
                onChange={(e) => {
                  const count = Math.max(0, parseInt(e.target.value) || 0);
                  setSiblingCount(count);
                  const newSiblings = siblings.slice(0, count);
                  for (let i = newSiblings.length; i < count; i++) {
                    newSiblings.push({ name: '', phone: '', age: 0, education: '' });
                  }
                  setSiblings(newSiblings);
                }}
                placeholder="Enter number of siblings"
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
              />
            </div>

            {siblings.length > 0 && (
              <div className="space-y-3">
                {siblings.map((sibling, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-green-50/30 dark:bg-green-950/20 space-y-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-green-600 uppercase">Sibling {idx + 1}</span>
                      <button
                        onClick={() => {
                          const newSiblings = siblings.filter((_, i) => i !== idx);
                          setSiblings(newSiblings);
                          setSiblingCount(newSiblings.length);
                        }}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input 
                      type="text"
                      value={sibling.name || ''} 
                      onChange={(e) => {
                        const newSiblings = [...siblings];
                        newSiblings[idx].name = e.target.value;
                        setSiblings(newSiblings);
                      }}
                      placeholder="Name"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-border text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="number"
                        value={sibling.age || ''} 
                        onChange={(e) => {
                          const newSiblings = [...siblings];
                          newSiblings[idx].age = parseInt(e.target.value) || 0;
                          setSiblings(newSiblings);
                        }}
                        placeholder="Age"
                        min="0"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-border text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                      <input 
                        type="text"
                        value={sibling.education || ''} 
                        onChange={(e) => {
                          const newSiblings = [...siblings];
                          newSiblings[idx].education = e.target.value;
                          setSiblings(newSiblings);
                        }}
                        placeholder="Education"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-border text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                    <input 
                      type="text"
                      value={sibling.phone || ''} 
                      onChange={(e) => {
                        const newSiblings = [...siblings];
                        newSiblings[idx].phone = e.target.value;
                        setSiblings(newSiblings);
                      }}
                      placeholder="Phone number"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-border text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setShowSiblingDialog(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border font-semibold text-foreground hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('Saving siblings to database:', siblings);
                  
                  const response = await updateMyProfile({ 
                    parentInfo: { 
                      ...formData, 
                      guardians, 
                      siblings 
                    } 
                  });
                  console.log('Database siblings save response:', response);
                  
                  toast({
                    title: 'Saved Successfully',
                    description: 'Sibling information has been saved to database.',
                  });
                  
                  setShowSiblingDialog(false);
                  
                  // Refresh data from database
                  await fetchParentInfo();
                } catch (error) {
                  console.error('Database siblings save error:', error);
                  toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to save changes.',
                    variant: 'destructive'
                  });
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              Save Siblings
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
