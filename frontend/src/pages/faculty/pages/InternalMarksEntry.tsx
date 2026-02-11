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

const mockStudents = [
    { id: 1, regNo: "927621BCS001", name: "Aarav Sharma" },
    { id: 2, regNo: "927621BCS002", name: "Aditi Patel" },
    { id: 3, regNo: "927621BCS003", name: "Arjun Kumar" },
    { id: 4, regNo: "927621BCS004", name: "Divya Singh" },
    { id: 5, regNo: "927621BCS005", name: "Ishaan Gupta" },
    { id: 6, regNo: "927621BCS006", name: "Kavya Reddy" },
    { id: 7, regNo: "927621BCS007", name: "Mira Nair" },
    { id: 8, regNo: "927621BCS008", name: "Rohan Joshi" },
    { id: 9, regNo: "927621BCS009", name: "Sanya Verma" },
    { id: 10, regNo: "927621BCS010", name: "Vihaan Malhotra" },
];

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
}

export function InternalMarksEntry() {
    const [filters, setFilters] = useState({
        subject: "",
        category: "",
        department: "",
        year: "",
    });
    const [showStudents, setShowStudents] = useState(false);
    const [studentData, setStudentData] = useState<Record<number, StudentMarks>>({});

    // Initialize mock data structure
    useEffect(() => {
        if (showStudents) {
            const initialData: Record<number, StudentMarks> = {};
            mockStudents.forEach(s => {
                initialData[s.id] = {
                    internal100: "",
                    internal60: "", // Auto calculated
                    assignment1: "",
                    assignment2: "",
                    workingHours: "60", // Default working hours
                    presentHours: "",
                    attendancePercentage: "", // Auto calculated
                    assignmentTotal: "", // Auto calculated
                    totalMarks: "", // Auto calculated
                    status: "-", // Auto calculated
                    verified: false
                };
            });
            setStudentData(initialData);
        }
    }, [showStudents]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleLoadStudents = () => {
        if (!filters.subject || !filters.category || !filters.department || !filters.year) {
            toast({
                title: "Missing Filters",
                description: "Please select all filters to load students.",
                variant: "destructive",
            });
            return;
        }
        setShowStudents(true);
        toast({
            title: "Students Loaded",
            description: `Loaded students for ${filters.subject} - ${filters.category}`,
        });
    };

    const updateStudentField = (id: number, field: keyof StudentMarks, value: string) => {
        setStudentData(prev => {
            const student = { ...prev[id], [field]: value };

            // Calculations

            // 1. Internal Mark Conversion (100 -> 60)
            if (field === 'internal100') {
                const val = parseFloat(value);
                if (!isNaN(val)) {
                    // Check max 100
                    if (val > 100) return prev;
                    student.internal60 = Math.round((val / 100) * 60).toString();
                } else {
                    student.internal60 = "";
                }
            }

            // 2. Attendance Percentage
            if (field === 'presentHours' || field === 'workingHours') {
                const present = parseFloat(field === 'presentHours' ? value : student.presentHours);
                const total = parseFloat(field === 'workingHours' ? value : student.workingHours);

                if (!isNaN(present) && !isNaN(total) && total > 0) {
                    if (present > total) return prev; // Present cannot be > working
                    const percentage = Math.round((present / total) * 100);
                    student.attendancePercentage = percentage.toString() + "%";
                } else {
                    student.attendancePercentage = "";
                }
            }

            // 3. Assignment Total (Ass 1 + Ass 2) -> Scaled to 40? 
            // The request says "total mark auto calucuate assingment 40 and then internal 60"
            // Assuming Assignment 1 and Assignment 2 are each out of something, and total assignment contribution is 40.
            // Or maybe simply Ass1 + Ass2 = Total Assignment (max 40)

            const ass1 = parseFloat(field === 'assignment1' ? value : student.assignment1) || 0;
            const ass2 = parseFloat(field === 'assignment2' ? value : student.assignment2) || 0;

            // Assuming Ass1 and Ass2 are raw marks. Let's sum them up.
            // User requirement: "assingment 1 , assignment 2 , 2 is not mandatory"
            // "total mark auto calucuate assingment 40" -> imply sum should be max 40? or converted?
            // Let's assume the input is the final marks for assignments, and we sum them.
            if (field === 'assignment1' || field === 'assignment2') {
                // Simple validation, let's say each is max 20? Or total max 40. 
                // Let's just sum them for now.
                const totalAss = ass1 + ass2;
                student.assignmentTotal = totalAss.toString();
            }

            // 4. Total Marks (Internal 60 + Assignment 40) and Status
            const int60 = parseFloat(student.internal60) || 0;
            const assTotal = parseFloat(student.assignmentTotal) || 0;

            // Only calculate if we have internal marks 
            if (student.internal60 !== "") {
                const grandTotal = int60 + assTotal;
                student.totalMarks = grandTotal.toString();
                student.status = grandTotal >= 50 ? "Pass" : "Fail"; // Assuming 50 is pass
            } else {
                student.totalMarks = "";
                student.status = "-";
            }

            return { ...prev, [id]: student };
        });
    };

    const toggleVerify = (id: number) => {
        setStudentData(prev => ({
            ...prev,
            [id]: { ...prev[id], verified: !prev[id].verified }
        }));
    };

    const handleSave = () => {
        console.log("Saving marks:", { filters, studentData });
        toast({
            title: "Marks Saved",
            description: "Internal marks continue to verification.",
        });
    };

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
                        <Select onValueChange={(val) => handleFilterChange("subject", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Data Structures">Data Structures</SelectItem>
                                <SelectItem value="Algorithms">Algorithms</SelectItem>
                                <SelectItem value="Database Systems">Database Systems</SelectItem>
                                <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Internal Category</label>
                        <Select onValueChange={(val) => handleFilterChange("category", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Internal I">Internal I</SelectItem>
                                <SelectItem value="Internal II">Internal II</SelectItem>
                                <SelectItem value="Model Exam">Model Exam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Department</label>
                        <Select onValueChange={(val) => handleFilterChange("department", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CSE">CSE</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="ECE">ECE</SelectItem>
                                <SelectItem value="AI&DS">AI&DS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Academic Year</label>
                        <Select onValueChange={(val) => handleFilterChange("year", val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2023-2024">2023-2024</SelectItem>
                                <SelectItem value="2024-2025">2024-2025</SelectItem>
                                <SelectItem value="2025-2026">2025-2026</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={handleLoadStudents} className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Load Students
                    </Button>
                </div>
            </div>

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
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-4 h-4" /> Export Excel
                            </Button>
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
                                        <th className="px-2 py-3 text-center whitespace-nowrap min-w-[60px]">Verify</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {mockStudents.map((student) => {
                                        const data = studentData[student.id] || {};
                                        return (
                                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs font-medium">{student.regNo}</td>
                                                <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>

                                                {/* Internal 100 */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.internal100 || ""}
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
                                                        onChange={(e) => updateStudentField(student.id, "assignment1", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                        placeholder="0"
                                                    />
                                                </td>

                                                {/* Assignment 2 */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.assignment2 || ""}
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
                                                        onChange={(e) => updateStudentField(student.id, "workingHours", e.target.value)}
                                                        className="h-9 text-center p-1"
                                                    />
                                                </td>

                                                {/* Present Hours */}
                                                <td className="px-2 py-3">
                                                    <Input
                                                        value={data.presentHours || ""}
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

                                                {/* Verify Button */}
                                                <td className="px-2 py-3 text-center">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className={`h-8 w-8 ${data.verified ? 'text-green-600 bg-green-50' : 'text-muted-foreground hover:text-green-600'}`}
                                                        onClick={() => toggleVerify(student.id)}
                                                    >
                                                        {data.verified ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                                                    </Button>
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
                        <Button onClick={handleSave} className="bg-success hover:bg-success/90 text-white min-w-[150px]">
                            <Save className="w-4 h-4 mr-2" />
                            Submit Marks
                        </Button>
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
