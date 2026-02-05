import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';

export default function Timetable() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Timetable"
        subtitle=""
        breadcrumbs={[
          { label: 'Timetable' },
        ]}
      />

      <SectionCard title="Timetable">
        <div className="py-12 text-center text-muted-foreground">
          Timetable content has been removed.
        </div>
      </SectionCard>
    </div>
  );
}


