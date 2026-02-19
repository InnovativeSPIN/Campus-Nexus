import { useState, useEffect } from "react";
import { IntegratedNotificationBell } from "@/components/common/IntegratedNotificationBell";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Progress } from "@/pages/faculty/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Switch } from "@/pages/faculty/components/ui/switch";
import { Checkbox } from "@/pages/faculty/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/pages/faculty/components/ui/select";
import { Badge } from "@/pages/faculty/components/ui/badge";
import {
  BookOpen,
  FileUp,
  ClipboardList,
  Check,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  FileText,
  Video,
  Presentation,
  Users,
  GraduationCap,
  Send,
  RefreshCw,
  FileIcon,
  X,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface ClassSubject {
  id: string;
  program: string;
  semester: string;
  section: string;
  subject: string;
  subjectCode: string;
}

interface Topic {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
}

interface Material {
  id: string;
  name: string;
  type: "pdf" | "ppt" | "video";
  size: string;
  visible: boolean;
  uploadDate: string;
}

interface StudentMark {
  id: string;
  registerNo: string;
  name: string;
  subject: string;
  internalMarks: number;
  assignmentMarks: number;
  totalMarks: number;
  passPercentage: number;
  examStatus: 'Pass' | 'Fail';
}

interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  totalHours: number;
  credits: number;
}

interface SemesterCredits {
  semester: number;
  year: number;
  department: string;
  subjects: Subject[];
}

// Credits data organized by semester, department, and year
const creditsData: SemesterCredits[] = [
  {
    semester: 5,
    year: 3,
    department: "CSE",
    subjects: [
      { id: "1", code: "CS3452", name: "Theory of Computation", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "2", code: "CS3491", name: "Artificial Intelligence and Machine Learning", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "3", code: "CS3492", name: "Database Management Systems", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "4", code: "IT3401", name: "Web Essentials", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "5", code: "CS3451", name: "Introduction to Operating Systems", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "6", code: "GE3451", name: "Environmental Sciences and Sustainability", category: "BSC", lectureHours: 2, tutorialHours: 0, practicalHours: 0, totalHours: 2, credits: 2 },
    ],
  },
  {
    semester: 4,
    year: 2,
    department: "CSE",
    subjects: [
      { id: "1", code: "CS3401", name: "Algorithms", category: "PCC", lectureHours: 3, tutorialHours: 1, practicalHours: 0, totalHours: 4, credits: 4 },
      { id: "2", code: "CS3402", name: "Database Systems", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "3", code: "CS3403", name: "Operating Systems", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "4", code: "MA3401", name: "Probability and Statistics", category: "BSC", lectureHours: 3, tutorialHours: 1, practicalHours: 0, totalHours: 4, credits: 4 },
    ],
  },
  {
    semester: 3,
    year: 2,
    department: "CSE",
    subjects: [
      { id: "1", code: "CS3301", name: "Data Structures", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "2", code: "CS3302", name: "Digital Logic Design", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "3", code: "CS3303", name: "Object Oriented Programming", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
    ],
  },
  {
    semester: 5,
    year: 3,
    department: "AI&DS",
    subjects: [
      { id: "1", code: "AD3501", name: "Deep Learning", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "2", code: "AD3502", name: "Natural Language Processing", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "3", code: "AD3503", name: "Computer Vision", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
    ],
  },
  {
    semester: 4,
    year: 2,
    department: "IT",
    subjects: [
      { id: "1", code: "IT3401", name: "Web Technology", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
      { id: "2", code: "IT3402", name: "Software Engineering", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 0, totalHours: 3, credits: 3 },
      { id: "3", code: "IT3403", name: "Computer Networks", category: "PCC", lectureHours: 3, tutorialHours: 0, practicalHours: 2, totalHours: 5, credits: 4 },
    ],
  },
];

// Classes handled by the faculty
const classesHandled: ClassSubject[] = [
  { id: "1", program: "B.E - CSE", semester: "3", section: "A", subject: "Data Structures & Algorithms", subjectCode: "CS3301" },
  { id: "2", program: "B.Tech - AI&DS", semester: "4", section: "A", subject: "Computer Networks", subjectCode: "CS3591" },
  { id: "3", program: "B.Tech - IT", semester: "4", section: "B", subject: "Web Technology", subjectCode: "IT3401" },
  { id: "4", program: "B.E - CSE", semester: "5", section: "B", subject: "Machine Learning", subjectCode: "CS3501" },
  { id: "5", program: "B.Tech - AI&DS", semester: "6", section: "A", subject: "Deep Learning", subjectCode: "AD3601" },
];

// Syllabus data per class
const syllabusDataByClass: Record<string, Topic[]> = {
  "1": [
    { id: "1", name: "Introduction to Data Structures", hours: 3, completed: true },
    { id: "2", name: "Arrays and Linked Lists", hours: 6, completed: true },
    { id: "3", name: "Stacks and Queues", hours: 5, completed: true },
    { id: "4", name: "Trees and Binary Trees", hours: 8, completed: false },
    { id: "5", name: "Graphs and Traversals", hours: 8, completed: false },
    { id: "6", name: "Sorting Algorithms", hours: 6, completed: false },
  ],
  "2": [
    { id: "1", name: "Introduction to Networks", hours: 4, completed: true },
    { id: "2", name: "Physical Layer", hours: 5, completed: true },
    { id: "3", name: "Data Link Layer", hours: 6, completed: false },
    { id: "4", name: "Network Layer", hours: 8, completed: false },
    { id: "5", name: "Transport Layer", hours: 6, completed: false },
  ],
  "3": [
    { id: "1", name: "HTML5 & CSS3", hours: 6, completed: true },
    { id: "2", name: "JavaScript Fundamentals", hours: 8, completed: true },
    { id: "3", name: "React.js Basics", hours: 8, completed: true },
    { id: "4", name: "Node.js Backend", hours: 6, completed: false },
    { id: "5", name: "Database Integration", hours: 6, completed: false },
  ],
  "4": [
    { id: "1", name: "Introduction to ML", hours: 4, completed: true },
    { id: "2", name: "Supervised Learning", hours: 8, completed: false },
    { id: "3", name: "Unsupervised Learning", hours: 6, completed: false },
    { id: "4", name: "Neural Networks", hours: 8, completed: false },
  ],
  "5": [
    { id: "1", name: "Deep Learning Fundamentals", hours: 4, completed: true },
    { id: "2", name: "Convolutional Neural Networks", hours: 8, completed: false },
    { id: "3", name: "Recurrent Neural Networks", hours: 6, completed: false },
    { id: "4", name: "Transformers & Attention", hours: 8, completed: false },
  ],
};

// Materials data per class
const materialsDataByClass: Record<string, Material[]> = {
  "1": [
    { id: "1", name: "Data Structures Introduction.pdf", type: "pdf", size: "2.3 MB", visible: true, uploadDate: "2024-01-10" },
    { id: "2", name: "Arrays Deep Dive.ppt", type: "ppt", size: "5.1 MB", visible: true, uploadDate: "2024-01-12" },
    { id: "3", name: "Linked List Tutorial", type: "video", size: "45 MB", visible: false, uploadDate: "2024-01-14" },
  ],
  "2": [
    { id: "1", name: "Network Basics.pdf", type: "pdf", size: "3.2 MB", visible: true, uploadDate: "2024-01-08" },
    { id: "2", name: "OSI Model.ppt", type: "ppt", size: "4.5 MB", visible: true, uploadDate: "2024-01-10" },
  ],
  "3": [
    { id: "1", name: "HTML5 Guide.pdf", type: "pdf", size: "2.1 MB", visible: true, uploadDate: "2024-01-05" },
    { id: "2", name: "React Tutorial", type: "video", size: "120 MB", visible: true, uploadDate: "2024-01-15" },
  ],
  "4": [
    { id: "1", name: "ML Introduction.pdf", type: "pdf", size: "4.2 MB", visible: true, uploadDate: "2024-01-12" },
  ],
  "5": [
    { id: "1", name: "Deep Learning Basics.pdf", type: "pdf", size: "5.5 MB", visible: true, uploadDate: "2024-01-18" },
  ],
};

// Student marks data per class
const studentMarksDataByClass: Record<string, StudentMark[]> = {
  "1": [
    { id: "1", registerNo: "CSE001", name: "Aditya Kumar", subject: "Data Structures", internalMarks: 45, assignmentMarks: 35, totalMarks: 80, passPercentage: 80, examStatus: 'Pass' },
    { id: "2", registerNo: "CSE002", name: "Priya Sharma", subject: "Data Structures", internalMarks: 55, assignmentMarks: 38, totalMarks: 93, passPercentage: 93, examStatus: 'Pass' },
    { id: "3", registerNo: "CSE003", name: "Rahul Verma", subject: "Data Structures", internalMarks: 35, assignmentMarks: 25, totalMarks: 60, passPercentage: 60, examStatus: 'Pass' },
    { id: "4", registerNo: "CSE004", name: "Karan Malhotra", subject: "Data Structures", internalMarks: 48, assignmentMarks: 36, totalMarks: 84, passPercentage: 84, examStatus: 'Pass' },
    { id: "5", registerNo: "CSE005", name: "Neha Sharma", subject: "Data Structures", internalMarks: 52, assignmentMarks: 39, totalMarks: 91, passPercentage: 91, examStatus: 'Pass' },
    { id: "6", registerNo: "CSE006", name: "Amit Patel", subject: "Data Structures", internalMarks: 40, assignmentMarks: 32, totalMarks: 72, passPercentage: 72, examStatus: 'Pass' },
    { id: "7", registerNo: "CSE007", name: "Zara Khan", subject: "Data Structures", internalMarks: 58, assignmentMarks: 40, totalMarks: 98, passPercentage: 98, examStatus: 'Pass' },
    { id: "8", registerNo: "CSE008", name: "Vikram Singh", subject: "Data Structures", internalMarks: 44, assignmentMarks: 34, totalMarks: 78, passPercentage: 78, examStatus: 'Pass' },
    { id: "9", registerNo: "CSE009", name: "Sneha Desai", subject: "Data Structures", internalMarks: 50, assignmentMarks: 37, totalMarks: 87, passPercentage: 87, examStatus: 'Pass' },
    { id: "10", registerNo: "CSE010", name: "Rohit Kapoor", subject: "Data Structures", internalMarks: 46, assignmentMarks: 35, totalMarks: 81, passPercentage: 81, examStatus: 'Pass' },
    { id: "11", registerNo: "CSE011", name: "Anjali Gupta", subject: "Data Structures", internalMarks: 54, assignmentMarks: 39, totalMarks: 93, passPercentage: 93, examStatus: 'Pass' },
    { id: "12", registerNo: "CSE012", name: "Divya Menon", subject: "Data Structures", internalMarks: 49, assignmentMarks: 36, totalMarks: 85, passPercentage: 85, examStatus: 'Pass' },
    { id: "13", registerNo: "CSE013", name: "Arjun Nair", subject: "Data Structures", internalMarks: 41, assignmentMarks: 31, totalMarks: 72, passPercentage: 72, examStatus: 'Pass' },
    { id: "14", registerNo: "CSE014", name: "Pooja Singh", subject: "Data Structures", internalMarks: 53, assignmentMarks: 38, totalMarks: 91, passPercentage: 91, examStatus: 'Pass' },
    { id: "15", registerNo: "CSE015", name: "Nikhil Reddy", subject: "Data Structures", internalMarks: 47, assignmentMarks: 35, totalMarks: 82, passPercentage: 82, examStatus: 'Pass' },
    { id: "16", registerNo: "CSE016", name: "Swati Iyer", subject: "Data Structures", internalMarks: 56, assignmentMarks: 40, totalMarks: 96, passPercentage: 96, examStatus: 'Pass' },
    { id: "17", registerNo: "CSE017", name: "Harsh Verma", subject: "Data Structures", internalMarks: 38, assignmentMarks: 30, totalMarks: 68, passPercentage: 68, examStatus: 'Pass' },
    { id: "18", registerNo: "CSE018", name: "Sakshi Bhat", subject: "Data Structures", internalMarks: 51, assignmentMarks: 37, totalMarks: 88, passPercentage: 88, examStatus: 'Pass' },
    { id: "19", registerNo: "CSE019", name: "Siddharth Roy", subject: "Data Structures", internalMarks: 45, assignmentMarks: 34, totalMarks: 79, passPercentage: 79, examStatus: 'Pass' },
    { id: "20", registerNo: "CSE020", name: "Isha Pandey", subject: "Data Structures", internalMarks: 57, assignmentMarks: 39, totalMarks: 96, passPercentage: 96, examStatus: 'Pass' },
    { id: "21", registerNo: "CSE021", name: "Yash Agarwal", subject: "Data Structures", internalMarks: 42, assignmentMarks: 33, totalMarks: 75, passPercentage: 75, examStatus: 'Pass' },
    { id: "22", registerNo: "CSE022", name: "Priya Nair", subject: "Data Structures", internalMarks: 55, assignmentMarks: 38, totalMarks: 93, passPercentage: 93, examStatus: 'Pass' },
    { id: "23", registerNo: "CSE023", name: "Aryan Sharma", subject: "Data Structures", internalMarks: 48, assignmentMarks: 36, totalMarks: 84, passPercentage: 84, examStatus: 'Pass' },
    { id: "24", registerNo: "CSE024", name: "Ritika Jain", subject: "Data Structures", internalMarks: 50, assignmentMarks: 37, totalMarks: 87, passPercentage: 87, examStatus: 'Pass' },
    { id: "25", registerNo: "CSE025", name: "Varun Chopra", subject: "Data Structures", internalMarks: 47, assignmentMarks: 35, totalMarks: 82, passPercentage: 82, examStatus: 'Pass' },
    { id: "26", registerNo: "CSE026", name: "Anushka Roy", subject: "Data Structures", internalMarks: 54, assignmentMarks: 39, totalMarks: 93, passPercentage: 93, examStatus: 'Pass' },
    { id: "27", registerNo: "CSE027", name: "Dhruv Patel", subject: "Data Structures", internalMarks: 43, assignmentMarks: 33, totalMarks: 76, passPercentage: 76, examStatus: 'Pass' },
    { id: "28", registerNo: "CSE028", name: "Mehira Singh", subject: "Data Structures", internalMarks: 52, assignmentMarks: 38, totalMarks: 90, passPercentage: 90, examStatus: 'Pass' },
    { id: "29", registerNo: "CSE029", name: "Kabir Malhotra", subject: "Data Structures", internalMarks: 46, assignmentMarks: 34, totalMarks: 80, passPercentage: 80, examStatus: 'Pass' },
    { id: "30", registerNo: "CSE030", name: "Sarika Desai", subject: "Data Structures", internalMarks: 58, assignmentMarks: 40, totalMarks: 98, passPercentage: 98, examStatus: 'Pass' },
    { id: "31", registerNo: "CSE031", name: "Tanvi Kapoor", subject: "Data Structures", internalMarks: 44, assignmentMarks: 34, totalMarks: 78, passPercentage: 78, examStatus: 'Pass' },
    { id: "32", registerNo: "CSE032", name: "Manish Gupta", subject: "Data Structures", internalMarks: 49, assignmentMarks: 36, totalMarks: 85, passPercentage: 85, examStatus: 'Pass' },
    { id: "33", registerNo: "CSE033", name: "Avni Reddy", subject: "Data Structures", internalMarks: 51, assignmentMarks: 37, totalMarks: 88, passPercentage: 88, examStatus: 'Pass' },
    { id: "34", registerNo: "CSE034", name: "Sanjay Iyer", subject: "Data Structures", internalMarks: 47, assignmentMarks: 35, totalMarks: 82, passPercentage: 82, examStatus: 'Pass' },
    { id: "35", registerNo: "CSE035", name: "Nisha Verma", subject: "Data Structures", internalMarks: 55, assignmentMarks: 39, totalMarks: 94, passPercentage: 94, examStatus: 'Pass' },
    { id: "36", registerNo: "CSE036", name: "Ravi Bhat", subject: "Data Structures", internalMarks: 40, assignmentMarks: 32, totalMarks: 72, passPercentage: 72, examStatus: 'Pass' },
    { id: "37", registerNo: "CSE037", name: "Kavya Singh", subject: "Data Structures", internalMarks: 53, assignmentMarks: 38, totalMarks: 91, passPercentage: 91, examStatus: 'Pass' },
    { id: "38", registerNo: "CSE038", name: "Aman Chopra", subject: "Data Structures", internalMarks: 48, assignmentMarks: 36, totalMarks: 84, passPercentage: 84, examStatus: 'Pass' },
    { id: "39", registerNo: "CSE039", name: "Diya Pandey", subject: "Data Structures", internalMarks: 56, assignmentMarks: 39, totalMarks: 95, passPercentage: 95, examStatus: 'Pass' },
    { id: "40", registerNo: "CSE040", name: "Vikrant Roy", subject: "Data Structures", internalMarks: 45, assignmentMarks: 34, totalMarks: 79, passPercentage: 79, examStatus: 'Pass' },
    { id: "41", registerNo: "CSE041", name: "Shreya Agarwal", subject: "Data Structures", internalMarks: 50, assignmentMarks: 37, totalMarks: 87, passPercentage: 87, examStatus: 'Pass' },
    { id: "42", registerNo: "CSE042", name: "Nitin Jain", subject: "Data Structures", internalMarks: 47, assignmentMarks: 35, totalMarks: 82, passPercentage: 82, examStatus: 'Pass' },
    { id: "43", registerNo: "CSE043", name: "Esha Nair", subject: "Data Structures", internalMarks: 54, assignmentMarks: 39, totalMarks: 93, passPercentage: 93, examStatus: 'Pass' },
    { id: "44", registerNo: "CSE044", name: "Vivek Sharma", subject: "Data Structures", internalMarks: 41, assignmentMarks: 31, totalMarks: 72, passPercentage: 72, examStatus: 'Pass' },
    { id: "45", registerNo: "CSE045", name: "Mira Kapoor", subject: "Data Structures", internalMarks: 52, assignmentMarks: 38, totalMarks: 90, passPercentage: 90, examStatus: 'Pass' },
    { id: "46", registerNo: "CSE046", name: "Ashok Patel", subject: "Data Structures", internalMarks: 46, assignmentMarks: 34, totalMarks: 80, passPercentage: 80, examStatus: 'Pass' },
    { id: "47", registerNo: "CSE047", name: "Sarita Desai", subject: "Data Structures", internalMarks: 57, assignmentMarks: 40, totalMarks: 97, passPercentage: 97, examStatus: 'Pass' },
    { id: "48", registerNo: "CSE048", name: "Gaurav Gupta", subject: "Data Structures", internalMarks: 44, assignmentMarks: 33, totalMarks: 77, passPercentage: 77, examStatus: 'Pass' },
    { id: "49", registerNo: "CSE049", name: "Olivia D'Souza", subject: "Data Structures", internalMarks: 49, assignmentMarks: 36, totalMarks: 85, passPercentage: 85, examStatus: 'Pass' },
    { id: "50", registerNo: "CSE050", name: "Fahad Rahman", subject: "Data Structures", internalMarks: 56, assignmentMarks: 40, totalMarks: 96, passPercentage: 96, examStatus: 'Pass' },
  ],
  "2": [
    { id: "1", registerNo: "AD001", name: "Sneha Patel", subject: "DBMS", internalMarks: 50, assignmentMarks: 32, totalMarks: 82, passPercentage: 82, examStatus: 'Pass' },
    { id: "2", registerNo: "AD002", name: "Vikram Singh", subject: "DBMS", internalMarks: 40, assignmentMarks: 25, totalMarks: 65, passPercentage: 65, examStatus: 'Pass' },
  ],
  "3": [
    { id: "1", registerNo: "IT001", name: "Ananya Rao", subject: "Algorithms", internalMarks: 58, assignmentMarks: 38, totalMarks: 96, passPercentage: 96, examStatus: 'Pass' },
    { id: "2", registerNo: "IT002", name: "Karthik Nair", subject: "Algorithms", internalMarks: 35, assignmentMarks: 28, totalMarks: 63, passPercentage: 63, examStatus: 'Pass' },
  ],
  "4": [
    { id: "1", registerNo: "CSE101", name: "Meera Iyer", subject: "Introduction to Operating Systems", internalMarks: 48, assignmentMarks: 35, totalMarks: 83, passPercentage: 83, examStatus: 'Pass' },
  ],
  "5": [
    { id: "1", registerNo: "AD101", name: "Arjun Menon", subject: "Theory of Computation & Discrete Mathematics", internalMarks: 49, assignmentMarks: 36, totalMarks: 85, passPercentage: 85, examStatus: 'Pass' },
  ],
};

const typeIcons = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

export default function Academics() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const [selectedClassId, setSelectedClassId] = useState(classesHandled[0].id);
  const [topicsData, setTopicsData] = useState<Record<string, Topic[]>>(syllabusDataByClass);
  const [materialsData, setMaterialsData] = useState<Record<string, Material[]>>(materialsDataByClass);
  const [marksData, setMarksData] = useState<Record<string, StudentMark[]>>(studentMarksDataByClass);
  const [lockedClasses, setLockedClasses] = useState<Record<string, boolean>>({});

  // Credits filter states
  const [creditsDepartment, setCreditsDepartment] = useState<string>("CSE");
  const [creditsYear, setCreditsYear] = useState<string>("3");
  const [creditsSemester, setCreditsSemester] = useState<string>("5");

  // Course file states
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [courseFileUrl, setCourseFileUrl] = useState<string | null>(null);
  const [isFileSent, setIsFileSent] = useState<boolean>(false);

  // Share to external platforms states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [showBothModal, setShowBothModal] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    subjectName: "",
    materialType: "",
    materialTitle: "",
    materialDescription: "",
    materialSource: "upload",
    linkUrl: "",
    targetPlatform: "google"
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedClass = classesHandled.find(c => c.id === selectedClassId)!;
  const topics = topicsData[selectedClassId] || [];
  const materials = materialsData[selectedClassId] || [];
  const allMarks = marksData[selectedClassId] || [];
  const marks = allMarks;
  const isLocked = lockedClasses[selectedClassId] || false;

  // Get filtered credits data
  const filteredCredits = creditsData.find(
    (c) => c.department === creditsDepartment && c.year === parseInt(creditsYear) && c.semester === parseInt(creditsSemester)
  );
  const totalCredits = filteredCredits?.subjects.reduce((acc, s) => acc + s.credits, 0) || 0;
  const totalContactHours = filteredCredits?.subjects.reduce((acc, s) => acc + s.totalHours, 0) || 0;

  const completedTopics = topics.filter((t) => t.completed).length;
  const totalHours = topics.reduce((acc, t) => acc + t.hours, 0);
  const completedHours = topics.filter((t) => t.completed).reduce((acc, t) => acc + t.hours, 0);
  const progressPercentage = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  const toggleTopic = (id: string) => {
    setTopicsData((prev) => ({
      ...prev,
      [selectedClassId]: prev[selectedClassId].map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const toggleVisibility = (id: string) => {
    setMaterialsData((prev) => ({
      ...prev,
      [selectedClassId]: prev[selectedClassId].map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    }));
  };

  const lockMarks = () => {
    setLockedClasses((prev) => ({
      ...prev,
      [selectedClassId]: true,
    }));
  };

  const handleOpenGoogleModal = () => {
    setMaterialFormData({
      ...materialFormData,
      subjectName: selectedClass.subject,
      targetPlatform: "google"
    });
    setShowGoogleModal(true);
  };

  const handleOpenCanvasModal = () => {
    setMaterialFormData({
      ...materialFormData,
      subjectName: selectedClass.subject,
      targetPlatform: "canvas"
    });
    setShowCanvasModal(true);
  };

  const handleOpenBothModal = () => {
    setMaterialFormData({
      ...materialFormData,
      subjectName: selectedClass.subject,
      targetPlatform: "both"
    });
    setShowBothModal(true);
  };

  const validateMaterialForm = () => {
    if (!materialFormData.subjectName.trim()) return "Subject Name is required";
    if (!materialFormData.materialType) return "Material Type is required";
    if (!materialFormData.materialTitle.trim()) return "Material Title is required";
    if (materialFormData.materialSource === "link" && !materialFormData.linkUrl.trim()) {
      return "Link URL is required";
    }
    return null;
  };

  const handleShareMaterial = (platform: string) => {
    const error = validateMaterialForm();
    if (error) {
      alert(error);
      return;
    }

    const platformText = platform === "google" ? "Google Classroom" :
      platform === "canvas" ? "Canvas LMS" : "Google Classroom and Canvas";

    setSuccessMessage(`Study material shared successfully!\nSubject: ${materialFormData.subjectName}\nPlatform: ${platformText}`);

    if (platform === "google") setShowGoogleModal(false);
    if (platform === "canvas") setShowCanvasModal(false);
    if (platform === "both") setShowBothModal(false);

    setMaterialFormData({
      subjectName: "",
      materialType: "",
      materialTitle: "",
      materialDescription: "",
      materialSource: "upload",
      linkUrl: "",
      targetPlatform: "google"
    });

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const calculateInternal100 = (student: StudentMark) => {
    return student.internalMarks + student.assignmentMarks;
  };

  const calculateExamStatus = (student: StudentMark) => {
    return student.totalMarks >= student.passPercentage ? 'Pass' : 'Fail';
  };

  const updateStudentMark = (studentId: string, field: keyof StudentMark, value: string | number) => {
    setMarksData(prev => ({
      ...prev,
      [selectedClassId]: prev[selectedClassId].map(student => {
        if (student.id === studentId) {
          const updatedStudent = { ...student, [field]: value };

          // Auto-calculate Total Marks when internalMarks or assignmentMarks change
          if (field === 'internalMarks' || field === 'assignmentMarks') {
            updatedStudent.totalMarks = updatedStudent.internalMarks + updatedStudent.assignmentMarks;
          }

          // Auto-calculate Pass Percentage and Exam Status based on Total Marks
          if (field === 'internalMarks' || field === 'assignmentMarks') {
            updatedStudent.passPercentage = updatedStudent.totalMarks;
            updatedStudent.examStatus = updatedStudent.totalMarks >= 40 ? 'Pass' : 'Fail';
          }

          return updatedStudent;
        }
        return student;
      })
    }));
  };

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Academic Activities</h1>
          <p className="text-muted-foreground -mt-4">
            Manage syllabus, materials, and internal marks for your classes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <IntegratedNotificationBell />
        </div>
      </motion.div>

      {/* Class Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="widget-card mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Select Class</p>
              <p className="font-semibold text-foreground">Choose a class to manage</p>
            </div>
          </div>
          <div className="flex-1 md:max-w-md">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classesHandled.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      <span>{cls.program} - Sem {cls.semester} - Sec {cls.section}</span>
                      <Badge variant="outline" className="ml-2">{cls.subjectCode}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Class Info */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Program</p>
              <p className="font-semibold text-foreground">{selectedClass.program}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Semester / Section</p>
              <p className="font-semibold text-foreground">Sem {selectedClass.semester} - Sec {selectedClass.section}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subject Code</p>
              <p className="font-semibold text-secondary">{selectedClass.subjectCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subject Name</p>
              <p className="font-semibold text-foreground">{selectedClass.subject}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="syllabus" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="syllabus" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            Study Materials
          </TabsTrigger>

          <TabsTrigger value="coursefile" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Course File
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="syllabus">
          {/* Subject Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {selectedClass.subject}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedClass.program} • Semester {selectedClass.semester} • Section {selectedClass.section}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 hover:border-primary/30 transition-colors">
                  <p className="text-3xl font-bold text-primary mb-1">
                    {completedTopics}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Topics Completed</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-3xl font-bold text-muted-foreground mb-1">
                    {topics.length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Topics</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 hover:border-secondary/30 transition-colors">
                  <p className="text-3xl font-bold text-secondary mb-1">
                    {completedHours}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hours Covered</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-3xl font-bold text-muted-foreground mb-1">
                    {totalHours}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Hours</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coverage Analytics Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card mb-6"
          >
            <h3 className="section-title mb-6">Syllabus Coverage Analytics</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'Completed', value: progressPercentage, color: 'url(#completedGradient)' },
                          { name: 'Remaining', value: 100 - progressPercentage, color: 'url(#remainingGradient)' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={130}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {[
                          { name: 'Completed', value: progressPercentage, color: 'url(#completedGradient)' },
                          { name: 'Remaining', value: 100 - progressPercentage, color: 'url(#remainingGradient)' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={3} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-6xl font-bold bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent mb-2">
                        {Math.round(progressPercentage)}%
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Coverage
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completedTopics} of {topics.length} topics
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                      <span className="text-muted-foreground">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <span className="text-muted-foreground">Remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Panel */}
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Progress Status</span>
                    <Badge className={cn(
                      "font-semibold",
                      progressPercentage >= 75 ? "bg-success/20 text-success border-success/30" :
                        progressPercentage >= 50 ? "bg-warning/20 text-warning border-warning/30" :
                          "bg-destructive/20 text-destructive border-destructive/30"
                    )} variant="outline">
                      {progressPercentage >= 75 ? "On Track" : progressPercentage >= 50 ? "In Progress" : "Behind Schedule"}
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progressPercentage)}% of syllabus completed
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success/5 rounded-xl border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{completedTopics}</p>
                    <p className="text-xs text-muted-foreground mt-1">{completedHours} hours</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase">Remaining</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{topics.length - completedTopics}</p>
                    <p className="text-xs text-muted-foreground mt-1">{totalHours - completedHours} hours</p>
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Completion Rate</span>
                    <span className="text-lg font-bold text-secondary">
                      {topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Topics per week (avg)</span>
                      <span className="font-medium text-foreground">
                        {(completedTopics / Math.max(1, Math.ceil(completedHours / 7))).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hours per topic (avg)</span>
                      <span className="font-medium text-foreground">
                        {completedTopics > 0 ? (completedHours / completedTopics).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Topics List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card"
          >
            <h3 className="section-title">Syllabus Topics</h3>
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer",
                    topic.completed
                      ? "bg-success/5 border-success/30"
                      : "bg-muted/30 border-border hover:border-primary/30"
                  )}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox checked={topic.completed} />
                    <div>
                      <p className={cn(
                        "font-medium",
                        topic.completed && "text-success"
                      )}>
                        {topic.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{topic.hours} hours</p>
                    </div>
                  </div>
                  {topic.completed && (
                    <Check className="w-5 h-5 text-success" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="materials">
          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-success" />
              <p className="text-success font-medium">{successMessage}</p>
            </motion.div>
          )}

          {/* Share Study Materials Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <h3 className="section-title flex items-center gap-2 mb-6">
              <Send className="w-5 h-5 text-secondary" />
              Share Study Materials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 py-6 h-auto hover:border-blue-500 hover:text-blue-500 transition-all"
                onClick={handleOpenGoogleModal}
              >
                <Send className="w-6 h-6" />
                <span className="text-sm font-medium text-center">Share to Google Classroom</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 py-6 h-auto hover:border-orange-500 hover:text-orange-500 transition-all"
                onClick={handleOpenCanvasModal}
              >
                <Send className="w-6 h-6" />
                <span className="text-sm font-medium text-center">Share to Canvas LMS</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 py-6 h-auto hover:border-purple-500 hover:text-purple-500 transition-all"
                onClick={handleOpenBothModal}
              >
                <Send className="w-6 h-6" />
                <span className="text-sm font-medium text-center">Send to Both</span>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              Share links to study materials hosted on Google Drive, YouTube, or other external platforms
            </p>
          </motion.div>

          {/* Google Classroom Modal */}
          {showGoogleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowGoogleModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background border border-border rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Share to Google Classroom</h3>
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Subject Name
                      </label>
                      <Input
                        value={materialFormData.subjectName}
                        onChange={(e) => setMaterialFormData({ ...materialFormData, subjectName: e.target.value })}
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Material Type
                      </label>
                      <Select value={materialFormData.materialType} onValueChange={(value) => setMaterialFormData({ ...materialFormData, materialType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="ppt">PPT</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Video Link</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="reference">Reference Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.materialTitle}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialTitle: e.target.value })}
                      placeholder="e.g., Unit 3 Trees Notes"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Description (Optional)
                    </label>
                    <textarea
                      value={materialFormData.materialDescription}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialDescription: e.target.value })}
                      placeholder="Add description for your material..."
                      className="w-full p-3 border border-border rounded-lg bg-muted/50 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Link <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.linkUrl}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, linkUrl: e.target.value })}
                      placeholder="Paste Google Classroom / Drive / YouTube link"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter links to materials hosted on Google Drive, YouTube, Canvas, or other external platforms
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowGoogleModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleShareMaterial("google")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Share Material
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Canvas Modal */}
          {showCanvasModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCanvasModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background border border-border rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Share to Canvas LMS</h3>
                  <button
                    onClick={() => setShowCanvasModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Subject Name
                      </label>
                      <Input
                        value={materialFormData.subjectName}
                        onChange={(e) => setMaterialFormData({ ...materialFormData, subjectName: e.target.value })}
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Material Type
                      </label>
                      <Select value={materialFormData.materialType} onValueChange={(value) => setMaterialFormData({ ...materialFormData, materialType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="ppt">PPT</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Video Link</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="reference">Reference Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.materialTitle}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialTitle: e.target.value })}
                      placeholder="e.g., Unit 3 Trees Notes"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Description (Optional)
                    </label>
                    <textarea
                      value={materialFormData.materialDescription}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialDescription: e.target.value })}
                      placeholder="Add description for your material..."
                      className="w-full p-3 border border-border rounded-lg bg-muted/50 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Link <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.linkUrl}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, linkUrl: e.target.value })}
                      placeholder="Paste Canvas / Drive / YouTube link"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter links to materials hosted on Google Drive, YouTube, Canvas, or other external platforms
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCanvasModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleShareMaterial("canvas")}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Share Material
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Both Platforms Modal */}
          {showBothModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBothModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background border border-border rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Share to Both Platforms</h3>
                  <button
                    onClick={() => setShowBothModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Subject Name
                      </label>
                      <Input
                        value={materialFormData.subjectName}
                        onChange={(e) => setMaterialFormData({ ...materialFormData, subjectName: e.target.value })}
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        Material Type
                      </label>
                      <Select value={materialFormData.materialType} onValueChange={(value) => setMaterialFormData({ ...materialFormData, materialType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="ppt">PPT</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="video">Video Link</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="reference">Reference Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.materialTitle}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialTitle: e.target.value })}
                      placeholder="e.g., Unit 3 Trees Notes"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Description (Optional)
                    </label>
                    <textarea
                      value={materialFormData.materialDescription}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, materialDescription: e.target.value })}
                      placeholder="Add description for your material..."
                      className="w-full p-3 border border-border rounded-lg bg-muted/50 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:border-primary"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Material Link <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={materialFormData.linkUrl}
                      onChange={(e) => setMaterialFormData({ ...materialFormData, linkUrl: e.target.value })}
                      placeholder="Paste Google Classroom / Canvas / Drive / YouTube link"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter links to materials hosted on Google Drive, YouTube, Canvas, or other external platforms
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowBothModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleShareMaterial("both")}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Share to Both
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Materials List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="widget-card"
          >
            <h3 className="section-title">Uploaded Materials for {selectedClass.subject}</h3>
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No materials uploaded yet for this class
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material, index) => {
                  const Icon = typeIcons[material.type];
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          material.type === "pdf" && "bg-destructive/10",
                          material.type === "ppt" && "bg-warning/10",
                          material.type === "video" && "bg-secondary/10"
                        )}>
                          <Icon className={cn(
                            "w-5 h-5",
                            material.type === "pdf" && "text-destructive",
                            material.type === "ppt" && "text-warning",
                            material.type === "video" && "text-secondary"
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{material.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {material.size} {material.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {material.visible ? (
                            <Eye className="w-4 h-4 text-success" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                          <Switch
                            checked={material.visible}
                            onCheckedChange={() => toggleVisibility(material.id)}
                          />
                        </div>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="marks">
          {/* Lock Banner */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <Lock className="w-5 h-5 text-warning" />
              <p className="text-sm text-warning font-medium">
                Marks have been locked and submitted to Controller of Exams for {selectedClass.subject}
              </p>
            </motion.div>
          )}

          {/* Marks Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title mb-0">Internal Marks Entry - {selectedClass.subject}</h3>
                <p className="text-xs text-muted-foreground">
                  Enter student marks and assessment details
                </p>
              </div>
              <Button
                className={isLocked ? "bg-muted" : "bg-primary hover:bg-primary/90"}
                disabled={isLocked}
                onClick={lockMarks}
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock Marks
              </Button>
            </div>

            {marks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found for this class
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Register No</th>
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Student Name</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Internal Assessment Marks (60)</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Assignment Marks (40)</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Total Marks (100)</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Pass Percentage (%)</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Exam Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <Input
                            type="text"
                            value={student.registerNo}
                            onChange={(e) => updateStudentMark(student.id, 'registerNo', e.target.value)}
                            className="w-20 text-center mx-auto font-mono"
                            disabled={isLocked}
                          />
                        </td>
                        <td className="p-3 text-sm font-medium">{student.name}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={student.internalMarks}
                            onChange={(e) => updateStudentMark(student.id, 'internalMarks', parseInt(e.target.value) || 0)}
                            className={`w-16 text-center mx-auto ${student.internalMarks > 60 || student.internalMarks < 0 ? 'border-red-500 text-red-600' : ''}`}
                            disabled={isLocked}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={student.assignmentMarks}
                            onChange={(e) => updateStudentMark(student.id, 'assignmentMarks', parseInt(e.target.value) || 0)}
                            className={`w-16 text-center mx-auto ${student.assignmentMarks > 40 || student.assignmentMarks < 0 ? 'border-red-500 text-red-600' : ''}`}
                            disabled={isLocked}
                          />
                        </td>
                        <td className="p-3 text-center font-semibold bg-muted/50 rounded">
                          {student.totalMarks}
                        </td>
                        <td className="p-3 text-center font-semibold bg-muted/50 rounded">
                          {student.passPercentage}%
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            className={`mx-auto ${student.examStatus === 'Pass'
                              ? 'bg-success/20 text-success border border-success/30'
                              : 'bg-destructive/20 text-destructive border border-destructive/30'
                              }`}
                            variant="outline"
                          >
                            {student.examStatus}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="coursefile">
          {/* Course File Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Course File</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage course file for {selectedClass.subject}
                  </p>
                </div>
              </div>
              {isFileSent && (
                <Badge className="bg-success/10 text-success border-success/30">
                  <Check className="w-3 h-3 mr-1" /> Sent to HOD
                </Badge>
              )}
            </div>

            {!courseFile ? (
              /* Upload Area */
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <FileIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-foreground mb-2">
                  Upload Course File (PDF)
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your PDF file here or click to browse
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type === "application/pdf") {
                        setCourseFile(file);
                        setCourseFileUrl(URL.createObjectURL(file));
                        setIsFileSent(false);
                      }
                    }}
                  />
                  <Button variant="outline" className="pointer-events-none">
                    <Upload className="w-4 h-4 mr-2" />
                    Select PDF File
                  </Button>
                </label>
              </div>
            ) : (
              /* PDF Viewer and Actions */
              <div className="space-y-4">
                {/* File Info Bar */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <FileText className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{courseFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(courseFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            if (courseFileUrl) URL.revokeObjectURL(courseFileUrl);
                            setCourseFile(file);
                            setCourseFileUrl(URL.createObjectURL(file));
                            setIsFileSent(false);
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update
                      </Button>
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (courseFileUrl) URL.revokeObjectURL(courseFileUrl);
                        setCourseFile(null);
                        setCourseFileUrl(null);
                        setIsFileSent(false);
                      }}
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
                  <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">PDF Preview</span>
                  </div>
                  <div className="h-[500px]">
                    {courseFileUrl && (
                      <iframe
                        src={courseFileUrl}
                        className="w-full h-full"
                        title="Course File PDF Preview"
                      />
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    className={cn(
                      "min-w-[140px]",
                      isFileSent
                        ? "bg-success hover:bg-success/90"
                        : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={() => setIsFileSent(true)}
                    disabled={isFileSent}
                  >
                    {isFileSent ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to HOD
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="credits">
          {/* Credits Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filter Credits</p>
                  <p className="font-semibold text-foreground">Select Department, Year & Semester</p>
                </div>
              </div>
              <div className="flex flex-1 gap-3 flex-wrap md:flex-nowrap">
                <Select value={creditsDepartment} onValueChange={setCreditsDepartment}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="AI&DS">AI&DS</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={creditsYear} onValueChange={setCreditsYear}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={creditsSemester} onValueChange={setCreditsSemester}>
                  <SelectTrigger className="w-full md:w-36">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Credits Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="widget-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subjects</p>
                  <p className="text-2xl font-bold text-primary">{filteredCredits?.subjects.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="widget-card bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Hours/Week</p>
                  <p className="text-2xl font-bold text-success">{totalContactHours}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subjects Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="widget-card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title mb-0">
                  {creditsDepartment} - Year {creditsYear} - Semester {creditsSemester}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-muted-foreground">L = Lecture</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-muted-foreground">T = Tutorial</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-muted-foreground">P = Practical</span>
                  </span>

                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {filteredCredits?.subjects.length || 0} Subjects
              </Badge>
            </div>

            {!filteredCredits || filteredCredits.subjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No subjects found</p>
                <p className="text-sm">Try selecting a different department, year, or semester</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">S.No</th>
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Code</th>
                      <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Subject Name</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Category</th>
                      <th className="text-center p-3 text-sm font-semibold text-blue-500">L</th>
                      <th className="text-center p-3 text-sm font-semibold text-amber-500">T</th>
                      <th className="text-center p-3 text-sm font-semibold text-emerald-500">P</th>
                      <th className="text-center p-3 text-sm font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCredits.subjects.map((subject, index) => (
                      <motion.tr
                        key={subject.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="p-3 text-sm font-mono text-secondary">{subject.code}</td>
                        <td className="p-3 text-sm font-medium">{subject.name}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              subject.category === "PCC" && "border-primary/50 text-primary bg-primary/5",
                              subject.category === "BSC" && "border-success/50 text-success bg-success/5",
                              subject.category === "ESC" && "border-warning/50 text-warning bg-warning/5",
                              subject.category === "HSMC" && "border-secondary/50 text-secondary bg-secondary/5"
                            )}
                          >
                            {subject.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-center">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium rounded">
                            {subject.lectureHours}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-center">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium rounded">
                            {subject.tutorialHours}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium rounded">
                            {subject.practicalHours}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-center font-medium">{subject.totalHours}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-semibold">
                      <td colSpan={4} className="p-3 text-right text-sm">Total:</td>
                      <td className="p-3 text-center text-sm">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium rounded">
                          {filteredCredits.subjects.reduce((acc, s) => acc + s.lectureHours, 0)}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium rounded">
                          {filteredCredits.subjects.reduce((acc, s) => acc + s.tutorialHours, 0)}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium rounded">
                          {filteredCredits.subjects.reduce((acc, s) => acc + s.practicalHours, 0)}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm">{totalContactHours}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}


