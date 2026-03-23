import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User as UserIcon, Mail, Phone, Linkedin, MapPin, Fingerprint, CalendarClock, CreditCard, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '@/pages/student/services/studentApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/pages/student/components/ui/dialog';
import { Input } from '@/pages/student/components/ui/input';
import { Label } from '@/pages/student/components/ui/label';
import { Button } from '@/pages/student/components/ui/button';

const defaultPersonalData = {
  email: '',
  linkedinUrl: '',
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  nationality: '',
  religion: '',
  category: '',
  aadharNo: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  motherTongue: '',
  admissionNo: '',
  emisNo: '',
  batch: '',
  admissionDate: '',
  admissionType: '',
  residenceType: '',
};

export default function PersonalInfo() {
  const { toast } = useToast();
  const { user, updateUserData } = useAuth();

  const [personalData, setPersonalData] = useState<any>(defaultPersonalData);
  const [formValues, setFormValues] = useState<any>(defaultPersonalData);
  const [editSection, setEditSection] = useState<'contact' | 'academic' | 'address' | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile() as any;
        if (res.success && res.data) {
          const apiData = res.data;
          const bio = apiData.bio || {};
          const addr = bio.address || {};

          const newPersonalData = {
            email: apiData.email || '',
            linkedinUrl: bio.linkedinUrl || '',
            phone: apiData.phone || '',
            alternatePhone: bio.alternatePhone || '',
            address: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            nationality: bio.nationality || 'Indian',
            religion: bio.religion || '',
            category: bio.category || '',
            aadharNo: bio.aadharNo || '',
            dob: bio.dateOfBirth || '',
            gender: apiData.gender || '',
            bloodGroup: bio.bloodGroup || '',
            motherTongue: bio.motherTongue || '',
            admissionNo: apiData.admissionNo || '',
            emisNo: apiData.emisNo || '',
            batch: apiData.batch || '',
            admissionDate: bio.admissionDate || '',
            admissionType: bio.admissionType || 'Regular',
            residenceType: bio.residenceType || 'Hosteler',
          };

          setPersonalData(newPersonalData);
          setFormValues(newPersonalData);

          if (user) {
            updateUserData({
              name: `${apiData.firstName} ${apiData.lastName || ''}`.trim(),
              department: apiData.department?.name || apiData.departmentId,
              studentId: apiData.studentId || '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        toast({ title: 'Error', description: 'Failed to fetch personal data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const closeEditDialog = () => setEditSection(null);

  const handleEditClick = (section: 'contact' | 'academic' | 'address') => {
    setFormValues(personalData);
    setEditSection(section);
  };

  const handleSave = async () => {
    if (!editSection) return;

    setSaving(true);
    try {
      const payload: any = {};

      if (editSection === 'contact') {
        payload.email = formValues.email;
        payload.phone = formValues.phone;
        payload.linkedinUrl = formValues.linkedinUrl;
        payload.alternatePhone = formValues.alternatePhone;
      } else if (editSection === 'academic') {
        payload.bloodGroup = formValues.bloodGroup;
        payload.motherTongue = formValues.motherTongue;
        payload.nationality = formValues.nationality;
        payload.religion = formValues.religion;
        payload.category = formValues.category;
        payload.residenceType = formValues.residenceType;
        payload.dateOfBirth = formValues.dob;
      } else if (editSection === 'address') {
        payload.address = formValues.address;
        payload.city = formValues.city;
        payload.state = formValues.state;
        payload.pincode = formValues.pincode;
      }

      const res = (await updateMyProfile(payload)) as any;

      if (res.success) {
        const updatedData = {
          ...personalData,
          ...payload,
          dob: editSection === 'academic' ? formValues.dob : personalData.dob,
        };

        if (editSection === 'address') {
          updatedData.address = formValues.address;
          updatedData.city = formValues.city;
          updatedData.state = formValues.state;
          updatedData.pincode = formValues.pincode;
        }

        setPersonalData(updatedData);
        toast({ title: 'Success', description: 'Profile updated successfully' });
        closeEditDialog();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to save changes', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
      toast({ title: 'Error', description: error.message || 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Personal Information"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Personal Info' },
        ]}
      />

      {/* Profile Header Card */}
      <div className="section-card overflow-hidden border-0 shadow-xl bg-card">
        <div className="h-32 bg-gradient-to-r from-primary via-primary/90 to-secondary" />
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="w-40 h-40 rounded-3xl bg-card p-1.5 shadow-2xl shrink-0 group">
              <div className="w-full h-full rounded-2xl bg-primary/5 flex items-center justify-center border-4 border-card overflow-hidden transition-transform group-hover:scale-[1.02]">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-20 h-20 text-primary" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">{user?.name || 'N/A'}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Roll No: <span className="font-semibold text-foreground">{personalData.admissionNo || 'N/A'}</span></span>
                    <span className="text-sm text-muted-foreground">EMIS: <span className="font-semibold text-foreground">{personalData.emisNo || 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium hidden">
                    <span className="text-primary/80">{user?.studentId || 'N/A'}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="truncate">{typeof user?.department === 'object' ? (user?.department?.name || user?.department?.short_name) : (user?.department || 'N/A')}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider border border-primary/20 shadow-sm">
                    {personalData.batch || 'N/A'} Batch
                  </span>
                  <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase tracking-wider border border-secondary/20 shadow-sm">
                    {personalData.residenceType || 'Regular'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileNavBar />

      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={() => handleEditClick('contact')}>
          <Edit className="w-4 h-4" /> Edit Contact
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEditClick('academic')}>
          <Edit className="w-4 h-4" /> Edit Academic
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEditClick('address')}>
          <Edit className="w-4 h-4" /> Edit Address
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Contact Quick Info */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="section-card p-6 bg-primary/5 border-primary/10 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-foreground truncate">{personalData.email || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="section-card p-6 bg-secondary/5 border-secondary/10 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-1">Phone Number</p>
                <p className="font-bold text-foreground">{personalData.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="section-card p-6 bg-accent/5 border-accent/10 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                <Linkedin className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">LinkedIn Profile</p>
                <p className="font-bold text-primary truncate">
                  {personalData.linkedinUrl ? <a href={personalData.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">Visit Profile</a> : 'Not Linked'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Identity & Academic Section */}
          <SectionCard
            title="Academic & Identity"
            subtitle="Official institutional records"
            icon={Fingerprint}
            className="shadow-lg h-full"
          >
            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Admission Number</label>
                <p className="text-lg font-bold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">{personalData.admissionNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">EMIS Number</label>
                <p className="text-lg font-bold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50 text-primary">{personalData.emisNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Aadhar Number</label>
                <p className="text-lg font-bold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">{personalData.aadharNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Admission Date</label>
                <p className="text-base font-semibold">{personalData.admissionDate || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Admission Type</label>
                <p className="text-base font-semibold">{personalData.admissionType || 'Regular'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Batch</label>
                <p className="text-base font-semibold">{personalData.batch || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Residence</label>
                <p className="text-base font-semibold">{personalData.residenceType || 'Hostel'}</p>
              </div>
            </div>
          </SectionCard>

          {/* Personal Details Section */}
          <SectionCard
            title="Personal Details"
            subtitle="General and demographic information"
            icon={CalendarClock}
            className="shadow-lg h-full"
          >
            <div className="grid grid-cols-2 gap-y-8 gap-x-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Date of Birth</label>
                <p className="text-base font-semibold">{personalData.dob || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Blood Group</label>
                <p className="text-base font-semibold text-destructive">{personalData.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Gender</label>
                <p className="text-base font-semibold">{personalData.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Mother Tongue</label>
                <p className="text-base font-semibold">{personalData.motherTongue || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Nationality</label>
                <p className="text-base font-semibold">{personalData.nationality || 'Indian'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Religion</label>
                <p className="text-base font-semibold">{personalData.religion || 'N/A'}</p>
              </div>
            </div>
          </SectionCard>

          {/* Contact Details (Address) */}
          <SectionCard
            title="Address Information"
            subtitle="Permanent residential details"
            icon={MapPin}
            className="lg:col-span-2 shadow-lg"
          >
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Street Address</label>
                <p className="text-base font-semibold leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/50">
                  {personalData.address || 'Address not provided'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">City / Town</label>
                <p className="text-base font-semibold">{personalData.city || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">State / Region</label>
                <p className="text-base font-semibold">{personalData.state || 'N/A'}</p>
              </div>
              <div className="lg:col-start-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Pin Code</label>
                <p className="text-lg font-bold text-primary">{personalData.pincode || 'N/A'}</p>
              </div>
              <div className="lg:col-start-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Alternate Phone</label>
                <p className="text-base font-semibold">{personalData.alternatePhone || 'N/A'}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <Dialog open={!!editSection} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editSection === 'contact' && 'Edit Contact Information'}
              {editSection === 'academic' && 'Edit Academic / Personal Details'}
              {editSection === 'address' && 'Edit Address Details'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Name (uneditable)</Label>
                <Input value={user?.name || ''} disabled />
              </div>
              <div>
                <Label>Roll Number (uneditable)</Label>
                <Input value={personalData.admissionNo || ''} disabled />
              </div>
            </div>

            {editSection === 'contact' && (
              <>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formValues.email || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formValues.phone || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Alternate Phone</Label>
                  <Input value={formValues.alternatePhone || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, alternatePhone: e.target.value }))} />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input value={formValues.linkedinUrl || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, linkedinUrl: e.target.value }))} />
                </div>
              </>
            )}

            {editSection === 'academic' && (
              <>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={formValues.dob || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, dob: e.target.value }))} />
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Input value={formValues.bloodGroup || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, bloodGroup: e.target.value }))} />
                </div>
                <div>
                  <Label>Mother Tongue</Label>
                  <Input value={formValues.motherTongue || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, motherTongue: e.target.value }))} />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input value={formValues.nationality || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, nationality: e.target.value }))} />
                </div>
                <div>
                  <Label>Religion</Label>
                  <Input value={formValues.religion || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, religion: e.target.value }))} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={formValues.category || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, category: e.target.value }))} />
                </div>
                <div>
                  <Label>Residence Type</Label>
                  <Input value={formValues.residenceType || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, residenceType: e.target.value }))} />
                </div>
              </>
            )}

            {editSection === 'address' && (
              <>
                <div>
                  <Label>Street Address</Label>
                  <Input value={formValues.address || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, address: e.target.value }))} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={formValues.city || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, city: e.target.value }))} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formValues.state || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, state: e.target.value }))} />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input value={formValues.pincode || ''} onChange={(e) => setFormValues((prev: any) => ({ ...prev, pincode: e.target.value }))} />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={saving}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
