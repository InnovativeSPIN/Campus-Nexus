import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { Camera, Users, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Photos() {
  const { user } = useAuth();
  const [studentPhoto, setStudentPhoto] = useState<string | null>(user?.avatar || null);
  const [familyPhoto, setFamilyPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar) {
      setStudentPhoto(user.avatar);
    }
  }, [user?.avatar]);

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
          </div>
        ) : (
          <div className="w-48 h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 opacity-50">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Icon className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">No photo uploaded</p>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );

  return (
    <div className="animate-fade-in max-w-4xl">
      <PageHeader
        title="Photos"
        subtitle="View your profile photos"
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
        />
        <PhotoUploadCard
          title="Family Photo"
          description="Photo with your family"
          icon={Users}
          photo={familyPhoto}
        />
      </div>
    </div>
  );
}
