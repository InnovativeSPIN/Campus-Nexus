import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import {
    ClipboardList,
    Search,
    Save,
    Download,
    Filter,
    Eye
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/pages/faculty/components/ui/select";
import { toast } from "@/pages/faculty/hooks/use-toast";

interface StudentMarks {
    internal100: string;
    internal60: string;
    assignment1: string;
    assignment2: string;
    workingHours: string;
    presentHours: string;
    attendancePercentage: string;
    assignmentTotal: string; // autocalculated
    totalMarks: string; // autocalculated (internal 60 + assignment 40)
    status: "Pass" | "Fail" | "-";
    verified: boolean;
    dbStatus: string;
}

export function InternalMarksEntry() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [batchStatus, setBatchStatus] = useState<string>("draft");
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        subject: "",
        category: "",
        department: "",
        year: "",
    });
    const [showStudents, setShowStudents] = useState(false);
    const [studentData, setStudentData] = useState<Record<number, StudentMarks>>({});

    // Fetch assignments on mount
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoadingAssignments(true);
                const token = localStorage.getItem("authToken");
                const res = await fetch("/api/v1/faculty/academics/my-subjects", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const result = await res.json();
                if (result.success) {
                    setAssignments(result.data || []);
                }
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setLoadingAssignments(false);
            }
        };
        fetchAssignments();
    }, []);

    // Get unique subjects
    const uniqueSubjects = Array.from(
        new Map(assignments.map(a => [a.subject?.id, a.subject])).values()
    ).filter(Boolean);

    // Get unique classes based on selected subject
    const filteredClasses = assignments
        .filter(a => String(a.subject_id) === filters.subject)
        .map(a => a.class)
        .filter(Boolean);

    // Get unique academic years from assignments
    const uniqueYears = Array.from(new Set(assignments.map(a => a.academic_year))).filter(Boolean);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => {
            const updated = { ...prev, [key]: value };
            // Reset dependent filters
            if (key === "subject") {
                updated.department = "";
            }
            return updated;
        });
    };

    const handleLoadStudents = async () => {
        if (!filters.subject || !filters.category || !filters.department || !filters.year) {
            toast({
                title: "Missing Filters",
                description: "Please select all filters to load students.",
                variant: "destructive",
            });
            return;
        }

        const assignment = assignments.find(
            a => String(a.subject_id) === filters.subject && String(a.class_id) === filters.department
        );
        const semester = assignment ? assignment.semester : null;

        if (!semester) {
            toast({
                title: "Error",
                description: "Could not identify semester for selection.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoadingStudents(true);
            const token = localStorage.getItem("authToken");
            const url = `/api/v1/faculty/academics/assessment/students?classId=${filters.department}&subjectId=${filters.subject}&semester=${semester}&academicYear=${filters.year}&internalNumber=${filters.category}`;
            const response = await fetch(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const result = await response.json();
            if (result.success) {
                setStudents(result.data || []);
                setBatchStatus(result.status || "draft");
                setRejectionReason(result.rejectionReason || null);

                const initialData: Record<number, StudentMarks> = {};
                result.data.forEach((s: any) => {
                    initialData[s.id] = {
                        internal100: s.marks.internal100 || "",
                        internal60: s.marks.internal60 || "",
                        assignment1: s.marks.assignment1 || "",
                        assignment2: s.marks.assignment2 || "",
                        assignmentTotal: s.marks.assignmentTotal || "",
                        workingHours: s.marks.workingHours || "60",
                        presentHours: s.marks.presentHours || "",
                        attendancePercentage: s.marks.attendancePercentage || "",
                        totalMarks: s.marks.totalMarks || "",
                        status: s.marks.status || "-",
                        verified: s.marks.verified || false,
                        dbStatus: s.marks.dbStatus || "draft"
                    };
                });
                setStudentData(initialData);
                setShowStudents(true);
                toast({
                    title: "Students Loaded",
                    description: `Loaded ${result.data.length} students. Batch status: ${result.status}`,
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to load students.",
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
            setLoadingStudents(false);
        }
    };

    const updateStudentField = (id: number, field: keyof StudentMarks, value: string) => {
        setStudentData(prev => {
            const student = { ...prev[id], [field]: value };

            // 1. Internal 100 to 60 conversion
            if (field === 'internal100') {
                const val = parseFloat(value);
                if (!isNaN(val)) {
                    if (val > 100 || val < 0) return prev;
                    student.internal60 = Math.round((val / 100) * 60).toString();
                } else {
                    student.internal60 = "";
                }
            }

            // 2. Attendance %
            if (field === 'presentHours' || field === 'workingHours') {
                const present = parseFloat(field === 'presentHours' ? value : student.presentHours);
                const total = parseFloat(field === 'workingHours' ? value : student.workingHours);

                if (!isNaN(present) && !isNaN(total) && total > 0) {
                    if (present > total || present < 0 || total < 0) return prev;
                    const percentage = Math.round((present / total) * 100);
                    student.attendancePercentage = percentage.toString() + "%";
                } else {
                    student.attendancePercentage = "";
                }
            }

            // 3. Assignment sums (Ass1 + Ass2 = Max 40)
            const ass1Val = field === 'assignment1' ? parseFloat(value) : parseFloat(student.assignment1);
            const ass2Val = field === 'assignment2' ? parseFloat(value) : parseFloat(student.assignment2);
            const ass1 = isNaN(ass1Val) ? 0 : ass1Val;
            const ass2 = isNaN(ass2Val) ? 0 : ass2Val;

            if (ass1 < 0 || ass1 > 40) return prev;
            if (ass2 < 0 || ass2 > 40) return prev;
            if (ass1 + ass2 > 40) return prev;

            student.assignmentTotal = (ass1 + ass2).toString();

            // 4. Grand total & status
            const int60 = parseFloat(student.internal60) || 0;
            const assTotal = parseFloat(student.assignmentTotal) || 0;

            if (student.internal60 !== "") {
                const grandTotal = int60 + assTotal;
                student.totalMarks = grandTotal.toString();
                student.status = grandTotal >= 50 ? "Pass" : "Fail";
            } else {
                student.totalMarks = "";
                student.status = "-";
            }

            return { ...prev, [id]: student };
        });
    };

    const handleSaveDraft = async () => {
        const assignment = assignments.find(
            a => String(a.subject_id) === filters.subject && String(a.class_id) === filters.department
        );
        const semester = assignment ? assignment.semester : null;

        if (!semester) {
            toast({
                title: "Error",
                description: "Could not identify semester for saving.",
                variant: "destructive",
            });
            return false;
        }

        setSaving(true);

        const marksArray = students.map(student => {
            const data = studentData[student.id] || {};
            return {
                studentId: student.id,
                internal100: data.internal100,
                internal60: data.internal60,
                assignment1: data.assignment1,
                assignment2: data.assignment2,
                assignmentTotal: data.assignmentTotal,
                workingHours: data.workingHours,
                presentHours: data.presentHours,
                attendancePercentage: data.attendancePercentage.replace("%", ""),
                totalMarks: data.totalMarks,
                remarks: ""
            };
        });

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/v1/faculty/academics/assessment/marks/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    subjectId: parseInt(filters.subject),
                    classId: parseInt(filters.department),
                    semester,
                    academicYear: filters.year,
                    internalNumber: parseInt(filters.category),
                    marks: marksArray
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast({
                    title: "Draft Saved",
                    description: "Internal marks draft saved successfully.",
                });
                return true;
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to save draft.",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitBatch = async () => {
        const incomplete = students.some(student => {
            const data = studentData[student.id] || {};
            return !data.internal100 || !data.presentHours || !data.workingHours;
        });

        if (incomplete) {
            toast({
                title: "Incomplete Fields",
                description: "Please fill in Internal Marks, Working Hours, and Present Hours for all students.",
                variant: "destructive",
            });
            return;
        }

        const confirmSubmit = window.confirm("Are you sure you want to submit this marks batch to the Exam Cell? Editing will be locked.");
        if (!confirmSubmit) return;

        setSubmitting(true);

        const saveSuccess = await handleSaveDraft();
        if (!saveSuccess) {
            setSubmitting(false);
            return;
        }

        const cls = filteredClasses.find(c => String(c.id) === filters.department);
        const batchName = cls ? `${cls.name}-${cls.section}` : "Class Batch";

        const assignment = assignments.find(
            a => String(a.subject_id) === filters.subject && String(a.class_id) === filters.department
        );
        const semester = assignment ? assignment.semester : null;

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/v1/faculty/academics/assessment/marks/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    subjectId: parseInt(filters.subject),
                    classId: parseInt(filters.department),
                    semester,
                    academicYear: filters.year,
                    internalNumber: parseInt(filters.category),
                    batch: batchName
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast({
                    title: "Marks Submitted",
                    description: "Marks successfully submitted to the Exam Cell for review.",
                });
                setBatchStatus("submitted");
                setStudentData(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(id => {
                        next[Number(id)].dbStatus = "submitted";
                    });
                    return next;
                });
            } else {
                toast({
                    title: "Submission Failed",
                    description: result.error || "Failed to submit marks.",
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
            setSubmitting(false);
        }
    };

    const isReadOnly = ["submitted", "verified", "published"].includes(batchStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card w-full overflow-x-auto"
        >
            <h3 className="section-title flex items-center gap-2 mb-6">
                <ClipboardList className="w-5 h-5 text-primary" />
                Internal Assessment Marks Entry
            </h3>

            {/* Filters Section */}
            <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Subject</label>
                        <Select value={filters.subject} onValueChange={(val) => handleFilterChange("subject", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueSubjects.map(sub => (
                                    <SelectItem key={sub.id} value={String(sub.id)}>
                                        {sub.subject_name} ({sub.subject_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Internal Category</label>
                        <Select value={filters.category} onValueChange={(val) => handleFilterChange("category", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Internal I</SelectItem>
                                <SelectItem value="2">Internal II</SelectItem>
                                <SelectItem value="3">Model Exam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Class/Section</label>
                        <Select value={filters.department} onValueChange={(val) => handleFilterChange("department", val)} disabled={!filters.subject}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder={filters.subject ? "Select Class" : "Select Subject First"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredClasses.map(cls => (
                                    <SelectItem key={cls.id} value={String(cls.id)}>
                                        {cls.name} - {cls.section} (Sem {cls.semester})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Academic Year</label>
                        <Select value={filters.year} onValueChange={(val) => handleFilterChange("year", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueYears.map(yr => (
                                    <SelectItem key={yr} value={yr}>
                                        {yr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={handleLoadStudents} disabled={loadingStudents} className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {loadingStudents ? "Loading..." : "Load Students"}
                    </Button>
                </div>
            </div>

            {/* Batch Status Alert */}
            {showStudents && (
                <div className={`p-4 mb-6 rounded-xl border flex items-center justify-between ${
                    batchStatus === "published" ? "bg-green-50 border-green-200 text-green-800" :
                    batchStatus === "verified" ? "bg-teal-50 border-teal-200 text-teal-800" :
                    batchStatus === "submitted" ? "bg-blue-50 border-blue-200 text-blue-800" :
                    batchStatus === "rejected" ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                    <div>
                        <span className="font-semibold text-sm mr-2">Batch Status:</span>
                        <span className="uppercase text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 border border-current">
                            {batchStatus}
                        </span>
                        {batchStatus === "rejected" && rejectionReason && (
                            <p className="mt-2 text-sm font-medium text-red-700">
                                <span className="font-bold">Rejection Reason:</span> {rejectionReason}
                            </p>
                        )}
                    </div>
                    {isReadOnly && (
                        <span className="text-xs font-semibold italic opacity-85">
                            Editing locked for this batch.
                        </span>
                    )}
                </div>
            )}

            {/* Students Data Grid */}
            {showStudents ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-lg text-foreground">Student List</h4>
                            <p className="text-sm text-muted-foreground">Enter marks details below</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Reg No</th>
                                        <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">Name</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Internal<br /><span className="text-[10px]">(Max 100)</span></th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px] bg-blue-50/50">Conv.<br /><span className="text-[10px]">(60)</span></th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Assign 1</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Assign 2</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px] bg-blue-50/50">Assign Total<br /><span className="text-[10px]">(40)</span></th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Work Hrs</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Present</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[70px] bg-blue-50/50">Att %</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[70px] font-bold bg-green-50/50">Total</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Status</th>
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[60px]">Status DB</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {students.map((student) => {
                                        const data = studentData[student.id] || {
                                            internal100: "",
                                            internal60: "",
                                            assignment1: "",
                                            assignment2: "",
                                            assignmentTotal: "",
                                            workingHours: "60",
                                            presentHours: "",
                                            attendancePercentage: "",
                                            totalMarks: "",
                                            status: "-",
                                            verified: false,
                                            dbStatus: "draft"
                                        };
                                        return (
                                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs font-medium">{student.regNo}</td>
                                                <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>

                                                {/* Internal 100 */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.internal100 || ""}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => updateStudentField(student.id, "internal100", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {/* Converted 60 (Read Only) */}
                                                <td className="px-2 py-3 bg-blue-50/30">
                                                    <div className="text-center font-semibold text-blue-700">
                                                        {data.internal60}
                                                    </div>
                                                </td>

                                                {/* Assignment 1 */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.assignment1 || ""}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => updateStudentField(student.id, "assignment1", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {/* Assignment 2 */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.assignment2 || ""}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => updateStudentField(student.id, "assignment2", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                        placeholder="Opt"
                                                    />
                                                </td>

                                                {/* Assignment Total (Read Only) */}
                                                <td className="px-2 py-3 bg-blue-50/30">
                                                    <div className="text-center font-semibold text-blue-700">
                                                        {data.assignmentTotal}
                                                    </div>
                                                </td>

                                                {/* Working Hours */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.workingHours || "60"}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => updateStudentField(student.id, "workingHours", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                    />
                                                </td>

                                                {/* Present Hours */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.presentHours || ""}
                                                        disabled={isReadOnly}
                                                        onChange={(e) => updateStudentField(student.id, "presentHours", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {/* Attendance % */}
                                                <td className="px-2 py-3 bg-blue-50/30">
                                                    <div className={`text-center font-bold ${parseInt(data.attendancePercentage) < 75 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {data.attendancePercentage}
                                                    </div>
                                                </td>

                                                {/* Total Marks */}
                                                <td className="px-2 py-3 bg-green-50/30">
                                                    <div className="text-center font-black text-green-800 text-lg">
                                                        {data.totalMarks}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-2 py-3">
                                                    <div className={`text-center font-bold px-2 py-1 rounded text-xs ${data.status === 'Pass' ? 'bg-green-100 text-green-700' :
                                                            data.status === 'Fail' ? 'bg-red-100 text-red-700' : 'text-muted-foreground'
                                                        }`}>
                                                        {data.status}
                                                    </div>
                                                </td>

                                                {/* Status DB Badge */}
                                                <td className="px-2 py-3 text-center">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                        data.dbStatus === 'published' ? 'bg-green-100 text-green-800' :
                                                        data.dbStatus === 'verified' ? 'bg-teal-100 text-teal-800' :
                                                        data.dbStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                        data.dbStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {data.dbStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-4">
                        <Button variant="outline" onClick={() => setShowStudents(false)}>Cancel</Button>
                        
                        {!isReadOnly && (
                            <>
                                <Button 
                                    onClick={handleSaveDraft} 
                                    disabled={saving}
                                    variant="outline" 
                                    className="border-primary text-primary hover:bg-primary/5 min-w-[120px]"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? "Saving..." : "Save Draft"}
                                </Button>
                                
                                <Button 
                                    onClick={handleSubmitBatch} 
                                    disabled={submitting}
                                    className="bg-success hover:bg-success/90 text-white min-w-[150px]"
                                >
                                    <ClipboardList className="w-4 h-4 mr-2" />
                                    {submitting ? "Submitting..." : "Submit to Exam Cell"}
                                </Button>
                            </>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/20">
                    <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="font-medium text-foreground mb-2">
                        No Students Loaded
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Please select the filters above and click "Load Students" to start entering marks.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
