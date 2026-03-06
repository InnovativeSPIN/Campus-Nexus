import { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Download, Calendar as CalendarIcon, Clock, Loader2, UserX } from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
  section: string;
  department: string;
  year: string;
  academicYear: string;
}

type TimetableData = {
  [key: string]: {
    [key: number]: ClassSlot[];
  };
};

export default function Timetable() {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const { user, authToken } = useAuth();
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);
  const [departmentFaculties, setDepartmentFaculties] = useState<any[]>([]);
  const [assignedSubstitutions, setAssignedSubstitutions] = useState<any[]>([]);

  // Substitution Request State
  const [isSubstituteDialogOpen, setIsSubstituteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot & { day: string, time: string } | null>(null);
  const [substituteDate, setSubstituteDate] = useState<string>("");
  const [substituteId, setSubstituteId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTimetable();
    fetchDepartmentFaculties();
    fetchAssignedSubstitutions();
  }, []);

  const fetchAssignedSubstitutions = async () => {
    try {
      const response = await fetch('/api/v1/faculty/timetable/alterations');
      const data = await response.json();
      if (data.success) {
        // Filter for alterations where this faculty is the new_faculty (substitute) and it's approved
        // We can just show all where they are new_faculty for now, maybe filter by status later
        // This depends on how the backend returns data. If our user is the substitute, they should see it.
        // Let's just trust the backend returns relevant ones + we can display them.
        setAssignedSubstitutions(data.data.filter((alt: any) => alt.new_faculty_id)); // Basic fallback filter
      }
    } catch (e) {
      console.error(e);
    }
  }

  const fetchDepartmentFaculties = async () => {
    try {
      const response = await fetch('/api/v1/faculty');
      const data = await response.json();
      if (data.success && data.data) {
        setDepartmentFaculties(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };


  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/timetable/faculty/me');
      const data = await response.json();

      console.log('[DEBUG] fetchTimetable - Response status:', response.status);
      console.log('[DEBUG] fetchTimetable - Response data:', data);

      if (data.success && data.timetable && data.timetable.length > 0) {
        console.log("API Response - Total slots:", data.timetable.length);
        console.log("API Response - Sample slot:", data.timetable[0]);
        
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
            section: slot.section || '',
            department: slot.department || '',
            year: slot.year || '',
            academicYear: slot.academicYear || ''
          };
        });

        console.log("Timetable Map keys:", Object.keys(timetableMap));

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

        console.log("Formatted Data - Monday Hour 1:", formattedData['Monday']?.[1]);
        setTimetableData(formattedData);
      } else if (!response.ok) {
        // Handle error responses
        console.error('Error response:', data);
        if (response.status === 401) {
          toast.error('Please login to view your timetable');
        } else if (response.status === 403) {
          toast.error('You are not authorized to view this timetable');
        } else {
          toast.error(data.error || 'Failed to load timetable');
        }
        setTimetableData({});
      } else {
        // No timetable found - this is expected for new faculty
        console.log("No timetable found for this faculty");
        console.log("Message from server:", data.message);
        setTimetableData({});
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
      toast.error('Failed to load your timetable');
    } finally {
      setLoading(false);
    }
  };

  const openSubstituteDialog = (day: string, time: string, slot: ClassSlot) => {
    setSelectedSlot({ ...slot, day, time });

    // Auto-calculate a future date matching the day of the week
    const now = new Date();
    const dayIndex = ["Sunday", ...days].indexOf(day);
    let targetDate = new Date();
    targetDate.setDate(now.getDate() + (dayIndex + 7 - now.getDay()) % 7);
    if (targetDate.getTime() < now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 7); // Next week
    }

    setSubstituteDate(targetDate.toISOString().split('T')[0]);
    setIsSubstituteDialogOpen(true);
  };

  const handleSubstituteSubmit = async () => {
    if (!substituteDate || !substituteId || !reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get user's faculty_id - user.id should be the faculty_id for faculty users
      const currentFacultyId = user?.id ? parseInt(user.id, 10) : 0;
      const currentSemester = user?.semester || 1;
      
      const reqData = {
        semester: currentSemester,
        slot_id: selectedSlot?.id,
        old_faculty_id: currentFacultyId,
        new_faculty_id: substituteId,
        reason: reason,
        proposed_date: substituteDate
      };

      // Get auth token
      const token = authToken || localStorage.getItem('authToken');
      
      const response = await fetch('/api/v1/faculty/timetable/alterations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(reqData)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Substitution requested successfully.");
        setIsSubstituteDialogOpen(false);
        setReason("");
        setSubstituteId("");
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (e: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
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
          <h1 className="page-header font-serif">Smart Timetable</h1>
          <p className="text-muted-foreground -mt-4">
            Weekly schedule with interactive class slots
          </p>
        </div>
        <Button variant="outline" className="w-fit">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
          <span className="text-sm text-muted-foreground">Assigned Class</span>
        </div>
      </motion.div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="widget-card overflow-x-auto min-h-[400px]"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full pt-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(timetableData).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">Timetable not yet assigned.</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your department admin to assign your timetable.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-muted-foreground border-b">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="p-3 text-center text-sm font-semibold text-muted-foreground border-b"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, hourIndex) => (
                <motion.tr
                  key={hour}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + hourIndex * 0.05 }}
                  className={cn("1" === currentDay && "bg-primary/5")}
                >
                  <td className={cn(
                    "p-3 text-sm font-medium border-b whitespace-nowrap",
                    "text-muted-foreground"
                  )}>
                    {formatHourForDisplay(hour)}
                  </td>
                  {days.map((day) => {
                    const slots = timetableData[day]?.[hour];
                    return (
                      <td
                        key={`${day}-${hour}`}
                        className="p-2 border-b"
                      >
                        {slots && slots.length > 0 ? (
                          <div className="space-y-1">
                            {slots.map((slot) => (
                              <div key={slot.id} className="relative group">
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="p-3 rounded-lg border bg-primary/10 border-primary/30 hover:bg-primary/20 cursor-pointer transition-all"
                                >
                                  <p className="font-semibold text-sm text-primary">
                                    {slot.subject}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {slot.section} {slot.department && `- ${slot.department}`}
                                  </p>
                                  {slot.year && (
                                    <p className="text-xs text-muted-foreground">
                                      Year: {slot.year}
                                    </p>
                                  )}
                                </motion.div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-muted/30 text-center">
                            <span className="text-xs text-muted-foreground"></span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Assigned Substitutions Section */}
      {assignedSubstitutions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="widget-card mt-8"
        >
          <h2 className="text-lg font-semibold mb-4">Assigned Substitute Classes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedSubstitutions.map((sub: any) => (
              <div key={sub.id} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{sub.proposed_date ? new Date(sub.proposed_date).toLocaleDateString() : 'Unknown Date'}</span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    sub.status === 'approved' ? "bg-green-100 text-green-700" :
                      sub.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Replacing: {sub.old_faculty?.Name || sub.old_faculty?.firstName || 'Unknown Faculty'}
                </div>
                {sub.slot && (
                  <div className="text-sm">
                    <span className="font-medium">{sub.slot.subject?.name}</span> ({sub.slot.room})
                    <br />
                    {sub.slot.day} @ {sub.slot.start_time} - {sub.slot.end_time}
                  </div>
                )}
                {sub.reason && (
                  <div className="text-xs text-muted-foreground italic truncate">
                    Reason: {sub.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Substitute Dialog */}
      <Dialog open={isSubstituteDialogOpen} onOpenChange={setIsSubstituteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Substitution</DialogTitle>
            <DialogDescription>
              Mark yourself absent for {selectedSlot?.subject} ({selectedSlot?.day} @ {selectedSlot?.time})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date of Absence</Label>
              <input
                type="date"
                value={substituteDate}
                onChange={(e) => setSubstituteDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Substitute Faculty</Label>
              <Select value={substituteId} onValueChange={setSubstituteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {departmentFaculties.map((f: any) => (
                    <SelectItem key={f.faculty_id} value={f.faculty_id.toString()}>
                      {f.firstName} {f.lastName} ({f.designation || 'Faculty'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Give a brief reason for absence"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubstituteSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}


