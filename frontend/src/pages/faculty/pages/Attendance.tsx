import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
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

interface Department {
  id: number;
  short_name: string;
  full_name: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

const attendanceHistory = [
  { id: "1", date: "2024-01-15", subject: "Data Structures", section: "CSE-A", present: 58, absent: 4, leave: 2 },
  { id: "2", date: "2024-01-14", subject: "Data Structures", section: "CSE-A", present: 60, absent: 2, leave: 2 },
  { id: "3", date: "2024-01-13", subject: "OOP", section: "CSE-B", present: 55, absent: 3, leave: 0 },
  { id: "4", date: "2024-01-12", subject: "Algorithms", section: "CSE-C", present: 52, absent: 6, leave: 2 },
];

export default function Attendance() {
  const { authToken } = useAuth();
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDigits, setBulkDigits] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("a");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [locked, setLocked] = useState(false);
  const [digitSearch, setDigitSearch] = useState("");
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [topicSemester, setTopicSemester] = useState("");
  const [topicYear, setTopicYear] = useState("");
  const [topicDept, setTopicDept] = useState("");
  const [topicCovered, setTopicCovered] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await fetch('/api/v1/departments', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const result = await res.json();
        if (result.success) {
          setDepartments(result.data);
          if (result.data.length > 0 && !selectedDepartment) {
            setSelectedDepartment(result.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    if (authToken) fetchDepts();
  }, [authToken]);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjs = async () => {
      if (!selectedDepartment || !selectedSemester) return;
      try {
        const res = await fetch(`/api/v1/admin/subjects/dept/${selectedDepartment}/sem/${selectedSemester}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const result = await res.json();
        if (result.success) {
          setSubjects(result.data);
          if (result.data.length > 0) {
            setSelectedSubject(result.data[0].id.toString());
          } else {
            setSelectedSubject("");
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      }
    };
    if (authToken && selectedDepartment && selectedSemester) fetchSubjs();
  }, [authToken, selectedDepartment, selectedSemester]);

  // Fetch Students
  useEffect(() => {
    const fetchStuds = async () => {
      if (!selectedDepartment || !selectedSemester) return;
      try {
        setLoading(true);
        const params = new URLSearchParams({
          department: selectedDepartment,
          semester: selectedSemester,
          section: selectedSection,
          limit: '0' // Get all
        });
        const res = await fetch(`/api/v1/students?${params}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const result = await res.json();
        if (result.success) {
          setStudents(result.data);
          // Reset attendance data when student list changes
          setAttendanceData({});
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
      } finally {
        setLoading(false);
      }
    };
    if (authToken && selectedDepartment && selectedSemester && selectedSection) fetchStuds();
  }, [authToken, selectedDepartment, selectedSemester, selectedSection]);

  useEffect(() => {
    const key = `attendance_${selectedDate}_${selectedDepartment}_${selectedSemester}_${selectedSection}_${selectedSubject}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.attendance) {
          setAttendanceData(parsed.attendance);
          setTopicSemester(parsed.topicDetails?.semester || "");
          setTopicYear(parsed.topicDetails?.year || "");
          setTopicDept(parsed.topicDetails?.department || "");
          setTopicCovered(parsed.topicDetails?.topic || "");
        } else {
          setAttendanceData(parsed);
          setTopicSemester("");
          setTopicYear("");
          setTopicDept("");
          setTopicCovered("");
        }
        setLocked(true);
      } catch (e) {
        setAttendanceData({});
        setTopicSemester("");
        setTopicYear("");
        setTopicDept("");
        setTopicCovered("");
        setLocked(!isToday);
      }
    } else {
      setAttendanceData({});
      setTopicSemester("");
      setTopicYear("");
      setTopicDept("");
      setTopicCovered("");
      setLocked(!isToday);
    }
    setMarkAllPresent(false);
    setDigitSearch("");
  }, [selectedDate, isToday, selectedDepartment, selectedSemester, selectedSection, selectedSubject]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleSave = (showSummary = false) => {
    if (!isToday) return;
    const key = `attendance_${selectedDate}_${selectedDepartment}_${selectedSemester}_${selectedSection}_${selectedSubject}`;
    const dataToSave = {
      attendance: attendanceData,
      topicDetails: {
        semester: topicSemester || selectedSemester,
        year: topicYear || selectedYear,
        department: topicDept || selectedDepartment,
        topic: topicCovered
      }
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    setLocked(true);
    if (showSummary) {
      setShowAttendanceSummary(true);
    }
    toast.success("Attendance and coverage details saved successfully!");
  };

  const handleMarkAll = (checked: boolean) => {
    if (locked) return;
    setMarkAllPresent(checked);
    if (checked) {
      const allPresent: Record<string, string> = {};
      students.forEach((s) => {
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

    students.forEach((student) => {
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

  const filteredStudents = students.filter(
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

  const getRollNumbersByStatus = (status: string) => {
    return Object.entries(attendanceData)
      .filter(([, v]) => v === status)
      .map(([sid]) => students.find((s) => s.id.toString() === sid.toString())?.rollNumber)
      .filter(Boolean)
      .join(", ") || "-";
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.short_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Section A</SelectItem>
                    <SelectItem value="b">Section B</SelectItem>
                    <SelectItem value="c">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length > 0 ? (
                      subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No subjects available</SelectItem>
                    )}
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
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={topicSemester}
                  onValueChange={setTopicSemester}
                >
                  <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={topicYear}
                  onValueChange={setTopicYear}
                >
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={topicDept}
                  onValueChange={setTopicDept}
                >
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.short_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                disabled={locked || !isToday || !topicCovered.trim()}
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title flex items-center gap-2 mb-0">
                <History className="w-5 h-5 text-primary" />
                Recent Attendance Records
              </h3>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
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
                  {attendanceHistory.map((record, index) => (
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
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
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


