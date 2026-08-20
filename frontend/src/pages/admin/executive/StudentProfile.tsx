import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { Button } from '@/pages/admin/executive/components/ui/button';
import { ChevronLeft, Mail, Phone, Building2, Calendar, User, MapPin, GraduationCap, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/executive/components/ui/tabs';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from '@/components/ui/sonner';

export default function ExecutiveStudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchStudent = async () => {
        if (!id) return;
        try {
          setLoading(true);
          const res = await apiFetch(`/api/v1/students/${id}`);
          if (!res.ok) throw new Error(`server returned ${res.status}`);
          const json = await res.json();
          if (json.success && json.data) {
            setStudent(json.data);
          } else {
            toast.error(json.message || 'Student not found');
          }
        } catch (err: any) {
          console.error('Failed to load student profile', err);
          toast.error('Failed to load student details');
        } finally {
          setLoading(false);
        }
      };

      const fetchDepartments = async () => {
        try {
          const res = await apiFetch('/api/v1/departments');
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setDepartments(json.data);
          }
        } catch (err) {
          console.error('Failed to load departments', err);
        }
      };

      fetchStudent();
      fetchDepartments();
    }, [id]);

    if (loading) {
      return (
        <AdminLayout>
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </AdminLayout>
      );
    }

    if (!student) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Student not found</h2>
                    <Button variant="link" onClick={() => navigate('/admin/executive/students')}>
                        Back to Student List
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.name || 'Student';
    const deptName = student.department ? (student.department.full_name || student.department.short_name) : 
      departments.find(d => d.id === Number(student.departmentId))?.full_name || 'N/A';
    const rollNo = student.studentId || student.rollNumber || `21CS${String(student.id).padStart(3, '0')}`;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/executive/students')}
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
                                        src={student.photo && student.photo !== 'default-student.png' ? student.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=128`}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                                    <p className="text-muted-foreground">{deptName} • Batch {student.batch || '2025'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={student.status === 'active' ? 'bg-success text-white' : ''}>
                                    {student.status || 'active'}
                                </Badge>
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
                                                <span>{student.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-primary" />
                                                <span>{student.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span>Tamil Nadu, India</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Academic Placement</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Building2 className="h-4 w-4 text-primary" />
                                                <span>{deptName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <GraduationCap className="h-4 w-4 text-primary" />
                                                <span>Year: {student.year || 'N/A'}</span>
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
                                                <span>Batch: {student.batch || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>Roll No / ID: {rollNo}</span>
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
                                            <p className="font-bold">Guardian / Father</p>
                                            <p className="text-sm text-muted-foreground">Self Employed</p>
                                            <p className="text-sm mt-2">+91 9988776655</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mother's Details</h3>
                                        <div className="p-4 rounded-xl border border-border bg-muted/5">
                                            <p className="font-bold">Mother</p>
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
