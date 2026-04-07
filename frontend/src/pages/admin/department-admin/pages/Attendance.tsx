import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/pages/admin/department-admin/components/ui/radio-group";
import { Label } from "@/pages/admin/department-admin/components/ui/label";
import { Switch } from "@/pages/admin/department-admin/components/ui/switch";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import {
  ClipboardCheck,
  Search,
  CheckCircle2,
  Save,
  History,
} from "lucide-react";
import { toast } from '@/components/ui/sonner';
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const apiFetch = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `API Error: ${res.statusText}`);
  }
  return res.json();
};

interface Student {
  id: string;
  rollNo: string;
  name: string;
  photo: string;
  attendance?: "present" | "absent" | "leave" | "od";
}

export default function Attendance() {  const { authToken, user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDigits, setBulkDigits] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [locked, setLocked] = useState(false);
  const [previouslyMarkedBy, setPreviouslyMarkedBy] = useState<string | null>(null);
  const [digitSearch] = useState("");
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [topicCovered, setTopicCovered] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  
  const [rawSlots, setRawSlots] = useState<any[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<any>({});

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  
  const [slotStudents, setSlotStudents] = useState<Student[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyClassFilter, setHistoryClassFilter] = useState<string>("all");
  const [historySubjectFilter, setHistorySubjectFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [attendanceReportLoading, setAttendanceReportLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [historyStartDate, setHistoryStartDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [historyEndDate, setHistoryEndDate] = useState<string>(today);

  const isToday = selectedDate === today;
  const userRole = user?.role || 'faculty';
  const isDepartmentAdmin = userRole === 'department-admin';

  const renderHistoryRows = () => {
    if (historyLoading) {
      return (
        <tr>
          <td colSpan={7} className="p-4 text-center">
            Loading attendance history...
          </td>
        </tr>
      );
    }

    if (attendanceHistory.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="p-4 text-center">
            No attendance history found for selected filters.
          </td>
        </tr>
      );
    }

    return attendanceHistory.map((record, index) => (
      <motion.tr
        key={`${record.date}-${record.subject}-${record.className}-${record.period || 'na'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
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
          <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
            {record.absent}
          </span>
        </td>
        <td className="p-3 text-center">
          <span className="px-2 py-1 bg-warning/10 text-warning rounded-full text-sm">
            {record.leave}
          </span>
        </td>
        <td className="p-3 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditHistoryRow(record)}
          >
            Edit
          </Button>
        </td>
      </motion.tr>
    ));
  };

  const handleEditHistoryRow = (record: any) => {
    if (!record.classId || !record.period) {
      toast.error('Cannot edit this record (missing class or period info). Please refine filters.');
      return;
    }

    setSelectedDate(record.date);
    setSelectedClassId(record.classId.toString());
    setSelectedPeriodId(record.period.toString());
    setActiveTab('mark');
    setLocked(false);
    setPreviouslyMarkedBy(null);

    toast.success('Loaded historical session into Attendance tab for editing.');
  };

  const downloadAttendanceReport = async (overall = false) => {
    setAttendanceReportLoading(true);
    try {
      let reportUrl = `/api/v1/attendance?limit=10000`;
      const classFilter = overall ? 'all' : historyClassFilter;
      const subjectFilter = overall ? 'all' : historySubjectFilter;

      if (classFilter && classFilter !== 'all') reportUrl += `&class=${classFilter}`;
      if (subjectFilter && subjectFilter !== 'all') reportUrl += `&subject=${subjectFilter}`;
      if (historyStartDate && historyEndDate) reportUrl += `&startDate=${historyStartDate}&endDate=${historyEndDate}`;

      const result = await apiFetch(reportUrl);
      if (!result.success) {
        toast.error(result.message || 'Failed to fetch report data');
        return;
      }

      const entries = result.data || [];
      if (!entries.length) {
        toast.error('No data available for this report');
        return;
      }

      const pivot: Record<string, any> = {};
      entries.forEach((item: any) => {
        const student = item.student || item.studentData || {};
        const studentKey = student.id || `${item.student_id}-${item.rollNumber}`;
        if (!pivot[studentKey]) {
          pivot[studentKey] = {
            register: student.rollNumber || student.studentId || 'N/A',
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A',
            department: student.department || item.class?.name || item.class_name || 'N/A',
            year: item.class?.academic_year || item.academic_year || 'N/A',
            present: 0,
            absent: 0,
          };
        }

        const status = (item.status || '').toLowerCase();
        if (status === 'present' || status === 'late' || status === 'od') pivot[studentKey].present += 1;
        else pivot[studentKey].absent += 1;
      });

      const rows = [
        ['Register Number', 'Name', 'Department', 'Year', 'Present', 'Absent'],
        ...Object.values(pivot).map((record: any) => [record.register, record.name, record.department, record.year, record.present, record.absent])
      ];
      const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

      const filenameSuffix = overall ? 'overall' : `${classFilter}-${subjectFilter}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `attendance-report-${filenameSuffix}-${historyStartDate}-${historyEndDate}.csv`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      toast.success('Attendance report downloaded successfully');
    } catch (error) {
      console.error('downloadAttendanceReport error', error);
      toast.error('Error generating attendance report');
    } finally {
      setAttendanceReportLoading(false);
    }
  };

  const downloadAttendanceReportPdf = async (overall = false) => {
    setAttendanceReportLoading(true);
    try {
      let reportUrl = `/api/v1/attendance?limit=10000`;
      const classFilter = overall ? 'all' : historyClassFilter;
      const subjectFilter = overall ? 'all' : historySubjectFilter;

      if (classFilter && classFilter !== 'all') reportUrl += `&class=${classFilter}`;
      if (subjectFilter && subjectFilter !== 'all') reportUrl += `&subject=${subjectFilter}`;
      if (historyStartDate && historyEndDate) reportUrl += `&startDate=${historyStartDate}&endDate=${historyEndDate}`;

      const result = await apiFetch(reportUrl);
      if (!result.success) {
        toast.error(result.message || 'Failed to fetch report data');
        return;
      }

      const entries = result.data || [];
      if (!entries.length) {
        toast.error('No data available for this report');
        return;
      }

      const pivot: Record<string, any> = {};
      entries.forEach((item: any) => {
        const student = item.student || item.studentData || {};
        const studentKey = student.id || `${item.student_id}-${item.rollNumber}`;
        if (!pivot[studentKey]) {
          pivot[studentKey] = {
            register: student.rollNumber || student.studentId || 'N/A',
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A',
            department: student.department || item.class?.name || item.class_name || 'N/A',
            year: item.class?.academic_year || item.academic_year || 'N/A',
            present: 0,
            absent: 0,
          };
        }

        const status = (item.status || '').toLowerCase();
        if (status === 'present' || status === 'late' || status === 'od') pivot[studentKey].present += 1;
        else pivot[studentKey].absent += 1;
      });

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '900px';
      container.style.background = '#fff';
      container.style.color = '#000';
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.opacity = '1';
      container.style.zIndex = '9999';

      const header = document.createElement('div');
      header.style.display = 'block';
      header.style.textAlign = 'center';
      header.style.marginBottom = '14px';

      const titleHeader = document.createElement('div');
      titleHeader.style.fontSize = '18px';
      titleHeader.style.fontWeight = '700';
      titleHeader.textContent = 'Nadar Saraswathi College of Engineering & Technology';
      header.appendChild(titleHeader);

      const subtitle = document.createElement('div');
      subtitle.style.fontSize = '12px';
      subtitle.style.color = '#555';
      subtitle.textContent = 'Approved by AICTE, New Delhi | Affiliated to Anna University, Chennai';
      header.appendChild(subtitle);

      const address = document.createElement('div');
      address.style.fontSize = '11px';
      address.style.color = '#555';
      address.textContent = 'Vadapudupatti, Annanji (PO), Theni - 625 531';
      header.appendChild(address);

      container.appendChild(header);

      const title = document.createElement('h1');
      title.textContent = 'Attendance Report';
      title.style.fontSize = '16px';
      title.style.marginBottom = '6px';
      container.appendChild(title);

      const subheader = document.createElement('p');
      subheader.style.fontSize = '11px';
      subheader.style.marginBottom = '10px';
      subheader.innerHTML = `Class filter: <strong>${classFilter === 'all' ? 'All' : classFilter}</strong><br/>Subject filter: <strong>${subjectFilter === 'all' ? 'All' : subjectFilter}</strong><br/>Date range: <strong>${historyStartDate}</strong> - <strong>${historyEndDate}</strong>`;
      container.appendChild(subheader);

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';

      const headerRow = document.createElement('tr');
      ['Register Number', 'Name', 'Department', 'Year', 'Present', 'Absent'].forEach((col) => {
        const th = document.createElement('th');
        th.style.border = '1px solid #444';
        th.style.padding = '6px';
        th.style.fontSize = '11px';
        th.style.background = '#f2f2f2';
        th.textContent = col;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      Object.values(pivot).forEach((record: any) => {
        const row = document.createElement('tr');
        [record.register, record.name, record.department, record.year, record.present, record.absent].forEach((value) => {
          const td = document.createElement('td');
          td.style.border = '1px solid #444';
          td.style.padding = '6px';
          td.style.fontSize = '10px';
          td.textContent = String(value);
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      container.appendChild(table);
      document.body.appendChild(container);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        const jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
        if (!jsPDF) {
          toast.error('PDF generator not available');
          document.body.removeChild(container);
          document.body.removeChild(script);
          setAttendanceReportLoading(false);
          return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 10;

        doc.setFontSize(16);
        doc.text('Nadar Saraswathi College of Engineering & Technology', pageWidth / 2, y, { align: 'center' });
        y += 8;

        doc.setFontSize(10);
        doc.text('Approved by AICTE, New Delhi | Affiliated to Anna University, Chennai', pageWidth / 2, y, { align: 'center' });
        y += 6;
        doc.text('Vadapudupatti, Annanji (PO), Theni - 625 531', pageWidth / 2, y, { align: 'center' });
        y += 10;

        doc.setFontSize(12);
        doc.text('Attendance Report', 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.text(`Class filter: ${historyClassFilter === 'all' ? 'All' : historyClassFilter}`, 14, y);
        y += 4;
        doc.text(`Date range: ${historyStartDate} to ${historyEndDate}`, 14, y);
        y += 8;

        const headers = ['Register', 'Name', 'Dept', 'Year', 'Present', 'Absent'];
        const columnWidths = [30, 50, 40, 20, 20, 20];

        const drawTableRow = (values: string[], isHeader = false) => {
          let x = 14;
          const rowHeight = 6;
          if (y + rowHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
          }

          values.forEach((text, index) => {
            doc.setFontSize(isHeader ? 10 : 9);
            doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
            doc.text(String(text), x + 1, y + 4, { maxWidth: columnWidths[index] - 2 });
            x += columnWidths[index];
          });

          y += rowHeight;
        };

        drawTableRow(headers, true);

        Object.values(pivot).forEach((record: any) => {
          drawTableRow([
            record.register,
            record.name,
            record.department,
            record.year,
            record.present.toString(),
            record.absent.toString(),
          ]);
        });

        const pdfFilenameSuffix = overall ? 'overall' : `${classFilter}-${subjectFilter}`;
        doc.save(`attendance-report-${pdfFilenameSuffix}-${historyStartDate}-${historyEndDate}.pdf`);

        document.body.removeChild(container);
        document.body.removeChild(script);
        setAttendanceReportLoading(false);
      };
      script.onerror = () => {
        toast.error('Failed to load PDF library');
        document.body.removeChild(container);
        document.body.removeChild(script);
        setAttendanceReportLoading(false);
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error('downloadAttendanceReportPdf error', error);
      toast.error('Error generating PDF report');
      setAttendanceReportLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    // Use the same faculty timetable endpoint so department-admin only sees their OWN assigned slots
    fetch(`/api/v1/attendance/faculty/timetable/${selectedDate}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
      .then(r => r.json())
      .then(data => { 
        if (data.success && data.data) { 
          setRawSlots(data.data.slots || []); 
          setStudentsByClass(data.data.studentsByClass || {});
          setSelectedClassId("");
          setSelectedPeriodId("");
        } else {
          setRawSlots([]);
          setStudentsByClass({});
        }
      })
      .catch(console.error);
  }, [selectedDate, authToken]);

  const classes = useMemo(() => {
    const unique = new Map();
    rawSlots.forEach(s => {
      unique.set(s.classSectionId, { id: s.classSectionId, name: s.className, section: s.classSection });
    });
    return Array.from(unique.values());
  }, [rawSlots]);

  const periods = useMemo(() => {
    if (!selectedClassId) return [];
    return rawSlots
      .filter(s => s.classSectionId.toString() === selectedClassId.toString())
      .map(s => ({
        id: s.periodId,
        label: s.periodLabel,
        startTime: s.startTime,
        endTime: s.endTime,
        subjectId: s.subjectId,
        subjectName: s.subjectName
      }));
  }, [selectedClassId, rawSlots]);

  const subjects = useMemo(() => {
    const map = new Map<string, string>();
    rawSlots.forEach((s) => {
      if (s.subjectId && s.subjectName) {
        map.set(s.subjectId.toString(), s.subjectName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [rawSlots]);

  const slotInfo = useMemo(() => {
    if (!selectedClassId || !selectedPeriodId) return null;
    return rawSlots.find(s => s.classSectionId.toString() === selectedClassId.toString() && s.periodId.toString() === selectedPeriodId.toString()) || null;
  }, [selectedClassId, selectedPeriodId, rawSlots]);

  const fetchAttendanceHistory = async () => {
    setHistoryLoading(true);
    try {
      let url = `/api/v1/attendance?limit=500`;
      if (historyClassFilter && historyClassFilter !== 'all') url += `&class=${historyClassFilter}`;
      if (historyStartDate && historyEndDate) url += `&startDate=${historyStartDate}&endDate=${historyEndDate}`;

      const response = await apiFetch(url);
      if (!response.success) {
        toast.error(response.message || 'Failed to load attendance history');
        setAttendanceHistory([]);
        return;
      }

      const history = response.data || [];
      const grouped: Record<string, any> = {};

      history.forEach((item: any) => {
        const date = item.attendance_date || item.date || '';
        const subjectId = item.subject_id || item.subject?.id;
        const subject = item.subject?.subject_name || item.subject_name || 'Unknown';
        const classId = item.class_id || item.class?.id;
        const clazz = item.class?.name || item.class?.section || 'Unknown';
        const section = item.class?.section || item.class?.name || 'N/A';
        const period = item.period_slot_id || item.period;
        const key = `${date}_${subject}_${clazz}_${period}`;

        if (!grouped[key]) {
          grouped[key] = {
            date,
            subject,
            section,
            className: clazz,
            classId,
            subjectId,
            period,
            present: 0,
            absent: 0,
            leave: 0,
            updatedBy: item.faculty?.Name || item.faculty?.name || 'N/A'
          };
        }

        const status = (item.status || '').toLowerCase();
        if (status === 'present' || status === 'late' || status === 'od') grouped[key].present += 1;
        else if (status === 'leave' || status === 'medical_leave' || status === 'duty_leave') grouped[key].leave += 1;
        else grouped[key].absent += 1;
      });

      setAttendanceHistory(Object.values(grouped));
    } catch (error) {
      console.error('[AttendanceHistory] Error loading history', error);
      toast.error('Unexpected error while loading attendance history');
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [historyClassFilter, historyStartDate, historyEndDate]);

  useEffect(() => {
    if (slotInfo && selectedClassId) {
      const students = studentsByClass[selectedClassId] || [];
      setSlotStudents(students.map((s: any) => ({
        id: s.id.toString(),
        studentId: s.studentId || s.student_id || "",
        firstName: s.firstName || s.first_name || s.name || "",
        lastName: s.lastName || s.last_name || "",
        rollNumber: s.rollNumber || s.roll_number || "",
        photo: s.photo || s.photo_path || "",
        name: s.firstName ? `${s.firstName} ${s.lastName || ""}` : (s.name || `Student ${s.id}`)
      })));

      fetch(`/api/v1/attendance?class=${selectedClassId}&date=${selectedDate}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
        .then(r => r.json())
        .then(response => {
          if (response.success && response.data) {
            const attendanceRecord = response.data.find((r: any) => r.period === slotInfo.periodId || r.period === slotInfo.periodId.toString() || r.period === slotInfo.periodLabel);
            if (attendanceRecord && attendanceRecord.students) {
              const marks: Record<string, string> = {};
              attendanceRecord.students.forEach((m: any) => {
                marks[m.studentId?.toString()] = m.status;
              });
              setAttendanceData(marks);
              setTopicCovered(attendanceRecord.remarks || "");
              // Department admins can always override, faculty can only mark on today or if not already marked
              const markedByFaculty = !isDepartmentAdmin && !isToday;
              setPreviouslyMarkedBy(markedByFaculty ? 'Faculty' : null);
              setLocked(markedByFaculty);
              return;
            }
          }
          setAttendanceData({});
          setTopicCovered("");
          setPreviouslyMarkedBy(null);
          // Department admins can always edit, faculty can only edit on today
          setLocked(!isDepartmentAdmin && !isToday);
        })
        .catch(console.error);
    } else {
      setSlotStudents([]);
      setAttendanceData({});
      setPreviouslyMarkedBy(null);
      setLocked(!isDepartmentAdmin && !isToday);
    }
  }, [slotInfo, selectedClassId, studentsByClass, selectedDate, authToken, isToday, isDepartmentAdmin]);

  // Empty content or preserve needed functions since earlier chunk replaced to line 148

  const handleSave = async (showSummary = false) => {
    if (!slotInfo) return;

    if (!window.confirm('You are about to overwrite attendance for this date. Are you sure?')) {
      return;
    }
    
    const studentsArray = Object.keys(attendanceData).map(studentId => ({
      student: parseInt(studentId),
      status: attendanceData[studentId],
      remarks: topicCovered
    }));
    
    try {
      const response = await fetch('/api/v1/attendance', {
        method: locked ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({
          class: slotInfo.classSectionId,
          subject: slotInfo.subjectId,
          faculty: slotInfo.facultyId,
          date: selectedDate,
          period: slotInfo.periodId,
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

    // Validate input
    if (!bulkDigits.trim()) {
      setBulkError("Please enter at least one 2-digit number");
      return;
    }

    if (!bulkStatus) {
      setBulkError("Please select a status");
      return;
    }

    // Parse and validate digits
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

    // Find matching students and update attendance
    const newAttendance = { ...attendanceData };
    let matchedCount = 0;

    slotStudents.forEach((student) => {
      const lastTwoDigits = student.rollNo.slice(-2);
      if (validDigits.includes(lastTwoDigits)) {
        newAttendance[student.id] = bulkStatus;
        matchedCount++;
      } else {
        newAttendance[student.id] = "present";
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
        return s.rollNo.slice(-3).endsWith(digitSearch);
      }
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const presentCount = Object.values(attendanceData).filter((v) => v === "present").length;
  const absentCount = Object.values(attendanceData).filter((v) => v === "absent").length;
  const leaveCount = Object.values(attendanceData).filter((v) => v === "leave").length;
  const odCount = Object.values(attendanceData).filter((v) => v === "od").length;

  const getRollNumbersByStatus = (status: string) => {
    return Object.entries(attendanceData)
      .filter(([, v]) => v === status)
      .map(([sid]) => slotStudents.find((s) => s.id === sid)?.rollNo)
      .filter(Boolean)
      .join(", ") || "-";
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header font-serif">Attendance Management</h1>
        <p className="text-muted-foreground -mt-4">
          Mark and manage student attendance
        </p>
      </motion.div>

      {previouslyMarkedBy && isDepartmentAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Attendance for this slot was previously marked by {previouslyMarkedBy}. 
            You are overriding their marks as Department Admin.
          </p>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mark'|'history')} className="w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.label} ({p.startTime}-{p.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Slot Information */}
            {slotInfo && (
              <div className="mt-4 p-4 bg-info/5 border border-info/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground font-semibold">Subject</p>
                    <p className="text-foreground">{slotInfo.subjectName || `Subject ID ${slotInfo.subjectId}`}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-semibold">Session</p>
                    <p className="text-foreground">{slotInfo.periodLabel} ({slotInfo.startTime} - {slotInfo.endTime})</p>
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
                disabled={locked && !isDepartmentAdmin}
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
                        <p className="font-semibold text-sm text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{student.rollNo}</p>
                      </div>

                      {/* Roll Number (Desktop only) */}
                      <div className="hidden md:block col-span-3">
                        <p className="text-sm text-muted-foreground">{student.rollNo}</p>
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Topic / Unit Covered</Label>
              <Textarea
                placeholder="Briefly describe what was taught today..."
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                className="min-h-[100px] bg-background/50"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleSave(false)}
                disabled={(locked && !isDepartmentAdmin) || !topicCovered.trim()}
                className="bg-primary hover:bg-primary/90 min-w-[200px]"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Class Coverage
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="history">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <h3 className="section-title flex items-center gap-2 mb-0">
                <History className="w-5 h-5 text-primary" />
                Recent Attendance Records
              </h3>

              <div className="flex flex-wrap gap-2 items-center">
                <Select value={historyClassFilter} onValueChange={setHistoryClassFilter}>
                  <SelectTrigger className="min-w-[170px]">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{`${c.name} ${c.section ? `- ${c.section}` : ''}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={historySubjectFilter} onValueChange={setHistorySubjectFilter}>
                  <SelectTrigger className="min-w-[170px]">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input type="date" value={historyStartDate} onChange={e => setHistoryStartDate(e.target.value)} />
                <Input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} />
                <Button size="sm" onClick={fetchAttendanceHistory}>Apply</Button>
                <Button size="sm" onClick={() => downloadAttendanceReport(false)} disabled={attendanceReportLoading}>
                  {attendanceReportLoading ? 'Generating...' : 'Download CSV'}
                </Button>
                <Button size="sm" onClick={() => downloadAttendanceReportPdf(false)} disabled={attendanceReportLoading}>
                  {attendanceReportLoading ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadAttendanceReport(true)} disabled={attendanceReportLoading}>
                  Download Overall CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadAttendanceReportPdf(true)} disabled={attendanceReportLoading}>
                  Download Overall PDF
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Date</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Subject</th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Section</th>
                    <th className="text-center p-3 text-sm font-semibold text-success">Present</th>
                    <th className="text-center p-3 text-sm font-semibold text-destructive">Absent</th>
                    <th className="text-center p-3 text-sm font-semibold text-warning">Leave</th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renderHistoryRows()}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Attendance Summary Popup */}
      {showAttendanceSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowAttendanceSummary(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 max-w-md w-11/12 max-h-96 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-success" />
              Attendance Summary
            </h2>

            <div className="space-y-4">
              <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                <p className="text-sm font-semibold text-success mb-2">Present ({presentCount})</p>
                <p className="text-sm text-foreground break-words">{getRollNumbersByStatus("present")}</p>
              </div>

              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-sm font-semibold text-destructive mb-2">Absent ({absentCount})</p>
                <p className="text-sm text-foreground break-words">{getRollNumbersByStatus("absent")}</p>
              </div>

              <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                <p className="text-sm font-semibold text-warning mb-2">Leave ({leaveCount})</p>
                <p className="text-sm text-foreground break-words">{getRollNumbersByStatus("leave")}</p>
              </div>

              <div className="p-3 bg-info/10 rounded-lg border border-info/30">
                <p className="text-sm font-semibold text-info mb-2">OD ({odCount})</p>
                <p className="text-sm text-foreground break-words">{getRollNumbersByStatus("od")}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => setShowAttendanceSummary(false)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </MainLayout>
  );
}


