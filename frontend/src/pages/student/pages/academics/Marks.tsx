import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { SEMESTERS } from '@/pages/student/utils/constants';
import { Award, TrendingUp, BookOpen, Loader2 } from 'lucide-react';
import { getMyMarks, getMyInternalMarks, getMarksSummary } from '@/pages/student/services/studentApi';

const gradePoints: Record<string, number> = {
  'A+': 10, 'A': 9, 'A-': 8.5, 'B+': 8, 'B': 7, 'B-': 6.5,
  'C+': 6, 'C': 5, 'C-': 4.5, 'D': 4, 'F': 0,
};

function getGradeVariant(grade: string): 'success' | 'warning' | 'danger' | 'info' {
  if (grade?.startsWith('A')) return 'success';
  if (grade?.startsWith('B')) return 'info';
  if (grade?.startsWith('C')) return 'warning';
  return 'danger';
}

export default function Marks() {
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [internal1, setInternal1] = useState<any[]>([]);
  const [internal2, setInternal2] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [semGpa, setSemGpa] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      getMyMarks({ semester: selectedSemester }),
      getMyInternalMarks({ semester: selectedSemester, internalNumber: 1 }),
      getMyInternalMarks({ semester: selectedSemester, internalNumber: 2 }),
      getMarksSummary(),
    ]).then(([marksRes, int1Res, int2Res, summaryRes]) => {
      if (marksRes.status === 'fulfilled') {
        const data = (marksRes.value as any).data || [];
        setSubjects(data);
        const totalCredits = data.reduce((s: number, m: any) => s + (m.credits || 4), 0);
        const weightedGP = data.reduce((s: number, m: any) => s + (gradePoints[m.grade] || 0) * (m.credits || 4), 0);
        setSemGpa(totalCredits > 0 ? weightedGP / totalCredits : 0);
      }
      if (int1Res.status === 'fulfilled') setInternal1((int1Res.value as any).data || []);
      if (int2Res.status === 'fulfilled') setInternal2((int2Res.value as any).data || []);
      if (summaryRes.status === 'fulfilled') setCgpa((summaryRes.value as any).data?.cgpa || 0);
    }).finally(() => setLoading(false));
  }, [selectedSemester]);

  const totalMarks = subjects.reduce((sum: number, s: any) => sum + parseFloat(s.totalMarks || 0), 0);
  const displaySubjects = subjects.length > 0 ? subjects : (internal1.length > 0 ? internal1 : []);
  const totalCredits = displaySubjects.reduce((sum: number, s: any) => sum + parseFloat(s.subject?.credits || s.credits || 4), 0);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <BookOpen className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-sm">No marks recorded for Semester {selectedSemester}</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Marks"
        subtitle="View your examination results"
        breadcrumbs={[
          { label: 'Academics', path: '/student/academics/marks' },
          { label: 'Marks' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="stat-card stat-card-primary">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">CGPA</p>
              <p className="text-2xl font-bold font-display">
                {loading ? '...' : cgpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">Semester {selectedSemester} GPA</p>
              <p className="text-2xl font-bold font-display">
                {loading ? '...' : semGpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Marks / Credits</p>
              <p className="text-2xl font-bold font-display">
                {loading ? '...' : `${totalMarks} / ${totalCredits} cr`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SEMESTERS.map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === sem
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Semester Marks Table */}
        <SectionCard title={`Semester ${selectedSemester} Results`} subtitle="Subject-wise performance">
          {loading ? (
            <LoadingState />
          ) : subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-semibold">Subject</th>
                    <th className="text-center py-3 px-3 font-semibold">Code</th>
                    <th className="text-center py-3 px-3 font-semibold">Credits</th>
                    <th className="text-center py-3 px-3 font-semibold">Internal (60)</th>
                    <th className="text-center py-3 px-3 font-semibold">External (40)</th>
                    <th className="text-center py-3 px-3 font-semibold">Total</th>
                    <th className="text-center py-3 px-3 font-semibold">Grade</th>
                    <th className="text-center py-3 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject: any, index: number) => (
                    <tr key={subject.id || index} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-medium">{subject.subject?.subject_name || subject.subjectId}</td>
                      <td className="text-center py-3 px-3 text-muted-foreground font-mono text-xs">{subject.subject?.subject_code || '—'}</td>
                      <td className="text-center py-3 px-3">{subject.credits || 4}</td>
                      <td className="text-center py-3 px-3">{subject.internalMarks}</td>
                      <td className="text-center py-3 px-3">{subject.externalMarks}</td>
                      <td className="text-center py-3 px-3 font-semibold">{subject.totalMarks}</td>
                      <td className="text-center py-3 px-3">
                        {subject.grade ? (
                          <Badge variant={getGradeVariant(subject.grade)}>{subject.grade}</Badge>
                        ) : '—'}
                      </td>
                      <td className="text-center py-3 px-3">
                        <Badge variant={subject.status === 'pass' ? 'success' : subject.status === 'fail' ? 'danger' : 'info'}>
                          {subject.status || 'pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Internal Marks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { label: 'Internal 1', data: internal1 },
            { label: 'Internal 2', data: internal2 },
          ].map(({ label, data }) => (
            <SectionCard key={label} title={label} subtitle="Test scores">
              {loading ? (
                <LoadingState />
              ) : data.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold">Subject</th>
                        <th className="text-center py-2 px-3 font-semibold">Test (60)</th>
                        <th className="text-center py-2 px-3 font-semibold">Assessment</th>
                        <th className="text-center py-2 px-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row: any, i: number) => (
                        <tr key={row.id || i} className="border-b border-border last:border-0">
                          <td className="py-2 px-3">{row.subject?.subject_name || row.subjectId}</td>
                          <td className="text-center py-2 px-3">{row.internalScore}</td>
                          <td className="text-center py-2 px-3">{row.assessmentScore}</td>
                          <td className="text-center py-2 px-3 font-semibold">{row.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
