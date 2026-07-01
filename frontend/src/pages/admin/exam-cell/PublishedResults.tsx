import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Filter,
  TrendingUp,
  Download,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/pages/faculty/hooks/use-toast';

interface ClassItem {
  id: number;
  name: string;
  section: string;
  semester: number;
}

interface PublishedMark {
  id: number;
  studentId: number;
  subjectId: number;
  semester: number;
  academicYear: string;
  internalNumber: number;
  internalScore: string;
  assessmentScore: string;
  totalScore: string;
  status: string;
  attendancePercentage: string;
  student?: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: number;
    subject_name: string;
    subject_code: string;
  };
}

export default function PublishedResults() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [results, setResults] = useState<PublishedMark[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Load classes that have published submissions
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('/api/v1/exam-cell/submissions?status=published', {
          headers
        });
        const result = await response.json();
        if (result.success && result.data) {
          // Extract unique classes
          const uniqueClassesMap = new Map<number, ClassItem>();
          result.data.forEach((sub: any) => {
            if (sub.class) {
              uniqueClassesMap.set(sub.class.id, sub.class);
            }
          });
          setClasses(Array.from(uniqueClassesMap.values()));
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);

  const loadPublishedResults = async () => {
    if (!selectedClassId) {
      toast({
        title: "Filter Required",
        description: "Please select a Class / Section to view results.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingResults(true);
      const token = localStorage.getItem('authToken');
      
      let url = `/api/v1/exam-cell/students/${selectedClassId}/results`;
      const queryParams: string[] = [];
      if (selectedSubjectId !== 'all') queryParams.push(`subjectId=${selectedSubjectId}`);
      if (selectedCategory !== 'all') queryParams.push(`internalNumber=${selectedCategory}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, {
        headers
      });
      
      const result = await response.json();
      if (result.success) {
        setResults(result.data || []);
        toast({
          title: "Results Loaded",
          description: `Fetched ${result.data.length} records.`,
        });
      } else {
        toast({
          title: "Failed to Fetch",
          description: result.error || "Could not retrieve results.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoadingResults(false);
    }
  };

  // Extract unique subjects from results to populate the subject filter
  const uniqueSubjects = Array.from(
    new Map(results.map(r => [r.subjectId, r.subject])).values()
  ).filter(Boolean);

  const getPassRate = () => {
    if (results.length === 0) return 0;
    const passes = results.filter(r => parseFloat(r.totalScore) >= 50).length;
    return Math.round((passes / results.length) * 100);
  };

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, r) => acc + (parseFloat(r.totalScore) || 0), 0);
    return (total / results.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-serif text-foreground">Published Results Registry</h1>
        <p className="text-muted-foreground text-sm">Browse, audit and export published internal marks ledgers</p>
      </div>

      {/* Class Selection & Filters */}
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Class / Section</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name} - {cls.section} (Sem {cls.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map(sub => (
                    <SelectItem key={sub?.id} value={String(sub?.id)}>
                      {sub?.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exam Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All internals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All internals</SelectItem>
                  <SelectItem value="1">Internal Assessment #1</SelectItem>
                  <SelectItem value="2">Internal Assessment #2</SelectItem>
                  <SelectItem value="3">Model Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={loadPublishedResults} disabled={loadingResults} className="w-full gap-2">
              <Search className="h-4 w-4" /> Load Ledger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats cards if results loaded */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card className="border border-border/50 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pass Rate</p>
                <h3 className="text-3xl font-black text-green-700 mt-1">{getPassRate()}%</h3>
              </div>
              <div className="rounded-xl bg-background border p-3 text-green-600 shadow-sm">
                <UserCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Average Score</p>
                <h3 className="text-3xl font-black text-blue-700 mt-1">{getAverageScore()} <span className="text-xs font-normal text-muted-foreground">/ 100</span></h3>
              </div>
              <div className="rounded-xl bg-background border p-3 text-blue-600 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Records</p>
                <h3 className="text-3xl font-black text-indigo-700 mt-1">{results.length}</h3>
              </div>
              <div className="rounded-xl bg-background border p-3 text-indigo-600 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Ledger spreadsheet */}
      {loadingResults ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : results.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-muted/5">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 opacity-35 mb-3" />
            <p className="font-semibold text-foreground">No ledger loaded</p>
            <p className="text-sm">Select a class and click "Load Ledger" to inspect marks.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-serif">Grades ledger</CardTitle>
              <CardDescription>Official published internal assessment scores</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Export Ledger
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-medium text-xs border-b">
                  <tr>
                    <th className="px-4 py-3">Reg No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3 text-center">IA Category</th>
                    <th className="px-4 py-3 text-center">Internal Score (60)</th>
                    <th className="px-4 py-3 text-center">Assignment Total (40)</th>
                    <th className="px-4 py-3 text-center font-bold">Total Score (100)</th>
                    <th className="px-4 py-3 text-center">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {results.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-muted/15 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-medium">{r.student?.studentId || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {r.student ? `${r.student.firstName} ${r.student.lastName || ''}`.trim() : 'Unknown'}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-semibold text-foreground">{r.subject?.subject_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{r.subject?.subject_code}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground">
                        IA #{r.internalNumber}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-foreground">{r.internalScore}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-medium text-foreground">{r.assessmentScore}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-primary">{r.totalScore}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          parseFloat(r.totalScore) >= 50 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {parseFloat(r.totalScore) >= 50 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
