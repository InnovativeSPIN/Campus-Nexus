import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/pages/admin/superadmin/components/ui/dialog';
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
import { Student, Faculty, Admin, Department } from '@/types/auth';

type FormData = Partial<Student | Faculty | Admin>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  type: 'student' | 'faculty' | 'admin';
  initialData?: FormData;
  mode: 'add' | 'edit';
}

export function UserFormModal({ open, onClose, onSave, type, initialData, mode }: UserFormModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
    setFile(null); // Reset file when data changes
  }, [initialData, open]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/v1/departments');
        const result = await response.json();
        if (result.success) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, avatarFile: file } as any);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fetch department code if department is selected
    if (field === 'department' && type === 'admin' && (formData as Admin).role === 'department-admin') {
      const selectedDept = departments.find(d => d.name === value);
      if (selectedDept) {
        setFormData(prev => ({ ...prev, departmentCode: selectedDept.code }));
      }
    }
  };

  const getTitle = () => {
    if (type === 'student') return 'Student';
    if (type === 'faculty') return 'Faculty';
    return 'Admin';
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'add' ? 'Add' : 'Edit'} {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={(formData as any).name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={(formData as any).email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
            {type === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="avatar">Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {(file || (formData as any).avatar) && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={file ? URL.createObjectURL(file) : (formData as any).avatar}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {type !== 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={(formData as Student | Faculty).phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                />
              </div>
            )}

            {type === 'faculty' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="orcidId">ORCID ID</Label>
                  <Input
                    id="orcidId"
                    value={(formData as Faculty).orcidId || ''}
                    onChange={(e) => updateField('orcidId', e.target.value)}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={(formData as Faculty).employeeId || ''}
                    onChange={(e) => updateField('employeeId', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phdStatus">PhD Status</Label>
                  <Select
                    value={(formData as Faculty).phdStatus || ''}
                    onValueChange={(value) => updateField('phdStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PhD status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="Completed">PhD Completed</SelectItem>
                      <SelectItem value="Pursuing">PhD Pursuing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thesisTitle">Title of the thesis / Field of research</Label>
                  <Input
                    id="thesisTitle"
                    value={(formData as Faculty).thesisTitle || ''}
                    onChange={(e) => updateField('thesisTitle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerNo">Register No</Label>
                  <Input
                    id="registerNo"
                    value={(formData as Faculty).registerNo || ''}
                    onChange={(e) => updateField('registerNo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guideName">Guide Name</Label>
                  <Input
                    id="guideName"
                    value={(formData as Faculty).guideName || ''}
                    onChange={(e) => updateField('guideName', e.target.value)}
                  />
                </div>
              </>
            )}

            {(type !== 'admin' || (type === 'admin' && ((formData as Admin).role === 'academic' || (formData as Admin).role === 'department-admin'))) && (
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={(formData as any).department || ''}
                  onValueChange={(value) => updateField('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id || (dept as any)._id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                    {departments.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No departments available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === 'admin' && (formData as Admin).role === 'department-admin' && (
              <div className="space-y-2">
                <Label htmlFor="departmentCode">Department Code</Label>
                <Input
                  id="departmentCode"
                  value={(formData as Admin).departmentCode || ''}
                  readOnly
                  placeholder="Select a department to see code"
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            )}

            {type === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentYear">Enrollment Year</Label>
                  <Input
                    id="enrollmentYear"
                    type="number"
                    value={(formData as Student).enrollmentYear || ''}
                    onChange={(e) => updateField('enrollmentYear', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={(formData as Student).status || ''}
                    onValueChange={(value) => updateField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {type === 'faculty' && (
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  value={(formData as Faculty).designation || ''}
                  onValueChange={(value) => updateField('designation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="HOD">Head of Department (HOD)</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Lab Assistant">Lab Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="role">Admin Role</Label>
                <Select
                  value={(formData as Admin).role || ''}
                  onValueChange={(value) => updateField('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="academic">Academic Admin</SelectItem>
                    <SelectItem value="exam_cell_admin">Exam Cell Admin</SelectItem>
                    <SelectItem value="placement_cell_admin">Placement Cell Admin</SelectItem>
                    <SelectItem value="research_development_admin">Research & Development Admin</SelectItem>
                    <SelectItem value="department-admin">Department Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {mode === 'add' ? 'Add' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
