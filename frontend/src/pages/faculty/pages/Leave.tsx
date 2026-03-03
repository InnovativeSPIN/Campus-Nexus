import { useState, useEffect } from "react";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Label } from "@/pages/faculty/components/ui/label";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/pages/faculty/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import {
    CalendarDays,
    PlusCircle,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    FileText,
    ArrowRight,
    Calendar,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

interface LeaveRequest {
    id: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    createdAt: string;
    approvalDate?: string;
}

const statusConfig = {
    pending: {
        label: "Pending",
        icon: Clock,
        color: "text-warning",
        bg: "bg-warning/10",
        border: "border-warning/30",
    },
    approved: {
        label: "Approved",
        icon: CheckCircle2,
        color: "text-success",
        bg: "bg-success/10",
        border: "border-success/30",
    },
    rejected: {
        label: "Rejected",
        icon: XCircle,
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive/30",
    },
    cancelled: {
        label: "Cancelled",
        icon: AlertCircle,
        color: "text-secondary",
        bg: "bg-secondary/10",
        border: "border-secondary/30",
    },
};

export default function Leave() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
    const [leaveBalance, setLeaveBalance] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [activeTab, setActiveTab] = useState("apply");
    const [leaveType, setLeaveType] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchMyLeaves();
        fetchLeaveBalance();
    }, []);

    const fetchLeaveBalance = async () => {
        try {
            setLoadingBalance(true);
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/v1/leave/balance", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const result = await response.json();
            if (result.success) {
                setLeaveBalance(result.data);
            }
        } catch (error) {
            console.error("Error fetching leave balance:", error);
        } finally {
            setLoadingBalance(false);
        }
    };

    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            const response = await fetch("/api/v1/leave/my-leaves", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const result = await response.json();
            if (result.success) {
                setMyLeaves(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatApiDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <MainLayout hideHeader={true}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-start justify-between"
            >
                <div>
                    <h1 className="page-header font-serif">Leave Management</h1>
                    <p className="text-muted-foreground -mt-4">
                        Apply for leave and track your requests
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {formatDate(currentTime)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-secondary" />
                            {formatTime(currentTime)}
                        </p>
                    </div>
                    <IntegratedNotificationBell />
                </div>
            </motion.div>

            {/* Leave Balance Summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
                {loadingBalance ? (
                    <div className="col-span-2 md:col-span-4 text-center text-muted-foreground py-8">
                        Loading leave balance...
                    </div>
                ) : leaveBalance ? (
                    Object.entries(leaveBalance)
                        .filter(([key]) => !['id', 'userId', 'userType', 'academicYear', 'createdAt', 'updatedAt'].includes(key))
                        .map(([leaveType, balance]: any, index) => {
                            const parsed = typeof balance === 'string' ? JSON.parse(balance) : balance;
                            const remaining = parsed.balance - parsed.used;
                            
                            return (
                                <motion.div
                                    key={leaveType}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="widget-card text-center"
                                >
                                    <p className="text-xs text-muted-foreground mb-2">{leaveType}</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {remaining}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        of {parsed.balance} remaining
                                    </p>
                                </motion.div>
                            );
                        })
                ) : null}
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="apply" className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Apply Leave
                    </TabsTrigger>
                    <TabsTrigger value="status" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        My Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="apply">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="widget-card max-w-2xl"
                    >
                        <h3 className="section-title flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Leave Application Form
                        </h3>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Leave Type</Label>
                                    <Select value={leaveType} onValueChange={setLeaveType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="casual">Casual Leave</SelectItem>
                                            <SelectItem value="medical">Medical Leave</SelectItem>
                                            <SelectItem value="onduty">On Duty Leave</SelectItem>
                                            <SelectItem value="vacation">Vacation Leave</SelectItem>
                                            <SelectItem value="special">Special Leave</SelectItem>
                                            <SelectItem value="lop">Leave Loss of Pay (LOP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>From Date</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>To Date</Label>
                                    <Input type="date" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Reason for Leave</Label>
                                <Textarea
                                    placeholder="Please provide a detailed reason for your leave request..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Load Assign</Label>
                                <Textarea
                                    placeholder="Describe your workload details (e.g., classes to handle, syllabus portion, lab sessions, evaluation work, etc.)..."
                                    rows={4}
                                />
                            </div>

                            {(leaveType === "medical" || leaveType === "onduty") && (
                                <div className="space-y-2">
                                    <Label>Supporting Documents (Optional)</Label>
                                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                        <p className="text-sm text-muted-foreground">
                                            Drag and drop files or click to upload
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    Submit Application
                                </Button>
                                <Button type="button" variant="outline">
                                    Save as Draft
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </TabsContent>

                <TabsContent value="status">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Clock className="w-8 h-8 text-muted-foreground animate-spin mb-4" />
                                <p className="text-muted-foreground">Loading your leave requests...</p>
                            </div>
                        ) : myLeaves.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-muted/10">
                                <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No leave requests yet</p>
                                <p className="text-sm text-muted-foreground mt-1">Apply for leave using the form above</p>
                            </div>
                        ) : (
                            myLeaves.map((request, index) => {
                                const config = statusConfig[request.status] || statusConfig["pending"];
                                const StatusIcon = config.icon;

                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={cn(
                                            "widget-card border-l-4",
                                            config.border
                                        )}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-foreground">{request.leaveType}</h4>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                                                        config.bg,
                                                        config.color
                                                    )}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {request.reason}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {formatApiDate(request.startDate)} {formatApiDate(request.endDate)} ({Math.ceil(request.totalDays)} days)
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Timeline */}
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                    request.status !== "rejected" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                                                )}>
                                                    1
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                    request.status === "approved"
                                                        ? "bg-success/20 text-success"
                                                        : request.status === "rejected"
                                                            ? "bg-destructive/20 text-destructive"
                                                            : "bg-muted text-muted-foreground"
                                                )}>
                                                    2
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                    request.status === "approved"
                                                        ? "bg-success/20 text-success"
                                                        : request.status === "rejected"
                                                            ? "bg-destructive/20 text-destructive"
                                                            : "bg-muted text-muted-foreground"
                                                )}>
                                                    3
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </motion.div>
                </TabsContent>
            </Tabs>
        </MainLayout>
    );
}


