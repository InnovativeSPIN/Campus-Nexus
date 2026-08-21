import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/student/components/ui/card';
import { Alert, AlertDescription } from '@/pages/student/components/ui/alert';
import { Loader2, AlertCircle, User, Download } from 'lucide-react';
import { toast } from '@/pages/student/hooks/use-toast';

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
  type: string;
}

interface Faculty {
  id: number;
  name: string;
  email: string;
}

interface Slot {
  id: number;
  day: string;
  period: Period;
  subject: Subject | null;
  faculty: Faculty | null;
  sessionType: string;
  room: string;
  notes: string;
  isAlteration?: boolean;
}

interface TimetableMaster {
  id: number;
  class: { id: number; name: string; program: string; semester: number };
  department: { id: number; name: string; code: string };
  academicYear: string;
  semester: number;
  semesterType: string;
  batch: string;
  roomNo: string;
  effectiveFrom: string;
  classCoordinator: Faculty;
  assistantCoordinator?: Faculty;
  timetableIncharge: Faculty;
  breakPeriodIds?: number[];
}

interface TimetableData {
  student: { id: number; name: string; rollNo: string };
  timetableMaster: TimetableMaster;
  slots: Slot[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const STANDARD_PERIODS: Period[] = [
  { id: 1, label: 'I', startTime: '09:30 AM', endTime: '10:20 AM' },
  { id: 2, label: 'II', startTime: '10:20 AM', endTime: '11:10 AM' },
  { id: 3, label: 'Tea Break', startTime: '11:10 AM', endTime: '11:30 AM' },
  { id: 4, label: 'III', startTime: '11:30 AM', endTime: '12:25 PM' },
  { id: 5, label: 'Lunch', startTime: '12:25 PM', endTime: '01:10 PM' },
  { id: 6, label: 'IV', startTime: '01:10 PM', endTime: '02:00 PM' },
  { id: 7, label: 'V', startTime: '02:00 PM', endTime: '02:50 PM' },
  { id: 8, label: 'Short Break', startTime: '02:50 PM', endTime: '03:10 PM' },
  { id: 9, label: 'VI', startTime: '03:10 PM', endTime: '04:00 PM' },
  { id: 10, label: 'VII', startTime: '04:00 PM', endTime: '04:45 PM' },
];

const BREAK_TIMINGS = [
  { afterPeriodLabel: 'II', label: 'Break', startTime: '11:10 AM', endTime: '11:30 AM' },
  { afterPeriodLabel: 'III', label: 'Lunch', startTime: '12:25 PM', endTime: '01:10 PM' },
  { afterPeriodLabel: 'V', label: 'Break', startTime: '02:50 PM', endTime: '03:15 PM' },
];

// Build the display sequence: periods interleaved with breaks
type DisplayColumn =
  | { type: 'period'; period: Period }
  | { type: 'break'; label: string; startTime: string; endTime: string };

const buildDisplayColumns = (periods: Period[]): DisplayColumn[] => {
  const columns: DisplayColumn[] = [];
  periods.forEach(period => {
    columns.push({ type: 'period', period });
    const brk = BREAK_TIMINGS.find(b => b.afterPeriodLabel === period.label);
    if (brk) {
      columns.push({ type: 'break', label: brk.label, startTime: brk.startTime, endTime: brk.endTime });
    }
  });
  return columns;
};

const StudentClassTimetable: React.FC = () => {
  const { authToken } = useAuth();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timetableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authToken) {
      fetchTimetable();
    }
  }, [authToken]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/timetable-display/my-class-timetable', {
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
      console.log('[TIMETABLE] Fetched data:', data);

      setTimetable(data.data);
      toast({
        title: '✅ Timetable Loaded',
        description: 'Your class timetable has been loaded successfully'
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch timetable';
      setError(errorMsg);
      toast({
        title: '❌ Error',
        description: errorMsg,
        variant: 'destructive'
      });
      console.error('[TIMETABLE] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTimetable = async () => {
    if (!timetableRef.current || !timetable) return;

    try {
      // Dynamically load html2pdf from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

      script.onload = () => {
        const element = timetableRef.current;
        if (!element) return;

        const opt = {
          margin: 10,
          filename: `${timetable.student.rollNo}-timetable.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
        };

        const html2pdf = (window as any).html2pdf;
        html2pdf().set(opt).from(element).save();

        toast({
          title: '✅ Download Started',
          description: 'Your timetable is being downloaded as PDF'
        });
      };

      script.onerror = () => {
        throw new Error('Failed to load PDF library');
      };

      document.body.appendChild(script);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to download timetable';
      toast({
        title: '❌ Error',
        description: errorMsg,
        variant: 'destructive'
      });
      console.error('[DOWNLOAD] Error:', err);
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
      <div className="p-6 max-w-4xl mx-auto">
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

  if (!timetable) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No timetable found for your class</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get all unique period IDs and details from the slots
  const periodMap = new Map<number, Period>();
  timetable.slots.forEach(s => {
    if (s.period) {
      periodMap.set(s.period.id, s.period);
    }
  });

  // Sort the period slots in order of ID (typically 1 to 10)
  const allPeriods = Array.from(periodMap.values()).sort((a, b) => a.id - b.id);
  const periodsToUse = allPeriods.length > 0 ? allPeriods : STANDARD_PERIODS;

  const breakPeriodIds = timetable.timetableMaster.breakPeriodIds || [3, 5, 8];

  const ROMAN_MAP = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  const buildDisplayColumns = (periods: Period[]): DisplayColumn[] => {
    return periods.map(period => {
      const slotsForPeriod = timetable.slots.filter(s => s.period?.id === period.id);
      const hasTeachingSlot = slotsForPeriod.some(
        s => (s.subject || s.sessionType === 'theory' || s.sessionType === 'lab') && s.sessionType !== 'break'
      );
      const breakSlot = slotsForPeriod.find(s => s.sessionType === 'break');
      const isBreak = !hasTeachingSlot && (!!breakSlot || (period as any).isBreak || breakPeriodIds.includes(period.id));

      if (isBreak) {
        let label = (breakSlot as any)?.notes || period.label;
        if (!label || label.trim() === "" || label.startsWith("Period")) {
          label = "Break";
        }
        return {
          type: 'break',
          label,
          startTime: period.startTime,
          endTime: period.endTime
        };
      } else {
        let cleanLabel = period.label;
        if (!cleanLabel || cleanLabel.toLowerCase().includes('break') || cleanLabel.toLowerCase().includes('lunch')) {
          cleanLabel = ROMAN_MAP[period.id] || `Period ${period.id}`;
        }
        return {
          type: 'period',
          period: {
            ...period,
            label: cleanLabel
          }
        };
      }
    });
  };

  const displayCols = buildDisplayColumns(periodsToUse);

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
      case 'break':
        return 'bg-gray-50 border-l-4 border-gray-500 text-gray-900';
      case 'theory':
      default:
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-900';
    }
  };

  const getName = (entity: any) => {
    if (!entity) return 'N/A';
    if (typeof entity === 'string') return entity;
    return (
      entity.name ||
      entity.Name ||
      entity.full_name ||
      entity.code ||
      entity.title ||
      'N/A'
    );
  };

  return (
    <div className="p-3 max-w-7xl mx-auto space-y-3" ref={timetableRef}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Class Timetable</h1>
            <p className="text-sm text-gray-600">Academic Year {timetable.timetableMaster.academicYear} - Semester {timetable.timetableMaster.semester}</p>
          </div>
          <button
            onClick={downloadTimetable}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-3 h-3" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card>
          <CardContent className="pt-3 pb-3 px-3">
            <p className="text-xs text-gray-600">Class</p>
            <p className="text-sm font-semibold">{timetable?.timetableMaster?.class?.name || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-3">
            <p className="text-xs text-gray-600">Roll No</p>
            <p className="text-sm font-semibold">{timetable?.student?.rollNo || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-3">
            <p className="text-xs md:text-sm text-gray-600">Department</p>
            <p className="text-sm md:text-base font-semibold">
              {getName(timetable?.timetableMaster?.department)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 px-3">
            <p className="text-xs text-gray-600">Batch</p>
            <p className="text-sm font-semibold">{timetable?.timetableMaster?.batch || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Coordinator Info */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Class Administration</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">Class Coordinator</p>
                <p className="text-xs font-semibold">
                  {getName(timetable?.timetableMaster?.classCoordinator) === 'N/A'
                    ? 'Not assigned'
                    : getName(timetable?.timetableMaster?.classCoordinator)}
                </p>
                <p className="text-xs text-gray-500">
                  {timetable?.timetableMaster?.classCoordinator?.email || 'Not assigned'}
                </p>
              </div>
            </div>

            {timetable?.timetableMaster?.assistantCoordinator && (
              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Assistant Coordinator</p>
                  <p className="text-xs font-semibold">
                    {getName(timetable?.timetableMaster?.assistantCoordinator)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {timetable?.timetableMaster?.assistantCoordinator?.email || 'Not assigned'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Timetable Grid - Days on Left, Periods on Top */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Desktop table (md+) */}
          <div className="hidden md:block border rounded-lg border-gray-200 overflow-x-auto">
            {(() => {
              return (
                <table className="w-full border-collapse text-xs" style={{ minWidth: '900px' }}>
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <th className="px-2 py-1.5 text-center font-semibold text-blue-900 bg-gray-50/50 text-xs" style={{ width: '70px', minWidth: '70px' }}>Day</th>
                      {displayCols.map((col, colIdx) => (
                        col.type === 'period' ? (
                          <th key={`period-${colIdx}`} className="px-1 py-1.5 text-center font-semibold text-blue-900 border-l border-blue-100">
                            <div className="font-bold text-xs">{col.period.label}</div>
                            <div className="text-[10px] text-gray-500 font-normal mt-0.5 leading-tight whitespace-nowrap">
                              {col.period.startTime} - {col.period.endTime}
                            </div>
                          </th>
                        ) : (
                          <th key={`break-${colIdx}`} className="px-1 py-1.5 text-center font-semibold border-l border-amber-200 bg-amber-50/80" style={{ width: '55px', minWidth: '55px' }}>
                            <div className="font-bold text-[10px] text-amber-700">{col.label}</div>
                            <div className="text-[9px] text-amber-600 font-normal mt-0.5 leading-tight whitespace-nowrap">
                              {col.startTime}<br />{col.endTime}
                            </div>
                          </th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-b border-gray-200 hover:bg-gray-50/50">
                        <td className="px-2 py-2 font-semibold text-gray-800 bg-gray-50 text-center text-xs border-r border-gray-200" style={{ width: '70px' }}>
                          {day.substring(0, 3)}
                        </td>
                        {displayCols.map((col, colIdx) => {
                          if (col.type === 'break') {
                            return (
                              <td key={`${day}-break-${colIdx}`} className="border-l border-amber-200 bg-amber-50/40 text-center align-middle" style={{ width: '55px' }}>
                                <div className="text-[9px] text-amber-600 font-medium py-1">☕</div>
                              </td>
                            );
                          }

                          const period = col.period;
                          const slot = timetable.slots.find(
                            s => s.day === day && s.period?.id === period.id
                          );

                          return (
                            <td
                              key={`${day}-${colIdx}`}
                              className="p-1 border-l border-gray-200 align-top"
                              title={slot ? (
                                slot.sessionType === 'break'
                                  ? `Break: ${slot.notes || 'No details'}`
                                  : slot.subject
                                    ? `${slot.subject.name} (${slot.subject.code})\nFaculty: ${slot.isAlteration ? 'Sub: ' : ''}${slot.faculty?.name || 'N/A'}\nRoom: ${slot.room || 'N/A'}${slot.notes ? `\nNotes: ${slot.notes}` : ''}`
                                    : undefined
                              ) : undefined}
                            >
                              {slot ? (
                                <div className={`h-full min-h-[72px] p-1.5 rounded ${getSessionColor(slot.sessionType)} flex flex-col justify-between`}>
                                  {slot.sessionType === 'break' ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                      <div className="font-bold text-[10px] text-gray-500">BREAK</div>
                                      {slot.notes && (
                                        <div className="text-[9px] text-gray-400 truncate max-w-full text-center">
                                          {slot.notes}
                                        </div>
                                      )}
                                    </div>
                                  ) : slot.subject ? (
                                    <div className="flex flex-col justify-between h-full text-left gap-0.5">
                                      <div>
                                        <div className="font-bold text-[11px] leading-tight text-gray-900 truncate">
                                          {slot.subject.code}
                                        </div>
                                        <div className="text-[10px] text-gray-800 leading-snug line-clamp-2 mt-0.5" title={slot.subject.name}>
                                          {slot.subject.name}
                                        </div>
                                      </div>
                                      <div>
                                        <div className={`text-[9px] truncate mt-0.5 leading-none ${slot.isAlteration ? 'text-amber-600 font-bold' : 'text-gray-600'}`}>
                                          {slot.faculty ? (
                                            slot.isAlteration ? `Sub: ${slot.faculty.name}` : slot.faculty.name
                                          ) : ''}
                                        </div>
                                        <div className="mt-0.5 flex items-center justify-between text-[9px] leading-none opacity-85">
                                          <span className="font-semibold text-blue-800">
                                            {slot.room ? `Rm:${slot.room}` : ''}
                                          </span>
                                          <span className="font-mono px-0.5 bg-white/60 rounded text-[8px] tracking-tight">
                                            {slot.sessionType?.toUpperCase().substring(0, 3)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-gray-300 text-center py-2">-</div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-gray-300 text-center py-2">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>

          {/* Mobile view (sm) */}
          <div className="md:hidden space-y-2">
            {DAYS.map(day => {
              return (
                <div key={day} className="border rounded-lg border-gray-200">
                  <div className="px-3 py-2 bg-blue-50 text-sm font-semibold text-blue-900">{day}</div>
                  <div className="px-3 py-2 space-y-2">
                    {displayCols.map((col, colIdx) => {
                      if (col.type === 'break') {
                        return (
                          <div key={`${day}-break-${colIdx}`} className="flex items-center gap-2 px-2 py-1.5 rounded bg-amber-50 border border-amber-200/70">
                            <span className="text-xs font-semibold text-amber-700">☕ {col.label}</span>
                            <span className="text-[11px] text-amber-600 ml-auto">{col.startTime} - {col.endTime}</span>
                          </div>
                        );
                      }

                      const period = col.period;
                      const slot = timetable.slots.find(
                        s => s.day === day && s.period?.id === period.id
                      );

                      return (
                        <div key={`${day}-${colIdx}`} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="font-medium">Period {period.label}</div>
                            <div>{period.startTime} - {period.endTime}</div>
                          </div>
                          {slot ? (
                            <div className={`space-y-0.5 p-2 rounded text-sm ${getSessionColor(slot.sessionType)}`}>
                              {slot.sessionType === 'break' ? (
                                <>
                                  <div className="font-semibold">{slot.notes || 'Break'}</div>
                                  <div className="text-xs font-mono bg-white/50 px-1 py-0.5 rounded inline-block">
                                    BREAK
                                  </div>
                                </>
                              ) : slot.subject ? (
                                <>
                                  <div className="font-semibold">{slot.subject.code}</div>
                                  <div className="text-sm">{slot.subject.name}</div>
                                  <div className="text-xs font-mono bg-white/50 px-1 py-0.5 rounded inline-block">
                                    {slot.sessionType.toUpperCase().substring(0, 3)}
                                  </div>
                                  {slot.faculty && (
                                    <div className={`text-xs ${slot.isAlteration ? 'text-amber-700 font-bold' : 'opacity-75'}`}>
                                      {slot.isAlteration ? `Sub: ${slot.faculty.name}` : slot.faculty.name}
                                    </div>
                                  )}
                                  {slot.room && <div className="text-xs opacity-75">Rm:{slot.room}</div>}
                                  {slot.notes && <div className="text-xs opacity-75 italic">{slot.notes}</div>}
                                </>
                              ) : (
                                <div className="text-xs text-gray-400">-</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-300">-</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-gray-50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Session Types</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-blue-50 border-l-3 border-blue-500 rounded"></div>
              <span className="text-xs text-gray-700">Theory</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-green-50 border-l-3 border-green-500 rounded"></div>
              <span className="text-xs text-gray-700">Lab</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-purple-50 border-l-3 border-purple-500 rounded"></div>
              <span className="text-xs text-gray-700">Project</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-cyan-50 border-l-3 border-cyan-500 rounded"></div>
              <span className="text-xs text-gray-700">Tutorial</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-yellow-50 border-l-3 border-yellow-500 rounded"></div>
              <span className="text-xs text-gray-700">Activity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        <p>Last updated: {new Date(timetable.timetableMaster.effectiveFrom).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default StudentClassTimetable;
