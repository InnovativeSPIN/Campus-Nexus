import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { Save, X, Edit, Clock, Upload, User as UserIcon, Camera } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { Button } from '@/pages/student/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRef } from 'react';

/* -------------------- STATIC DATA (Mock API) -------------------- */

const personalData = {
  email: 'rahul.sharma@student.university.edu',
  linkedinUrl: 'https://linkedin.com/in/rahul-sharma',
  phone: '+91 9876543210',
  alternatePhone: '+91 8765432109',
  address: '123 Main Street, Sector 15',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  nationality: 'Indian',
  religion: 'Hindu',
  category: 'General',
  aadharNo: 'XXXX XXXX 1234',
  dob: '2003-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  motherTongue: 'Hindi',
  admissionNo: 'ADM2021-001',
  batch: '2021-2025',
  admissionDate: '2021-08-01',
  residenceType: 'Hostel',
};

const basicInfoData = {
  rollNo: '21CS101',
  registerNo: '921023104008',
  name: 'Rahul Sharma',
  department: 'Computer Science',

};


/* -------------------- COMPONENT -------------------- */

export default function PersonalInfo() {
  const { toast } = useToast();
  const { user, updateUserData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormData = {
    email: user?.email || personalData.email,
    linkedinUrl: personalData.linkedinUrl,
    phone: personalData.phone,
    alternatePhone: personalData.alternatePhone,
    address: personalData.address,
    city: personalData.city,
    state: personalData.state,
    pincode: personalData.pincode,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Separate pending states (ERP-style)
  const [pendingProfileRequest, setPendingProfileRequest] = useState(false);
  const [pendingResumeRequest, setPendingResumeRequest] = useState(false);

  const pendingRequest = pendingProfileRequest || pendingResumeRequest;

  /* -------------------- VALIDATION -------------------- */

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.phone.replace(/\D/g, '').length !== 12) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Phone number must include country code (+91).',
        variant: 'destructive',
      });
      return false;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      toast({
        title: 'Invalid Pin Code',
        description: 'Pin code must be exactly 6 digits.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  /* -------------------- HANDLERS -------------------- */

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSaving(false);
    setIsEditing(false);
    setPendingProfileRequest(true);

    toast({
      title: 'Request Submitted',
      description: 'Your changes were sent to faculty for approval.',
    });
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF files are allowed.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setResumeFile(file.name);
    setUploading(false);
    setPendingResumeRequest(true);

    toast({
      title: 'Resume Submitted',
      description: 'Resume sent for faculty approval.',
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateUserData({ avatar: result.data });
        toast({
          title: 'Photo Uploaded',
          description: 'Your profile photo has been updated successfully.',
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your photo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="animate-fade-in max-w-4xl">
      <PageHeader
        title="Personal Information"
        subtitle="Manage your contact details"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Personal Info' },
        ]}

      />

      {/* Profile Header */}
      <div className="section-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-inner">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-primary" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || basicInfoData.name}</h2>
              <p className="text-muted-foreground">{user?.rollNo || basicInfoData.rollNo}</p>
              <span className="badge badge-info mt-2">{user?.department || basicInfoData.department}</span>
            </div>
          </div>

          <label className="cursor-pointer">
            <Button disabled={pendingRequest || uploading} asChild>
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {resumeFile ? 'Change Resume' : 'Upload Resume'}
              </span>
            </Button>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />
          </label>
        </div>
      </div>

      <ProfileNavBar />

      {/* Pending Alert */}
      {pendingRequest && (
        <div className="flex gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
          <Clock className="w-5 h-5 text-amber-600 mt-1" />
          <div>
            <h3 className="font-semibold text-amber-900">Approval Pending</h3>
            <p className="text-sm text-amber-800">
              Your request is under faculty review.
            </p>
          </div>
        </div>
      )}

      {/* Personal Details */}
      <SectionCard
        title="Personal Details"
        subtitle="Manage your personal, contact, and address information"
        actions={
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={pendingRequest}
            className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isEditing ? 'Cancel' : 'Edit'}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </button>
        }
      >
        {/* Admission details */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Admission Number
            </label>
            <p className="text-base font-semibold text-slate-900">
              {personalData.admissionNo}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Batch
            </label>
            <p className="text-base font-semibold text-slate-900">
              {personalData.batch}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Admission Date
            </label>
            <p className="text-base font-semibold text-slate-900">
              {personalData.admissionDate}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nature of Residence
            </label>
            <p className="text-base font-semibold text-slate-900">
              {personalData.residenceType}
            </p>
          </div>
        </div> <br />

        <div className="space-y-6">
          {/* Core personal details (read-only) */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <p className="text-base font-semibold text-slate-900">{personalData.dob}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
              <p className="text-base font-semibold text-slate-900">{personalData.gender}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Blood Group</label>
              <p className="text-base font-semibold text-slate-900">{personalData.bloodGroup}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mother Tongue</label>
              <p className="text-base font-semibold text-slate-900">{personalData.motherTongue}</p>
            </div>
          </div>

          {/* Contact information (editable) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">LinkedIn URL</label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.linkedinUrl}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Mobile Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <p className="py-2.5 text-base font-semibold text-slate-900">{formData.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Alternate Mobile Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <p className="py-2.5 text-base font-semibold text-slate-900">{formData.alternatePhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address details (editable) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-2">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.address}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.city}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.state}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Pin Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="py-2.5 text-base font-semibold text-slate-900">{formData.pincode}</p>
              )}
            </div>
          </div>

          {/* Other details (read-only) */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nationality</label>
              <p className="text-base font-semibold text-slate-900">{personalData.nationality}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Religion</label>
              <p className="text-base font-semibold text-slate-900">{personalData.religion}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <p className="text-base font-semibold text-slate-900">{personalData.category}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Aadhar Number</label>
              <p className="text-base font-semibold text-slate-900">{personalData.aadharNo}</p>
            </div>
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-6 border-t border-border mt-6">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || pendingRequest}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  ); // missing closing parenthesis for the div tag
}


