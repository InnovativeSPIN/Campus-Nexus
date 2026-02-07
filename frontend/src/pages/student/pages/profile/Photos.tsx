import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { Upload, Camera, Users, X, Check, Edit, Clock } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Photos() {
  const { toast } = useToast();
  const { user, updateUserData } = useAuth();
  const [studentPhoto, setStudentPhoto] = useState<string | null>(user?.avatar || null);
  const [familyPhoto, setFamilyPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'student' | 'family' | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setStudentPhoto(user.avatar);
    }
  }, [user?.avatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'student' | 'family') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(type);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/auth/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (type === 'student') {
          setStudentPhoto(result.data);
          updateUserData({ avatar: result.data });
        } else {
          setFamilyPhoto(result.data);
        }

        toast({
          title: 'Photo Uploaded',
          description: type === 'student' ? 'Your profile photo has been updated.' : 'Family photo uploaded successfully.',
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
      setUploading(null);
    }
  };

  const removePhoto = (type: 'student' | 'family') => {
    if (type === 'student') {
      setStudentPhoto(null);
    } else {
      setFamilyPhoto(null);
    }
    toast({
      title: 'Photo removed',
      description: 'The photo has been removed.',
    });
  };

  interface PhotoUploadCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    photo: string | null;
    type: 'student' | 'family';
  }

  const PhotoUploadCard = ({ title, description, icon: Icon, photo, type }: PhotoUploadCardProps) => (
    <SectionCard
      title={title}
      subtitle={description}
      actions={
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={isEditing ? 'Cancel' : 'Edit'}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
        </button>
      }
    >
      <div className="flex flex-col items-center gap-4">
        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt={title}
              className="w-48 h-48 object-cover rounded-xl border-2 border-border"
            />
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            {isEditing && (
              <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <label className="cursor-pointer bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  Change
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, type)}
                    disabled={uploading === type}
                  />
                </label>
                <button
                  onClick={() => removePhoto(type)}
                  disabled={uploading === type}
                  className="bg-destructive text-destructive-foreground px-3 py-2 rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <label className="w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors" style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: isEditing ? 1 : 0.5 }}>
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Click to upload</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP (max 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e, type)}
              disabled={uploading === type}
            />
          </label>
        )}
      </div>
    </SectionCard>
  );

  return (
    <div className="animate-fade-in max-w-4xl">
      <PageHeader
        title="Photos"
        subtitle="Upload and manage your photos"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Photos' },
        ]}
      />

      <ProfileNavBar />


      <div className="grid gap-6 sm:grid-cols-2">
        <PhotoUploadCard
          title="Student Photo"
          description="Your official profile photo"
          icon={Camera}
          photo={studentPhoto}
          type="student"
        />
        <PhotoUploadCard
          title="Family Photo"
          description="Photo with your family"
          icon={Users}
          photo={familyPhoto}
          type="family"
        />
      </div>
    </div>
  );
}


