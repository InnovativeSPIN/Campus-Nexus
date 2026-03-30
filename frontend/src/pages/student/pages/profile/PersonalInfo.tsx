import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User as UserIcon, Mail, Phone, Linkedin, MapPin, Fingerprint, CalendarClock, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '@/pages/student/services/studentApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/pages/student/components/ui/dialog';
import { Input } from '@/pages/student/components/ui/input';
import { Label } from '@/pages/student/components/ui/label';
import { Button } from '@/pages/student/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/student/components/ui/select';
import { normalizeImageUrl } from '@/utils/imageUrl';
import campusBackground from '@/assets/student profile background.jpg';

// Dropdown options - Must match database ENUM values exactly
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MOTHER_TONGUES = ['Tamil', 'English', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Other'];
const RELIGIONS = ['Hindu', 'Christian', 'Muslim', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST'];
const RESIDENCE_TYPES = ['hosteller', 'day_scholar', 'other'];
const NATIONALITIES = ['Indian', 'Other'];

// Indian States
const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Major Indian Cities - Deduplicated list
const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 
  'Erode', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayurbhanj', 
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 
  'Ranipet', 'Salem', 'Sivaganga', 'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvannamalai', 
  'Tirunelveli', 'Tiruppur', 'Tiruvananthapur', 'Tuticorin', 'Vellore', 'Villupuram', 'Virudhunagar'
];



// Display labels for residence types (for UI)
const RESIDENCE_TYPE_LABELS = {
  hosteller: 'Hosteller',
  day_scholar: 'Day Scholar',
  other: 'Other'
};

const defaultPersonalData = {
  email: '',
  linkedinUrl: '',
  phone: '',
  alternatePhone: '',
  address: '',
  district: '',
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile() as any;
        if (res.success && res.data) {
          const apiData = res.data;
          const bio = apiData.bio || {};
          let addr = bio.address || {};
          
          // Parse address if it's a string
          if (typeof addr === 'string') {
            try {
              addr = JSON.parse(addr);
            } catch (e) {
              console.error('[PersonalInfo] Failed to parse address:', e);
              addr = {};
            }
          }

          const newPersonalData = {
            email: apiData.email || '',
            linkedinUrl: bio.linkedinUrl || '',
            phone: apiData.phone || '',
            alternatePhone: bio.alternatePhone || '',
            address: addr.street || '',
            district: addr.city || '',
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

  // Monitor personal data changes
  useEffect(() => {
    // Address is now properly set from bio
  }, [personalData]);

  const closeEditDialog = () => {
    setEditSection(null);
    setFormErrors({});
    setShowValidationAlert(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (editSection === 'contact') {
      if (!formValues.email) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) errors.email = 'Invalid email format';
      
      if (!formValues.phone) errors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formValues.phone)) errors.phone = 'Phone must be 10 digits';
      
      if (formValues.alternatePhone && !/^\d{10}$/.test(formValues.alternatePhone)) {
        errors.alternatePhone = 'Alternate phone must be 10 digits';
      }
      
      if (formValues.linkedinUrl && !formValues.linkedinUrl.startsWith('http')) {
        errors.linkedinUrl = 'LinkedIn URL must start with http/https';
      }
    } else if (editSection === 'academic') {
      if (!formValues.dob) errors.dob = 'Date of Birth is required';
      else {
        const age = new Date().getFullYear() - new Date(formValues.dob).getFullYear();
        if (age < 15 || age > 40) errors.dob = 'Invalid age. Student age should be between 15 and 40';
      }
      
      if (!formValues.bloodGroup) errors.bloodGroup = 'Blood Group is required';
      if (!formValues.motherTongue) errors.motherTongue = 'Mother Tongue is required';
      if (!formValues.nationality) errors.nationality = 'Nationality is required';
      if (!formValues.religion) errors.religion = 'Religion is required';
      if (!formValues.category) errors.category = 'Category is required';
      if (!formValues.residenceType) errors.residenceType = 'Residence Type is required';
    } else if (editSection === 'address') {
      if (!formValues.address) errors.address = 'Street Address is required';
      if (!formValues.district) errors.district = 'District is required';
      if (!formValues.state) errors.state = 'State is required';
      if (!formValues.pincode) errors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(formValues.pincode)) errors.pincode = 'Pincode must be 6 digits';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShowValidationAlert(true);
      return false;
    }
    return true;
  };

  const handleEditClick = (section: 'contact' | 'academic' | 'address') => {
    setFormValues(personalData);
    setEditSection(section);
    setFormErrors({});
    setShowValidationAlert(false);
  };

  const handleSave = async () => {
    if (!editSection) return;

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

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
        payload.district = formValues.district;
        payload.state = formValues.state;
        payload.pincode = formValues.pincode;
      }

      const res = (await updateMyProfile(payload)) as any;

      if (res.success) {
        const updatedData = {
          ...personalData,
          dob: editSection === 'academic' ? formValues.dob : personalData.dob,
        };

        if (editSection === 'contact') {
          updatedData.email = formValues.email;
          updatedData.phone = formValues.phone;
          updatedData.linkedinUrl = formValues.linkedinUrl;
          updatedData.alternatePhone = formValues.alternatePhone;
        } else if (editSection === 'academic') {
          updatedData.bloodGroup = formValues.bloodGroup;
          updatedData.motherTongue = formValues.motherTongue;
          updatedData.nationality = formValues.nationality;
          updatedData.religion = formValues.religion;
          updatedData.category = formValues.category;
          updatedData.residenceType = formValues.residenceType;
          updatedData.dob = formValues.dob;
        } else if (editSection === 'address') {
          updatedData.address = formValues.address;
          updatedData.district = formValues.district;
          updatedData.state = formValues.state;
          updatedData.pincode = formValues.pincode;
        }

        setPersonalData(updatedData);
        toast({ title: 'Success', description: 'Profile updated successfully' });        
        // Refetch profile data after address update to ensure persistence
        if (editSection === 'address') {
          setTimeout(() => {
            const fetchUpdatedProfile = async () => {
              try {
                const profileRes = await getMyProfile() as any;
                if (profileRes.success && profileRes.data) {
                  const apiData = profileRes.data;
                  const bio = apiData.bio || {};
                  const addr = bio.address || {};
                  const newPersonalData = {
                    ...personalData,
                    address: addr.street || '',
                    district: addr.city || '',
                    state: addr.state || '',
                    pincode: addr.pincode || '',
                  };
                  setPersonalData(newPersonalData);
                }
              } catch (error) {
                console.error('Failed to refetch profile:', error);
              }
            };
            fetchUpdatedProfile();
          }, 500);
        }
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
    <div className="animate-fade-in w-full mx-auto space-y-6 pb-12">
      <PageHeader
        title="Personal Information"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Personal Info' },
        ]}
      />

      {/* Profile Header with Campus Background */}
      <div 
        className="bg-cover bg-center rounded-2xl shadow-xl overflow-visible relative h-48 sm:h-64 lg:h-72"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(80, 0, 0, 0.8) 0%, rgba(45, 85, 79, 0.8) 100%), url(${campusBackground})`,
        }}
      >
        {/* The White Profile Card - Positioned to overlap the background */}
        <div className="absolute left-0 right-0 -bottom-24 sm:-bottom-20 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-white/20">
            <div className="flex flex-col items-center sm:items-start relative">
              {/* Profile Image - Now ABOVE Name */}
              <div className="absolute -top-16 sm:-top-20 lg:-top-24 flex-shrink-0 z-30">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl shadow-2xl p-1.5 sm:p-2 bg-white border-4 border-white overflow-hidden">
                  {user?.avatar && normalizeImageUrl(user.avatar) ? (
                    <img 
                      src={normalizeImageUrl(user.avatar) || ''}
                      alt={user?.name || 'Student'} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Student Info Container */}
              <div className="w-full pt-12 sm:pt-16 lg:pt-20 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                      {user?.name || 'N/A'}
                    </h2>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">Roll:</span>
                        <span className="text-gray-900 font-bold">{personalData.admissionNo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">EMIS:</span>
                        <span className="text-gray-900 font-bold">{personalData.emisNo || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                    <span className="px-3 py-1 bg-red-100/50 text-red-700 text-[10px] sm:text-xs font-bold rounded-full border border-red-200 uppercase tracking-wider">
                      {personalData.batch || 'N/A'} Batch
                    </span>
                    <span className="px-3 py-1 bg-teal-100/50 text-teal-700 text-[10px] sm:text-xs font-bold rounded-full border border-teal-200 uppercase tracking-wider">
                      {personalData.residenceType || 'Day Scholar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to account for the overlapping card */}
      <div className="h-28 sm:h-24" />

      <ProfileNavBar />

      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-end gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={() => handleEditClick('contact')} className="w-full sm:w-auto">
          <Edit className="w-4 h-4" /> Edit Contact
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEditClick('academic')} className="w-full sm:w-auto">
          <Edit className="w-4 h-4" /> Edit Academic
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEditClick('address')} className="w-full sm:w-auto">
          <Edit className="w-4 h-4" /> Edit Address
        </Button>
      </div>

      <div className="grid gap-8">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          <div className="section-card p-4 sm:p-6 bg-primary/5 border-primary/10 hover:shadow-md transition-all group rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                <Mail className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-0.5 sm:mb-1">Email Address</p>
                <p className="font-bold text-foreground truncate text-xs sm:text-sm lg:text-base">{personalData.email || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="section-card p-4 sm:p-6 bg-secondary/5 border-secondary/10 hover:shadow-md transition-all group rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform flex-shrink-0">
                <Phone className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-secondary uppercase font-bold tracking-widest mb-0.5 sm:mb-1">Phone Number</p>
                <p className="font-bold text-foreground text-xs sm:text-sm lg:text-base">{personalData.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="section-card p-4 sm:p-6 bg-accent/5 border-accent/10 hover:shadow-md transition-all group rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform flex-shrink-0">
                <Linkedin className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-0.5 sm:mb-1">LinkedIn Profile</p>
                <p className="font-bold text-primary truncate text-xs sm:text-sm lg:text-base">
                  {personalData.linkedinUrl ? <a href={personalData.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline">Visit Profile</a> : 'Not Linked'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Identity & Academic Section */}
          <SectionCard
            title="Academic & Identity"
            subtitle="Official institutional records"
            icon={Fingerprint}
            className="shadow-lg h-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4 sm:gap-x-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-4 sm:gap-x-6">
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
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Street Address</label>
                <p className="text-sm sm:text-base font-semibold leading-relaxed bg-muted/20 p-3 sm:p-4 rounded-xl border border-border/50">
                  {personalData.address || 'Address not provided'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">District</label>
                <p className="text-sm sm:text-base font-semibold">{personalData.district || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">State / Region</label>
                <p className="text-sm sm:text-base font-semibold">{personalData.state || 'N/A'}</p>
              </div>
              <div className="lg:col-start-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Pin Code</label>
                <p className="text-base sm:text-lg font-bold text-primary">{personalData.pincode || 'N/A'}</p>
              </div>
              <div className="lg:col-start-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Alternate Phone</label>
                <p className="text-sm sm:text-base font-semibold">{personalData.alternatePhone || 'N/A'}</p>
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
                  <Label className={formErrors.email ? 'text-destructive' : ''}>
                    Email {formErrors.email && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    type="email" 
                    value={formValues.email || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, email: e.target.value }))}
                    className={formErrors.email ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.email && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.email}</p>}
                </div>
                <div>
                  <Label className={formErrors.phone ? 'text-destructive' : ''}>
                    Phone {formErrors.phone && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    value={formValues.phone || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, phone: e.target.value }))}
                    placeholder="10 digit phone number"
                    className={formErrors.phone ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.phone && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.phone}</p>}
                </div>
                <div>
                  <Label className={formErrors.alternatePhone ? 'text-destructive' : ''}>
                    Alternate Phone {formErrors.alternatePhone && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    value={formValues.alternatePhone || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, alternatePhone: e.target.value }))}
                    placeholder="Optional - 10 digit phone number"
                    className={formErrors.alternatePhone ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.alternatePhone && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.alternatePhone}</p>}
                </div>
                <div>
                  <Label className={formErrors.linkedinUrl ? 'text-destructive' : ''}>
                    LinkedIn URL {formErrors.linkedinUrl && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    value={formValues.linkedinUrl || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className={formErrors.linkedinUrl ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.linkedinUrl && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.linkedinUrl}</p>}
                </div>
              </>
            )}

            {editSection === 'academic' && (
              <>
                <div>
                  <Label className={formErrors.dob ? 'text-destructive' : ''}>
                    Date of Birth {formErrors.dob && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    type="date" 
                    value={formValues.dob || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, dob: e.target.value }))}
                    className={formErrors.dob ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.dob && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.dob}</p>}
                </div>

                <div>
                  <Label className={formErrors.bloodGroup ? 'text-destructive' : ''}>
                    Blood Group {formErrors.bloodGroup && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.bloodGroup || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, bloodGroup: value }))}>
                    <SelectTrigger className={formErrors.bloodGroup ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.bloodGroup && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.bloodGroup}</p>}
                </div>

                <div>
                  <Label className={formErrors.motherTongue ? 'text-destructive' : ''}>
                    Mother Tongue {formErrors.motherTongue && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.motherTongue || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, motherTongue: value }))}>
                    <SelectTrigger className={formErrors.motherTongue ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Mother Tongue" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTHER_TONGUES.map(mt => (
                        <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.motherTongue && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.motherTongue}</p>}
                </div>

                <div>
                  <Label className={formErrors.nationality ? 'text-destructive' : ''}>
                    Nationality {formErrors.nationality && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.nationality || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, nationality: value }))}>
                    <SelectTrigger className={formErrors.nationality ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map(nat => (
                        <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.nationality && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.nationality}</p>}
                </div>

                <div>
                  <Label className={formErrors.religion ? 'text-destructive' : ''}>
                    Religion {formErrors.religion && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.religion || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, religion: value }))}>
                    <SelectTrigger className={formErrors.religion ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.religion && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.religion}</p>}
                </div>

                <div>
                  <Label className={formErrors.category ? 'text-destructive' : ''}>
                    Category {formErrors.category && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.category || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, category: value }))}>
                    <SelectTrigger className={formErrors.category ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.category}</p>}
                </div>

                <div>
                  <Label className={formErrors.residenceType ? 'text-destructive' : ''}>
                    Residence Type {formErrors.residenceType && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.residenceType || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, residenceType: value }))}>
                    <SelectTrigger className={formErrors.residenceType ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select Residence Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESIDENCE_TYPES.map(rt => (
                        <SelectItem key={rt} value={rt}>{RESIDENCE_TYPE_LABELS[rt as keyof typeof RESIDENCE_TYPE_LABELS]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.residenceType && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.residenceType}</p>}
                </div>
              </>
            )}

            {editSection === 'address' && (
              <>
                <div>
                  <Label className={formErrors.address ? 'text-destructive' : ''}>
                    Street Address {formErrors.address && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    value={formValues.address || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, address: e.target.value }))}
                    className={formErrors.address ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.address && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.address}</p>}
                </div>
                <div>
                  <Label className={formErrors.district ? 'text-destructive' : ''}>
                    District {formErrors.district && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.district || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, district: value }))}>
                    <SelectTrigger className={formErrors.district ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {TAMIL_NADU_DISTRICTS.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.district && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.district}</p>}
                </div>
                <div>
                  <Label className={formErrors.state ? 'text-destructive' : ''}>
                    State {formErrors.state && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={formValues.state || ''} onValueChange={(value) => setFormValues((prev: any) => ({ ...prev, state: value }))}>
                    <SelectTrigger className={formErrors.state ? 'border-destructive focus:border-destructive' : ''}>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.state && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.state}</p>}
                </div>
                <div>
                  <Label className={formErrors.pincode ? 'text-destructive' : ''}>
                    Pincode {formErrors.pincode && <span className="text-destructive">*</span>}
                  </Label>
                  <Input 
                    value={formValues.pincode || ''} 
                    onChange={(e) => setFormValues((prev: any) => ({ ...prev, pincode: e.target.value }))}
                    placeholder="6 digit pincode"
                    className={formErrors.pincode ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.pincode && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.pincode}</p>}
                </div>
              </>
            )}


          </div>

          {showValidationAlert && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">Please fix the following errors:</p>
                <ul className="text-sm text-destructive/90 space-y-0.5">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={saving}>
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <>
                <Save className="w-4 h-4" /> Save Changes
              </>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
