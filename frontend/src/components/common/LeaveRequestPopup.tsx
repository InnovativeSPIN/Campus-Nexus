import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PendingLeaveItem } from "@/hooks/useLeaveNotification";

interface LeaveRequestPopupProps {
    isOpen: boolean;
    onClose: () => void;
    pendingLeaves: PendingLeaveItem[];
}

export function LeaveRequestPopup({ isOpen, onClose, pendingLeaves }: LeaveRequestPopupProps) {
    const navigate = useNavigate();

    const handleReview = () => {
        onClose();
        navigate("/admin/department-admin/leave");
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                {/* Header Banner */}
                <div className="border-b border-border pb-4 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Pending Leave Requests</p>
                        <p className="text-xs text-muted-foreground">
                            {pendingLeaves.length} request{pendingLeaves.length !== 1 ? "s" : ""} awaiting your approval
                        </p>
                    </div>
                    <span className="text-2xl font-black text-warning">{pendingLeaves.length}</span>
                </div>

                <DialogHeader>
                    <DialogTitle className="text-left text-lg">Review Leave Requests</DialogTitle>
                </DialogHeader>

                {/* Leave Items */}
                <div className="space-y-3 py-2">
                    {pendingLeaves.map((leave) => (
                        <div
                            key={leave.id}
                            className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="font-semibold text-sm text-foreground">
                                        {leave.applicant?.name || "Unknown"}
                                    </span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {leave.leaveType}
                                    </span>
                                </div>
                                <span className="text-xs text-warning font-medium bg-warning/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarDays className="w-3 h-3" />
                                {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                                <span className="ml-1 font-medium text-foreground">({Math.ceil(leave.totalDays)} days)</span>
                            </div>
                            {leave.reason && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">{leave.reason}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-3 border-t border-border">
                    <Button onClick={handleReview} className="flex-1 flex items-center gap-2">
                        Review & Approve
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
