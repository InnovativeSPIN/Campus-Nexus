import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Label } from "@/pages/faculty/components/ui/label";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import {
  CalendarDays, PlusCircle, Clock, CheckCircle2, XCircle, AlertCircle, FileText,
  Calendar, Trash2, Wallet, Users, CheckIcon, XIcon, RefreshCw, Search,
  Send, RotateCcw, Lock, Unlock, ChevronRight, BadgeCheck, UserCheck, BookOpen,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from "@/components/ui/sonner";
import {
  Select as ShadSelect,
  SelectContent as ShadSelectContent,
  SelectItem as ShadSelectItem,
  SelectTrigger as ShadSelectTrigger,
  SelectValue as ShadSelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubstituteFaculty {
  faculty_id: number;
  name: string;
  designation?: string;
  isExpert?: boolean;
}

interface AvailableSubject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface PlanRecord {
  id: number;
  faculty_id: number;
  substitute_faculty_id: number;
  start_date: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  substitute_faculty?: { faculty_id: number; Name: string; designation?: string };
  _periodInfo?: PeriodInfo;
  leave_id?: number;
}

interface PeriodInfo {
  period_slot_id: number;
  period_label?: string;
  subject_id?: number;
  subject_name?: string;
  custom_subject_name?: string;
  class_id?: number;
  class_name?: string;
  room?: string;
  master_id?: number;
  rejection_reason?: string;
}

interface Period {
  id: number; // TimetableMasterSlots.id — used as the unique key
  date: string;
  day: string;
  period_label: string;
  period_number: number;
  period_slot_id: number;
  start_time: string;
  end_time: string;
  type: string;
  room?: string;
  subject_id?: number;
  subject?: { id: number; code: string; name: string };
  class?: { id: number; name: string; semester: number };
  class_id?: number;
  semester?: number;
  master_id?: number;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  overall_status: string;
  substitute_faculty_id?: number;
  substitute_approval_status?: string;
  timetable_incharge_approval_status?: string;
  executive_admin_approval_status?: string;
  admin_approval_status?: string;
  substitute_rejection_reason?: string;
  createdAt: string;
  substituteFaculty?: { name?: string; Name?: string };
  affected_periods?: any[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  substitute_pending: { label: "Waiting for Substitutes", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  substitute_approved: { label: "Pending HOD Approval", icon: Clock, color: "text-info", bg: "bg-info/10" },
  substitute_rejected: { label: "Substitute Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  hod_approved: { label: "Pending Timetable Action", icon: Clock, color: "text-info", bg: "bg-info/10" },
  timetable_pending: { label: "In Timetable Queue", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  timetable_approved: { label: "Timetable Applied", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  executive_pending: { label: "Pending Final Approval", icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  approved: { label: "Leave Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  rejected: { label: "Leave Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  cancelled: { label: "Leave Cancelled", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/10" },
};

const leaveTypes = ["Medical", "Casual", "Earned", "On-Duty", "Personal", "Maternity", "Comp-Off"];

// ─── API Helper ───────────────────────────────────────────────────────────────

const api = async (url: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  return res.json();
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtShortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtTime = (t: string) => (t ? t.substring(0, 5) : "");

// ─── Key Helper ───────────────────────────────────────────────────────────────
// Use TimetableMasterSlots.id (period.id) as the key — this is consistent
// between getPeriodsForDateRange and getAlternativeFacultyForPeriods responses.
const periodKey = (period: { id: number; date: string }) =>
  `${period.date?.substring(0, 10)}_${period.id}`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FacultyLeaveManagement() {
  const [activeTab, setActiveTab] = useState("plan");
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Alteration Plan
  const [planDates, setPlanDates] = useState({ 
    startDate: "", 
    endDate: "" 
  });
  const [fetchingPeriods, setFetchingPeriods] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
  // facultyMap: { [periodKey]: SubstituteFaculty[] }
  const [facultyMap, setFacultyMap] = useState<Record<string, SubstituteFaculty[]>>({});
  const [planRecords, setPlanRecords] = useState<PlanRecord[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Per-period selection states (keyed by periodKey)
  const [selSubstitute, setSelSubstitute] = useState<Record<string, string>>({});
  const [selSubject, setSelSubject] = useState<Record<string, string>>({}); // subjectId or "other"
  const [customSubject, setCustomSubject] = useState<Record<string, string>>({}); // free-text when "other"
  const [sending, setSending] = useState<Record<string, boolean>>({});

  // ── Apply Leave
  const [leaveForm, setLeaveForm] = useState({ leaveType: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  // ── My Applications
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // ── Substitution Requests (requests FROM colleagues for me to cover)
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { fetchMyLeaves(); }, []);
  useEffect(() => { fetchMyRequests(); }, []);



  // ── Auto-Hydrate Active Plan on Load
  useEffect(() => {
    const autoHydrateActivePlan = async () => {
      try {
        const r = await api("/api/v1/faculty/alteration-plan/my-plan");
        // Only count records that haven't been submitted into a formal leave yet
        const unsubmittedRecords = (r.data || []).filter((rec: any) => !rec.leave_id);

        if (r.success && unsubmittedRecords.length > 0) {
          // Find the boundary dates of the active plan
          const dates = unsubmittedRecords.map((rec: any) => new Date(rec.start_date).getTime());
          const minDate = new Date(Math.min(...dates)).toISOString().split("T")[0];
          const maxDate = new Date(Math.max(...dates)).toISOString().split("T")[0];
          
          setPlanDates({ startDate: minDate, endDate: maxDate });
          
          // Automatically fetch periods for these dates
          fetchPeriods(minDate, maxDate, false);
        }
      } catch (err) {}
    };
    autoHydrateActivePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api("/api/v1/faculty/alteration-plan/my-requests");
      if (res.success) setMyRequests(res.data || []);
    } catch (e) {
      toast.error("Failed to load substitution requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubRequest = async (id: number, action: 'accept' | 'reject') => {
    try {
      setActionLoadingId(id);
      const res = await api(`/api/v1/faculty/alteration-plan/${id}/${action}`, { method: "PATCH" });
      if (res.success) {
        toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
        fetchMyRequests();
      } else {
        toast.error(res.error || "Action failed");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── Fetch periods + alternative faculty ────────────────────────────────────

  const fetchPeriods = async (overrideStart?: string, overrideEnd?: string, showToasts: boolean = true) => {
    const s = overrideStart || planDates.startDate;
    const e = overrideEnd || planDates.endDate;

    if (!s || !e) {
      if (showToasts) toast.error("Please select both dates");
      return;
    }
    setFetchingPeriods(true);
    setPeriods([]); setPlanRecords([]); setFacultyMap({});
    setSelSubstitute({}); setSelSubject({}); setCustomSubject({});

    try {
      // 1. Fetch periods + available subjects
      const r = await api(
        `/api/v1/faculty/leave-request/periods-for-dates?startDate=${s}&endDate=${e}`
      );

      if (!r.success || !r.data?.periods?.length) {
        if (showToasts) toast.info("No classes found for the selected dates");
        setFetchingPeriods(false);
        return;
      }

      const fetchedPeriods: Period[] = r.data.periods;
      const fetchedSubjects: AvailableSubject[] = r.data.availableSubjects || [];
      setPeriods(fetchedPeriods);
      setAvailableSubjects(fetchedSubjects);

      // 2. Fetch alternative faculty for all periods
      const altR = await api("/api/v1/faculty/leave-request/alternative-faculty", {
        method: "POST",
        body: JSON.stringify({ periods: fetchedPeriods }),
      });

      if (altR.success) {
        const map: Record<string, SubstituteFaculty[]> = {};
        for (const item of altR.data || []) {
          // item.period.id = TimetableMasterSlots.id — same as fetchedPeriods[x].id
          const key = periodKey({ id: item.period.id, date: item.period.date });
          map[key] = (item.alternative_faculty || []).map((f: any) => ({
            faculty_id: f.faculty_id,
            name: f.name || f.Name,
            designation: f.designation,
            isExpert: !!f.isExpert,
          }));
        }
        setFacultyMap(map);
      }

      // 3. Fetch existing plan records for date range
      await fetchPlanRecords(s, e);

      if (showToasts) toast.success(`Found ${fetchedPeriods.length} class period${fetchedPeriods.length > 1 ? "s" : ""}`);
    } catch (err) {
      if (showToasts) toast.error("Failed to fetch periods");
    }
    setFetchingPeriods(false);
  };

  const fetchPlanRecords = useCallback(async (start?: string, end?: string) => {
    const s = start || planDates.startDate;
    const e = end || planDates.endDate;
    if (!s || !e) return;
    setLoadingPlan(true);
    const r = await api(`/api/v1/faculty/alteration-plan/my-plan?startDate=${s}&endDate=${e}`);
    if (r.success) {
      const records = (r.data || []).map((rec: PlanRecord) => ({
        ...rec,
        _periodInfo: (() => { try { return JSON.parse(rec.reason || "{}"); } catch { return {}; } })(),
      }));
      setPlanRecords(records);
    }
    setLoadingPlan(false);
  }, [planDates.startDate, planDates.endDate]);

  const fetchMyLeaves = async () => {
    setLoadingLeaves(true);
    const r = await api("/api/v1/faculty/leave-request/my-applications");
    if (r.success) setMyLeaves(r.data || []);
    setLoadingLeaves(false);
  };

  // ── Auto-poll plan records in the background when an active plan dates exist!
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (periods.length > 0 && planDates.startDate && planDates.endDate) {
      interval = setInterval(() => {
        fetchPlanRecords(planDates.startDate, planDates.endDate);
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [periods.length, planDates.startDate, planDates.endDate, fetchPlanRecords]);

  // ─── Record Lookup ──────────────────────────────────────────────────────────

  // Find the plan record for a period.
  // Match by date AND period_slot_id stored in the JSON reason.
  const getRecordForPeriod = (p: Period): PlanRecord | undefined =>
    planRecords.find(
      r =>
        (r.start_date?.substring(0, 10) === p.date) &&
        String(r._periodInfo?.period_slot_id) === String(p.period_slot_id)
    );

  // ─── Actions ────────────────────────────────────────────────────────────────

  const sendRequest = async (period: Period) => {
    const key = periodKey(period);
    const subId = selSubstitute[key];
    const subjectId = selSubject[key];
    const customSubjectName = customSubject[key];

    if (!subId) { toast.error("Please select a substitute faculty"); return; }

    let finalSubjectId: number | undefined;
    let finalSubjectName: string | undefined;

    if (subjectId === "other") {
      if (!customSubjectName?.trim()) { toast.error("Please type the subject name"); return; }
      finalSubjectName = customSubjectName.trim();
    } else if (subjectId) {
      const sub = availableSubjects.find(s => s.id === parseInt(subjectId));
      finalSubjectId = sub?.id;
      finalSubjectName = sub?.subject_name;
    } else {
      // Default to period's own subject
      finalSubjectId = period.subject?.id || period.subject_id;
      finalSubjectName = period.subject?.name;
    }

    setSending(s => ({ ...s, [key]: true }));
    const r = await api("/api/v1/faculty/alteration-plan/request-period", {
      method: "POST",
      body: JSON.stringify({
        substitute_faculty_id: parseInt(subId),
        period: {
          date: period.date,
          period_slot_id: period.period_slot_id,
          period_label: period.period_label,
          subject_id: finalSubjectId,
          subject_name: finalSubjectName,
          custom_subject_name: subjectId === "other" ? customSubjectName : undefined,
          class_id: period.class?.id || period.class_id,
          class_name: period.class?.name,
          room: period.room,
          master_id: period.master_id,
        },
        startDate: planDates.startDate,
        endDate: planDates.endDate,
      }),
    });

    if (r.success) {
      toast.success("Request sent! Waiting for response.");
      await fetchPlanRecords();
      setSelSubstitute(s => { const n = { ...s }; delete n[key]; return n; });
    } else {
      toast.error(r.message || r.error || "Failed to send request");
    }
    setSending(s => ({ ...s, [key]: false }));
  };

  const reassignRequest = async (record: PlanRecord, period: Period) => {
    const key = periodKey(period);
    const subId = selSubstitute[key];
    if (!subId) { toast.error("Please select a new faculty member"); return; }

    const recKey = String(record.id);
    setSending(s => ({ ...s, [recKey]: true }));
    const r = await api(`/api/v1/faculty/alteration-plan/${record.id}/reassign`, {
      method: "PATCH",
      body: JSON.stringify({ new_substitute_faculty_id: parseInt(subId) }),
    });

    if (r.success) {
      toast.success("Request resent!");
      await fetchPlanRecords();
      setSelSubstitute(s => { const n = { ...s }; delete n[key]; return n; });
    } else {
      toast.error(r.error || "Failed to reassign");
    }
    setSending(s => ({ ...s, [recKey]: false }));
  };

  const cancelRequest = async (record: PlanRecord) => {
    if (!confirm("Are you sure you want to cancel this substitution request?")) return;
    try {
      const r = await api(`/api/v1/faculty/alteration-plan/${record.id}/cancel`, { method: "DELETE" });
      if (r.success) {
        toast.success("Request cancelled");
        await fetchPlanRecords();
      } else {
        toast.error(r.error || "Failed to cancel request");
      }
    } catch (e) {
      toast.error("Failed to cancel request");
    }
  };

  const abortDraft = async () => {
    if (!confirm("This will clear all unsubmitted substitution requests and reset your current plan. Continue?")) return;
    try {
      const r = await api("/api/v1/faculty/alteration-plan/abort-draft", { method: "DELETE" });
      if (r.success) {
        toast.success("Draft plan cleared");
        setPlanDates({ startDate: "", endDate: "" });
        setPeriods([]);
        setPlanRecords([]);
      } else {
        toast.error(r.error || "Failed to clear draft");
      }
    } catch (e) {
      toast.error("Failed to clear draft");
    }
  };

  const submitLeave = async () => {
    if (!leaveForm.leaveType) { toast.error("Please select a leave type"); return; }
    if (!leaveForm.reason.trim()) { toast.error("Please provide a reason"); return; }

    const finalRecordIds: number[] = [];
    for (const p of periods) {
      const rec = getRecordForPeriod(p);
      if (!rec || rec.status !== "approved") {
        toast.error("All periods must have confirmed substitutes before submitting");
        return;
      }
      finalRecordIds.push(rec.id);
    }

    setSubmitting(true);
    const r = await api("/api/v1/faculty/leave-request/submit-with-plan", {
      method: "POST",
      body: JSON.stringify({
        leaveType: leaveForm.leaveType,
        startDate: planDates.startDate,
        endDate: planDates.endDate,
        reason: leaveForm.reason,
        plan_record_ids: finalRecordIds,
      }),
    });

    if (r.success) {
      toast.success("Leave application submitted!");
      setLeaveForm({ leaveType: "", reason: "" });
      setPeriods([]); setPlanRecords([]);
      setPlanDates({ startDate: "", endDate: "" });
      setActiveTab("applications");
      fetchMyLeaves();
    } else {
      toast.error(r.error || "Failed to submit leave");
    }
    setSubmitting(false);
  };

  const withdrawLeave = async (id: number) => {
    if (!confirm("Withdraw this leave request?")) return;
    const r = await api(`/api/v1/faculty/leave-request/${id}/withdraw`, { method: "DELETE" });
    if (r.success) { toast.success("Leave withdrawn"); fetchMyLeaves(); }
    else toast.error(r.error || "Failed to withdraw");
  };

  const deleteLeave = async (id: number) => {
    if (!confirm("Permanently delete this leave record? This cannot be undone.")) return;
    const r = await api(`/api/v1/faculty/leave-request/${id}`, { method: "DELETE" });
    if (r.success) {
      toast.success("Leave record deleted");
      fetchMyLeaves();
    } else {
      toast.error(r.error || "Failed to delete");
    }
  };

  // ─── Computed ───────────────────────────────────────────────────────────────

  const getRec = (p: Period) => getRecordForPeriod(p);
  const submittedCount = periods.filter(p => !!getRec(p)?.leave_id).length;
  const confirmedCount = periods.filter(p => getRec(p)?.status === "approved" && !getRec(p)?.leave_id).length;
  const pendingCount = periods.filter(p => getRec(p)?.status === "pending" && !getRec(p)?.leave_id).length;
  const rejectedCount = periods.filter(p => getRec(p)?.status === "rejected" && !getRec(p)?.leave_id).length;
  const unassignedCount = periods.filter(p => !getRec(p)).length;
  
  const activePeriods = periods.length - submittedCount;
  const allConfirmed = activePeriods > 0 && confirmedCount === activePeriods;
  const fullySubmitted = periods.length > 0 && submittedCount === periods.length;

  const totalDays = (() => {
    if (!planDates.startDate || !planDates.endDate) return 0;
    return Math.ceil(Math.abs(new Date(planDates.endDate).getTime() - new Date(planDates.startDate).getTime()) / 86400000) + 1;
  })();

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout hideHeader={true}>
      <div className="mb-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-3xl font-bold font-serif">Leave Management</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Assign substitutes for all your classes first, then submit the formal leave
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {fmtDate(currentTime.toISOString())}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5 text-[11px] font-semibold">
          {[
            { key: "plan", label: "1. Alteration Faculty", icon: Users },
            { key: "apply", label: "2. Apply Leave", icon: allConfirmed ? Unlock : Lock },
            { key: "applications", label: "3. My Applications", icon: FileText },
          ].map((step, i, arr) => {
            const StepIcon = step.icon;
            const isActive = activeTab === step.key;
            const isDone =
              (step.key === "plan" && allConfirmed) ||
              (step.key === "apply" && activeTab === "applications");
            return (
              <span key={step.key} className="flex items-center gap-1.5">
                <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all",
                  isActive ? "bg-primary/10 border-primary/30 text-primary" :
                    isDone ? "bg-success/10 border-success/30 text-success" :
                      "border-border text-muted-foreground"
                )}>
                  <StepIcon className="w-3 h-3" />
                  {step.label}
                  {isDone && <CheckIcon className="w-3 h-3 ml-0.5" />}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </span>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-5">
            <TabsTrigger value="plan" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Alteration Faculty
            </TabsTrigger>
            <TabsTrigger value="apply" disabled={!allConfirmed} className="gap-1.5 text-xs">
              {allConfirmed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              Apply Leave
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-1.5 text-xs" onClick={fetchMyLeaves}>
              <FileText className="w-3.5 h-3.5" /> My Applications
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 text-xs relative" onClick={fetchMyRequests}>
              <UserCheck className="w-3.5 h-3.5" /> Sub Requests
              {myRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {myRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════ TAB 1: ALTERATION FACULTY ══════════════════ */}
          <TabsContent value="plan" className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Step 1 — Assign Substitute Faculty Per Period
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                Select your leave dates. For each class period, choose an alternative subject and substitute faculty.
                Substitutes will receive a notification and must confirm. Once all periods are covered, you can submit the leave.
              </p>

              {/* Date inputs */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Date</Label>
                  <Input type="date" value={planDates.startDate}
                    onChange={e => { 
                      setPlanDates(d => ({ ...d, startDate: e.target.value })); 
                      setPeriods([]); setPlanRecords([]); 
                    }} />
                </div>
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Date</Label>
                  <Input type="date" value={planDates.endDate}
                    onChange={e => { 
                      setPlanDates(d => ({ ...d, endDate: e.target.value })); 
                      setPeriods([]); setPlanRecords([]); 
                    }} />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => fetchPeriods()} disabled={!planDates.startDate || !planDates.endDate || fetchingPeriods} className="gap-2 h-10">
                    {fetchingPeriods ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {fetchingPeriods ? "Fetching..." : "Find Classes"}
                  </Button>
                  {periods.length > 0 && (
                    <div className="flex gap-2">
                       <Button variant="outline" size="icon" className="h-10 w-10 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={abortDraft} title="Clear Draft">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => fetchPlanRecords()} title="Refresh status">
                        <RefreshCw className={cn("w-4 h-4", loadingPlan && "animate-spin")} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress counters */}
              {periods.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { label: "Confirmed", count: confirmedCount, cls: "text-success bg-success/10 border-success/20" },
                    { label: "Waiting", count: pendingCount, cls: "text-warning bg-warning/10 border-warning/20" },
                    { label: "Rejected", count: rejectedCount, cls: "text-destructive bg-destructive/10 border-destructive/20" },
                    { label: "Unassigned", count: unassignedCount, cls: "text-muted-foreground bg-muted/30 border-border" },
                  ].map(s => (
                    <div key={s.label} className={cn("border rounded-lg px-2 py-2 text-center", s.cls)}>
                      <p className="text-lg font-bold">{s.count}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {periods.length === 0 && !fetchingPeriods && (
                <div className="text-center py-14 text-muted-foreground">
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Select dates above and click <strong>Find Classes</strong></p>
                </div>
              )}

              {/* Period cards */}
              <div className="space-y-3">
                {periods.map((period) => {
                  const key = periodKey(period);
                  const record = getRecordForPeriod(period);
                  const faculty = facultyMap[key] || [];

                  return (
                    <PeriodCard
                      key={key}
                      period={period}
                      record={record}
                      faculty={faculty}
                      availableSubjects={availableSubjects}
                      selSubstitute={selSubstitute[key] || ""}
                      selSubject={selSubject[key] || ""}
                      customSubject={customSubject[key] || ""}
                      onSelectSubstitute={val => setSelSubstitute(s => ({ ...s, [key]: val }))}
                      onSelectSubject={val => setSelSubject(s => ({ ...s, [key]: val }))}
                      onCustomSubject={val => setCustomSubject(s => ({ ...s, [key]: val }))}
                      onSend={() => sendRequest(period)}
                      onReassign={() => record && reassignRequest(record, period)}
                      onCancel={() => record && cancelRequest(record)}
                      isSending={!!sending[key] || !!(record && sending[String(record.id)])}
                    />
                  );
                })}
              </div>

              {/* All confirmed CTA or Fully Submitted Lock */}
              {fullySubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 bg-primary/10 border border-primary/30 rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-7 h-7 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Leave already applied!</p>
                      <p className="text-xs text-muted-foreground">All periods in this date range are locked to a submitted formal leave application.</p>
                    </div>
                  </div>
                </motion.div>
              ) : allConfirmed ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 bg-success/10 border border-success/30 rounded-xl px-5 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-7 h-7 text-success" />
                    <div>
                      <p className="font-semibold text-success">All {activePeriods} assignable periods covered!</p>
                      <p className="text-xs text-muted-foreground">You can now submit the formal leave application</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("apply")} className="gap-2">
                    Apply Leave <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : null}
            </div>
          </TabsContent>

          {/* ══════════════════ TAB 2: APPLY LEAVE ══════════════════ */}
          <TabsContent value="apply">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" /> Step 2 — Submit Formal Leave Application
              </h2>

              {/* Confirmed plan summary */}
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Confirmed Coverage Plan</p>
                <div className="space-y-2">
                  {periods.map((p, i) => {
                    const rec = getRecordForPeriod(p);
                    const info = rec?._periodInfo;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {p.period_label || p.period_number}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{fmtShortDate(p.date)}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {info?.subject_name || info?.custom_subject_name || p.subject?.name || "—"}
                              {p.class?.name ? ` · ${p.class.name}` : ""}
                              {p.room ? ` · ${p.room}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <UserCheck className="w-3.5 h-3.5 text-success" />
                          <span className="text-success font-medium text-xs">{rec?.substitute_faculty?.Name || "—"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Leave Period</Label>
                  <div className="bg-muted/40 border border-border rounded-md px-3 py-2.5 text-sm font-medium">
                    {planDates.startDate ? fmtDate(planDates.startDate) : "—"} → {planDates.endDate ? fmtDate(planDates.endDate) : "—"}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">({totalDays} day{totalDays !== 1 ? "s" : ""})</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Leave Type *</Label>
                  <ShadSelect value={leaveForm.leaveType} onValueChange={val => setLeaveForm(f => ({ ...f, leaveType: val }))}>
                    <ShadSelectTrigger><ShadSelectValue placeholder="Select leave type" /></ShadSelectTrigger>
                    <ShadSelectContent>
                      {leaveTypes.map(t => <ShadSelectItem key={t} value={t}>{t}</ShadSelectItem>)}
                    </ShadSelectContent>
                  </ShadSelect>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason for Leave *</Label>
                <Textarea
                  placeholder="Briefly explain your reason..."
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                  className="min-h-[90px]"
                />
              </div>

              {totalDays > 2 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-warning">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  Leave exceeds 2 days — will require <strong className="ml-1">Executive Admin approval</strong> after dept admin.
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="outline" onClick={() => setActiveTab("plan")}>← Back</Button>
                <Button onClick={submitLeave} disabled={submitting} className="gap-2 min-w-[150px]">
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Submitting..." : "Submit Leave"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════ TAB 3: MY APPLICATIONS ══════════════════ */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> My Applications
              </h2>
              <Button variant="outline" size="sm" onClick={fetchMyLeaves} disabled={loadingLeaves} className="h-8">
                <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loadingLeaves && "animate-spin")} /> Refresh status
              </Button>
            </div>
            
            {loadingLeaves ? (
              <div className="text-center py-16 text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                Loading applications...
              </div>
            ) : myLeaves.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium mb-1">No leave applications yet</p>
                <p className="text-sm text-muted-foreground mb-4">Complete the alteration plan first</p>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("plan")}>Start Alteration Plan</Button>
              </div>
            ) : (
              myLeaves.map(leave => (
                <LeaveCard key={leave.id} leave={leave} onWithdraw={withdrawLeave} onDelete={deleteLeave} formatDate={fmtDate} />
              ))
            )}
          </TabsContent>

          {/* ══════════════════ TAB 4: SUBSTITUTION REQUESTS ══════════════════ */}
          <TabsContent value="requests" className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" /> Substitution Requests
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Colleagues have requested you to cover their classes. Please accept or reject.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMyRequests} disabled={loadingRequests}>
                  <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loadingRequests && "animate-spin")} /> Refresh
                </Button>
              </div>

              {loadingRequests ? (
                <div className="text-center py-16">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading requests...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 border border-border rounded-xl">
                  <UserCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium mb-1">No pending requests</p>
                  <p className="text-sm text-muted-foreground">When a colleague requests your substitution, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((req) => {
                    let periodInfo: any = {};
                    try { periodInfo = JSON.parse(req.reason || '{}'); } catch (e) { }
                    const dateStr = new Date(req.start_date).toLocaleDateString('en-IN', {
                      weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
                    });
                    const isActing = actionLoadingId === req.id;
                    return (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-primary/20 bg-primary/5 rounded-xl p-5"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{req.absent_faculty?.Name || "A colleague"}</p>
                              <p className="text-xs text-muted-foreground">{req.absent_faculty?.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-full font-bold">
                            Awaiting Your Response
                          </span>
                        </div>

                        {/* Full descriptive message */}
                        <div className="bg-card border border-border rounded-lg px-4 py-3 mb-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Request Message</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            <strong>{req.absent_faculty?.Name}</strong> is requesting you to cover their class on{" "}
                            <strong className="text-primary">{dateStr}</strong>.
                            {periodInfo.period_label && <> Period <strong>{periodInfo.period_label}</strong>.</>}
                            {periodInfo.subject_name && <> Subject: <strong>{periodInfo.subject_name}</strong>.</>}
                            {periodInfo.class_name && <> Class: <strong>{periodInfo.class_name}</strong>.</>}
                            {" "}Please check your schedule before accepting.
                          </p>
                        </div>

                        {/* Period info grid with time */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                          {[
                            { label: "Date", value: new Date(req.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                            { label: "Time", value: periodInfo.start_time ? `${periodInfo.start_time?.substring(0, 5)}${periodInfo.end_time ? ` – ${periodInfo.end_time?.substring(0, 5)}` : ''}` : "—" },
                            { label: "Period", value: periodInfo.period_label || "—" },
                            { label: "Subject", value: periodInfo.subject_name || "—" },
                            { label: "Class", value: periodInfo.class_name || "—" },
                          ].map(item => (
                            <div key={item.label} className="bg-card border border-border rounded-lg px-3 py-2">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                              <p className="text-sm font-semibold truncate">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Request received time */}
                        <p className="text-[10px] text-muted-foreground mb-3">
                          Request received{" "}
                          <strong>{new Date(req.created_at || req.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}</strong>
                        </p>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleSubRequest(req.id, 'reject')}
                            disabled={isActing}
                            className="flex-1 h-11 border-destructive/30 text-destructive hover:bg-destructive/5 font-bold gap-2"
                          >
                            {isActing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Reject Request
                          </Button>
                          <Button
                            onClick={() => handleSubRequest(req.id, 'accept')}
                            disabled={isActing}
                            className="flex-1 h-11 bg-success hover:bg-success/90 text-white font-bold gap-2 shadow-lg shadow-success/20"
                          >
                            {isActing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Accept Request
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}

// ─── Period Card ───────────────────────────────────────────────────────────────

function PeriodCard({
  period, record, faculty, availableSubjects,
  selSubstitute, selSubject, customSubject,
  onSelectSubstitute, onSelectSubject, onCustomSubject,
  onSend, onReassign, onCancel, isSending,
}: {
  period: Period;
  record?: PlanRecord;
  faculty: SubstituteFaculty[];
  availableSubjects: AvailableSubject[];
  selSubstitute: string;
  selSubject: string;
  customSubject: string;
  onSelectSubstitute: (v: string) => void;
  onSelectSubject: (v: string) => void;
  onCustomSubject: (v: string) => void;
  onSend: () => void;
  onReassign: () => void;
  onCancel: () => void;
  isSending: boolean;
}) {
  const isSubmitted = !!record?.leave_id;
  const isApproved = !isSubmitted && record?.status === "approved";
  const isPending = !isSubmitted && record?.status === "pending";
  const isRejected = !isSubmitted && record?.status === "rejected";
  const rejReason = record?._periodInfo?.rejection_reason;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-xl p-4 transition-all",
        isSubmitted ? "border-primary/30 bg-primary/5" :
        isApproved ? "border-success/40 bg-success/5" :
          isPending ? "border-warning/40 bg-warning/5" :
            isRejected ? "border-destructive/30 bg-destructive/5" :
              "border-border bg-card"
      )}
    >
      {/* ── Period Info Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-3 mb-3 border-b border-border/40 text-sm">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Date</p>
          <p className="font-semibold text-primary">
            {new Date(period.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Period</p>
          <p className="font-semibold">Period {period.period_label || period.period_number}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Class / Sem</p>
          <p className="font-semibold">
            {period.class?.name || "—"}
            {(period.semester || period.class?.semester) ? ` (Sem ${period.semester || period.class?.semester})` : ""}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Room</p>
          <p className="font-semibold">{period.room || "—"}</p>
        </div>
      </div>

      {/* ── Timetable Subject (read-only info) */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span>Timetable subject: <strong className="text-foreground">{period.subject?.name || "—"}</strong>
          {period.subject?.code ? ` (${period.subject.code})` : ""}
        </span>
        {period.start_time && (
          <span className="ml-auto bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
            {period.start_time?.substring(0, 5)}
          </span>
        )}
      </div>

      {/* ── STATUS: Submitted */}
      {isSubmitted && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">
              Classes are substituted
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground text-right">
            Covered by {record?.substitute_faculty?.Name}
          </span>
        </div>
      )}

      {/* ── STATUS: Approved */}
      {isApproved && (
        <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span className="text-sm font-medium text-success">
              Classes are substituted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden md:inline">
              Covered by {record?.substitute_faculty?.Name}
            </span>
            <Button variant="ghost" size="sm" onClick={onCancel}
              className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2">
              <Trash2 className="w-3 h-3 mr-1" />Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── STATUS: Pending */}
      {isPending && (
        <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning shrink-0" />
            <span className="text-sm text-warning">
              Waiting for <strong>{record?.substitute_faculty?.Name}</strong>...
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}
            className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2">
            <Trash2 className="w-3 h-3 mr-1" />Cancel
          </Button>
        </div>
      )}

      {/* ── STATUS: Rejected — show reassign UI */}
      {isRejected && (
        <div className="space-y-2.5">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-sm font-medium text-destructive">
                {record?.substitute_faculty?.Name} rejected
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}
              className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2">
              <Trash2 className="w-3 h-3 mr-1" />Clear
            </Button>
          </div>
          {rejReason && <p className="text-[11px] text-muted-foreground ml-5 mt-[-5px] mb-2">Reason: {rejReason}</p>}

          {/* Subject & Faculty for reassign */}
          <SubjectAndFacultyRow
            availableSubjects={availableSubjects}
            faculty={faculty.filter(f => f.faculty_id !== record?.substitute_faculty_id)}
            selSubject={selSubject}
            selSubstitute={selSubstitute}
            customSubject={customSubject}
            onSelectSubject={onSelectSubject}
            onSelectSubstitute={onSelectSubstitute}
            onCustomSubject={onCustomSubject}
            actionLabel="Resend"
            onAction={onReassign}
            isSending={isSending}
            actionIcon={RotateCcw}
          />
        </div>
      )}

      {/* ── STATUS: Unassigned — first time request */}
      {!record && (
        <SubjectAndFacultyRow
          availableSubjects={availableSubjects}
          faculty={faculty}
          selSubject={selSubject}
          selSubstitute={selSubstitute}
          customSubject={customSubject}
          onSelectSubject={onSelectSubject}
          onSelectSubstitute={onSelectSubstitute}
          onCustomSubject={onCustomSubject}
          actionLabel="Send Request"
          onAction={onSend}
          isSending={isSending}
          actionIcon={Send}
        />
      )}
    </motion.div>
  );
}

// ─── Subject + Faculty Row ─────────────────────────────────────────────────────

function SubjectAndFacultyRow({
  availableSubjects, faculty,
  selSubject, selSubstitute, customSubject,
  onSelectSubject, onSelectSubstitute, onCustomSubject,
  actionLabel, onAction, isSending, actionIcon: ActionIcon,
}: {
  availableSubjects: AvailableSubject[];
  faculty: SubstituteFaculty[];
  selSubject: string;
  selSubstitute: string;
  customSubject: string;
  onSelectSubject: (v: string) => void;
  onSelectSubstitute: (v: string) => void;
  onCustomSubject: (v: string) => void;
  actionLabel: string;
  onAction: () => void;
  isSending: boolean;
  actionIcon: any;
}) {
  return (
    <div className="space-y-2">
      {/* Alternative Subject dropdown */}
      <div>
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          Alternative Subject
        </Label>
        <ShadSelect value={selSubject} onValueChange={onSelectSubject}>
          <ShadSelectTrigger className="h-9 bg-muted/20 text-sm">
            <ShadSelectValue placeholder="Select subject (optional)" />
          </ShadSelectTrigger>
          <ShadSelectContent>
            {availableSubjects.map(sub => (
              <ShadSelectItem key={sub.id} value={String(sub.id)}>
                {sub.subject_name} <span className="text-muted-foreground text-xs ml-1">({sub.subject_code})</span>
              </ShadSelectItem>
            ))}
            <ShadSelectItem value="other" className="text-primary font-medium italic">
              Other — type subject name
            </ShadSelectItem>
          </ShadSelectContent>
        </ShadSelect>

        {selSubject === "other" && (
          <Input
            className="h-9 mt-1.5 text-sm"
            placeholder="Type subject name..."
            value={customSubject}
            onChange={e => onCustomSubject(e.target.value)}
          />
        )}
      </div>

      {/* Substitute Faculty dropdown + Send button */}
      <div>
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          Substitute Faculty *
        </Label>
        <div className="flex gap-2">
          <ShadSelect value={selSubstitute} onValueChange={onSelectSubstitute}>
            <ShadSelectTrigger className="h-9 flex-1 bg-muted/20 text-sm">
              <ShadSelectValue placeholder="Choose substitute faculty..." />
            </ShadSelectTrigger>
            <ShadSelectContent>
              {faculty.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground text-center">No faculty available</div>
              ) : (
                faculty.map(f => (
                  <ShadSelectItem key={f.faculty_id} value={String(f.faculty_id)}>
                    <div className="flex items-center gap-2">
                      <span>{f.name}</span>
                      {f.isExpert && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold shrink-0">
                          Expert
                        </span>
                      )}
                    </div>
                  </ShadSelectItem>
                ))
              )}
            </ShadSelectContent>
          </ShadSelect>
          <Button
            size="sm"
            onClick={onAction}
            disabled={!selSubstitute || isSending || (selSubject === "other" && !customSubject?.trim())}
            className="gap-1.5 h-9 shrink-0"
          >
            {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ActionIcon className="w-3.5 h-3.5" />}
            {isSending ? "Sending..." : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Leave Card ────────────────────────────────────────────────────────────────

function LeaveCard({
  leave, onWithdraw, onDelete, formatDate,
}: {
  leave: LeaveRequest;
  onWithdraw: (id: number) => void;
  onDelete: (id: number) => void;
  formatDate: (d: string) => string;
}) {
  const config = statusConfig[leave.overall_status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={cn("w-4 h-4", config.color)} />
          <h3 className="font-semibold">{leave.leaveType} Leave</h3>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", config.bg, config.color, "border-current/30")}>
            {config.label}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground shrink-0 ml-2">{new Date(leave.createdAt).toLocaleDateString("en-IN")}</p>
      </div>

      <p className="text-sm text-muted-foreground mb-4 italic">"{leave.reason}"</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
        {[
          { label: "Start", value: formatDate(leave.startDate) },
          { label: "End", value: formatDate(leave.endDate) },
          { label: "Duration", value: `${leave.totalDays} day${leave.totalDays !== 1 ? "s" : ""}` },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Workflow status badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { label: "Substitutes", status: leave.substitute_approval_status },
          { label: "HOD", status: leave.admin_approval_status },
          { label: "Timetable", status: leave.timetable_incharge_approval_status },
          ...(leave.totalDays > 2 ? [{ label: "Executive", status: leave.executive_admin_approval_status }] : []),
        ].map((step, i) => (
          <span key={i} className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border",
            step.status === "approved" ? "bg-success/10 text-success border-success/20" :
              step.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" :
                "bg-muted/40 text-muted-foreground border-muted"
          )}>
            {step.status === "approved" ? <CheckIcon className="w-2.5 h-2.5" /> :
              step.status === "rejected" ? <XIcon className="w-2.5 h-2.5" /> :
                <Clock className="w-2.5 h-2.5" />}
            {step.label}
          </span>
        ))}
      </div>

      {(() => {
        let periods = [];
        try {
          periods = typeof leave.affected_periods === "string" 
            ? JSON.parse(leave.affected_periods) 
            : (leave.affected_periods || []);
        } catch (e) { periods = []; }

        if (!Array.isArray(periods) || periods.length === 0) return null;

        return (
          <div className="mt-4 border-t border-border/50 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Affected Periods & Substitutes</p>
            <div className="space-y-1.5">
              {periods.map((p: any, i: number) => (
                <div key={i} className="flex flex-wrap items-center justify-between bg-muted/20 border border-border rounded px-2.5 py-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-semibold text-primary">Period {p.period_label || p.period_number || "—"}</span>
                    <span className="text-muted-foreground truncate max-w-[150px]" title={p.subject_name}>{p.subject_name || "Unknown Subject"}</span>
                    <span className="text-[9px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground">{p.class_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-success font-medium mt-1 sm:mt-0">
                    <UserCheck className="w-3 h-3" />
                    {p.substitute_name || "Substitute"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {leave.substitute_rejection_reason && (
        <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive">
          Rejection: {leave.substitute_rejection_reason}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-5 pt-4 border-t border-dashed border-border flex justify-end gap-2">
        {["pending", "substitute_pending"].includes(leave.overall_status) && (
          <Button variant="outline" size="sm" onClick={() => onWithdraw(leave.id)} className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10">
            Withdraw
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(leave.id)} className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5">
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
        </Button>
      </div>
    </motion.div>
  );
}
