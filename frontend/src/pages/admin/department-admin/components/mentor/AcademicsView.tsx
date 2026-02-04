import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";

// Dummy Data
const attendanceData = {
  overall: 87,
  attended: 42,
  total: 48,
  subjects: [
    {
      code: "CS201",
      name: "Data Structures",
      attended: 10,
      total: 12,
      percentage: 83.3,
    },
    {
      code: "CS202",
      name: "Web Development",
      attended: 11,
      total: 12,
      percentage: 91.7,
    },
    {
      code: "CS203",
      name: "Database Systems",
      attended: 9,
      total: 11,
      percentage: 81.8,
    },
    {
      code: "CS204",
      name: "Operating Systems",
      attended: 12,
      total: 13,
      percentage: 92.3,
    },
  ],
};

const marksData = {
  cgpa: 8.45,
  currentSemesterGpa: 8.7,
  percentage: 86.5,
  creditsEarned: 142,
  subjects: [
    {
      code: "CS201",
      name: "Data Structures",
      credits: 3,
      internal1: 18,
      internal2: 19,
      assignment: 5,
      total: 42,
    },
    {
      code: "CS202",
      name: "Web Development",
      credits: 4,
      internal1: 19,
      internal2: 20,
      assignment: 5,
      total: 44,
    },
    {
      code: "CS203",
      name: "Database Systems",
      credits: 3,
      internal1: 17,
      internal2: 18,
      assignment: 4,
      total: 39,
    },
    {
      code: "CS204",
      name: "Operating Systems",
      credits: 4,
      internal1: 20,
      internal2: 20,
      assignment: 5,
      total: 45,
    },
  ],
};

const leaveData = {
  totalApplied: 8,
  approved: 6,
  rejected: 1,
  history: [
    {
      date: "2024-01-15",
      reason: "Medical Emergency",
      status: "Approved",
    },
    {
      date: "2024-02-20",
      reason: "Personal Work",
      status: "Approved",
    },
    {
      date: "2024-03-10",
      reason: "Family Event",
      status: "Pending",
    },
    {
      date: "2024-04-05",
      reason: "Doctor Appointment",
      status: "Approved",
    },
    {
      date: "2024-05-12",
      reason: "Home Quarantine",
      status: "Rejected",
    },
    {
      date: "2024-06-18",
      reason: "Festival Celebration",
      status: "Approved",
    },
  ],
};

interface AcademicsViewProps {
  studentName: string;
}

export function AcademicsView({ studentName }: AcademicsViewProps) {
  const [selectedSemester, setSelectedSemester] = useState("6");

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

  return (
    <div className="space-y-6">
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
              <p className="text-3xl font-bold text-blue-600 mt-2">{attendanceData.overall}%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 border border-teal-200"
            >
              <p className="text-gray-600 text-sm font-medium">Classes Attended</p>
              <p className="text-3xl font-bold text-[#01898d] mt-2">
                {attendanceData.attended}/{attendanceData.total}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200"
            >
              <p className="text-gray-600 text-sm font-medium">Semester</p>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] bg-white"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
              </select>
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
              { label: "CGPA", value: marksData.cgpa.toFixed(2), color: "from-blue-50 to-blue-100" },
              { label: "Current Semester GPA", value: marksData.currentSemesterGpa.toFixed(2), color: "from-teal-50 to-teal-100" },
              { label: "Percentage", value: marksData.percentage.toFixed(1) + "%", color: "from-purple-50 to-purple-100" },
              { label: "Credits Earned", value: marksData.creditsEarned, color: "from-amber-50 to-amber-100" },
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
                  {marksData.subjects.map((subject, idx) => (
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
                        {subject.credits}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {subject.internal1}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {subject.internal2}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {subject.assignment}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#01898d]/10 text-[#01898d]">
                          {subject.total}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
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




