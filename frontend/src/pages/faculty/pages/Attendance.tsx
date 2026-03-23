import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/faculty/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Input } from "@/pages/faculty/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/pages/faculty/components/ui/radio-group";
import { Label } from "@/pages/faculty/components/ui/label";
import { Switch } from "@/pages/faculty/components/ui/switch";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Save,
  History,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/pages/faculty/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  photo?: string;
  attendance?: "present" | "absent" | "leave" | "od";
}

interface AttendanceHistoryRecord {
  id: string;
  date: string;
  subject: string;
  section: string;
  classId: number;
  present: number;
  absent: number;
  leave: number;
  od: number;
  total: number;
}

interface PendingTopic {
  id: number;
  sno: number;
  topic: string;
  periods_required: number;
  periods_taken: number;
  co_number?: string;
  btl?: string;
}

interface Slot {
  id: string;
  subjectId: string | number;
  subjectName: string;
  subjectCode: string;
  periodId: string | number;
  periodLabel: string;
  startTime: string;
  endTime: string;
  classSectionId: number;
  className: string;
  classSection: string;
  slotId: string | number;
  masterSlotId?: number;
  academicYear?: string;
  semester?: number;
  sessionType?: string;
  isLabSession?: boolean;
  labGroup?: string;
  facultyId?: number;
  batch?: string;
}

export default function Attendance() {
  const { authToken, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDigits, setBulkDigits] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<number, any>>({});

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  
  const [slotStudents, setSlotStudents] = useState<Student[]>([]);

  const [locked, setLocked] = useState(false);
  const [digitSearch] = useState("");
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [topicCovered, setTopicCovered] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryRecord[]>([]);
  const [historyClassFilter, setHistoryClassFilter] = useState<string>("all");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState<string>("");

  // Coverage Tracking states
  const [coverageTopics, setCoverageTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [coverageStatus, setCoverageStatus] = useState<"completed" | "deviation">("completed");
  const [deviationReason, setDeviationReason] = useState("");
  const [coverageDate, setCoverageDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [coverageNotes, setCoverageNotes] = useState("");
  const [coverageSubmitting, setCoverageSubmitting] = useState(false);
  const [coverageSuccess, setCoverageSuccess] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/v1/attendance/faculty/timetable/${selectedDate}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(data => { 
        if (data.success && data.data) { 
          setRawSlots(data.data.slots || []); 
          setStudentsByClass(data.data.studentsByClass || {});
          setSelectedSubjectId("");
          setSelectedPeriodId("");
        } else {
          setRawSlots([]);
          setStudentsByClass({});
        }
      })
      .catch(console.error);
  }, [selectedDate, authToken]);

  // Unique subjects for this day (derived from rawSlots)
  const subjects = useMemo(() => {
    const unique = new Map();
    rawSlots.forEach(s => {
      if (s.subjectId && !unique.has(s.subjectId)) {
        unique.set(s.subjectId, {
          id: s.subjectId,
          name: s.subjectName,
          code: s.subjectCode
        });
      }
    });
    return Array.from(unique.values());
  }, [rawSlots]);

  // Periods for the selected subject on this day
  const periods = useMemo(() => {
    if (!selectedSubjectId) return [];
    return rawSlots
      .filter(s => s.subjectId?.toString() === selectedSubjectId.toString())
      .map(s => ({
        id: s.periodId,
        label: s.periodLabel,
        startTime: s.startTime,
        endTime: s.endTime,
        classSectionId: s.classSectionId,
        className: s.className,
        classSection: s.classSection,
        slotId: s.slotId
      }));
  }, [selectedSubjectId, rawSlots]);

  // Active slot — determined by subject + period
  const slotInfo = useMemo(() => {
    if (!selectedSubjectId || !selectedPeriodId) return null;
    return rawSlots.find(s =>
      s.subjectId?.toString() === selectedSubjectId.toString() &&
      s.periodId?.toString() === selectedPeriodId.toString()
    ) || null;
  }, [selectedSubjectId, selectedPeriodId, rawSlots]);

  // Reset period when subject changes
  useEffect(() => {
    setSelectedPeriodId("");
  }, [selectedSubjectId]);

  // Load coverage topics when slotInfo changes (has both subject and class)
  useEffect(() => {
    if (slotInfo && selectedSubjectId && selectedPeriodId) {
      loadCoverageTopics(selectedSubjectId, slotInfo.classSectionId);
      setSelectedTopicId("");
      setSelectedTopic(null);
      setCoverageStatus("completed");
      setDeviationReason("");
      setCoverageNotes("");
      setCoverageSuccess("");
    }
  }, [slotInfo, selectedSubjectId, selectedPeriodId]);

  useEffect(() => {
    if (slotInfo) {
      const classId = slotInfo.classSectionId;
      const students = studentsByClass[classId] || [];
      setSlotStudents(students.map((s: any) => ({
        id: s.id.toString(),
        studentId: s.studentId || s.student_id || "",
        firstName: s.firstName || s.first_name || s.name || "",
        lastName: s.lastName || s.last_name || "",
        rollNumber: s.rollNumber || s.roll_number || "",
        photo: s.photo || s.photo_path || ""
      })));

      // Fetch pending topics for this subject and class
      const loadPendingTopics = async () => {
        try {
          setLoadingTopics(true);
          const response = await fetch(
            `/api/v1/faculty/academics/course-plans/pending?subjectId=${slotInfo.subjectId}&classId=${classId}`,
            { headers: { 'Authorization': `Bearer ${authToken}` } }
          );
          const topicsData = await response.json();
          if (topicsData.success && Array.isArray(topicsData.data)) {
            setPendingTopics(topicsData.data);
            // Auto-select first pending topic if available
            if (topicsData.data.length > 0) {
              setSelectedLessonPlanId(topicsData.data[0].id.toString());
            } else {
              setSelectedLessonPlanId("");
            }
          } else {
            setPendingTopics([]);
            setSelectedLessonPlanId("");
          }
        } catch (err) {
          console.warn('Could not load pending topics:', err);
          setPendingTopics([]);
          setSelectedLessonPlanId("");
        } finally {
          setLoadingTopics(false);
        }
      };

      loadPendingTopics();

      // Load existing attendance for this date + class + period
      const attendanceQuery = new URLSearchParams({
        class: String(classId),
        date: selectedDate,
        subject: String(slotInfo.subjectId),
        period: String(slotInfo.periodId),
      });

      fetch(`/api/v1/attendance?${attendanceQuery.toString()}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
        .then(r => r.json())
        .then(response => {
          if (response.success && response.data) {
            const attendanceRecord = response.data.find((r: any) =>
              r.period === slotInfo.periodId ||
              r.period === slotInfo.periodId?.toString() ||
              r.subjectId === slotInfo.subjectId
            );
            if (attendanceRecord && attendanceRecord.students) {
              const marks: Record<string, string> = {};
              attendanceRecord.students.forEach((m: any) => {
                marks[m.studentId?.toString()] = m.status;
              });
              setAttendanceData(marks);
              setTopicCovered(attendanceRecord.remarks || "");
              // If this record has a lesson_plan_id, select it
              if (attendanceRecord.lesson_plan_id) {
                setSelectedLessonPlanId(attendanceRecord.lesson_plan_id.toString());
              }
              setLocked(true);
              return;
            }
          }
          setAttendanceData({});
          setTopicCovered("");
          setLocked(!isToday);
        })
        .catch(console.error);
    } else {
      setSlotStudents([]);
      setAttendanceData({});
      setPendingTopics([]);
      setSelectedLessonPlanId("");
      setLocked(!isToday);
    }
  }, [slotInfo, studentsByClass, selectedDate, authToken, isToday]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleSave = async (showSummary = false) => {
    if (!slotInfo) return;

    const studentsArray = slotStudents.map(student => ({
      studentId: parseInt(student.id),
      status: attendanceData[student.id] || 'absent',
      remarks: topicCovered
    }));

    try {
      const response = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          classId: slotInfo.classSectionId,
          subjectId: slotInfo.subjectId,
          facultyId: slotInfo.facultyId,
          attendanceDate: selectedDate,
          periodSlotId: slotInfo.periodId,
          periodNumber: Number(slotInfo.periodLabel),
          masterSlotId: slotInfo.masterSlotId,
          academicYear: slotInfo.academicYear,
          semester: slotInfo.semester,
          sessionType: slotInfo.sessionType || 'theory',
          isLabSession: Boolean(slotInfo.isLabSession),
          labGroup: slotInfo.labGroup || null,
          lesson_plan_id: selectedLessonPlanId ? parseInt(selectedLessonPlanId) : null,
          students: studentsArray
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setLocked(true);
        if (showSummary) {
          setShowAttendanceSummary(true);
        }
        toast.success("Attendance marked successfully!");
      } else {
        toast.error(result.message || "Failed to save attendance");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving attendance");
    }
  };

  const handleMarkAll = (checked: boolean) => {
    if (locked) return;
    setMarkAllPresent(checked);
    if (checked) {
      const allPresent: Record<string, string> = {};
      slotStudents.forEach((s) => {
        allPresent[s.id] = "present";
      });
      setAttendanceData(allPresent);
    } else {
      setAttendanceData({});
    }
  };

  const handleAttendanceChange = (studentId: string, value: string) => {
    if (locked) return;
    setAttendanceData((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleApplyBulk = () => {
    setBulkError("");
    setBulkSuccess("");

    if (!bulkDigits.trim()) {
      setBulkError("Please enter at least one 2-digit number");
      return;
    }

    if (!bulkStatus) {
      setBulkError("Please select a status");
      return;
    }

    const digits = bulkDigits
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const validDigits: string[] = [];
    for (const digit of digits) {
      if (!/^\d{2}$/.test(digit)) {
        setBulkError(`Invalid format: "${digit}" must be a 2-digit number (01-99)`);
        return;
      }
      validDigits.push(digit);
    }

    const newAttendance = { ...attendanceData };
    let matchedCount = 0;

    slotStudents.forEach((student) => {
      const lastTwoDigits = student.rollNumber.slice(-2);
      if (validDigits.includes(lastTwoDigits)) {
        newAttendance[student.id] = bulkStatus;
        matchedCount++;
      } else {
        if (!newAttendance[student.id]) {
          newAttendance[student.id] = "present";
        }
      }
    });

    if (matchedCount === 0) {
      setBulkError("No matching students found");
      return;
    }

    setAttendanceData(newAttendance);
    setBulkSuccess(`Applied "${bulkStatus}" to ${matchedCount} student(s). Others marked as Present.`);
    setBulkDigits("");
    setBulkStatus("");
    setTimeout(() => setBulkSuccess(""), 3000);
  };

  const filteredStudents = slotStudents.filter(
    (s) => {
      if (digitSearch && (digitSearch.length === 2 || digitSearch.length === 3)) {
        return s.rollNumber.slice(-3).endsWith(digitSearch);
      }
      return (
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const presentCount = Object.values(attendanceData).filter((v) => v === "present").length;
  const absentCount = Object.values(attendanceData).filter((v) => v === "absent").length;
  const leaveCount = Object.values(attendanceData).filter((v) => v === "leave").length;
  const odCount = Object.values(attendanceData).filter((v) => v === "od").length;

  const fetchAttendanceHistory = async () => {
    if (!authToken) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const params = new URLSearchParams();
      const facultyId = Number(user?.id);

      if (Number.isFinite(facultyId) && facultyId > 0) {
        params.set("faculty", String(facultyId));
      }

      if (historyClassFilter !== "all") {
        params.set("class", historyClassFilter);
      }

      if (historyDateFrom) {
        params.set("startDate", historyDateFrom);
      }

      if (historyDateTo) {
        params.set("endDate", historyDateTo);
      }

      params.set("limit", "500");

      const response = await fetch(`/api/v1/attendance?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load attendance history");
      }

      const rows = Array.isArray(result.data) ? result.data : [];
      const grouped = new Map<string, AttendanceHistoryRecord>();

      rows.forEach((row: any) => {
        const key = [
          row.class_id,
          row.subject_id,
          row.period_slot_id,
          row.attendance_date,
        ].join("|");

        const className = row.class?.name || `Class ${row.class_id}`;
        const classSection = row.class?.section ? `-${row.class.section}` : "";

        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            date: row.attendance_date,
            subject: row.subject?.subject_name || `Subject ${row.subject_id}`,
            section: `${className}${classSection}`,
            classId: Number(row.class_id),
            present: 0,
            absent: 0,
            leave: 0,
            od: 0,
            total: 0,
          });
        }

        const entry = grouped.get(key)!;
        const status = String(row.status || "").toLowerCase();

        if (status === "present" || status === "late") {
          entry.present += 1;
        } else if (status === "od") {
          entry.od += 1;
        } else if (status === "medical_leave" || status === "duty_leave") {
          entry.leave += 1;
        } else {
          entry.absent += 1;
        }

        entry.total += 1;
      });

      const records = Array.from(grouped.values()).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setAttendanceHistory(records);
    } catch (error: any) {
      setHistoryError(error?.message || "Failed to load attendance history");
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadCoverageTopics = async (subjectId: string, classId: number) => {
    if (!subjectId || !classId || !authToken) return;
    
    try {
      // Fetch approved course plans for the selected subject and class
      const response = await fetch(
        `/api/v1/faculty/academics/course-plans?subjectId=${subjectId}&classId=${classId}&includePending=false`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const topicsWithUnits = result.data.map((plan: any) => ({
          id: plan.id,
          topic: plan.topic,
          unit_label: plan.unit_label || 'Unassigned',
          periods_required: plan.periods_required || 1,
          periods_taken: plan.periods_taken || 0,
          co_number: plan.co_number,
          btl: plan.btl
        }));
        setCoverageTopics(topicsWithUnits);
        
        // Initialize expanded units - expand all by default
        const uniqueUnits: string[] = [...new Set(topicsWithUnits.map((t: any) => t.unit_label) as string[])];
        const newExpandedUnits: { [key: string]: boolean } = {};
        uniqueUnits.forEach((unit: string) => {
          newExpandedUnits[unit] = true;
        });
        setExpandedUnits(newExpandedUnits);
      }
    } catch (error) {
      console.error('Error loading coverage topics:', error);
      toast.error('Failed to load course topics');
    }
  };

  const groupTopicsByUnit = (topics: any[]): [string, any[]][] => {
    const grouped: { [key: string]: any[] } = {};
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

  const toggleUnit = (unit: string | number): void => {
    setExpandedUnits(prev => ({
      ...prev,
      [String(unit)]: !prev[String(unit)]
    }));
  };

  const handleCoverageSubmit = async () => {
    if (!selectedTopicId || !coverageStatus || !coverageDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setCoverageSubmitting(true);
    try {
      const topic = coverageTopics.find(t => t.id.toString() === selectedTopicId);
      let periodsDelta = 0;
      
      if (coverageStatus === 'completed') {
        periodsDelta = -(topic.periods_required - topic.periods_taken); // Reduce remaining periods
      }
      // If deviation, no period reduction

      const response = await fetch('/api/v1/faculty/academics/coverage-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          lesson_plan_id: selectedTopicId,
          status: coverageStatus,
          coverage_date: coverageDate,
          deviation_reason: coverageStatus === 'deviation' ? deviationReason : null,
          periods_delta: periodsDelta,
          additional_notes: coverageNotes
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setCoverageSuccess(`Topic coverage recorded successfully!`);
        // Reset form
        setSelectedTopicId("");
        setCoverageStatus("completed");
        setDeviationReason("");
        setCoverageNotes("");
        setCoverageDate(new Date().toISOString().split("T")[0]);
        
        setTimeout(() => setCoverageSuccess(""), 3000);
        toast.success("Coverage data submitted!");
      } else {
        toast.error(result.message || "Failed to submit coverage data");
      }
    } catch (error) {
      console.error('Error submitting coverage:', error);
      toast.error("Error submitting coverage data");
    } finally {
      setCoverageSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [authToken, user?.id, historyClassFilter, historyDateFrom, historyDateTo]);

  const historyClassOptions = useMemo(() => {
    const map = new Map<string, string>();
    attendanceHistory.forEach((r) => {
      map.set(String(r.classId), r.section);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [attendanceHistory]);

  const downloadHistoryReport = () => {
    if (attendanceHistory.length === 0) {
      toast.error("No attendance history available to download");
      return;
    }

    const headers = [
      "Date",
      "Class",
      "Subject",
      "Present",
      "OD",
      "Absent",
      "Leave",
      "Total",
      "Attendance %",
    ];

    const csvRows = attendanceHistory.map((row) => {
      const attendancePct = row.total > 0 ? (((row.present + row.od) * 100) / row.total).toFixed(2) : "0.00";
      return [
        row.date,
        row.section,
        row.subject,
        row.present,
        row.od,
        row.absent,
        row.leave,
        row.total,
        attendancePct,
      ];
    });

    const csv = [headers, ...csvRows]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Attendance report downloaded");
  };

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Attendance Management</h1>
          <p className="text-muted-foreground -mt-4">
            Mark and manage student attendance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <IntegratedNotificationBell />
        </div>
      </motion.div>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="mark" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Attendance History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card mb-6"
          >
            {/* Row 1: Date + Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Subject (auto-filtered by day from rawSlots) */}
              <div className="space-y-2">
                <Label>Subject</Label>
                {rawSlots.length > 0 && subjects.length === 0 ? (
                  <p className="text-sm text-destructive pt-2 font-medium">No subjects scheduled on this day</p>
                ) : (
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={subjects.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={subjects.length === 0 ? "No classes this day" : "Select subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Row 2: Class (auto) + Period (filtered by subject) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Class — auto-populated from selected subject, read-only */}
              <div className="space-y-2">
                <Label>Class</Label>
                {selectedSubjectId && periods.length > 0 ? (
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm items-center gap-2">
                    {selectedPeriodId ? (
                      <>                        
                        <span className="font-medium text-foreground">
                          {slotInfo?.className || periods[0]?.className}
                          {(slotInfo?.classSection || periods[0]?.classSection) ? ` — ${slotInfo?.classSection || periods[0]?.classSection}` : ''}
                        </span>
                        {slotInfo?.semester && (
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Sem {slotInfo.semester}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {/* show all unique classes for this subject */}
                        {[...new Set(periods.map(p => `${p.className}${p.classSection ? ` - ${p.classSection}` : ''}`))].join(', ')}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm items-center text-muted-foreground">
                    Auto-filled from subject
                  </div>
                )}
              </div>

              {/* Period */}
              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={selectedPeriodId}
                  onValueChange={setSelectedPeriodId}
                  disabled={periods.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSubjectId ? "Select period" : "Select subject first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        Period {p.label} — {p.startTime} to {p.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Slot Info Banner */}
            {slotInfo && (
              <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Subject</p>
                    <p className="text-foreground font-medium mt-0.5">{slotInfo.subjectName}</p>
                    {slotInfo.subjectCode && <p className="text-xs text-muted-foreground">{slotInfo.subjectCode}</p>}
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Class</p>
                    <p className="text-foreground font-medium mt-0.5">{slotInfo.className}{slotInfo.classSection ? ` - ${slotInfo.classSection}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Semester</p>
                    <p className="text-foreground font-medium mt-0.5">{slotInfo.semester ? `Semester ${slotInfo.semester}` : 'N/A'}</p>
                    {slotInfo.batch && <p className="text-xs text-muted-foreground">Batch {slotInfo.batch}</p>}
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Period</p>
                    <p className="text-foreground font-medium mt-0.5">{slotInfo.periodLabel}</p>
                    <p className="text-xs text-muted-foreground">{slotInfo.startTime} – {slotInfo.endTime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Session</p>
                    <p className="text-foreground font-medium mt-0.5 capitalize">{slotInfo.sessionType || 'theory'}</p>
                    {slotInfo.isLabSession && slotInfo.labGroup && (
                      <p className="text-xs text-muted-foreground">Group {slotInfo.labGroup}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Date</p>
                    <p className="text-foreground font-medium mt-0.5">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-muted-foreground">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Stats & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-4 mb-6"
          >
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20 text-center">
                <p className="text-2xl font-bold text-success">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 text-center">
                <p className="text-2xl font-bold text-warning">{leaveCount}</p>
                <p className="text-xs text-muted-foreground">Leave</p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg border border-info/20 text-center">
                <p className="text-2xl font-bold text-info">{odCount}</p>
                <p className="text-xs text-muted-foreground">OD</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={markAllPresent}
                  onCheckedChange={(v) => { if (!locked) handleMarkAll(v); }}
                  id="mark-all"
                  disabled={locked}
                />
                <Label htmlFor="mark-all" className="text-sm">
                  Mark All Present
                </Label>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleSave(true)}
                disabled={locked || !isToday}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>

              {locked && isToday && (
                <Button
                  variant="outline"
                  onClick={() => setLocked(false)}
                >
                  Reassign
                </Button>
              )}
            </div>
          </motion.div>

          {/* Bulk Mark Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23 }}
            className="widget-card mb-6 p-4 border-2 border-primary/20 bg-primary/5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4">Bulk Mark Attendance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-2 block">Enter Last 2 Digits (comma-separated)</Label>
                <Input
                  placeholder="e.g., 05, 12, 18"
                  value={bulkDigits}
                  onChange={(e) => setBulkDigits(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Select Status</Label>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Choose status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="od">OD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    handleApplyBulk();
                    setTimeout(() => {
                      if (bulkSuccess && !bulkError) {
                        setShowAttendanceSummary(true);
                      }
                    }, 100);
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Apply
                </Button>
              </div>
            </div>
            {bulkError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-xs"
              >
                {bulkError}
              </motion.div>
            )}
            {bulkSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-success/10 border border-success/30 rounded text-success text-xs"
              >
                {bulkSuccess}
              </motion.div>
            )}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative mb-6"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
          </motion.div>

          {/* Student List with Pagination */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="widget-card"
          >
            {/* List Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 border-b bg-muted/30 rounded-t-lg text-sm font-semibold text-muted-foreground">
              <div className="col-span-1"></div>
              <div className="col-span-5">Student Name</div>
              <div className="col-span-3">Roll Number</div>
              <div className="col-span-3 text-right">Attendance</div>
            </div>

            {/* Student Rows */}
            <div className="divide-y">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No students found
                </div>
              ) : (
                filteredStudents
                  .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                  .map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={cn(
                        "grid grid-cols-4 md:grid-cols-12 gap-3 p-4 items-center hover:bg-muted/50 transition-colors",
                        attendanceData[student.id] === "present" && "bg-success/5",
                        attendanceData[student.id] === "absent" && "bg-destructive/5",
                        attendanceData[student.id] === "leave" && "bg-warning/5",
                        attendanceData[student.id] === "od" && "bg-info/5"
                      )}
                    >
                      {/* Avatar */}
                      <div className="col-span-1 flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                          {student.photo}
                        </div>
                      </div>

                      {/* Name and Roll (Mobile shows name only) */}
                      <div className="col-span-3 md:col-span-5">
                        <p className="font-semibold text-sm text-foreground">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{student.rollNumber}</p>
                      </div>

                      {/* Roll Number (Desktop only) */}
                      <div className="hidden md:block col-span-3">
                        <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      </div>

                      {/* Attendance Buttons */}
                      <div className="col-span-3 md:col-span-3">
                        <RadioGroup
                          value={attendanceData[student.id] || ""}
                          onValueChange={(value) => handleAttendanceChange(student.id, value)}
                          className="flex gap-1 justify-end"
                        >
                          <div className="flex-1 md:flex-none">
                            <RadioGroupItem
                              value="present"
                              id={`${student.id}-present`}
                              className="sr-only"
                              disabled={locked}
                            />
                            <Label
                              htmlFor={`${student.id}-present`}
                              className={cn(
                                "flex items-center justify-center gap-0.5 p-1.5 rounded border cursor-pointer transition-all text-xs w-full",
                                locked && "pointer-events-none opacity-60",
                                attendanceData[student.id] === "present"
                                  ? "bg-success text-white border-success"
                                  : "hover:bg-success/10 border-border"
                              )}
                              title="Present"
                            >
                              P
                            </Label>
                          </div>
                          <div className="flex-1 md:flex-none">
                            <RadioGroupItem
                              value="absent"
                              id={`${student.id}-absent`}
                              className="sr-only"
                              disabled={locked}
                            />
                            <Label
                              htmlFor={`${student.id}-absent`}
                              className={cn(
                                "flex items-center justify-center gap-0.5 p-1.5 rounded border cursor-pointer transition-all text-xs w-full",
                                locked && "pointer-events-none opacity-60",
                                attendanceData[student.id] === "absent"
                                  ? "bg-destructive text-white border-destructive"
                                  : "hover:bg-destructive/10 border-border"
                              )}
                              title="Absent"
                            >
                              A
                            </Label>
                          </div>
                          <div className="flex-1 md:flex-none">
                            <RadioGroupItem
                              value="leave"
                              id={`${student.id}-leave`}
                              className="sr-only"
                              disabled={locked}
                            />
                            <Label
                              htmlFor={`${student.id}-leave`}
                              className={cn(
                                "flex items-center justify-center gap-0.5 p-1.5 rounded border cursor-pointer transition-all text-xs w-full",
                                locked && "pointer-events-none opacity-60",
                                attendanceData[student.id] === "leave"
                                  ? "bg-warning text-white border-warning"
                                  : "hover:bg-warning/10 border-border"
                              )}
                              title="Leave"
                            >
                              L
                            </Label>
                          </div>
                          <div className="flex-1 md:flex-none">
                            <RadioGroupItem
                              value="od"
                              id={`${student.id}-od`}
                              className="sr-only"
                              disabled={locked}
                            />
                            <Label
                              htmlFor={`${student.id}-od`}
                              className={cn(
                                "flex items-center justify-center gap-0.5 p-1.5 rounded border cursor-pointer transition-all text-xs w-full",
                                locked && "pointer-events-none opacity-60",
                                attendanceData[student.id] === "od"
                                  ? "bg-info text-white border-info"
                                  : "hover:bg-info/10 border-border"
                              )}
                              title="OD"
                            >
                              OD
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>

            {/* Pagination Controls */}
            {filteredStudents.length > itemsPerPage && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.ceil(filteredStudents.length / itemsPerPage) },
                    (_, i) => i
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(filteredStudents.length / itemsPerPage) - 1,
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage >= Math.ceil(filteredStudents.length / itemsPerPage) - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </motion.div>

          {/* Topic Selection Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="widget-card mt-6 p-6 border-2 border-primary/10"
          >
            <h3 className="text-lg font-semibold mb-4 text-primary">Class Coverage Details</h3>
            
            {/* Topic Dropdown */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm font-medium">Which topic did you teach? *</Label>
              {loadingTopics ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Loading topics...</span>
                </div>
              ) : pendingTopics.length > 0 ? (
                <Select value={selectedLessonPlanId} onValueChange={setSelectedLessonPlanId} disabled={locked}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select a topic to track" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{topic.topic}</span>
                          <span className="text-xs text-muted-foreground">
                            ({topic.periods_taken}/{topic.periods_required} periods)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-info/10 border border-info/30 rounded-md text-sm text-info">
                  No pending topics for this class. Create a course plan in the Academics section first.
                </div>
              )}
            </div>

            {/* Free-form notes (optional) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional details about what was covered today..."
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                className="min-h-[80px] bg-background/50"
                disabled={locked}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleSave(false)}
                disabled={locked || !isToday || !selectedLessonPlanId}
                className="bg-primary hover:bg-primary/90 min-w-[200px]"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Class Coverage
              </Button>
            </div>
          </motion.div>

          {/* Coverage Tracking Section */}
          {slotInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="widget-card mt-8"
            >
              <div className="mb-6">
                <h3 className="section-title flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Syllabus Coverage Tracking
                </h3>
                <p className="text-sm text-muted-foreground">Record which topics were covered in today's class</p>
              </div>

              {coverageSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <p className="text-success font-medium">{coverageSuccess}</p>
                </motion.div>
              )}

              {/* Units and Topics List */}
              {coverageTopics.length > 0 ? (
                <div className="space-y-3">
                  {groupTopicsByUnit(coverageTopics).map(([unit, unitTopics]) => {
                    const isExpanded = expandedUnits[unit] ?? true;
                    
                    return (
                      <div key={unit} className="border border-border rounded-lg overflow-hidden">
                        {/* Unit Header */}
                        <button
                          onClick={() => toggleUnit(unit)}
                          className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 text-left">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-primary" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-primary" />
                            )}
                            <h4 className="font-semibold text-foreground">{unit}</h4>
                          </div>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {unitTopics.length} topic{unitTopics.length !== 1 ? 's' : ''}
                          </span>
                        </button>

                        {/* Topics */}
                        {isExpanded && (
                          <div className="p-4 space-y-3 bg-muted/20">
                            {unitTopics.map((topic) => (
                              <label
                                key={topic.id}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                  selectedTopicId === topic.id.toString()
                                    ? "bg-primary/10 border-primary/40"
                                    : "bg-background border-border hover:border-primary/30"
                                )}
                              >
                                <input
                                  type="radio"
                                  name="coverage-topic"
                                  value={topic.id.toString()}
                                  checked={selectedTopicId === topic.id.toString()}
                                  onChange={(e) => {
                                    setSelectedTopicId(e.target.value);
                                    setSelectedTopic(topic);
                                  }}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{topic.topic}</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
                                    <span>Required: {topic.periods_required}</span>
                                    <span>Taken: {topic.periods_taken}</span>
                                    <span>Remaining: {topic.periods_required - topic.periods_taken}</span>
                                    {topic.co_number && <span>CO: {topic.co_number}</span>}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">No topics available for this subject</p>
                </div>
              )}

              {/* Status Selection and Submission */}
              {selectedTopic && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 rounded-lg bg-muted/30 border-t-2 border-primary"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Status Selection */}
                    <div className="space-y-4">
                      <Label className="font-semibold text-base">Coverage Status *</Label>
                      <RadioGroup value={coverageStatus} onValueChange={(value) => setCoverageStatus(value as "completed" | "deviation")}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer">
                          <RadioGroupItem value="completed" id="cov-completed" />
                          <Label htmlFor="cov-completed" className="cursor-pointer flex-1">
                            <span className="font-medium inline-flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success" />
                              Completed
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">Topic was fully covered</p>
                          </Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-warning/50 cursor-pointer">
                          <RadioGroupItem value="deviation" id="cov-deviation" />
                          <Label htmlFor="cov-deviation" className="cursor-pointer flex-1">
                            <span className="font-medium inline-flex items-center gap-2">Could not complete</span>
                            <p className="text-xs text-muted-foreground mt-1">Topic requires rescheduling</p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Right: Topic Details */}
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <h5 className="font-semibold text-foreground mb-3">Coverage Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Topic:</span>
                          <span className="font-medium">{selectedTopic.topic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit:</span>
                          <span className="font-medium">{selectedTopic.unit_label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Periods Required:</span>
                          <span className="font-medium">{selectedTopic.periods_required}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Periods Taken:</span>
                          <span className="font-medium">{selectedTopic.periods_taken}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Remaining:</span>
                          <span className="font-bold text-primary">{selectedTopic.periods_required - selectedTopic.periods_taken}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deviation Reason (if selected) */}
                  {coverageStatus === 'deviation' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-4 bg-warning/5 border border-warning/30 rounded-lg"
                    >
                      <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <span className="text-warning">*</span> Reason for Deviation
                      </Label>
                      <Textarea
                        placeholder="E.g., Unexpected leave, Technical issues, Curriculum changes, etc."
                        value={deviationReason}
                        onChange={(e) => setDeviationReason(e.target.value)}
                        className="min-h-20"
                      />
                    </motion.div>
                  )}

                  {/* Additional Notes */}
                  <div className="mt-6 space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Optional: Add any notes about this topic coverage..."
                      value={coverageNotes}
                      onChange={(e) => setCoverageNotes(e.target.value)}
                      className="min-h-16"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleCoverageSubmit}
                    disabled={coverageSubmitting || (coverageStatus === 'deviation' && !deviationReason)}
                    className="w-full mt-6"
                  >
                    {coverageSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Coverage Data...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit Coverage for {selectedTopic.topic}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title flex items-center gap-2 mb-0">
                <History className="w-5 h-5 text-primary" />
                Recent Attendance Records
              </h3>
              <Button variant="outline" size="sm" onClick={downloadHistoryReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={historyClassFilter} onValueChange={setHistoryClassFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {historyClassOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={historyDateFrom}
                  onChange={(e) => setHistoryDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={historyDateTo}
                  onChange={(e) => setHistoryDateTo(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setHistoryClassFilter("all");
                    setHistoryDateFrom("");
                    setHistoryDateTo("");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>

            {historyError && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {historyError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Subject</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Section</th>
                    <th className="text-center p-3 text-sm font-semibold text-success">Present</th>
                    <th className="text-center p-3 text-sm font-semibold text-info">OD</th>
                    <th className="text-center p-3 text-sm font-semibold text-destructive">Absent</th>
                    <th className="text-center p-3 text-sm font-semibold text-warning">Leave</th>
                    <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Total</th>
                    <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground">Loading attendance history...</td>
                    </tr>
                  ) : attendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-sm text-muted-foreground">No attendance records found for selected filters.</td>
                    </tr>
                  ) : attendanceHistory.map((record, index) => (
                    <motion.tr
                      key={record.date + record.subject}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 text-sm font-medium">{record.date}</td>
                      <td className="p-3 text-sm">{record.subject}</td>
                      <td className="p-3 text-sm">{record.section}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-success/10 text-success rounded-full text-sm">
                          {record.present}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-info/10 text-info rounded-full text-sm">
                          {record.od}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
                          {record.absent}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-sm">
                          {record.leave}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm font-medium">{record.total}</td>
                      <td className="p-3 text-center text-sm font-semibold">
                        {record.total > 0 ? (((record.present + record.od) * 100) / record.total).toFixed(1) : "0.0"}%
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


