import React, { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Label } from "@/pages/faculty/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/faculty/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pages/faculty/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/pages/faculty/components/ui/card";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Download,
  Upload,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "@/pages/faculty/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

interface TimetableSlot {
  id: number;
  master_id: number;
  day: string;
  period_slot_id: number;
  subject_id: number | null;
  faculty_id: number | null;
  session_type: string;
  is_lab_session: boolean;
  lab_pair_slot_id: number | null;
  lab_group: string | null;
  room: string | null;
  notes: string | null;
  start_time: string | null;
  end_time: string | null;
  subject?: {
    id: number;
    name?: string;         // normalised by helper endpoints
    subject_name?: string; // raw DB field from getSlots association
    code?: string;
    subject_code?: string;
  };
  faculty?: { faculty_id: number; Name: string; email: string; college_code?: string; faculty_college_code?: string };
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  college_code?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const periods = [
  { id: 1, label: "I",      time: "09:30 AM - 10:20 AM", isBreak: false },
  { id: 2, label: "II",     time: "10:20 AM - 11:10 AM", isBreak: false },
  { id: 3, label: "Break",  time: "11:10 AM - 11:30 AM", isBreak: true  },
  { id: 4, label: "III",    time: "11:30 AM - 12:25 PM", isBreak: false },
  { id: 5, label: "Lunch",  time: "12:25 PM - 01:10 PM", isBreak: true  },
  { id: 6, label: "IV",     time: "01:10 PM - 02:00 PM", isBreak: false },
  { id: 7, label: "V",      time: "02:00 PM - 02:50 PM", isBreak: false },
  { id: 8, label: "Break",  time: "02:50 PM - 03:10 PM", isBreak: true  },
  { id: 9, label: "VI",     time: "03:10 PM - 04:00 PM", isBreak: false },
  { id: 10, label: "VII",   time: "04:00 PM - 04:45 PM", isBreak: false },
];

const breakTimings = {
  morningBreak:    { startPeriod: 3, label: "Break", time: "11:10 AM - 11:30 AM" },
  lunch:           { startPeriod: 5, label: "Lunch", time: "12:25 PM - 01:10 PM" },
  afternoonBreak:  { startPeriod: 8, label: "Break", time: "02:50 PM - 03:10 PM" },
};

const sessionTypes = ["theory", "lab", "tutorial", "activity", "project", "break", "free"];

export default function FacultyTimetableSlotsManagement() {
  const { masterId } = useParams<{ masterId: string }>();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [breakPeriodIds, setBreakPeriodIds] = useState<number[]>([]);
  const [periodsList, setPeriodsList] = useState([
    { id: 1, label: "I",      time: "09:30 AM - 10:20 AM", isBreak: false },
    { id: 2, label: "II",     time: "10:20 AM - 11:10 AM", isBreak: false },
    { id: 3, label: "Break",  time: "11:10 AM - 11:30 AM", isBreak: true  },
    { id: 4, label: "III",    time: "11:30 AM - 12:25 PM", isBreak: false },
    { id: 5, label: "Lunch",  time: "12:25 PM - 01:10 PM", isBreak: true  },
    { id: 6, label: "IV",     time: "01:10 PM - 02:00 PM", isBreak: false },
    { id: 7, label: "V",      time: "02:00 PM - 02:50 PM", isBreak: false },
    { id: 8, label: "Break",  time: "02:50 PM - 03:10 PM", isBreak: true  },
    { id: 9, label: "VI",     time: "03:10 PM - 04:00 PM", isBreak: false },
    { id: 10, label: "VII",   time: "04:00 PM - 04:45 PM", isBreak: false },
  ]);
  const [timetableName, setTimetableName] = useState<string>("");
  const [timetableInfo, setTimetableInfo] = useState<{ academic_year?: string; semester?: number; batch?: string; status?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const [formData, setFormData] = useState({
    day: "Monday",
    period_slot_id: "1",
    subject_id: "none",
    faculty_id: "",
    session_type: "theory",
    is_lab_session: false,
    lab_pair_slot_id: "",
    lab_group: "",
    room: "",
    notes: "",
    start_time: "",
    end_time: "",
  });

  // ── Fetch slots ──────────────────────────────────────────────────────────────
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/timetable-master/${masterId}/slots`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      toast({ title: "Error", description: "Failed to load slots", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Initial data load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!masterId || !authToken) return;

    const fetchAll = async () => {
      setPageLoading(true);
      try {
        // 1. Timetable master details
        const masterRes = await fetch(`/api/v1/timetable-master/${masterId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (masterRes.ok) {
          const masterData = await masterRes.json();
          const cls = masterData.data?.class;
          setTimetableName(cls?.name || masterData.data?.name || `Timetable #${masterId}`);
          setTimetableInfo({
            academic_year: masterData.data?.academic_year,
            semester:      masterData.data?.semester,
            batch:         masterData.data?.batch,
            status:        masterData.data?.status,
          });
        }

        // 2. Subjects for this timetable — use the new timetable-scoped endpoint
        //    (faculty cannot access /department-admin/ routes)
        const subRes = await fetch(
          `/api/v1/timetable-master/${masterId}/slots/subjects`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (subRes.ok) {
          const data = await subRes.json();
          // API returns { id, name, code } already normalised
          setSubjects(data.data ?? []);
        } else {
          console.warn("[SLOTS PAGE] Could not load subjects:", subRes.status);
        }

        // 3. Faculty for this timetable — same timetable-scoped endpoint
        const facRes = await fetch(
          `/api/v1/timetable-master/${masterId}/slots/faculty`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        if (facRes.ok) {
          const data = await facRes.json();
          setFaculties(data.data ?? []);
        } else {
          console.warn("[SLOTS PAGE] Could not load faculty:", facRes.status);
        }

        // 4. Break configuration for this timetable
        const breakRes = await fetch(`/api/v1/timetable-master/${masterId}/break-config`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (breakRes.ok) {
          const breakData = await breakRes.json();
          let breakIds = breakData.data?.breakPeriodIds || [];
          if (!Array.isArray(breakIds)) {
            console.warn('[BREAK CONFIG] Invalid breakIds format from faculty view:', breakIds);
            breakIds = [];
          }
          setBreakPeriodIds(breakIds);
          console.log('[BREAK CONFIG] Faculty view loaded:', breakIds);
        } else {
          console.warn('[BREAK CONFIG] Could not load break config, using empty array');
          setBreakPeriodIds([]);
        }

        // 5. Slots
        await fetchSlots();
      } catch (err) {
        console.error("Error loading page data:", err);
        toast({ title: "Error", description: "Failed to load required data", variant: "destructive" });
      } finally {
        setPageLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId, authToken]);

  // Load period slots with their times from backend
  useEffect(() => {
    if (masterId && authToken) {
      const fetchPeriodSlots = async () => {
        try {
          const res = await fetch(
            `/api/v1/timetable-master/${masterId}/period-slots`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          
          if (res.ok) {
            const data = await res.json();
            const periodData = data.data || [];
            console.log('[PERIOD SLOTS] Faculty view loaded from backend:', periodData);
            
            // Build periods array with label and time from database
            const updatedPeriods = periodData.map((p: any) => {
              let label = `${p.id}`;
              // Check if it's a break period to add label
              if (breakPeriodIds.includes(p.id)) {
                if (p.id === 3) label = "Break";
                else if (p.id === 5) label = "Lunch";
                else if (p.id === 8) label = "Break";
              }
              return {
                id: p.id,
                label,
                time: p.time || "",
                isBreak: breakPeriodIds.includes(p.id),
              };
            });
            
            setPeriodsList(updatedPeriods);
          } else {
            console.log('[PERIOD SLOTS] Failed to fetch, using defaults');
          }
        } catch (error) {
          console.error('[PERIOD SLOTS] Error fetching:', error);
          console.log('[PERIOD SLOTS] Using default periods');
        }
      };
      
      fetchPeriodSlots();
    }
  }, [masterId, authToken, breakPeriodIds]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      day: "Monday", period_slot_id: "1", subject_id: "none",
      faculty_id: "", session_type: "theory", is_lab_session: false,
      lab_pair_slot_id: "", lab_group: "", room: "", notes: "",
      start_time: "", end_time: "",
    });
  };

  const getSubjectDisplay = (sid: string) => {
    if (!sid || sid === "none") return "Select subject";
    const s = subjects.find(x => x.id.toString() === sid);
    return s ? `${s.name}${s.code ? ` (${s.code})` : ""}` : `Subject ${sid}`;
  };

  const getFacultyDisplay = (fid: string) => {
    if (!fid) return "Select faculty";
    const f = faculties.find(x => x.faculty_id.toString() === fid);
    return f ? f.Name : "Select faculty";
  };

  const openEditDialog = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      day:              slot.day,
      period_slot_id:   slot.period_slot_id.toString(),
      subject_id:       slot.subject_id?.toString() ?? slot.subject?.id?.toString() ?? "none",
      faculty_id:       slot.faculty_id?.toString() ?? slot.faculty?.faculty_id?.toString() ?? "",
      session_type:     slot.session_type,
      is_lab_session:   slot.is_lab_session,
      lab_pair_slot_id: slot.lab_pair_slot_id?.toString() ?? "",
      lab_group:        slot.lab_group ?? "",
      room:             slot.room ?? "",
      notes:            slot.notes ?? "",
      start_time:       slot.start_time ?? "",
      end_time:         slot.end_time ?? "",
    });
    setIsDialogOpen(true);
  };

  const toTimePayload = (t: string) => (!t || !t.includes(":") ? null : t + ":00");

  const enrichSlot = (slotData: any) => {
    // After create/update, replace the subject/faculty on the returned slot
    // using our locally loaded array so names display immediately
    if (slotData.subject_id) {
      const local = subjects.find(s => s.id === slotData.subject_id);
      if (local) slotData.subject = local;
    }
    if (slotData.faculty_id) {
      const local = faculties.find(f => f.faculty_id === slotData.faculty_id);
      if (local) slotData.faculty = local;
    }
    return slotData;
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const handleAddSlot = async () => {
    try {
      setLoading(true);
      const payload = {
        day:              formData.day,
        period_slot_id:   parseInt(formData.period_slot_id),
        subject_id:       formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
        faculty_id:       formData.faculty_id ? parseInt(formData.faculty_id) : null,
        session_type:     formData.session_type,
        is_lab_session:   formData.is_lab_session || false,
        lab_pair_slot_id: formData.lab_pair_slot_id ? parseInt(formData.lab_pair_slot_id) : null,
        lab_group:        formData.lab_group || null,
        room:             formData.room || null,
        notes:            formData.notes || null,
        start_time:       toTimePayload(formData.start_time),
        end_time:         toTimePayload(formData.end_time),
      };

      const res = await fetch(`/api/v1/timetable-master/${masterId}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newSlot = await res.json();
        setSlots(prev => [...prev, enrichSlot(newSlot.data)]);
        setIsDialogOpen(false);
        resetForm();
        toast({ title: "Success", description: "Slot created successfully" });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to create slot (${res.status})`);
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to create slot", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/timetable-master/${masterId}/slots/${editingSlot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          day:              formData.day,
          period_slot_id:   parseInt(formData.period_slot_id),
          subject_id:       formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
          faculty_id:       formData.faculty_id ? parseInt(formData.faculty_id) : null,
          session_type:     formData.session_type,
          is_lab_session:   formData.is_lab_session || false,
          lab_pair_slot_id: formData.lab_pair_slot_id ? parseInt(formData.lab_pair_slot_id) : null,
          lab_group:        formData.lab_group || null,
          room:             formData.room || null,
          notes:            formData.notes || null,
          start_time:       toTimePayload(formData.start_time),
          end_time:         toTimePayload(formData.end_time),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSlots(prev => prev.map(s => (s.id === editingSlot.id ? enrichSlot(updated.data) : s)));
        setIsDialogOpen(false);
        setEditingSlot(null);
        resetForm();
        toast({ title: "Success", description: "Slot updated successfully" });
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update slot");
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update slot", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/timetable-master/${masterId}/slots/${slotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setSlots(prev => prev.filter(s => s.id !== slotId));
        toast({ title: "Success", description: "Slot deleted successfully" });
      } else {
        throw new Error("Failed to delete slot");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete slot", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Download Template ────────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const headers = ["Day*", "Period ID*", "Subject Code", "Faculty Code", "Session Type", "Room", "Notes"];
    const slotMap = new Map<string, TimetableSlot>();
    slots.forEach(slot => slotMap.set(`${slot.day}-${slot.period_slot_id}`, slot));

    const dataToExport: (string | number)[][] = [];
    days.forEach(day => {
      periods.forEach(period => {
        const slot = slotMap.get(`${day}-${period.id}`);
        if (slot) {
          dataToExport.push([
            slot.day, slot.period_slot_id,
            slot.subject?.code || "",
            slot.faculty?.college_code || "",
            slot.session_type || "theory",
            slot.room || "", slot.notes || "",
          ]);
        } else {
          dataToExport.push([
            day, period.id, "", "",
            period.isBreak ? "break" : "theory",
            "",
            period.isBreak ? `${period.label} (${period.time})` : "",
          ]);
        }
      });
    });

    const instructions = [
      "# ============================================================",
      `# TIMETABLE TEMPLATE FOR: ${timetableName}`,
      "# ============================================================",
      "# Instructions:",
      "# 1. Day* (Required): Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      "# 2. Period ID* (Required): Use numbers 1-10 (already filled)",
      "# 3. Subject Code: Use the subject code from list below",
      "# 4. Faculty Code: Use faculty code from list below",
      "# 5. Session Type: theory, lab, tutorial, activity, project, break, or free",
      "# 6. Room: Room number or location",
      "# 7. Notes: Additional notes",
      "#",
      `# BREAK PERIODS: ${breakTimings.morningBreak.startPeriod} (Break), ${breakTimings.lunch.startPeriod} (Lunch), ${breakTimings.afternoonBreak.startPeriod} (Break)`,
      "#",
      `# SUBJECTS (${subjects.length}):`,
      ...subjects.map(s => `# - ${s.code.padEnd(12)} : ${s.name}`),
      "#",
      `# FACULTY (${faculties.length}):`,
      ...faculties.map(f => `# - ${(f.college_code || `ID:${f.faculty_id}`).padEnd(12)} : ${f.Name}`),
      "# ============================================================",
      "",
    ];

    const csv = [...instructions, headers.join(","), ...dataToExport.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const el = document.createElement("a");
    el.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    const safeName = (timetableName || "timetable").replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase().substring(0, 30);
    el.setAttribute("download", `timetable-${safeName}-${new Date().toISOString().split("T")[0]}.csv`);
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    toast({ title: "Downloaded", description: slots.length > 0 ? `Downloaded ${slots.length} existing slots.` : "Blank template downloaded." });
  };

  // ── Code helpers ─────────────────────────────────────────────────────────────
  const getSubjectIdFromCode = (val: string): number | null => {
    if (!val?.trim()) return null;
    const num = parseInt(val.trim());
    if (!isNaN(num)) return num;
    const s = subjects.find(x => x.code && x.code.toUpperCase() === val.trim().toUpperCase());
    return s ? s.id : null;
  };

  const getFacultyIdFromCode = (val: string): number | null => {
    if (!val?.trim()) return null;
    const num = parseInt(val.trim());
    if (!isNaN(num)) return num;
    const f = faculties.find(x => x.college_code && x.college_code.toUpperCase() === val.trim().toUpperCase());
    return f ? f.faculty_id : null;
  };

  // ── Bulk Upload ───────────────────────────────────────────────────────────────
  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const allLines = text.trim().split("\n");
      const lines = allLines.filter(l => !l.trim().startsWith("#"));

      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
      const dayIdx     = headers.indexOf("day");
      const periodIdx  = headers.indexOf("period id");
      const subCodeIdx = headers.indexOf("subject code");
      const subIdIdx   = headers.indexOf("subject id");
      const subIdx     = subCodeIdx !== -1 ? subCodeIdx : subIdIdx;
      const facCodeIdx = headers.indexOf("faculty code");
      const facLongIdx = headers.indexOf("faculty college code");
      const facIdIdx   = headers.indexOf("faculty id");
      const facIdx     = facLongIdx !== -1 ? facLongIdx : facCodeIdx !== -1 ? facCodeIdx : facIdIdx;
      const sessionIdx = headers.indexOf("session type");
      const roomIdx    = headers.indexOf("room");
      const notesIdx   = headers.indexOf("notes");

      if (dayIdx === -1 || periodIdx === -1) throw new Error("CSV must have 'Day' and 'Period ID' columns");

      const slotsToCreate: any[] = [];
      const failedRows: { row: number; reason: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        if (!vals[0]) continue;

        try {
          let subject_id: number | null = null;
          if (subIdx !== -1 && vals[subIdx]) {
            subject_id = getSubjectIdFromCode(vals[subIdx]);
            if (!subject_id && vals[subIdx].trim()) {
              failedRows.push({ row: i + 1, reason: `Subject "${vals[subIdx]}" not found` });
              continue;
            }
          }
          let faculty_id: number | null = null;
          if (facIdx !== -1 && vals[facIdx]) {
            faculty_id = getFacultyIdFromCode(vals[facIdx]);
            if (!faculty_id && vals[facIdx].trim()) {
              failedRows.push({ row: i + 1, reason: `Faculty "${vals[facIdx]}" not found` });
              continue;
            }
          }

          const periodId = parseInt(vals[periodIdx]);
          const period = periods.find(p => p.id === periodId);
          let sessionType = sessionIdx !== -1 ? vals[sessionIdx] : "theory";
          if (period?.isBreak) sessionType = "break";

          slotsToCreate.push({
            day:          vals[dayIdx],
            period_slot_id: periodId,
            subject_id,
            faculty_id,
            session_type: sessionType,
            room:         roomIdx !== -1 && vals[roomIdx] ? vals[roomIdx] : null,
            notes:        notesIdx !== -1 && vals[notesIdx] ? vals[notesIdx] : null,
          });
        } catch (rowErr) {
          failedRows.push({ row: i + 1, reason: rowErr instanceof Error ? rowErr.message : "Unknown error" });
        }
      }

      if (slotsToCreate.length === 0) throw new Error("No valid slots found in CSV");

      const res = await fetch(`/api/v1/timetable-master/${masterId}/slots/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ slots: slotsToCreate }),
      });

      if (res.ok) {
        const result = await res.json();
        setSlots(result.data || []);
        let msg = `${result.data?.length ?? slotsToCreate.length} slot(s) uploaded successfully`;
        if (failedRows.length > 0) msg += ` (${failedRows.length} row(s) skipped)`;
        toast({ title: "✅ Upload Successful", description: msg });
        if (failedRows.length > 0) window.alert(`⚠️ ${failedRows.length} row(s) skipped:\n` + failedRows.slice(0, 5).map(r => `Row ${r.row}: ${r.reason}`).join("\n"));
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${res.status}`);
      }
    } catch (err) {
      toast({ title: "❌ Upload Failed", description: err instanceof Error ? err.message : "Failed to upload", variant: "destructive" });
    } finally {
      setLoading(false);
      (event.target as HTMLInputElement).value = "";
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div>
          <button
            onClick={() => navigate("/faculty/timetable-management")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Timetable Management
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {timetableName || `Timetable #${masterId}`}
          </h1>
          {timetableInfo && (
            <p className="text-gray-500 mt-1 text-sm">
              {timetableInfo.academic_year} &bull; Sem {timetableInfo.semester} &bull; Batch {timetableInfo.batch}
              <span
                className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                  timetableInfo.status === "active"
                    ? "bg-green-100 text-green-800"
                    : timetableInfo.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {timetableInfo.status?.charAt(0).toUpperCase()}{timetableInfo.status?.slice(1)}
              </span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Add Slot */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingSlot(null); resetForm(); } }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSlot ? "Edit Slot" : "Add New Slot"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Day */}
                  <div>
                    <Label>Day *</Label>
                    <Select value={formData.day} onValueChange={v => setFormData({ ...formData, day: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Period */}
                  <div>
                    <Label>Period *</Label>
                    <Select
                      value={formData.period_slot_id}
                      onValueChange={v => {
                        const isBreak = breakPeriodIds.includes(parseInt(v));
                        setFormData({ ...formData, period_slot_id: v, session_type: isBreak ? "break" : formData.session_type });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {periodsList.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.label} — {p.time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                  </div>

                  {/* End Time */}
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                  </div>

                  {/* Subject */}
                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={v => setFormData({ ...formData, subject_id: v })}
                      disabled={formData.session_type === "break"}
                    >
                      <SelectTrigger><SelectValue>{getSubjectDisplay(formData.subject_id)}</SelectValue></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Activity / Free)</SelectItem>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}{s.code && ` (${s.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Faculty */}
                  <div>
                    <Label>Faculty</Label>
                    <Select
                      value={formData.faculty_id}
                      onValueChange={v => setFormData({ ...formData, faculty_id: v })}
                      disabled={formData.session_type === "break"}
                    >
                      <SelectTrigger><SelectValue>{getFacultyDisplay(formData.faculty_id)}</SelectValue></SelectTrigger>
                      <SelectContent>
                        {faculties.map(f => (
                          <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                            {f.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Session Type */}
                  <div>
                    <Label>Session Type</Label>
                    <Select
                      value={formData.session_type}
                      onValueChange={v => {
                        const isBreak = breakPeriodIds.includes(parseInt(formData.period_slot_id));
                        const final = isBreak && v !== "break" ? "break" : v;
                        setFormData({
                          ...formData,
                          session_type: final,
                          subject_id: final === "break" ? "none" : formData.subject_id,
                          faculty_id: final === "break" ? ""   : formData.faculty_id,
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map(t => {
                          const isBreak = breakPeriodIds.includes(parseInt(formData.period_slot_id));
                          if (isBreak && t !== "break") return null;
                          return <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Room */}
                  <div>
                    <Label>Room / Lab</Label>
                    <Input
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g., Room 101, Lab A"
                    />
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <Label>{formData.session_type === "break" ? "Break Name" : "Notes"}</Label>
                    <Input
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={formData.session_type === "break" ? "e.g., Tea Break, Lunch Break" : "e.g., DM, App Lab"}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={editingSlot ? handleUpdateSlot : handleAddSlot} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingSlot ? "Update Slot" : "Add Slot"}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingSlot(null); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Download Template */}
          <Button variant="outline" onClick={downloadTemplate} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>

          {/* Bulk Upload */}
          <Button variant="outline" disabled={loading} className="relative">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>

          {/* Refresh */}
          <Button variant="ghost" onClick={fetchSlots} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </motion.div>

      {/* Slots Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {slots.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No slots added yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Click <strong>Add Slot</strong> to create the first slot, or use <strong>Bulk Upload</strong> to import from CSV.
              </p>
            </CardContent>
          </Card>
        ) : (
          days.map(day => {
            const daySlots = slots.filter(s => s.day === day);
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {periodsList.map(period => {
                      const slot = daySlots.find(s => s.period_slot_id === period.id);
                      const displayTime =
                        slot?.start_time && slot?.end_time
                          ? `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`
                          : period.time;

                      return (
                        <div
                          key={`${day}-${period.id}`}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            period.isBreak ? "bg-amber-50 border-amber-100" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-700">
                              {period.label}
                              <span className="ml-2 text-xs text-gray-400 font-normal">({displayTime})</span>
                            </p>
                            {slot ? (
                              <div className="mt-1 space-y-0.5">
                                {slot.session_type === "break" ? (
                                  <p className="text-sm text-amber-600 font-medium">{slot.notes || "Break"}</p>
                                ) : slot.subject_id ? (
                                  <p className="text-sm text-blue-700 font-medium">
                                    {/* subject.name from helper endpoints, subject_name from raw getSlots association */
                                    slot.subject?.name ??
                                    slot.subject?.subject_name ??
                                    subjects.find(s => s.id === slot.subject_id)?.name ??
                                    `Subject ${slot.subject_id}`}
                                    {(slot.subject?.code || slot.subject?.subject_code) && (
                                      <span className="ml-1 text-xs text-gray-400">
                                        ({slot.subject.code || slot.subject.subject_code})
                                      </span>
                                    )}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">(Activity / Free)</p>
                                )}
                                {slot.session_type !== "break" && (
                                  <p className="text-xs text-gray-500">
                                    {slot.faculty?.Name ?? "—"} &bull; {slot.session_type} {slot.room ? `| ${slot.room}` : ""}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 mt-0.5">Not scheduled</p>
                            )}
                          </div>

                          {slot && (
                            <div className="flex gap-1 ml-3">
                              <Button size="sm" variant="ghost" onClick={() => openEditDialog(slot)} title="Edit slot">
                                <Edit2 className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600"
                                onClick={() => handleDeleteSlot(slot.id)}
                                title="Delete slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>
    </MainLayout>
  );
}
