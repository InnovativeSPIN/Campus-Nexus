import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Loader2, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { toast } from "@/pages/admin/department-admin/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [1, 2, 3, 4, 5, 6, 7];

const formatHourForDisplay = (hour: number | string): string => {
  if (hour === 'break1' || hour === 'break2') return 'BREAK';
  if (hour === 'lunch') return 'LUNCH';
  const timeMap: { [key: number]: string } = {
    1: "9:30 AM - 10:20 AM",
    2: "10:20 AM - 11:10 AM",
    3: "11:30 AM - 12:25 PM",
    4: "1:10 PM - 2:00 PM",
    5: "2:00 PM - 2:50 PM",
    6: "3:15 PM - 4:00 PM",
    7: "4:00 PM - 4:45 PM",
  };
  return timeMap[hour as number] || `Hour ${hour}`;
};

const getHoursArray = (showBreak: boolean = false): (number | string)[] => {
  if (showBreak) {
    // Include morning break, lunch break, and afternoon break
    return [1, 2, 'break1', 3, 'lunch', 4, 5, 'break2', 6, 7];
  }
  return hours;
};

interface ClassSlot {
  id: number | string;
  subject: string;
  section: string;
  department: string;
  year: string | number;
  academicYear: string;
  faculty?: string;
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

const TimetableTable = ({ 
  data, 
  loading, 
  error, 
  onRefresh,
  showBreak = false
}: { 
  data: TimetableData;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  showBreak?: boolean;
}) => {
  const displayHours = getHoursArray(showBreak);
  const hasTimetableData = days.some((day) =>
    displayHours.some((hour) => !(typeof hour === 'string' && (hour.startsWith('break') || hour === 'lunch')) && data[day]?.[hour as number]?.length > 0)
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border p-3 text-left font-semibold min-w-[100px]">Day</th>
            {displayHours.map((hour) => (
              <th
                key={hour}
                className={`border p-3 text-center font-semibold min-w-[140px] ${
                  typeof hour === 'string' && hour.startsWith('break') ? 'bg-amber-100/50' : hour === 'lunch' ? 'bg-orange-100/50' : ''
                }`}
              >
                <div className="flex flex-col">
                  {typeof hour === 'string' && hour.startsWith('break') ? (
                    <span className="font-bold text-amber-700">BREAK</span>
                  ) : hour === 'lunch' ? (
                    <span className="font-bold text-orange-700">LUNCH</span>
                  ) : (
                    <>
                      <span>Hour {hour}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {formatHourForDisplay(hour)}
                      </span>
                    </>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="border p-2 text-sm font-medium bg-muted/30 min-w-[100px]">
                {day}
              </td>

              {displayHours.map((hour) => {
                if (typeof hour === 'string' && hour.startsWith('break')) {
                  return (
                    <td
                      key={`${day}-${hour}`}
                      className="border p-2 min-h-[80px] bg-amber-50"
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="font-semibold text-amber-700">BREAK</span>
                      </div>
                    </td>
                  );
                }
                
                if (hour === 'lunch') {
                  return (
                    <td
                      key={`${day}-lunch`}
                      className="border p-2 min-h-[80px] bg-orange-50"
                    >
                      <div className="h-full flex items-center justify-center">
                        <span className="font-semibold text-orange-700">LUNCH</span>
                      </div>
                    </td>
                  );
                }
                
                const slots = (data[day]?.[hour as number] || []) as ClassSlot[];
                return (
                  <td
                    key={`${day}-${hour}`}
                    className="border p-2 min-h-[100px]"
                  >
                    {slots.length > 0 ? (
                      <div className="space-y-1">
                        {slots.map((slot, idx) => (
                          <motion.div
                            key={slot.id || idx}
                            whileHover={{ scale: 1.02 }}
                            className="bg-primary/10 border border-primary/20 p-2 rounded text-xs hover:bg-primary/20 transition-colors cursor-default"
                          >
                            <div className="font-semibold text-primary">
                              {slot.subject}
                            </div>
                            <div className="text-muted-foreground mt-0.5">
                              {[slot.section, slot.department]
                                .filter(Boolean)
                                .join(" - ")}
                            </div>
                            {slot.year && (
                              <div className="text-muted-foreground">
                                Year: {slot.year}
                              </div>
                            )}
                            {slot.faculty && (
                              <div className="text-muted-foreground">
                                Faculty: {slot.faculty}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
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
  
  // Faculty Timetable state
  const [facultyTimetable, setFacultyTimetable] = useState<TimetableData>({});
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  
  // Class Timetable state
  const [classTimetable, setClassTimetable] = useState<TimetableData>({});
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

  // Format timetable data from API response
  const formatTimetableData = (apiData: any[]): TimetableData => {
    const formatted: TimetableData = {};
    days.forEach((day) => {
      formatted[day] = {};
      hours.forEach((hour) => {
        formatted[day][hour] = [];
      });
    });

    apiData.forEach((slot: any) => {
      const dayKey = slot.day ? slot.day.trim() : "";
      const hourKey = parseInt(slot.hour, 10);
      const day = days.find((d) => d === dayKey);
      const hourSlot = hours.find((h) => h === hourKey);

      if (day && hourSlot && formatted[day] && formatted[day][hourSlot]) {
        formatted[day][hourSlot].push({
          id: slot.id || Math.random(),
          subject: slot.subject || "Unknown",
          section: slot.section || "",
          department: slot.department || "",
          year: slot.year || "",
          academicYear: slot.academicYear || "",
          faculty: slot.faculty_name || "",
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
        setMyTimetable({});
        return;
      }
      
      const data = await response.json();
      console.log("[TIMETABLE] My timetable data - success:", data.success, "slots:", data.timetable?.length || 0);
      
      if (data.success && data.timetable && data.timetable.length > 0) {
        console.log("[TIMETABLE] Found my timetable with", data.timetable.length, "slots");
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
                setMyTimetable(formatTimetableData(fallbackData.timetable));
              } else {
                console.log("[TIMETABLE] No timetable found in fallback");
                setMyTimetable({});
              }
            }
          } catch (fallbackErr) {
            console.error("[TIMETABLE] Fallback fetch error:", fallbackErr);
            setMyTimetable({});
          }
        } else {
          console.log("[TIMETABLE] No personal timetable found (not a faculty)");
          setMyTimetable({});
        }
      }
    } catch (err) {
      console.error("Error fetching my timetable:", err);
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
        setFacultyTimetable(formatTimetableData(data.timetable));
      } else {
        setFacultyTimetable({});
      }
    } catch (err) {
      console.error("Error fetching faculty timetable:", err);
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

  // Fetch Class Timetable
  const fetchClassTimetable = async (classId: string) => {
    if (!classId) {
      setClassTimetable({});
      return;
    }
    try {
      const response = await fetch(`/api/v1/timetable/class/${classId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.timetable)) {
        setClassTimetable(formatTimetableData(data.timetable));
      } else if (data.timetable) {
        setClassTimetable(formatTimetableData([data.timetable]));
      } else {
        setClassTimetable({});
      }
    } catch (err) {
      console.error("Error fetching class timetable:", err);
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
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "my"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Timetable
          </button>
          <button
            onClick={() => handleTabChange("faculty")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "faculty"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Faculty Timetable
          </button>
          <button
            onClick={() => handleTabChange("class")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "class"
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
              hours.some((hour) => myTimetable[day]?.[hour]?.length > 0)
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
                loading={loading}
                error={error}
                onRefresh={fetchMyTimetable}
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
                loading={loading}
                error={error}
                onRefresh={() => fetchFacultyTimetable(selectedFaculty)}
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


