import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/pages/faculty/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/faculty/components/ui/card';
import { Alert, AlertDescription } from '@/pages/faculty/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/faculty/components/ui/tabs';
import { Loader2, AlertCircle, Clock, User } from 'lucide-react';
import { toast } from '@/pages/faculty/hooks/use-toast';

interface Period {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface ClassInfo {
  id: number;
  name: string;
  program: string;
}

interface DepartmentInfo {
  id: number;
  name: string;
  code: string;
}

interface Slot {
  id: number;
  day: string;
  period: Period;
  subject: Subject | null;
  sessionType: string;
  room: string;
  notes: string;
}

interface Timetable {
  id: number;
  class: ClassInfo;
  department: DepartmentInfo;
  academicYear: string;
  semester: number;
  semesterType: string;
  batch: string;
  effectiveFrom: string;
  slots: Slot[];
}

interface TimetableResponse {
  faculty: {
    id: number;
    name: string;
    email: string;
  };
  timetables: Timetable[];
  totalClasses: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FacultyIndividualTimetable: React.FC = () => {
  const { authToken } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/timetable-display/my-timetable', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch timetable');
      }

      const data = await response.json();
      console.log('[FACULTY TIMETABLE] Fetched data:', data);

      setTimetableData(data);
      toast({
        title: '✅ Timetable Loaded',
        description: `Loaded ${data.timetables.length} class(es) timetable`
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch timetable';
      setError(errorMsg);
      toast({
        title: '❌ Error',
        description: errorMsg,
        variant: 'destructive'
      });
      console.error('[FACULTY TIMETABLE] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <button
            onClick={fetchTimetable}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!timetableData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No timetable found. You are not assigned to any classes yet.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getSessionColor = (sessionType: string) => {
    switch (sessionType?.toLowerCase()) {
      case 'lab':
      case 'lab/practical':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      case 'project':
        return 'bg-purple-50 border-l-4 border-purple-500 text-purple-900';
      case 'tutorial':
        return 'bg-cyan-50 border-l-4 border-cyan-500 text-cyan-900';
      case 'activity':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      case 'theory':
      default:
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
    }
  };

  const TimetableGrid: React.FC<{ timetable: Timetable }> = ({ timetable }) => {
    // Get unique periods sorted by ID
    const allPeriods = Array.from(
      new Set(timetable.slots.map(s => s.period?.id).filter(Boolean))
    ).sort((a, b) => (a || 0) - (b || 0));

    // Get period details
    const periodDetails = allPeriods
      .map(id => timetable.slots.find(s => s.period?.id === id)?.period)
      .filter(Boolean) as Period[];

    return (
      <div className="overflow-x-auto border rounded-lg border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-50 border-b-2 border-blue-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 min-w-24">Day</th>
              {periodDetails.map(period => (
                <th key={period.id} className="px-4 py-3 text-center text-sm font-semibold text-blue-900 min-w-32">
                  <div className="font-bold">{period.label}</div>
                  <div className="text-xs text-gray-600 font-normal">
                    {period.startTime.substring(0, 5)} - {period.endTime.substring(0, 5)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 bg-gray-50">
                  {day}
                </td>
                {periodDetails.map(period => {
                  const slot = timetable.slots.find(
                    s => s.day === day && s.period?.id === period.id
                  );

                  return (
                    <td
                      key={`${day}-${period.id}`}
                      className="px-4 py-3 border-l border-gray-200 text-center"
                    >
                      {slot ? (
                        <div className={`space-y-1 p-2 rounded text-sm ${getSessionColor(slot.sessionType)}`}>
                          {slot.subject ? (
                            <>
                              <div className="font-bold">
                                {slot.subject.code}
                              </div>
                              <div className="text-xs font-semibold leading-tight">
                                {slot.subject.name}
                              </div>
                              <div className="text-xs font-mono bg-white/50 px-1 py-0.5 rounded inline-block">
                                {slot.sessionType.toUpperCase().substring(0, 3)}
                              </div>
                              {slot.room && (
                                <div className="text-xs opacity-75">
                                  {slot.room}
                                </div>
                              )}
                              {slot.notes && (
                                <div className="text-xs opacity-75 italic">
                                  {slot.notes}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-gray-400">-</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-600">
            Welcome back, {timetableData.faculty.name} • {timetableData.faculty.email}
          </p>
        </div>

        {/* Tabs for Multiple Classes */}
        {timetableData.timetables.length > 0 ? (
          <Tabs defaultValue={`0`} className="w-full">
            <TabsList className="grid w-full gap-2 mb-6">
              {timetableData.timetables.map((tt, index) => (
                <TabsTrigger
                  key={tt.id}
                  value={`${index}`}
                  className="text-sm font-semibold"
                >
                  {tt.class.name} (Sem {tt.semester})
                </TabsTrigger>
              ))}
            </TabsList>

            {timetableData.timetables.map((timetable, index) => (
              <TabsContent key={timetable.id} value={`${index}`} className="space-y-6">
                {/* Class Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="text-lg font-semibold">{timetable.class.name}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Academic Year</p>
                      <p className="text-lg font-semibold">{timetable.academicYear}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Semester</p>
                      <p className="text-lg font-semibold">
                        {timetable.semester} ({timetable.semesterType})
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-lg font-semibold">{timetable.department.code}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Class Administration</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Class Coordinator</p>
                        <p className="font-semibold">{timetable.department.name}</p>
                        <p className="text-xs text-gray-500">Department assigned</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Batch</p>
                        <p className="font-semibold">{timetable.batch}</p>
                        <p className="text-xs text-gray-500">Effective from {new Date(timetable.effectiveFrom).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timetable Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TimetableGrid timetable={timetable} />
                  </CardContent>
                </Card>

                {/* Legend */}
                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-500 rounded"></div>
                        <span className="text-sm text-gray-700">Theory</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-50 border-l-4 border-green-500 rounded"></div>
                        <span className="text-sm text-gray-700">Lab</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-50 border-l-4 border-purple-500 rounded"></div>
                        <span className="text-sm text-gray-700">Project</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-cyan-50 border-l-4 border-cyan-500 rounded"></div>
                        <span className="text-sm text-gray-700">Tutorial</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-50 border-l-4 border-yellow-500 rounded"></div>
                        <span className="text-sm text-gray-700">Activity</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No classes assigned yet. Contact your department for class assignments.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
};

export default FacultyIndividualTimetable;
