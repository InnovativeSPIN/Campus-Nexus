import { useState, useRef } from "react";
import { toast } from "@/pages/faculty/hooks/use-toast";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Badge } from "@/pages/faculty/components/ui/badge";
import { NotificationBell } from "@/pages/faculty/components/notifications/NotificationBell";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  Award,
  Download,
  Building,
  Clock,
  BookOpen,
  Users,
  Target,
  Star,
  Linkedin,
  Globe,
  Edit2,
  Check,
  X,
  Trash2,
  Plus,
} from "lucide-react";

// Types for Profile Data
interface EducationDetail {
  degree: string;
  branch: string;
  college: string;
  university: string;
  year: string;
  percentage: string;
  url: string;
}

interface MembershipDetail {
  society: string;
  id: string;
  status: string;
  url: string;
}

interface ExperienceDetail {
  designation: string;
  institutionName: string;
  university: string;
  department: string;
  from: string;
  to: string;
  period: string;
  current: boolean;
  url: string;
}

interface IndustryDetail {
  jobTitle: string;
  company: string;
  location: string;
  from: string;
  to: string;
  period: string;
  current: boolean;
  url: string;
}

// Faculty data based on the Self-Appraisal Form
const initialFacultyData = {
  // Basic Information
  name: "C.Prathap",
  employeeId: "NS20T15",
  aicteId: "AICTE-123456",
  coeId: "COE-789012",
  designation: "Assistant Professor",
  department: "Artificial Intelligence and Data Science",
  collegeCode: "NS20T11",
  orcidId: "0000-0001-5391-3610",
  dateOfBirth: "24.10.1995",
  age: 29,
  dateOfJoining: "01.09.2023",
  email: "Velvinojagan@gmail.com",
  phone: "+91 8072435849",
  address: "Vadapudupatti, Theni 625531",
  linkedinUrl: "https://www.linkedin.com/in/prathap/",
  profilePhoto: "",
};

// Educational Qualifications
const educationalQualifications = [
  {
    degree: "Ph.D.",
    branch: "Information and Communication Engineering",
    college: "-",
    university: "Anna University",
    year: "Pursuing",
    percentage: "-",
    url: "https://example.com/phd-proof.pdf"
  },
  {
    degree: "M.E",
    branch: "Computer Science Engineering",
    college: "Nehru Institute of Technology, Coimbatore",
    university: "Anna University",
    year: "2019",
    percentage: "81%",
    url: "https://example.com/me-certificate.pdf"
  },
  {
    degree: "B.E",
    branch: "Electronics and Communication Engineering",
    college: "Nehru Institute of Technology, Coimbatore",
    university: "Anna University",
    year: "2017",
    percentage: "66%",
    url: "https://example.com/be-certificate.pdf"
  },
];

// Experience Details (split into teaching and industry)
const teachingExperience = [
  {
    designation: "Assistant Professor",
    institutionName: "Nadar Saraswathi College of Engineering and Technology",
    university: "Anna University",
    department: "Artificial Intelligence and Data Science",
    from: "01.09.2023",
    to: "Present",
    period: "1 Yr 1 M",
    current: true,
    url: "https://example.com/exp-certificate-1.pdf"
  },
  {
    designation: "Assistant Professor",
    institutionName: "AAA College of Engineering and Technology",
    university: "Anna University",
    department: "Artificial Intelligence and Data Science",
    from: "15.08.2021",
    to: "31.05.2023",
    period: "1 Yr 10 M",
    current: false,
    url: "https://example.com/exp-certificate-2.pdf"
  },
  {
    designation: "Assistant Professor",
    institutionName: "Ultra College of Engineering and Technology",
    university: "Anna University",
    department: "Artificial Intelligence and Data Science",
    from: "21.09.2020",
    to: "20.07.2021",
    period: "10 M",
    current: false,
    url: "https://example.com/exp-certificate-3.pdf"
  },
];

const industryExperience = [
  {
    jobTitle: "Front End Developer and Instructor",
    company: "Azhimat, Chennai",
    location: "Chennai",
    from: "01.06.2019",
    to: "30.08.2020",
    period: "1 Yr 2 M",
    current: false,
    url: "https://example.com/industry-proof.pdf"
  },
];

// Subjects Handled
const subjectsHandled = [
  { program: "B.E - CSE", semester: "3", subject: "CS3301 - Data Structures", result: "82%", url: "https://example.com/subject-proof-1.pdf" },
  { program: "B.Tech - AI&DS", semester: "4", subject: "CS3591 - Computer Networks", result: "100%", url: "https://example.com/subject-proof-2.pdf" },
  { program: "B.Tech - IT", semester: "4", subject: "IT3401 - Web Technology", result: "92%", url: "https://example.com/subject-proof-3.pdf" },
];

// Professional Memberships
const memberships = [
  { society: "COE Member", id: "304180", status: "Active", url: "https://example.com/membership-card.pdf" },
];

// Leave Details
const leaveDetails = {
  totalWorkingDays: 265,
  availedLeave: 5,
  onDuty: 0,
  effectiveAttendance: 260,
  attendancePercentage: "95%",
};

// Events Data
const initialEventsData = {
  "Resource Person": [
    { name: "Expert Talk on GenAI", date: "15.12.2023", organizer: "IIT Madras", url: "https://example.com/certificate.pdf" },
    { name: "Data Science Workshop", date: "10.05.2023", organizer: "Sathyabama University", url: "https://example.com/workshop.pdf" },
  ],
  "FDP": [
    { name: "Advanced Deep Learning", date: "10.11.2023", organizer: "NIT Trichy", url: "https://example.com/fdp-1.pdf" },
    { name: "Cloud Computing Essentials", date: "01.03.2024", organizer: "Anna University", url: "https://example.com/fdp-2.pdf" },
  ],
  "Seminar": [
    { name: "Future of Robotics", date: "05.10.2023", organizer: "Anna University", url: "https://example.com/seminar.pdf" },
  ],
  "Workshop": [
    { name: "React Development Workshop", date: "20.08.2023", organizer: "Tech Academy India", url: "https://example.com/workshop-2.pdf" },
    { name: "Python for AI", date: "15.02.2024", organizer: "TCS iON", url: "https://example.com/workshop-3.pdf" },
  ]
};

// Research Data
const initialResearchData = {
  "Conference": [
    { title: "IEEE International Conference on AI", date: "2024", organizer: "IEEE", url: "https://ieee.org/paper.pdf", type: "International" },
  ],
  "Journal": [
    { title: "AI in Education 2024", date: "2024", organizer: "International Journal of CS", url: "https://example.com/journal.pdf" },
  ],
  "Patent": [
    { title: "Smart Irrigation System using IoT", date: "2023", organizer: "Indian Patent Office", url: "https://example.com/patent.pdf" },
  ],
  "Book Chapter": [
    { title: "Machine Learning in Healthcare", date: "2023", organizer: "Springer", url: "https://example.com/chapter.pdf" },
  ]
};

export default function Profile() {
  const [selectedEventCategory, setSelectedEventCategory] = useState<keyof typeof initialEventsData>("Resource Person");
  const [selectedResearchCategory, setSelectedResearchCategory] = useState<keyof typeof initialResearchData>("Conference");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facultyData, setFacultyData] = useState(initialFacultyData);

  // Events and Research states
  const [eventsData, setEventsData] = useState(initialEventsData);
  const [researchData, setResearchData] = useState(initialResearchData);

  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ index: number } | null>(null);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", organizer: "", url: "" });
  const [tempEvent, setTempEvent] = useState({ name: "", date: "", organizer: "", url: "" });

  const [addingResearch, setAddingResearch] = useState(false);
  const [editingResearch, setEditingResearch] = useState<{ index: number } | null>(null);
  const [newResearch, setNewResearch] = useState({ title: "", date: "", organizer: "", url: "", type: "International" });
  const [tempResearch, setTempResearch] = useState({ title: "", date: "", organizer: "", url: "", type: "International" });

  // Individual edit states for each field
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);

  // Education and membership states
  const [educationData, setEducationData] = useState<EducationDetail[]>(educationalQualifications);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [tempEducation, setTempEducation] = useState<EducationDetail | null>(null);
  const [addingEducation, setAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationDetail>({
    degree: "",
    branch: "",
    college: "",
    university: "",
    year: "",
    percentage: "",
    url: "",
  });

  const [membershipData, setMembershipData] = useState<MembershipDetail[]>(memberships);
  const [editingMembership, setEditingMembership] = useState<number | null>(null);
  const [tempMembership, setTempMembership] = useState<MembershipDetail | null>(null);
  const [addingMembership, setAddingMembership] = useState(false);
  const [newMembership, setNewMembership] = useState<MembershipDetail>({
    society: "",
    id: "",
    status: "Active",
    url: "",
  });

  // Experience states
  const [teachingExpData, setTeachingExpData] = useState<ExperienceDetail[]>(teachingExperience);
  const [editingTeachingExp, setEditingTeachingExp] = useState<number | null>(null);
  const [tempTeachingExp, setTempTeachingExp] = useState<ExperienceDetail | null>(null);
  const [addingTeachingExp, setAddingTeachingExp] = useState(false);
  const [newTeachingExp, setNewTeachingExp] = useState<ExperienceDetail>({
    designation: "",
    institutionName: "",
    university: "",
    department: "",
    from: "",
    to: "",
    period: "",
    current: false,
    url: "",
  });

  const [industryExpData, setIndustryExpData] = useState<IndustryDetail[]>(industryExperience);
  const [editingIndustryExp, setEditingIndustryExp] = useState<number | null>(null);
  const [tempIndustryExp, setTempIndustryExp] = useState<IndustryDetail | null>(null);
  const [addingIndustryExp, setAddingIndustryExp] = useState(false);
  const [newIndustryExp, setNewIndustryExp] = useState<IndustryDetail>({
    jobTitle: "",
    company: "",
    location: "",
    from: "",
    to: "",
    period: "",
    current: false,
    url: "",
  });

  function validateEmail(email: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }

  function validatePhone(phone: string) {
    return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
  }

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setFieldError("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
    setFieldError("");
  };

  const handleSaveField = async (field: string) => {
    // Validate based on field type
    if (field === "email") {
      if (!validateEmail(tempValue)) {
        setFieldError("Invalid email format");
        return;
      }
    } else if (field === "phone") {
      if (!validatePhone(tempValue)) {
        setFieldError("Invalid phone number");
        return;
      }
    } else if (field === "address") {
      if (tempValue.trim().length === 0) {
        setFieldError("Address cannot be empty");
        return;
      }
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFacultyData((prev) => ({
        ...prev,
        [field]: tempValue,
      }));
      setEditingField(null);
      setTempValue("");
      setFieldError("");
      setLoading(false);
      toast({
        title: 'Profile updated',
        description: `Your ${field} has been updated successfully.`
      });
    }, 1000);
  };

  // Education handlers
  const handleEditEducation = (index: number) => {
    setEditingEducation(index);
    setTempEducation({ ...educationData[index] });
  };

  const handleCancelEducation = () => {
    setEditingEducation(null);
    setTempEducation(null);
  };

  const handleSaveEducation = async (index: number) => {
    if (!tempEducation) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updated = [...educationData];
      updated[index] = tempEducation;
      setEducationData(updated);
      setEditingEducation(null);
      setTempEducation(null);
      setLoading(false);
      toast({
        title: 'Education updated',
        description: 'Educational qualification has been updated successfully.'
      });
    }, 1000);
  };

  const handleEducationFieldChange = (field: string, value: string) => {
    setTempEducation((prev: any) => ({ ...prev, [field]: value }));
  };

  // Membership handlers
  const handleEditMembership = (index: number) => {
    setEditingMembership(index);
    setTempMembership({ ...membershipData[index] });
  };

  const handleCancelMembership = () => {
    setEditingMembership(null);
    setTempMembership(null);
  };

  const handleSaveMembership = async (index: number) => {
    if (!tempMembership) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updated = [...membershipData];
      updated[index] = tempMembership;
      setMembershipData(updated);
      setEditingMembership(null);
      setTempMembership(null);
      setLoading(false);
      toast({
        title: 'Membership updated',
        description: 'Professional membership has been updated successfully.'
      });
    }, 1000);
  };

  const handleMembershipFieldChange = (field: string, value: string) => {
    setTempMembership((prev: any) => ({ ...prev, [field]: value }));
  };

  // Add new education handlers
  const handleAddEducation = () => {
    setAddingEducation(true);
    setNewEducation({
      degree: "",
      branch: "",
      college: "",
      university: "",
      year: "",
      percentage: "",
      url: "",
    });
  };

  const handleCancelAddEducation = () => {
    setAddingEducation(false);
    setNewEducation({
      degree: "",
      branch: "",
      college: "",
      university: "",
      year: "",
      percentage: "",
      url: "",
    });
  };

  const handleSaveNewEducation = async () => {
    // Validate required fields
    if (!newEducation.degree || !newEducation.branch || !newEducation.university) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in degree, branch, and university fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEducationData([...educationData, newEducation]);
      setAddingEducation(false);
      setNewEducation({
        degree: "",
        branch: "",
        college: "",
        university: "",
        year: "",
        percentage: "",
        url: "",
      });
      setLoading(false);
      toast({
        title: 'Education added',
        description: 'New educational qualification has been added successfully.'
      });
    }, 1000);
  };

  const handleNewEducationChange = (field: string, value: string) => {
    setNewEducation((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteEducation = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this educational qualification?')) {
      setLoading(true);
      setTimeout(() => {
        const updated = educationData.filter((_, i) => i !== index);
        setEducationData(updated);
        setLoading(false);
        toast({
          title: 'Education deleted',
          description: 'Educational qualification has been deleted successfully.'
        });
      }, 500);
    }
  };

  // Add new membership handlers
  const handleAddMembership = () => {
    setAddingMembership(true);
    setNewMembership({
      society: "",
      id: "",
      status: "Active",
      url: "",
    });
  };

  const handleCancelAddMembership = () => {
    setAddingMembership(false);
    setNewMembership({
      society: "",
      id: "",
      status: "Active",
      url: "",
    });
  };

  const handleSaveNewMembership = async () => {
    // Validate required fields
    if (!newMembership.society || !newMembership.id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in society name and ID fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMembershipData([...membershipData, newMembership]);
      setAddingMembership(false);
      setNewMembership({
        society: "",
        id: "",
        status: "Active",
        url: "",
      });
      setLoading(false);
      toast({
        title: 'Membership added',
        description: 'New professional membership has been added successfully.'
      });
    }, 1000);
  };

  const handleNewMembershipChange = (field: string, value: string) => {
    setNewMembership((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteMembership = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      setLoading(true);
      setTimeout(() => {
        const updated = membershipData.filter((_, i) => i !== index);
        setMembershipData(updated);
        setLoading(false);
        toast({
          title: 'Membership deleted',
          description: 'Professional membership has been deleted successfully.'
        });
      }, 500);
    }
  };

  // Teaching Experience handlers
  const handleAddTeachingExp = () => {
    setAddingTeachingExp(true);
    setNewTeachingExp({
      designation: "",
      institutionName: "",
      university: "",
      department: "",
      from: "",
      to: "",
      period: "",
      current: false,
      url: "",
    });
  };

  const handleCancelAddTeachingExp = () => {
    setAddingTeachingExp(false);
    setNewTeachingExp({
      designation: "",
      institutionName: "",
      university: "",
      department: "",
      from: "",
      to: "",
      period: "",
      current: false,
      url: "",
    });
  };

  const handleSaveNewTeachingExp = async () => {
    if (!newTeachingExp.designation || !newTeachingExp.institutionName || !newTeachingExp.university || !newTeachingExp.department) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in designation, institution name, university, and department fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setTeachingExpData([...teachingExpData, newTeachingExp]);
      setAddingTeachingExp(false);
      setNewTeachingExp({
        designation: "",
        institutionName: "",
        university: "",
        department: "",
        from: "",
        to: "",
        period: "",
        current: false,
        url: "",
      });
      setLoading(false);
      toast({
        title: 'Experience added',
        description: 'Teaching experience has been added successfully.'
      });
    }, 1000);
  };

  const handleNewTeachingExpChange = (field: string, value: string | boolean) => {
    setNewTeachingExp((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTeachingExp = (index: number) => {
    setEditingTeachingExp(index);
    setTempTeachingExp({ ...teachingExpData[index] });
  };

  const handleCancelTeachingExp = () => {
    setEditingTeachingExp(null);
    setTempTeachingExp(null);
  };

  const handleSaveTeachingExp = async (index: number) => {
    if (!tempTeachingExp) return;
    setLoading(true);
    setTimeout(() => {
      const updated = [...teachingExpData];
      updated[index] = tempTeachingExp;
      setTeachingExpData(updated);
      setEditingTeachingExp(null);
      setTempTeachingExp(null);
      setLoading(false);
      toast({
        title: 'Experience updated',
        description: 'Teaching experience has been updated successfully.'
      });
    }, 1000);
  };

  const handleTeachingExpFieldChange = (field: string, value: string | boolean) => {
    setTempTeachingExp((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDeleteTeachingExp = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this teaching experience?')) {
      setLoading(true);
      setTimeout(() => {
        const updated = teachingExpData.filter((_, i) => i !== index);
        setTeachingExpData(updated);
        setLoading(false);
        toast({
          title: 'Experience deleted',
          description: 'Teaching experience has been deleted successfully.'
        });
      }, 500);
    }
  };

  // Industry Experience handlers
  const handleAddIndustryExp = () => {
    setAddingIndustryExp(true);
    setNewIndustryExp({
      jobTitle: "",
      company: "",
      location: "",
      from: "",
      to: "",
      period: "",
      current: false,
      url: "",
    });
  };

  const handleCancelAddIndustryExp = () => {
    setAddingIndustryExp(false);
    setNewIndustryExp({
      jobTitle: "",
      company: "",
      location: "",
      from: "",
      to: "",
      period: "",
      current: false,
      url: "",
    });
  };

  const handleSaveNewIndustryExp = async () => {
    if (!newIndustryExp.jobTitle || !newIndustryExp.company) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in job title and company fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setIndustryExpData([...industryExpData, newIndustryExp]);
      setAddingIndustryExp(false);
      setNewIndustryExp({
        jobTitle: "",
        company: "",
        location: "",
        from: "",
        to: "",
        period: "",
        current: false,
        url: "",
      });
      setLoading(false);
      toast({
        title: 'Experience added',
        description: 'Industry experience has been added successfully.'
      });
    }, 1000);
  };

  const handleNewIndustryExpChange = (field: string, value: string | boolean) => {
    setNewIndustryExp((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditIndustryExp = (index: number) => {
    setEditingIndustryExp(index);
    setTempIndustryExp({ ...industryExpData[index] });
  };

  const handleCancelIndustryExp = () => {
    setEditingIndustryExp(null);
    setTempIndustryExp(null);
  };

  const handleSaveIndustryExp = async (index: number) => {
    if (!tempIndustryExp) return;
    setLoading(true);
    setTimeout(() => {
      const updated = [...industryExpData];
      updated[index] = tempIndustryExp;
      setIndustryExpData(updated);
      setEditingIndustryExp(null);
      setTempIndustryExp(null);
      setLoading(false);
      toast({
        title: 'Experience updated',
        description: 'Industry experience has been updated successfully.'
      });
    }, 1000);
  };

  const handleIndustryExpFieldChange = (field: string, value: string | boolean) => {
    setTempIndustryExp((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDeleteIndustryExp = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this industry experience?')) {
      setLoading(true);
      setTimeout(() => {
        const updated = industryExpData.filter((_, i) => i !== index);
        setIndustryExpData(updated);
        setLoading(false);
        toast({
          title: 'Experience deleted',
          description: 'Industry experience has been deleted successfully.'
        });
      }, 500);
    }
  };

  // Events Handlers
  const handleAddEvent = () => {
    setAddingEvent(true);
    setNewEvent({ name: "", date: "", organizer: "", url: "" });
  };

  const handleEditEvent = (index: number) => {
    setEditingEvent({ index });
    setTempEvent({ ...eventsData[selectedEventCategory][index] });
  };

  const handleSaveNewEvent = () => {
    if (!newEvent.name || !newEvent.date) {
      toast({ title: "Validation Error", description: "Name and Date are required.", variant: "destructive" });
      return;
    }
    setEventsData(prev => ({
      ...prev,
      [selectedEventCategory]: [...prev[selectedEventCategory], newEvent]
    }));
    setAddingEvent(false);
    toast({ title: "Event added", description: "New event has been added successfully." });
  };

  const handleSaveEditEvent = (index: number) => {
    const updated = [...eventsData[selectedEventCategory]];
    updated[index] = tempEvent;
    setEventsData(prev => ({
      ...prev,
      [selectedEventCategory]: updated
    }));
    setEditingEvent(null);
    toast({ title: "Event updated", description: "Event has been updated successfully." });
  };

  const handleDeleteEvent = (index: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updated = eventsData[selectedEventCategory].filter((_, i) => i !== index);
      setEventsData(prev => ({
        ...prev,
        [selectedEventCategory]: updated
      }));
      toast({ title: "Event deleted", description: "Event has been deleted successfully." });
    }
  };

  // Research Handlers
  const handleAddResearch = () => {
    setAddingResearch(true);
    setNewResearch({ title: "", date: "", organizer: "", url: "", type: "International" });
  };

  const handleEditResearch = (index: number) => {
    setEditingResearch({ index });
    const item = researchData[selectedResearchCategory][index] as any;
    setTempResearch({ ...item, type: item.type || "International" });
  };

  const handleSaveNewResearch = () => {
    if (!newResearch.title || !newResearch.date) {
      toast({ title: "Validation Error", description: "Title and Date are required.", variant: "destructive" });
      return;
    }
    setResearchData(prev => ({
      ...prev,
      [selectedResearchCategory]: [...prev[selectedResearchCategory], newResearch]
    }));
    setAddingResearch(false);
    toast({ title: "Research added", description: "New research has been added successfully." });
  };

  const handleSaveEditResearch = (index: number) => {
    const updated = [...researchData[selectedResearchCategory]];
    updated[index] = tempResearch;
    setResearchData(prev => ({
      ...prev,
      [selectedResearchCategory]: updated
    }));
    setEditingResearch(null);
    toast({ title: "Research updated", description: "Research has been updated successfully." });
  };

  const handleDeleteResearch = (index: number) => {
    if (window.confirm("Are you sure you want to delete this research item?")) {
      const updated = researchData[selectedResearchCategory].filter((_, i) => i !== index);
      setResearchData(prev => ({
        ...prev,
        [selectedResearchCategory]: updated
      }));
      toast({ title: "Research deleted", description: "Research has been deleted successfully." });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("File selected:", file.name, file.size, file.type);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Assuming token is stored here

      const response = await fetch('http://localhost:5000/api/v1/faculty/download-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyData,
          educationalQualifications: educationData,
          teachingExperience: teachingExpData,
          subjectsHandled: subjectsHandled,
          leaveDetails,
          memberships: membershipData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate profile document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${facultyData.name.replace(/\s+/g, '_')}_Self_Appraisal.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Profile document downloaded successfully."
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="page-header font-serif">Faculty Profile</h1>
          <p className="text-muted-foreground -mt-4"></p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button onClick={handleDownloadProfile} className="bg-secondary hover:bg-secondary/90">
            <Download className="w-4 h-4 mr-2" />
            Download Profile
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="widget-card lg:col-span-1"
        >
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <img
                src={facultyData.profilePhoto || "/src/assets/prathap.png"}
                alt={facultyData.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-white"
              />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">{facultyData.name}</h2>
            <p className="text-secondary font-medium">{facultyData.designation}</p>
            <p className="text-sm text-muted-foreground mt-1">{facultyData.department}</p>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="font-mono font-semibold text-foreground">{facultyData.employeeId}</p>
            </div>
            {/* <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">AICTE ID</p>
              <p className="font-mono font-semibold text-foreground">{facultyData.aicteId}</p>
            </div> */}
            {/* <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">COE ID</p>
              <p className="font-mono font-semibold text-foreground">{facultyData.coeId}</p>
            </div> */}
          </div>

          <div className="mt-6 space-y-4">
            {/* AICTE ID */}
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-2">AICTE ID: {facultyData.aicteId}</span>
            </div>
            {/* COE ID */}
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-2">COE ID: {facultyData.coeId}</span>
            </div>
            {/* College Code */}
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-2">Faculty Code: {facultyData.collegeCode}</span>
            </div>

            {/* ORCID ID */}
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground line-clamp-2">ORCID ID: {facultyData.orcidId}</span>
            </div>

            {/* DOB & Age */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">DOB:</span>
              <span className="font-medium">{facultyData.dateOfBirth} (Age: {facultyData.age})</span>
            </div>

            {/* Date of Joining */}
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Date of Joined:</span>
              <span className="font-medium">{facultyData.dateOfJoining}</span>
            </div>

            {/* LinkedIn URL */}
            <div className="flex items-center gap-3 text-sm">
              <Linkedin className="w-4 h-4 text-primary flex-shrink-0" />
              <a href={facultyData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                {facultyData.linkedinUrl}
              </a>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <span className="font-medium text-sm break-all">{facultyData.email}</span>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <span className="font-medium">{facultyData.phone}</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <span className="font-medium text-sm">{facultyData.address}</span>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              Attendance Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Working Days</p>
                <p className="font-bold text-foreground">{leaveDetails.totalWorkingDays}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Leave Availed</p>
                <p className="font-bold text-foreground">{leaveDetails.availedLeave}</p>
              </div>
              <div>
                <p className="text-muted-foreground">On Duty</p>
                <p className="font-bold text-foreground">{leaveDetails.onDuty}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Attendance</p>
                <p className="font-bold text-secondary">{leaveDetails.attendancePercentage}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="widget-card lg:col-span-2"
        >
          <Tabs defaultValue="education" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
              <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
            </TabsList>

            {/* Educational Qualifications */}
            <TabsContent value="education">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                  Educational Qualifications
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddEducation}
                  disabled={addingEducation}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>

              {/* Add New Education Form */}
              {addingEducation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 mb-4 bg-primary/5 rounded-lg border-2 border-primary/30"
                >
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Educational Qualification
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Degree *</label>
                        <input
                          type="text"
                          placeholder="e.g., Ph.D., M.E., B.E."
                          value={newEducation.degree}
                          onChange={(e) => handleNewEducationChange('degree', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Branch *</label>
                        <input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={newEducation.branch}
                          onChange={(e) => handleNewEducationChange('branch', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">College</label>
                      <input
                        type="text"
                        placeholder="e.g., Anna University"
                        value={newEducation.college}
                        onChange={(e) => handleNewEducationChange('college', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">University *</label>
                      <input
                        type="text"
                        placeholder="e.g., Anna University"
                        value={newEducation.university}
                        onChange={(e) => handleNewEducationChange('university', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Year</label>
                        <input
                          type="text"
                          placeholder="e.g., 2023 or Pursuing"
                          value={newEducation.year}
                          onChange={(e) => handleNewEducationChange('year', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Percentage</label>
                        <input
                          type="text"
                          placeholder="e.g., 85% or -"
                          value={newEducation.percentage}
                          onChange={(e) => handleNewEducationChange('percentage', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNewEducation}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelAddEducation}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {educationData.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors relative"
                  >
                    {editingEducation === index ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Degree:</label>
                          <input
                            type="text"
                            value={tempEducation.degree}
                            onChange={(e) => handleEducationFieldChange('degree', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Branch:</label>
                          <input
                            type="text"
                            value={tempEducation.branch}
                            onChange={(e) => handleEducationFieldChange('branch', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">College:</label>
                          <input
                            type="text"
                            value={tempEducation.college}
                            onChange={(e) => handleEducationFieldChange('college', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">University:</label>
                          <input
                            type="text"
                            value={tempEducation.university}
                            onChange={(e) => handleEducationFieldChange('university', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-24">Year:</label>
                            <input
                              type="text"
                              value={tempEducation.year}
                              onChange={(e) => handleEducationFieldChange('year', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-24">Percentage:</label>
                            <input
                              type="text"
                              value={tempEducation.percentage}
                              onChange={(e) => handleEducationFieldChange('percentage', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEducation(index)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEducation}
                            disabled={loading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={edu.degree === "Ph.D." ? "default" : "secondary"}>
                              {edu.degree}
                            </Badge>
                            {edu.year === "Pursuing" && (
                              <Badge variant="outline" className="text-warning border-warning">
                                Pursuing
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-foreground">{edu.branch}</p>
                          <p className="text-sm text-muted-foreground mt-1">{edu.college}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              <strong>University:</strong> {edu.university}
                            </span>
                            <span className="text-muted-foreground">
                              <strong>Year:</strong> {edu.year}
                            </span>
                            {edu.percentage !== "-" && (
                              <span className="text-secondary font-semibold">
                                {edu.percentage}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEducation(index)}
                            className="p-1 hover:bg-muted rounded transition flex-shrink-0"
                            title="Edit education"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteEducation(index)}
                            className="p-1 hover:bg-red-50 rounded transition flex-shrink-0"
                            title="Delete education"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Professional Memberships */}
              <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="section-title flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Professional Memberships
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddMembership}
                  disabled={addingMembership}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>

              {/* Add New Membership Form */}
              {addingMembership && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 mb-4 bg-secondary/5 rounded-lg border-2 border-secondary/30"
                >
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Professional Membership
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Society Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., IEEE, ACM, IAENG"
                        value={newMembership.society}
                        onChange={(e) => handleNewMembershipChange('society', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Membership ID *</label>
                      <input
                        type="text"
                        placeholder="e.g., 123456"
                        value={newMembership.id}
                        onChange={(e) => handleNewMembershipChange('id', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Status</label>
                      <select
                        value={newMembership.status}
                        onChange={(e) => handleNewMembershipChange('status', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNewMembership}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelAddMembership}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {membershipData.map((membership, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary/10 to-transparent rounded-lg border-l-4 border-secondary relative"
                  >
                    {editingMembership === index ? (
                      // Edit Mode
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Society:</label>
                          <input
                            type="text"
                            value={tempMembership.society}
                            onChange={(e) => handleMembershipFieldChange('society', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">ID:</label>
                          <input
                            type="text"
                            value={tempMembership.id}
                            onChange={(e) => handleMembershipFieldChange('id', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Status:</label>
                          <select
                            value={tempMembership.status}
                            onChange={(e) => handleMembershipFieldChange('status', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveMembership(index)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelMembership}
                            disabled={loading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/20 rounded-full">
                            <Award className="w-5 h-5 text-secondary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{membership.society}</p>
                            <p className="text-sm text-muted-foreground">ID: {membership.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-success border-success">
                            {membership.status}
                          </Badge>
                          <button
                            onClick={() => handleEditMembership(index)}
                            className="p-1 hover:bg-muted rounded transition"
                            title="Edit membership"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteMembership(index)}
                            className="p-1 hover:bg-red-50 rounded transition"
                            title="Delete membership"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Experience Details */}
            <TabsContent value="experience">
              <h3 className="section-title flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-secondary" />
                Experience
              </h3>

              {/* Teaching Experience Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-base text-primary">Teaching Experience</h4>
                  <Button
                    size="sm"
                    onClick={handleAddTeachingExp}
                    disabled={addingTeachingExp}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {/* Add New Teaching Experience Form */}
                {addingTeachingExp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-4 bg-primary/5 rounded-lg border-2 border-primary/30"
                  >
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Teaching Experience
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Designation *</label>
                        <input
                          type="text"
                          placeholder="e.g., Assistant Professor"
                          value={newTeachingExp.designation}
                          onChange={(e) => handleNewTeachingExpChange('designation', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Institution Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Nadar Saraswathi College"
                          value={newTeachingExp.institutionName}
                          onChange={(e) => handleNewTeachingExpChange('institutionName', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">University *</label>
                        <input
                          type="text"
                          placeholder="e.g., Anna University"
                          value={newTeachingExp.university}
                          onChange={(e) => handleNewTeachingExpChange('university', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Department *</label>
                        <input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={newTeachingExp.department}
                          onChange={(e) => handleNewTeachingExpChange('department', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">From Date</label>
                          <input
                            type="text"
                            placeholder="DD.MM.YYYY"
                            value={newTeachingExp.from}
                            onChange={(e) => handleNewTeachingExpChange('from', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">To Date</label>
                          <input
                            type="text"
                            placeholder="DD.MM.YYYY or Present"
                            value={newTeachingExp.to}
                            onChange={(e) => handleNewTeachingExpChange('to', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Period</label>
                        <input
                          type="text"
                          placeholder="e.g., 2 Yr 3 M"
                          value={newTeachingExp.period}
                          onChange={(e) => handleNewTeachingExpChange('period', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="teaching-current"
                          checked={newTeachingExp.current}
                          onChange={(e) => handleNewTeachingExpChange('current', e.target.checked)}
                          className="checkbox checkbox-sm"
                          disabled={loading}
                        />
                        <label htmlFor="teaching-current" className="text-sm">Current Position</label>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNewTeachingExp}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelAddTeachingExp}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {teachingExpData.length === 0 && (
                    <div className="text-muted-foreground text-sm">No teaching experience records.</div>
                  )}
                  {teachingExpData.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      {editingTeachingExp === index ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Designation:</label>
                            <input
                              type="text"
                              value={tempTeachingExp.designation}
                              onChange={(e) => handleTeachingExpFieldChange('designation', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Institution:</label>
                            <input
                              type="text"
                              value={tempTeachingExp.institutionName}
                              onChange={(e) => handleTeachingExpFieldChange('institutionName', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">University:</label>
                            <input
                              type="text"
                              value={tempTeachingExp.university}
                              onChange={(e) => handleTeachingExpFieldChange('university', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Department:</label>
                            <input
                              type="text"
                              value={tempTeachingExp.department}
                              onChange={(e) => handleTeachingExpFieldChange('department', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">From:</label>
                              <input
                                type="text"
                                value={tempTeachingExp.from}
                                onChange={(e) => handleTeachingExpFieldChange('from', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">To:</label>
                              <input
                                type="text"
                                value={tempTeachingExp.to}
                                onChange={(e) => handleTeachingExpFieldChange('to', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Period:</label>
                            <input
                              type="text"
                              value={tempTeachingExp.period}
                              onChange={(e) => handleTeachingExpFieldChange('period', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`edit-teaching-current-${index}`}
                              checked={tempTeachingExp.current}
                              onChange={(e) => handleTeachingExpFieldChange('current', e.target.checked)}
                              className="checkbox checkbox-sm"
                              disabled={loading}
                            />
                            <label htmlFor={`edit-teaching-current-${index}`} className="text-sm">Current Position</label>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveTeachingExp(index)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelTeachingExp}
                              disabled={loading}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          {exp.current && (
                            <Badge className="absolute -top-2 right-4 bg-success">Current</Badge>
                          )}
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Building className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                                <p className="font-semibold text-foreground">{exp.designation}</p>
                                <span className="text-xs text-muted-foreground">{exp.department}</span>
                              </div>
                              <p className="text-sm text-foreground mt-1">
                                <span className="font-medium">{exp.institutionName}</span>
                                {exp.university && <span className="text-muted-foreground">, {exp.university}</span>}
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {exp.from} - {exp.to}
                                  </span>
                                </div>
                                <Badge variant="outline">{exp.period}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditTeachingExp(index)}
                                className="p-1 hover:bg-muted rounded transition flex-shrink-0"
                                title="Edit experience"
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeachingExp(index)}
                                className="p-1 hover:bg-red-50 rounded transition flex-shrink-0"
                                title="Delete experience"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Industry Experience Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-base text-primary">Industry Experience</h4>
                  <Button
                    size="sm"
                    onClick={handleAddIndustryExp}
                    disabled={addingIndustryExp}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {/* Add New Industry Experience Form */}
                {addingIndustryExp && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-4 bg-secondary/5 rounded-lg border-2 border-secondary/30"
                  >
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Industry Experience
                    </h4>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Job Title *</label>
                        <input
                          type="text"
                          placeholder="e.g., Software Engineer"
                          value={newIndustryExp.jobTitle}
                          onChange={(e) => handleNewIndustryExpChange('jobTitle', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Company *</label>
                        <input
                          type="text"
                          placeholder="e.g., Google India"
                          value={newIndustryExp.company}
                          onChange={(e) => handleNewIndustryExpChange('company', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Location</label>
                        <input
                          type="text"
                          placeholder="e.g., Bangalore"
                          value={newIndustryExp.location}
                          onChange={(e) => handleNewIndustryExpChange('location', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">From Date</label>
                          <input
                            type="text"
                            placeholder="DD.MM.YYYY"
                            value={newIndustryExp.from}
                            onChange={(e) => handleNewIndustryExpChange('from', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">To Date</label>
                          <input
                            type="text"
                            placeholder="DD.MM.YYYY or Present"
                            value={newIndustryExp.to}
                            onChange={(e) => handleNewIndustryExpChange('to', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Period</label>
                        <input
                          type="text"
                          placeholder="e.g., 3 Yr 6 M"
                          value={newIndustryExp.period}
                          onChange={(e) => handleNewIndustryExpChange('period', e.target.value)}
                          className="input input-bordered text-sm"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="industry-current"
                          checked={newIndustryExp.current}
                          onChange={(e) => handleNewIndustryExpChange('current', e.target.checked)}
                          className="checkbox checkbox-sm"
                          disabled={loading}
                        />
                        <label htmlFor="industry-current" className="text-sm">Current Position</label>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNewIndustryExp}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelAddIndustryExp}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {industryExpData.length === 0 && (
                    <div className="text-muted-foreground text-sm">No industry experience records.</div>
                  )}
                  {industryExpData.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      {editingIndustryExp === index ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Job Title:</label>
                            <input
                              type="text"
                              value={tempIndustryExp.jobTitle}
                              onChange={(e) => handleIndustryExpFieldChange('jobTitle', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Company:</label>
                            <input
                              type="text"
                              value={tempIndustryExp.company}
                              onChange={(e) => handleIndustryExpFieldChange('company', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Location:</label>
                            <input
                              type="text"
                              value={tempIndustryExp.location}
                              onChange={(e) => handleIndustryExpFieldChange('location', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">From:</label>
                              <input
                                type="text"
                                value={tempIndustryExp.from}
                                onChange={(e) => handleIndustryExpFieldChange('from', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">To:</label>
                              <input
                                type="text"
                                value={tempIndustryExp.to}
                                onChange={(e) => handleIndustryExpFieldChange('to', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Period:</label>
                            <input
                              type="text"
                              value={tempIndustryExp.period}
                              onChange={(e) => handleIndustryExpFieldChange('period', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`edit-industry-current-${index}`}
                              checked={tempIndustryExp.current}
                              onChange={(e) => handleIndustryExpFieldChange('current', e.target.checked)}
                              className="checkbox checkbox-sm"
                              disabled={loading}
                            />
                            <label htmlFor={`edit-industry-current-${index}`} className="text-sm">Current Position</label>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveIndustryExp(index)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelIndustryExp}
                              disabled={loading}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          {exp.current && (
                            <Badge className="absolute -top-2 right-4 bg-success">Current</Badge>
                          )}
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                              <Briefcase className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{exp.jobTitle}</p>
                              <p className="text-sm text-muted-foreground mt-1">{exp.company}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{exp.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {exp.from} - {exp.to}
                                  </span>
                                </div>
                                <Badge variant="outline">{exp.period}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditIndustryExp(index)}
                                className="p-1 hover:bg-muted rounded transition flex-shrink-0"
                                title="Edit experience"
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteIndustryExp(index)}
                                className="p-1 hover:bg-red-50 rounded transition flex-shrink-0"
                                title="Delete experience"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Subjects Handled */}
            <TabsContent value="subjects">
              <h3 className="section-title flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Subjects Handled & Results
              </h3>
              <div className="space-y-4">
                {subjectsHandled.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary">{subject.program}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Semester {subject.semester}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">{subject.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Result</p>
                        <p className={`text-lg font-bold ${parseInt(subject.result) >= 90 ? "text-success" :
                          parseInt(subject.result) >= 80 ? "text-secondary" : "text-warning"
                          }`}>
                          {subject.result}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">Average Result</p>
                    <p className="text-2xl font-bold text-secondary">91%</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Events Section */}
            <TabsContent value="events">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-foreground border-b-2 border-primary/20 pb-2 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-secondary" />
                  Events
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddEvent}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>

              {/* Category Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {Object.keys(eventsData).map((category) => (
                  <Button
                    key={category}
                    variant={selectedEventCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedEventCategory(category as any)}
                    className="w-full text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Add New Event Form */}
              {addingEvent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 mb-6 bg-primary/5 rounded-xl border-2 border-primary/20 shadow-sm"
                >
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-primary">
                    <Plus className="w-4 h-4" /> Add New {selectedEventCategory}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Event Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Workshop on AI"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Date</label>
                      <input
                        type="text"
                        placeholder="DD.MM.YYYY"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Organizer</label>
                      <input
                        type="text"
                        placeholder="e.g., IIT Bombay"
                        value={newEvent.organizer}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newEvent.url}
                        onChange={(e) => setNewEvent({ ...newEvent, url: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Upload Document</label>
                      <input
                        type="file"
                        className="file-input file-input-bordered file-input-sm w-full bg-white text-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <Button size="sm" variant="outline" onClick={() => setAddingEvent(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveNewEvent} className="bg-green-600 hover:bg-green-700">Save Event</Button>
                  </div>
                </motion.div>
              )}

              {/* Events List */}
              <div className="space-y-4">
                {eventsData[selectedEventCategory].length === 0 && (
                  <p className="text-center text-muted-foreground py-8 italic">No records found for this category.</p>
                )}
                {eventsData[selectedEventCategory].map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
                  >
                    {editingEvent?.index === index ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={tempEvent.name}
                            onChange={(e) => setTempEvent({ ...tempEvent, name: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempEvent.date}
                            onChange={(e) => setTempEvent({ ...tempEvent, date: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempEvent.organizer}
                            onChange={(e) => setTempEvent({ ...tempEvent, organizer: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempEvent.url}
                            onChange={(e) => setTempEvent({ ...tempEvent, url: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="file"
                            className="file-input file-input-bordered file-input-sm w-full md:col-span-2"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveEditEvent(index)} className="bg-green-600">Update</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Star className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg">{event.name}</h4>
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                              <Building className="w-3.5 h-3.5" /> {event.organizer} •
                              <Calendar className="w-3.5 h-3.5 ml-1" /> {event.date}
                            </p>
                            {event.url && (
                              <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 flex items-center gap-1.5 font-medium bg-primary/5 w-fit px-3 py-1 rounded-full border border-primary/20 transition-all hover:bg-primary/10">
                                <FileText className="w-4 h-4" /> View Document
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => handleEditEvent(index)} className="h-9 w-9 text-muted-foreground hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteEvent(index)} className="h-9 w-9 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
              />

              <Button
                variant="outline"
                className="w-full mt-8 border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all py-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-4 h-4 mr-2" /> Upload New Supporting Document
              </Button>
            </TabsContent>

            {/* Research Section */}
            <TabsContent value="research">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-foreground border-b-2 border-primary/20 pb-2 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-secondary" />
                  Research
                </h3>
                <Button
                  size="sm"
                  onClick={handleAddResearch}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </Button>
              </div>

              <div className="mb-8 p-4 bg-muted/40 rounded-xl border border-border flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <label className="text-sm font-bold text-foreground mb-1 block">Selected Category</label>
                  <select
                    value={selectedResearchCategory}
                    onChange={(e) => setSelectedResearchCategory(e.target.value as any)}
                    className="select select-bordered w-full md:w-72 bg-white text-foreground"
                  >
                    {Object.keys(researchData).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 text-sm text-muted-foreground italic md:pt-6">
                  Showing all published and filed records for {selectedResearchCategory}.
                </div>
              </div>

              {/* Add New Research Form */}
              {addingResearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 mb-6 bg-secondary/5 rounded-xl border-2 border-secondary/20 shadow-sm"
                >
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-secondary">
                    <Plus className="w-4 h-4" /> Add New {selectedResearchCategory}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Publication Title"
                        value={newResearch.title}
                        onChange={(e) => setNewResearch({ ...newResearch, title: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Year/Date</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={newResearch.date}
                        onChange={(e) => setNewResearch({ ...newResearch, date: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Organizer/Publisher</label>
                      <input
                        type="text"
                        placeholder="e.g., IEEE, Elsevier"
                        value={newResearch.organizer}
                        onChange={(e) => setNewResearch({ ...newResearch, organizer: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newResearch.url}
                        onChange={(e) => setNewResearch({ ...newResearch, url: e.target.value })}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Upload Document</label>
                      <input
                        type="file"
                        className="file-input file-input-bordered file-input-sm w-full bg-white text-foreground"
                      />
                    </div>
                    {selectedResearchCategory === "Conference" && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">Conference Type</label>
                        <select
                          value={newResearch.type}
                          onChange={(e) => setNewResearch({ ...newResearch, type: e.target.value })}
                          className="select select-bordered select-sm w-full bg-white text-foreground"
                        >
                          <option value="International">International</option>
                          <option value="National">National</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 justify-end mt-6">
                    <Button size="sm" variant="outline" onClick={() => setAddingResearch(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveNewResearch} className="bg-secondary text-white hover:bg-secondary/90">Save Research</Button>
                  </div>
                </motion.div>
              )}

              {/* Research List */}
              <div className="space-y-4">
                {researchData[selectedResearchCategory].length === 0 && (
                  <p className="text-center text-muted-foreground py-8 italic">No records found for this category.</p>
                )}
                {researchData[selectedResearchCategory].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-card rounded-xl border border-border hover:border-secondary/30 hover:shadow-md transition-all group"
                  >
                    {editingResearch?.index === index ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={tempResearch.title}
                            onChange={(e) => setTempResearch({ ...tempResearch, title: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempResearch.date}
                            onChange={(e) => setTempResearch({ ...tempResearch, date: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempResearch.organizer}
                            onChange={(e) => setTempResearch({ ...tempResearch, organizer: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="text"
                            value={tempResearch.url}
                            onChange={(e) => setTempResearch({ ...tempResearch, url: e.target.value })}
                            className="input input-bordered w-full text-foreground"
                          />
                          <input
                            type="file"
                            className="file-input file-input-bordered file-input-sm w-full md:col-span-2"
                          />
                          {selectedResearchCategory === "Conference" && (
                            <select
                              value={tempResearch.type}
                              onChange={(e) => setTempResearch({ ...tempResearch, type: e.target.value })}
                              className="select select-bordered select-sm w-full text-foreground md:col-span-2"
                            >
                              <option value="International">International</option>
                              <option value="National">National</option>
                            </select>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setEditingResearch(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveEditResearch(index)} className="bg-secondary text-white">Update</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mt-1">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg leading-tight">{item.title}</h4>
                            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
                              {item.organizer} • {item.date}
                            </p>
                            {item.url && (
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline mt-3 flex items-center gap-1.5 font-semibold bg-secondary/5 w-fit px-3 py-1 rounded-full border border-secondary/20 transition-all hover:bg-secondary/10">
                                <FileText className="w-4 h-4" /> View Document
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => handleEditResearch(index)} className="h-8 w-8 text-muted-foreground hover:text-secondary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteResearch(index)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}