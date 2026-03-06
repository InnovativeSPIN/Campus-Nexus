import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User as UserIcon } from 'lucide-react';
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

  // Fetch data dynamically
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
            email: apiData.email || defaultPersonalData.email,
            linkedinUrl: bio.linkedinUrl || defaultPersonalData.linkedinUrl,
            phone: apiData.phone || defaultPersonalData.phone,
            alternatePhone: bio.alternatePhone || defaultPersonalData.alternatePhone,
            address: addr.street || defaultPersonalData.address,
            city: addr.city || defaultPersonalData.city,
            state: addr.state || defaultPersonalData.state,
            pincode: addr.pincode || defaultPersonalData.pincode,
            nationality: bio.nationality || defaultPersonalData.nationality,
            religion: bio.religion || defaultPersonalData.religion,
            category: bio.category || defaultPersonalData.category,
            aadharNo: bio.aadharNo || defaultPersonalData.aadharNo,
            dob: bio.dateOfBirth || defaultPersonalData.dob,
            gender: apiData.gender || defaultPersonalData.gender,
            bloodGroup: bio.bloodGroup || defaultPersonalData.bloodGroup,
            motherTongue: bio.motherTongue || defaultPersonalData.motherTongue,
            admissionNo: apiData.admissionNo || defaultPersonalData.admissionNo,
            batch: apiData.batch || defaultPersonalData.batch,
            admissionDate: bio.admissionDate || defaultPersonalData.admissionDate,
            admissionType: bio.admissionType || defaultPersonalData.admissionType,
            residenceType: bio.residenceType || defaultPersonalData.residenceType,
          };

          setPersonalData(newPersonalData);

          // Basic info update for context
          if (user) {
            updateUserData({
              name: `${apiData.firstName} ${apiData.lastName || ''}`.trim(),
              department: apiData.department?.short_name || apiData.departmentId,
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
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="animate-fade-in w-full">
      <PageHeader
        title="Personal Information"
        subtitle="Your official student profile"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Personal Info' },
        ]}
      />

      <ProfileNavBar />

      <div className="grid gap-6">
        <SectionCard
          title="Student Profile"
          subtitle="Identity and contact information"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <UserIcon className="w-12 h-12 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground font-medium">{user?.rollNo}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                  {personalData.batch} Batch
                </span>
                <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-lg uppercase tracking-wider">
                  {personalData.residenceType}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Email Address</p>
              <p className="font-semibold text-foreground">{personalData.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Phone Number</p>
              <p className="font-semibold text-foreground">{personalData.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">LinkedIn Profile</p>
              <p className="font-semibold text-primary truncate max-w-[200px]">{personalData.linkedinUrl || 'Not linked'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Aadhar Number</p>
              <p className="font-semibold text-foreground">{personalData.aadharNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Date of Birth</p>
              <p className="font-semibold text-foreground">{personalData.dob || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Blood Group</p>
              <p className="font-semibold text-foreground">{personalData.bloodGroup || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">Residential Address</p>
            <p className="font-semibold leading-relaxed">
              {personalData.address}
              {personalData.city && `, ${personalData.city}`}
              {personalData.state && `, ${personalData.state}`}
              {personalData.pincode && ` - ${personalData.pincode}`}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Academic Identity">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Admission No</p>
              <p className="text-lg font-bold text-primary">{personalData.admissionNo}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Admission Date</p>
              <p className="text-lg font-bold">{personalData.admissionDate || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Admission Type</p>
              <p className="text-lg font-bold">{personalData.admissionType || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Mother Tongue</p>
              <p className="text-lg font-bold">{personalData.motherTongue || 'N/A'}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
