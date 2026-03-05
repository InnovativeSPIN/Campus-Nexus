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
                const res = await fetch("/api/v1/leave/pending-approvals?limit=5", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const result = await res.json();
                if (result.success && result.data && result.data.length > 0) {
                    setPendingLeaves(result.data);
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
