import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { Camera, Users, Check, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeImageUrl } from '@/utils/imageUrl';
import { useToast } from '@/pages/student/hooks/use-toast';
import { Button } from '@/pages/student/components/ui/button';
import { uploadStudentPhoto } from '@/pages/student/services/studentApi';

export default function Photos() {
  const { user, updateUserData } = useAuth();
  const [studentPhoto, setStudentPhoto] = useState<string | null>(normalizeImageUrl(user?.avatar) || null);
  const [familyPhoto, setFamilyPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.avatar) {
      setStudentPhoto(normalizeImageUrl(user.avatar));
    }
  }, [user?.avatar]);

  const uploadPhoto = async (file: File, isFamily: boolean) => {
    if (!user?.id) {
      toast({ title: 'Unauthorized', description: 'User not logged in', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB allowed', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadStudentPhoto(user.id, file);
      if (res.success) {
        const imageUrl = normalizeImageUrl(res.data.photo);
        if (isFamily) {
          setFamilyPhoto(imageUrl);
        } else {
          setStudentPhoto(imageUrl);
          updateUserData({ avatar: imageUrl || '' });
          toast({ title: 'Success', description: 'Student photo updated successfully' });
        }
      } else {
        toast({ title: 'Error', description: res.error || 'Photo upload failed', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Photo upload failed', error);
      toast({ title: 'Error', description: error.message || 'Failed to upload photo', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  interface PhotoUploadCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    photo: string | null;
  }

  const PhotoUploadCard = ({ title, description, icon: Icon, photo }: PhotoUploadCardProps) => (
    <SectionCard
      title={title}
      subtitle={description}
      icon={ImageIcon}
      className="hover:shadow-2xl transition-all duration-500 border-0 shadow-xl"
    >
      <div className="flex flex-col items-center gap-8 py-6">
        {photo ? (
          <div className="relative group p-1">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-[2rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-300 animate-gradient-xy"></div>
            <div className="relative overflow-hidden rounded-[1.5rem] border-4 border-card shadow-2xl">
              <img
                src={photo}
                alt={title}
                className="w-64 h-64 object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center shadow-xl border-4 border-card z-10">
              <Check className="w-6 h-6 font-black" />
            </div>
            <div className="mt-3 flex justify-center">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90">
                <UploadCloud className="w-4 h-4" />
                <span className="text-xs font-semibold">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file, title !== 'Student Photo');
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 rounded-[1.5rem] border-4 border-dashed border-primary/10 bg-primary/5 flex flex-col items-center justify-center gap-5 group transition-all hover:bg-primary/10 hover:border-primary/30">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Icon className="w-10 h-10 text-primary/40" />
            </div>
            <div className="text-center px-6">
              <p className="text-base font-bold text-primary/70 tracking-tight">Image Required</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">No image found yet.</p>
              <label className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90">
                <UploadCloud className="w-4 h-4" />
                <span className="text-xs font-semibold">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file, title !== 'Student Photo');
                  }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Official Photographs"
        subtitle="Verification and institutional ID photos"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'Photos' },
        ]}
      />

      <ProfileNavBar />

      <div className="grid gap-8 sm:grid-cols-2">
        <PhotoUploadCard
          title="Student Photo"
          description="Used for ID cards and official portals"
          icon={Camera}
          photo={studentPhoto}
        />
        <PhotoUploadCard
          title="Family Photo"
          description="Verification photo with parents/guardians"
          icon={Users}
          photo={familyPhoto}
        />
      </div>
    </div>
  );
}
