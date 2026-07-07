import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Loader2, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { toast } from "@/pages/admin/department-admin/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Formats a 24-hour time string (e.g. "14:00" or "14:00:00") into a 12-hour AM/PM format (e.g. "02:00 PM").
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
 * Formats a 24-hour time range (e.g. "09:30 - 10:20") into a 12-hour AM/PM format.
 */
const formatRangeTo12h = (rangeStr: string | null | undefined): string => {
  if (!rangeStr) return "";
  const parts = rangeStr.split(" - ");
  if (parts.length === 2) {
    return `${formatTimeTo12h(parts[0])} - ${formatTimeTo12h(parts[1])}`;
  }
  return rangeStr;
};

interface PeriodDisplay {
  id: number;
  label: string;
  time: string;
  isBreak: boolean;
}

const getRomanNumeral = (num: number): string => {
  const romanMap = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romanMap[num - 1] || String(num);
};

const getDynamicPeriods = (slots: any[]): PeriodDisplay[] => {
  const periodMap = new Map<number, PeriodDisplay>();

  slots.forEach((slot: any) => {
    const h = parseInt(slot.hour || slot.period_slot_id, 10);
    if (isNaN(h)) return;

    const start = slot.start_time ? slot.start_time.substring(0, 5) : "";
    const end = slot.end_time ? slot.end_time.substring(0, 5) : "";
    const timeStr = start && end ? `${start} - ${end}` : "";

    const isBreak = slot.sessionType === "break" || slot.session_type === "break";

    if (!periodMap.has(h)) {
      const displayLabel = slot.period_label && slot.period_label.trim() !== ""
        ? slot.period_label
        : isBreak
          ? "Break"
          : getRomanNumeral(h);

      periodMap.set(h, {
        id: h,
        label: displayLabel,
        time: timeStr,
        isBreak: isBreak
      });
    } else {
      const existing = periodMap.get(h)!;
      if (!existing.time && timeStr) {
        existing.time = timeStr;
      }
      if (isBreak) {
        existing.isBreak = true;
      }
    }
  });

  return Array.from(periodMap.values()).sort((a, b) => a.id - b.id);
};

const getDefaultPeriods = (): PeriodDisplay[] => {
  const defaultTimes = [
    "09:30 - 10:20",
    "10:20 - 11:10",
    "11:30 - 12:25",
    "13:10 - 14:00",
    "14:00 - 14:50",
    "15:15 - 16:00",
    "16:00 - 16:45"
  ];
  return Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    label: getRomanNumeral(i + 1),
    time: defaultTimes[i],
    isBreak: false
  }));
};

interface ClassSlot {
  id: number | string;
  subject: string;
  subject_code?: string;
  section: string;
  department: string;
  year: string | number;
  academicYear: string;
  faculty?: string;
  sessionType?: string;
  notes?: string;
  start_time?: string;
  end_time?: string;
  period_label?: string;
  room?: string;
  // Alteration overlay fields
  isAlteration?: boolean;
  originalFaculty?: string;
  substituteFaculty?: string;
  alterationEndDate?: string;
  leaveId?: number;
}

interface Faculty {
  faculty_id: number;
  Name: string;
}

interface Class {
  id: number;
  name: string;
  section: string;
}

type TimetableData = {
  [day: string]: {
    [hour: number]: ClassSlot[];
  };
};

const getSessionColor = (sessionType: string) => {
  switch (sessionType?.toLowerCase()) {
    case 'lab':
    case 'lab/practical':
      return 'bg-green-50 border-l-3 border-green-500 text-green-900';
    case 'project':
      return 'bg-purple-50 border-l-3 border-purple-500 text-purple-900';
    case 'tutorial':
      return 'bg-cyan-50 border-l-3 border-cyan-500 text-cyan-900';
    case 'activity':
      return 'bg-yellow-50 border-l-3 border-yellow-500 text-yellow-900';
    case 'break':
      return 'bg-gray-50 border-l-3 border-gray-500 text-gray-900';
    case 'theory':
    default:
      return 'bg-blue-50 border-l-3 border-blue-500 text-blue-900';
  }
};

const TimetableTable = ({
  data,
  rawSlots = [],
  loading,
  error,
  onRefresh,
  showBreak = true
}: {
  data: TimetableData;
  rawSlots?: any[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  showBreak?: boolean;
}) => {
  const displayPeriods = rawSlots.length > 0 ? getDynamicPeriods(rawSlots) : getDefaultPeriods();
  const hasTimetableData = days.some((day) =>
    displayPeriods.some((period) => data[day]?.[period.id]?.length > 0)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading timetable...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!hasTimetableData) {
    return (
      <div className="py-12 text-center">
        <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">No timetable data available.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg border-gray-200 overflow-hidden">
      <table className="w-full border-collapse text-[11px] table-layout-auto">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-200">
            <th className="border border-gray-200 px-1 py-1.5 text-center font-semibold text-blue-900 bg-gray-50/50 text-[10px] w-[50px]">Day</th>
            {displayPeriods.map((period) => (
              <th
                key={period.id}
                className={`border border-gray-200 px-0.5 py-1 text-center font-semibold text-blue-900 border-l border-blue-100 ${period.isBreak ? 'border-l border-amber-200 bg-amber-50/80' : ''}`}
                style={period.isBreak ? { width: '45px' } : {}}
              >
                <div className="flex flex-col leading-tight">
                  {period.isBreak ? (
                    <>
                      <div className="font-bold text-[9px] text-amber-700">{period.label}</div>
                      <div className="text-[8px] text-amber-600 font-normal mt-0.5 leading-none whitespace-nowrap">
                        {formatRangeTo12h(period.time).split(" - ").join("\n")}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-[10px]">{period.label}</div>
                      {period.time && (
                        <div className="text-[8px] text-gray-500 font-normal mt-0.5 leading-none whitespace-nowrap">
                          {formatRangeTo12h(period.time)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day} className="border-b border-gray-200 hover:bg-gray-50/30">
              <td className="border border-gray-200 p-1 font-semibold text-gray-800 bg-gray-50 text-center text-[10px] w-[50px]">
                {day.substring(0, 3)}
              </td>

              {displayPeriods.map((period) => {
                const slots = (data[day]?.[period.id] || []) as ClassSlot[];
                const breakSlot = slots.find(s => s.sessionType === 'break');

                // Show break cell only when showBreak is true
                if (breakSlot && showBreak) {
                  return (
                    <td
                      key={`${day}-${period.id}`}
                      className="border border-gray-200 p-0.5 bg-amber-50/40 text-center align-middle"
                      style={{ width: '45px' }}
                    >
                      <div className="text-[9px] text-amber-600 font-medium py-1">☕</div>
                    </td>
                  );
                }

                // When showBreak is false and slot is a break, skip it (show regular non-break slots only)
                if (breakSlot && !showBreak) {
                  // Filter out break slots and show only actual subject slots
                  const nonBreakSlots = slots.filter(s => s.sessionType !== 'break');
                  if (nonBreakSlots.length === 0) {
                    return (
                      <td key={`${day}-${period.id}`} className="border border-gray-200 p-0.5 align-top">
                        <div className="text-[9px] text-gray-300 text-center py-1.5">-</div>
                      </td>
                    );
                  }
                }

                // Filter out break slots from display when showBreak is false
                const displaySlots = showBreak ? slots : slots.filter(s => s.sessionType !== 'break');

                return (
                  <td
                    key={`${day}-${period.id}`}
                    className="border border-gray-200 p-0.5 align-top"
                  >
                    {displaySlots.length > 0 ? (
                      <div className="space-y-0.5">
                        {displaySlots.map((slot, idx) => (
                          <motion.div
                            key={slot.id || idx}
                            whileHover={{ scale: 1.02 }}
                            className={`${slot.isAlteration ? 'bg-orange-50 border-l-2 border-orange-500 text-orange-900' : getSessionColor(slot.sessionType || "")} p-1.5 rounded text-[10px] hover:opacity-90 transition-opacity cursor-default flex flex-col justify-between relative`}
                            title={slot.isAlteration ? `Alteration: ${slot.substituteFaculty} covering for ${slot.originalFaculty}${slot.alterationEndDate ? ` until ${new Date(slot.alterationEndDate).toLocaleDateString()}` : ''}` : ''}
                          >
                            {/* Alteration badge */}
                            {slot.isAlteration && (
                              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full leading-none z-10">
                                ALT
                              </div>
                            )}
                            <div className="text-left leading-tight">
                              <div className="font-bold text-[11px] text-gray-900 truncate">
                                {slot.subject_code || "N/A"}
                              </div>
                              <div className="text-[10px] text-gray-800 leading-snug line-clamp-2 mt-0.5" title={slot.subject}>
                                {slot.subject}
                              </div>
                            </div>
                            <div className="text-left mt-0.5 border-t border-current/10 pt-0.5 leading-none">
                              {slot.faculty && (
                                <div className="text-[9px] text-gray-600 truncate mt-0.5">
                                  {slot.faculty}
                                </div>
                              )}
                              {/* Show original faculty when alteration */}
                              {slot.isAlteration && slot.originalFaculty && (
                                <div className="text-[8px] text-orange-600 italic truncate mt-0.5" title={`Original: ${slot.originalFaculty}`}>
                                  ↩ {slot.originalFaculty}
                                </div>
                              )}
                              <div className="mt-1 flex items-center justify-between text-[9px] leading-none opacity-85">
                                <span className="font-semibold text-blue-800">
                                  {slot.room ? `Rm:${slot.room}` : ''}
                                </span>
                                <span className="font-mono px-0.5 bg-white/60 rounded text-[8px] tracking-tight">
                                  {slot.sessionType?.toUpperCase().substring(0, 3)}
                                </span>
                              </div>
                              {slot.notes && (
                                <div className="text-[8px] text-gray-500 italic mt-0.5 truncate" title={slot.notes}>
                                  {slot.notes}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300 text-center py-1.5">
                        -
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
  );
};

export default function Timetable() {
  const { user, authToken } = useAuth();

  // My Timetable state
  const [myTimetable, setMyTimetable] = useState<TimetableData>({});
  const [myRawSlots, setMyRawSlots] = useState<any[]>([]);

  // Faculty Timetable state
  const [facultyTimetable, setFacultyTimetable] = useState<TimetableData>({});
  const [facultyRawSlots, setFacultyRawSlots] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");

  // Class Timetable state
  const [classTimetable, setClassTimetable] = useState<TimetableData>({});
  const [classRawSlots, setClassRawSlots] = useState<any[]>([]);
  const [classList, setClassList] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  // General state
  const [activeTab, setActiveTab] = useState<"my" | "faculty" | "class">("my");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = authToken || localStorage.getItem("authToken");
  const deptDisplay = user?.department
    ? typeof user.department === "object"
      ? (user.department as any).short_name || user.department
      : user.department
    : "";

  // Format timetable data from API response dynamically (legacy flat-array format)
  const formatTimetableData = (apiData: any[]): TimetableData => {
    const formatted: TimetableData = {};
    days.forEach((day) => {
      formatted[day] = {};
    });

    apiData.forEach((slot: any) => {
      const dayKey = slot.day ? slot.day.trim() : "";
      const hourKey = parseInt(slot.hour || slot.period_slot_id || slot.period?.id, 10);
      const day = days.find((d) => d === dayKey);

      if (day && !isNaN(hourKey)) {
        if (!formatted[day][hourKey]) {
          formatted[day][hourKey] = [];
        }
        // Support both legacy flat format and new enriched format
        const subjectObj = slot.subject;
        const facultyObj = slot.faculty;
        const alteration = slot.alteration;

        formatted[day][hourKey].push({
          id: slot.id || Math.random(),
          subject: (typeof subjectObj === 'object' ? subjectObj?.name : subjectObj) || slot.subject_name || "Unknown",
          subject_code: (typeof subjectObj === 'object' ? subjectObj?.code : slot.subject_code) || "N/A",
          section: slot.section || "",
          department: slot.department || "",
          year: slot.year || "",
          academicYear: slot.academicYear || "",
          faculty: (typeof facultyObj === 'object' ? facultyObj?.name : facultyObj) || slot.faculty_name || "",
          sessionType: slot.sessionType || slot.session_type || "",
          notes: slot.notes || "",
          start_time: slot.period?.startTime || slot.start_time || "",
          end_time: slot.period?.endTime || slot.end_time || "",
          period_label: slot.period?.label || slot.period_label || "",
          room: slot.room || "",
          isAlteration: slot.isAlteration || false,
          originalFaculty: alteration?.originalFacultyName || "",
          substituteFaculty: alteration?.substituteFacultyName || "",
          alterationEndDate: alteration?.leaveEndDate || "",
          leaveId: alteration?.leaveId || undefined,
        });
      }
    });
    return formatted;
  };

  // Fetch My Timetable (Department Admin's personal timetable if they're faculty)
  const fetchMyTimetable = async () => {
    try {
      console.log("[TIMETABLE] Fetching my timetable...");
      const response = await fetch("/api/v1/timetable/faculty/me", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      console.log("[TIMETABLE] My timetable response status:", response.status);

      // Handle 304 Not Modified - server is returning empty body
      if (response.status === 304) {
        console.log("[TIMETABLE] Got 304 Not Modified for my timetable - clearing cache issue");
        setMyRawSlots([]);
        setMyTimetable({});
        return;
      }

      const data = await response.json();
      console.log("[TIMETABLE] My timetable data - success:", data.success, "slots:", data.timetable?.length || 0);

      if (data.success && data.timetable && data.timetable.length > 0) {
        console.log("[TIMETABLE] Found my timetable with", data.timetable.length, "slots");
        setMyRawSlots(data.timetable);
        setMyTimetable(formatTimetableData(data.timetable));
      } else {
        // Fallback: If user is faculty/department-admin, try fetching by their faculty ID
        if (user?.id && (user?.role === 'faculty' || user?.role === 'department-admin')) {
          console.log("[TIMETABLE] Trying fallback fetch using faculty ID:", user.id);
          try {
            const fallbackResponse = await fetch(`/api/v1/timetable/admin/faculty-timetable/${user.id}`, {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
              },
            });

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              console.log("[TIMETABLE] Fallback faculty timetable received, slots:", fallbackData.timetable?.length || 0);

              if (fallbackData.success && fallbackData.timetable && fallbackData.timetable.length > 0) {
                console.log("[TIMETABLE] Found timetable via fallback with", fallbackData.timetable.length, "slots");
                setMyRawSlots(fallbackData.timetable);
                setMyTimetable(formatTimetableData(fallbackData.timetable));
              } else {
                console.log("[TIMETABLE] No timetable found in fallback");
                setMyRawSlots([]);
                setMyTimetable({});
              }
            }
          } catch (fallbackErr) {
            console.error("[TIMETABLE] Fallback fetch error:", fallbackErr);
            setMyRawSlots([]);
            setMyTimetable({});
          }
        } else {
          console.log("[TIMETABLE] No personal timetable found (not a faculty)");
          setMyRawSlots([]);
          setMyTimetable({});
        }
      }
    } catch (err) {
      console.error("Error fetching my timetable:", err);
      setMyRawSlots([]);
      setMyTimetable({});
    }
  };

  // Fetch Faculty List
  const fetchFacultyList = async () => {
    try {
      // Get department ID from auth context - try multiple field names
      const departmentId = user?.department_id || user?.departmentId;

      console.log("[TIMETABLE] User full object keys:", Object.keys(user || {}));
      console.log("[TIMETABLE] Fetching faculty list for department_id:", departmentId);

      // Build URL with department filter - only active faculty
      let url = "/api/v1/faculty?limit=1000&status=active";
      if (departmentId) {
        url += `&department=${departmentId}`;
        console.log("[TIMETABLE] Filtering by department_id");
      } else {
        console.log("[TIMETABLE] No department_id found - will show all faculty from institution");
      }

      console.log("[TIMETABLE] Faculty list URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      console.log("[TIMETABLE] Faculty list response status:", response.status);

      // Handle 304 Not Modified
      if (response.status === 304) {
        console.log("[TIMETABLE] Got 304 Not Modified for faculty list");
        setFacultyList([]);
        return;
      }

      const data = await response.json();
      console.log("[TIMETABLE] Faculty list data received, count:", data.data?.length || 0);

      if (data.success && Array.isArray(data.data)) {
        // Filter out the current logged-in user from the faculty list
        const filteredFaculty = data.data.filter(
          (faculty: any) => faculty.faculty_id !== user?.id
        );
        console.log("[TIMETABLE] After filtering current user, count:", filteredFaculty.length);

        console.log("[TIMETABLE] Setting faculty list with", filteredFaculty.length, "faculty members");
        setFacultyList(filteredFaculty);

        // Auto-select first faculty if list is not empty
        if (filteredFaculty.length > 0 && !selectedFaculty) {
          setSelectedFaculty(String(filteredFaculty[0].faculty_id));
          console.log("[TIMETABLE] Auto-selected first faculty:", filteredFaculty[0].faculty_id);
        } else if (filteredFaculty.length === 0) {
          console.log("[TIMETABLE] No other faculty available in department");
          setSelectedFaculty("");
        }
      } else {
        console.warn("[TIMETABLE] No valid faculty data received");
        setFacultyList([]);
      }
    } catch (err) {
      console.error("Error fetching faculty list:", err);
      setFacultyList([]);
    }
  };

  // Fetch Faculty Timetable
  const fetchFacultyTimetable = async (facultyId: string) => {
    if (!facultyId) {
      setFacultyRawSlots([]);
      setFacultyTimetable({});
      return;
    }
    try {
      const response = await fetch(`/api/v1/timetable/admin/faculty-timetable/${facultyId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && data.timetable) {
        setFacultyRawSlots(data.timetable);
        setFacultyTimetable(formatTimetableData(data.timetable));
      } else {
        setFacultyRawSlots([]);
        setFacultyTimetable({});
      }
    } catch (err) {
      console.error("Error fetching faculty timetable:", err);
      setFacultyRawSlots([]);
      setFacultyTimetable({});
    }
  };

  // Fetch Class List
  const fetchClassList = async () => {
    try {
      const departmentId = user?.department_id || user?.departmentId;
      let url = "/api/v1/classes";
      if (departmentId) {
        url += `?department_id=${departmentId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      // Handle 304 Not Modified
      if (response.status === 304) {
        console.log("[TIMETABLE] Got 304 Not Modified for class list");
        setClassList([]);
        return;
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setClassList(data.data);
        if (data.data.length > 0 && !selectedClass) {
          setSelectedClass(String(data.data[0].id));
        }
      }
    } catch (err) {
      console.error("Error fetching class list:", err);
    }
  };

  // Fetch Class Timetable — uses the new /view/:classId endpoint with alteration overlay
  const fetchClassTimetable = async (classId: string) => {
    if (!classId) {
      setClassRawSlots([]);
      setClassTimetable({});
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/v1/timetable/view/${classId}?date=${today}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.slots) && data.slots.length > 0) {
        // New enriched format: data.slots has period/faculty/subject as objects
        setClassRawSlots(data.slots.map((s: any) => ({
          ...s,
          period_slot_id: s.period?.id,
          start_time: s.period?.startTime,
          end_time: s.period?.endTime,
          period_label: s.period?.label,
          slot_type: s.period?.slotType,
        })));
        setClassTimetable(formatTimetableData(data.slots));
      } else {
        setClassRawSlots([]);
        setClassTimetable({});
      }
    } catch (err) {
      console.error("Error fetching class timetable:", err);
      setClassRawSlots([]);
      setClassTimetable({});
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchMyTimetable(),
          fetchFacultyList(),
          fetchClassList()
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load timetable data");
        toast.error("Failed to load timetable data");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Handle faculty selection change
  useEffect(() => {
    if (selectedFaculty && activeTab === "faculty") {
      fetchFacultyTimetable(selectedFaculty);
    }
  }, [selectedFaculty, activeTab]);

  // Handle class selection change
  useEffect(() => {
    if (selectedClass && activeTab === "class") {
      fetchClassTimetable(selectedClass);
    }
  }, [selectedClass, activeTab]);

  const handleTabChange = (tab: "my" | "faculty" | "class") => {
    setActiveTab(tab);
    if (tab === "faculty" && selectedFaculty) {
      fetchFacultyTimetable(selectedFaculty);
    } else if (tab === "class" && selectedClass) {
      fetchClassTimetable(selectedClass);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div>
          <h1 className="page-header font-serif">Department Timetable</h1>
          {deptDisplay && (
            <p className="text-muted-foreground -mt-4">
              Department: {deptDisplay}
            </p>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => handleTabChange("my")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "my"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            My Timetable
          </button>
          <button
            onClick={() => handleTabChange("faculty")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "faculty"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Faculty Timetable
          </button>
          <button
            onClick={() => handleTabChange("class")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "class"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Class Timetable
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        {/* My Timetable */}
        {activeTab === "my" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">My Personal Timetable</h2>
            {Object.keys(myTimetable).length === 0 || !days.some((day) =>
              Object.keys(myTimetable[day] || {}).some((hour) => myTimetable[day]?.[parseInt(hour)]?.length > 0)
            ) ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  {user?.role === "department-admin"
                    ? "You are a Department Admin without a faculty record."
                    : "No personal timetable found."}
                </p>
                {user?.role === "department-admin" && (
                  <p className="text-muted-foreground text-sm">
                    View faculty or class timetables using the tabs above.
                  </p>
                )}
              </div>
            ) : (
              <TimetableTable
                data={myTimetable}
                rawSlots={myRawSlots}
                loading={loading}
                error={error}
                onRefresh={fetchMyTimetable}
                showBreak={true}
              />
            )}
          </div>
        )}

        {/* Faculty Timetable */}
        {activeTab === "faculty" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Faculty Timetable
              {selectedFaculty && facultyList.length > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  - {facultyList.find(f => String(f.faculty_id) === selectedFaculty)?.Name || ""}
                </span>
              )}
            </h2>

            {/* Faculty Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Faculty</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full max-w-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a faculty...</option>
                {facultyList.map((faculty) => (
                  <option key={faculty.faculty_id} value={faculty.faculty_id}>
                    {faculty.Name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFaculty ? (
              <TimetableTable
                data={facultyTimetable}
                rawSlots={facultyRawSlots}
                loading={loading}
                error={error}
                onRefresh={() => fetchFacultyTimetable(selectedFaculty)}
                showBreak={true}
              />
            ) : (
              <div className="py-12 text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {facultyList.length === 0
                    ? "No other faculty members in your department"
                    : "Please select a faculty to view their timetable"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Class Timetable */}
        {activeTab === "class" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Class Timetable</h2>

            {/* Class Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full max-w-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a class...</option>
                {classList.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            {selectedClass ? (
              <TimetableTable
                data={classTimetable}
                rawSlots={classRawSlots}
                loading={loading}
                error={error}
                onRefresh={() => fetchClassTimetable(selectedClass)}
                showBreak={true}
              />
            ) : (
              <div className="py-12 text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Please select a class to view their timetable</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}


