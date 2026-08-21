import React, { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Label } from "@/pages/admin/department-admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pages/admin/department-admin/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/pages/admin/department-admin/components/ui/card";
import { Plus, Edit2, Trash2, AlertCircle, Download, Upload } from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";

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
  subject?: { id: number; name: string; code: string };
  faculty?: { faculty_id: number; Name: string; email: string; college_code?: string };
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

/**
 * Helper function to convert and normalize time format
 * Converts "HH:MM" to "HH:MM:SS" and validates format
 * Handles cases where time already has seconds
 */
const normalizeTimeFormat = (time: string | null | undefined): string | null => {
  if (!time || time.trim() === "") return null;

  // Already has 3 segments (HH:MM:SS)
  const parts = time.split(":");
  if (parts.length === 3) return time;

  // Only HH:MM format - add seconds
  if (parts.length === 2) return `${time}:00`;

  return null;
};

/**
 * Formats a 24-hour time string (e.g. "14:00" or "14:00:00") into a 12-hour AM/PM format (e.g. "02:00 PM").
 * Handles times that are already in 12-hour format cleanly.
 */
const formatTimeTo12h = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (trimmed === "") return "";

  if (trimmed.toLowerCase().includes("am") || trimmed.toLowerCase().includes("pm")) {
    return trimmed;
  }

  const parts = trimmed.split(":");
  let hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  if (isNaN(hours) || isNaN(minutes)) return trimmed;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes.toString().padStart(2, '0');
  const hoursStr = hours.toString().padStart(2, '0');

  return `${hoursStr}:${minutesStr} ${ampm}`;
};

/**
 * Formats a 24-hour time range (e.g. "09:30 - 10:20") into a 12-hour AM/PM format (e.g. "09:30 AM - 10:20 AM").
 */
const formatRangeTo12h = (rangeStr: string | null | undefined): string => {
  if (!rangeStr) return "";
  const parts = rangeStr.split(" - ");
  if (parts.length === 2) {
    return `${formatTimeTo12h(parts[0])} - ${formatTimeTo12h(parts[1])}`;
  }
  return rangeStr;
};

// Default periods - will be made dynamic later
const DEFAULT_PERIODS = [
  { id: 1, label: "I", time: "09:30 AM - 10:20 AM" },
  { id: 2, label: "II", time: "10:20 AM - 11:10 AM" },
  { id: 3, label: "III", time: "11:10 AM - 11:30 AM" },
  { id: 4, label: "IV", time: "11:30 AM - 12:25 PM" },
  { id: 5, label: "V", time: "12:25 PM - 01:10 PM" },
  { id: 6, label: "VI", time: "01:10 PM - 02:00 PM" },
  { id: 7, label: "VII", time: "02:00 PM - 02:50 PM" },
  { id: 8, label: "VIII", time: "02:50 PM - 03:10 PM" },
  { id: 9, label: "IX", time: "03:10 PM - 04:00 PM" },
  { id: 10, label: "X", time: "04:00 PM - 04:45 PM" },
];

const sessionTypes = ["theory", "lab", "tutorial", "activity", "project", "break", "free"];

export default function TimetableSlotsManagement() {
  const { masterId } = useParams<{ masterId: string }>();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [timetableName, setTimetableName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isBreakConfigOpen, setIsBreakConfigOpen] = useState(false);
  const [periods, setPeriods] = useState<typeof DEFAULT_PERIODS>([...DEFAULT_PERIODS]);
  const [breakPeriodIds, setBreakPeriodIds] = useState<number[]>([]); // Will be loaded from backend
  const [tempBreakTimings, setTempBreakTimings] = useState<Record<number, { start_time: string; end_time: string; break_name?: string }>>({});
  const { authToken } = useAuth();

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

  // Toggle a period as break or teaching
  const togglePeriodAsBreak = (periodId: number) => {
    setBreakPeriodIds(prev => {
      // Safety check: ensure prev is an array
      if (!Array.isArray(prev)) {
        console.warn('[BREAK CONFIG] prev is not an array:', prev, 'Type:', typeof prev, 'Will load from backend');
        return [];
      }

      return prev.includes(periodId)
        ? prev.filter(id => id !== periodId)
        : [...prev, periodId];
    });
  };

  // Get period status (break or teaching)
  const isPeriodBreak = (periodId: number) => breakPeriodIds.includes(periodId);

  // Fetch slots
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setSlots(data.data || []);
        // NOTE: Do NOT detect break periods from slots here
        // The break configuration is fetched separately from the backend
        // Slots may have old break entries that don't match current config
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast({
        title: "Error",
        description: "Failed to load slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, fetch timetable master to get class_id and name
        const masterRes = await fetch(
          `/api/v1/timetable-master/${masterId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        let classId: number | null = null;
        let masterName: string = "";
        if (masterRes.ok) {
          const masterData = await masterRes.json();
          classId = masterData.data?.class_id;
          masterName = masterData.data?.name || masterData.data?.title || "";
          setTimetableName(masterName);
          console.log("[FETCH DATA] Timetable Master:", { masterId, classId, masterName });
        }

        // Fetch subjects using subject-class-mapping based on the class
        let subjectsData: Subject[] = [];
        if (classId) {
          const subRes = await fetch(
            `/api/v1/department-admin/subject-class-mappings?class_id=${classId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          if (subRes.ok) {
            const data = await subRes.json();
            // Extract subjects from mappings - ONLY for this specific class
            subjectsData = data.data
              ?.map((mapping: any) => ({
                id: mapping.subject?.id || mapping.subject_id,
                name: mapping.subject?.name || mapping.subject?.subject_name || "Unknown",
                code: mapping.subject?.code || mapping.subject?.subject_code || "",
              }))
              .filter((s: Subject) => s.id) // Remove invalid entries
              .reduce((unique: Subject[], item: Subject) => {
                // Remove duplicates
                return unique.some(u => u.id === item.id) ? unique : [...unique, item];
              }, []);

            console.log("[FETCH DATA] Subjects for class", classId, ":", subjectsData);
          }
        }

        setSubjects(subjectsData);

        // Fetch faculty assigned to this class via faculty_subject_assignment
        let facultiesData: Faculty[] = [];
        if (classId) {
          const facRes = await fetch(
            `/api/v1/department-admin/faculty-allocations?class_id=${classId}&status=active`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          if (facRes.ok) {
            const data = await facRes.json();
            // Extract unique faculty from allocations
            const uniqueFaculties = data.data
              ?.map((allocation: any) => allocation.faculty)
              .filter((f: Faculty) => f && f.faculty_id) // Remove null/undefined
              .reduce((unique: Faculty[], item: Faculty) => {
                // Remove duplicates based on faculty_id
                return unique.some(u => u.faculty_id === item.faculty_id) ? unique : [...unique, item];
              }, []) || [];

            facultiesData = uniqueFaculties;
            console.log("[FETCH DATA] Faculty for class", classId, ":", facultiesData);
          }
        }

        setFaculties(facultiesData);

        fetchSlots();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      }
    };

    if (masterId && authToken) {
      fetchData();
    }
  }, [masterId, authToken]);

  // Function to refetch break configuration (callable from save handler)
  const refetchBreakConfig = async () => {
    if (!masterId || !authToken) return;

    try {
      const res = await fetch(
        `/api/v1/timetable-master/${masterId}/break-config`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.ok) {
        const data = await res.json();
        let breakIds = data.data?.breakPeriodIds || [];
        console.log('[BREAK CONFIG] Refetch raw data:', data.data?.breakPeriodIds);

        // Validate that breakIds is an array
        if (!Array.isArray(breakIds)) {
          console.warn('[BREAK CONFIG] Invalid breakIds format from refetch:', breakIds);
          breakIds = [];
        }

        console.log('[BREAK CONFIG] Refetched from backend:', breakIds);
        setBreakPeriodIds(breakIds);
        localStorage.setItem(`timetable_${masterId}_breaks`, JSON.stringify(breakIds));
      }
    } catch (error) {
      console.error('[BREAK CONFIG] Error refetching:', error);
    }
  };

  // Load break periods from backend (with localStorage fallback)
  useEffect(() => {
    if (masterId && authToken) {
      const fetchBreakConfig = async () => {
        try {
          // Try to fetch from backend first
          const res = await fetch(
            `/api/v1/timetable-master/${masterId}/break-config`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          if (res.ok) {
            const data = await res.json();
            let breakIds = data.data?.breakPeriodIds || [];
            console.log('[BREAK CONFIG] Raw data from backend:', data.data?.breakPeriodIds);

            // Validate that breakIds is an array
            if (!Array.isArray(breakIds)) {
              console.warn('[BREAK CONFIG] Invalid breakIds format from backend:', breakIds);
              breakIds = [];
            }

            console.log('[BREAK CONFIG] Loaded from backend:', breakIds);
            setBreakPeriodIds(breakIds);
            localStorage.setItem(`timetable_${masterId}_breaks`, JSON.stringify(breakIds));
          } else {
            // Fall back to localStorage
            const stored = localStorage.getItem(`timetable_${masterId}_breaks`);
            if (stored) {
              try {
                const breakIds = JSON.parse(stored);
                console.log('[BREAK CONFIG] Loaded from localStorage (backend unavailable):', breakIds);
                setBreakPeriodIds(breakIds);
              } catch (e) {
                console.error('[BREAK CONFIG] Failed to parse localStorage:', e);
                console.warn('[BREAK CONFIG] No break config available');
                setBreakPeriodIds([]);
              }
            } else {
              console.log('[BREAK CONFIG] No localStorage cache, waiting for backend');
              setBreakPeriodIds([]);
            }
          }
        } catch (error) {
          console.error('[BREAK CONFIG] Error fetching from backend:', error);
          const stored = localStorage.getItem(`timetable_${masterId}_breaks`);
          if (stored) {
            try {
              const breakIds = JSON.parse(stored);
              console.log('[BREAK CONFIG] Using localStorage cache:', breakIds);
              setBreakPeriodIds(breakIds);
            } catch (e) {
              console.error('[BREAK CONFIG] Failed to parse localStorage:', e);
              console.warn('[BREAK CONFIG] No valid config available');
              setBreakPeriodIds([]);
            }
          }
        }
      };

      fetchBreakConfig();
    }
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
            console.log('[PERIOD SLOTS] Loaded from backend:', periodData);

            const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
            const updatedPeriods = periodData.map((p: any) => {
              const isBreak = p.isBreak || breakPeriodIds.includes(p.id);
              let label = p.label || p.period_label;
              if (!label || label.toLowerCase().includes('break') || label.toLowerCase().includes('lunch')) {
                label = ROMAN[p.id] || `Period ${p.id}`;
              }
              return {
                id: p.id,
                label,
                time: p.time || "",
                isBreak,
              };
            });

            setPeriods(updatedPeriods);
          } else {
            console.log('[PERIOD SLOTS] Failed to fetch period slots');
          }
        } catch (error) {
          console.error('[PERIOD SLOTS] Error fetching:', error);
        }
      };

      fetchPeriodSlots();
    }
  }, [masterId, authToken, breakPeriodIds]);

  const handleAddSlot = async () => {
    try {
      setLoading(true);

      const payload = {
        day: formData.day,
        period_slot_id: parseInt(formData.period_slot_id),
        subject_id: formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        session_type: formData.session_type,
        is_lab_session: formData.is_lab_session || false,
        lab_pair_slot_id: formData.lab_pair_slot_id ? parseInt(formData.lab_pair_slot_id) : null,
        lab_group: formData.lab_group || null,
        room: formData.room || null,
        notes: formData.notes || null,
        start_time: normalizeTimeFormat(formData.start_time),
        end_time: normalizeTimeFormat(formData.end_time),
      };

      // Note: Allow users to override break period classification if they choose
      // (e.g., assign a lecture during lunch break)
      const periodId = parseInt(formData.period_slot_id);
      if (isPeriodBreak(periodId) && formData.session_type !== 'break') {
        console.log('[SLOT CREATE] Period', periodId, 'is configured as BREAK but user chose session_type:', formData.session_type, '- allowing override');
      }

      console.log("[SLOT CREATE] Payload:", payload, "Is Break Period Configured:", isPeriodBreak(periodId));

      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("[SLOT CREATE] Response status:", response.status);

      if (response.ok) {
        const newSlot = await response.json();
        const slotData = newSlot.data;

        // Enrich slot with subject details from our loaded subjects array
        if (slotData.subject_id) {
          const subjectDetails = subjects.find(s => s.id === slotData.subject_id);
          if (subjectDetails) {
            slotData.subject = subjectDetails;
          }
        }

        // Enrich slot with faculty details from our loaded faculties array
        if (slotData.faculty_id) {
          const facultyDetails = faculties.find(f => f.faculty_id === slotData.faculty_id);
          if (facultyDetails) {
            slotData.faculty = facultyDetails;
          }
        }

        setSlots((prev) => [...prev, slotData]);
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: "Slot created successfully",
        });
        window.alert("✅ Slot created successfully!");
      } else {
        let errorMessage = `Failed to create slot: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.log("[SLOT CREATE] Error response:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.log("[SLOT CREATE] Error text:", text);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("[SLOT CREATE] Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create slot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;

    try {
      setLoading(true);

      const periodId = parseInt(formData.period_slot_id);
      const isBreakPeriod = isPeriodBreak(periodId);

      const updatePayload: any = {
        day: formData.day,
        period_slot_id: periodId,
        subject_id: formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        session_type: formData.session_type,
        is_lab_session: formData.is_lab_session || false,
        lab_pair_slot_id: formData.lab_pair_slot_id ? parseInt(formData.lab_pair_slot_id) : null,
        lab_group: formData.lab_group || null,
        room: formData.room || null,
        notes: formData.notes || null,
        start_time: normalizeTimeFormat(formData.start_time),
        end_time: normalizeTimeFormat(formData.end_time),
      };

      // Note: Allow users to override break period classification if they choose
      // (e.g., assign a lecture during lunch break)
      if (isBreakPeriod && formData.session_type !== 'break') {
        console.log('[SLOT UPDATE] Period', periodId, 'is configured as BREAK but user chose session_type:', formData.session_type, '- allowing override');
      }

      console.log('[SLOT UPDATE] Payload:', updatePayload, 'Is Break Period Configured:', isBreakPeriod);

      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots/${editingSlot.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        const updatedSlotData = updated.data;

        // Enrich slot with subject details from our loaded subjects array
        if (updatedSlotData.subject_id) {
          const subjectDetails = subjects.find(s => s.id === updatedSlotData.subject_id);
          if (subjectDetails) {
            updatedSlotData.subject = subjectDetails;
          }
        }

        // Enrich slot with faculty details from our loaded faculties array
        if (updatedSlotData.faculty_id) {
          const facultyDetails = faculties.find(f => f.faculty_id === updatedSlotData.faculty_id);
          if (facultyDetails) {
            updatedSlotData.faculty = facultyDetails;
          }
        }

        setSlots((prev) =>
          prev.map((s) => (s.id === editingSlot.id ? updatedSlotData : s))
        );
        setIsDialogOpen(false);
        setEditingSlot(null);
        resetForm();
        toast({
          title: "Success",
          description: "Slot updated successfully",
        });
        window.alert("✅ Slot updated successfully!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update slot: ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update slot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToAllDays = async () => {
    if (formData.day !== "Monday") {
      toast({
        title: "Error",
        description: "Copy to All Days only works when viewing Monday slots",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm(
      `Copy this slot (Period ${formData.period_slot_id}) to Tuesday through Saturday?`
    )) {
      return;
    }

    try {
      setLoading(true);
      const periodId = parseInt(formData.period_slot_id);
      const isBreakPeriod = isPeriodBreak(periodId);

      // Create base payload for copying
      const basePayload: any = {
        period_slot_id: periodId,
        subject_id: formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
        session_type: formData.session_type,
        is_lab_session: formData.is_lab_session || false,
        lab_pair_slot_id: formData.lab_pair_slot_id ? parseInt(formData.lab_pair_slot_id) : null,
        lab_group: formData.lab_group || null,
        room: formData.room || null,
        notes: formData.notes || null,
        start_time: normalizeTimeFormat(formData.start_time),
        end_time: normalizeTimeFormat(formData.end_time),
      };

      if (isBreakPeriod) {
        basePayload.subject_id = null;
        basePayload.faculty_id = null;
        basePayload.session_type = 'break';
        basePayload.room = null;
        basePayload.is_lab_session = false;
      }

      // Copy to all other days
      const otherDays = days.filter(d => d !== "Monday");
      let successCount = 0;
      let failureCount = 0;
      const failedDays: string[] = [];

      for (const targetDay of otherDays) {
        try {
          // Check if slot already exists for this day/period
          const existingSlot = slots.find(
            s => s.day === targetDay && s.period_slot_id === periodId
          );

          // Construct payload to only update timing for teaching slots, and copy break settings for break slots
          let payload: any;
          if (existingSlot) {
            if (isBreakPeriod || formData.session_type === 'break') {
              payload = {
                start_time: basePayload.start_time,
                end_time: basePayload.end_time,
                session_type: 'break',
                notes: formData.notes || null,
                subject_id: null,
                faculty_id: null,
                room: null,
                is_lab_session: false,
              };
            } else {
              // For teaching slots, ONLY update timings to avoid overwriting subject/faculty/etc.
              payload = {
                start_time: basePayload.start_time,
                end_time: basePayload.end_time,
              };
            }
          } else {
            if (isBreakPeriod || formData.session_type === 'break') {
              payload = {
                day: targetDay,
                period_slot_id: periodId,
                session_type: 'break',
                notes: formData.notes || null,
                start_time: basePayload.start_time,
                end_time: basePayload.end_time,
                subject_id: null,
                faculty_id: null,
                room: null,
                is_lab_session: false,
              };
            } else {
              // Create as empty teaching slot with timing
              payload = {
                day: targetDay,
                period_slot_id: periodId,
                session_type: 'theory',
                start_time: basePayload.start_time,
                end_time: basePayload.end_time,
                subject_id: null,
                faculty_id: null,
                room: null,
                is_lab_session: false,
              };
            }
          }

          const method = existingSlot ? "PATCH" : "POST";
          const url = existingSlot
            ? `/api/v1/timetable-master/${masterId}/slots/${existingSlot.id}`
            : `/api/v1/timetable-master/${masterId}/slots`;

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const result = await response.json();
            const slotData = result.data;

            // Enrich with subject/faculty details
            if (slotData.subject_id) {
              const subjectDetails = subjects.find(s => s.id === slotData.subject_id);
              if (subjectDetails) slotData.subject = subjectDetails;
            }
            if (slotData.faculty_id) {
              const facultyDetails = faculties.find(f => f.faculty_id === slotData.faculty_id);
              if (facultyDetails) slotData.faculty = facultyDetails;
            }

            // Update slots list
            if (existingSlot) {
              setSlots(prev =>
                prev.map(s => (s.id === existingSlot.id ? slotData : s))
              );
            } else {
              setSlots(prev => [...prev, slotData]);
            }
            successCount++;
          } else {
            failureCount++;
            failedDays.push(targetDay);
          }
        } catch (error) {
          failureCount++;
          failedDays.push(targetDay);
        }
      }

      // Show results
      let description = `Copied to ${successCount} day(s)`;
      if (failureCount > 0) {
        description += ` (${failureCount} day(s) failed: ${failedDays.join(", ")})`;
      }

      toast({
        title: successCount > 0 ? "Success" : "Failed",
        description,
        variant: failureCount > 0 ? "default" : undefined,
      });

      if (successCount > 0) {
        window.alert(`✅ Timings copied to other days successfully!\n${description}`);
        setIsDialogOpen(false);
        setEditingSlot(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error copying to all days:", error);
      toast({
        title: "Error",
        description: "Failed to copy slot to all days",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots/${slotId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== slotId));
        toast({
          title: "Success",
          description: "Slot deleted successfully",
        });
        window.alert("✅ Slot deleted successfully!");
      } else {
        throw new Error("Failed to delete slot");
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  const getSubjectDisplay = (subjectId: string) => {
    if (subjectId === "none" || !subjectId) {
      return "Select subject";
    }
    const subject = subjects.find((s) => s.id.toString() === subjectId);
    return subject
      ? `${subject.name} ${subject.code ? `(${subject.code})` : ""}`
      : `Subject ${subjectId}`;
  };

  const getFacultyDisplay = (facultyId: string) => {
    if (!facultyId) {
      return "Select faculty";
    }
    const faculty = faculties.find((f) => f.faculty_id.toString() === facultyId);
    return faculty ? faculty.Name : "Select faculty";
  };

  const openEditDialog = (slot: TimetableSlot) => {
    setEditingSlot(slot);

    const resolvedSubjectId =
      slot.subject_id?.toString() || slot.subject?.id?.toString() || "none";
    const resolvedFacultyId =
      slot.faculty_id?.toString() || slot.faculty?.faculty_id?.toString() || "";

    // Use the slot's actual session_type (don't override based on break configuration)
    const sessionType = slot.session_type || "theory";

    setFormData({
      day: slot.day,
      period_slot_id: slot.period_slot_id.toString(),
      subject_id: resolvedSubjectId,
      faculty_id: resolvedFacultyId,
      session_type: sessionType,
      is_lab_session: slot.is_lab_session,
      lab_pair_slot_id: slot.lab_pair_slot_id?.toString() || "",
      lab_group: slot.lab_group || "",
      room: slot.room || "",
      notes: slot.notes || "",
      start_time: slot.start_time || "",
      end_time: slot.end_time || "",
    });
    setIsDialogOpen(true);
  };

  const downloadTemplate = () => {
    // Use shorter, cleaner headers that won't be truncated
    const headers = [
      "Day*",
      "Period ID*",
      "Subject Code",
      "Faculty Code",
      "Session Type",
      "Start Time",
      "End Time",
      "Is Lab Session",
      "Lab Pair Slot ID",
      "Lab Group",
      "Room",
      "Notes",
    ];

    // Create a map of existing slots for quick lookup: "Monday-1" -> slot data
    const slotMap = new Map<string, TimetableSlot>();
    slots.forEach((slot) => {
      const key = `${slot.day}-${slot.period_slot_id}`;
      slotMap.set(key, slot);
    });

    // Generate ALL possible day/period combinations (complete schedule)
    const dataToExport: (string | number)[][] = [];

    days.forEach((day) => {
      periods.forEach((period) => {
        const key = `${day}-${period.id}`;
        const slot = slotMap.get(key);

        if (slot) {
          // Existing slot - fill in with actual data
          const subjectCode = slot.subject?.code || "";
          const facultyCode = slot.faculty?.college_code || "";

          dataToExport.push([
            slot.day,
            slot.period_slot_id,
            subjectCode,
            facultyCode,
            slot.session_type || "theory",
            slot.start_time || "",
            slot.end_time || "",
            slot.is_lab_session ? "true" : "false",
            slot.lab_pair_slot_id || "",
            slot.lab_group || "",
            slot.room || "",
            slot.notes || "",
          ]);
        } else {
          // Empty slot - pre-fill with day/period, leave subject/faculty blank
          // Auto-detect breaks based on breakPeriodIds
          const isBreak = isPeriodBreak(period.id);
          const sessionType = isBreak ? "break" : "theory";

          dataToExport.push([
            day,
            period.id,
            "", // Subject Code - leave blank for user to fill
            "", // Faculty Code - leave blank for user to fill
            sessionType, // "break" for breaks/lunch, "theory" for regular periods
            "", // Start Time - leave blank for user to fill
            "", // End Time - leave blank for user to fill
            "false", // Is Lab Session
            "", // Lab Pair Slot ID
            "", // Lab Group
            "", // Room
            isBreak ? `${period.label} (${period.time})` : "", // Pre-fill break info in notes
          ]);
        }
      });
    });

    // Add information section at the top
    const breakPeriodsInfo = periods
      .filter(p => isPeriodBreak(p.id))
      .map(p => `# - Period ${p.id}: ${p.label} (${p.time})`)
      .join('\n');

    const instructionLines = [
      "# ============================================================",
      `# TIMETABLE TEMPLATE FOR: ${timetableName || 'Unknown Class'}`,
      "# ============================================================",
      "# This template contains ALL possible time slots for this class",
      "# with ONLY the subjects and faculty assigned to this class",
      "#",
      "# Instructions:",
      "# 1. Day* (Required): Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
      "# 2. Period ID* (Required): Use numbers 1-10 (already filled)",
      "# 3. Subject Code: Use the subject code from list below - leave blank for free periods",
      "# 4. Faculty Code: Use faculty code from list below - leave blank for unassigned",
      "# 5. Session Type: theory, lab, tutorial, activity, project, break, or free",
      "#    - 'break' is auto-filled for break/lunch periods (do not change these)",
      "# 6. Start Time: HH:MM or HH:MM:SS format (e.g., 09:30 or 09:30:00)",
      "# 7. End Time: HH:MM or HH:MM:SS format",
      "# 8. Is Lab Session: true or false (leave blank for false)",
      "# 9. Lab Pair Slot ID: Period ID of paired theoretical slot (lab sessions only)",
      "# 10. Lab Group: Lab group identifier (e.g., A, B, 1, 2)",
      "# 11. Room: Room number or location (e.g., Room 101, Lab-A)",
      "# 12. Notes: Any additional notes about the slot",
      "#",
      "# BREAK TIMINGS (Do not assign subjects to these):",
      ...breakPeriodsInfo.split('\n').filter(l => l.trim()),
      "#",
      `# SUBJECTS AVAILABLE FOR ${timetableName || 'THIS CLASS'} (${subjects.length} subject${subjects.length !== 1 ? 's' : ''}):`,
      ...subjects.map(s => `# - ${s.code.padEnd(12)} : ${s.name}`),
      subjects.length === 0 ? "# - (No subjects mapped to this class)" : "",
      "",
      `# FACULTY AVAILABLE FOR ${timetableName || 'THIS CLASS'} (${faculties.length} facult${faculties.length !== 1 ? 'ies' : 'y'}):`,
      ...faculties.map(f => `# - ${(f.college_code || `ID:${f.faculty_id}`).padEnd(12)} : ${f.Name}`),
      faculties.length === 0 ? "# - (No faculty allocated to this class)" : "",
      "",
      "# ============================================================",
    ];

    // Add footer with period counts
    const teachingPeriodCount = periods.filter(p => !isPeriodBreak(p.id)).length;
    const breakPeriodCount = periods.filter(p => isPeriodBreak(p.id)).length;
    instructionLines.push(
      `# Teaching Periods: ${teachingPeriodCount} | Break/Lunch: ${breakPeriodCount} | Total: ${periods.length}`,
      `# Total Slots: ${dataToExport.length} (${days.length} days × ${periods.length} periods)`,
      "# ============================================================",
      "",
    );

    // Debug: Log what's being exported
    const teachingPeriods = periods.filter(p => !isPeriodBreak(p.id));
    const breakPeriods = periods.filter(p => isPeriodBreak(p.id));
    console.log("[DOWNLOAD TEMPLATE]", {
      masterId,
      timetableName,
      totalSlots: dataToExport.length,
      totalDays: days.length,
      teachingPeriods: teachingPeriods.length,
      breakPeriods: breakPeriods.length,
      totalPeriods: periods.length,
      existingSlots: slots.length,
      prefilledSlots: dataToExport.length - slots.length,
      subjectsCount: subjects.length,
      subjects: subjects.map(s => `${s.code}:${s.name}`),
      facultiesCount: faculties.length,
      faculties: faculties.map(f => `${f.college_code}:${f.Name}`),
    });

    const csvContent = [
      ...instructionLines,
      headers.join(","),
      ...dataToExport.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );

    // Create a filename that includes the class name
    const sanitizedName = (timetableName || "timetable")
      .replace(/[^a-zA-Z0-9\-]/g, "-")
      .toLowerCase()
      .substring(0, 30);

    element.setAttribute(
      "download",
      `timetable-${sanitizedName}-${new Date().toISOString().split('T')[0]}.csv`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: slots.length > 0
        ? `Downloaded ${slots.length} slots from current timetable.`
        : "Template downloaded. Fill it and upload to bulk add slots.",
    });
  };

  // Helper function to convert subject code to subject_id
  const getSubjectIdFromCode = (codeOrId: string): number | null => {
    if (!codeOrId || !codeOrId.trim()) return null;

    const trimmed = codeOrId.trim().toUpperCase();

    // Try to parse as number first (backward compatibility)
    const asNumber = parseInt(trimmed);
    if (!isNaN(asNumber)) {
      return asNumber;
    }

    // Try to find by code
    const subject = subjects.find(
      (s) => s.code && s.code.toUpperCase() === trimmed
    );
    return subject ? subject.id : null;
  };

  // Helper function to convert faculty college code to faculty_id
  const getFacultyIdFromCode = (codeOrId: string): number | null => {
    if (!codeOrId || !codeOrId.trim()) return null;

    const trimmed = codeOrId.trim().toUpperCase();

    // Try to parse as number first (backward compatibility)
    const asNumber = parseInt(trimmed);
    if (!isNaN(asNumber)) {
      return asNumber;
    }

    // Try to find by college code (it's case-insensitive)
    const faculty = faculties.find(
      (f) => f.college_code && f.college_code.toUpperCase() === trimmed
    );
    return faculty ? faculty.faculty_id : null;
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log("[BULK UPLOAD] File selected:", file?.name);

    if (!file) {
      console.warn("[BULK UPLOAD] No file selected");
      toast({
        title: "⚠️ No File",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("[BULK UPLOAD] Reading file...");
      const text = await file.text();
      // Skip any comment/instruction lines that start with #
      const allLines = text.trim().split("\n");
      const lines = allLines.filter((line) => !line.trim().startsWith("#"));

      console.log("[BULK UPLOAD] Lines count:", lines.length);

      if (lines.length < 2) {
        throw new Error("CSV file must have header and at least one row");
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      console.log("[BULK UPLOAD] Headers:", headers);

      const dayIndex = headers.indexOf("day");
      const periodIndex = headers.indexOf("period id");
      const startTimeIndex = headers.indexOf("start time");
      const endTimeIndex = headers.indexOf("end time");

      // Support both new code-based columns and old ID-based columns for backward compatibility
      const subjectCodeIndex = headers.indexOf("subject code");
      const subjectIdIndex = headers.indexOf("subject id");
      const subjectIndex = subjectCodeIndex !== -1 ? subjectCodeIndex : subjectIdIndex;

      // Try multiple column name variations for faculty code
      const facultyCodeLongIndex = headers.indexOf("faculty college code");
      const facultyCodeShortIndex = headers.indexOf("faculty code");
      const facultyIdIndex = headers.indexOf("faculty id");
      const facultyIndex = facultyCodeLongIndex !== -1
        ? facultyCodeLongIndex
        : facultyCodeShortIndex !== -1
          ? facultyCodeShortIndex
          : facultyIdIndex;

      const sessionTypeIndex = headers.indexOf("session type");
      const roomIndex = headers.indexOf("room");
      const notesIndex = headers.indexOf("notes");
      const isLabIndex = headers.indexOf("is lab session");
      const labPairIndex = headers.indexOf("lab pair slot id");
      const labGroupIndex = headers.indexOf("lab group");

      console.log("[BULK UPLOAD] Column indices:", { dayIndex, periodIndex, subjectIndex, facultyIndex, startTimeIndex, endTimeIndex });

      if (dayIndex === -1 || periodIndex === -1) {
        throw new Error("CSV must have 'Day' and 'Period ID' columns");
      }

      const slotsToCreate = [];
      const failedRows: Array<{ row: number; reason: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));

        if (values.length > 0 && values[0]) {
          try {
            // Get subject_id from code or numeric ID
            let subject_id: number | null = null;
            if (subjectIndex !== -1 && values[subjectIndex]) {
              subject_id = getSubjectIdFromCode(values[subjectIndex]);
              if (!subject_id && values[subjectIndex].trim()) {
                failedRows.push({
                  row: i + 1,
                  reason: `Subject code/ID "${values[subjectIndex]}" not found`,
                });
                continue;
              }
            }

            // Get faculty_id from code or numeric ID
            let faculty_id: number | null = null;
            if (facultyIndex !== -1 && values[facultyIndex]) {
              faculty_id = getFacultyIdFromCode(values[facultyIndex]);
              if (!faculty_id && values[facultyIndex].trim()) {
                failedRows.push({
                  row: i + 1,
                  reason: `Faculty code/ID "${values[facultyIndex]}" not found`,
                });
                continue;
              }
            }

            const periodId = parseInt(values[periodIndex]);
            const period = periods.find(p => p.id === periodId);

            // Auto-set session type for breaks, allow override for regular periods
            let sessionType = sessionTypeIndex !== -1 ? values[sessionTypeIndex] : "theory";
            if (isPeriodBreak(periodId)) {
              sessionType = "break";
              // Warn if user tried to assign subject to break
              if (subject_id) {
                console.warn(`[BULK UPLOAD] Warning: Subject "${values[subjectIndex]}" assigned to break period ${periodId} (${period?.label}) in row ${i + 1}`);
              }
              // Warn if user tried to assign faculty to break
              if (faculty_id) {
                console.warn(`[BULK UPLOAD] Warning: Faculty assigned to break period ${periodId} (${period?.label}) in row ${i + 1}`);
              }
            }

            slotsToCreate.push({
              day: values[dayIndex],
              period_slot_id: periodId,
              subject_id,
              faculty_id,
              session_type: sessionType,
              room: roomIndex !== -1 && values[roomIndex] ? values[roomIndex] : null,
              notes: notesIndex !== -1 && values[notesIndex] ? values[notesIndex] : null,
              start_time: startTimeIndex !== -1 && values[startTimeIndex] ? normalizeTimeFormat(values[startTimeIndex]) : null,
              end_time: endTimeIndex !== -1 && values[endTimeIndex] ? normalizeTimeFormat(values[endTimeIndex]) : null,
              is_lab_session: isLabIndex !== -1 && (values[isLabIndex]?.toLowerCase() === 'true' || values[isLabIndex]?.toLowerCase() === 'yes' || values[isLabIndex] === '1') ? true : false,
              lab_pair_slot_id: labPairIndex !== -1 && values[labPairIndex] ? parseInt(values[labPairIndex]) : null,
              lab_group: labGroupIndex !== -1 && values[labGroupIndex] ? values[labGroupIndex] : null,
            });
          } catch (rowError) {
            failedRows.push({
              row: i + 1,
              reason: rowError instanceof Error ? rowError.message : "Unknown error",
            });
          }
        }
      }

      // Warn about break timings after parsing
      const breakPeriodIds = periods.filter(p => isPeriodBreak(p.id)).map(p => p.id);
      console.log("[BULK UPLOAD] Break period IDs that should not have subjects:", breakPeriodIds);

      console.log("[BULK UPLOAD] Slots to create:", slotsToCreate.length);

      if (slotsToCreate.length === 0) {
        throw new Error("No valid slots found in CSV");
      }

      console.log("[BULK UPLOAD] Sending to API...");
      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ slots: slotsToCreate }),
        }
      );

      console.log("[BULK UPLOAD] Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        const uploadedCount = result.data?.length || slotsToCreate.length;
        console.log("[BULK UPLOAD] Success - uploaded:", uploadedCount);
        setSlots(result.data || []);

        // Prepare detailed success message
        let description = `${uploadedCount} slot(s) uploaded successfully`;
        if (failedRows.length > 0) {
          description += ` (${failedRows.length} row(s) skipped - see details in console)`;
          console.log("[BULK UPLOAD] Failed rows:", failedRows);
        }

        console.log("[BULK UPLOAD] Calling toast...");
        toast({
          title: "✅ Upload Successful",
          description,
        });
        console.log("[BULK UPLOAD] Toast called");

        // Fallback: Show browser alert if toast doesn't work
        let alertMsg = `✅ Upload Successful!\n${uploadedCount} slot(s) uploaded from ${file.name}`;
        if (failedRows.length > 0) {
          alertMsg += `\n\n⚠️ ${failedRows.length} row(s) were skipped:\n`;
          alertMsg += failedRows.slice(0, 5).map(f => `  • Row ${f.row}: ${f.reason}`).join("\n");
          if (failedRows.length > 5) {
            alertMsg += `\n  ... and ${failedRows.length - 5} more`;
          }
        }
        window.alert(alertMsg);
      } else {
        const errorData = await response.json();
        console.error("[BULK UPLOAD] Server error:", errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("[BULK UPLOAD] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload slots";
      console.log("[BULK UPLOAD] Showing error toast:", errorMessage);

      toast({
        title: "❌ Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Fallback: Show browser alert
      window.alert(`❌ Upload Failed!\n${errorMessage}`);
    } finally {
      setLoading(false);
      ((event.target as HTMLInputElement).value = "");
      console.log("[BULK UPLOAD] Complete");
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Timetable Slots Management</h1>
          <p className="text-muted-foreground -mt-4">
            Add and manage class periods and schedules
          </p>
        </div>

        <div className="flex gap-2 w-fit">
          <Button
            onClick={async () => {
              // Refresh break config from backend before opening dialog
              console.log('[BREAK CONFIG] Opening dialog - refreshing from backend');
              await refetchBreakConfig();

              // Populate tempBreakTimings from periods when opening
              const initialTimings: Record<number, { start_time: string; end_time: string }> = {};
              periods.forEach(p => {
                const parts = p.time.split(" - ");

                const parseTimeTo24h = (tStr: string | undefined): string => {
                  if (!tStr) return "";
                  const trimmed = tStr.trim();
                  const is12h = trimmed.toLowerCase().includes("am") || trimmed.toLowerCase().includes("pm");
                  if (is12h) {
                    const timeParts = trimmed.split(" ");
                    const time = timeParts[0];
                    const ampm = timeParts[1] || "";
                    let [hours, minutes] = time.split(":").map(Number);
                    if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
                    if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                  }

                  const parts24h = trimmed.split(":");
                  const hours = parseInt(parts24h[0]);
                  const minutes = parseInt(parts24h[1]);
                  if (isNaN(hours) || isNaN(minutes)) return "";
                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                };

                initialTimings[p.id] = {
                  start_time: parseTimeTo24h(parts[0]),
                  end_time: parseTimeTo24h(parts[1]),
                };
              });
              console.log('[BREAK CONFIG] Initialized timings for editing:', initialTimings);
              setTempBreakTimings(initialTimings);

              setIsBreakConfigOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Configure Breaks
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSlot ? "Edit Slot" : "Add New Slot"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Break Period Banner */}
                {isPeriodBreak(parseInt(formData.period_slot_id)) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">This is a Configured Break Period</p>
                      <p className="text-xs text-amber-800">This period is configured as a break (e.g., lunch, tea break). You can optionally assign a subject and faculty if you want to schedule a lecture or activity during this time.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Day *</Label>
                    <Select value={formData.day} onValueChange={(v) => setFormData({ ...formData, day: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Period *</Label>
                    <Select
                      value={formData.period_slot_id}
                      onValueChange={(v) => {
                        // Allow any session type for any period - users can override break classification
                        setFormData({
                          ...formData,
                          period_slot_id: v,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((p) => {
                          const isBreak = isPeriodBreak(p.id);
                          const label = isBreak
                            ? `🔴 Period ${p.id}: ${p.label}`
                            : `Period ${p.id}: ${p.label}`;
                          return (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue>{getSubjectDisplay(formData.subject_id)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Activity/Free)</SelectItem>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name} {sub.code && `(${sub.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Faculty</Label>
                    <Select
                      value={formData.faculty_id}
                      onValueChange={(v) => setFormData({ ...formData, faculty_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue>{getFacultyDisplay(formData.faculty_id)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((fac) => (
                          <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                            {fac.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Session Type</Label>
                    <Select
                      value={formData.session_type}
                      onValueChange={(v) => {
                        const periodId = parseInt(formData.period_slot_id);
                        const isBreakPeriod = isPeriodBreak(periodId);

                        // Allow any session type, even for break periods
                        // (users can override break classification if needed)
                        setFormData({
                          ...formData,
                          session_type: v,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Room/Lab</Label>
                    <Input
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g., Room 101, Lab 1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>{formData.session_type === "break" ? "Break Name" : "Notes"}</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={
                        formData.session_type === "break"
                          ? "e.g., Tea Break, Lunch Break"
                          : "e.g., YOGA, DM, APP LAB"
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {editingSlot && formData.day === "Monday" && (
                    <Button
                      onClick={handleCopyToAllDays}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      📋 Copy to All Days
                    </Button>
                  )}
                  <Button
                    onClick={editingSlot ? handleUpdateSlot : handleAddSlot}
                    disabled={loading}
                  >
                    {editingSlot ? "Update Slot" : "Add Slot"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingSlot(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

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
        </div>
      </motion.div>

      {/* Slots Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {slots.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No slots added yet</p>
          </Card>
        ) : (
          days.map((day) => {
            const daySlots = slots.filter((s) => s.day === day);
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {periods.map((period) => {
                      const slot = daySlots.find((s) => s.period_slot_id === period.id);

                      // Display custom timing if available, otherwise use period default
                      const displayTime = slot?.start_time && slot?.end_time
                        ? `${formatTimeTo12h(slot.start_time)} - ${formatTimeTo12h(slot.end_time)}`
                        : formatRangeTo12h(period.time);

                      return (
                        <div
                          key={`${day}-${period.id}`}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg",
                            isPeriodBreak(period.id) ? "bg-purple-50 border-purple-200" : "bg-muted/30"
                          )}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {isPeriodBreak(period.id)
                                ? `🔴 Period ${period.id}: ${period.label} (Break - ${formatRangeTo12h(period.time)})`
                                : `Period ${period.id}: ${period.label} (${displayTime})`}
                            </p>
                            {slot ? (
                              <div className="mt-1 space-y-1">
                                {slot.session_type === "break" ? (
                                  <p className="text-sm text-blue-600">
                                    {slot.notes || "Break"}
                                  </p>
                                ) : slot.subject_id ? (
                                  <p className="text-sm text-blue-600">
                                    {slot.subject?.name || subjects.find(s => s.id === slot.subject_id)?.name || `Subject ${slot.subject_id}`}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    (Activity/Free)
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {slot.session_type === "break"
                                    ? "Break"
                                    : `${slot.faculty?.Name || "-"} | ${slot.session_type} | ${slot.room || "-"}`}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {isPeriodBreak(period.id) ? "Break period configured" : "Not scheduled"}
                              </p>
                            )}
                          </div>
                          {slot && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(slot)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteSlot(slot.id)}
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

      {/* Break Configuration Dialog */}
      <Dialog open={isBreakConfigOpen} onOpenChange={setIsBreakConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Break & Lunch Periods</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Mark which periods should be treated as breaks or lunch periods. Students will see these as non-teaching time slots.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-md">Available Periods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {periods.map((period) => (
                  <Card
                    key={period.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all border-2",
                      isPeriodBreak(period.id)
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    )}
                    onClick={() => togglePeriodAsBreak(period.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Period {period.id}: {period.label}</p>
                        <p className="text-sm text-muted-foreground">{formatRangeTo12h(period.time)}</p>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 border-2 rounded flex items-center justify-center transition-all",
                          isPeriodBreak(period.id)
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        )}
                      >
                        {isPeriodBreak(period.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isPeriodBreak(period.id) ? "Marked as BREAK" : "Teaching period"}
                    </p>
                    {isPeriodBreak(period.id) && (
                      <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-purple-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-purple-700 font-semibold">Break Type / Name</span>
                          <select
                            value={tempBreakTimings[period.id]?.break_name || (period.id === 5 ? "Lunch" : "Tea Break")}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempBreakTimings(prev => ({
                                ...prev,
                                [period.id]: {
                                  ...prev[period.id],
                                  break_name: val
                                }
                              }));
                            }}
                            className="w-full text-xs h-8 px-2 border border-purple-300 rounded bg-white text-black focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="Lunch">Lunch 🍱</option>
                            <option value="Tea Break">Tea Break ☕</option>
                            <option value="Short Break">Short Break ☕</option>
                            <option value="Break">Break ☕</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-purple-700 font-semibold">Start Time</span>
                            <Input
                              type="time"
                              value={tempBreakTimings[period.id]?.start_time || ""}
                              onChange={(e) => {
                                setTempBreakTimings(prev => ({
                                  ...prev,
                                  [period.id]: {
                                    ...prev[period.id],
                                    start_time: e.target.value
                                  }
                                }));
                              }}
                              className="w-full text-xs h-8 border-purple-300 bg-white text-black"
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-[10px] text-purple-700 font-semibold">End Time</span>
                            <Input
                              type="time"
                              value={tempBreakTimings[period.id]?.end_time || ""}
                              onChange={(e) => {
                                setTempBreakTimings(prev => ({
                                  ...prev,
                                  [period.id]: {
                                    ...prev[period.id],
                                    end_time: e.target.value
                                  }
                                }));
                              }}
                              className="w-full text-xs h-8 border-purple-300 bg-white text-black"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-amber-900 mb-2">📌 Summary</h4>
              <p className="text-sm text-amber-800">
                <strong>Teaching Periods:</strong> {periods.filter(p => !isPeriodBreak(p.id)).length} periods
              </p>
              <p className="text-sm text-amber-800">
                <strong>Break/Lunch Periods:</strong> {periods.filter(p => isPeriodBreak(p.id)).length} periods
              </p>
              <p className="text-sm text-amber-800 mt-2">
                <strong>Total Periods:</strong> {periods.length} periods × {days.length} days = {periods.length * days.length} slots
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsBreakConfigOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={async () => {
                  try {
                    console.log('[BREAK CONFIG] Saving to backend. Current state:', breakPeriodIds);

                    const timingsPayload = breakPeriodIds.map(id => ({
                      period_slot_id: id,
                      start_time: tempBreakTimings[id]?.start_time || "",
                      end_time: tempBreakTimings[id]?.end_time || "",
                      break_name: tempBreakTimings[id]?.break_name || (id === 5 ? "Lunch" : "Tea Break"),
                    }));

                    const invalidBreak = timingsPayload.find(t => !t.start_time || !t.end_time);
                    if (invalidBreak) {
                      toast({
                        title: "Validation Error",
                        description: `Please specify start and end times for Period ${invalidBreak.period_slot_id}`,
                        variant: "destructive",
                      });
                      return;
                    }

                    // Save break configuration and timings to backend
                    const res = await fetch(
                      `/api/v1/timetable-master/${masterId}/break-config`,
                      {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${authToken}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          breakPeriodIds,
                          breakTimings: timingsPayload
                        }),
                      }
                    );

                    if (res.ok) {
                      const data = await res.json();
                      console.log('[BREAK CONFIG] Save successful, response:', data);

                      // Update state with confirmed data from backend
                      const savedBreakIds = data.data?.breakPeriodIds || breakPeriodIds;
                      if (Array.isArray(savedBreakIds)) {
                        setBreakPeriodIds(savedBreakIds);
                        console.log('[BREAK CONFIG] Updated state with saved config:', savedBreakIds);
                      } else {
                        console.warn('[BREAK CONFIG] Saved config is not an array:', savedBreakIds);
                      }

                      // Also save to localStorage as cache
                      localStorage.setItem(`timetable_${masterId}_breaks`, JSON.stringify(savedBreakIds));
                      console.log('[BREAK CONFIG] Cached to localStorage:', `timetable_${masterId}_breaks`, savedBreakIds);

                      setIsBreakConfigOpen(false);

                      // Explicitly refresh slots grid
                      fetchSlots();

                      toast({
                        title: "✅ Break Configuration Saved",
                        description: `${periods.filter(p => {
                          // Use the saved config for count
                          const savedIds = data.data?.breakPeriodIds || breakPeriodIds;
                          return Array.isArray(savedIds) && savedIds.includes(p.id);
                        }).length} periods marked as breaks for this timetable`,
                      });
                      const count = periods.filter(p => {
                        const savedIds = data.data?.breakPeriodIds || breakPeriodIds;
                        return Array.isArray(savedIds) && savedIds.includes(p.id);
                      }).length;
                      window.alert(`✅ Break Configuration Saved successfully!\n${count} period(s) marked as breaks for this timetable.`);
                    } else {
                      const error = await res.json();
                      throw new Error(error.message || 'Failed to save break configuration');
                    }
                  } catch (error) {
                    console.error('[BREAK CONFIG] Error saving:', error);
                    toast({
                      title: "❌ Error",
                      description: error instanceof Error ? error.message : 'Failed to save break configuration',
                      variant: "destructive",
                    });
                  }
                }}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
