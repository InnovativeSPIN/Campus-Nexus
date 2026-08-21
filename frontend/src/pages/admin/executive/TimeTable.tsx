import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/admin/superadmin/components/ui/select';
import { Label } from '@/pages/admin/superadmin/components/ui/label';
import {
  Calendar as CalendarIcon,
  Building2,
  User,
  GraduationCap,
  Clock,
  Loader2,
  BookOpen,
  MapPin,
  RefreshCw,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface Department {
  id: number;
  short_name: string;
  full_name: string;
}

interface ClassItem {
  id: number;
  name: string;
  section: string;
  semester?: number;
  department_id?: number;
}

interface FacultyItem {
  faculty_id: number | string;
  Name?: string;
  name?: string;
  email?: string;
  designation?: string;
  faculty_college_code?: string;
}

interface PeriodDisplay {
  id: number;
  label: string;
  time: string;
  isBreak?: boolean;
}

interface TimetableSlotData {
  day: string;
  period_number: number;
  subject_name?: string;
  subject_code?: string;
  faculty_name?: string;
  class_name?: string;
  room?: string;
  session_type?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STANDARD_PERIODS: PeriodDisplay[] = [
  { id: 1, label: 'I', time: '09:30 - 10:20' },
  { id: 2, label: 'II', time: '10:20 - 11:10' },
  { id: 3, label: 'Tea Break', time: '11:10 - 11:30', isBreak: true },
  { id: 4, label: 'III', time: '11:30 - 12:25' },
  { id: 5, label: 'Lunch', time: '12:25 - 13:10', isBreak: true },
  { id: 6, label: 'IV', time: '13:10 - 14:00' },
  { id: 7, label: 'V', time: '14:00 - 14:50' },
  { id: 8, label: 'Tea Break', time: '14:50 - 15:15', isBreak: true },
  { id: 9, label: 'VI', time: '15:15 - 16:00' },
  { id: 10, label: 'VII', time: '16:00 - 16:45' },
];

export default function ExecutiveTimeTable() {
  const [target, setTarget] = useState<'class' | 'faculty'>('class');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Class filter state
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Faculty filter state
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [slots, setSlots] = useState<TimetableSlotData[]>([]);
  const [masterPeriods, setMasterPeriods] = useState<PeriodDisplay[]>([]);
  const [headerInfo, setHeaderInfo] = useState<{ title: string; subtitle: string }>({
    title: 'Executive Timetable View',
    subtitle: 'Select department, target, and class/faculty to view timetable'
  });

  const fetchMasterPeriods = async () => {
    try {
      const response = await fetch('/api/v1/timetable-display/period-slots');
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setMasterPeriods(result.data.map((ps: any) => ({
            id: ps.id,
            label: ps.label,
            time: ps.startTime && ps.endTime ? `${ps.startTime} - ${ps.endTime}` : '',
            isBreak: ps.isBreak
          })));
        }
      }
    } catch (e) {
      console.warn('Error fetching master periods for ExecutiveTimetable:', e);
    }
  };

  const displayPeriods = masterPeriods.length > 0 ? masterPeriods : STANDARD_PERIODS;

  // Fetch departments & master periods on initial load
  useEffect(() => {
    fetchMasterPeriods();
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/v1/departments');
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setDepartments(result.data);
          if (result.data.length > 0) {
            setSelectedDepartment(result.data[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // When selected department changes, fetch relevant classes and faculties
  useEffect(() => {
    if (!selectedDepartment) return;

    // Fetch classes for selected department
    const fetchClassesForDept = async () => {
      try {
        const response = await fetch(`/api/v1/admin/classes?department_id=${selectedDepartment}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setClasses(result.data);
            if (result.data.length > 0) {
              setSelectedClassId(result.data[0].id.toString());
            } else {
              setSelectedClassId('');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    // Fetch faculties for selected department with multi-stage fallback
    const fetchFacultiesForDept = async () => {
      try {
        let response = await fetch(`/api/v1/faculty?department=${selectedDepartment}`);
        let result = await response.json().catch(() => null);

        if (!result || !result.success || !Array.isArray(result.data) || result.data.length === 0) {
          response = await fetch(`/api/v1/faculty/department/${selectedDepartment}`);
          result = await response.json().catch(() => null);
        }

        if (!result || !result.success || !Array.isArray(result.data) || result.data.length === 0) {
          response = await fetch(`/api/v1/faculty?limit=500`);
          result = await response.json().catch(() => null);
          if (result && result.success && Array.isArray(result.data)) {
            const filtered = result.data.filter((f: any) => {
              const dId = String(f.department_id || f.departmentId || f.department?.id || '');
              return dId === String(selectedDepartment);
            });
            if (filtered.length > 0) {
              result.data = filtered;
            }
          }
        }

        if (result && result.success && Array.isArray(result.data)) {
          const normalizedFaculties: FacultyItem[] = result.data.map((f: any) => ({
            faculty_id: f.faculty_id || f.id,
            Name: f.Name || f.name || f.firstName || 'Faculty',
            email: f.email,
            designation: f.designation,
            faculty_college_code: f.faculty_college_code || f.collegeId
          }));
          setFaculties(normalizedFaculties);
          if (normalizedFaculties.length > 0) {
            setSelectedFacultyId(normalizedFaculties[0].faculty_id.toString());
          } else {
            setSelectedFacultyId('');
          }
        } else {
          setFaculties([]);
          setSelectedFacultyId('');
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
        setFaculties([]);
        setSelectedFacultyId('');
      }
    };

    fetchClassesForDept();
    fetchFacultiesForDept();
  }, [selectedDepartment]);

  // Load timetable slots whenever target, department, class, or faculty selection changes
  useEffect(() => {
    if (!selectedDepartment) return;
    loadTimetableData();
  }, [target, selectedDepartment, selectedClassId, selectedFacultyId]);

  const loadTimetableData = async () => {
    if (!selectedDepartment) {
      setSlots([]);
      return;
    }
    setLoading(true);
    const currentDeptObj = departments.find(d => d.id.toString() === selectedDepartment);
    const deptName = currentDeptObj ? (currentDeptObj.short_name || currentDeptObj.full_name) : 'Department';

    try {
      if (target === 'class') {
        const currentClassObj = classes.find(c => c.id.toString() === selectedClassId);
        const className = currentClassObj ? currentClassObj.name : 'Class';

        setHeaderInfo({
          title: `Class Timetable - ${deptName} ${className ? `(${className})` : ''}`,
          subtitle: `Showing schedule for ${className || 'selected class'} under ${currentDeptObj?.full_name || deptName}`
        });

        if (selectedClassId) {
          const response = await fetch(`/api/v1/timetable-display/class/${selectedClassId}`);
          if (response.ok) {
            const result = await response.json();
            const rawSlots = result.slots || (result.data && result.data.slots);
            if (result.success && Array.isArray(rawSlots) && rawSlots.length > 0) {
              const mappedSlots: TimetableSlotData[] = rawSlots.map((s: any) => ({
                day: s.day,
                period_number: s.period?.id || s.period_slot_id || s.hour || 1,
                subject_name: s.subject?.name || s.subject?.subject_name || 'Subject',
                subject_code: s.subject?.code || s.subject?.subject_code || '',
                faculty_name: s.faculty?.name || s.faculty?.Name || s.faculty_name || 'Faculty',
                room: s.room || '',
                session_type: s.sessionType || s.session_type || 'theory'
              }));
              setSlots(mappedSlots);
              setLoading(false);
              return;
            }
          }
        }

        // If no slots exist in database, clear slots (No fake/demo schedule)
        setSlots([]);
      } else {
        // Faculty Target
        const currentFacObj = faculties.find(f => f.faculty_id.toString() === selectedFacultyId);
        const facultyName = currentFacObj ? (currentFacObj.Name || currentFacObj.name) : 'Faculty Member';

        setHeaderInfo({
          title: `Faculty Timetable - ${facultyName}`,
          subtitle: `${currentFacObj?.designation || 'Faculty'} under ${currentDeptObj?.full_name || deptName}`
        });

        if (selectedFacultyId) {
          let response = await fetch(`/api/v1/timetable-display/faculty/${selectedFacultyId}`);
          let result = await response.json().catch(() => null);

          if (!response.ok || !result || !result.success) {
            response = await fetch(`/api/v1/timetable/faculty/${selectedFacultyId}`);
            result = await response.json().catch(() => null);
          }

          if (result && result.success) {
            const rawSlots = result.slots ||
              (result.data && result.data.slots) ||
              (result.data && Array.isArray(result.data) ? result.data : null) ||
              (result.timetables && result.timetables[0] && result.timetables[0].slots);

            if (Array.isArray(rawSlots) && rawSlots.length > 0) {
              const mappedSlots: TimetableSlotData[] = rawSlots.map((s: any) => ({
                day: s.day,
                period_number: s.period?.id || s.period_slot_id || s.hour || 1,
                subject_name: s.subject?.name || s.subject?.subject_name || (typeof s.subject === 'string' ? s.subject : 'Subject'),
                subject_code: s.subject?.code || s.subject?.subject_code || s.subject_code || '',
                class_name: s.class?.name || s.class_name || (s.section ? `${s.department || ''} (${s.section})` : 'Class'),
                room: s.room || '',
                session_type: s.sessionType || s.session_type || 'theory'
              }));
              setSlots(mappedSlots);
              setLoading(false);
              return;
            }
          }
        }

        // If no slots exist in database, clear slots (No fake/demo schedule)
        setSlots([]);
      }
    } catch (error) {
      console.error('Error loading timetable data:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const getSlot = (day: string, periodNumber: number) => {
    return slots.find(s => s.day.toLowerCase() === day.toLowerCase() && s.period_number === periodNumber);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 p-4 max-w-[100vw]">
        {/* Compact Page Header */}
        <div className="flex items-center justify-between gap-4 bg-card border rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Executive Timetable
              </h1>
              <p className="text-xs text-muted-foreground">
                View class and faculty timetables across all departments
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadTimetableData}
            disabled={loading}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Compact Filter Controls Card */}
        <div className="bg-card border rounded-lg p-3 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Target Filter (Class vs Faculty) */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-primary" />
                Target View
              </Label>
              <Select value={target} onValueChange={(val) => setTarget(val as 'class' | 'faculty')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class Timetable</SelectItem>
                  <SelectItem value="faculty">Faculty Timetable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3 text-primary" />
                Department
              </Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.short_name || dept.full_name} ({dept.full_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* If Target is Class Timetable */}
            {target === 'class' && (
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-primary" />
                  Year/Class
                </Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={classes.length > 0 ? "Select Class" : "No classes found"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} {cls.section ? `(${cls.section})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No classes found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* If Target is Faculty Timetable */}
            {target === 'faculty' && (
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-primary" />
                  Faculty Member
                </Label>
                <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={faculties.length > 0 ? "Select Faculty Member" : "No faculty found"} />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.length > 0 ? (
                      faculties.map((fac) => (
                        <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                          {fac.Name || fac.name} {fac.designation ? `(${fac.designation})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No faculty found for this department</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Compact Banner */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 px-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-foreground">{headerInfo.title}</span>
            <span className="text-muted-foreground hidden sm:inline">— {headerInfo.subtitle}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-blue-500/20 border border-blue-500 inline-block" />
              Theory
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500/20 border border-emerald-500 inline-block" />
              Lab
            </span>
          </div>
        </div>

        {/* Timetable Display Area */}
        {loading ? (
          <div className="bg-card border rounded-lg p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading schedule...</p>
          </div>
        ) : slots.length === 0 ? (
          /* Empty state when no timetable exists for the selected filters */
          <div className="bg-card border rounded-lg p-10 text-center flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-muted/60 rounded-full text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No Timetable Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              There is no timetable schedule configured for the selected {target === 'class' ? 'class' : 'faculty member'}.
            </p>
          </div>
        ) : (
          /* Compact Non-Scrollable Timetable Grid */
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="w-full">
              <table className="w-full border-collapse text-left table-fixed">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="p-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px] bg-muted/80">
                      Day / Period
                    </th>
                    {STANDARD_PERIODS.map((period) => (
                      <th
                        key={period.id}
                        className={`p-1.5 text-center border-l border-border ${period.isBreak ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400 w-[70px]' : ''
                          }`}
                      >
                        <div className="font-bold text-[11px] text-foreground">{period.label}</div>
                        <div className="text-[9px] text-muted-foreground font-normal leading-tight">
                          {period.time}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DAYS.map((day) => (
                    <tr key={day} className="hover:bg-muted/20 transition-colors">
                      {/* Day Label */}
                      <td className="p-2 text-xs font-bold text-foreground bg-muted/10 border-r border-border">
                        {day}
                      </td>

                      {/* Period Cells */}
                      {displayPeriods.map((period) => {
                        const slot = getSlot(day, period.id);
                        if (!slot && period.isBreak) {
                          return (
                            <td
                              key={`${day}-${period.id}`}
                              className="p-1 border-l border-border text-center bg-amber-500/5 text-amber-600 dark:text-amber-400"
                            >
                              <span className="text-[10px] font-medium uppercase opacity-70">
                                {period.label}
                              </span>
                            </td>
                          );
                        }

                        if (!slot) {
                          return (
                            <td
                              key={`${day}-${period.id}`}
                              className="p-1.5 border-l border-border text-center text-muted-foreground/30 text-[10px] italic"
                            >
                              —
                            </td>
                          );
                        }

                        const isLab = slot.session_type?.toLowerCase().includes('lab');

                        return (
                          <td
                            key={`${day}-${period.id}`}
                            className={`p-1.5 border-l border-border transition-colors ${isLab
                                ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500'
                                : 'bg-blue-500/5 border-l-2 border-l-blue-500'
                              }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-[11px] text-foreground leading-tight truncate">
                                {slot.subject_name}
                              </div>
                              {slot.subject_code && (
                                <div className="text-[9px] text-muted-foreground font-mono truncate">
                                  {slot.subject_code}
                                </div>
                              )}

                              {target === 'class' ? (
                                slot.faculty_name && (
                                  <div className="text-[10px] text-primary truncate font-medium">
                                    {slot.faculty_name}
                                  </div>
                                )
                              ) : (
                                slot.class_name && (
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate font-medium">
                                    {slot.class_name}
                                  </div>
                                )
                              )}

                              {slot.room && (
                                <div className="text-[9px] text-muted-foreground truncate">
                                  {slot.room}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
