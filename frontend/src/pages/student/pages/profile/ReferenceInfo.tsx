import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, MapPin, Clock, Briefcase, Heart, UserPlus, Loader2 } from 'lucide-react';
import { getMyProfile } from '@/pages/student/services/studentApi';

export default function ReferenceInfo() {
  const [referenceList, setReferenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequest] = useState(false);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile() as any;
        if (res.success && res.data?.bio?.references) {
          setReferenceList(res.data.bio.references);
        }
      } catch (error) {
        console.error('Failed to fetch references', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReferences();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="References & Institution Relatives"
        subtitle="Emergency contacts and verified references"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'References' },
        ]}
      />

      <ProfileNavBar />

      <div className="grid gap-8">
        {pendingRequest && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Verification Pending</h3>
              <p className="text-sm text-amber-800 font-medium">Updated references are currently being reviewed.</p>
            </div>
          </div>
        )}

        {referenceList.length === 0 ? (
          <div className="section-card flex flex-col items-center justify-center py-20 bg-muted/20 border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">No References Added</p>
            <p className="text-sm text-muted-foreground mt-2">Verified institution relatives will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {referenceList.map((ref, index) => (
              <SectionCard
                key={ref.id}
                title={`Reference #${index + 1}`}
                icon={Heart}
                className="shadow-xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{ref.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-orange-700 font-bold uppercase tracking-wider">
                        <span>{ref.relation}</span>
                        <span className="w-1 h-1 rounded-full bg-orange-300" />
                        <span>{ref.occupation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Phone Number</label>
                      <div className="flex items-center gap-3 text-foreground font-bold">
                        <Phone className="w-4 h-4 text-orange-500" />
                        {ref.phone}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Contact Address</label>
                      <div className="flex items-start gap-3 text-sm text-foreground font-semibold leading-relaxed">
                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                        {ref.address}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
