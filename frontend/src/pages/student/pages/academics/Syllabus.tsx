import { useState, useEffect } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { BookOpen, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

interface SyllabusTopicItem {
  id: number;
  sno: number;
  unit_label: string;
  unit_number: number;
  topic: string;
  co_number: string;
  btl: string;
  periods_required: number;
  delivery_mode: string;
  reference_book: string;
  approval_status: string;
}

interface CoursePlan {
  id: number;
  subject: {
    id: number;
    subject_name: string;
    subject_code: string;
  };
  class: {
    id: number;
    name: string;
    section: string;
  };
  faculty: {
    faculty_id: number;
    Name: string;
    faculty_college_code: string;
  };
  academic_year: string;
  semester: number;
  topics: SyllabusTopicItem[];
}

export default function Syllabus({ showHeader = true }: { showHeader?: boolean }) {
  const [selectedSemester, setSelectedSemester] = useState<number>(6);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syllabusData, setSyllabusData] = useState<CoursePlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setSelectedSubject(null); // Reset subject filter when semester changes
    fetchSyllabus();
  }, [selectedSemester]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `/api/v1/student/syllabus?semester=${selectedSemester}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Handle 404 with a user-friendly message
        if (response.status === 404) {
          throw new Error(
            `Academics not allocated for Semester ${selectedSemester}. Please contact your department administrator.`
          );
        }
        throw new Error(`Failed to fetch syllabus: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSyllabusData(data.data || []);
        // Initialize expanded units state - expand all units by default
        const newExpandedUnits: { [key: string]: boolean } = {};
        (data.data || []).forEach((course: CoursePlan) => {
          const units = [...new Set(course.topics.map(t => t.unit_label))];
          units.forEach(unit => {
            newExpandedUnits[`${course.id}-${unit}`] = true;
          });
        });
        setExpandedUnits(newExpandedUnits);
      } else {
        throw new Error(data.error || 'Failed to fetch syllabus');
      }
    } catch (err) {
      console.error('Error fetching syllabus:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSyllabusData([]);
    } finally {
      setLoading(false);
    }
  };

  const groupTopicsByUnit = (topics: SyllabusTopicItem[]) => {
    const grouped: { [key: string]: SyllabusTopicItem[] } = {};
    topics.forEach(topic => {
      const unitLabel = topic.unit_label || 'Unassigned';
      if (!grouped[unitLabel]) {
        grouped[unitLabel] = [];
      }
      grouped[unitLabel].push(topic);
    });
    return Object.entries(grouped).sort((a, b) => {
      const aNum = parseInt(a[0].match(/\d+/)?.[0] || '999');
      const bNum = parseInt(b[0].match(/\d+/)?.[0] || '999');
      return aNum - bNum;
    });
  };

  const toggleUnit = (courseId: number, unit: string) => {
    const key = `${courseId}-${unit}`;
    setExpandedUnits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter syllabusData by selected subject
  const filteredSyllabusData = selectedSubject
    ? syllabusData.filter(course => course.subject.id === selectedSubject)
    : syllabusData;

  return (
    <div className="space-y-6">
      {showHeader && (
        <PageHeader
          title="Syllabus"
          subtitle="View approved course lesson plans for your subjects"
          icon={BookOpen}
        />
      )}

      {/* Semester Selector */}
      <SectionCard>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-4 items-center">
            <label className="font-semibold text-foreground">Select Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {syllabusData.length > 0 && (
            <div className="flex gap-4 items-center">
              <label className="font-semibold text-foreground">Filter by Subject:</label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Subjects</option>
                {syllabusData.map((course) => (
                  <option key={course.subject.id} value={course.subject.id}>
                    {course.subject.subject_name} ({course.subject.subject_code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Loading State */}
      {loading && (
        <SectionCard>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading syllabuses...</span>
          </div>
        </SectionCard>
      )}

      {/* Error State - Academics Not Allocated Alert */}
      {error && !loading && (
        <SectionCard className="border-2 border-danger/40 bg-danger/5">
          <div className="flex gap-4 p-6 bg-gradient-to-r from-danger/10 to-danger/5 rounded-lg">
            <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-danger text-lg mb-2">Academics Not Allocated</p>
              <p className="text-danger/80 text-sm leading-relaxed">{error}</p>
              <p className="text-danger/60 text-xs mt-3">
                ℹ️ If you believe this is an error, please contact your department administrator or class coordinator.
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Empty State - No Academics Allocated */}
      {!loading && !error && syllabusData.length === 0 && (
        <SectionCard className="border-2 border-warning/40 bg-warning/5">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-warning mb-4 mx-auto opacity-60" />
            <p className="text-lg font-semibold text-warning mb-2">No Academics Allocated</p>
            <p className="text-warning/80 text-sm">
              Academics have not been allocated for Semester {selectedSemester} yet.
            </p>
            <p className="text-warning/60 text-xs mt-3">
              Course syllabuses will appear here once your course plan has been approved by the department.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Empty State - No Results After Filter */}
      {!loading && !error && syllabusData.length > 0 && filteredSyllabusData.length === 0 && (
        <SectionCard className="border-2 border-info/40 bg-info/5">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-info mb-4 mx-auto opacity-60" />
            <p className="text-lg font-semibold text-info mb-2">No Subjects Match Filter</p>
            <p className="text-info/80 text-sm">
              The selected subject filter returned no results. Try selecting a different subject.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Syllabus Content */}
      {!loading && filteredSyllabusData.length > 0 && (
        <div className="space-y-4">
          {filteredSyllabusData.map((coursePlan) => (
            <SectionCard key={coursePlan.id}>
              {/* Course Header */}
              <div className="mb-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {coursePlan.subject.subject_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Code: {coursePlan.subject.subject_code}
                    </p>
                  </div>
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Approved
                  </Badge>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-semibold">{coursePlan.class.name} - {coursePlan.class.section}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Faculty</p>
                    <p className="font-semibold">{coursePlan.faculty.Name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Academic Year</p>
                    <p className="font-semibold">{coursePlan.academic_year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Topics</p>
                    <p className="font-semibold">{coursePlan.topics.length}</p>
                  </div>
                </div>
              </div>

              {/* Topics List - Organized by Units */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground mb-4">Course Topics</h4>
                {groupTopicsByUnit(coursePlan.topics).map(([unit, topics]) => {
                  const unitKey = `${coursePlan.id}-${unit}`;
                  const isExpanded = expandedUnits[unitKey] ?? true;
                  const topicsInUnit = topics.length;

                  return (
                    <div key={unit} className="border border-border rounded-lg overflow-hidden">
                      {/* Unit Header */}
                      <button
                        onClick={() => toggleUnit(coursePlan.id, unit)}
                        className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between border-b border-border"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-primary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-primary" />
                          )}
                          <div>
                            <h5 className="font-semibold text-foreground">{unit}</h5>
                            <p className="text-xs text-muted-foreground">
                              {topicsInUnit} topic{topicsInUnit !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {topicsInUnit}
                        </Badge>
                      </button>

                      {/* Topics under Unit */}
                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-muted/20">
                          {topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="p-3 bg-background border border-border rounded-lg hover:border-primary/40 transition-colors"
                            >
                              {/* Topic Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                                      {topic.sno}
                                    </span>
                                    <h6 className="font-semibold text-foreground text-sm">{topic.topic}</h6>
                                  </div>
                                </div>
                                {topic.periods_required && (
                                  <Badge variant="info" className="text-xs">
                                    {topic.periods_required} periods
                                  </Badge>
                                )}
                              </div>

                              {/* Topic Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-7 mt-2 text-xs">
                                {topic.co_number && (
                                  <div>
                                    <span className="text-muted-foreground">CO:</span>
                                    <span className="ml-2 font-medium">{topic.co_number}</span>
                                  </div>
                                )}
                                {topic.btl && (
                                  <div>
                                    <span className="text-muted-foreground">BTL:</span>
                                    <span className="ml-2 font-medium">{topic.btl}</span>
                                  </div>
                                )}
                                {topic.delivery_mode && (
                                  <div>
                                    <span className="text-muted-foreground">Delivery:</span>
                                    <span className="ml-2 font-medium">{topic.delivery_mode}</span>
                                  </div>
                                )}
                                {topic.reference_book && (
                                  <div>
                                    <span className="text-muted-foreground">Reference:</span>
                                    <span className="ml-2 font-medium">{topic.reference_book}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
