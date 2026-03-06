import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Download, Calendar as CalendarIcon, Clock, Settings } from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { useNavigate } from "react-router-dom";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

interface ClassSlot {
  subject: string;
  section: string;
  room: string;
  type: "lecture" | "lab" | "tutorial";
}

type TimetableData = {
  [key: string]: {
    [key: string]: ClassSlot | null;
  };
};

const timetableData: TimetableData = {
  Monday: {
    "9:00 AM": { subject: "Data Structures", section: "CSE-A", room: "Room 101", type: "lecture" },
    "10:00 AM": { subject: "Data Structures", section: "CSE-B", room: "Room 102", type: "lecture" },
    "11:00 AM": null,
    "12:00 PM": { subject: "OOP Lab", section: "CSE-A", room: "Lab 1", type: "lab" },
    "2:00 PM": { subject: "OOP Lab", section: "CSE-A", room: "Lab 1", type: "lab" },
    "3:00 PM": null,
    "4:00 PM": { subject: "Tutorial", section: "CSE-A", room: "Room 101", type: "tutorial" },
  },
  Tuesday: {
    "9:00 AM": null,
    "10:00 AM": { subject: "Algorithms", section: "CSE-C", room: "Room 201", type: "lecture" },
    "11:00 AM": { subject: "Algorithms", section: "CSE-C", room: "Room 201", type: "lecture" },
    "12:00 PM": null,
    "2:00 PM": { subject: "Data Structures", section: "CSE-A", room: "Room 101", type: "lecture" },
    "3:00 PM": { subject: "Data Structures Lab", section: "CSE-B", room: "Lab 2", type: "lab" },
    "4:00 PM": { subject: "Data Structures Lab", section: "CSE-B", room: "Lab 2", type: "lab" },
  },
  Wednesday: {
    "9:00 AM": { subject: "OOP", section: "CSE-A", room: "Room 103", type: "lecture" },
    "10:00 AM": { subject: "OOP", section: "CSE-B", room: "Room 103", type: "lecture" },
    "11:00 AM": { subject: "Data Structures", section: "CSE-C", room: "Room 201", type: "lecture" },
    "12:00 PM": null,
    "2:00 PM": null,
    "3:00 PM": { subject: "Tutorial", section: "CSE-B", room: "Room 102", type: "tutorial" },
    "4:00 PM": null,
  },
  Thursday: {
    "9:00 AM": { subject: "Algorithms Lab", section: "CSE-A", room: "Lab 3", type: "lab" },
    "10:00 AM": { subject: "Algorithms Lab", section: "CSE-A", room: "Lab 3", type: "lab" },
    "11:00 AM": null,
    "12:00 PM": { subject: "Data Structures", section: "CSE-B", room: "Room 102", type: "lecture" },
    "2:00 PM": { subject: "OOP", section: "CSE-C", room: "Room 201", type: "lecture" },
    "3:00 PM": { subject: "OOP", section: "CSE-C", room: "Room 201", type: "lecture" },
    "4:00 PM": null,
  },
  Friday: {
    "9:00 AM": { subject: "Data Structures", section: "CSE-A", room: "Room 101", type: "lecture" },
    "10:00 AM": null,
    "11:00 AM": { subject: "Algorithms", section: "CSE-B", room: "Room 102", type: "lecture" },
    "12:00 PM": { subject: "Algorithms", section: "CSE-B", room: "Room 102", type: "lecture" },
    "2:00 PM": { subject: "OOP Lab", section: "CSE-C", room: "Lab 1", type: "lab" },
    "3:00 PM": { subject: "OOP Lab", section: "CSE-C", room: "Lab 1", type: "lab" },
    "4:00 PM": { subject: "Tutorial", section: "CSE-C", room: "Room 201", type: "tutorial" },
  },
  Saturday: {
    "9:00 AM": { subject: "Extra Class", section: "CSE-A", room: "Room 101", type: "lecture" },
    "10:00 AM": { subject: "Extra Class", section: "CSE-A", room: "Room 101", type: "lecture" },
    "11:00 AM": null,
    "12:00 PM": null,
    "2:00 PM": null,
    "3:00 PM": null,
    "4:00 PM": null,
  },
};

const typeStyles = {
  lecture: "bg-primary/10 border-primary/30 hover:bg-primary/20",
  lab: "bg-secondary/10 border-secondary/30 hover:bg-secondary/20",
  tutorial: "bg-warning/10 border-warning/30 hover:bg-warning/20",
};

const typeColors = {
  lecture: "text-primary",
  lab: "text-secondary",
  tutorial: "text-warning",
};

export default function Timetable() {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const navigate = useNavigate();

  // Break timings for different years
  const breakTimings = {
    '1st-2nd': [
      { name: 'Morning Break', time: '11:00 AM - 11:15 AM' },
      { name: 'Lunch Break', time: '1:00 PM - 2:00 PM' }
    ],
    '3rd-4th': [
      { name: 'Morning Break', time: '10:30 AM - 10:45 AM' },
      { name: 'Lunch Break', time: '12:30 PM - 1:30 PM' }
    ]
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
        <div className="flex gap-2">
          <Button variant="outline" className="w-fit">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={() => navigate('/admin/department/timetable-management')}
            className="w-fit bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Timetable
          </Button>
        </div>
      </motion.div>

      {/* Legend and Break Timings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        {/* Legend */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="font-semibold text-sm mb-3">Legend</h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
            <span className="text-sm text-muted-foreground">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary/20 border border-secondary/30" />
            <span className="text-sm text-muted-foreground">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
            <span className="text-sm text-muted-foreground">Tutorial</span>
          </div>
        </div>

        {/* Break Timings - Years 1-2 */}
        <div className="md:col-span-1">
          <h3 className="font-semibold text-sm mb-3">Break Timings (1st-2nd Year)</h3>
          <div className="space-y-2">
            {breakTimings['1st-2nd'].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="font-medium text-xs">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Break Timings - Years 3-4 */}
        <div className="md:col-span-1">
          <h3 className="font-semibold text-sm mb-3">Break Timings (3rd-4th Year)</h3>
          <div className="space-y-2">
            {breakTimings['3rd-4th'].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <div>
                  <p className="font-medium text-xs">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="widget-card overflow-x-auto"
      >
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-muted-foreground border-b">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Day
              </th>
              {timeSlots.map((time) => (
                <th
                  key={time}
                  className="p-3 text-center text-sm font-semibold text-muted-foreground border-b"
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, dayIndex) => (
              <motion.tr
                key={day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + dayIndex * 0.05 }}
                className={cn(day === currentDay && "bg-primary/5")}
              >
                <td className={cn(
                  "p-3 text-sm font-medium border-b whitespace-nowrap",
                  day === currentDay ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {day}
                </td>
                {timeSlots.map((time) => {
                  const slot = timetableData[day]?.[time];
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="p-2 border-b"
                    >
                      {slot ? (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all",
                            typeStyles[slot.type]
                          )}
                        >
                          <p className={cn("font-semibold text-sm", typeColors[slot.type])}>
                            {slot.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {slot.section} {slot.room}
                          </p>
                        </motion.div>
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
      </motion.div>
    </MainLayout>
  );
}


