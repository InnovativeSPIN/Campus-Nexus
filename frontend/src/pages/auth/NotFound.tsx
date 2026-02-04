import { useNavigate } from 'react-router-dom';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { GraduationCap, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                    <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-6xl font-bold text-primary">404</h1>
                    <p className="mt-2 text-xl text-muted-foreground">Page not found</p>
                    <p className="mt-1 text-muted-foreground">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
                <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Login
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
