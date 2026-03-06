import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { Camera, Users, Check, Image as ImageIcon } from 'lucide-react';
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
          </div>
        ) : (
          <div className="w-64 h-64 rounded-[1.5rem] border-4 border-dashed border-primary/10 bg-primary/5 flex flex-col items-center justify-center gap-5 group transition-all hover:bg-primary/10 hover:border-primary/30">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Icon className="w-10 h-10 text-primary/40" />
            </div>
            <div className="text-center px-6">
              <p className="text-base font-bold text-primary/70 tracking-tight">Image Required</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed">Please contact the administration office to update your official records.</p>
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
