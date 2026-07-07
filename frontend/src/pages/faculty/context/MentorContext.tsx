import React, { createContext, useState, useCallback, ReactNode } from "react";
import { StudentProfile } from "@/pages/faculty/data/menteeStudents";
import { getCurrentAcademicYear } from "@/utils/academicYear";

export interface MentorContextType {
  isMentorMode: boolean;
  toggleMentorMode: () => void;
  selectedYear: "2nd" | "3rd" | "Final" | null;
  setSelectedYear: (year: "2nd" | "3rd" | "Final" | null) => void;
  selectedStudent: StudentProfile | null;
  setSelectedStudent: (student: StudentProfile | null) => void;
  getStudentsByYear: (year: "2nd" | "3rd" | "Final") => StudentProfile[];
  getStudentById: (id: string) => StudentProfile | undefined;
  approvePendingChange: (studentId: string, fieldName: string) => void;
  rejectPendingChange: (studentId: string, fieldName: string) => void;
  updateStudentInfo: (studentId: string, field: string, value: string, changedBy: "mentor" | "student") => void;
  updateStudentData: (studentId: string, updates: Record<string, any>) => Promise<void>;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

interface MentorProviderProps {
  children: ReactNode;
}

export function MentorProvider({ children }: MentorProviderProps) {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState<"2nd" | "3rd" | "Final" | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const year = getCurrentAcademicYear();
      const res = await fetch(`/api/v1/faculty/mentorship/my-mentees?academic_year=${year}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  const toggleMentorMode = useCallback(() => {
    setIsMentorMode((prev) => !prev);
    if (isMentorMode) {
      setSelectedYear(null);
      setSelectedStudent(null);
    }
  }, [isMentorMode]);

  const handleGetStudentsByYear = useCallback((year: "2nd" | "3rd" | "Final") => {
    return students.filter((s) => s.basicInfo.year === year);
  }, [students]);

  const handleGetStudentById = useCallback((id: string) => {
    return students.find((s) => s.id === id);
  }, [students]);

  const approvePendingChange = useCallback((studentId: string, fieldName: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const pending = student.pendingChanges.find((p) => p.field === fieldName);
          if (pending) {
            return {
              ...student,
              pendingChanges: student.pendingChanges.filter((p) => p.field !== fieldName),
            };
          }
        }
        return student;
      })
    );
  }, []);

  const rejectPendingChange = useCallback((studentId: string, fieldName: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            pendingChanges: student.pendingChanges.filter((p) => p.field !== fieldName),
          };
        }
        return student;
      })
    );
  }, []);

  const updateStudentInfo = useCallback(
    (studentId: string, field: string, value: string, changedBy: "mentor" | "student") => {
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id === studentId) {
            if (changedBy === "mentor") {
              // Mentor changes apply immediately
              return { ...student };
            } else {
              // Student changes require approval
              return {
                ...student,
                pendingChanges: [
                  ...student.pendingChanges,
                  {
                    field,
                    oldValue: "",
                    newValue: value,
                    status: "pending",
                  },
                ],
              };
            }
          }
          return student;
        })
      );
    },
    []
  );

  const updateStudentData = useCallback(async (studentId: string, updates: Record<string, any>) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/v1/faculty/mentorship/student/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        // Update local state to reflect changes instantly
        setStudents((prev) =>
          prev.map((student) => {
            if (student.id === studentId) {
              // Deep merge the updates into the student object
              // Note: For simple top-level properties and bio properties, we just merge.
              return { ...student, ...updates };
            }
            return student;
          })
        );
      }
    } catch (error) {
      console.error('Error updating student data:', error);
    }
  }, []);

  const value: MentorContextType = {
    isMentorMode,
    toggleMentorMode,
    selectedYear,
    setSelectedYear,
    selectedStudent,
    setSelectedStudent,
    getStudentsByYear: handleGetStudentsByYear,
    getStudentById: handleGetStudentById,
    approvePendingChange,
    rejectPendingChange,
    updateStudentInfo,
    updateStudentData,
  };

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>;
}

export { MentorContext };

