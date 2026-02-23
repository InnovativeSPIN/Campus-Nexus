import { useEffect, useState } from 'react';
import { Bell, Check, X, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  is_read: boolean;
  TimetableSlotAssignment: {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room_number: string;
  };
  Subject: {
    id: number;
    name: string;
    code: string;
  };
  Class: {
    id: number;
    name: string;
    year: string;
  };
  requestedByFaculty: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  createdAt: string;
  rejection_reason?: string | null;
  response_date?: string | null;
}

interface NotificationSummary {
  pending: number;
  accepted: number;
  rejected: number;
  unread: number;
  total: number;
}

export default function NotificationCenter() {
  const { authToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const endpoint = filterStatus === 'all'
        ? '/api/v1/faculty/notifications/all'
        : `/api/v1/faculty/notifications/all?status=${filterStatus}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.data);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/v1/faculty/notifications/summary', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setSummary(data.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchNotifications();
      fetchSummary();
    }
  }, [authToken, filterStatus]);

  const handleAcceptAssignment = async (notificationId: number) => {
    setProcessingId(notificationId);
    try {
      const response = await fetch(`/api/v1/faculty/notifications/${notificationId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to accept assignment');
      toast.success('Assignment accepted successfully');
      fetchNotifications();
      fetchSummary();
      setSelectedNotification(null);
    } catch (error) {
      toast.error('Failed to accept assignment');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectAssignment = async (notificationId: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(notificationId);
    try {
      const response = await fetch(`/api/v1/faculty/notifications/${notificationId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      });

      if (!response.ok) throw new Error('Failed to reject assignment');
      toast.success('Assignment rejected');
      fetchNotifications();
      fetchSummary();
      setSelectedNotification(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject assignment');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Timetable Notifications</h1>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
              <div className="text-sm font-medium text-blue-300">Total</div>
              <div className="text-2xl font-bold text-blue-100">{summary.total}</div>
            </div>
            <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
              <div className="text-sm font-medium text-yellow-300">Pending</div>
              <div className="text-2xl font-bold text-yellow-100">{summary.pending}</div>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
              <div className="text-sm font-medium text-green-300">Accepted</div>
              <div className="text-2xl font-bold text-green-100">{summary.accepted}</div>
            </div>
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
              <div className="text-sm font-medium text-red-300">Rejected</div>
              <div className="text-2xl font-bold text-red-100">{summary.rejected}</div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
              <div className="text-sm font-medium text-purple-300">Unread</div>
              <div className="text-2xl font-bold text-purple-100">{summary.unread}</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-600">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(notification.status)}`}>
                        {getStatusIcon(notification.status)}
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                      {!notification.is_read && (
                        <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm mb-3">
                      <div>
                        <p className="text-slate-400">Subject</p>
                        <p className="font-medium text-slate-200">{notification.Subject.name}</p>
                        <p className="text-xs text-slate-500">{notification.Subject.code}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Class</p>
                        <p className="font-medium text-slate-200">{notification.Class.name}</p>
                        <p className="text-xs text-slate-500">Year: {notification.Class.year}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Day & Time</p>
                        <p className="font-medium text-slate-200">{notification.TimetableSlotAssignment.day_of_week}</p>
                        <p className="text-xs text-slate-500">
                          {notification.TimetableSlotAssignment.start_time} - {notification.TimetableSlotAssignment.end_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Room</p>
                        <p className="font-medium text-slate-200">{notification.TimetableSlotAssignment.room_number || 'TBD'}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Requested by: {notification.requestedByFaculty.first_name} {notification.requestedByFaculty.last_name}
                    </p>

                    {notification.rejection_reason && (
                      <div className="mt-3 bg-red-900/30 border border-red-700 rounded p-2">
                        <p className="text-xs font-medium text-red-300 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-200">{notification.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {notification.status === 'pending' && (
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Respond to Assignment</h2>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Subject</p>
                    <p className="text-slate-200">{selectedNotification.Subject.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Class</p>
                    <p className="text-slate-200">{selectedNotification.Class.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Day & Time</p>
                    <p className="text-slate-200">{selectedNotification.TimetableSlotAssignment.day_of_week}</p>
                    <p className="text-sm text-slate-400">
                      {selectedNotification.TimetableSlotAssignment.start_time} - {selectedNotification.TimetableSlotAssignment.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Room</p>
                    <p className="text-slate-200">{selectedNotification.TimetableSlotAssignment.room_number || 'TBD'}</p>
                  </div>
                </div>

                {rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please explain why you are rejecting this assignment..."
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedNotification(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => handleRejectAssignment(selectedNotification.id)}
                  disabled={processingId === selectedNotification.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {processingId === selectedNotification.id ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleAcceptAssignment(selectedNotification.id)}
                  disabled={processingId === selectedNotification.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {processingId === selectedNotification.id ? 'Accepting...' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
