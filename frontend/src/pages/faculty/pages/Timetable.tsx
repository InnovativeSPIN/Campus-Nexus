import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Loader2, Calendar as CalendarIcon, GraduationCap, BookOpen } from "lucide-react";
import { toast } from '@/components/ui/sonner';
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/faculty/components/ui/select";
import { Badge } from "@/pages/faculty/components/ui/badge";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [1, 2, 3, 4, 5, 6, 7];

const formatHourForDisplay = (hour: number): string => {
  const timeMap: { [key: number]: string } = {
    1: "9:30 AM - 10:20 AM",
    2: "10:20 AM - 11:10 AM",
    3: "11:30 AM - 12:25 PM",
    4: "1:10 PM - 2:00 PM",
    5: "2:00 PM - 2:50 PM",
    6: "3:15 PM - 4:00 PM",
    7: "4:00 PM - 4:45 PM",
  };
  return timeMap[hour] || `Hour ${hour}`;
};

interface ClassSlot {
  id: number | string;
  subject: string;
  section: string;
  department: string;
  year: string | number;
  academicYear: string;
}

interface RawSlot {
  id: number | string;
  day: string;
  hour: number;
  subject: string;
  section: string;
  department: string;
  year: string | number;
  academicYear: string;
}

type TimetableData = {
  [day: string]: {
    [hour: number]: ClassSlot[];
  };
};

/** Derive a unique class key from department + year + section */
const getClassKey = (slot: RawSlot) =>
  [slot.department, slot.year, slot.section].filter(Boolean).join(" | ");

/** Human-friendly label for the dropdown */
const getClassLabel = (slot: RawSlot) => {
  const parts = [];
  if (slot.department) parts.push(slot.department);
  if (slot.year) parts.push(`Year ${slot.year}`);
  if (slot.section) parts.push(`Sec ${slot.section}`);
  return parts.join(" - ");
};

export default function Timetable() {
  const { user, authToken } = useAuth();
  const [rawSlots, setRawSlots] = useState<RawSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassKey, setSelectedClassKey] = useState<string>("");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch("/api/v1/timetable/faculty/me", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.timetable && data.timetable.length > 0) {
        const slots: RawSlot[] = data.timetable.map((slot: any) => ({
          id: slot.id || Math.random(),
          day: slot.day?.trim() || "",
          hour: parseInt(slot.hour, 10),
          subject: slot.subject || "Unknown",
          section: slot.section || "",
          department: slot.department || "",
          year: slot.year || "",
          academicYear: slot.academicYear || "",
        })).filter((s: RawSlot) => days.includes(s.day) && hours.includes(s.hour));

        setRawSlots(slots);

        // Auto-select first class
        if (slots.length > 0) {
          const firstKey = getClassKey(slots[0]);
          setSelectedClassKey(firstKey);
        }
      } else if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to view your timetable");
        } else if (response.status === 403) {
          setError("You are not authorised to view this timetable");
        } else {
          setError(data.error || data.message || "Failed to load timetable");
        }
      } else {
        setError(data.message || "Timetable not assigned yet.");
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("Failed to load timetable. Please try again.");
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  /** All unique classes this faculty teaches */
  const classOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string; slot: RawSlot }>();
    rawSlots.forEach((slot) => {
      const key = getClassKey(slot);
      if (!map.has(key)) {
        map.set(key, { key, label: getClassLabel(slot), slot });
      }
    });
    return Array.from(map.values());
  }, [rawSlots]);

  /** Unique subjects for the selected class */
  const classSubjects = useMemo(() => {
    const subjects = new Set<string>();
    rawSlots
      .filter((s) => getClassKey(s) === selectedClassKey)
      .forEach((s) => subjects.add(s.subject));
    return Array.from(subjects);
  }, [rawSlots, selectedClassKey]);

  /** Build day → hour → slot[] map for the selected class only */
  const timetableData = useMemo<TimetableData>(() => {
    const grid: TimetableData = {};
    days.forEach((day) => {
      grid[day] = {};
      hours.forEach((hour) => {
        grid[day][hour] = [];
      });
    });

    rawSlots
      .filter((s) => getClassKey(s) === selectedClassKey)
      .forEach((slot) => {
        if (grid[slot.day]?.[slot.hour] !== undefined) {
          grid[slot.day][slot.hour].push({
            id: slot.id,
            subject: slot.subject,
            section: slot.section,
            department: slot.department,
            year: slot.year,
            academicYear: slot.academicYear,
          });
        }
      });

    return grid;
  }, [rawSlots, selectedClassKey]);

  const hasTimetableData = days.some((day) =>
    hours.some((hour) => timetableData[day]?.[hour]?.length > 0)
  );

  const selectedClassInfo = classOptions.find((c) => c.key === selectedClassKey);

  const deptDisplay = user?.department
    ? typeof user.department === "object"
      ? (user.department as any).short_name || user.department
      : user.department
    : "";

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">My Timetable</h1>
          {deptDisplay && (
            <p className="text-muted-foreground -mt-4">Department: {deptDisplay}</p>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading timetable...</span>
        </div>
      ) : error ? (
        <div className="py-16 text-center widget-card">
          <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">{error}</p>
          <button onClick={fetchTimetable} className="mt-4 text-primary hover:underline text-sm">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Class Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">View Timetable For</p>
                  <p className="font-semibold text-foreground">Choose a class</p>
                </div>
              </div>

              <div className="flex-1 md:max-w-sm">
                <Select value={selectedClassKey} onValueChange={setSelectedClassKey}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a class…" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls.key} value={cls.key}>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-secondary" />
                          <span>{cls.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subjects taught in this class */}
              {classSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                  {classSubjects.map((sub) => (
                    <Badge
                      key={sub}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <BookOpen className="w-3 h-3" />
                      {sub}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Timetable Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card"
          >
            <h2 className="text-lg font-semibold mb-1">
              {selectedClassInfo ? selectedClassInfo.label : "Weekly Schedule"}
            </h2>
            {selectedClassInfo && (
              <p className="text-xs text-muted-foreground mb-4">
                Academic Year: {selectedClassInfo.slot.academicYear || "N/A"}
              </p>
            )}

            {!hasTimetableData ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-14 h-14 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {rawSlots.length === 0
                    ? "Timetable not assigned yet."
                    : "No slots found for this class."}
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <table className="w-full border-collapse text-sm min-w-[750px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left font-semibold min-w-[110px] text-foreground">
                        Time
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-border p-3 text-center font-semibold min-w-[130px] text-foreground"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hours.map((hour) => (
                      <tr key={hour} className="hover:bg-muted/20 transition-colors">
                        {/* Time column */}
                        <td className="border border-border p-2 bg-muted/30 text-sm">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">Hour {hour}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatHourForDisplay(hour)}
                            </span>
                          </div>
                        </td>

                        {days.map((day) => {
                          const slots = timetableData[day]?.[hour] || [];
                          return (
                            <td
                              key={`${day}-${hour}`}
                              className="border border-border p-1.5 min-h-[72px] align-middle"
                            >
                              {slots.length > 0 ? (
                                <div className="space-y-1">
                                  {slots.map((slot, idx) => (
                                    <motion.div
                                      key={slot.id || idx}
                                      whileHover={{ scale: 1.02 }}
                                      className="bg-primary/10 border border-primary/20 p-2 rounded-lg text-xs hover:bg-primary/20 transition-colors cursor-default"
                                    >
                                      <div className="font-semibold text-primary leading-tight">
                                        {slot.subject}
                                      </div>
                                      {slot.section && (
                                        <div className="text-muted-foreground mt-0.5">
                                          Sec {slot.section}
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </MainLayout>
  );
}
