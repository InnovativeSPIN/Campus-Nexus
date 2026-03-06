import { useEffect, useState } from "react";

interface AnnouncementNotification {
    id: number;
    title: string;
    message: string;
    creatorRole: string;
    createdAt: string;
    updatedAt?: string;
}

interface UseAnnouncementNotificationResult {
    announcement: AnnouncementNotification | null;
    showNotification: boolean;
    setShowNotification: (show: boolean) => void;
    loading: boolean;
}

export function useAnnouncementNotification(): UseAnnouncementNotificationResult {
    const [announcement, setAnnouncement] = useState<AnnouncementNotification | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestAnnouncement = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/v1/announcements?limit=1&sort=createdAt:desc', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    const latestAnnouncement = result.data[0];
                    setAnnouncement(latestAnnouncement);

                    // Only show notification if announcement was created in last 24 hours
                    const createdAt = new Date(latestAnnouncement.createdAt).getTime();
                    const now = Date.now();
                    const oneDayInMs = 24 * 60 * 60 * 1000;

                    if (now - createdAt < oneDayInMs) {
                        // NEW: Check if this announcement ID has already been seen via localStorage
                        const seenIds = JSON.parse(localStorage.getItem('seen_announcement_ids') || '[]');
                        if (!seenIds.includes(latestAnnouncement.id)) {
                            setShowNotification(true);
                            // Mark as seen
                            localStorage.setItem('seen_announcement_ids', JSON.stringify([...seenIds, latestAnnouncement.id]));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching latest announcement:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestAnnouncement();
    }, []);

    return {
        announcement,
        showNotification,
        setShowNotification,
        loading
    };
}
