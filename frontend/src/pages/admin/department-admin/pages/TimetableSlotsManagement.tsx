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

// Periods with break/lunch detection
const periods = [
  { id: 1, label: "I", time: "09:30 AM - 10:20 AM", isBreak: false },
  { id: 2, label: "II", time: "10:20 AM - 11:10 AM", isBreak: false },
  { id: 3, label: "Break", time: "11:10 AM - 11:30 AM", isBreak: true },
  { id: 4, label: "III", time: "11:30 AM - 12:25 PM", isBreak: false },
  { id: 5, label: "Lunch", time: "12:25 PM - 01:10 PM", isBreak: true },
  { id: 6, label: "IV", time: "01:10 PM - 02:00 PM", isBreak: false },
  { id: 7, label: "V", time: "02:00 PM - 02:50 PM", isBreak: false },
  { id: 8, label: "Break", time: "02:50 PM - 03:10 PM", isBreak: true },
  { id: 9, label: "VI", time: "03:10 PM - 04:00 PM", isBreak: false },
  { id: 10, label: "VII", time: "04:00 PM - 04:45 PM", isBreak: false },
];

// Break timings configuration - can be easily updated
const breakTimings = {
  morningBreak: { startPeriod: 3, label: "Break", time: "11:10 AM - 11:30 AM" },
  lunch: { startPeriod: 5, label: "Lunch", time: "12:25 PM - 01:10 PM" },
  afternoonBreak: { startPeriod: 8, label: "Break", time: "02:50 PM - 03:10 PM" },
};

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
  const { authToken } = useAuth();

  const [formData, setFormData] = useState({
    day: "Monday",
    period_slot_id: "1",
    subject_id: "none",
    faculty_id: "",
    session_type: "theory",
    is_lab_session: false,
    lab_group: "",
    room: "",
    notes: "",
    start_time: "",
    end_time: "",
  });

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

  const handleAddSlot = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ...formData,
            period_slot_id: parseInt(formData.period_slot_id),
            subject_id: formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
            faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
          }),
        }
      );

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
      } else {
        throw new Error("Failed to create slot");
      }
    } catch (error) {
      console.error("Error creating slot:", error);
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

      const response = await fetch(
        `/api/v1/timetable-master/${masterId}/slots/${editingSlot.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            day: formData.day,
            period_slot_id: parseInt(formData.period_slot_id),
            subject_id: formData.subject_id && formData.subject_id !== "none" ? parseInt(formData.subject_id) : null,
            faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null,
            session_type: formData.session_type,
            room: formData.room || null,
            notes: formData.notes || null,
          }),
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
      } else {
        throw new Error("Failed to update slot");
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      toast({
        title: "Error",
        description: "Failed to update slot",
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

    setFormData({
      day: slot.day,
      period_slot_id: slot.period_slot_id.toString(),
      subject_id: resolvedSubjectId,
      faculty_id: resolvedFacultyId,
      session_type: slot.session_type,
      is_lab_session: slot.is_lab_session,
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
            slot.room || "",
            slot.notes || "",
          ]);
        } else {
          // Empty slot - pre-fill with day/period, leave subject/faculty blank
          // Auto-detect breaks and lunches
          const sessionType = period.isBreak ? "break" : "theory";
          
          dataToExport.push([
            day,
            period.id,
            "", // Subject Code - leave blank for user to fill
            "", // Faculty Code - leave blank for user to fill
            sessionType, // "break" for breaks/lunch, "theory" for regular periods
            "", // Room
            period.isBreak ? `${period.label} (${period.time})` : "", // Pre-fill break info in notes
          ]);
        }
      });
    });

    // Add information section at the top
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
      "# 6. Room: Room number or location (e.g., Room 101, Lab-A)",
      "# 7. Notes: Any additional notes about the slot",
      "#",
      "# BREAK TIMINGS (Do not assign subjects to these):",
      `# - Period ${breakTimings.morningBreak.startPeriod}: ${breakTimings.morningBreak.label} (${breakTimings.morningBreak.time})`,
      `# - Period ${breakTimings.lunch.startPeriod}: ${breakTimings.lunch.label} (${breakTimings.lunch.time})`,
      `# - Period ${breakTimings.afternoonBreak.startPeriod}: ${breakTimings.afternoonBreak.label} (${breakTimings.afternoonBreak.time})`,
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
    const teachingPeriodCount = periods.filter(p => !p.isBreak).length;
    const breakPeriodCount = periods.filter(p => p.isBreak).length;
    instructionLines.push(
      `# Teaching Periods: ${teachingPeriodCount} | Break/Lunch: ${breakPeriodCount} | Total: ${periods.length}`,
      `# Total Slots: ${dataToExport.length} (${days.length} days × ${periods.length} periods)`,
      "# ============================================================",
      "",
    );
    
    // Debug: Log what's being exported
    const teachingPeriods = periods.filter(p => !p.isBreak);
    const breakPeriods = periods.filter(p => p.isBreak);
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
      breakTimings,
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

      console.log("[BULK UPLOAD] Column indices:", { dayIndex, periodIndex, subjectIndex, facultyIndex });

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
            if (period?.isBreak) {
              sessionType = "break";
              // Warn if user tried to assign subject to break
              if (subject_id) {
                console.warn(`[BULK UPLOAD] Warning: Subject "${values[subjectIndex]}" assigned to break period ${periodId} (${period.label}) in row ${i + 1}`);
              }
              // Warn if user tried to assign faculty to break
              if (faculty_id) {
                console.warn(`[BULK UPLOAD] Warning: Faculty assigned to break period ${periodId} (${period.label}) in row ${i + 1}`);
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
      const breakPeriodIds = periods.filter(p => p.isBreak).map(p => p.id);
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
                  <Select value={formData.period_slot_id} onValueChange={(v) => setFormData({ ...formData, period_slot_id: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.label}
                        </SelectItem>
                      ))}
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
                    disabled={formData.session_type === "break"}
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
                    disabled={formData.session_type === "break"}
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
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        session_type: v,
                        // When marking a slot as a break, clear faculty/subject since they are not required
                        subject_id: v === "break" ? "none" : formData.subject_id,
                        faculty_id: v === "break" ? "" : formData.faculty_id,
                      })
                    }
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
                        ? `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`
                        : period.time;
                      
                      return (
                        <div
                          key={`${day}-${period.id}`}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {period.label} ({displayTime})
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
                              <p className="text-sm text-muted-foreground">Not scheduled</p>
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
    </MainLayout>
  );
}
