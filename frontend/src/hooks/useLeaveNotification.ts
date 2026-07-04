import { useEffect, useState } from "react";

export interface PendingLeaveItem {
    id: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    applicant: { name: string; role: string };
    createdAt: string;
}

interface UseLeaveNotificationResult {
    pendingLeaves: PendingLeaveItem[];
    showLeavePopup: boolean;
    setShowLeavePopup: (show: boolean) => void;
    loading: boolean;
}

export function useLeaveNotification(): UseLeaveNotificationResult {
    const [pendingLeaves, setPendingLeaves] = useState<PendingLeaveItem[]>([]);
    const [showLeavePopup, setShowLeavePopup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingLeaves = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authToken");
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };
                const [facRes, studRes] = await Promise.all([
                    fetch("/api/v1/leave/pending-approvals?limit=5", { headers }).catch(() => null),
                    fetch("/api/v1/student-leaves/approvals/pending/dept-admin", { headers }).catch(() => null)
                ]);

                let mappedFaculty: PendingLeaveItem[] = [];
                let mappedStudents: PendingLeaveItem[] = [];

                if (facRes && facRes.ok) {
                    const result = await facRes.json().catch(() => null);
                    if (result?.success && Array.isArray(result.data)) {
                        mappedFaculty = result.data.map((leave: any) => ({
                            id: leave.id,
                            leaveType: leave.leaveType,
                            startDate: leave.startDate,
                            endDate: leave.endDate,
                            totalDays: leave.totalDays,
                            reason: leave.reason,
                            applicant: {
                                name: leave.applicant?.name || "Unknown Faculty",
                                role: leave.applicant?.role || "Faculty"
                            },
                            createdAt: leave.createdAt
                        }));
                    }
                }

                if (studRes && studRes.ok) {
                    const result = await studRes.json().catch(() => null);
                    if (result?.success && Array.isArray(result.data)) {
                        mappedStudents = result.data.map((leave: any) => ({
                            id: leave.id,
                            leaveType: leave.leaveSubType ? `${leave.leaveType} (${leave.leaveSubType})` : leave.leaveType,
                            startDate: leave.startDate,
                            endDate: leave.endDate,
                            totalDays: leave.totalDays,
                            reason: leave.reason,
                            applicant: {
                                name: leave.student 
                                    ? `${leave.student.firstName} ${leave.student.lastName}`
                                    : "Unknown Student",
                                role: `Student${leave.student?.rollNumber ? ` (${leave.student.rollNumber})` : ""}`
                            },
                            createdAt: leave.createdAt
                        }));
                    }
                }

                const combined = [...mappedFaculty, ...mappedStudents];
                if (combined.length > 0) {
                    setPendingLeaves(combined);
                    setShowLeavePopup(true);
                }
            } catch (error) {
                console.error("Error fetching pending leaves for popup:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingLeaves();
    }, []);

    return { pendingLeaves, showLeavePopup, setShowLeavePopup, loading };
}
