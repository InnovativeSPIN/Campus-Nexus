import React, { createContext, useState, useCallback, ReactNode } from "react";
import { StudentProfile, menteeStudents } from "@/pages/admin/department-admin/data/menteeStudents";

export interface MentorContextType {
  isMentorMode: boolean;
  toggleMentorMode: () => void;
  selectedYear: "2nd" | "3rd" | "Final" | null;
  setSelectedYear: (year: "2nd" | "3rd" | "Final" | null) => void;
  selectedStudent: StudentProfile | null;
  setSelectedStudent: (student: StudentProfile | null) => void;
  getStudentsByYear: (year: "2nd" | "3rd" | "Final") => StudentProfile[];
  approvePendingChange: (studentId: string, fieldName: string) => void;
  rejectPendingChange: (studentId: string, fieldName: string) => void;
  updateStudentInfo: (studentId: string, field: string, value: string, changedBy: "mentor" | "student") => void;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

interface MentorProviderProps {
  children: ReactNode;
}

export function MentorProvider({ children }: MentorProviderProps) {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState<"2nd" | "3rd" | "Final" | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>(menteeStudents);

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

  const value: MentorContextType = {
    isMentorMode,
    toggleMentorMode,
    selectedYear,
    setSelectedYear,
    selectedStudent,
    setSelectedStudent,
    getStudentsByYear: handleGetStudentsByYear,
    approvePendingChange,
    rejectPendingChange,
    updateStudentInfo,
  };

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>;
}

export { MentorContext };

