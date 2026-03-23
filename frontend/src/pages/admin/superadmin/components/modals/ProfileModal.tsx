import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/pages/admin/superadmin/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/pages/admin/superadmin/components/ui/avatar';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
import { Student, Faculty } from '@/types/auth';
import { Mail, Phone, Building2, Calendar, Award } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  data: Student | Faculty | null;
  type: 'student' | 'faculty';
}

export function ProfileModal({ open, onClose, data, type }: ProfileModalProps) {
  if (!data) return null;

  const isStudent = type === 'student';
  const student = isStudent ? (data as Student) : null;
  const faculty = !isStudent ? (data as Faculty) : null;

  // Helper functions to get correct properties based on type
  const getName = () => {
    if (isStudent && student) {
      return `${student.firstName} ${student.lastName}`;
    } else if (faculty) {
      return faculty.Name;
    }
    return '';
  };

  const getPhone = () => {
    if (isStudent && student) {
      return student.phone;
    } else if (faculty) {
      return faculty.phone_number;
    }
    return '';
  };

  const getDepartment = () => {
    if (isStudent && student) {
      return student.departmentId;
    } else if (faculty) {
      return faculty.department_id;
    }
    return '';
  };

  const getEnrollmentYear = () => {
    return student?.batch || '';
  };

  const getJoinDate = () => {
    return faculty?.date_of_joining || '';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isStudent ? 'Student' : 'Faculty'} Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Avatar and name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {(getName() || '').split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{getName()}</h3>
              <Badge
                variant={data.status === 'active' ? 'default' : 'secondary'}
                className={data.status === 'active' ? 'bg-success' : ''}
              >
                {data.status}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{data.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{getPhone()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{getDepartment()}</span>
            </div>
            {isStudent && student && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Enrolled: {getEnrollmentYear()}</span>
              </div>
            )}
            {!isStudent && faculty && (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{faculty.designation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Joined: {getJoinDate()}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
