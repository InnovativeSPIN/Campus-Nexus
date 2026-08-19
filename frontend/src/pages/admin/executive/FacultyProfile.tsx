import { apiFetch } from '@/lib/apiFetch';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { Button } from '@/pages/admin/executive/components/ui/button';
import { ChevronLeft, Mail, Phone, Building2, Calendar, Award, User, MapPin, Briefcase, Edit2 } from 'lucide-react';
import { Badge } from '@/pages/admin/executive/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/executive/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/pages/admin/executive/components/ui/dialog';
import { Input } from '@/pages/admin/executive/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/executive/components/ui/select';
import { Label } from '@/pages/admin/executive/components/ui/label';
import { normalizeImageUrl } from '@/utils/imageUrl';
export default function ExecutiveFacultyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState<any | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
      const fetchFaculty = async () => {
        if (!id) return;
        try {
          setLoading(true);
          const res = await apiFetch(`/api/v1/faculty/${id}`);
          if (!res.ok) throw new Error(`server returned ${res.status}`);
          const json = await res.json();
          if (json.success && json.data) {
            const f = json.data;
            f.name = f.Name || '';
            f.avatar = normalizeImageUrl(f.profile_image_url || f.avatar) || undefined;
            setFaculty(f);
          } else {
            toast.error(json.message || 'Faculty not found');
          }
        } catch (err: any) {
          console.error('Failed to load faculty', err);
          toast.error(err.message || 'Failed to load faculty details');
        } finally {
          setLoading(false);
        }
      };
      
      const fetchDepartments = async () => {
        try {
          const res = await apiFetch('/api/v1/departments');
          const json = await res.json();
          if (json.success) {
            setDepartments(json.data);
          }
        } catch (err) {
          console.error('Failed to load departments', err);
        }
      };

      if (id) {
        fetchFaculty();
        fetchDepartments();
      }
    }, [id]);

    if (loading) {
      return (
        <AdminLayout>
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </AdminLayout>
      );
    }

    if (!faculty) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Faculty not found</h2>
                    <Button variant="link" onClick={() => navigate('/admin/executive/faculty')}>
                        Back to Faculty List
                    </Button>
                </div>
            </AdminLayout>
        );
    }

    const getDepartmentName = (deptId: number | string | undefined) => {
      if (!deptId) return 'N/A';
      return departments.find((d) => d.id === Number(deptId))?.full_name || 'N/A';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/executive/faculty')}
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
                                        src={faculty.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.Name || 'Faculty')}&background=random&size=128`}
                                        alt={faculty.Name || 'Faculty'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{faculty.Name}</h1>
                                    <p className="text-muted-foreground">{faculty.designation}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={faculty.status === 'active' ? 'default' : 'secondary'} className={faculty.status === 'active' ? 'bg-success text-white' : ''}>
                                    {faculty.status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditModalOpen(true)}
                                  className="gap-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit
                                </Button>
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
                                                <span>{faculty.phone_number}</span>
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
                                                <span>{getDepartmentName(faculty.department_id)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Award className="h-4 w-4 text-primary" />
                                                <span>{faculty.designation}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>Employee ID: {faculty.faculty_college_code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work History</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span>Joined: {faculty.date_of_joining}</span>
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

                {/* Edit Faculty Dialog */}
                <EditFacultyDialog
                  open={editModalOpen}
                  onOpenChange={setEditModalOpen}
                  faculty={faculty}
                  departments={departments}
                  onSuccess={() => {
                    setEditModalOpen(false);
                    if (id) {
                      // Refresh faculty data
                      apiFetch(`/api/v1/faculty/${id}`)
                        .then((res: Response) => res.json())
                        .then((json: any) => {
                          if (json.success && json.data) {
                            const f = json.data;
                            f.name = f.Name || '';
                            f.avatar = normalizeImageUrl(f.profile_image_url || f.avatar) || undefined;
                            setFaculty(f);
                            toast.success('Faculty updated successfully');
                          }
                        })
                        .catch((err: unknown) => {
                          console.error('Failed to refresh faculty', err);
                          toast.error('Failed to refresh faculty data');
                        });
                    }
                  }}
                />
            </div>
        </AdminLayout>
    );
}

interface EditFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: any;
  departments: any[];
  onSuccess: () => void;
}

function EditFacultyDialog({ open, onOpenChange, faculty, departments, onSuccess }: EditFacultyDialogProps) {
  const [formData, setFormData] = useState<any>({
    Name: faculty?.Name || '',
    email: faculty?.email || '',
    phone_number: faculty?.phone_number || '',
    designation: faculty?.designation || '',
    department_id: faculty?.department_id || '',
    faculty_college_code: faculty?.faculty_college_code || '',
    date_of_joining: faculty?.date_of_joining || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty?.id) {
      toast.error('Faculty ID is missing');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiFetch(`/api/v1/faculty/${faculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await response.json();
      if (json.success) {
        toast.success('Faculty updated successfully');
        onSuccess();
      } else {
        toast.error(json.message || 'Failed to update faculty');
      }
    } catch (err: any) {
      console.error('Error updating faculty:', err);
      toast.error(err.message || 'Error updating faculty');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Faculty Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={String(formData.department_id)} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="college-code">Faculty College Code</Label>
            <Input
              id="college-code"
              value={formData.faculty_college_code}
              onChange={(e) => setFormData({ ...formData, faculty_college_code: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joining-date">Date of Joining</Label>
            <Input
              id="joining-date"
              type="date"
              value={formData.date_of_joining}
              onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
