import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { ChevronLeft, Mail, Phone, Building2, Calendar, Award, User, MapPin, Briefcase } from 'lucide-react';
// import data is no longer needed; fetch from API instead
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/superadmin/components/ui/tabs';

export default function SuperAdminFacultyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchFaculty = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/v1/faculty/${id}`, { credentials: 'include' });
          const json = await res.json();
          if (json.success) {
            setFaculty(json.data);
          }
        } catch (err) {
          console.error('Failed to load faculty', err);
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchFaculty();
    }, [id]);

    if (loading) {
      return (
        <AdminLayout>
          <div className="flex items-center justify-center h-[60vh]">
            <p>Loading...</p>
          </div>
        </AdminLayout>
      );
    }

    if (!faculty) {
      return (
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold">Faculty not found</h2>
            <Button variant="link" onClick={() => navigate('/admin/superadmin/faculty')}>
              Back to Faculty List
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
                    onClick={() => navigate('/admin/superadmin/faculty')}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Faculty
                </Button>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="h-32 bg-primary/10" />
                    <div className="px-8 pb-8">
                        <div className="relative flex items-end justify-between -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="h-24 w-24 rounded-2xl bg-background border-4 border-card shadow-md flex items-center justify-center overflow-hidden">
                                    <img
                                        src={faculty.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&size=128`}
                                        alt={faculty.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{faculty.name}</h1>
                                    <p className="text-muted-foreground">{faculty.designation}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={faculty.status === 'active' ? 'default' : 'secondary'} className={faculty.status === 'active' ? 'bg-success text-white' : ''}>
                                    {faculty.status}
                                </Badge>
                                <Button onClick={() => navigate(`/admin/superadmin/faculty?edit=${faculty.id}`)}>Edit Profile</Button>
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="bg-muted/50 p-1 border border-border">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="academic">Academic Load</TabsTrigger>
                                <TabsTrigger value="research">Research & Publications</TabsTrigger>
                                <TabsTrigger value="leave">Leave History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="h-4 w-4 text-primary" />
                                                <span>{faculty.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="h-4 w-4 text-primary" />
                                                <span>{faculty.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span>Theni, Tamil Nadu</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Department Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Building2 className="h-4 w-4 text-primary" />
                                                <span>{faculty.department}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Award className="h-4 w-4 text-primary" />
                                                <span>{faculty.designation}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>Employee ID: {faculty.employeeId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work History</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span>Joined: {faculty.joinDate}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                                <span>Experience: 5+ Years</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-semibold mb-4">Educational Qualifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                            <p className="font-bold">Ph.D. in AI & ML</p>
                                            <p className="text-sm text-muted-foreground">Anna University, 2020</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border">
                                            <p className="font-bold">M.E in Computer Science</p>
                                            <p className="text-sm text-muted-foreground">IIT Madras, 2015</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="academic">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Academic load data for the current semester is synchronized with the Time Table module.
                                </div>
                            </TabsContent>

                            <TabsContent value="research">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Publications and ongoing research data.
                                </div>
                            </TabsContent>

                            <TabsContent value="leave">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Leave and attendance overview.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
