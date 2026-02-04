import { useState, useMemo } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { mockTimeTable, mockAcademicYears, mockDepartments } from '@/data/mockData';
import { TimeTableEntry } from '@/types/auth';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/pages/admin/superadmin/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/pages/admin/superadmin/components/ui/dialog';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';

export default function SuperAdminTimeTable() {
    const [entries] = useState<TimeTableEntry[]>(mockTimeTable);
    const [viewModal, setViewModal] = useState<{ open: boolean; data: TimeTableEntry | null }>({
        open: false,
        data: null,
    });

    // Filters
    const [academicYear, setAcademicYear] = useState<string>('all');
    const [semester, setSemester] = useState<string>('all');
    const [employeeId, setEmployeeId] = useState('');
    const [facultyName, setFacultyName] = useState('');
    const [department, setDepartment] = useState<string>('all');
    const [day, setDay] = useState<string>('all');
    const [period, setPeriod] = useState<string>('');

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesYear = academicYear === 'all' || entry.academicYear === academicYear;
            const matchesSemester = semester === 'all' || entry.semester === semester;
            const matchesFacultyId = !employeeId || entry.facultyId.includes(employeeId); // Assuming facultyId matches employeeId logic or needs lookup
            const matchesName = !facultyName || entry.facultyName.toLowerCase().includes(facultyName.toLowerCase());
            const matchesDay = day === 'all' || entry.day === day;
            const matchesPeriod = !period || entry.period.toString() === period;
            const matchesDept = department === 'all' || entry.department === department;

            return matchesYear && matchesSemester && matchesFacultyId && matchesName && matchesDay && matchesPeriod && matchesDept;
        });
    }, [entries, academicYear, semester, employeeId, facultyName, day, period, department]);

    const columns = [
        { key: 'facultyName', label: 'Faculty' },
        { key: 'department', label: 'Department' },
        { key: 'day', label: 'Day' },
        { key: 'period', label: 'Period' },
        { key: 'time', label: 'Time' },
        { key: 'subject', label: 'Subject' },
        { key: 'classOrLab', label: 'Class/Lab' },
        { key: 'academicYear', label: 'Year' },
        { key: 'semester', label: 'Sem' },
    ];

    const handleView = (item: TimeTableEntry) => {
        setViewModal({ open: true, data: item });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Time Table Management</h1>
                    <p className="text-muted-foreground">Check staff time tables and schedules</p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger><SelectValue placeholder="Academic Year" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Academic Years</SelectItem>
                            {mockAcademicYears.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {mockDepartments.map(dept => (
                                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            <SelectItem value="odd">Odd</SelectItem>
                            <SelectItem value="even">Even</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Faculty Name"
                        value={facultyName}
                        onChange={(e) => setFacultyName(e.target.value)}
                    />
                    <Input
                        placeholder="Employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                    <Select value={day} onValueChange={setDay}>
                        <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Days</SelectItem>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        type="number"
                    />
                </div>

                <DataTable
                    data={filteredEntries}
                    columns={columns}
                    title="Time Table Entries"
                    searchPlaceholder="Search entries..."
                    onView={handleView}
                    canAdd={false}
                    canEdit={false}
                    canDelete={false}
                />

                <Dialog open={viewModal.open} onOpenChange={(open) => setViewModal({ open, data: null })}>
                    <DialogContent className="bg-card">
                        <DialogHeader>
                            <DialogTitle>Time Table Detail</DialogTitle>
                        </DialogHeader>
                        {viewModal.data && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Faculty</label>
                                        <p className="text-lg font-semibold">{viewModal.data.facultyName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                                        <p className="text-lg font-semibold">{viewModal.data.department}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                        <p className="text-lg font-semibold">{viewModal.data.subject}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Class/Lab</label>
                                        <p>{viewModal.data.classOrLab}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Time</label>
                                        <div className="flex gap-2 items-center">
                                            <Badge variant="outline">{viewModal.data.day}</Badge>
                                            <span>{viewModal.data.time}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Period</label>
                                        <p>{viewModal.data.period}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                                        <p>{viewModal.data.academicYear} ({viewModal.data.semester})</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
