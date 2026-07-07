import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Calendar, Clock, BookOpen, GraduationCap, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, X
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/pages/faculty/lib/utils";

export function AlterationRequestPopup() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    // Initial check
    fetchRequests();
    // Frequent check for alterations (every 10 seconds)
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Use the alteration-plan/my-requests endpoint — derives user from auth token
      const res = await fetch(`/api/v1/faculty/alteration-plan/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const result = await res.json();
      
      if (result.success && result.data) {
        const pendingRequests = result.data.filter((r: any) => r.status === 'pending');
        // If we found pending requests and popup is not already showing these
        if (pendingRequests.length > 0) {
          if (pendingRequests.length !== requests.length || !isOpen) {
            setRequests(pendingRequests);
            setIsOpen(true);
          }
        } else if (isOpen) {
          setIsOpen(false);
          setRequests([]);
        }
      }
    } catch (err) {
      // Fail silently for polling
    }
  };

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      setActionLoading(id);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/v1/faculty/alteration-plan/${id}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rejection_reason: "Declined via popup" }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Substitution ${action === 'accept' ? 'accepted' : 'rejected'}!`);
        // Remove handled request
        const nextRequests = requests.filter(r => r.id !== id);
        setRequests(nextRequests);
        if (nextRequests.length === 0) setIsOpen(false);
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen || requests.length === 0) return null;

  const current = requests[0];
  let periodInfo: any = {};
  try {
     // If backend transformed it, it might be in 'reason' as string or parsed
     periodInfo = typeof current.reason === 'string' && current.reason.startsWith('{') 
        ? JSON.parse(current.reason) 
        : { subject_name: current.reason };
  } catch (e) {}

  const dateStr = new Date(current.start_date || current.startDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card w-full max-w-[500px] rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary p-6 text-primary-foreground relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif leading-none mb-1 text-white">New Alteration Request</h3>
                <p className="text-sm text-white/80 font-medium">Pending Colleague Approval</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Faculty Section */}
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Requested By</p>
                <p className="text-lg font-bold text-foreground">{current.applicant?.Name || current.absent_faculty?.Name || "Faculty Member"}</p>
                <p className="text-xs text-muted-foreground">{current.applicant?.email || current.absent_faculty?.email || ""}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <Calendar className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Date</p>
                <p className="text-sm font-bold truncate">{dateStr}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <Clock className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Period</p>
                <p className="text-sm font-bold truncate">{periodInfo.period_label || "Class Period"}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <GraduationCap className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Class</p>
                <p className="text-sm font-bold truncate">{periodInfo.class_name || "N/A"}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <BookOpen className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Subject</p>
                <p className="text-sm font-bold truncate">{periodInfo.subject_name || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-700">
               <AlertCircle className="w-4 h-4 flex-shrink-0" />
               <p className="text-[11px] font-medium leading-relaxed">
                 Please ensure you have no conflicting classes for this period before accepting.
               </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={() => handleAction(current.id, 'reject')}
              disabled={actionLoading !== null}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-destructive/20 text-destructive font-bold hover:bg-destructive/5 transition-all disabled:opacity-50"
            >
              {actionLoading === current.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={() => handleAction(current.id, 'accept')}
              disabled={actionLoading !== null}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-success text-white font-bold hover:bg-success/90 shadow-lg shadow-success/20 transition-all disabled:opacity-50"
            >
              {actionLoading === current.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve
            </button>
          </div>

          {requests.length > 1 && (
            <div className="bg-muted px-6 py-2 border-t border-border flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>{requests.length - 1} more pending requests</span>
              <button onClick={fetchRequests} className="hover:text-primary flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
