import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import campusNexusLogo from '@/assets/campusnexus.png';
import ispinLogo from '@/assets/iSPIN_logo.png';
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
import { Lock, Mail, Users, User as UserIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { mockAdmins } from '@/data/mockData';
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

const adminRoles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'executiveadmin', label: 'Executive Panel' },
    { value: 'academicadmin', label: 'Academic Admin' },
    { value: 'exam_cell_admin', label: 'Exam Cell Admin' },
    { value: 'placement_cell_admin', label: 'Placement Cell Admin' },
    { value: 'research_development_admin', label: 'Research & Development Admin' },
];

const roleRoutes: Partial<Record<UserRole, string>> = {
    superadmin: '/admin/superadmin',
    'super-admin': '/admin/superadmin',
    'department-admin': '/admin/department-admin',
    executive: '/admin/executive',
    executiveadmin: '/admin/executive',
    principal: '/admin/executive',
    'vice-principal': '/admin/executive',
    academic: '/admin/academic',
    academicadmin: '/admin/academic',
    exam_cell_admin: '/admin/superadmin', // Default to superadmin or specific dashboard if available
    placement_cell_admin: '/admin/superadmin',
    research_development_admin: '/admin/superadmin',
};

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('superadmin');
    const [adminName, setAdminName] = useState('');
    const [availableAdmins, setAvailableAdmins] = useState<{ name: string, email: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingNames, setIsFetchingNames] = useState(false);

    const { login, isAuthenticated, user, loginError, clearLoginError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            const roleStr = (typeof user.role === 'object' ? (user.role as any)?.role_name : user.role)?.toString().toLowerCase() as UserRole;
            const target = (roleStr && roleRoutes[roleStr]) || roleRoutes[role] || '/admin/executive/dashboard';
            navigate(target, { replace: true });
        }
    }, [isAuthenticated, user, navigate, role]);

    // Fetch admin names when role changes
    useEffect(() => {
        const fetchAdminNames = async () => {
            setIsFetchingNames(true);
            try {
                // Real API call if backend is running
                // role values now correspond directly to backend role names (no special
                // mapping required)
                const response = await fetch(`/api/v1/auth/admins/${role}`);
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    setAvailableAdmins(result.data);
                } else {
                    // Fallback to mock data filtered by role
                    const filtered = mockAdmins.filter(a => a.role === role).map(a => ({ name: a.name, email: a.email }));
                    setAvailableAdmins(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch admin names:', error);
                // Fallback to mock data on error
                const filtered = mockAdmins.filter(a => a.role === role).map(a => ({ name: a.name, email: a.email }));
                setAvailableAdmins(filtered);
            } finally {
                setIsFetchingNames(false);
            }
        };

        fetchAdminNames();
    }, [role]);

    const handleNameChange = (name: string) => {
        setAdminName(name);
        const selectedAdmin = availableAdmins.find(a => a.name === name);
        if (selectedAdmin) {
            setEmail(selectedAdmin.email);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const success = await login(email, password, role);
        setIsLoading(false);

        if (success) {
            toast.success(`Welcome back! Logged in as ${role}`);
            const target = roleRoutes[role] || '/admin/executive/dashboard';
            navigate(target, { replace: true });
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
                                style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.45))' }}
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-primary-foreground mb-4 whitespace-nowrap">
                        Campus Nexus
                    </h1>
                    <h1 className="text-2xl font-bold text-primary-foreground mb-4 whitespace-nowrap">
                        Admin Portal
                    </h1>
                    <p className="text-lg text-primary-foreground/50 whitespace-nowrap">
                        Exclusive access for authorized administrative personnel.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:hidden mb-8">
                        <div
                            className="inline-block rounded-full p-[3px] border border-primary/40"
                            style={{
                                background: 'rgba(var(--primary-rgb, 99,102,241),0.08)',
                                backdropFilter: 'blur(12px)',
                                boxShadow:
                                    '0 0 14px 3px rgba(99,102,241,0.22), 0 0 28px 6px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.22)',
                            }}
                        >
                            <img
                                src={campusNexusLogo}
                                alt="Campus Nexus"
                                className="h-24 w-24 rounded-full object-cover"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.45))' }}
                            />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-foreground">ADMIN LOGIN</h1>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Admin Portal</h2>
                        <p className="mt-2 text-muted-foreground">
                            Please select your department and identify yourself to proceed.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Select Admin Category
                            </Label>
                            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select admin category" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                    {adminRoles.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Select Your Name
                            </Label>
                            <Select value={adminName} onValueChange={handleNameChange} disabled={isFetchingNames || availableAdmins.length === 0}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder={isFetchingNames ? "Fetching names..." : availableAdmins.length === 0 ? "No admins found" : "Select your name"} />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                    {availableAdmins.map((admin) => (
                                        <SelectItem key={admin.email} value={admin.name}>{admin.name}</SelectItem>
                                    ))}
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
                                readOnly
                                placeholder="your.email@edu.com"
                                className="h-12 bg-muted/50 cursor-not-allowed"
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
                            disabled={isLoading || !email}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Authenticating...
                                </span>
                            ) : (
                                'Secure Login'
                            )}
                        </Button>

                        {/* Powered by iSPIN Badge */}
                        <div className="pt-2 flex items-center justify-center gap-2 select-none">
                            <span className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground/70">
                                Powered by
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 shadow-xs hover:border-orange-500/40 transition-all">
                                <img
                                    src={ispinLogo}
                                    alt="iSPIN Logo"
                                    className="h-4 w-4 rounded-full object-contain"
                                />
                                <span className="text-xs font-bold tracking-wide bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                                    iSPIN
                                </span>
                            </div>
                        </div>
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
            </div>
        </div>
    );
}
