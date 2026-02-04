import { useState, useEffect } from "react";
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
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  History,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/pages/admin/department-admin/lib/utils";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  photo: string;
  attendance?: "present" | "absent" | "leave" | "od";
}

const students: Student[] = [
  { id: "1", rollNo: "CSE001", name: "Aditya Kumar", photo: "AK" },
  { id: "2", rollNo: "CSE002", name: "Priya Sharma", photo: "PS" },
  { id: "3", rollNo: "CSE003", name: "Rahul Verma", photo: "RV" },
  { id: "4", rollNo: "CSE004", name: "Sneha Patel", photo: "SP" },
  { id: "5", rollNo: "CSE005", name: "Vikram Singh", photo: "VS" },
  { id: "6", rollNo: "CSE006", name: "Ananya Gupta", photo: "AG" },
  { id: "7", rollNo: "CSE007", name: "Arjun Reddy", photo: "AR" },
  { id: "8", rollNo: "CSE008", name: "Kavya Nair", photo: "KN" },
  { id: "9", rollNo: "CSE009", name: "Rohit Joshi", photo: "RJ" },
  { id: "10", rollNo: "CSE010", name: "Meera Krishnan", photo: "MK" },
  { id: "11", rollNo: "CSE011", name: "Sanjay Rao", photo: "SR" },
  { id: "12", rollNo: "CSE012", name: "Divya Menon", photo: "DM" },
  { id: "13", rollNo: "CSE013", name: "Karan Malhotra", photo: "KM" },
  { id: "14", rollNo: "CSE014", name: "Neha Sharma", photo: "NS" },
  { id: "15", rollNo: "CSE015", name: "Amit Patel", photo: "AP" },
  { id: "16", rollNo: "CSE016", name: "Zara Khan", photo: "ZK" },
  { id: "17", rollNo: "CSE017", name: "Varun Singhal", photo: "VS" },
  { id: "18", rollNo: "CSE018", name: "Ishita Desai", photo: "ID" },
  { id: "19", rollNo: "CSE019", name: "Ravi Shankar", photo: "RS" },
  { id: "20", rollNo: "CSE020", name: "Pooja Mehta", photo: "PM" },
  { id: "21", rollNo: "CSE021", name: "Nikhil Yadav", photo: "NY" },
  { id: "22", rollNo: "CSE022", name: "Shreya Mishra", photo: "SM" },
  { id: "23", rollNo: "CSE023", name: "Siddharth Kumar", photo: "SK" },
  { id: "24", rollNo: "CSE024", name: "Anushka Sinha", photo: "AS" },
  { id: "25", rollNo: "CSE025", name: "Aryan Gupta", photo: "AG" },
  { id: "26", rollNo: "CSE026", name: "Diya Singh", photo: "DS" },
  { id: "27", rollNo: "CSE027", name: "Harshit Verma", photo: "HV" },
  { id: "28", rollNo: "CSE028", name: "Isha Pandey", photo: "IP" },
  { id: "29", rollNo: "CSE029", name: "Jatin Kapoor", photo: "JK" },
  { id: "30", rollNo: "CSE030", name: "Kriti Nair", photo: "KN" },
  { id: "31", rollNo: "CSE031", name: "Lakshay Sharma", photo: "LS" },
  { id: "32", rollNo: "CSE032", name: "Manya Chopra", photo: "MC" },
  { id: "33", rollNo: "CSE033", name: "Nakul Dwivedi", photo: "ND" },
  { id: "34", rollNo: "CSE034", name: "Olivia Desai", photo: "OD" },
  { id: "35", rollNo: "CSE035", name: "Pranav Rao", photo: "PR" },
  { id: "36", rollNo: "CSE036", name: "Radhika Iyer", photo: "RI" },
  { id: "37", rollNo: "CSE037", name: "Sahil Bhat", photo: "SB" },
  { id: "38", rollNo: "CSE038", name: "Tanvi Sharma", photo: "TS" },
  { id: "39", rollNo: "CSE039", name: "Udaan Patel", photo: "UP" },
  { id: "40", rollNo: "CSE040", name: "Vedant Kumar", photo: "VK" },
  { id: "41", rollNo: "CSE041", name: "Wanda Singh", photo: "WS" },
  { id: "42", rollNo: "CSE042", name: "Xavier Menon", photo: "XM" },
  { id: "43", rollNo: "CSE043", name: "Yasmin Khan", photo: "YK" },
  { id: "44", rollNo: "CSE044", name: "Zainab Mirza", photo: "ZM" },
  { id: "45", rollNo: "CSE045", name: "Aarav Saxena", photo: "AS" },
  { id: "46", rollNo: "CSE046", name: "Bhavna Trivedi", photo: "BT" },
  { id: "47", rollNo: "CSE047", name: "Chirag Verma", photo: "CV" },
  { id: "48", rollNo: "CSE048", name: "Deepika Nair", photo: "DN" },
  { id: "49", rollNo: "CSE049", name: "Esha Gupta", photo: "EG" },
  { id: "50", rollNo: "CSE050", name: "Fahad Rahman", photo: "FR" },
];

const attendanceHistory = [
  { date: "2024-01-15", subject: "Data Structures", section: "CSE-A", present: 58, absent: 4, leave: 2 },
  { date: "2024-01-14", subject: "Data Structures", section: "CSE-A", present: 60, absent: 2, leave: 2 },
  { date: "2024-01-13", subject: "OOP", section: "CSE-B", present: 55, absent: 3, leave: 0 },
  { date: "2024-01-12", subject: "Algorithms", section: "CSE-C", present: 52, absent: 6, leave: 2 },
];

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDigits, setBulkDigits] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");
  const [selectedYear, setSelectedYear] = useState("2");
  const [selectedDepartment, setSelectedDepartment] = useState("cse");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [locked, setLocked] = useState(false);
  const [digitSearch, setDigitSearch] = useState("");
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [topicSemester, setTopicSemester] = useState("");
  const [topicYear, setTopicYear] = useState("");
  const [topicDept, setTopicDept] = useState("");
  const [topicCovered, setTopicCovered] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  useEffect(() => {
    const key = `attendance_${selectedDate}`;
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
  }, [selectedDate, isToday]);

  const handleSave = (showSummary = false) => {
    if (!isToday) return;
    const key = `attendance_${selectedDate}`;
    const dataToSave = {
      attendance: attendanceData,
      topicDetails: {
        semester: topicSemester,
        year: topicYear,
        department: topicDept,
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

    students.forEach((student) => {
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

  const filteredStudents = students.filter(
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
      .map(([sid]) => students.find((s) => s.id === sid)?.rollNo)
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
                    <SelectItem value="cse">Computer Science and Engineering</SelectItem>
                    <SelectItem value="aids">Artificial Intelligence and Data Science</SelectItem>
                    <SelectItem value="eee">Electrical and Electronics Engineering</SelectItem>
                    <SelectItem value="mech">Mechanical Engineering</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select defaultValue="a">
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
                <Select defaultValue="ds">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ds">Data Structures</SelectItem>
                    <SelectItem value="oop">Object Oriented Programming</SelectItem>
                    <SelectItem value="algo">Algorithms</SelectItem>
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
                    <SelectItem value="cse">CSE</SelectItem>
                    <SelectItem value="aids">AI & DS</SelectItem>
                    <SelectItem value="eee">EEE</SelectItem>
                    <SelectItem value="mech">MECH</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
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


