import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
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
import { GraduationCap, Lock, Mail, Users, User as UserIcon, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';

const roleRoutes: Partial<Record<UserRole, string>> = {
  'department-admin': '/admin/department-admin',
  faculty: '/faculty',
  student: '/student',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    name?: string;
    year?: number;
    department?: string;
    semester?: number;
    rollNo?: string;
    designation?: string;
  } | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role && roleRoutes[user.role]) {
      navigate(roleRoutes[user.role]!);
    }
  }, [isAuthenticated, user, navigate]);

  // Clear user details when role changes
  useEffect(() => {
    setUserDetails(null);
    setEmail('');
  }, [role]);

  // Fetch student details when the identifier (ID or email) is entered
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (email.trim().length === 0) {
        setUserDetails(null);
        return;
      }

      setIsFetchingDetails(true);
      try {
        if (role === 'student') {
          const response = await fetch(`/api/v1/auth/student-details/${email.trim()}`);
          const result = await response.json();
          if (result.success && result.data) {
            setUserDetails(result.data);
          } else {
            setUserDetails(null);
          }
        } else if (role === 'faculty') {
          const response = await fetch(`/api/v1/auth/faculty-details/${email.trim()}`);
          const result = await response.json();
          if (result.success && result.data) {
            // normalize to same shape used by UI
            setUserDetails({
              name: result.data.name,
              rollNo: result.data.collegeId || result.data.college_id || undefined,
              department: result.data.department,
              semester: undefined,
              year: undefined,
              designation: result.data.designation
            });
          } else {
            setUserDetails(null);
          }
        } else {
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchStudentDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [email, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await login(email, password, role); // "email" holds identifier (email or student ID)
    setIsLoading(false);

    if (success) {
      toast.success(`Welcome! Logged in as ${role}`);
      navigate(roleRoutes[role] || '/');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            NSCET PORTAL
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Education management system for students and faculty.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">NSCET ERP PORTAL </h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Select your role and enter your credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Role
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="department-admin">Department Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Details Display */}
            {userDetails && role !== 'department-admin' && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  User Details
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {userDetails.name && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{userDetails.name}</span>
                    </div>
                  )}
                  {userDetails.rollNo && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{role === 'faculty' ? 'Faculty ID:' : 'Roll No:'}</span>
                      <span className="font-medium">{userDetails.rollNo}</span>
                    </div>
                  )}
                  {userDetails.designation && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Designation:</span>
                      <span className="font-medium">{userDetails.designation}</span>
                    </div>
                  )}
                  {userDetails.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">{userDetails.year}{userDetails.semester ? ` (Semester ${userDetails.semester})` : ''}</span>
                    </div>
                  )}
                  {userDetails.department && (
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{userDetails.department}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {role === 'student' ? 'Email or Student ID' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type={role === 'student' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'student'
                    ? 'Email address or student ID'
                    : 'Enter your email address'
                }
                className="h-12"
                required
              />
              {isFetchingDetails && (
                <p className="text-xs text-muted-foreground mt-1">Fetching user details...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
