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
import { Class, Department } from '@/types/auth';

interface ClassFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Class>) => void;
  initialData?: Class;
  mode: 'add' | 'edit';
  departments: Department[];
}

export function ClassFormModal({
  open,
  onClose,
  onSave,
  initialData,
  mode,
  departments,
}: ClassFormModalProps) {
  const [formData, setFormData] = useState<Partial<Class>>({
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        department_id:
          initialData.department_id ||
          (initialData.department && (initialData.department as any).id) ||
          (initialData.department && (initialData.department as any)._id) ||
          undefined,
      });
    } else {
      setFormData({
        status: 'active',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    if (formData.capacity !== undefined && formData.capacity < 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    if (formData.semester !== undefined && (formData.semester < 1 || formData.semester > 8)) {
      newErrors.semester = 'Semester must be between 1 and 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'add' ? 'Create' : 'Edit'} Class
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Class Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., II Year AI&DS"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.department_id?.toString() || ''}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  department_id: parseInt(value),
                }))
              }
            >
              <SelectTrigger
                id="department"
                className={errors.department_id ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id?.toString() || ''}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department_id && (
              <p className="text-xs text-red-500">{errors.department_id}</p>
            )}
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room">Room Number</Label>
            <Input
              id="room"
              value={formData.room || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, room: e.target.value }))
              }
              placeholder="e.g., CR-12"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              value={formData.capacity || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              placeholder="e.g., 60"
              className={errors.capacity ? 'border-red-500' : ''}
            />
            {errors.capacity && (
              <p className="text-xs text-red-500">{errors.capacity}</p>
            )}
          </div>

          {/* Batch */}
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Input
              id="batch"
              value={formData.batch || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, batch: e.target.value }))
              }
              placeholder="e.g., 2024-2028"
            />
          </div>

          {/* Semester */}
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData.semester?.toString() || ''}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  semester: value ? parseInt(value) : undefined,
                }))
              }
            >
              <SelectTrigger
                id="semester"
                className={errors.semester ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.semester && (
              <p className="text-xs text-red-500">{errors.semester}</p>
            )}
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              value={formData.academic_year || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  academic_year: e.target.value,
                }))
              }
              placeholder="e.g., 2025-2026"
            />
          </div>

          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={formData.section || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, section: e.target.value }))
              }
              placeholder="e.g., A, B, C"
              maxLength={10}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || 'active'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as 'active' | 'inactive',
                }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {mode === 'add' ? 'Create Class' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
