import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    Building2,
    Filter
} from 'lucide-react';
import { Button } from '@/pages/admin/executive/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/pages/admin/executive/lib/utils';
import { toast } from 'sonner';

interface ForwardedLeave {
    id: string;
    facultyName: string;
    type: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
    proxy: string;
    loadAssign: string;
    status: string;
    appliedOn: string;
    forwardedOn: string;
}

export default function LeaveRequests() {
    const [requests, setRequests] = useState<ForwardedLeave[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Load from localStorage for demonstration
        const loadRequests = () => {
            const forwarded = JSON.parse(localStorage.getItem('forwardedLeaves') || '[]');
            setRequests(forwarded);
        };

        loadRequests();
        // Refresh periodically if needed, or just on mount
    }, []);

    const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
        const updated = requests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        );
        setRequests(updated);
        localStorage.setItem('forwardedLeaves', JSON.stringify(updated));

        toast.success(`Leave request ${newStatus === 'approved' ? 'Approved' : 'Rejected'} successfully`);
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Forwarded Leave Requests</h1>
                        <p className="text-muted-foreground">Manage leave requests forwarded by HODs for principal approval</p>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                        <Button
                            variant={filter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('all')}
                            className="px-4"
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'forwarded' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('forwarded')}
                            className="px-4"
                        >
                            Pending
                        </Button>
                        <Button
                            variant={filter === 'approved' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('approved')}
                            className="px-4"
                        >
                            Approved
                        </Button>
                    </div>
                </header>

                {filteredRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">No leave requests found</h3>
                        <p className="text-muted-foreground">Requests forwarded by Department HODs will appear here.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredRequests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <UserCheck className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground leading-tight">{request.facultyName}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Building2 className="w-3 h-3" />
                                                    <span>AI & DS Department</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "capitalize",
                                            request.status === 'forwarded' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                            request.status === 'approved' && "bg-green-100 text-green-700 hover:bg-green-100",
                                            request.status === 'rejected' && "bg-red-100 text-red-700 hover:bg-red-100"
                                        )}>
                                            {request.status === 'forwarded' ? 'HOD Forwarded' : request.status}
                                        </Badge>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 mb-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Leave Duration</span>
                                            <p className="text-sm font-semibold">{request.type}</p>
                                            <p className="text-xs text-muted-foreground">{request.fromDate} to {request.toDate}</p>
                                            <p className="text-xs font-medium text-primary mt-1">{request.days} Day(s)</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Arrangement</span>
                                            <p className="text-sm font-semibold">{request.proxy}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Load Proxy Assigned</p>
                                        </div>
                                    </div>

                                    {/* Narrative details */}
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                                                <Filter className="w-3 h-3" /> Reason for Leave
                                            </h4>
                                            <p className="text-sm text-foreground/90 bg-card p-3 rounded-lg border border-border">
                                                {request.reason}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Load Workload Details
                                            </h4>
                                            <p className="text-sm text-foreground/80 italic p-3 rounded-lg bg-orange-50/30 border border-orange-100">
                                                "{request.loadAssign}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border">
                                        <span>Applied: {request.appliedOn}</span>
                                        <span>Forwarded: {new Date(request.forwardedOn).toLocaleDateString()}</span>
                                    </div>

                                    {/* Actions */}
                                    {request.status === 'forwarded' && (
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <Button
                                                onClick={() => handleAction(request.id, 'approved')}
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleAction(request.id, 'rejected')}
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Decline
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
