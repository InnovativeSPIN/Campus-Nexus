import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import { BookOpen, Award } from 'lucide-react';
import AcademicsNavBar from '@/pages/student/components/layout/AcademicsNavBar';
import Syllabus from './Syllabus';
import Marks from './Marks';
import { cn } from '@/pages/student/lib/utils';

export default function Academics() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'marks'>('syllabus');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics"
        subtitle="View your academic syllabus and marks"
        icon={BookOpen}
      />

      {/* Tab Navigation */}
      <SectionCard>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={cn(
              'px-6 py-3 font-medium rounded-lg transition-all duration-200',
              activeTab === 'syllabus'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Syllabus
            </div>
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={cn(
              'px-6 py-3 font-medium rounded-lg transition-all duration-200',
              activeTab === 'marks'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Marks
            </div>
          </button>
        </div>
      </SectionCard>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'syllabus' && <Syllabus showHeader={false} />}
        {activeTab === 'marks' && <Marks showHeader={false} />}
      </div>
    </div>
  );
}
