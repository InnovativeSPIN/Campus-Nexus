import { useState, useMemo } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    BookOpen,
    Users,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDepartments } from '@/data/mockData';

interface AcademicStudent {
    regNum: string;
    name: string;
    department: string;
    year: number;
    academicYear: string;
    semester: number;
    arrears: number;
    status: 'cleared' | 'arrear';
}

const mockAcademicData: AcademicStudent[] = [
    { regNum: "SUR2021001", name: "Alice Thompson", department: "Computer Science", year: 3, academicYear: "2023-24", semester: 5, arrears: 0, status: 'cleared' },
    { regNum: "SUR2021045", name: "Bob Wilson", department: "Computer Science", year: 3, academicYear: "2023-24", semester: 5, arrears: 2, status: 'arrear' },
    { regNum: "SUR2022112", name: "Charlie Davis", department: "Electronics", year: 2, academicYear: "2023-24", semester: 3, arrears: 0, status: 'cleared' },
    { regNum: "SUR2020089", name: "Diana Prince", department: "Information Technology", year: 4, academicYear: "2023-24", semester: 7, arrears: 1, status: 'arrear' },
    { regNum: "SUR2021156", name: "Evan Wright", department: "Mechanical", year: 3, academicYear: "2023-24", semester: 5, arrears: 3, status: 'arrear' },
];

export default function AcademicPerformance() {
    const [filters, setFilters] = useState({
        semester: '',
        type: 'even', // even or odd
        department: 'all',
        year: '',
        academicYear: '2023-24',
        performanceStatus: 'all' // all, arrears, cleared
    });

    const currentYear = new Date().getFullYear();

    // Rule: if academic year start is more than 5 years ago, disable the year input field.
    const isYearDisabled = useMemo(() => {
        if (!filters.academicYear) return false;
        const startYear = parseInt(filters.academicYear.split('-')[0]);
        return (currentYear - startYear) > 5;
    }, [filters.academicYear, currentYear]);

    const filteredData = useMemo(() => {
        return mockAcademicData.filter(student => {
            const matchDept = filters.department === 'all' || student.department === filters.department;
            const matchYear = !filters.year || student.year.toString() === filters.year;
            const matchStatus = filters.performanceStatus === 'all' ||
                (filters.performanceStatus === 'arrears' && student.status === 'arrear') ||
                (filters.performanceStatus === 'cleared' && student.status === 'cleared');
            return matchDept && matchYear && matchStatus;
        });
    }, [filters]);

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                <header>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Academic Performance</h1>
                    <p className="text-muted-foreground">Monitor student performance, arrears, and academic data trends</p>
                </header>

                {/* Filters Card */}
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Performance Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="space-y-2">
                                <Label>Academic Year</Label>
                                <Select
                                    value={filters.academicYear}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, academicYear: v }))}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Academic Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023-24">2023-24</SelectItem>
                                        <SelectItem value="2022-23">2022-23</SelectItem>
                                        <SelectItem value="2021-22">2021-22</SelectItem>
                                        <SelectItem value="2020-21">2020-21</SelectItem>
                                        <SelectItem value="2018-19">2018-19 (Past 5yr)</SelectItem>
                                        <SelectItem value="2017-18">2017-18 (Past 5yr)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Semester Type</Label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Odd/Even" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="odd">Odd Semester</SelectItem>
                                        <SelectItem value="even">Even Semester</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select
                                    value={filters.department}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, department: v }))}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {mockDepartments.map(d => (
                                            <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className={isYearDisabled ? "opacity-50" : ""}>Year</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1"
                                    disabled={isYearDisabled}
                                    value={filters.year}
                                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Performance Category</Label>
                                <Select
                                    value={filters.performanceStatus}
                                    onValueChange={(v) => setFilters(prev => ({ ...prev, performanceStatus: v }))}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Students</SelectItem>
                                        <SelectItem value="cleared">Cleared Students</SelectItem>
                                        <SelectItem value="arrears">Arrear Students</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                                    <Search className="w-4 h-4 mr-2" /> Search
                                </Button>
                            </div>
                        </div>
                        {isYearDisabled && (
                            <p className="text-[10px] text-destructive mt-2 italic">* Year field is disabled for records older than 5 years.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-secondary" />
                            Student Performance Records
                        </h2>
                        <Badge variant="outline" className="px-3 py-1">
                            Found {filteredData.length} Records
                        </Badge>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                            <Users className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground">No records match your selected filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map((student, idx) => (
                                <motion.div
                                    key={student.regNum}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group"
                                >
                                    <Card className="overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                                        <div className={student.status === 'cleared' ? 'h-1.5 bg-success' : 'h-1.5 bg-destructive'} />
                                        <CardContent className="pt-6 relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${student.status === 'cleared' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
                          `}>
                                                        {student.name[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{student.name}</h3>
                                                        <p className="text-xs font-mono text-muted-foreground">{student.regNum}</p>
                                                    </div>
                                                </div>
                                                {student.status === 'cleared' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs border-t border-border pt-4">
                                                <div>
                                                    <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Academic Year</p>
                                                    <p className="font-semibold">{student.academicYear}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Arrears</p>
                                                    <p className={`font-black ${student.arrears > 0 ? 'text-destructive' : 'text-success'}`}>
                                                        {student.arrears}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Department</p>
                                                    <p className="font-semibold">{student.department}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Badge variant="secondary" className="text-[10px] py-0">Year {student.year}</Badge>
                                                <Badge variant="outline" className="text-[10px] py-0">Sem {student.semester}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
