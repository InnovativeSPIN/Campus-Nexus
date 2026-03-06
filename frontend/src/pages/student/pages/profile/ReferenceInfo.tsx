import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import ProfileNavBar from '@/pages/student/components/layout/ProfileNavBar';
import { User, Phone, MapPin, Clock } from 'lucide-react';

const references = [
  {
    id: 1,
    name: 'Dr. Amit Kumar',
    relation: 'Family Friend',
    phone: '+91 98765 44444',
    address: '789 College Road, Academic Zone, Mumbai - 400002',
    occupation: 'Professor',
  },
  {
    id: 2,
    name: 'Mrs. Priya Mehta',
    relation: 'Neighbor',
    phone: '+91 98765 55555',
    address: '124 Main Street, Sector 15, Mumbai - 400001',
    occupation: 'Doctor',
  },
  {
    id: 3,
    name: 'Mr. Suresh Patel',
    relation: 'Family Friend',
    phone: '+91 98765 66666',
    address: '567 Business Park, Andheri, Mumbai - 400069',
    occupation: 'Businessman',
  },
];

export default function ReferenceInfo() {
  const [referenceList] = useState(references);
  const [pendingRequest] = useState(false);

  return (
    <div className="animate-fade-in max-w-4xl">
      <PageHeader
        title="Reference and Relatives in this Institution"
        subtitle="Emergency contacts and references"
        breadcrumbs={[
          { label: 'Profile', path: '/student/profile/personal' },
          { label: 'References' },
        ]}
      />

      <ProfileNavBar />

      {pendingRequest && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">Change Request Pending</h3>
            <p className="text-sm text-amber-800 mt-1">
              Your changes have been submitted to faculty for approval.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {referenceList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No references or relatives to show.</p>
          </div>
        ) : (
          referenceList.map((ref, index) => (
            <div key={ref.id} className="relative">
              <SectionCard
                title={`Reference ${index + 1}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ref.name}</h3>
                    <p className="text-sm text-muted-foreground">{ref.relation} • {ref.occupation}</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{ref.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{ref.address}</span>
                  </div>
                </div>
              </SectionCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
