import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User as UserIcon, Mail, Phone, Linkedin, MapPin, Fingerprint, CalendarClock, CreditCard } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile } from '@/pages/student/services/studentApi';

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
  batch: '',
  admissionDate: '',
  admissionType: '',
  residenceType: '',
};

export default function PersonalInfo() {
  const { toast } = useToast();
  const { user, updateUserData } = useAuth();

  const [personalData, setPersonalData] = useState<any>(defaultPersonalData);
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
            batch: apiData.batch || '',
            admissionDate: bio.admissionDate || '',
            admissionType: bio.admissionType || 'Regular',
            residenceType: bio.residenceType || 'Hosteler',
          };

          setPersonalData(newPersonalData);

          if (user) {
            updateUserData({
              name: `${apiData.firstName} ${apiData.lastName || ''}`.trim(),
              department: apiData.department?.name || apiData.departmentId,
              rollNo: apiData.rollNumber,
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
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <span className="text-primary/80">{user?.rollNo || 'N/A'}</span>
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
                <p className="text-lg font-bold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">{personalData.admissionNo}</p>
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
                <p className="text-base font-semibold">{personalData.batch}</p>
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
    </div>
  );
}
