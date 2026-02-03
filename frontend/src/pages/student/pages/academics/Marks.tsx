import { useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import AcademicsNavBar from '@/pages/student/components/layout/AcademicsNavBar';
import { SEMESTERS } from '@/pages/student/utils/constants';
import { Award, TrendingUp, BookOpen } from 'lucide-react';

const marksData = {
  5: {
    cgpa: 8.65,
    totalCredits: 24,
    internal1: [
      { code: 'CS501', subject: 'Data Structures', internal: 36, assessment: 24, total: 60 },
      { code: 'CS502', subject: 'Database Systems', internal: 34, assessment: 26, total: 60 },
      { code: 'CS503', subject: 'Operating Systems', internal: 30, assessment: 28, total: 58 },
      { code: 'CS504', subject: 'Computer Networks', internal: 38, assessment: 22, total: 60 },
      { code: 'CS505', subject: 'Software Engineering', internal: 32, assessment: 26, total: 58 },
      { code: 'CS506', subject: 'Lab Practice', internal: 40, assessment: 20, total: 60 },
    ],
    internal2: [
      { code: 'CS501', subject: 'Data Structures', internal: 35, assessment: 23, total: 58 },
      { code: 'CS502', subject: 'Database Systems', internal: 32, assessment: 26, total: 58 },
      { code: 'CS503', subject: 'Operating Systems', internal: 32, assessment: 28, total: 60 },
      { code: 'CS504', subject: 'Computer Networks', internal: 36, assessment: 24, total: 60 },
      { code: 'CS505', subject: 'Software Engineering', internal: 30, assessment: 26, total: 56 },
      { code: 'CS506', subject: 'Lab Practice', internal: 32, assessment: 25, total: 57 },
    ],
    subjects: [
      { code: 'CS501', name: 'Data Structures', credits: 4, internal: 42, external: 58, total: 100, grade: 'A+' },
      { code: 'CS502', name: 'Database Systems', credits: 4, internal: 38, external: 52, total: 90, grade: 'A' },
      { code: 'CS503', name: 'Operating Systems', credits: 4, internal: 35, external: 48, total: 83, grade: 'B+' },
      { code: 'CS504', name: 'Computer Networks', credits: 4, internal: 40, external: 55, total: 95, grade: 'A+' },
      { code: 'CS505', name: 'Software Engineering', credits: 4, internal: 36, external: 50, total: 86, grade: 'A' },
      { code: 'CS506', name: 'Lab Practice', credits: 4, internal: 45, external: 48, total: 93, grade: 'A+' },
    ],
  },
  4: {
    cgpa: 8.45,
    totalCredits: 24,
    internal1: [
      { code: 'CS401', subject: 'Discrete Mathematics', internal: 36, assessment: 24, total: 60 },
      { code: 'CS402', subject: 'Digital Logic', internal: 30, assessment: 28, total: 58 },
      { code: 'CS403', subject: 'Object Oriented Programming', internal: 34, assessment: 26, total: 60 },
      { code: 'CS404', subject: 'Computer Architecture', internal: 32, assessment: 26, total: 58 },
      { code: 'CS405', subject: 'Data Communication', internal: 30, assessment: 26, total: 56 },
      { code: 'CS406', subject: 'Lab Practice', internal: 36, assessment: 24, total: 60 },
    ],
    internal2: [
      { code: 'CS401', subject: 'Discrete Mathematics', internal: 34, assessment: 26, total: 60 },
      { code: 'CS402', subject: 'Digital Logic', internal: 32, assessment: 28, total: 60 },
      { code: 'CS403', subject: 'Object Oriented Programming', internal: 32, assessment: 26, total: 58 },
      { code: 'CS404', subject: 'Computer Architecture', internal: 32, assessment: 26, total: 58 },
      { code: 'CS405', subject: 'Data Communication', internal: 32, assessment: 24, total: 56 },
      { code: 'CS406', subject: 'Lab Practice', internal: 34, assessment: 26, total: 60 },
    ],
    subjects: [
      { code: 'CS401', name: 'Discrete Mathematics', credits: 4, internal: 40, external: 52, total: 92, grade: 'A+' },
      { code: 'CS402', name: 'Digital Logic', credits: 4, internal: 35, external: 45, total: 80, grade: 'B+' },
      { code: 'CS403', name: 'Object Oriented Programming', credits: 4, internal: 38, external: 50, total: 88, grade: 'A' },
      { code: 'CS404', name: 'Computer Architecture', credits: 4, internal: 36, external: 48, total: 84, grade: 'A' },
      { code: 'CS405', name: 'Data Communication', credits: 4, internal: 34, external: 46, total: 80, grade: 'B+' },
      { code: 'CS406', name: 'Lab Practice', credits: 4, internal: 42, external: 50, total: 92, grade: 'A+' },
    ],
  },
};

const gradePoints: Record<string, number> = {
  'A+': 10, 'A': 9, 'A-': 8.5, 'B+': 8, 'B': 7, 'B-': 6.5,
  'C+': 6, 'C': 5, 'C-': 4.5, 'D': 4, 'F': 0,
};

function getGradeVariant(grade: string): 'success' | 'warning' | 'danger' | 'info' {
  if (grade.startsWith('A')) return 'success';
  if (grade.startsWith('B')) return 'info';
  if (grade.startsWith('C')) return 'warning';
  return 'danger';
}

export default function Marks() {
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const data = marksData[selectedSemester as keyof typeof marksData] || marksData[5];

  const totalMarks = data.subjects.reduce((sum, s) => sum + s.total, 0);
  const maxMarks = data.subjects.length * 100;
  const overallPercentage = ((totalMarks / maxMarks) * 100).toFixed(1);
  const semesterGpa = data.subjects.reduce(
    (sum, subject) => sum + gradePoints[subject.grade] * subject.credits,
    0,
  ) / data.totalCredits;

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

      <AcademicsNavBar />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="stat-card stat-card-primary">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">CGPA</p>
              <p className="text-2xl font-bold font-display">{data.cgpa.toFixed(2)}</p>
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
              <p className="text-2xl font-bold font-display">{semesterGpa.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-bold font-display">{data.totalCredits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Semester
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(Number(e.target.value))}
          className="input-field py-2 pr-8 w-full sm:w-auto"
        >
          {SEMESTERS.slice(0, 5).reverse().map((sem) => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {/* Internal 1 Container */}
      <SectionCard title={`Semester ${selectedSemester} - Internal 1`} subtitle="Assessment breakdown">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th className="text-center">Internal (60)</th>
                <th className="text-center">Assessment (40)</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.internal1.map((item) => (
                <tr key={`${item.code}-internal1`}>
                  <td className="font-mono text-sm">{item.code}</td>
                  <td className="font-medium">{item.subject}</td>
                  <td className="text-center">{item.internal}</td>
                  <td className="text-center">{item.assessment}</td>
                  <td className="text-center font-semibold">{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td colSpan={2} className="font-semibold">Total</td>
                <td className="text-center font-semibold">
                  {data.internal1.reduce((sum, s) => sum + s.internal, 0)}
                </td>
                <td className="text-center font-semibold">
                  {data.internal1.reduce((sum, s) => sum + s.assessment, 0)}
                </td>
                <td className="text-center font-semibold">
                  {data.internal1.reduce((sum, s) => sum + s.total, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SectionCard>

      {/* Internal 2 Container */}
      <SectionCard title={`Semester ${selectedSemester} - Internal 2`} subtitle="Assessment breakdown">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th className="text-center">Internal (60)</th>
                <th className="text-center">Assessment (40)</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.internal2.map((item) => (
                <tr key={`${item.code}-internal2`}>
                  <td className="font-mono text-sm">{item.code}</td>
                  <td className="font-medium">{item.subject}</td>
                  <td className="text-center">{item.internal}</td>
                  <td className="text-center">{item.assessment}</td>
                  <td className="text-center font-semibold">{item.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td colSpan={2} className="font-semibold">Total</td>
                <td className="text-center font-semibold">
                  {data.internal2.reduce((sum, s) => sum + s.internal, 0)}
                </td>
                <td className="text-center font-semibold">
                  {data.internal2.reduce((sum, s) => sum + s.assessment, 0)}
                </td>
                <td className="text-center font-semibold">
                  {data.internal2.reduce((sum, s) => sum + s.total, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SectionCard>

      {/* Marks Table */}
      <SectionCard title={`Semester ${selectedSemester} Results`} subtitle="Internal + External marks breakdown">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th className="text-center">Credits</th>
                <th className="text-center">Internal (50)</th>
                <th className="text-center">External (50)</th>
                <th className="text-center">Total (100)</th>
                <th className="text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((subject) => (
                <tr key={subject.code}>
                  <td className="font-mono text-sm">{subject.code}</td>
                  <td className="font-medium">{subject.name}</td>
                  <td className="text-center">{subject.credits}</td>
                  <td className="text-center">{subject.internal}</td>
                  <td className="text-center">{subject.external}</td>
                  <td className="text-center font-semibold">{subject.total}</td>
                  <td className="text-center">
                    <Badge variant={getGradeVariant(subject.grade)}>{subject.grade}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td colSpan={2} className="font-semibold">Total</td>
                <td className="text-center font-semibold">{data.totalCredits}</td>
                <td className="text-center font-semibold">
                  {data.subjects.reduce((sum, s) => sum + s.internal, 0)}
                </td>
                <td className="text-center font-semibold">
                  {data.subjects.reduce((sum, s) => sum + s.external, 0)}
                </td>
                <td className="text-center font-semibold">{totalMarks}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SectionCard>

      {/* Grade Legend */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30">
        <h4 className="text-sm font-medium mb-3">Grade Scale</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(gradePoints).map(([grade, points]) => (
            <div key={grade} className="flex items-center gap-2">
              <Badge variant={getGradeVariant(grade)}>{grade}</Badge>
              <span className="text-muted-foreground">= 0 points</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


