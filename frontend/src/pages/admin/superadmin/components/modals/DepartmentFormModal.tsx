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
import { Department } from '@/types/auth';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Department>) => void;
  initialData?: Department;
  mode: 'add' | 'edit';
}

export function DepartmentFormModal({ open, onClose, onSave, initialData, mode }: DepartmentFormModalProps) {
  const [formData, setFormData] = useState<Partial<Department>>({});

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'add' ? 'Create' : 'Edit'} Department
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Department Code</Label>
            <Input
              id="code"
              value={formData.code || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., CS"
              required
            />
          </div>
          {mode === 'edit' && formData.headOfDepartment && (
            <div className="space-y-2">
              <Label>Head of Department</Label>
              <Input
                value={formData.headOfDepartment}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Managed in Admin settings</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {mode === 'add' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
