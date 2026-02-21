import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/pages/admin/components/ui/dialog';
import { Button } from '@/pages/admin/components/ui/button';
import { Input } from '@/pages/admin/components/ui/input';
import { Label } from '@/pages/admin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/admin/components/ui/select';
import { Student, Faculty, Admin } from '@/types/auth';
import { mockDepartments } from '@/data/mockData';

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
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={(formData as Faculty).employeeId || ''}
                  onChange={(e) => updateField('employeeId', e.target.value)}
                  required
                />
              </div>
            )}

            {(type !== 'admin' || (type === 'admin' && (formData as Admin).role === 'academic')) && (
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
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
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
                    <SelectItem value="faculty_admin">Faculty Admin</SelectItem>
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
