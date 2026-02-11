import { motion, AnimatePresence } from "framer-motion";
import { useMentor } from "@/pages/admin/department-admin/context";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function MenteesList() {
  const { setSelectedStudent, getStudentsByYear } = useMentor();
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();

  const yearValue = year ? (year.charAt(0).toUpperCase() + year.slice(1)) as "2nd" | "3rd" | "Final" : undefined;
  const students = yearValue ? getStudentsByYear(yearValue) : [];

  const handleStudentClick = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      navigate(`/admin/department-admin/mentor/student/${studentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/admin/department-admin/mentor")}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft className="text-gray-700" size={24} />
        </motion.button>
        <h1 className="text-4xl font-bold text-gray-800">
          {yearValue} Year Students
        </h1>
      </motion.div>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => handleStudentClick(student.id)}
              className="group cursor-pointer"
            >
              {/* Student Card */}
              <motion.div
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <motion.img
                    src={student.photos.studentPhoto}
                    alt={student.basicInfo.name}
                    className="w-20 h-20 rounded-full border-4 border-gradient-to-r from-[#790c0c] to-[#01898d]"
                    whileHover={{ scale: 1.1 }}
                  />
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-800 text-center mb-1">
                  {student.basicInfo.name}
                </h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  {student.id} | {student.basicInfo.rollNumber}
                </p>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Department:</span>
                    <span>{student.basicInfo.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Section:</span>
                    <span>{student.basicInfo.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Semester:</span>
                    <span>{student.basicInfo.semester}</span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-[#790c0c] to-[#01898d] text-white font-semibold py-2 rounded-lg transition-all"
                >
                  View Profile
                </motion.button>

                {/* Pending changes badge */}
                {student.pendingChanges.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {student.pendingChanges.length} Pending
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {students.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-gray-600 text-lg">No students found for this year.</p>
        </motion.div>
      )}
    </div>
  );
}

