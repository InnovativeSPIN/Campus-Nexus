import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Label } from "@/pages/faculty/components/ui/label";
import {
  Calendar, Clock, CheckCircle2, User, FileText,
  RefreshCw, CheckIcon, ChevronDown, ChevronUp, Save, Users
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from '@/components/ui/sonner';
import { 
  Select as ShadSelect, 
  SelectContent as ShadSelectContent, 
  SelectItem as ShadSelectItem, 
  SelectTrigger as ShadSelectTrigger, 
  SelectValue as ShadSelectValue 
} from "@/components/ui/select";

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  designation?: string;
}

interface Period {
  date: string;
  period_slot_id: number;
  subject_id: number;
  class_id: number;
  master_id: number;
  requested_substitute_faculty_id: number;
  // UI helper fields
  subject_name?: string;
  class_name?: string;
  start_time?: string;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  overall_status: string;
  substitute_approval_status?: string;
  createdAt: string;
  applicant?: Faculty;
  substituteFaculty?: Faculty;
  affected_periods?: Period[];
}

export default function InchargeAlterationQueue({ isNested = false }: { isNested?: boolean }) {
  const [queue, setQueue] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [expandedLeaveId, setExpandedLeaveId] = useState<number | null>(null);
  const [colleagues, setColleagues] = useState<Faculty[]>([]);
  const [editedPeriods, setEditedPeriods] = useState<Record<number, Period[]>>({});

  useEffect(() => {
    fetchQueue();
    fetchColleagues();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/v1/faculty/leave-management/alteration/apply-queue", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success) {
        setQueue(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
      toast.error("Failed to load alterations queue");
    } finally {
      setLoading(false);
    }
  };

  const fetchColleagues = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/v1/faculty/alteration/department-colleagues", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (result.success) {
        setColleagues(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching colleagues:", error);
    }
  };

  const handleApply = async (leaveId: number) => {
    try {
      setApplyingId(leaveId);
      const token = localStorage.getItem("authToken");
      
      const payload = {
        affected_periods: editedPeriods[leaveId] || queue.find(l => l.id === leaveId)?.affected_periods
      };

      const response = await fetch(`/api/v1/faculty/leave-management/alteration/${leaveId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Alterations applied successfully");
        fetchQueue();
        setExpandedLeaveId(null);
      } else {
        toast.error(result.error || "Failed to apply alterations");
      }
    } catch (error) {
      console.error("Error applying alterations:", error);
      toast.error("An error occurred while applying alterations");
    } finally {
      setApplyingId(null);
    }
  };

  const updatePeriodSubstitute = (leaveId: number, periodIndex: number, facultyId: number) => {
    const leave = queue.find(l => l.id === leaveId);
    if (!leave) return;

    const currentPeriods = editedPeriods[leaveId] || [...(leave.affected_periods || [])];
    const newPeriods = [...currentPeriods];
    newPeriods[periodIndex] = {
      ...newPeriods[periodIndex],
      requested_substitute_faculty_id: facultyId
    };

    setEditedPeriods({
      ...editedPeriods,
      [leaveId]: newPeriods
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric"
    });

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  const content = (
    <motion.div
      initial={!isNested ? { opacity: 0, y: -10 } : false}
      animate={!isNested ? { opacity: 1, y: 0 } : false}
      className={cn("mb-8", isNested && "mb-0")}
    >
      {!isNested && (
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-serif">Alteration Application Queue</h1>
            <p className="text-muted-foreground">
              Review and apply timetable alterations for approved leave requests
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh Queue
          </Button>
        </div>
      )}

        {loading && queue.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading queue...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success/50" />
            <p className="text-muted-foreground">No pending alterations to apply</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((leave) => (
              <motion.div
                key={leave.id}
                layout
                className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
              >
                {/* Collapsed Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedLeaveId(expandedLeaveId === leave.id ? null : leave.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{leave.applicant?.Name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {leave.leaveType} Leave &bull; {leave.totalDays} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Substitute: {leave.substituteFaculty?.Name}
                        </p>
                      </div>
                      {expandedLeaveId === leave.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLeaveId === leave.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border bg-muted/10"
                  >
                    <div className="p-5 space-y-6">
                      {/* Leave Info Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-4 rounded-lg border border-border shadow-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Reason for Leave</Label>
                          <p className="text-sm font-medium">{leave.reason}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Main Substitute (Default)</Label>
                          <p className="text-sm font-medium text-primary flex items-center gap-2">
                             <CheckIcon className="w-4 h-4" />
                             {leave.substituteFaculty?.Name}
                          </p>
                        </div>
                      </div>

                      {/* Periods Table */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Affected Periods & Alterations
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted text-left">
                                <th className="p-3 text-xs font-bold uppercase tracking-wider border text-muted-foreground">Date / Period</th>
                                <th className="p-3 text-xs font-bold uppercase tracking-wider border text-muted-foreground">Subject / Class</th>
                                <th className="p-3 text-xs font-bold uppercase tracking-wider border text-muted-foreground">Substitute Faculty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(leave.affected_periods || []).map((period, idx) => {
                                const currentPeriods = editedPeriods[leave.id] || leave.affected_periods || [];
                                const currentSubstituteId = currentPeriods[idx]?.requested_substitute_faculty_id;
                                
                                return (
                                  <tr key={idx} className="bg-card">
                                    <td className="p-3 border">
                                      <p className="text-sm font-semibold">{formatDate(period.date)}</p>
                                      <p className="text-xs text-muted-foreground">Slot {period.period_slot_id}</p>
                                    </td>
                                    <td className="p-3 border">
                                      <p className="text-sm font-medium">{period.subject_name || `Subject ${period.subject_id}`}</p>
                                      <p className="text-xs text-muted-foreground">{period.class_name || `Class ${period.class_id}`}</p>
                                    </td>
                                    <td className="p-3 border">
                                      <ShadSelect 
                                        value={currentSubstituteId?.toString()}
                                        onValueChange={(val) => updatePeriodSubstitute(leave.id, idx, parseInt(val))}
                                      >
                                        <ShadSelectTrigger className="w-full h-9 text-sm">
                                          <ShadSelectValue placeholder="Select substitute" />
                                        </ShadSelectTrigger>
                                        <ShadSelectContent>
                                          {colleagues.map(f => (
                                            <ShadSelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                                              {f.Name}
                                            </ShadSelectItem>
                                          ))}
                                        </ShadSelectContent>
                                      </ShadSelect>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Final Apply Button */}
                      <div className="flex justify-end pt-4 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setExpandedLeaveId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={applyingId === leave.id}
                          onClick={() => handleApply(leave.id)}
                        >
                          {applyingId === leave.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Apply Timetable Alterations
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
    </motion.div>
  );

  if (isNested) return content;
  return <MainLayout hideHeader={true}>{content}</MainLayout>;
}
