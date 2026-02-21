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
import { GraduationCap, Lock, Mail, Users, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mockAdmins } from '@/data/mockData';

const adminRoles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'executive', label: 'Executive Admin' },
    { value: 'academic', label: 'Academic Admin' },
    { value: 'exam_cell_admin', label: 'Exam Cell Admin' },
    { value: 'placement_cell_admin', label: 'Placement Cell Admin' },
    { value: 'research_development_admin', label: 'Research & Development Admin' },
];

const roleRoutes: Partial<Record<UserRole, string>> = {
    superadmin: '/admin/superadmin',
    'super-admin': '/admin/superadmin',
    executive: '/admin/executive',
    executiveadmin: '/admin/executive',
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

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user?.role && roleRoutes[user.role]) {
            navigate(roleRoutes[user.role]!);
        }
    }, [isAuthenticated, user, navigate]);

    // Fetch admin names when role changes
    useEffect(() => {
        const fetchAdminNames = async () => {
            setIsFetchingNames(true);
            try {
                // Real API call if backend is running
                const response = await fetch(`/api/v1/auth/admins/${role === 'executive' ? 'executiveadmin' : role === 'academic' ? 'academicadmin' : role}`);
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
            navigate(roleRoutes[role] || '/admin/superadmin');
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
                        NSCET ADMIN PORTAL
                    </h1>
                    <p className="text-lg text-primary-foreground/80">
                        Exclusive access for authorized administrative personnel.
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
                    </form>
                </div>
            </div>
        </div>
    );
}
