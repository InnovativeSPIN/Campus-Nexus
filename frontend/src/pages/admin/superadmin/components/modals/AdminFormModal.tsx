import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/pages/admin/superadmin/components/ui/dialog';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/superadmin/components/ui/select';
import { Label } from '@/pages/admin/superadmin/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from '@/pages/admin/superadmin/components/ui/scroll-area';

interface AdminFormData {
  id?: string | number;
  // Basic
  name: string;
  email: string;
  password: string;
  role_id: string;
  role: string;
  status: string;
  // IDs
  employee_code: string;
  anna_university_id: string;
  aicte_id: string;
  employee_id: string;
  orcid_id: string;
  // Contact
  phone_number: string;
  // Department / Designation
  department: string;
  departmentCode: string;
  designation: string;
  // Personal
  date_of_birth: string;
  date_of_joining: string;
  gender: string;
  blood_group: string;
  aadhar_number: string;
  pan_number: string;
  perm_address: string;
  curr_address: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface Department {
  id: number;
  full_name?: string;
  short_name?: string;
}

interface AdminFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  adminData?: any;
  onSuccess: () => void;
}

const emptyForm = (): AdminFormData => ({
  name: '',
  email: '',
  password: '',
  role_id: '',
  role: '',
  status: 'active',
  employee_code: '',
  anna_university_id: '',
  aicte_id: '',
  employee_id: '',
  orcid_id: '',
  phone_number: '',
  department: '',
  departmentCode: '',
  designation: '',
  date_of_birth: '',
  date_of_joining: '',
  gender: '',
  blood_group: '',
  aadhar_number: '',
  pan_number: '',
  perm_address: '',
  curr_address: '',
});

export function AdminFormModal({
  open,
  onOpenChange,
  mode,
  adminData,
  onSuccess,
}: AdminFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<AdminFormData>(emptyForm());

  useEffect(() => {
    if (mode === 'edit' && adminData) {
      setFormData({
        id: adminData.id,
        name: adminData.name || adminData.Name || '',
        email: adminData.email || '',
        password: '',
        role_id: adminData.role_id?.toString() || '',
        role: adminData.role || '',
        status: adminData.status || 'active',
        employee_code: adminData.faculty_college_code || adminData.employee_code || '',
        anna_university_id: adminData.Anna_University_ID || adminData.anna_university_id || '',
        aicte_id: adminData.AICTE_ID || adminData.aicte_id || '',
        employee_id: adminData.employee_id || '',
        orcid_id: adminData.orcid_id || '',
        phone_number: adminData.phone_number || adminData.phone || '',
        department: adminData.department_id?.toString() || adminData.department?.toString() || '',
        departmentCode: adminData.departmentCode || '',
        designation: adminData.designation || '',
        date_of_birth: adminData.date_of_birth || '',
        date_of_joining: adminData.date_of_joining || '',
        gender: adminData.gender || '',
        blood_group: adminData.blood_group || '',
        aadhar_number: adminData.aadhar_number || '',
        pan_number: adminData.pan_number || '',
        perm_address: adminData.perm_address || '',
        curr_address: adminData.curr_address || '',
      });
      setImagePreview(adminData.avatar || adminData.profile_image_url || '');
    } else {
      setFormData(emptyForm());
      setImagePreview('');
    }
    setAvatarFile(null);
  }, [open, mode, adminData]);

  useEffect(() => {
    if (!open) return;

    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/v1/users/roles');
        const result = await res.json();
        if (result.success) {
          const clean: Role[] = [];
          result.data.forEach((r: Role) => {
            const name = r.role_name.toLowerCase();
            if (name === 'faculty' || name === 'student') return;
            if (!clean.some((c) => c.role_name.toLowerCase() === name)) {
              clean.push(r);
            }
          });
          setRoles(clean);
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };

    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/v1/departments');
        const result = await res.json();
        if (result.success) setDepartments(result.data);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };

    fetchRoles();
    fetchDepartments();
  }, [open]);

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? age.toString() : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role_id) {
      toast.error('Please fill in required fields: Name, Email, and Role');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role_id: parseInt(formData.role_id, 10),
        isActive: formData.status !== 'inactive',
        // faculty / dept-admin extra fields
        faculty_college_code: formData.employee_code || undefined,
        Anna_University_ID: formData.anna_university_id || undefined,
        AICTE_ID: formData.aicte_id || undefined,
        employee_id: formData.employee_id || undefined,
        orcid_id: formData.orcid_id || undefined,
        phone_number: formData.phone_number || undefined,
        phone: formData.phone_number || undefined,
        department: formData.department || undefined,
        departmentCode: formData.departmentCode || formData.employee_code || undefined,
        designation: formData.designation || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        date_of_joining: formData.date_of_joining || undefined,
        gender: formData.gender || undefined,
        blood_group: formData.blood_group || undefined,
        aadhar_number: formData.aadhar_number || undefined,
        pan_number: formData.pan_number || undefined,
        perm_address: formData.perm_address || undefined,
        curr_address: formData.curr_address || undefined,
      };

      if (mode === 'add') {
        payload.password = formData.password || '123';
      }

      const url = mode === 'add' ? '/api/v1/users' : `/api/v1/users/${formData.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        const userId = mode === 'add' ? (result.data?._id || result.data?.id) : formData.id;

        if (avatarFile && userId) {
          const fd = new FormData();
          fd.append('photo', avatarFile);
          const photoRes = await fetch(`/api/v1/users/${userId}/photo`, {
            method: 'PUT',
            body: fd,
          });
          const photoResult = await photoRes.json();
          if (!photoResult.success) {
            toast.error('Admin saved but photo upload failed');
          }
        }

        toast.success(
          mode === 'add'
            ? 'Admin added successfully (default password: 123)'
            : 'Admin updated successfully'
        );
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error || `Failed to ${mode} admin`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || `Failed to ${mode} admin`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Admin' : 'Add New Admin'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update administrator details'
              : 'Fill in all required fields marked with *'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] w-full pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">

            {/* Profile Image */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Name and Basic IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full Name"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Employee / Admin Code <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.employee_code}
                  onChange={(e) => handleInputChange('employee_code', e.target.value)}
                  placeholder="e.g., NS20T15"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Anna University ID</Label>
                <Input
                  value={formData.anna_university_id}
                  onChange={(e) => handleInputChange('anna_university_id', e.target.value)}
                  placeholder="University ID"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>AICTE ID</Label>
                <Input
                  value={formData.aicte_id}
                  onChange={(e) => handleInputChange('aicte_id', e.target.value)}
                  placeholder="AICTE ID"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+91 8072435849"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Department and Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.department}
                  onValueChange={(v) => handleInputChange('department', v)}
                  disabled={loading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.full_name || dept.short_name}
                      </SelectItem>
                    ))}
                    {departments.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No departments available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g., Assistant Professor"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Admin Role <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.role_id}
                  onValueChange={(v) => {
                    const selected = roles.find((r) => r.role_id === parseInt(v, 10));
                    handleInputChange('role_id', v);
                    handleInputChange('role', selected?.role_name || '');
                  }}
                  disabled={loading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.role_id} value={r.role_id.toString()}>
                        {r.role_name.replace(/-/g, ' ')}
                      </SelectItem>
                    ))}
                    {roles.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No roles available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleInputChange('status', v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Academic IDs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ORCID ID</Label>
                <Input
                  value={formData.orcid_id}
                  onChange={(e) => handleInputChange('orcid_id', e.target.value)}
                  placeholder="0000-0000-0000-0000"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input
                  value={formData.employee_id}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  placeholder="Employee ID"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Age (Auto-calculated)</Label>
                <Input
                  type="text"
                  value={calculateAge(formData.date_of_birth)}
                  disabled={true}
                  placeholder="Age"
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Joining</Label>
                <Input
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => handleInputChange('date_of_joining', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => handleInputChange('gender', v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(v) => handleInputChange('blood_group', v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ID Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aadhar Number</Label>
                <Input
                  value={formData.aadhar_number}
                  onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                  placeholder="Aadhar number"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input
                  value={formData.pan_number}
                  onChange={(e) => handleInputChange('pan_number', e.target.value)}
                  placeholder="PAN number"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Permanent Address</Label>
                <textarea
                  value={formData.perm_address}
                  onChange={(e) => handleInputChange('perm_address', e.target.value)}
                  placeholder="Full permanent address"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Address</Label>
                <textarea
                  value={formData.curr_address}
                  onChange={(e) => handleInputChange('curr_address', e.target.value)}
                  placeholder="Full current address"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>
            </div>

            {/* Password (add mode only) */}
            {mode === 'add' && (
              <div className="space-y-2">
                <Label>Initial Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Leave blank to use default (123)"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the default password <span className="font-medium">123</span> will be set.
                </p>
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading
              ? 'Saving...'
              : mode === 'edit'
              ? 'Update Admin'
              : 'Add Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
