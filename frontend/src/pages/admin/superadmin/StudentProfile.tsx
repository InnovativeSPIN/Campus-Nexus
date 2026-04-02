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
import { ChevronLeft, Mail, Phone, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/admin/superadmin/components/ui/tabs';
import { toast } from '@/components/ui/sonner';

// Helper function to format date for input display (converts "0000-00-00" to empty string)
const formatDateForInput = (dateValue: any): string => {
    if (!dateValue) return '';
    const dateStr = String(dateValue).split('T')[0];
    if (dateStr === '0000-00-00' || dateStr === '') return '';
    return dateStr;
};

// Helper function to clean date before sending to backend (converts invalid dates to null)
const cleanDateForBackend = (dateValue: any): string | null => {
    if (!dateValue) return null;
    const dateStr = String(dateValue).split('T')[0];
    if (dateStr === '0000-00-00' || dateStr === '') return null;
    return dateStr;
};

export default function SuperAdminStudentProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Attendance and Projects states
    const [attendance, setAttendance] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(false);
    
    // Password change states
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({ new: false, confirm: false });

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/v1/students/${id}`, { 
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });
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
                // Initialize parentInfo if not exists
                if (!s.parentInfo) {
                    s.parentInfo = {
                        father: { name: '', phone: '', email: '', occupation: '', qualification: '', annualIncome: '' },
                        mother: { name: '', phone: '', email: '', occupation: '', qualification: '', annualIncome: '' },
                        guardian: { name: '', relation: '', phone: '', address: '' },
                    };
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

    const fetchAttendance = async () => {
        if (!id) return;
        try {
            setAttendanceLoading(true);
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/v1/student/attendance/student/${id}`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });
            const json = await res.json();
            if (json.success && json.data) {
                setAttendance(Array.isArray(json.data) ? json.data : [json.data]);
            }
        } catch (err: any) {
            console.error('Error loading attendance', err);
        } finally {
            setAttendanceLoading(false);
        }
    };

    const fetchProjects = async () => {
        if (!id) return;
        try {
            setProjectsLoading(true);
            const token = localStorage.getItem('authToken');
            // Fetch all projects, we'll filter by student later
            const res = await fetch(`/api/v1/student/projects`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                }
            });
            const json = await res.json();
            if (json.success && json.data) {
                // Filter projects by current student ID
                const studentProjects = (Array.isArray(json.data) ? json.data : []).filter((p: any) => p.studentId === id);
                setProjects(studentProjects);
            }
        } catch (err: any) {
            console.error('Error loading projects', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/v1/students/${id}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ password: passwordForm.newPassword })
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Password changed successfully');
                setPasswordModalOpen(false);
                setPasswordForm({ newPassword: '', confirmPassword: '' });
            } else {
                toast.error(json.message || 'Failed to change password');
            }
        } catch (err: any) {
            console.error('Error changing password', err);
            toast.error('Unable to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSaveSection = async (section: string) => {
        setSaving(true);
        try {
            // Validate required fields
            if (section === 'academic') {
                if (!formData.studentId || formData.studentId.trim() === '') {
                    toast.error('Student ID is required');
                    setSaving(false);
                    return;
                }
                if (!formData.firstName || formData.firstName.trim() === '') {
                    toast.error('First Name is required');
                    setSaving(false);
                    return;
                }
                if (!formData.lastName || formData.lastName.trim() === '') {
                    toast.error('Last Name is required');
                    setSaving(false);
                    return;
                }
            }

            // Clean formData - only include valid Student and StudentBio fields
            const validStudentFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'studentId', 'rollNumber', 'admissionNo', 'emisNo', 'batch', 'semester', 'year', 'admissionDate', 'admissionType', 'feeStatus', 'status'];
            const validBioFields = ['alternatePhone', 'linkedinUrl', 'dateOfBirth', 'bloodGroup', 'nationality', 'religion', 'category', 'aadharNo', 'motherTongue', 'residenceType', 'address', 'permanentAddress', 'parentInfo', 'references', 'previousEducation', 'scholarshipDetails', 'documents'];
            
            const cleanData: any = {};
            
            // Include valid student fields
            validStudentFields.forEach(field => {
                if (field in formData && formData[field] !== undefined) {
                    cleanData[field] = formData[field];
                }
            });
            
            // Include valid bio fields
            validBioFields.forEach(field => {
                if (field in formData && formData[field] !== undefined) {
                    cleanData[field] = formData[field];
                }
            });

            // Handle department and class - convert objects to IDs
            if (formData.department && typeof formData.department === 'object' && formData.department.id) {
                cleanData.departmentId = formData.department.id;
            } else if (formData.departmentId) {
                cleanData.departmentId = formData.departmentId;
            }

            if (formData.class && typeof formData.class === 'object' && formData.class.id) {
                cleanData.classId = formData.class.id;
            } else if (formData.classId) {
                cleanData.classId = formData.classId;
            }

            // Clean up date fields - convert "0000-00-00" and empty dates to null
            if (cleanData.dateOfBirth) {
                cleanData.dateOfBirth = cleanDateForBackend(cleanData.dateOfBirth);
            }
            if (cleanData.admissionDate) {
                cleanData.admissionDate = cleanDateForBackend(cleanData.admissionDate);
            }

            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/v1/students/${id}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(cleanData)
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`${section} updated successfully`);
                
                // Log the response to debug
                console.log('Update response:', json.data);
                console.log('Previous studentId:', student.studentId);
                console.log('Updated studentId in response:', json.data.studentId);
                
                // Re-fetch the latest student data from the database to ensure fresh display
                await fetchStudent();
                setEditingSection(null);
            } else {
                console.error('Update failed:', json.message);
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

    const handleNestedInputChange = (parentKey: string, childKey: string, grandchildKey: string | null, value: any) => {
        setFormData((prev: any) => {
            if (!grandchildKey) {
                // Two levels deep (e.g., parentInfo.father)
                return {
                    ...prev,
                    [parentKey]: {
                        ...prev[parentKey],
                        [childKey]: value
                    }
                };
            } else {
                // Three levels deep (e.g., parentInfo.father.name)
                return {
                    ...prev,
                    [parentKey]: {
                        ...prev[parentKey],
                        [childKey]: {
                            ...prev[parentKey]?.[childKey],
                            [grandchildKey]: value
                        }
                    }
                };
            }
        });
    };

    const handleCancel = () => {
        setFormData(student);
        setEditingSection(null);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('photo', file);

            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/v1/students/${id}/photo`, {
                method: 'PUT',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formDataToSend
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Photo uploaded successfully');
                // Update formData with new photo path
                setFormData((prev: any) => ({ ...prev, photo: json.data.photo }));
                setStudent((prev: any) => ({ ...prev, photo: json.data.photo, avatar: normalizeImageUrl(json.data.photo) }));
            } else {
                toast.error(json.message || 'Failed to upload photo');
            }
        } catch (err: any) {
            console.error('Error uploading photo:', err);
            toast.error('Unable to upload photo');
        } finally {
            setUploading(false);
        }
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
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm font-semibold text-primary">Student ID: {student.studentId}</p>
                                        <p className="text-muted-foreground">
                                            {student.departmentName || (student.department && typeof student.department === 'object' ? (student.department.name || student.department.short_name || student.department.full_name) : student.department) || ''} • Batch {student.academicYear || student.enrollmentYear || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className={student.status === 'active' ? 'bg-success text-white' : ''}>
                                    {student.status}
                                </Badge>
                                <Button
                                    onClick={() => {
                                        setPasswordModalOpen(true);
                                        fetchAttendance();
                                        fetchProjects();
                                    }}
                                    className="ml-auto flex items-center gap-2 bg-primary hover:bg-primary/90"
                                >
                                    <Lock className="h-4 w-4" />
                                    Change Password
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="personal" className="space-y-6" onValueChange={(value) => {
                            if (value === 'attendance' && attendance.length === 0) {
                                fetchAttendance();
                            } else if (value === 'portfolio' && projects.length === 0) {
                                fetchProjects();
                            }
                        }}>
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
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border max-h-[70vh] overflow-y-auto">
                                        <h3 className="font-semibold text-lg">Edit Personal Information</h3>
                                        
                                        {/* Photo Upload Section */}
                                        <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-border">
                                            <Label>Student Photo</Label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                                                    <img 
                                                        src={(formData.photo ? normalizeImageUrl(formData.photo) : `https://ui-avatars.com/api/?name=${encodeURIComponent((student?.name || '') as string)}&background=random&size=80`) || `https://ui-avatars.com/api/?name=${encodeURIComponent((student?.name || '') as string)}&background=random&size=80`}
                                                        alt="Student"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={(e) => handlePhotoUpload(e)} 
                                                        className="cursor-pointer"
                                                        disabled={uploading}
                                                    />
                                                    <p className="text-xs text-muted-foreground">Upload image with student name: {student.firstName} {student.lastName}</p>
                                                    {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                                                </div>
                                            </div>
                                        </div>
                                        
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
                                                <Input type="date" value={formatDateForInput(formData.dateOfBirth)} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} />
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

                                        <div className="flex gap-2 pt-4 sticky bottom-0 bg-muted/30">
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
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border max-h-[70vh] overflow-y-auto">
                                        <h3 className="font-semibold text-lg">Edit Academic Information</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Student ID <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    value={formData.studentId || ''} 
                                                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                                                    placeholder="Enter unique student ID"
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">This ID will be saved in the studentId column</p>
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
                                                <Input type="date" value={formatDateForInput(formData.admissionDate)} onChange={(e) => handleInputChange('admissionDate', e.target.value)} />
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

                                        <div className="flex gap-2 pt-4 sticky bottom-0 bg-muted/30">
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
                                                    <p><span className="font-medium">Student ID:</span> {formData.studentId || student.studentId}</p>
                                                    <p><span className="font-medium">Roll No:</span> {formData.rollNumber || student.rollNumber}</p>
                                                    <p><span className="font-medium">Admission No:</span> {formData.admissionNo || student.admissionNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Status</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Batch:</span> {formData.batch || student.batch}</p>
                                                    <p><span className="font-medium">Year:</span> {formData.year || student.year || 'N/A'}</p>
                                                    <p><span className="font-medium">Semester:</span> {formData.semester !== undefined ? formData.semester : student.semester}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enrollment</h3>
                                                <div className="space-y-3 text-sm">
                                                    <p><span className="font-medium">Admission Date:</span> {formData.admissionDate || student.admissionDate || 'N/A'}</p>
                                                    <p><span className="font-medium">Admission Type:</span> {formData.admissionType || student.admissionType || 'N/A'}</p>
                                                    <p><span className="font-medium">Fee Status:</span> {formData.feeStatus || student.feeStatus || 'N/A'}</p>
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
                            <TabsContent value="parent" className="space-y-6">
                                {editingSection === 'parent' ? (
                                    <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border max-h-[70vh] overflow-y-auto">
                                        <h3 className="font-semibold text-lg">Edit Parent Information</h3>
                                        
                                        {/* Father's Information */}
                                        <div className="space-y-4 p-4 bg-white/50 rounded-lg">
                                            <h4 className="font-semibold text-base">Father's Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Father's Name</Label>
                                                    <Input value={formData.parentInfo?.father?.name || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'name', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input value={formData.parentInfo?.father?.phone || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'phone', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Email</Label>
                                                    <Input type="email" value={formData.parentInfo?.father?.email || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'email', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Occupation</Label>
                                                    <Input value={formData.parentInfo?.father?.occupation || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'occupation', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Qualification</Label>
                                                    <Input value={formData.parentInfo?.father?.qualification || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'qualification', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Annual Income</Label>
                                                    <Input value={formData.parentInfo?.father?.annualIncome || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'father', 'annualIncome', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mother's Information */}
                                        <div className="space-y-4 p-4 bg-white/50 rounded-lg">
                                            <h4 className="font-semibold text-base">Mother's Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Mother's Name</Label>
                                                    <Input value={formData.parentInfo?.mother?.name || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'name', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input value={formData.parentInfo?.mother?.phone || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'phone', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Email</Label>
                                                    <Input type="email" value={formData.parentInfo?.mother?.email || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'email', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Occupation</Label>
                                                    <Input value={formData.parentInfo?.mother?.occupation || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'occupation', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Qualification</Label>
                                                    <Input value={formData.parentInfo?.mother?.qualification || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'qualification', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Annual Income</Label>
                                                    <Input value={formData.parentInfo?.mother?.annualIncome || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'mother', 'annualIncome', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guardian's Information */}
                                        <div className="space-y-4 p-4 bg-white/50 rounded-lg">
                                            <h4 className="font-semibold text-base">Guardian's Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Guardian Name</Label>
                                                    <Input value={formData.parentInfo?.guardian?.name || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'guardian', 'name', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Relation</Label>
                                                    <Input value={formData.parentInfo?.guardian?.relation || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'guardian', 'relation', e.target.value)} />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input value={formData.parentInfo?.guardian?.phone || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'guardian', 'phone', e.target.value)} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Address</Label>
                                                    <Input value={formData.parentInfo?.guardian?.address || ''} onChange={(e) => handleNestedInputChange('parentInfo', 'guardian', 'address', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4 sticky bottom-0 bg-muted/30">
                                            <Button onClick={() => handleSaveSection('Parent Info')} disabled={saving} className="bg-success">
                                                <Save className="h-4 w-4 mr-2" /> Save
                                            </Button>
                                            <Button variant="outline" onClick={handleCancel} disabled={saving}>
                                                <X className="h-4 w-4 mr-2" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Father's Details</h3>
                                                <div className="p-4 rounded-xl border border-border bg-muted/5 space-y-2">
                                                    <p><span className="font-semibold">Name:</span> {formData.parentInfo?.father?.name || 'N/A'}</p>
                                                    <p><span className="font-semibold">Phone:</span> {formData.parentInfo?.father?.phone || 'N/A'}</p>
                                                    <p><span className="font-semibold">Email:</span> {formData.parentInfo?.father?.email || 'N/A'}</p>
                                                    <p><span className="font-semibold">Occupation:</span> {formData.parentInfo?.father?.occupation || 'N/A'}</p>
                                                    <p><span className="font-semibold">Qualification:</span> {formData.parentInfo?.father?.qualification || 'N/A'}</p>
                                                    <p><span className="font-semibold">Annual Income:</span> {formData.parentInfo?.father?.annualIncome || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mother's Details</h3>
                                                <div className="p-4 rounded-xl border border-border bg-muted/5 space-y-2">
                                                    <p><span className="font-semibold">Name:</span> {formData.parentInfo?.mother?.name || 'N/A'}</p>
                                                    <p><span className="font-semibold">Phone:</span> {formData.parentInfo?.mother?.phone || 'N/A'}</p>
                                                    <p><span className="font-semibold">Email:</span> {formData.parentInfo?.mother?.email || 'N/A'}</p>
                                                    <p><span className="font-semibold">Occupation:</span> {formData.parentInfo?.mother?.occupation || 'N/A'}</p>
                                                    <p><span className="font-semibold">Qualification:</span> {formData.parentInfo?.mother?.qualification || 'N/A'}</p>
                                                    <p><span className="font-semibold">Annual Income:</span> {formData.parentInfo?.mother?.annualIncome || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.parentInfo?.guardian?.name && (
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Guardian's Details</h3>
                                                <div className="p-4 rounded-xl border border-border bg-muted/5 space-y-2">
                                                    <p><span className="font-semibold">Name:</span> {formData.parentInfo.guardian.name}</p>
                                                    <p><span className="font-semibold">Relation:</span> {formData.parentInfo.guardian.relation || 'N/A'}</p>
                                                    <p><span className="font-semibold">Phone:</span> {formData.parentInfo.guardian.phone || 'N/A'}</p>
                                                    <p><span className="font-semibold">Address:</span> {formData.parentInfo.guardian.address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}

                                        <Button onClick={() => setEditingSection('parent')} className="mt-4">
                                            <Edit2 className="h-4 w-4 mr-2" /> Edit Parent Info
                                        </Button>
                                    </>
                                )}
                            </TabsContent>

                            {/* Attendance Tab */}
                            <TabsContent value="attendance" className="space-y-4">
                                {attendanceLoading ? (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <div className="inline-block">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                        <p className="mt-2">Loading attendance...</p>
                                    </div>
                                ) : attendance.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                        No attendance records found
                                    </div>
                                ) : (
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted/50 border-b border-border">
                                                <tr>
                                                    <th className="text-left px-4 py-3 font-semibold">Subject</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Classes Held</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Classes Attended</th>
                                                    <th className="text-left px-4 py-3 font-semibold">Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendance.map((record: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-border hover:bg-muted/30">
                                                        <td className="px-4 py-3">{record.subject || record.subjectName || 'N/A'}</td>
                                                        <td className="px-4 py-3">{record.totalClasses || record.classesHeld || 0}</td>
                                                        <td className="px-4 py-3">{record.attendedClasses || record.classesAttended || 0}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={record.percentage >= 75 ? 'default' : record.percentage >= 50 ? 'secondary' : 'destructive'}>
                                                                {Number(record.percentage || 0).toFixed(2)}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Portfolio/Projects Tab */}
                            <TabsContent value="portfolio" className="space-y-4">
                                {projectsLoading ? (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <div className="inline-block">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                        <p className="mt-2">Loading projects...</p>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                        No projects found
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {projects.map((project: any) => (
                                            <div key={project.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                                                <h4 className="font-semibold mb-2 text-foreground">{project.title || project.projectName}</h4>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{project.description || 'No description'}</p>
                                                <div className="space-y-2 text-sm mb-3">
                                                    {project.technology && <p><span className="font-medium">Technology:</span> {project.technology}</p>}
                                                    {project.startDate && <p><span className="font-medium">Date:</span> {new Date(project.startDate).toLocaleDateString()}</p>}
                                                </div>
                                                <Badge variant={project.status === 'approved' ? 'default' : project.status === 'pending' ? 'secondary' : 'destructive'}>
                                                    {project.status || 'Pending'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Password Change Modal */}
                {passwordModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full">
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Change Password
                                </h2>
                                <button
                                    onClick={() => {
                                        setPasswordModalOpen(false);
                                        setPasswordForm({ newPassword: '', confirmPassword: '' });
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="newPassword" className="text-foreground mb-2">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            placeholder="Enter new password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword" className="text-foreground mb-2">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            placeholder="Confirm password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 p-6 border-t border-border">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPasswordModalOpen(false);
                                        setPasswordForm({ newPassword: '', confirmPassword: '' });
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={passwordLoading}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
