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
    Filter,
    FileText,
} from 'lucide-react';
import { Button } from '@/pages/admin/executive/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/pages/admin/executive/lib/utils';
import { toast } from '@/components/ui/sonner';

interface Leave {
    id: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: string;
    createdAt: string;
    loadAssign?: string;
    approverName?: string;
    applicant?: {
        name: string;
        email: string;
        role?: string;
    };
    departmentId?: number;
}

export default function LeaveRequests() {
    const [requests, setRequests] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [actioning, setActioning] = useState<number | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/v1/leave/pending-approvals", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const result = await response.json();
            if (result.success) {
                setRequests(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, newStatus: 'approved' | 'rejected') => {
        try {
            setActioning(id);
            const token = localStorage.getItem("authToken");
            const response = await fetch(`/api/v1/leave/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    status: newStatus,
                    remarks: `Final decision by Executive Admin.`,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Leave request ${newStatus} successfully`);
                setRequests(prev => prev.filter(req => req.id !== id));
            } else {
                toast.error(result.error || "Failed to process request");
            }
        } catch (error) {
            console.error("Error processing action:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setActioning(null);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'New (Pending)';
            case 'hod_approved': return 'HOD Forwarded';
            case 'approved': return 'Final Approved';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        if (filter === 'pending') return req.status === 'pending' || req.status === 'hod_approved';
        return req.status === filter;
    });

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Leave Requests Management</h1>
                        <p className="text-muted-foreground">Manage and provide final approval for leave requests</p>
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
                            variant={filter === 'pending' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('pending')}
                            className="px-4"
                        >
                            Waiting
                        </Button>
                        <Button
                            variant={filter === 'hod_approved' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter('hod_approved')}
                            className="px-4"
                        >
                            HOD Forwarded
                        </Button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
                        <p className="text-muted-foreground">Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">No pending requests</h3>
                        <p className="text-muted-foreground">Any requests awaiting your final approval will appear here.</p>
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
                                                <h3 className="text-lg font-bold text-foreground leading-tight">{request.applicant?.name || "Faculty Member"}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <Building2 className="w-3 h-3" />
                                                    <span>{request.applicant?.role || "Faculty"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "capitalize",
                                            request.status === 'pending' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                                            request.status === 'hod_approved' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                            request.status === 'approved' && "bg-green-100 text-green-700 hover:bg-green-100",
                                            request.status === 'rejected' && "bg-red-100 text-red-700 hover:bg-red-100"
                                        )}>
                                            {getStatusLabel(request.status)}
                                        </Badge>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 mb-6">
                                        <div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Leave Duration</span>
                                            <p className="text-sm font-semibold">{request.leaveType}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}</p>
                                            <p className="text-xs font-medium text-primary mt-1">{request.totalDays} Day(s)</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Request Info</span>
                                            <p className="text-sm font-semibold">ID: #{request.id}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Process Stage: {getStatusLabel(request.status)}</p>
                                        </div>
                                    </div>

                                    {/* HOD Info if available */}
                                    {request.status === 'hod_approved' && request.approverName && (
                                        <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-800">
                                                Cleared by HOD: {request.approverName}
                                            </span>
                                        </div>
                                    )}

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
                                        {request.loadAssign && (
                                            <div>
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> Arrangement Details
                                                </h4>
                                                <p className="text-sm text-foreground/80 italic p-3 rounded-lg bg-orange-50/10 border border-orange-100/50">
                                                    "{request.loadAssign}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border">
                                        <span>Applied: {new Date(request.createdAt).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3" />
                                            <span>Staff Request</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {(request.status === 'pending' || request.status === 'hod_approved') && (
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <Button
                                                disabled={actioning === request.id}
                                                onClick={() => handleAction(request.id, 'approved')}
                                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                            >
                                                {actioning === request.id ? "..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>}
                                            </Button>
                                            <Button
                                                disabled={actioning === request.id}
                                                variant="outline"
                                                onClick={() => handleAction(request.id, 'rejected')}
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {actioning === request.id ? "..." : <><XCircle className="w-4 h-4 mr-2" /> Decline</>}
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
