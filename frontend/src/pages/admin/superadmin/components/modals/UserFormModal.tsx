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
import { Student, Faculty, Admin, Department, Role } from '@/types/auth';

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (initialData) {
      // if department comes as object or name, convert to id
      let data = { ...initialData } as any;
      if (data.department && typeof data.department !== 'number') {
        if (typeof data.department === 'object' && data.department.id) {
          data.department = String(data.department.id);
        } else if (!isNaN(parseInt(data.department, 10))) {
          data.department = String(parseInt(data.department, 10));
        }
      }
      setFormData(data);
    } else {
      setFormData({});
    }
    setFile(null); // Reset file when data changes
  }, [initialData, open]);

  // when roles are loaded we may need to derive role_id from existing role name
  useEffect(() => {
    if (initialData && roles.length > 0 && (initialData as Admin).role) {
      const matching = roles.find(r => r.role_name === (initialData as Admin).role);
      if (matching) {
        setFormData(prev => ({ ...prev, role_id: matching.role_id }));
      }
    }
  }, [roles, initialData]);

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

    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/v1/users/roles');
        const result = await response.json();
        if (result.success) {
          // remove any unexpected roles such as faculty/student and deduplicate
          const clean: Role[] = [];
          result.data.forEach((r: Role) => {
            const name = r.role_name.toLowerCase();
            if (name === 'faculty' || name === 'student') return;
            if (!clean.some(c => c.role_name.toLowerCase() === name)) {
              clean.push(r);
            }
          });
          setRoles(clean);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    if (open) {
      fetchDepartments();
      if (type === 'admin') {
        fetchRoles();
      }
    }
  }, [open, type]);

  // Fetch classes when batch is selected (for students)
  useEffect(() => {
    const fetchClasses = async () => {
      if (type === 'student' && (formData as Student).batch) {
        setLoadingClasses(true);
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('/api/v1/classes', { 
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
          });
          const result = await response.json();
          if (result.success) {
            // Filter classes by batch
            const filteredClasses = result.data.filter((c: any) => c.batch === (formData as Student).batch);
            setClasses(filteredClasses);
          }
        } catch (error) {
          console.error('Error fetching classes:', error);
        } finally {
          setLoadingClasses(false);
        }
      }
    };
    fetchClasses();
  }, [(formData as Student).batch, type]);

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
  };

  const studentFieldLabel = (label: string, required = false) => (
    <>
      {label}{' '}
      {required ? <span className="text-red-500">*</span> : <span>(Optional)</span>}
    </>
  );

  const getTitle = () => {
    if (type === 'student') return 'Student';
    if (type === 'faculty') return 'Faculty';
    return 'Admin';
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'add' ? 'Add' : 'Edit'} {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">{type === 'student' ? studentFieldLabel('Full Name', true) : 'Full Name'}</Label>
              <Input
                id="name"
                value={(formData as any).name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{type === 'student' ? studentFieldLabel('Email', true) : 'Email'}</Label>
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">{type === 'student' ? studentFieldLabel('Phone', true) : 'Phone'}</Label>
                  <Input
                    id="phone"
                    value={type === 'student' ? (formData as Student).phone || '' : (formData as Faculty).phone_number || ''}
                    onChange={(e) => updateField(type === 'student' ? 'phone' : 'phone_number', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">{type === 'student' ? studentFieldLabel('Gender') : 'Gender'}</Label>
                  <Select
                    value={(formData as any).gender || ''}
                    onValueChange={(value) => updateField('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
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
                    value={(formData as Faculty).faculty_college_code || ''}
                    onChange={(e) => updateField('faculty_college_code', e.target.value)}
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
                <Label htmlFor="department">{type === 'student' ? studentFieldLabel('Department', true) : 'Department'}</Label>
                <Select
                  value={(formData as any).department || ''}
                  onValueChange={(value) => updateField('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id || (dept as any)._id} value={String(dept.id)}>
                        {dept.full_name || dept.short_name}
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
              <>
                <div className="space-y-2">
                  <Label htmlFor="departmentCode">College / Department Code</Label>
                  <Input
                    id="departmentCode"
                    value={(formData as Admin).departmentCode || ''}
                    onChange={(e) => updateField('departmentCode', e.target.value)}
                    placeholder="Enter college/department code"
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">Provide the college code (e.g. dept short code) for department admin accounts.</div>
              </>
            )}

            {type === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">{studentFieldLabel('Academic Year (Batch)', true)}</Label>
                  <Select
                    value={(formData as Student).batch || ''}
                    onValueChange={(value) => updateField('batch', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="2025-2029">2025 - 2029</SelectItem>
                      <SelectItem value="2024-2028">2024 - 2028</SelectItem>
                      <SelectItem value="2023-2027">2023 - 2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData as Student).batch && (
                  <div className="space-y-2">
                    <Label htmlFor="className">{studentFieldLabel('Class Name')}</Label>
                    <Select
                      value={(formData as any).classId || ''}
                      onValueChange={(value) => updateField('classId', value)}
                      disabled={loadingClasses}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={String(cls.id)}>
                            {cls.name}
                          </SelectItem>
                        ))}
                        {classes.length === 0 && !loadingClasses && (
                          <div className="p-2 text-sm text-muted-foreground text-center">No classes available for this batch</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="status">{studentFieldLabel('Status')}</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="year">{studentFieldLabel('Study Year')}</Label>
                  <Select
                    value={(formData as Student).year || ''}
                    onValueChange={(value) => updateField('year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">{studentFieldLabel('Register Number', true)}</Label>
                  <Input
                    id="studentId"
                    value={(formData as Student).studentId || ''}
                    onChange={(e) => updateField('studentId', e.target.value)}
                    placeholder="Enter register number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNo">{studentFieldLabel('Roll Number')}</Label>
                  <Input
                    id="rollNo"
                    value={(formData as Student).rollNumber || ''}
                    onChange={(e) => updateField('rollNumber', e.target.value)}
                    placeholder="Enter roll number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionNo">{studentFieldLabel('Admission Number')}</Label>
                  <Input
                    id="admissionNo"
                    value={((formData as any).admissionNo) || ''}
                    onChange={(e) => updateField('admissionNo', e.target.value)}
                    placeholder="Enter admission number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emisNo">{studentFieldLabel('EMIS Number')}</Label>
                  <Input
                    id="emisNo"
                    value={((formData as any).emisNo) || ''}
                    onChange={(e) => updateField('emisNo', e.target.value)}
                    placeholder="Enter EMIS number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">{studentFieldLabel('Semester')}</Label>
                  <Select
                    value={(formData as Student).semester?.toString() || ''}
                    onValueChange={(value) => updateField('semester', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">{studentFieldLabel('Admission Date')}</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={(formData as Student).admissionDate ? String((formData as Student).admissionDate).split('T')[0] : ''}
                    onChange={(e) => updateField('admissionDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionType">{studentFieldLabel('Admission Type')}</Label>
                  <Select
                    value={(formData as Student).admissionType || ''}
                    onValueChange={(value) => updateField('admissionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admission type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="lateral">Lateral</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeStatus">{studentFieldLabel('Fee Status')}</Label>
                  <Select
                    value={(formData as Student).feeStatus || ''}
                    onValueChange={(value) => updateField('feeStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm mb-4">Bio Information</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">{studentFieldLabel('Alternate Phone')}</Label>
                  <Input
                    id="alternatePhone"
                    value={(formData as any).alternatePhone || ''}
                    onChange={(e) => updateField('alternatePhone', e.target.value)}
                    placeholder="Enter alternate phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">{studentFieldLabel('Date of Birth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={(formData as any).dateOfBirth ? String((formData as any).dateOfBirth).split('T')[0] : ''}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">{studentFieldLabel('Blood Group')}</Label>
                  <Select
                    value={(formData as any).bloodGroup || ''}
                    onValueChange={(value) => updateField('bloodGroup', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">{studentFieldLabel('Nationality')}</Label>
                  <Input
                    id="nationality"
                    value={(formData as any).nationality || ''}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="Enter nationality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="religion">{studentFieldLabel('Religion')}</Label>
                  <Input
                    id="religion"
                    value={(formData as any).religion || ''}
                    onChange={(e) => updateField('religion', e.target.value)}
                    placeholder="Enter religion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{studentFieldLabel('Category')}</Label>
                  <Input
                    id="category"
                    value={(formData as any).category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    placeholder="Enter category (e.g., General, SC, ST, OBC)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharNo">{studentFieldLabel('Aadhar Number')}</Label>
                  <Input
                    id="aadharNo"
                    value={(formData as any).aadharNo || ''}
                    onChange={(e) => updateField('aadharNo', e.target.value)}
                    placeholder="Enter Aadhar number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherTongue">{studentFieldLabel('Mother Tongue')}</Label>
                  <Input
                    id="motherTongue"
                    value={(formData as any).motherTongue || ''}
                    onChange={(e) => updateField('motherTongue', e.target.value)}
                    placeholder="Enter mother tongue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">{studentFieldLabel('LinkedIn URL')}</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={(formData as any).linkedinUrl || ''}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
                    placeholder="Enter LinkedIn profile URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residenceType">{studentFieldLabel('Residence Type')}</Label>
                  <Select
                    value={(formData as any).residenceType || ''}
                    onValueChange={(value) => updateField('residenceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select residence type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="hosteller">Hosteller</SelectItem>
                      <SelectItem value="day_scholar">Day Scholar</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                <Label htmlFor="role_id">Admin Role</Label>
                <Select
                  value={(formData as Admin).role_id?.toString() || ''}
                  onValueChange={(value) => {
                    const id = parseInt(value, 10);
                    const selected = roles.find(r => r.role_id === id);
                    if (selected) {
                      updateField('role_id', selected.role_id);
                      updateField('role', selected.role_name);
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {roles.map(r => (
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
