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

interface FacultyFormData {
  faculty_id?: number;
  Name: string;
  faculty_college_code: string;
  Anna_University_ID: string;
  AICTE_ID: string;
  employee_id: string;
  orcid_id: string;
  designation: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  date_of_joining: string;
  gender: string;
  blood_group: string;
  aadhar_number: string;
  pan_number: string;
  perm_address: string;
  curr_address: string;
  profile_image_url: string;
  department_id: string;
}

interface FacultyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  facultyData?: any;
  departments: any[];
  onSuccess: () => void;
}

export function FacultyFormModal({
  open,
  onOpenChange,
  mode,
  facultyData,
  departments,
  onSuccess,
}: FacultyFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState<FacultyFormData>({
    Name: '',
    faculty_college_code: '',
    Anna_University_ID: '',
    AICTE_ID: '',
    employee_id: '',
    orcid_id: '',
    designation: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    date_of_joining: '',
    gender: '',
    blood_group: '',
    aadhar_number: '',
    pan_number: '',
    perm_address: '',
    curr_address: '',
    profile_image_url: '',
    department_id: '',
  });

  useEffect(() => {
    if (mode === 'edit' && facultyData) {
      setFormData({
        faculty_id: facultyData.faculty_id,
        Name: facultyData.Name || '',
        faculty_college_code: facultyData.faculty_college_code || '',
        Anna_University_ID: facultyData.Anna_University_ID || '',
        AICTE_ID: facultyData.AICTE_ID || '',
        employee_id: facultyData.employee_id || '',
        orcid_id: facultyData.orcid_id || '',
        designation: facultyData.designation || '',
        email: facultyData.email || '',
        phone_number: facultyData.phone_number || '',
        date_of_birth: facultyData.date_of_birth || '',
        date_of_joining: facultyData.date_of_joining || '',
        gender: facultyData.gender || '',
        blood_group: facultyData.blood_group || '',
        aadhar_number: facultyData.aadhar_number || '',
        pan_number: facultyData.pan_number || '',
        perm_address: facultyData.perm_address || '',
        curr_address: facultyData.curr_address || '',
        profile_image_url: facultyData.profile_image_url || '',
        department_id: facultyData.department_id?.toString() || '',
      });
      setImagePreview(facultyData.profile_image_url || '');
    } else {
      resetForm();
    }
  }, [open, mode, facultyData]);

  const resetForm = () => {
    setFormData({
      Name: '',
      faculty_college_code: '',
      Anna_University_ID: '',
      AICTE_ID: '',
      employee_id: '',
      orcid_id: '',
      designation: '',
      email: '',
      phone_number: '',
      date_of_birth: '',
      date_of_joining: '',
      gender: '',
      blood_group: '',
      aadhar_number: '',
      pan_number: '',
      perm_address: '',
      curr_address: '',
      profile_image_url: '',
      department_id: '',
    });
    setImagePreview('');
  };

  const handleInputChange = (field: keyof FacultyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, profile_image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age.toString() : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Name || !formData.faculty_college_code || !formData.email || !formData.department_id || !formData.designation) {
      toast.error('Please fill in required fields: Name, College Code, email, Department, and Designation');
      return;
    }

    setLoading(true);
    try {
      // Prepare submit data (all fields as JSON)
      const submitData: any = {};

      Object.entries(formData).forEach(([key, value]) => {
        // Only skip empty strings for optional fields
        if (value !== undefined && value !== null && (value !== '' || key === 'department_id' || key === 'designation')) {
          submitData[key] = value;
        }
      });

      const url = mode === 'edit'
        ? `/api/v1/faculty/${formData.faculty_id}`
        : '/api/v1/faculty';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Faculty ${mode === 'edit' ? 'updated' : 'added'} successfully`);
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.message || `Failed to ${mode === 'edit' ? 'update' : 'add'} faculty`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'add'} faculty`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update faculty details' : 'Fill in all required fields marked with *'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] w-full pr-4">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
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

            {/* Name and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.Name}
                  onChange={(e) => handleInputChange('Name', e.target.value)}
                  placeholder="Full Name"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Faculty College Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.faculty_college_code}
                  onChange={(e) => handleInputChange('faculty_college_code', e.target.value)}
                  placeholder="e.g., NS20T15"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Anna University ID</Label>
                <Input
                  value={formData.Anna_University_ID}
                  onChange={(e) => handleInputChange('Anna_University_ID', e.target.value)}
                  placeholder="University ID"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>AICTE ID</Label>
                <Input
                  value={formData.AICTE_ID}
                  onChange={(e) => handleInputChange('AICTE_ID', e.target.value)}
                  placeholder="AICTE ID"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
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
                <Label>
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => handleInputChange('department_id', value)}
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Designation <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g., Assistant Professor"
                  disabled={loading}
                  required
                />
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
                  onValueChange={(value) => handleInputChange('gender', value)}
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
                  onValueChange={(value) => handleInputChange('blood_group', value)}
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
            {loading ? 'Saving...' : (mode === 'edit' ? 'Update Faculty' : 'Add Faculty')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
