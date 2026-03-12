import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { ChevronLeft, Mail, Phone, Building2, Calendar, Award, User, MapPin, Briefcase, Edit2, Trash2, Globe } from 'lucide-react';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/superadmin/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

import { FacultyFormModal } from '@/pages/admin/superadmin/components/modals/FacultyFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/admin/superadmin/components/ui/alert-dialog';

export default function SuperAdminFacultyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState<any | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
      const fetchFaculty = async () => {
        if (!id) return;
        try {
          setLoading(true);
          const res = await fetch(`/api/v1/faculty/${id}`);
          if (!res.ok) throw new Error(`server returned ${res.status}`);
          const json = await res.json();
          if (json.success && json.data) {
            const f = json.data;
            // derive a name field to mirror student profile logic
            f.name = f.Name || '';
            f.avatar = f.profile_image_url || f.avatar;
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
          const res = await fetch('/api/v1/departments');
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

    const handleDelete = async () => {
      if (!faculty) return;
      
      setDeleting(true);
      try {
        const res = await fetch(`/api/v1/faculty/${faculty.faculty_id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        
        if (json.success) {
          toast.success('Faculty deleted successfully');
          navigate('/admin/superadmin/faculty');
        } else {
          toast.error(json.message || 'Failed to delete faculty');
        }
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Failed to delete faculty');
      } finally {
        setDeleting(false);
        setDeleteDialogOpen(false);
      }
    };

    const getDepartmentName = (deptId: number | string | undefined) => {
      if (!deptId) return 'N/A';
      return departments.find((d) => d.id === Number(deptId))?.full_name || 'N/A';
    };

    const calculateAge = (dob: string | undefined) => {
      if (!dob) return 'N/A';
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    };

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
                {/* Header with Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/superadmin/faculty')}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Faculty List
                </Button>

                {/* Profile Card (matched to student profile layout) */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    {/* Banner uses same flat color as students for consistency */}
                    <div className="h-32 bg-primary/10" />
                    
                    <div className="px-8 pb-8">
                        {/* Profile Header */}
                        <div className="relative flex items-end justify-between -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="h-24 w-24 rounded-2xl bg-background border-4 border-card shadow-md flex items-center justify-center overflow-hidden">
                                    <img
                                        src={faculty.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name || '')}&background=random&size=128`}
                                        alt={faculty.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{faculty.name}</h1>
                                    <p className="text-muted-foreground">
                                      {faculty.designation || 'Faculty'} • {getDepartmentName(faculty.department_id)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge 
                                    variant="default"
                                    className={
                                      faculty.status === 'active' 
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : faculty.status === 'on_leave'
                                        ? 'bg-yellow-600 hover:bg-yellow-700'
                                        : 'bg-gray-600 hover:bg-gray-700'
                                    }
                                >
                                    {faculty.status?.charAt(0).toUpperCase() + faculty.status?.slice(1) || 'Active'}
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
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteDialogOpen(true)}
                                  className="gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="bg-muted/50 p-1 border border-border">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                                <TabsTrigger value="academic">Academic Details</TabsTrigger>
                                <TabsTrigger value="personal">Personal Details</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Department */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-muted-foreground uppercase">Department</span>
                                        </div>
                                        <p className="text-lg font-semibold">{getDepartmentName(faculty.department_id)}</p>
                                    </div>

                                    {/* Employee ID */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-muted-foreground uppercase">College Code</span>
                                        </div>
                                        <p className="text-lg font-semibold">{faculty.faculty_college_code || '-'}</p>
                                    </div>

                                    {/* Designation */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-muted-foreground uppercase">Designation</span>
                                        </div>
                                        <p className="text-lg font-semibold">{faculty.designation || '-'}</p>
                                    </div>

                                    {/* Date of Joining */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-muted-foreground uppercase">Joined</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                          {faculty.date_of_joining 
                                            ? new Date(faculty.date_of_joining).toLocaleDateString()
                                            : '-'}
                                        </p>
                                    </div>

                                    {/* ORCID ID */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Globe className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-muted-foreground uppercase">ORCID ID</span>
                                        </div>
                                        <p className="text-lg font-semibold">{faculty.orcid_id || '-'}</p>
                                    </div>

                                </div>
                            </TabsContent>

                            {/* Contact Tab */}
                            <TabsContent value="contact" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Mail className="h-5 w-5 text-primary" />
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Email</h3>
                                        </div>
                                        <p className="text-lg font-semibold break-all">{faculty.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <Phone className="h-5 w-5 text-primary" />
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Phone</h3>
                                        </div>
                                        <p className="text-lg font-semibold">{faculty.phone_number || '-'}</p>
                                    </div>

                                    {/* Current Address */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Current Address</h3>
                                        </div>
                                        <p className="text-base whitespace-pre-wrap">{faculty.curr_address || '-'}</p>
                                    </div>

                                    {/* Permanent Address */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Permanent Address</h3>
                                        </div>
                                        <p className="text-base whitespace-pre-wrap">{faculty.perm_address || '-'}</p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Academic Tab */}
                            <TabsContent value="academic" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* AICTE ID */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">AICTE ID</h3>
                                        <p className="text-lg font-semibold">{faculty.AICTE_ID || '-'}</p>
                                    </div>

                                    {/* Anna University ID */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Anna University ID</h3>
                                        <p className="text-lg font-semibold">{faculty.Anna_University_ID || '-'}</p>
                                    </div>

                                    {/* ORCID ID */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">ORCID ID</h3>
                                        <p className="text-lg font-semibold">{faculty.orcid_id || '-'}</p>
                                    </div>

                                </div>
                            </TabsContent>

                            {/* Personal Tab */}
                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Date of Birth */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Date of Birth</h3>
                                        <p className="text-lg font-semibold">
                                          {faculty.date_of_birth 
                                            ? new Date(faculty.date_of_birth).toLocaleDateString()
                                            : '-'}
                                        </p>
                                    </div>

                                    {/* Age */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Age</h3>
                                        <p className="text-lg font-semibold">{calculateAge(faculty.date_of_birth)}</p>
                                    </div>

                                    {/* Gender */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Gender</h3>
                                        <p className="text-lg font-semibold">{faculty.gender || '-'}</p>
                                    </div>

                                    {/* Blood Group */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Blood Group</h3>
                                        <p className="text-lg font-semibold">{faculty.blood_group || '-'}</p>
                                    </div>

                                    {/* Aadhar Number */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Aadhar Number</h3>
                                        <p className="text-lg font-semibold">{faculty.aadhar_number || '-'}</p>
                                    </div>

                                    {/* PAN Number */}
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">PAN Number</h3>
                                        <p className="text-lg font-semibold">{faculty.pan_number || '-'}</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Edit Modal */}
                <FacultyFormModal
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    mode="edit"
                    facultyData={faculty}
                    departments={departments}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        // Refresh faculty data
                        const fetchFaculty = async () => {
                            try {
                                const res = await fetch(`/api/v1/faculty/${id}`);
                                const json = await res.json();
                                if (json.success) {
                                    setFaculty(json.data);
                                    toast.success('Faculty updated successfully');
                                }
                            } catch (err) {
                                console.error('Failed to reload faculty', err);
                            }
                        };
                        fetchFaculty();
                    }}
                />

                {/* Delete Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{faculty.Name}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
