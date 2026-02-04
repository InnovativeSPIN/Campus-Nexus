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
import { GraduationCap, Lock, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';

const roleRoutes: Record<UserRole, string> = {
  superadmin: '/admin/superadmin',
  executive: '/admin/executive',
  academic: '/admin/academic',
  'department-admin': '/admin/department-admin',
  faculty: '/faculty',
  student: '/student',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('superadmin');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(roleRoutes[user.role]);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(email, password, role);
    setIsLoading(false);

    if (success) {
      toast.success(`Welcome! Logged in as ${role}`);
      navigate(roleRoutes[role]);
    } else {
      toast.error('Invalid credentials. Use password: 123');
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
            EDUVERTEX
          </h1>
          {/* <p className="text-lg text-primary-foreground/80">
            Comprehensive education management system for administrators, faculty, and students.
          </p> */}
          {/* <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/70">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">50+</div>
              <div className="text-sm text-primary-foreground/70">Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">6</div>
              <div className="text-sm text-primary-foreground/70">Departments</div>
            </div>
          </div> */}
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
            <p className="mt-2 text-muted-foreground">
              Select your role and enter your credentials
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
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="executive">Executive Admin</SelectItem>
                  <SelectItem value="academic">Academic Admin</SelectItem>
                  <SelectItem value="department-admin">Department Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@edu.com"
                className="h-12"
                required
              />
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
          {/* 
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
            <p className="text-sm text-muted-foreground">
              Password: <code className="rounded bg-background px-1.5 py-0.5">p123</code>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
