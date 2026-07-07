import { useState, useEffect, useRef } from "react";
import { toast } from "@/pages/faculty/hooks/use-toast";
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
  Download,
  Plus,
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
  X,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
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
  assignment_id: number;
  faculty_id: number;
  subject_id: number;
  class_id: number;
  program: string;
  semester: string;
  section: string;
  subject: string;
  subjectCode: string;
  className: string;
  batch: string;
}

interface Topic {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
  unit_label?: string;
  coverage_status?: 'completed' | 'deviation' | null;
  deviation_reason?: string | null;
  periods_taken?: number;
  periods_required?: number;
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

interface CourseLessonPlan {
  id: number;
  sno: number;
  unit_label?: string;
  topic: string;
  co_number?: string;
  btl?: string;
  delivery_mode?: string;
  reference_book?: string;
  periods_required: number;
  periods_taken: number;
  cumulative_periods: number;
  is_completed: boolean;
  tentative_date?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  approved_by?: number;
  approved_date?: string;
  approval_remarks?: string;
  coverage_status?: string | null;
  deviation_reason?: string | null;
}

// API fetch helper
const apiFetch = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  return res.json();
};

const typeIcons = {
  pdf: FileText,
  ppt: Presentation,
  video: Video,
};

export default function Academics() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fetchedCreditsData, setFetchedCreditsData] = useState<SemesterCredits[]>([]);
  const [fetchedClassesHandled, setFetchedClassesHandled] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch faculty's assigned subjects and classes
  useEffect(() => {
    const fetchAcademicsData = async () => {
      try {
        setIsLoading(true);
        // Fetch subjects and classes data
        const [subjectsRes, classesRes] = await Promise.all([
          apiFetch('/api/v1/faculty/academics/my-subjects'),
          apiFetch('/api/v1/faculty/academics/my-classes')
        ]);

        if (subjectsRes.success && subjectsRes.grouped) {
          setFetchedCreditsData(subjectsRes.grouped);
        }

        if (classesRes.success && classesRes.data) {
          setFetchedClassesHandled(classesRes.data);
        }
      } catch (error) {
        console.error('Error fetching academics data:', error);
        // Fallback to empty data if API fails
        setFetchedCreditsData([]);
        setFetchedClassesHandled([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademicsData();
  }, []);

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

  const groupTopicsByUnit = (topics: Topic[]) => {
    const grouped: { [key: string]: Topic[] } = {};
    topics.forEach(topic => {
      const unitLabel = topic.unit_label || 'Unassigned';
      if (!grouped[unitLabel]) {
        grouped[unitLabel] = [];
      }
      grouped[unitLabel].push(topic);
    });
    return Object.entries(grouped).sort((a, b) => {
      const aNum = parseInt(a[0].match(/\d+/)?.[0] || '999');
      const bNum = parseInt(b[0].match(/\d+/)?.[0] || '999');
      return aNum - bNum;
    });
  };

  const toggleUnit = (classId: string, unit: string) => {
    const key = `${classId}-${unit}`;
    setExpandedUnits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Initialize selectedClassId when classes data is loaded
  useEffect(() => {
    if (fetchedClassesHandled.length > 0 && !selectedClassId) {
      setSelectedClassId(fetchedClassesHandled[0].id);
    }
  }, [fetchedClassesHandled, selectedClassId]);
  const [topicsData, setTopicsData] = useState<Record<string, Topic[]>>({});
  const [materialsData, setMaterialsData] = useState<Record<string, Material[]>>({});
  const [marksData, setMarksData] = useState<Record<string, StudentMark[]>>({});
  const [lockedClasses, setLockedClasses] = useState<Record<string, boolean>>({});
  const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});

  // Credits filter states - Initialize based on fetched data
  const [creditsDepartment, setCreditsDepartment] = useState<string>("");
  const [creditsYear, setCreditsYear] = useState<string>("");
  const [creditsSemester, setCreditsSemester] = useState<string>("");

  // Initialize filter states when fetched data changes
  useEffect(() => {
    if (fetchedCreditsData.length > 0 && !creditsDepartment) {
      const firstDept = fetchedCreditsData[0];
      setCreditsDepartment(firstDept.department);
      setCreditsYear(firstDept.year ? firstDept.year.toString() : '');
      setCreditsSemester(firstDept.semester ? firstDept.semester.toString() : '');
    }
  }, [fetchedCreditsData, creditsDepartment]);

  // Compute selectedClass from selectedClassId early (before useEffect that uses it)
  const selectedClass = (fetchedClassesHandled.find(c => c.id === selectedClassId) || fetchedClassesHandled[0] || {
    id: "",
    assignment_id: 0,
    faculty_id: 0,
    subject_id: 0,
    class_id: 0,
    program: "",
    semester: "",
    section: "",
    subject: "",
    subjectCode: "",
    className: "",
    batch: ""
  }) as ClassSubject;

  // Helper function to get the default academic year (consistent with backend)
  const getDefaultAcademicYear = (): string => {
    // If selectedClass has a batch, use it
    if (selectedClass?.batch) {
      return selectedClass.batch;
    }
    // Otherwise generate based on current year
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  // Load course lesson plans when class is selected
  const loadCoursePlans = async () => {
    if (!selectedClassId || !selectedClass?.id || !selectedClass.class_id || !selectedClass.subject_id) {
      console.warn('Course plans load skipped: missing class/subject information', { selectedClassId, selectedClass });
      return;
    }

    try {
      setLoadingPlans(true);
      // Ensure semester is a number, not a string
      const semesterParam = parseInt(String(selectedClass.semester || 1), 10);
      const academicYearParam = getDefaultAcademicYear();

      // Faculty can see their own pending + approved plans
      const url = `/api/v1/faculty/academics/course-plans?subjectId=${selectedClass.subject_id}&classId=${selectedClass.class_id}&facultyId=${selectedClass.faculty_id}&academicYear=${encodeURIComponent(academicYearParam)}&semester=${semesterParam}&includePending=true`;

      console.log('📚 Loading course plans with:', {
        subjectId: selectedClass.subject_id,
        classId: selectedClass.class_id,
        facultyId: selectedClass.faculty_id,
        academicYear: academicYearParam,
        semester: semesterParam,
        includePending: true,
        url
      });

      const response = await apiFetch(url);

      console.log('📚 Course plans response:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Found', response.data.length, 'course plans');
        setCoursePlans(response.data);

        // Show ALL topics from course_lesson_plans regardless of approval status
        const syllabusTopics = response.data
          .map((plan: CourseLessonPlan) => ({
            id: `${plan.id}`,
            name: plan.topic,
            hours: plan.periods_required || 1,
            completed: plan.is_completed || false,
            unit_label: plan.unit_label || 'Unassigned',
            coverage_status: plan.coverage_status || null,
            deviation_reason: plan.deviation_reason || null,
            periods_taken: plan.periods_taken || 0,
            periods_required: plan.periods_required || 1
          }));

        setTopicsData(prev => ({ ...prev, [selectedClassId]: syllabusTopics }));

        // Initialize expanded units state - expand all units by default
        const uniqueUnits = [...new Set(syllabusTopics.map((t: any) => t.unit_label))];
        const newExpandedUnits: { [key: string]: boolean } = {};
        uniqueUnits.forEach(unit => {
          newExpandedUnits[`${selectedClassId}-${unit}`] = true;
        });
        setExpandedUnits(prev => ({ ...prev, ...newExpandedUnits }));

        // Log approval status breakdown
        const pendingCount = response.data.filter((p: CourseLessonPlan) => p.approval_status === 'pending').length;
        const approvedCount = response.data.filter((p: CourseLessonPlan) => p.approval_status === 'approved').length;
        if (pendingCount > 0) {
          console.warn(`⏳ ${pendingCount} topics pending approval, ${approvedCount} approved`);
        }

        // Load progress info (only from approved plans)
        const progressUrl = `/api/v1/faculty/academics/course-plans/progress?subjectId=${selectedClass.subject_id}&classId=${selectedClass.class_id}&facultyId=${selectedClass.faculty_id}&academicYear=${encodeURIComponent(academicYearParam)}&semester=${semesterParam}`;
        const progressResponse = await apiFetch(progressUrl);
        if (progressResponse.success && progressResponse.data?.summary) {
          setPlanProgress(progressResponse.data.summary);
        }
      } else {
        console.warn('❌ No course plans data found or invalid response:', response);
        setCoursePlans([]);
        setTopicsData(prev => ({ ...prev, [selectedClassId]: [] }));
        setPlanProgress({
          totalTopics: 0,
          totalPeriodsPlanned: 0,
          totalPeriodsTaught: 0,
          topicsCompleted: 0,
          completionPercentage: 0,
        });
      }
    } catch (error) {
      console.error('❌ Error loading course plans:', error);
      setCoursePlans([]);
      setTopicsData(prev => ({ ...prev, [selectedClassId]: [] }));
      setPlanProgress({
        totalTopics: 0,
        totalPeriodsPlanned: 0,
        totalPeriodsTaught: 0,
        topicsCompleted: 0,
        completionPercentage: 0,
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadCoursePlans();
  }, [selectedClassId, selectedClass?.id]);

  const [isFileSent, setIsFileSent] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Course Plan Manual Entry States
  const [coursePlanUnits, setCoursePlanUnits] = useState<any[]>([
    { unit_label: "", topics: [{ topic: "", co_number: "", btl: "", delivery_mode: "", reference_book: "", periods_required: 1, tentative_date: "" }] }
  ]);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<number>(0);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddUnit = () => {
    setCoursePlanUnits([
      ...coursePlanUnits,
      { unit_label: "", topics: [{ topic: "", co_number: "", btl: "", delivery_mode: "", reference_book: "", periods_required: 1, tentative_date: "" }] }
    ]);
  };

  const handleRemoveUnit = (unitIdx: number) => {
    setCoursePlanUnits(coursePlanUnits.filter((_, idx) => idx !== unitIdx));
  };

  const handleUnitChange = (unitIdx: number, field: string, value: any) => {
    const updated = [...coursePlanUnits];
    updated[unitIdx][field] = value;
    setCoursePlanUnits(updated);
  };

  const handleAddTopic = (unitIdx: number) => {
    const updated = [...coursePlanUnits];
    updated[unitIdx].topics.push({
      topic: "",
      co_number: "",
      btl: "",
      delivery_mode: "",
      reference_book: "",
      periods_required: 1,
      tentative_date: ""
    });
    setCoursePlanUnits(updated);
  };

  const handleRemoveTopic = (unitIdx: number, topicIdx: number) => {
    const updated = [...coursePlanUnits];
    updated[unitIdx].topics = updated[unitIdx].topics.filter((__topic: any, idx: number) => idx !== topicIdx);
    setCoursePlanUnits(updated);
  };

  const handleTopicChange = (unitIdx: number, topicIdx: number, field: string, value: any) => {
    const updated = [...coursePlanUnits];
    updated[unitIdx].topics[topicIdx][field] = field === 'tentative_date' ? normalizeDateString(value) : value;
    setCoursePlanUnits(updated);
  };

  const normalizeDateString = (value: string): string => {
    if (!value) return "";

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('-');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split('/');
      return `${y}-${m}-${d}`;
    }

    const iso = new Date(trimmed);
    if (!isNaN(iso.getTime())) {
      return iso.toISOString().slice(0, 10);
    }

    return "";
  };

  const parseCsvToUnits = (csvText: string) => {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error('CSV must include header and at least one data row');

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const lookups = {
      unit_number: header.indexOf('unit_number'),
      unit_label: header.indexOf('unit_label'),
      sno: header.indexOf('sno'),
      tentative_date: header.indexOf('tentative_date'),
      topic: header.indexOf('topic'),
      co_number: header.indexOf('co_number'),
      btl: header.indexOf('btl'),
      delivery_mode: header.indexOf('delivery_mode'),
      reference_book: header.indexOf('reference_book'),
      periods_required: header.indexOf('periods_required'),
    };

    if (lookups.topic === -1) throw new Error('CSV must include topic column');
    if (lookups.unit_label === -1 && lookups.unit_number === -1) throw new Error('CSV must include unit_label or unit_number column');

    const unitsMap: Record<string, any> = {};

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim());
      const unitLabel = lookups.unit_label >= 0 ? row[lookups.unit_label] || '' : `Unit ${row[lookups.unit_number] || '1'}`;
      const unitKey = unitLabel || `unit-${row[lookups.unit_number] || '1'}`;
      const topicRow = {
        sno: lookups.sno >= 0 ? parseInt(row[lookups.sno] || '', 10) || (i) : (i),
        tentative_date: normalizeDateString(lookups.tentative_date >= 0 ? row[lookups.tentative_date] || '' : ''),
        topic: row[lookups.topic] || '',
        co_number: lookups.co_number >= 0 ? row[lookups.co_number] || '' : '',
        btl: lookups.btl >= 0 ? row[lookups.btl] || '' : '',
        delivery_mode: lookups.delivery_mode >= 0 ? row[lookups.delivery_mode] || '' : '',
        reference_book: lookups.reference_book >= 0 ? row[lookups.reference_book] || '' : '',
        periods_required: parseInt(row[lookups.periods_required] || '1', 10) || 1,
      };

      if (!unitsMap[unitKey]) {
        unitsMap[unitKey] = {
          unit_label: unitLabel,
          topics: []
        };
      }
      unitsMap[unitKey].topics.push(topicRow);
    }

    return Object.values(unitsMap);
  };

  const handleCsvUpload = async (file: File) => {
    setCsvUploadError(null);
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      setCsvUploadError('Only CSV files are allowed');
      return;
    }

    const text = await file.text();
    try {
      const parsedUnits = parseCsvToUnits(text);
      const topicsCount = parsedUnits.reduce((sum, u) => sum + (u.topics?.length || 0), 0);
      setCoursePlanUnits(parsedUnits);
      setCsvPreviewRows(topicsCount);
      alert(`CSV loaded: ${parsedUnits.length} units, ${topicsCount} topics`);
    } catch (err: any) {
      setCsvUploadError(err.message || 'Failed to parse CSV');
    }
  };

  const handleSaveCoursePlan = async () => {
    if (!selectedClass) {
      toast({ title: "Error", description: "Please select a class first", variant: "destructive" });
      return;
    }

    // Validate data
    const allTopics: any[] = [];
    let sno = 1;
    let cumulativePeriods = 0;

    for (let unitIdx = 0; unitIdx < coursePlanUnits.length; unitIdx++) {
      const unit = coursePlanUnits[unitIdx];
      if (!unit.unit_label?.trim()) {
        toast({ title: "Error", description: `Unit ${unitIdx + 1} name is required`, variant: "destructive" });
        return;
      }

      for (let topicIdx = 0; topicIdx < unit.topics.length; topicIdx++) {
        const topic = unit.topics[topicIdx];
        if (!topic.topic?.trim()) {
          toast({ title: "Error", description: `Unit ${unitIdx + 1}, Topic ${topicIdx + 1}: Topic name is required`, variant: "destructive" });
          return;
        }

        cumulativePeriods += (topic.periods_required || 1);
        allTopics.push({
          sno,
          unit_number: unitIdx + 1,
          unit_label: unit.unit_label,
          topic: topic.topic,
          co_number: topic.co_number,
          btl: topic.btl,
          delivery_mode: topic.delivery_mode,
          reference_book: topic.reference_book,
          periods_required: topic.periods_required || 1,
          cumulative_periods: cumulativePeriods,
          tentative_date: normalizeDateString(topic.tentative_date || '') || null
        });
        sno++;
      }
    }

    if (allTopics.length === 0) {
      toast({ title: "Error", description: "Please add at least one topic", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Ensure semester is sent as an integer
      const semesterToSend = parseInt(String(selectedClass.semester || 1), 10);
      const academicYearToSend = getDefaultAcademicYear();

      const payload = {
        subjectId: selectedClass.subject_id,
        classId: selectedClass.class_id,
        academic_year: academicYearToSend,
        semester: semesterToSend,
        topics: allTopics
      };

      console.log('📤 Uploading course plan with payload:', payload);

      const response = await fetch('/api/v1/faculty/academics/course-plans/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save course plan');
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);
      setIsFileSent(true);
      toast({
        title: "Success",
        description: `Course plan saved successfully! ${result.data?.count || allTopics.length} topics created.\nYour course plan has been submitted to the department admin for approval.`,
        variant: "default",
      });

      // Refresh course plans for the selected class/subject to show updated syllabus (including pending)
      console.log('🔄 Refreshing course plans after upload (showing pending)...');
      await loadCoursePlans();
    } catch (error: any) {
      console.error('Error saving course plan:', error);
      toast({
        title: "Error",
        description: error.message || 'An error occurred while saving the course plan.',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  // Course Lesson Plan states
  const [coursePlans, setCoursePlans] = useState<CourseLessonPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planProgress, setPlanProgress] = useState({
    totalTopics: 0,
    totalPeriodsPlanned: 0,
    totalPeriodsTaught: 0,
    topicsCompleted: 0,
    completionPercentage: 0,
  });

  const topics = topicsData[selectedClassId] || [];
  const materials = materialsData[selectedClassId] || [];
  const allMarks = marksData[selectedClassId] || [];
  const marks = allMarks;
  const isLocked = lockedClasses[selectedClassId] || false;

  if (isLoading) {
    return (
      <MainLayout hideHeader={true}>
        <div className="p-8 text-center text-lg font-medium">Loading academic information...</div>
      </MainLayout>
    );
  }

  // Get filtered credits data using fetched data
  const filteredCredits = fetchedCreditsData.find(
    (c) => c.department === creditsDepartment && c.year === parseInt(creditsYear) && c.semester === parseInt(creditsSemester)
  );
  const totalContactHours = filteredCredits?.subjects.reduce((acc, s) => acc + (s.totalHours || 0), 0) || 0;

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
        className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Academic Activities</h1>
          <p className="text-muted-foreground -mt-4 text-sm">
            Manage syllabus, materials, and internal marks for your classes
          </p>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {formatDate(currentTime)}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-secondary" />
              {formatTime(currentTime)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="sm:hidden text-right mr-2">
              <p className="text-[10px] font-bold text-primary">{formatDate(currentTime)}</p>
              <p className="text-[10px] text-muted-foreground">{formatTime(currentTime)}</p>
            </div>
            <IntegratedNotificationBell />
          </div>
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
                {fetchedClassesHandled.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      <span>{cls.program} - Sem {cls.semester} - Sec {cls.section} : <span className="font-bold text-primary">{cls.subject}</span></span>
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
              <p className="font-semibold text-foreground">Sem {selectedClass.semester} - Sec {selectedClass.section} : {selectedClass.subject}</p>
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
        <TabsList className="mb-6 w-full flex justify-start overflow-x-auto overflow-y-hidden custom-scrollbar gap-2">
          <TabsTrigger value="syllabus" className="flex items-center gap-2 px-6">
            <BookOpen className="w-4 h-4" />
            Syllabus
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2 px-6">
            <FileUp className="w-4 h-4" />
            Study Materials
          </TabsTrigger>

          <TabsTrigger value="courseplan" className="flex items-center gap-2 px-6">
            <ClipboardList className="w-4 h-4" />
            Course Plan
          </TabsTrigger>

          <TabsTrigger value="coursefile" className="flex items-center gap-2 px-6">
            <FileUp className="w-4 h-4" />
            Course Plan Upload
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2 px-6">
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {selectedClass.subject}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedClass.program} • Semester {selectedClass.semester} • Section {selectedClass.section}
                  </p>
                </div>
                <Button
                  onClick={loadCoursePlans}
                  disabled={loadingPlans}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 whitespace-nowrap"
                  title="Refresh course plans and completion status"
                >
                  <RefreshCw className={cn("w-4 h-4", loadingPlans && "animate-spin")} />
                  {loadingPlans ? "Refreshing..." : "Refresh"}
                </Button>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Syllabus Topics</h3>
              {coursePlans && coursePlans.length > 0 && coursePlans.some(p => p.approval_status === 'pending') && (
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                  ⏳ {coursePlans.filter(p => p.approval_status === 'pending').length} Pending Approval
                </Badge>
              )}
            </div>

            {/* Show pending topics alert if any */}
            {coursePlans && coursePlans.some(p => p.approval_status === 'pending') && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
              >
                <p className="text-sm text-amber-700 font-medium">
                  ⏳ Your course plan has been submitted to the department for approval. Once approved by the department admin, the topics below will be available for students.
                </p>
              </motion.div>
            )}

            {/* Topics by Unit */}
            <div className="space-y-3">
              {groupTopicsByUnit(topics).map(([unit, unitTopics], unitIndex) => {
                const unitKey = `${selectedClassId}-${unit}`;
                const isExpanded = expandedUnits[unitKey] ?? true;
                const unitCompletedCount = unitTopics.filter(t => t.completed).length;

                return (
                  <div key={unit} className="border border-border rounded-lg overflow-hidden">
                    {/* Unit Header */}
                    <button
                      onClick={() => toggleUnit(selectedClassId, unit)}
                      className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between border-b border-border"
                    >
                      <div className="flex items-center gap-3 text-left">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-primary" />
                        )}
                        <div>
                          <h4 className="font-semibold text-foreground">{unit}</h4>
                          <p className="text-xs text-muted-foreground">
                            {unitCompletedCount} of {unitTopics.length} completed
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {unitCompletedCount}/{unitTopics.length}
                      </Badge>
                    </button>

                    {/* Topics under Unit */}
                    {isExpanded && (
                      <div className="p-4 space-y-2 bg-muted/20">
                        {unitTopics.map((topic, index) => (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + index * 0.02 }}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                              topic.coverage_status === 'deviation'
                                ? "bg-warning/5 border-warning/30"
                                : topic.completed
                                  ? "bg-success/5 border-success/30"
                                  : "bg-background border-border hover:border-primary/30"
                            )}
                            onClick={() => toggleTopic(topic.id)}
                            title={topic.deviation_reason ? `Deviation: ${topic.deviation_reason}` : topic.completed ? 'Topic completed' : 'Pending'}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox checked={topic.completed} />
                              <div className="flex-1">
                                <p className={cn(
                                  "font-medium text-sm",
                                  topic.coverage_status === 'deviation' && "text-warning",
                                  topic.completed && "text-success"
                                )}>
                                  {topic.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{topic.periods_taken || 0}/{topic.periods_required || topic.hours} periods</span>
                                  {topic.coverage_status === 'deviation' && (
                                    <span className="text-warning font-medium">⚠️ Deviation</span>
                                  )}
                                </div>
                                {topic.deviation_reason && (
                                  <p className="text-xs text-warning mt-1 italic">Reason: {topic.deviation_reason}</p>
                                )}
                              </div>
                            </div>
                            {topic.completed && topic.coverage_status !== 'deviation' && (
                              <Check className="w-4 h-4 text-success ml-2" />
                            )}
                            {topic.coverage_status === 'deviation' && (
                              <span className="text-warning ml-2">⚠️</span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

        <TabsContent value="courseplan">
          {/* Course Plan Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card"
          >
            <h3 className="section-title mb-6">Course Lesson Plan (Section X)</h3>

            {/* Progress Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-2xl font-bold text-primary mb-1">{planProgress.topicsCompleted}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Topics Completed</p>
              </div>
              <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                <p className="text-2xl font-bold text-secondary mb-1">{planProgress.totalTopics}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Topics</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-2xl font-bold text-muted-foreground mb-1">{planProgress.totalPeriodsTaught}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Periods Taught</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-2xl font-bold text-muted-foreground mb-1">{planProgress.completionPercentage?.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Completion</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Overall Completion</span>
                <span className="text-sm text-muted-foreground">{planProgress.totalPeriodsTaught}/{planProgress.totalPeriodsPlanned} periods</span>
              </div>
              <Progress
                value={planProgress.totalPeriodsPlanned > 0 ? (planProgress.totalPeriodsTaught / planProgress.totalPeriodsPlanned) * 100 : 0}
                className="h-2"
              />
            </div>

            {/* Course Plan Table */}
            {loadingPlans ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : coursePlans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold">S.No</th>
                      <th className="text-left p-3 font-semibold">Topic</th>
                      <th className="text-left p-3 font-semibold">CO</th>
                      <th className="text-left p-3 font-semibold">BTL</th>
                      <th className="text-left p-3 font-semibold">Periods</th>
                      <th className="text-left p-3 font-semibold">Taken</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursePlans.map((plan) => (
                      <tr key={plan.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground font-medium">{plan.sno}</td>
                        <td className="p-3 text-foreground font-medium max-w-xs truncate">{plan.topic}</td>
                        <td className="p-3 text-muted-foreground text-xs">{plan.co_number || "—"}</td>
                        <td className="p-3 text-muted-foreground text-xs">{plan.btl || "—"}</td>
                        <td className="p-3 text-center font-medium text-foreground">{plan.periods_required}</td>
                        <td className="p-3 text-center font-medium text-secondary">{plan.periods_taken}</td>
                        <td className="p-3">
                          {plan.is_completed ? (
                            <Badge className="bg-green-500/20 text-green-700 border-green-500/30 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" />
                              Covered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                              Pending
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No course plan created yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Create a lesson plan to track topics covered in class.</p>
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
          {/* Course Plan Manual Entry Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="widget-card mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Course Plan (Section X)</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter course plan details for {selectedClass.subject}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {coursePlans && coursePlans.length > 0 && (
                  <>
                    {coursePlans.some(p => p.approval_status === 'pending') ? (
                      <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" /> Pending Approval
                      </Badge>
                    ) : coursePlans.some(p => p.approval_status === 'approved') ? (
                      <Badge className="bg-success/20 text-success border-success/30">
                        <Check className="w-3 h-3 mr-1" /> Approved
                      </Badge>
                    ) : null}
                  </>
                )}
                {isFileSent && (
                  <Badge className="bg-success/10 text-success border-success/30">
                    <Check className="w-3 h-3 mr-1" /> Saved
                  </Badge>
                )}
              </div>
            </div>

            {/* Course Plan Form */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/api/v1/faculty/academics/course-plans/template/download-csv';
                    link.download = 'Course-Plan-Template.csv';
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>

                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleCsvUpload(file);
                    }
                    if (e.target) e.target.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => csvFileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
              </div>

              {csvUploadError && (
                <p className="text-sm text-destructive">CSV error: {csvUploadError}</p>
              )}

              {csvPreviewRows > 0 && (
                <p className="text-sm text-success">CSV loaded: {coursePlanUnits.length} units and {csvPreviewRows} topics.</p>
              )}
            </div>

            <div className="space-y-6">
              {/* Units Container */}
              <div className="space-y-4">
                {(coursePlanUnits || []).map((unit, unitIdx) => (
                  <div key={unitIdx} className="border border-border rounded-lg p-4 bg-muted/30">
                    {/* Unit Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-semibold text-muted-foreground">UNIT {unitIdx + 1}</span>
                        <Input
                          placeholder="Unit name (e.g., INTRODUCTION TO ONLINE MARKET)"
                          value={unit.unit_label || ""}
                          onChange={(e) => handleUnitChange(unitIdx, "unit_label", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      {(coursePlanUnits || []).length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUnit(unitIdx)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Topics Table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">S. No</th>
                            <th className="px-3 py-2 text-left font-semibold">Tentative Date</th>
                            <th className="px-3 py-2 text-left font-semibold">Topic</th>
                            <th className="px-3 py-2 text-left font-semibold">CO</th>
                            <th className="px-3 py-2 text-left font-semibold">BTL</th>
                            <th className="px-3 py-2 text-left font-semibold">Delivery Mode</th>
                            <th className="px-3 py-2 text-left font-semibold">Reference</th>
                            <th className="px-3 py-2 text-center font-semibold">Periods</th>
                            <th className="px-3 py-2 text-center font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unit.topics?.map((topic: any, topicIdx: number) => (
                            <tr key={topicIdx} className="border-b border-border hover:bg-muted/20 transition-colors">
                              <td className="px-3 py-2 text-muted-foreground font-medium">{topicIdx + 1}</td>
                              <td className="px-3 py-2">
                                <Input
                                  type="date"
                                  value={topic.tentative_date || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "tentative_date", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  placeholder="Topic name"
                                  value={topic.topic || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "topic", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  placeholder="CO1"
                                  value={topic.co_number || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "co_number", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  placeholder="BT2"
                                  value={topic.btl || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "btl", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  placeholder="PPT, BB"
                                  value={topic.delivery_mode || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "delivery_mode", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  placeholder="T1-03"
                                  value={topic.reference_book || ""}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "reference_book", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={topic.periods_required || 1}
                                  onChange={(e) => handleTopicChange(unitIdx, topicIdx, "periods_required", parseInt(e.target.value) || 1)}
                                  className="h-8 text-xs text-center"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveTopic(unitIdx, topicIdx)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Topic Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTopic(unitIdx)}
                      className="w-full text-xs"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Add Topic
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Unit Button */}
              <Button
                variant="default"
                onClick={handleAddUnit}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCoursePlanUnits([{ unit_label: "", topics: [{ topic: "", co_number: "", btl: "", delivery_mode: "", reference_book: "", periods_required: 1, tentative_date: "" }] }]);
                    setIsFileSent(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSaveCoursePlan}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Course Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
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



