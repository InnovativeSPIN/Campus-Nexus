import { useState, useEffect } from 'react';

interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

interface TimetableClass {
  id: number;
  subject: string;
  subjectCode?: string;
  classId: number;
  className: string;
  room: string;
  day: string;
  timeSlot: TimeSlot;
  type: 'Theory' | 'Lab' | 'Practical';
  studentsCount: number;
  totalPeriods: number;
}

interface CurrentAndNextClasses {
  current: TimetableClass | null;
  next: TimetableClass | null;
  allClasses: TimetableClass[];
  loading: boolean;
  error: string | null;
}

const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const isClassOngoing = (slot: TimeSlot, currentTime: Date): boolean => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = timeStringToMinutes(slot.start);
  const endMinutes = timeStringToMinutes(slot.end);
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

const isClassUpcoming = (slot: TimeSlot, currentTime: Date): boolean => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = timeStringToMinutes(slot.start);
  return startMinutes > currentMinutes;
};

export const useTodaysTimetable = (): CurrentAndNextClasses => {
  const [state, setState] = useState<CurrentAndNextClasses>({
    current: null,
    next: null,
    allClasses: [],
    loading: true,
    error: null,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch timetable on mount
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Get faculty's timetable for today
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `/api/v1/faculty/academics/today-schedule`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch timetable');
        }

        const data = await response.json();
        const classes = Array.isArray(data.data) ? data.data : [];

        // Find current and next classes
        let currentClass = null;
        let nextClass = null;

        const ongoingClasses = classes.filter((cls: TimetableClass) =>
          isClassOngoing(cls.timeSlot, currentTime)
        );

        if (ongoingClasses.length > 0) {
          currentClass = ongoingClasses[0];
        }

        const upcomingClasses = classes
          .filter((cls: TimetableClass) => isClassUpcoming(cls.timeSlot, currentTime))
          .sort((a: TimetableClass, b: TimetableClass) =>
            timeStringToMinutes(a.timeSlot.start) - timeStringToMinutes(b.timeSlot.start)
          );

        if (upcomingClasses.length > 0) {
          nextClass = upcomingClasses[0];
        }

        setState({
          current: currentClass,
          next: nextClass,
          allClasses: classes.sort((a: TimetableClass, b: TimetableClass) =>
            timeStringToMinutes(a.timeSlot.start) - timeStringToMinutes(b.timeSlot.start)
          ),
          loading: false,
          error: null,
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch timetable',
        }));
      }
    };

    fetchTimetable();
  }, []);

  // Update current/next classes when time changes
  useEffect(() => {
    if (state.allClasses.length === 0) return;

    let currentClass = null;
    let nextClass = null;

    const ongoingClasses = state.allClasses.filter((cls) =>
      isClassOngoing(cls.timeSlot, currentTime)
    );

    if (ongoingClasses.length > 0) {
      currentClass = ongoingClasses[0];
    }

    const upcomingClasses = state.allClasses
      .filter((cls) => isClassUpcoming(cls.timeSlot, currentTime))
      .sort((a, b) => timeStringToMinutes(a.timeSlot.start) - timeStringToMinutes(b.timeSlot.start));

    if (upcomingClasses.length > 0) {
      nextClass = upcomingClasses[0];
    }

    setState(prev => ({
      ...prev,
      current: currentClass,
      next: nextClass,
    }));
  }, [currentTime, state.allClasses]);

  return state;
};

export type { TimetableClass, TimeSlot };
