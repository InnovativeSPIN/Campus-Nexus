import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import {
  BarChart3,
  Users,
  TrendingUp,
  Download,
  AlertTriangle,
  FileText,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

const attendanceData = [
  { name: "CSE-A", attendance: 87 },
  { name: "CSE-B", attendance: 82 },
  { name: "CSE-C", attendance: 91 },
  { name: "IT-A", attendance: 78 },
  { name: "IT-B", attendance: 85 },
];

const performanceData = [
  { name: "Test 1", avg: 72 },
  { name: "Test 2", avg: 78 },
  { name: "Quiz", avg: 65 },
  { name: "Assignment", avg: 85 },
];

const shortageStudents = [
  { rollNo: "CSE015", name: "Karthik Menon", attendance: 68, shortage: 7 },
  { rollNo: "CSE023", name: "Deepa Raj", attendance: 71, shortage: 4 },
  { rollNo: "CSE031", name: "Vijay Kumar", attendance: 72, shortage: 3 },
  { rollNo: "CSE045", name: "Sneha Thomas", attendance: 74, shortage: 1 },
];

const gradeDistribution = [
  { name: "A+", value: 15, color: "#01898d" },
  { name: "A", value: 25, color: "#22c55e" },
  { name: "B+", value: 30, color: "#eab308" },
  { name: "B", value: 20, color: "#f97316" },
  { name: "C", value: 10, color: "#ef4444" },
];

export default function Reports() {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Reports & Analytics</h1>
          <p className="text-muted-foreground -mt-4">
            Generate and view academic reports
          </p>
        </div>
        <Button className="w-fit">
          <FileText className="w-4 h-4 mr-2" />
          Generate Monthly Report
        </Button>
      </motion.div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="consolidated" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Consolidated
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section-wise Attendance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="widget-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title mb-0">Section-wise Attendance</h3>
                <Select defaultValue="jan">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">January</SelectItem>
                    <SelectItem value="feb">February</SelectItem>
                    <SelectItem value="mar">March</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Shortage Students */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="widget-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="section-title mb-0 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Shortage Students (&lt;75%)
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-3">
                {shortageStudents.map((student, index) => (
                  <motion.div
                    key={student.rollNo}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        {student.attendance}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.shortage} classes short
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Average Marks Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="widget-card"
            >
              <h3 className="section-title">Average Marks by Assessment</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="avg" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Grade Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="widget-card"
            >
              <h3 className="section-title flex items-center gap-2">
                <PieChart className="w-5 h-5 text-secondary" />
                Grade Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="consolidated">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title mb-0">Monthly Consolidated Report</h3>
                <p className="text-sm text-muted-foreground">
                  Complete summary of all academic activities
                </p>
              </div>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                <p className="text-3xl font-bold text-primary">248</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20 text-center">
                <p className="text-3xl font-bold text-secondary">85%</p>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
              </div>
              <div className="p-4 bg-success/5 rounded-lg border border-success/20 text-center">
                <p className="text-3xl font-bold text-success">76</p>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Key Highlights</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Total classes conducted: 42</li>
                  <li>Syllabus coverage: 68% completed</li>
                  <li>Internal assessments: 2 tests, 4 quizzes, 3 assignments</li>
                  <li>Students with shortage: 4 (needs attention)</li>
                  <li>Average class strength: 58 students</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


