import { useState, useEffect } from "react";
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [1, 2, 3, 4, 5, 6, 7]; // 7 periods per day

// Helper to convert hour number to display time
const formatHourForDisplay = (hour: number): string => {
  const timeMap: { [key: number]: string } = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:00 - 12:00",
    4: "12:00 - 13:00",
    5: "14:00 - 15:00",
    6: "15:00 - 16:00",
    7: "16:00 - 17:00"
  };
  return timeMap[hour] || `Hour ${hour}`;
};

interface ClassSlot {
  id: number;
  subject: string;
  facultyName: string;
  section: string;
  department: string;
  year: string;
}

type TimetableData = {
  [key: string]: {
    [key: number]: ClassSlot[];
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

      const response = await fetch('/api/v1/timetable/student/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      // console.log('[DEBUG] Student Timetable - Response status:', response.status);
      // console.log('[DEBUG] Student Timetable - Response data:', data);
      // log if any replacements were marked on the server
      if (data.timetable) {
        // Log if any replacements were marked on the server
      }
      if (data.success && data.timetable && data.timetable.length > 0) {
        // console.log("API Response - Total slots:", data.timetable.length);
        // console.log("API Response - Sample slot:", data.timetable[0]);

        // Create a lookup map for O(1) access
        const timetableMap: { [key: string]: any } = {};

        data.timetable.forEach((slot: any) => {
          // Normalize day
          const dayKey = slot.day ? slot.day.trim() : '';
          const hourKey = parseInt(slot.hour, 10);
          const key = `${dayKey}_${hourKey}`;

          timetableMap[key] = {
            id: slot.id || Math.random(),
            subject: slot.subject || 'Unknown',
            facultyName: slot.facultyName || 'TBA',
            section: slot.section || '',
            department: slot.department || '',
            year: slot.year || ''
          };
        });

        // console.log("Timetable Map keys:", Object.keys(timetableMap));

        // Store both the map and raw data for rendering
        const formattedData: TimetableData = {
          Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {}
        };

        // Initialize all day/hour combinations with empty arrays
        days.forEach(day => {
          hours.forEach(hour => {
            formattedData[day][hour] = [];
          });
        });

        // Populate the formatted data from the map
        Object.entries(timetableMap).forEach(([key, slot]: [string, any]) => {
          const [dayKey, hourStr] = key.split('_');
          const hourKey = parseInt(hourStr, 10);

          // Find the matching day
          const day = days.find(d => d === dayKey);

          // Use exact hour match
          const hourSlot = hours.find(h => h === hourKey);

          if (day && hourSlot && formattedData[day] && formattedData[day][hourSlot]) {
            formattedData[day][hourSlot].push(slot);
          }
        });

        // console.log("Formatted Data - Monday Hour 1:", formattedData['Monday']?.[1]);
        setTimetableData(formattedData);
      } else if (!response.ok) {
        // Handle error responses
        console.error('Error response:', data);
        if (response.status === 401) {
          setError('Please login to view your timetable');
          toast.error('Please login to view your timetable');
        } else if (response.status === 403) {
          setError('You are not authorized to view this timetable');
          toast.error('You are not authorized to view this timetable');
        } else {
          setError(data.error || data.message || 'Failed to load timetable');
          toast.error(data.error || data.message || 'Failed to load timetable');
        }
        setTimetableData({});
      } else if (data.success === false && data.message === 'Section not assigned to student') {
        // Handle case where section is not assigned
        setError('Section not assigned to student. Please contact your department admin.');
        toast.warning('Section not assigned to student');
        setTimetableData({});
      } else {
        // No timetable found
        // console.log("No timetable found for this student");
        // console.log("Message from server:", data.message);
        setError(data.message || 'Timetable not assigned yet.');
        setTimetableData({});
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to load timetable. Please try again.');
      toast.error('Failed to load timetable');
      setTimetableData({});
    } finally {
      setLoading(false);
    }
  };

  // Check if timetable has any data
  const hasTimetableData = days.some(day =>
    hours.some(hour => timetableData[day]?.[hour]?.length > 0)
  );

  // compute a friendly department name; sometimes the auth context gives an object
  const deptDisplay = user?.department
    ? (typeof user.department === 'object' ? user.department.short_name || user.department : user.department)
    : '';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Timetable"
        subtitle={deptDisplay ? `Department: ${deptDisplay} | Year: ${user?.year}` : ''}
        breadcrumbs={[
          { label: 'Academics' },
          { label: 'Timetable' },
        ]}
      />

      <SectionCard title="My Timetable">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading timetable...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">{error}</p>
            <button
              onClick={fetchTimetable}
              className="mt-4 text-primary hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : !hasTimetableData ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">Timetable not assigned yet.</p>
            <p className="text-sm mt-2">Please contact your department admin for timetable details.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold min-w-[100px]">Time</th>
                  {days.map(day => (
                    <th key={day} className="border p-3 text-center font-semibold min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map(hour => (
                  <tr key={hour}>
                    <td className="border p-2 text-sm font-medium bg-muted/30">
                      <div className="flex flex-col">
                        <span>Hour {hour}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {formatHourForDisplay(hour)}
                        </span>
                      </div>
                    </td>
                    {days.map(day => {
                      const slots = timetableData[day]?.[hour] || [];
                      return (
                        <td key={`${day}-${hour}`} className="border p-2 min-h-[80px]">
                          {slots.length > 0 ? (
                            <div className="space-y-1">
                              {slots.map((slot, idx) => (
                                <div
                                  key={slot.id || idx}
                                  className="bg-primary/10 p-2 rounded text-xs"
                                >
                                  <div className="font-semibold text-primary">{slot.subject}</div>
                                  <div className="text-muted-foreground">{slot.facultyName}</div>
                                </div>
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
      </SectionCard>
    </div>
  );
}
