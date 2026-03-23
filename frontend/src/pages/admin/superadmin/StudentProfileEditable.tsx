import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { normalizeImageUrl } from '@/utils/imageUrl';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import { Label } from '@/pages/admin/superadmin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/superadmin/components/ui/select';
import { ChevronLeft, Mail, Phone, Building2, Calendar, User, MapPin, GraduationCap, Clock, Edit2, Save, X } from 'lucide-react';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/superadmin/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Student } from '@/types/auth';

export default function SuperAdminStudentProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/v1/students/${id}`, { credentials: 'include' });
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const json = await res.json();
            if (json.success && json.data) {
                const s = json.data;
                s.name = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                s.enrollmentYear = s.batch ? parseInt(s.batch.split('-')[0], 10) : undefined;
                s.avatar = normalizeImageUrl(s.photo || s.avatar) || undefined;
                if (s.department && typeof s.department === 'object') {
                    s.departmentName = s.department.name || s.department.short_name || s.department.full_name || '';
                } else {
                    s.departmentName = s.department || '';
                }
                setStudent(s);
                setFormData(s);
            } else {
                setError(json.message || 'Student not found');
            }
        } catch (err: any) {
            console.error('Error loading student profile', err);
            setError(err.message || 'Unable to load student');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSection = async (section: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`${section} updated successfully`);
                setStudent(json.data);
                setFormData(json.data);
                setEditingSection(null);
            } else {
                toast.error(json.message || 'Failed to update');
            }
        } catch (err: any) {
            console.error('Error saving', err);
            toast.error('Unable to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData(student);
        setEditingSection(null);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <p>Loading...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error || !student) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">{error || 'Student not found'}</h2>
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
                                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || '')}&background=random&size=128`}
                                        alt={student.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                                    <p className="text-muted-foreground">
                                        {student.departmentName || student.department || ''} • Batch {student.academicYear || student.enrollmentYear || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={student.status === 'active' ? 'bg-success text-white' : ''}>
                                    {student.status}
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

                            {/* Personal Info Tab */}
                            <TabsContent value="personal" className="space-y-6">
                                {editingSection === 'personal' ? (
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border">
                                        <h3 className="font-semibold text-lg">Edit Personal Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>First Name</Label>
                                                <Input value={formData.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Last Name</Label>
                                                <Input value={formData.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Email</Label>
                                                <Input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Phone</Label>
                                                <Input value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Alternate Phone</Label>
                                                <Input value={formData.alternatePhone || ''} onChange={(e) => handleInputChange('alternatePhone', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Gender</Label>
                                                <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Date of Birth</Label>
                                                <Input type="date" value={formData.dateOfBirth ? String(formData.dateOfBirth).split('T')[0] : ''} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Blood Group</Label>
                                                <Select value={formData.bloodGroup || ''} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Nationality</Label>
                                                <Input value={formData.nationality || ''} onChange={(e) => handleInputChange('nationality', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Religion</Label>
                                                <Input value={formData.religion || ''} onChange={(e) => handleInputChange('religion', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Category</Label>
                                                <Input value={formData.category || ''} onChange={(e) => handleInputChange('category', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Aadhar Number</Label>
                                                <Input value={formData.aadharNo || ''} onChange={(e) => handleInputChange('aadharNo', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Mother Tongue</Label>
                                                <Input value={formData.motherTongue || ''} onChange={(e) => handleInputChange('motherTongue', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>LinkedIn URL</Label>
                                                <Input type="url" value={formData.linkedinUrl || ''} onChange={(e) => handleInputChange('linkedinUrl', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Residence Type</Label>
                                                <Select value={formData.residenceType || ''} onValueChange={(value) => handleInputChange('residenceType', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hosteller">Hosteller</SelectItem>
                                                        <SelectItem value="day_scholar">Day Scholar</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button onClick={() => handleSaveSection('Personal Info')} disabled={saving} className="bg-success">
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                                                </div>
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
                                                        <Phone className="h-4 w-4 text-primary" />
                                                        <span>{formData.alternatePhone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bio Information</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">DOB:</span> {formData.dateOfBirth || 'N/A'}</p>
                                                    <p><span className="font-medium">Blood Group:</span> {formData.bloodGroup || 'N/A'}</p>
                                                    <p><span className="font-medium">Mother Tongue:</span> {formData.motherTongue || 'N/A'}</p>
                                                    <p><span className="font-medium">Residence:</span> {formData.residenceType || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Other Details</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Nationality:</span> {formData.nationality || 'N/A'}</p>
                                                    <p><span className="font-medium">Religion:</span> {formData.religion || 'N/A'}</p>
                                                    <p><span className="font-medium">Category:</span> {formData.category || 'N/A'}</p>
                                                    <p><span className="font-medium">Aadhar:</span> {formData.aadharNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={() => setEditingSection('personal')} className="mt-4">
                                            <Edit2 className="h-4 w-4 mr-2" /> Edit Personal Info
                                        </Button>
                                    </>
                                )}
                            </TabsContent>

                            {/* Academic Tab */}
                            <TabsContent value="academic" className="space-y-6">
                                {editingSection === 'academic' ? (
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border">
                                        <h3 className="font-semibold text-lg">Edit Academic Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Student ID</Label>
                                                <Input value={formData.studentId || ''} onChange={(e) => handleInputChange('studentId', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Roll Number</Label>
                                                <Input value={formData.rollNumber || ''} onChange={(e) => handleInputChange('rollNumber', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Admission Number</Label>
                                                <Input value={formData.admissionNo || ''} onChange={(e) => handleInputChange('admissionNo', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>EMIS Number</Label>
                                                <Input value={formData.emisNo || ''} onChange={(e) => handleInputChange('emisNo', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Batch</Label>
                                                <Input value={formData.batch || ''} onChange={(e) => handleInputChange('batch', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Semester</Label>
                                                <Select value={(formData.semester || '').toString()} onValueChange={(value) => handleInputChange('semester', parseInt(value))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                            <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Year</Label>
                                                <Select value={formData.year || ''} onValueChange={(value) => handleInputChange('year', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Year 1</SelectItem>
                                                        <SelectItem value="2">Year 2</SelectItem>
                                                        <SelectItem value="3">Year 3</SelectItem>
                                                        <SelectItem value="4">Year 4</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Admission Date</Label>
                                                <Input type="date" value={formData.admissionDate ? String(formData.admissionDate).split('T')[0] : ''} onChange={(e) => handleInputChange('admissionDate', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Admission Type</Label>
                                                <Select value={formData.admissionType || ''} onValueChange={(value) => handleInputChange('admissionType', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="regular">Regular</SelectItem>
                                                        <SelectItem value="lateral">Lateral</SelectItem>
                                                        <SelectItem value="management">Management</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Fee Status</Label>
                                                <Select value={formData.feeStatus || ''} onValueChange={(value) => handleInputChange('feeStatus', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="partial">Partial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Status</Label>
                                                <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                        <SelectItem value="graduated">Graduated</SelectItem>
                                                        <SelectItem value="dropped">Dropped</SelectItem>
                                                        <SelectItem value="suspended">Suspended</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button onClick={() => handleSaveSection('Academic Info')} disabled={saving} className="bg-success">
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Academic Details</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Student ID:</span> {student.studentId}</p>
                                                    <p><span className="font-medium">Roll No:</span> {student.rollNumber}</p>
                                                    <p><span className="font-medium">Admission No:</span> {student.admissionNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Status</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Batch:</span> {student.batch}</p>
                                                    <p><span className="font-medium">Year:</span> {student.year || 'N/A'}</p>
                                                    <p><span className="font-medium">Semester:</span> {student.semester}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enrollment</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Admission Date:</span> {student.admissionDate || 'N/A'}</p>
                                                    <p><span className="font-medium">Admission Type:</span> {student.admissionType || 'N/A'}</p>
                                                    <p><span className="font-medium">Fee Status:</span> {student.feeStatus || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={() => setEditingSection('academic')} className="mt-4">
                                            <Edit2 className="h-4 w-4 mr-2" /> Edit Academic Info
                                        </Button>
                                    </>
                                )}
                            </TabsContent>

                            {/* Parent Info Tab */}
                            <TabsContent value="parent">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Parent information coming soon
                                </div>
                            </TabsContent>

                            {/* Attendance Tab */}
                            <TabsContent value="attendance">
                                <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                    Attendance details for all subjects. Overall: 85%
                                </div>
                            </TabsContent>

                            {/* Portfolio Tab */}
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
