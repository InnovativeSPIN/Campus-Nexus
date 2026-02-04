import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { ChevronLeft, Mail, Phone, Building2, Calendar, User, MapPin, GraduationCap, Clock } from 'lucide-react';
import { mockStudents } from '@/data/mockData';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/superadmin/components/ui/tabs';

export default function SuperAdminStudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const student = mockStudents.find(s => s.id === id);

    if (!student) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Student not found</h2>
                    <Button variant="link" onClick={() => navigate('/admin/superadmin/students')}>
                        Back to Student List
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/superadmin/students')}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Students
                </Button>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="h-32 bg-primary/10" />
                    <div className="px-8 pb-8">
                        <div className="relative flex items-end justify-between -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="h-24 w-24 rounded-2xl bg-background border-4 border-card shadow-md flex items-center justify-center overflow-hidden">
                                    <img
                                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=128`}
                                        alt={student.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                                    <p className="text-muted-foreground">{student.department} • Batch {student.enrollmentYear}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={student.status === 'active' ? 'bg-success text-white' : ''}>
                                    {student.status}
                                </Badge>
                                <Button onClick={() => navigate(`/admin/superadmin/students?edit=${student.id}`)}>Edit Profile</Button>
                            </div>
                        </div>

                        <Tabs defaultValue="personal" className="space-y-6">
                            <TabsList className="bg-muted/50 p-1 border border-border overflow-x-auto">
                                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                                <TabsTrigger value="academic">Academics</TabsTrigger>
                                <TabsTrigger value="parent">Parent Info</TabsTrigger>
                                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="h-4 w-4 text-primary" />
                                                <span>{student.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-primary" />
                                                <span>{student.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span>Mumbai, Maharashtra</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Academic Placement</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Building2 className="h-4 w-4 text-primary" />
                                                <span>{student.department}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                                <span>Year: {new Date().getFullYear() - student.enrollmentYear + 1}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span>Semester: {student.semester || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span>Enrolled: {student.enrollmentYear}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>Roll No: 21CS{student.id.padStart(3, '0')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="academic">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Semester Results</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(sem => (
                                            <div key={sem} className="p-4 rounded-lg bg-muted/30 border border-border flex justify-between items-center">
                                                <span className="font-medium">Semester {sem}</span>
                                                <Badge variant="outline">GPA: 8.5</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="parent">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Father's Details</h3>
                                        <div className="p-4 rounded-xl border border-border bg-muted/5">
                                            <p className="font-bold">Vijay Sharma</p>
                                            <p className="text-sm text-muted-foreground">Self Employed</p>
                                            <p className="text-sm mt-2">+91 9988776655</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mother's Details</h3>
                                        <div className="p-4 rounded-xl border border-border bg-muted/5">
                                            <p className="font-bold">Meena Sharma</p>
                                            <p className="text-sm text-muted-foreground">Homemaker</p>
                                            <p className="text-sm mt-2">+91 9988776644</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="attendance">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Attendance details for all subjects. Overall: 85%
                                </div>
                            </TabsContent>

                            <TabsContent value="portfolio">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Project, Events, and Extra-curricular achievements.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
