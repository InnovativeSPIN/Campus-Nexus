import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [1, 2, 3, 4, 5, 6, 7];

const formatHourForDisplay = (hour: number): string => {
  const timeMap: { [key: number]: string } = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:00 - 12:00",
    4: "12:00 - 13:00",
    5: "14:00 - 15:00",
    6: "15:00 - 16:00",
    7: "16:00 - 17:00",
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

type TimetableData = {
  [day: string]: {
    [hour: number]: ClassSlot[];
  };
};

export default function Timetable() {
  const { user, authToken } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Build a day → hour → slot[] map
        const formattedData: TimetableData = {
          Monday: {},
          Tuesday: {},
          Wednesday: {},
          Thursday: {},
          Friday: {},
          Saturday: {},
        };

        // Initialise all cells with empty arrays
        days.forEach((day) => {
          hours.forEach((hour) => {
            formattedData[day][hour] = [];
          });
        });

        data.timetable.forEach((slot: any) => {
          const dayKey = slot.day ? slot.day.trim() : "";
          const hourKey = parseInt(slot.hour, 10);

          const day = days.find((d) => d === dayKey);
          const hourSlot = hours.find((h) => h === hourKey);

          if (day && hourSlot && formattedData[day] && formattedData[day][hourSlot]) {
            formattedData[day][hourSlot].push({
              id: slot.id || Math.random(),
              subject: slot.subject || "Unknown",
              section: slot.section || "",
              department: slot.department || "",
              year: slot.year || "",
              academicYear: slot.academicYear || "",
            });
          }
        });

        setTimetableData(formattedData);
      } else if (!response.ok) {
        if (response.status === 401) {
          setError("Please login to view your timetable");
          toast.error("Please login to view your timetable");
        } else if (response.status === 403) {
          setError("You are not authorised to view this timetable");
          toast.error("You are not authorised to view this timetable");
        } else {
          setError(data.error || data.message || "Failed to load timetable");
          toast.error(data.error || data.message || "Failed to load timetable");
        }
        setTimetableData({});
      } else {
        setError(data.message || "Timetable not assigned yet.");
        setTimetableData({});
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("Failed to load timetable. Please try again.");
      toast.error("Failed to load timetable");
      setTimetableData({});
    } finally {
      setLoading(false);
    }
  };

  const hasTimetableData = days.some((day) =>
    hours.some((hour) => timetableData[day]?.[hour]?.length > 0)
  );

  // Friendly display for faculty dept
  const deptDisplay = user?.department
    ? typeof user.department === "object"
      ? (user.department as any).short_name || user.department
      : user.department
    : "";

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="page-header font-serif">My Timetable</h1>
        {deptDisplay && (
          <p className="text-muted-foreground -mt-4">
            Department: {deptDisplay}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="widget-card"
      >
        <h2 className="text-lg font-semibold mb-4">My Timetable</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading timetable...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{error}</p>
            <button
              onClick={fetchTimetable}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Try Again
            </button>
          </div>
        ) : !hasTimetableData ? (
          <div className="py-12 text-center">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Timetable not assigned yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your department admin for timetable details.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold min-w-[100px]">Time</th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border p-3 text-center font-semibold min-w-[140px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour}>
                    {/* Time column */}
                    <td className="border p-2 text-sm font-medium bg-muted/30">
                      <div className="flex flex-col">
                        <span>Hour {hour}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {formatHourForDisplay(hour)}
                        </span>
                      </div>
                    </td>

                    {/* Day columns */}
                    {days.map((day) => {
                      const slots = timetableData[day]?.[hour] || [];
                      return (
                        <td
                          key={`${day}-${hour}`}
                          className="border p-2 min-h-[80px]"
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
        )}
      </motion.div>
    </MainLayout>
  );
}
