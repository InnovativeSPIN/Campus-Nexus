import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import campusNexusLogo from '@/assets/campusnexus.png';
import ispinLogo from '@/assets/iSPIN_logo.png';
import { UserRole } from '@/types/auth';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import { Label } from '@/pages/admin/superadmin/components/ui/label';
import { Lock, Mail, Users, User as UserIcon, Calendar, Building } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/admin/superadmin/components/ui/alert-dialog';

const roleRoutes: Record<string, string> = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
  'department-admin': '/admin/department-admin/dashboard',
  executive: '/admin/executive/dashboard',
  executiveadmin: '/admin/executive/dashboard',
  'executive-admin': '/admin/executive/dashboard',
  principal: '/admin/executive/dashboard',
  'vice-principal': '/admin/executive/dashboard',
  'vice principal': '/admin/executive/dashboard',
  superadmin: '/admin/superadmin',
  'super-admin': '/admin/superadmin',
  academic: '/admin/academic',
  academicadmin: '/admin/academic',
  exam_cell_admin: '/admin/exam-cell/dashboard',
  placement_cell_admin: '/admin/superadmin',
  research_development_admin: '/admin/superadmin',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const { loginError, clearLoginError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const userRoleStr = (typeof user.role === 'object' ? (user.role as any)?.role_name || (user.role as any)?.name : user.role)?.toString().toLowerCase();
      const target = (userRoleStr && roleRoutes[userRoleStr]) || roleRoutes[user.role] || '/student/dashboard';
      if (target) {
        navigate(target, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch student or faculty details when the identifier (ID or email) is entered
  useEffect(() => {
    const fetchUserDetails = async () => {
      const identifier = email.trim();
      if (identifier.length < 3) {
        setUserDetails(null);
        return;
      }

      setIsFetchingDetails(true);
      try {
        // Try student lookup first
        const studentRes = await fetch(`/api/v1/auth/student-details/${encodeURIComponent(identifier)}`);
        if (studentRes.ok) {
          const result = await studentRes.json();
          if (result.success && result.data) {
            setUserDetails(result.data);
            setIsFetchingDetails(false);
            return;
          }
        }

        // Next try faculty lookup if not student
        const facultyRes = await fetch(`/api/v1/auth/faculty-details/${encodeURIComponent(identifier)}`);
        if (facultyRes.ok) {
          const result = await facultyRes.json();
          if (result.success && result.data) {
            const roleId = result.data.role_id || result.data.roleId || result.data.role?.role_id;
            const roleName = (result.data.role && typeof result.data.role === 'string') ? result.data.role : result.data.role?.role_name;
            if (parseInt(roleId, 10) === 7 || (roleName && roleName.toString().toLowerCase().includes('admin'))) {
              setUserDetails(null);
            } else {
              setUserDetails({
                name: result.data.name,
                rollNo: result.data.collegeId || result.data.college_id || undefined,
                department: result.data.department,
                designation: result.data.designation
              });
            }
            setIsFetchingDetails(false);
            return;
          }
        }

        setUserDetails(null);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUserDetails(null);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchUserDetails, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome back! Logged in successfully.');
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
            <div
              className="rounded-full p-[3px] border border-white/30"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                boxShadow:
                  '0 0 16px 4px rgba(255,255,255,0.20), 0 0 32px 8px rgba(99,179,237,0.14), inset 0 1px 0 rgba(255,255,255,0.30)',
              }}
            >
              <img
                src={campusNexusLogo}
                alt="Campus Nexus"
                className="h-36 w-36 rounded-full object-cover"
                style={{
                  filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.45))',
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Campus Nexus
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Education management system for students, faculty, and administration.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen p-8 bg-background justify-between">
        <div className="w-full max-w-md mx-auto my-auto space-y-8">
          <div className="text-center lg:hidden mb-8">
            <div
              className="inline-block rounded-full p-[3px] border border-white/30"
              style={{
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(12px)',
                boxShadow:
                  '0 0 14px 3px rgba(99,179,237,0.22), 0 0 28px 6px rgba(147,51,234,0.14), inset 0 1px 0 rgba(255,255,255,0.28)',
              }}
            >
              <img
                src={campusNexusLogo}
                alt="Campus Nexus"
                className="h-24 w-24 rounded-full object-cover"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.40))' }}
              />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight uppercase tracking-tight">Campus Nexus</h1>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Enter your credentials to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Details Display */}
            {userDetails && (
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
                      <span className="text-muted-foreground">ID / Roll No:</span>
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
                      <span className="font-medium">
                        {userDetails.year}
                        {userDetails.semester ? ` (Semester ${userDetails.semester})` : ''}
                      </span>
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
                Email or Faclty / Student ID
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your User ID"
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

          <AlertDialog open={!!loginError} onOpenChange={(open) => { if (!open) clearLoginError(); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>User not found</AlertDialogTitle>
                <AlertDialogDescription>
                  {loginError || 'Invalid credentials or user not found.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => clearLoginError()}>Close</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearLoginError()}>OK</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Powered by ISPIN Footer - Pinned at bottom */}
        <div className="pt-4 pb-2 border-t border-border/40 flex items-center justify-center gap-3 w-full max-w-md mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#f26522] drop-shadow-sm">
            POWERED BY ISPIN
          </span>
          <div className="relative flex items-center justify-center rounded-full p-[2px] bg-gradient-to-tr from-[#ea580c] via-[#f26522] to-[#f97316] shadow-[0_0_12px_rgba(242,101,34,0.35)]">
            <img
              src={ispinLogo}
              alt="iSPIN Logo"
              className="h-8 w-8 rounded-full object-contain bg-white p-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
