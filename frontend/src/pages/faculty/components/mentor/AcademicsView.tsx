import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface AcademicsViewProps {
  student: any;
  onSave: (section: string, data: any) => void;
  isMentorMode?: boolean;
}

export function AcademicsView({ student, onSave, isMentorMode }: AcademicsViewProps) {
  const [selectedSemester, setSelectedSemester] = useState("6");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cgpa: student?.academicInfo?.cgpa || "0.0",
    attendance: student?.academicInfo?.attendance || "0%",
    arrears: student?.academicInfo?.arrears || 0,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSave = () => {
    // The academics is saved into the "academics" field in backend
    const updatedAcademics = {
      ...student?.academicInfo,
      cgpa: formData.cgpa,
      attendance: formData.attendance,
      arrears: formData.arrears,
    };
    onSave("Academics", { academics: updatedAcademics });
    setIsEditing(false);
  };

  // Mock data for tables since they are too complex to edit all at once in this mockup
  const attendanceData: { subjects: any[] } = { subjects: [] };
  const leaveData: { totalApplied: number, approved: number, rejected: number, history: any[] } = { totalApplied: 0, approved: 0, rejected: 0, history: [] };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Academics</h2>
        {isMentorMode && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">Edit Overview</Button>
        )}
        {isMentorMode && isEditing && (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="ghost">Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </div>
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Overall Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
            >
              <p className="text-gray-600 text-sm font-medium">Overall Attendance</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  className="mt-2 w-full bg-white border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <p className="text-3xl font-bold text-blue-600 mt-2">{student?.academicInfo?.attendance || "0%"}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 border border-teal-200"
            >
              <p className="text-gray-600 text-sm font-medium">CGPA</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="mt-2 w-full bg-white border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <p className="text-3xl font-bold text-[#01898d] mt-2">
                  {student?.academicInfo?.cgpa || "0.0"}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200"
            >
              <p className="text-gray-600 text-sm font-medium">Active Arrears</p>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.arrears}
                  onChange={(e) => setFormData({ ...formData, arrears: parseInt(e.target.value) || 0 })}
                  className="mt-2 w-full bg-white border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {student?.academicInfo?.arrears || 0}
                </p>
              )}
            </motion.div>
          </div>

          {/* Subject-wise Attendance Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Subject-wise Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Attended
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendanceData.subjects.map((subject, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {subject.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {subject.attended}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {subject.total}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            subject.percentage >= 85
                              ? "bg-green-100 text-green-800"
                              : subject.percentage >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subject.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* Marks Tab */}
        <TabsContent value="marks" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "CGPA", value: student?.academicInfo?.cgpa || "0.0", color: "from-blue-50 to-blue-100" },
              { label: "Attendance", value: student?.academicInfo?.attendance || "0%", color: "from-teal-50 to-teal-100" },
              { label: "Arrears", value: student?.academicInfo?.arrears || 0, color: "from-purple-50 to-purple-100" },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${card.color} rounded-lg p-6 border border-gray-200`}
              >
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Marks Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Subject Marks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Subject Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Internal 1
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Internal 2
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Assignment
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No subjects data recorded.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-12 border-2 border-dashed border-blue-300 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-lg">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Timetable Coming Soon</h3>
            <p className="text-gray-700">Timetable will be updated soon with your class schedule</p>
          </motion.div>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave" className="space-y-6">
          {/* Leave Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
            >
              <p className="text-gray-600 text-sm font-medium">Total Leaves Applied</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{leaveData.totalApplied}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200"
            >
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{leaveData.approved}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200"
            >
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{leaveData.rejected}</p>
            </motion.div>
          </div>

          {/* Leave History Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Leave History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaveData.history.map((leave, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{leave.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{leave.reason}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




