import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/pages/faculty/hooks/use-toast";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Badge } from "@/pages/faculty/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/pages/faculty/components/ui/select";
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
  id?: number;
  membership_id?: number | string;
  degree: string;
  branch: string;
  college?: string;
  university: string;
  year?: string;
  percentage?: string;
  society_name?: string;
  status?: string;
}

interface MembershipDetail {
  id?: number;
  membership_id?: number | string;
  society_name: string;
  status?: string;
}

interface ExperienceDetail {
  id?: number;
  designation: string;
  institutionName: string;
  university: string;
  department: string;
  from: string;
  to: string;
  period?: string;
  current: boolean;
}

interface IndustryDetail {
  id?: number;
  jobTitle: string;
  company: string;
  location?: string;
  from: string;
  to: string;
  period?: string;
  current: boolean;
}

// Faculty data based on the Self-Appraisal Form
const initialFacultyData = {
  // Basic Information
  name: "C.Prathap",
  employeeId: "NS20T15",
  aicteId: "",
  coeId: "",
  designation: "Assistant Professor",
  department: "Artificial Intelligence and Data Science",
  collegeCode: "NS20T11",
  orcidId: "",
  dateOfBirth: "",
  age: "",
  dateOfJoining: "",
  email: "",
  phone: "+918072435849",
  address: "Vadapudupatti, Theni 625531",
  linkedinUrl: "",
  profilePhoto: "",
  phdStatus: "",
  thesisTitle: "",
  registerNo: "",
  guideName: "",
};

// Educational Qualifications
const educationalQualifications = [
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
// Subjects Handled
const subjectsHandled = [
  { program: "B.E - CSE", semester: "3", subject: "CS3301 - Data Structures", result: "82%", category: "T", url: "https://example.com/subject-proof-1.pdf" },
  { program: "B.Tech - AI&DS", semester: "4", subject: "CS3591 - Computer Networks", result: "100%", category: "P", url: "https://example.com/subject-proof-2.pdf" },
  { program: "B.Tech - IT", semester: "4", subject: "IT3401 - Web Technology", result: "92%", category: "TCL", url: "https://example.com/subject-proof-3.pdf" },
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
  const { user, updateUserData } = useAuth();
  const [selectedEventCategory, setSelectedEventCategory] = useState<keyof typeof initialEventsData>("Resource Person");
  const [selectedResearchCategory, setSelectedResearchCategory] = useState<keyof typeof initialResearchData>("Conference");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUserIdRef = useRef<any>(null);
  const [facultyData, setFacultyData] = useState({
    ...initialFacultyData,
    name: user?.name || initialFacultyData.name,
    email: user?.email || initialFacultyData.email,
    profilePhoto: user?.avatar || initialFacultyData.profilePhoto
  });

  useEffect(() => {
    if (user) {
      const departmentFullName = typeof user.department === 'object'
        ? user.department?.full_name || user.department?.short_name || ''
        : user.department || '';

      setFacultyData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        profilePhoto: user.avatar || prev.profilePhoto,
        designation: user.designation || prev.designation,
        department: departmentFullName || prev.department,
        linkedinUrl: (user as any)?.linkedin_url || prev.linkedinUrl
      }));
    }
  }, [user]);

  // fetch full faculty profile (IDs, dates, ORCID, linkedin) from backend
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch('/api/v1/faculty/me/profile', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const payload = await res.json();
        if (payload && payload.success && payload.data) {
          const p = payload.data;
          setFacultyData(prev => ({
            ...prev,
            aicteId: p.aicte_id ?? p.aicteId ?? prev.aicteId,
            coeId: p.coe_id ?? p.coeId ?? prev.coeId,
            orcidId: p.orcid_id ?? p.orcidId ?? prev.orcidId,
            dateOfBirth: p.date_of_birth ?? p.dob ?? prev.dateOfBirth,
            dateOfJoining: p.date_of_joining ?? p.dateOfJoining ?? prev.dateOfJoining,
            linkedinUrl: p.linkedin_url ?? p.linkedinUrl ?? prev.linkedinUrl,
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch department-admin profile', e);
      }
    })();
  }, [user]);

  // Fetch education and membership records from DB
  useEffect(() => {
    const fetchData = async () => {
      // helper to safely parse JSON only when content-type is JSON
      const safeJson = async (res: Response) => {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          try {
            return await res.json();
          } catch (e) {
            console.warn('[PROFILE] failed to parse JSON response', e);
            return null;
          }
        }
        console.warn('[PROFILE] non-JSON response, content-type=', ct, res.status);
        return null;
      };

      try {
        const token = localStorage.getItem('authToken');
        if (!token || !user) return;

        // Avoid duplicate fetches for the same user (helps with React StrictMode double-invoke in DEV)
        if (lastUserIdRef.current && user.id && lastUserIdRef.current === user.id) {
          return;
        }
        if (user.id) lastUserIdRef.current = user.id;

        const response = await fetch('/api/v1/faculty/education', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await safeJson(response);
        if (result && result.success && Array.isArray(result.data)) {
          // Education has 'degree', Memberships have 'society_name'
          const education = result.data.filter((item: any) => item.degree && item.degree !== 'Membership');
          const pMemberships = result.data.filter((item: any) => item.society_name || item.degree === 'Membership');

          setEducationData(education.map((r: any) => ({
            // Use primary id when provided; do not fall back to membership_id/faculty_id
            id: r.id ?? null,
            membership_id: r.membership_id,
            degree: r.degree,
            branch: r.branch,
            college: r.college,
            university: r.university,
            year: r.year,
            percentage: r.percentage,
            url: ""
          })));

          setMembershipData(pMemberships.map((r: any) => ({
            // Prefer DB primary id; keep membership_id separate
            id: r.id ?? null,
            membership_id: r.membership_id,
            society_name: r.society_name,
            status: r.status,
            url: ""
          })));
        }
        // Teaching experiences
        const expResponse = await fetch('/api/v1/faculty/experience', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const expResult = await safeJson(expResponse);
        if (expResult && expResult.success && Array.isArray(expResult.data)) {
          setTeachingExpData(expResult.data.map((r: any) => ({
            id: r.id,
            designation: r.designation,
            institutionName: r.institution_name,
            university: r.university,
            department: r.department,
            from: r.from_date,
            to: r.to_date,
            period: r.period,
            current: r.is_current,
            url: ""
          })));
        }

        // Industry experiences (separate table)
        const indResponse = await fetch('/api/v1/faculty/experience/industry', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const indResult = await safeJson(indResponse);
        if (indResult && indResult.success && Array.isArray(indResult.data)) {
          setIndustryExpData(indResult.data.map((r: any) => ({
            id: r.id,
            jobTitle: r.job_title,
            company: r.company,
            location: r.location,
            from: r.from_date,
            to: r.to_date,
            period: r.period,
            current: r.is_current,
            url: ""
          })));
        }
        // PhD records (faculty_phd table)
        try {
          const phdResponse = await fetch('/api/v1/faculty/phd', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!phdResponse.ok) {
            // Endpoint may not exist on backend; skip without attempting to parse HTML error pages
            console.debug('[PROFILE] /faculty/phd returned', phdResponse.status, phdResponse.statusText);
          } else {
            const phdResult = await safeJson(phdResponse);
            if (phdResult && phdResult.success && Array.isArray(phdResult.data)) {
              const entries = phdResult.data.map((r: any) => ({
                id: r.phd_id ?? r.id ?? null,
                orcidId: r.orcid_id ?? r.orcidId ?? "",
                phdStatus: r.status ?? r.phd_status ?? r.phdStatus ?? "",
                thesisTitle: r.thesis_title ?? r.thesisTitle ?? "",
                registerNo: r.register_no ?? r.registerNo ?? "",
                guideName: r.guide_name ?? r.guideName ?? "",
              }));

              if (entries.length > 0) {
                const primary = entries[0];
                if (primary.id) setPrimaryPhdId(primary.id);
                setFacultyData(prev => ({
                  ...prev,
                  phdStatus: primary.phdStatus || prev.phdStatus,
                  orcidId: primary.orcidId || prev.orcidId,
                  thesisTitle: primary.thesisTitle || prev.thesisTitle,
                  registerNo: primary.registerNo || prev.registerNo,
                  guideName: primary.guideName || prev.guideName,
                }));

                setPhdList(entries.slice(1));
              }
            }
          }
        } catch (e) {
          console.warn('Failed to fetch PhD records', e);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Events and Research states
  const [eventsData, setEventsData] = useState(initialEventsData);
  const [researchData, setResearchData] = useState(initialResearchData);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);

  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{ index: number } | null>(null);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", organizer: "", url: "" });
  const [tempEvent, setTempEvent] = useState({ name: "", date: "", organizer: "", url: "" });
  const [newEventOrganizerType, setNewEventOrganizerType] = useState<"" | "organized" | "participated">("");

  const [addingResearch, setAddingResearch] = useState(false);
  const [editingResearch, setEditingResearch] = useState<{ index: number } | null>(null);
  const [newResearch, setNewResearch] = useState({ title: "", date: "", organizer: "", url: "", type: "International" });
  const [tempResearch, setTempResearch] = useState({ title: "", date: "", organizer: "", url: "", type: "International" });

  // Individual edit states for each field
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);

  const [educationData, setEducationData] = useState<EducationDetail[]>([]);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [tempEducation, setTempEducation] = useState<EducationDetail | null>(null);
  const [addingEducation, setAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState<EducationDetail>({
    degree: "",
    branch: "",
    college: "Nadar Saraswathi College of Engineering and Technology",
    university: "",
    year: "",
    percentage: "",
    society_name: "",
  });
  const [newDegreeIsOther, setNewDegreeIsOther] = useState(false);
  const [newBranchIsOther, setNewBranchIsOther] = useState(false);

  const [membershipData, setMembershipData] = useState<MembershipDetail[]>([]);
  const [editingMembership, setEditingMembership] = useState<number | null>(null);
  const [tempMembership, setTempMembership] = useState<MembershipDetail | null>(null);
  const [addingMembership, setAddingMembership] = useState(false);
  const [newMembership, setNewMembership] = useState<MembershipDetail>({
    membership_id: "",
    society_name: "",
    status: "Active",
  });

  // Experience states
  const [teachingExpData, setTeachingExpData] = useState<ExperienceDetail[]>([]);
  const [editingTeachingExp, setEditingTeachingExp] = useState<number | null>(null);
  const [tempTeachingExp, setTempTeachingExp] = useState<ExperienceDetail | null>(null);
  const [addingTeachingExp, setAddingTeachingExp] = useState(false);
  const [newTeachingExp, setNewTeachingExp] = useState<ExperienceDetail>({
    designation: "",
    institutionName: "Nadar Saraswathi College of Engineering and Technology",
    university: "",
    department: "",
    from: "",
    to: "",
    period: "",
    current: false,
  });
  const [newDesignationIsOther, setNewDesignationIsOther] = useState(false);
  const [newTeachingDeptIsOther, setNewTeachingDeptIsOther] = useState(false);

  const [industryExpData, setIndustryExpData] = useState<IndustryDetail[]>([]);
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
  });
  const [newJobTitleIsOther, setNewJobTitleIsOther] = useState(false);

  // PhD editing states
  const [editingPhd, setEditingPhd] = useState(false);
  const [tempPhd, setTempPhd] = useState({
    orcidId: "",
    phdStatus: "",
    thesisTitle: "",
    registerNo: "",
    guideName: "",
  });
  const [addingPhd, setAddingPhd] = useState(false);
  const [newPhd, setNewPhd] = useState({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
  const [phdList, setPhdList] = useState<{ id?: number; orcidId: string; phdStatus: string; thesisTitle: string; registerNo: string; guideName: string }[]>([]);
  const [editingPhdIndex, setEditingPhdIndex] = useState<number | null>(null);
  const [tempPhdEntry, setTempPhdEntry] = useState({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
  const [primaryPhdId, setPrimaryPhdId] = useState<number | null>(null);

  function validateEmail(email: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }

  function validatePhone(phone: string) {
    return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
  }

  function validateLinkedInUrl(url: string) {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('linkedin.com');
    } catch {
      return false;
    }
  }

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setFieldError("");
  };

  const handleDeletePrimaryPhd = async () => {
    if (!window.confirm('Are you sure you want to delete your primary PhD record?')) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setLoading(true);
    try {
      if (primaryPhdId) {
        const response = await fetch(`/api/v1/faculty/phd/${primaryPhdId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json().catch(() => ({}));
        if (result && result.success) {
          setFacultyData(prev => ({ ...prev, phdStatus: "", orcidId: "", thesisTitle: "", registerNo: "", guideName: "" }));
          setPrimaryPhdId(null);
          try {
            const phdResp = await fetch('/api/v1/faculty/phd', { headers: { 'Authorization': `Bearer ${token}` } });
            if (phdResp.ok) {
              const phdJson = await phdResp.json();
              if (phdJson && phdJson.success && Array.isArray(phdJson.data)) {
                const entries = phdJson.data.map((r: any) => ({
                  id: r.phd_id ?? r.id ?? null,
                  orcidId: r.orcid_id ?? r.orcidId ?? "",
                  phdStatus: r.status ?? r.phd_status ?? r.phdStatus ?? "",
                  thesisTitle: r.thesis_title ?? r.thesisTitle ?? "",
                  registerNo: r.register_no ?? r.registerNo ?? "",
                  guideName: r.guide_name ?? r.guideName ?? "",
                }));
                if (entries.length > 0) {
                  const primary = entries[0];
                  if (primary.id) setPrimaryPhdId(primary.id);
                  setFacultyData(prev => ({
                    ...prev,
                    phdStatus: primary.phdStatus || prev.phdStatus,
                    orcidId: primary.orcidId || prev.orcidId,
                    thesisTitle: primary.thesisTitle || prev.thesisTitle,
                    registerNo: primary.registerNo || prev.registerNo,
                    guideName: primary.guideName || prev.guideName,
                  }));
                  setPhdList(entries.slice(1));
                } else {
                  setPhdList([]);
                }
              }
            }
          } catch (e) {
            console.warn('Failed to refresh phd list after primary delete', e);
          }
          toast({ title: 'PhD record deleted' });
        } else {
          throw new Error(result.message || 'Failed to delete primary PhD record');
        }
      } else {
        const resp = await fetch('/api/v1/faculty/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ phd_status: "", orcid_id: null, thesis_title: null, register_no: null, guide_name: null })
        });
        if (resp.ok) {
          setFacultyData(prev => ({ ...prev, phdStatus: "", orcidId: "", thesisTitle: "", registerNo: "", guideName: "" }));
          setPhdList([]);
          toast({ title: 'PhD record cleared' });
        } else {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to clear primary PhD');
        }
      }
    } catch (error: any) {
      console.error('Delete primary PhD error', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete primary PhD record.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
    setFieldError("");
  };

  const handleSaveField = async (field: string) => {
    // Validate based on field type
    let valueToSave = tempValue;
    if (field === "email") {
      if (!validateEmail(tempValue)) {
        setFieldError("Invalid email format");
        return;
      }
    } else if (field === "phone") {
      // normalize phone to include +91 when only 10 digits provided
      const digits = tempValue.replace(/\D/g, '');
      let normalized = digits;
      if (digits.length === 10) {
        normalized = '91' + digits;
      }
      if (!normalized.startsWith('91')) {
        // if no country code, keep digits as-is and validation will fail
        normalized = digits;
      }
      const formatted = (normalized.startsWith('+') ? normalized : '+' + normalized);
      if (!validatePhone(formatted)) {
        setFieldError("Invalid phone number");
        return;
      }
      // use formatted value for saving below
      valueToSave = formatted;
    } else if (field === "linkedin_url") {
      if (!validateLinkedInUrl(tempValue)) {
        setFieldError("Invalid LinkedIn URL (must be from linkedin.com)");
        return;
      }
    } else if (field === "address") {
      if (tempValue.trim().length === 0) {
        setFieldError("Address cannot be empty");
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('[PROFILE UPDATE] Token from localStorage:', token ? 'EXISTS' : 'MISSING');

      if (!token) {
        setFieldError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const updatePayload: any = {};
      updatePayload[field] = valueToSave;

      const response = await fetch('/api/v1/faculty/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PROFILE UPDATE ERROR]', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        setFieldError(errorData.message || 'Failed to update profile');
        setLoading(false);
        return;
      }

      await response.json();

      setFacultyData((prev) => ({
        ...prev,
        [field]: valueToSave,
      }));
      setEditingField(null);
      setTempValue("");
      setFieldError("");

      toast({
        title: 'Profile updated',
        description: `Your ${field} has been updated successfully.`
      });
    } catch (error) {
      console.error('Update error:', error);
      setFieldError('Failed to update profile. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const recId = educationData[index]?.id;
    console.debug('[PROFILE] handleSaveEducation', { recId, hasToken: !!token });
    if (recId === undefined || recId === null) {
      toast({ title: 'Error', description: 'Record id missing; cannot update.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/faculty/education/${recId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          degree: tempEducation.degree || null,
          branch: tempEducation.branch || null,
          college: tempEducation.college || null,
          university: tempEducation.university || null,
          year: tempEducation.year || null,
          percentage: tempEducation.percentage || null,
          url: tempEducation.url || null
        })
      });

      const result = await response.json();
      if (result.success) {
        const updated = [...educationData];
        updated[index] = { ...tempEducation, id: result.data.id };
        setEducationData(updated);
        setEditingEducation(null);
        setTempEducation(null);
        toast({
          title: 'Education updated',
          description: 'Educational qualification has been updated successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to update record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update education record.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const recId = membershipData[index]?.id;
    console.debug('[PROFILE] handleSaveMembership', { recId, hasToken: !!token });
    if (recId === undefined || recId === null) {
      toast({ title: 'Error', description: 'Record id missing; cannot update.', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(`/api/v1/faculty/education/${recId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          society_name: tempMembership.society_name || null,
          status: tempMembership.status || null,
          membership_id: tempMembership.membership_id || null,
          url: tempMembership.url || null
        })
      });

      const result = await response.json();
      if (result.success) {
        const updated = [...membershipData];
        updated[index] = { ...tempMembership, id: result.data.id };
        setMembershipData(updated);
        setEditingMembership(null);
        setTempMembership(null);
        toast({
          title: 'Membership updated'
        });
      } else {
        throw new Error(result.error || 'Failed to update record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update membership record.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
      college: "Nadar Saraswathi College of Engineering and Technology",
      university: "",
      year: "",
      percentage: "",
      society_name: "",
    });
  };

  const handleCancelAddEducation = () => {
    setAddingEducation(false);
    setNewDegreeIsOther(false);
    setNewBranchIsOther(false);
    setNewEducation({
      degree: "",
      branch: "",
      college: "Nadar Saraswathi College of Engineering and Technology",
      university: "",
      year: "",
      percentage: "",
      society_name: "",
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

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          degree: newEducation.degree || '',
          branch: newEducation.branch || '',
          college: newEducation.college || '',
          university: newEducation.university || '',
          year: newEducation.year || '',
          percentage: newEducation.percentage || '',
          society_name: newEducation.society_name || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        const updatedRow = { ...newEducation, id: result.data.id };

        // Update Education state
        if (educationData.some(e => e.id === result.data.id)) {
          setEducationData(educationData.map(e => e.id === result.data.id ? updatedRow : e));
        } else {
          setEducationData([...educationData, updatedRow]);
        }

        // Also update Membership state if this row exists there
        if (membershipData.some(m => m.id === result.data.id)) {
          setMembershipData(membershipData.map(m => m.id === result.data.id ? { ...m, ...result.data } : m));
        }

        setAddingEducation(false);
        setNewDegreeIsOther(false);
        setNewBranchIsOther(false);
        setNewEducation({
          degree: "",
          branch: "",
          college: "Nadar Saraswathi College of Engineering and Technology",
          university: "",
          year: "",
          percentage: "",
          url: "",
        });
        toast({
          title: 'Education added',
          description: 'New educational qualification has been added successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to save record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save education record.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewEducationChange = (field: string, value: string) => {
    setNewEducation((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteEducation = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this educational qualification?')) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/education/${educationData[index].id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          // Remove from education list
          setEducationData(educationData.filter((_, i) => i !== index));
          // Also remove from membership list if it exists there
          setMembershipData(membershipData.filter(m => m.id !== educationData[index].id));

          toast({
            title: 'Education deleted',
            description: 'Educational qualification has been deleted successfully.'
          });
        } else {
          throw new Error(result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete education record.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Add new membership handlers
  const handleAddMembership = () => {
    setAddingMembership(true);
    setNewMembership({
      membership_id: "",
      society_name: "",
      status: "Active",
    });
  };

  const handleCancelAddMembership = () => {
    setAddingMembership(false);
    setNewMembership({
      membership_id: "",
      society_name: "",
      status: "Active",
      url: "",
    });
  };

  const handleSaveNewMembership = async () => {
    // Validate required fields
    if (!newMembership.society_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in society name field.',
        variant: 'destructive'
      });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          society_name: newMembership.society_name || '',
          status: newMembership.status || 'Active',
          degree: 'Membership',
          branch: 'Professional Membership',
          university: 'Professional Organization',
          college: ''
        })
      });

      const result = await response.json();
      if (result.success) {
        const updatedRow = { ...newMembership, id: result.data.id };

        // Update Membership state
        if (membershipData.some(m => m.id === result.data.id)) {
          setMembershipData(membershipData.map(m => m.id === result.data.id ? updatedRow : m));
        } else {
          setMembershipData([...membershipData, updatedRow]);
        }

        // Also update Education state if this row exists there
        if (educationData.some(e => e.id === result.data.id)) {
          setEducationData(educationData.map(e => e.id === result.data.id ? { ...e, ...result.data } : e));
        }

        setAddingMembership(false);
        setNewMembership({
          membership_id: "",
          society_name: "",
          status: "Active",
        });
        toast({
          title: 'Membership added'
        });
      } else {
        throw new Error(result.error || 'Failed to save record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save membership record.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewMembershipChange = (field: string, value: string) => {
    setNewMembership((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteMembership = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/education/${membershipData[index].id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          // Remove from membership list
          setMembershipData(membershipData.filter((_, i) => i !== index));
          // Also remove from education list if it exists there
          setEducationData(educationData.filter(e => e.id !== membershipData[index].id));

          toast({
            title: 'Membership deleted',
            description: 'Professional membership has been deleted successfully.'
          });
        } else {
          throw new Error(result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete membership record.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Teaching Experience handlers
  const handleAddTeachingExp = () => {
    setAddingTeachingExp(true);
    setNewDesignationIsOther(false);
    setNewTeachingDeptIsOther(false);
    setNewTeachingExp({
      designation: "",
      institutionName: "Nadar Saraswathi College of Engineering and Technology",
      university: "",
      department: "",
      from: "",
      to: "",
      period: "",
      current: false,
    });
  };

  const handleCancelAddTeachingExp = () => {
    setAddingTeachingExp(false);
    setNewDesignationIsOther(false);
    setNewTeachingDeptIsOther(false);
    setNewTeachingExp({
      designation: "",
      institutionName: "Nadar Saraswathi College of Engineering and Technology",
      university: "",
      department: "",
      from: "",
      to: "",
      period: "",
      current: false,
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

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          designation: newTeachingExp.designation,
          institution_name: newTeachingExp.institutionName,
          university: newTeachingExp.university,
          department: newTeachingExp.department,
          from_date: newTeachingExp.from,
          to_date: newTeachingExp.to,
          period: newTeachingExp.period,
          is_current: newTeachingExp.current
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update both sections if the row is shared
        const updatedEntry = {
          id: result.data.id,
          designation: result.data.designation,
          institutionName: result.data.institution_name,
          university: result.data.university,
          department: result.data.department,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current,
        };

        const existingIndex = teachingExpData.findIndex(e => e.id === result.data.id);
        if (existingIndex > -1) {
          const updated = [...teachingExpData];
          updated[existingIndex] = updatedEntry;
          setTeachingExpData(updated);
        } else {
          setTeachingExpData([...teachingExpData, updatedEntry]);
        }

        // Also update industry if it exists there
        setIndustryExpData(industryExpData.map(e => e.id === result.data.id ? {
          ...e,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current
        } : e));

        setAddingTeachingExp(false);
        setNewDesignationIsOther(false);
        setNewTeachingDeptIsOther(false);
        setNewTeachingExp({
          designation: "",
          institutionName: "Nadar Saraswathi College of Engineering and Technology",
          university: "",
          department: "",
          from: "",
          to: "",
          period: "",
          current: false,
        });
        toast({
          title: 'Experience added',
          description: 'Teaching experience has been added successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to save experience');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save teaching experience.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const recId = teachingExpData[index]?.id;
    console.debug('[PROFILE] handleSaveTeachingExp', { recId, hasToken: !!token });
    if (recId === undefined || recId === null) {
      toast({ title: 'Error', description: 'Record id missing; cannot update.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/faculty/experience/${recId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          designation: tempTeachingExp.designation,
          institution_name: tempTeachingExp.institutionName,
          university: tempTeachingExp.university,
          department: tempTeachingExp.department,
          from_date: tempTeachingExp.from,
          to_date: tempTeachingExp.to,
          period: tempTeachingExp.period,
          is_current: tempTeachingExp.current
        })
      });

      const result = await response.json();
      if (result.success) {
        const updated = [...teachingExpData];
        updated[index] = { ...tempTeachingExp, id: result.data.id };
        setTeachingExpData(updated);

        // Update industry if shared
        setIndustryExpData(industryExpData.map(e => e.id === result.data.id ? {
          ...e,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current
        } : e));

        setEditingTeachingExp(null);
        setTempTeachingExp(null);
        toast({
          title: 'Experience updated',
          description: 'Teaching experience has been updated successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to update record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update teaching experience.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeachingExpFieldChange = (field: string, value: string | boolean) => {
    setTempTeachingExp((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDeleteTeachingExp = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this teaching experience?')) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/experience/${teachingExpData[index].id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          // Remove from teaching list
          setTeachingExpData(teachingExpData.filter((_, i) => i !== index));
          // Also remove from industry list if it exists there
          setIndustryExpData(industryExpData.filter(m => m.id !== teachingExpData[index].id));

          toast({
            title: 'Experience deleted',
            description: 'Teaching experience has been deleted successfully.'
          });
        } else {
          throw new Error(result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete teaching experience.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Industry Experience handlers
  const handleAddIndustryExp = () => {
    setAddingIndustryExp(true);
    setNewJobTitleIsOther(false);
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
    setNewJobTitleIsOther(false);
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

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/experience/industry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_title: newIndustryExp.jobTitle,
          company: newIndustryExp.company,
          location: newIndustryExp.location,
          from_date: newIndustryExp.from,
          to_date: newIndustryExp.to,
          period: newIndustryExp.period,
          is_current: newIndustryExp.current
        })
      });

      const result = await response.json();
      if (result.success) {
        setAddingIndustryExp(false);
        setNewJobTitleIsOther(false);

        const updatedEntry = {
          id: result.data.id,
          jobTitle: result.data.job_title,
          company: result.data.company,
          location: result.data.location,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current,
        };

        const existingIndex = industryExpData.findIndex(e => e.id === result.data.id);
        if (existingIndex > -1) {
          const updated = [...industryExpData];
          updated[existingIndex] = updatedEntry;
          setIndustryExpData(updated);
        } else {
          setIndustryExpData([...industryExpData, updatedEntry]);
        }

        // Update teaching if shared
        setTeachingExpData(teachingExpData.map(e => e.id === result.data.id ? {
          ...e,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current
        } : e));

        setNewIndustryExp({
          jobTitle: "",
          company: "",
          location: "",
          from: "",
          to: "",
          period: "",
          current: false,
        });
        toast({
          title: 'Experience added',
          description: 'Industry experience has been added successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to save experience');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save industry experience.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const recId = industryExpData[index]?.id;
    console.debug('[PROFILE] handleSaveIndustryExp', { recId, hasToken: !!token });
    if (recId === undefined || recId === null) {
      toast({ title: 'Error', description: 'Record id missing; cannot update.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/faculty/experience/industry/${recId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_title: tempIndustryExp.jobTitle,
          company: tempIndustryExp.company,
          location: tempIndustryExp.location,
          from_date: tempIndustryExp.from,
          to_date: tempIndustryExp.to,
          period: tempIndustryExp.period,
          is_current: tempIndustryExp.current
        })
      });

      const result = await response.json();
      if (result.success) {
        const updated = [...industryExpData];
        updated[index] = { ...tempIndustryExp, id: result.data.id };
        setIndustryExpData(updated);

        // Update teaching if shared
        setTeachingExpData(teachingExpData.map(e => e.id === result.data.id ? {
          ...e,
          from: result.data.from_date,
          to: result.data.to_date,
          period: result.data.period,
          current: result.data.is_current
        } : e));

        setEditingIndustryExp(null);
        setTempIndustryExp(null);
        toast({
          title: 'Experience updated',
          description: 'Industry experience has been updated successfully.'
        });
      } else {
        throw new Error(result.error || 'Failed to update record');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update industry experience.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryExpFieldChange = (field: string, value: string | boolean) => {
    setTempIndustryExp((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDeleteIndustryExp = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this industry experience?')) {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/experience/industry/${industryExpData[index].id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (result.success) {
          // If record was fully deleted, remove from both lists
          if (!result.data || Object.keys(result.data).length === 0) {
            setIndustryExpData(industryExpData.filter((_, i) => i !== index));
            setTeachingExpData(teachingExpData.filter(m => m.id !== industryExpData[index].id));
          } else {
            // Record was just updated (section cleared), remove from industry list
            setIndustryExpData(industryExpData.filter((_, i) => i !== index));
            // Update teaching list if it exists there
            setTeachingExpData(teachingExpData.map(m => m.id === result.data.id ? {
              ...m,
              from: result.data.from_date,
              to: result.data.to_date,
              period: result.data.period,
              current: result.data.is_current
            } : m));
          }

          toast({
            title: 'Experience deleted',
            description: 'Industry experience has been cleared successfully.'
          });
        } else {
          throw new Error(result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete industry experience.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Events Handlers
  const handleAddEvent = () => {
    setAddingEvent(true);
    setNewEventOrganizerType("");
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
    setNewEventOrganizerType("");
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

  const handleEditPhd = () => {
    setEditingPhd(true);
    setTempPhd({
      orcidId: facultyData.orcidId || "",
      phdStatus: facultyData.phdStatus || "",
      thesisTitle: facultyData.thesisTitle || "",
      registerNo: facultyData.registerNo || "",
      guideName: facultyData.guideName || "",
    });
  };

  const handleCancelEditPhd = () => {
    setEditingPhd(false);
  };

  const handleSavePhd = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      // Update phd_status on faculty profile
      const resp = await fetch('/api/v1/faculty/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          phd_status: tempPhd.phdStatus,
          orcid_id: tempPhd.orcidId,
          thesis_title: tempPhd.thesisTitle,
          register_no: tempPhd.registerNo,
          guide_name: tempPhd.guideName
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update PhD status');
      }

      // Update local UI state
      setFacultyData((prev) => ({
        ...prev,
        phdStatus: tempPhd.phdStatus,
        orcidId: tempPhd.orcidId || prev.orcidId,
        thesisTitle: tempPhd.thesisTitle || prev.thesisTitle,
        registerNo: tempPhd.registerNo || prev.registerNo,
        guideName: tempPhd.guideName || prev.guideName,
      }));
      // Refresh phd list from server
      try {
        const phdRes = await fetch('/api/v1/faculty/phd', { headers: { 'Authorization': `Bearer ${token}` } });
        if (phdRes.ok) {
          const phdJson = await phdRes.json();
          if (phdJson.success && Array.isArray(phdJson.data)) {
              const entries = phdJson.data.map((r: any) => ({
                id: r.phd_id ?? r.id ?? null,
                orcidId: r.orcid_id ?? r.orcidId ?? "",
                phdStatus: r.status ?? r.phd_status ?? r.phdStatus ?? "",
                thesisTitle: r.thesis_title ?? r.thesisTitle ?? "",
                registerNo: r.register_no ?? r.registerNo ?? "",
                guideName: r.guide_name ?? r.guideName ?? "",
              }));
              if (entries.length > 0) {
                const primary = entries[0];
                if (primary.id) setPrimaryPhdId(primary.id);
                setFacultyData(prev => ({
                  ...prev,
                  phdStatus: primary.phdStatus || prev.phdStatus,
                  orcidId: primary.orcidId || prev.orcidId,
                  thesisTitle: primary.thesisTitle || prev.thesisTitle,
                  registerNo: primary.registerNo || prev.registerNo,
                  guideName: primary.guideName || prev.guideName,
                }));
                setPhdList(entries.slice(1));
              } else {
                setPhdList([]);
              }
          }
        }
      } catch (e) {
        console.warn('Failed to refresh phd list', e);
      }
      setEditingPhd(false);
      toast({ title: 'PhD details updated', description: 'Your PhD information has been updated successfully.' });
    } catch (error: any) {
      console.error('Failed to save PhD details', error);
      toast({ title: 'Error', description: error.message || 'Failed to update PhD details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhdFieldChange = (field: string, value: string) => {
    setTempPhd(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhd = () => {
    setAddingPhd(true);
    setNewPhd({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
  };

  const handleCancelAddPhd = () => {
    setAddingPhd(false);
    setNewPhd({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
  };

  const handleSaveNewPhd = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Fallback to local addition
      setPhdList(prev => [...prev, { ...newPhd }]);
      setAddingPhd(false);
      setNewPhd({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
      toast({ title: 'PhD record added', description: 'New PhD record has been added locally (not persisted).' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/phd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newPhd.phdStatus,
          orcid_id: newPhd.orcidId,
          thesis_title: newPhd.thesisTitle,
          register_no: newPhd.registerNo,
          guide_name: newPhd.guideName
        })
      });

      const result = await response.json();
      if (result.success) {
        // Refresh PhD list from backend so UI reflects canonical data
        try {
          const phdResp = await fetch('/api/v1/faculty/phd', { headers: { 'Authorization': `Bearer ${token}` } });
          if (phdResp.ok) {
            const phdJson = await phdResp.json();
            if (phdJson && phdJson.success && Array.isArray(phdJson.data)) {
              const entries = phdJson.data.map((r: any) => ({
                id: r.phd_id ?? r.id ?? null,
                orcidId: r.orcid_id ?? r.orcidId ?? "",
                phdStatus: r.status ?? r.phd_status ?? r.phdStatus ?? "",
                thesisTitle: r.thesis_title ?? r.thesisTitle ?? "",
                registerNo: r.register_no ?? r.registerNo ?? "",
                guideName: r.guide_name ?? r.guideName ?? "",
              }));

              if (entries.length > 0) {
                const primary = entries[0];
                if (primary.id) setPrimaryPhdId(primary.id);
                setFacultyData(prev => ({
                  ...prev,
                  phdStatus: primary.phdStatus || prev.phdStatus,
                  orcidId: primary.orcidId || prev.orcidId,
                  thesisTitle: primary.thesisTitle || prev.thesisTitle,
                  registerNo: primary.registerNo || prev.registerNo,
                  guideName: primary.guideName || prev.guideName,
                }));
                setPhdList(entries.slice(1));
              }
            }
          }
        } catch (e) {
          console.warn('Failed to refresh PhD records after create', e);
        }

        setAddingPhd(false);
        setNewPhd({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });
        toast({ title: 'PhD record added', description: 'New PhD record has been saved.' });
      } else {
        throw new Error(result.message || result.error || 'Failed to save PhD record');
      }
    } catch (error: any) {
      console.error('Failed to save PhD record', error);
      toast({ title: 'Error', description: error.message || 'Failed to save PhD record.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdditionalPhd = async (index: number) => {
    const entry = phdList[index];
    if (entry?.id) {
      if (!window.confirm('Are you sure you want to delete this PhD record?')) return;
      const token = localStorage.getItem('authToken');
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/phd/${entry.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setPhdList(prev => prev.filter((_, i) => i !== index));
          setEditingPhdIndex(null);
          toast({ title: 'PhD record deleted' });
        } else {
          throw new Error(result.message || 'Failed to delete PhD record');
        }
      } catch (error: any) {
        console.error('Delete PhD error', error);
        toast({ title: 'Error', description: error.message || 'Failed to delete PhD record.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      setPhdList(prev => prev.filter((_, i) => i !== index));
      setEditingPhdIndex(null);
      toast({ title: 'PhD record deleted' });
    }
  };

  const handleEditPhdEntry = (index: number) => {
    setEditingPhdIndex(index);
    setTempPhdEntry({ ...phdList[index] });
  };

  const handleSavePhdEntry = (index: number) => {
    const updated = [...phdList];
    updated[index] = { ...tempPhdEntry };
    setPhdList(updated);
    setEditingPhdIndex(null);
    toast({ title: 'PhD record updated' });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/v1/auth/avatar', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          updateUserData({ avatar: result.data });
          toast({
            title: 'Success',
            description: 'Profile photo updated successfully.'
          });
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload profile photo.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownloadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/v1/faculty/download-profile', {
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
          <h1 className="page-header font-serif">Department Admin Profile</h1>
          <p className="text-muted-foreground -mt-4"></p>
        </div>
        <div className="flex items-center gap-3">
         
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
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={user?.avatar || "/src/assets/prathap.png"}
                  alt={facultyData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Edit2 className="w-6 h-6 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
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
            {facultyData.aicteId ? (
              <div className="flex items-center gap-3 text-sm">
                <Building className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">AICTE ID: {facultyData.aicteId}</span>
              </div>
            ) : null}
            {/* COE ID */}
            {facultyData.coeId ? (
              <div className="flex items-center gap-3 text-sm">
                <Building className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">COE ID: {facultyData.coeId}</span>
              </div>
            ) : null}

            {/* ORCID ID */}
            {facultyData.orcidId ? (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">ORCID ID: {facultyData.orcidId}</span>
              </div>
            ) : null}

            {/* DOB & Age */}
            {facultyData.dateOfBirth ? (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">DOB:</span>
                <span className="font-medium">{facultyData.dateOfBirth} {facultyData.age ? `(Age: ${facultyData.age})` : ''}</span>
              </div>
            ) : null}

            {/* Date of Joining */}
            {facultyData.dateOfJoining ? (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Date of Joined:</span>
                <span className="font-medium">{facultyData.dateOfJoining}</span>
              </div>
            ) : null}

            {/* LinkedIn URL */}
            <div className="flex items-start gap-3 text-sm group">
              <div className="w-8 h-8 rounded-full bg-[#0077B5]/10 flex items-center justify-center flex-shrink-0">
                <Linkedin className="w-4 h-4 text-[#0077B5]" />
              </div>
              {editingField === 'linkedin_url' ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    value={tempValue}
                    onChange={(e) => {
                      setTempValue(e.target.value);
                      setFieldError("");
                    }}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    className="input input-bordered input-sm w-full text-sm"
                    disabled={loading}
                    autoFocus
                  />
                  {fieldError && (
                    <p className="text-xs text-red-500 font-medium">{fieldError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveField('linkedin_url')}
                      disabled={loading}
                      className="h-8 px-3 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="h-8 px-3"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  {facultyData.linkedinUrl ? (
                    <a
                      href={facultyData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium truncate"
                    >
                      LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-muted-foreground">LinkedIn Profile</span>
                  )}
                  <button
                    onClick={() => handleEditField('linkedin_url', facultyData.linkedinUrl)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded ml-2 flex-shrink-0"
                    title="Edit LinkedIn URL"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 text-sm group">
              <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              {editingField === 'email' ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="email"
                    value={tempValue}
                    onChange={(e) => {
                      setTempValue(e.target.value);
                      setFieldError("");
                    }}
                    placeholder="Enter email address"
                    className="input input-bordered input-sm w-full text-sm"
                    disabled={loading}
                    autoFocus
                  />
                  {fieldError && (
                    <p className="text-xs text-red-500 font-medium">{fieldError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveField('email')}
                      disabled={loading}
                      className="h-8 px-3 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="h-8 px-3"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium text-sm break-all">{facultyData.email}</span>
                  <button
                    onClick={() => handleEditField('email', facultyData.email)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded ml-2 flex-shrink-0"
                    title="Edit email"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 text-sm group">
              <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              {editingField === 'phone' ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={(e) => {
                      setTempValue(e.target.value);
                      setFieldError("");
                    }}
                    placeholder="Enter phone number"
                    className="input input-bordered input-sm w-full text-sm"
                    disabled={loading}
                    autoFocus
                  />
                  {fieldError && (
                    <p className="text-xs text-red-500 font-medium">{fieldError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveField('phone')}
                      disabled={loading}
                      className="h-8 px-3 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="h-8 px-3"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{facultyData.phone}</span>
                  <button
                    onClick={() => handleEditField('phone', facultyData.phone)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded ml-2 flex-shrink-0"
                    title="Edit phone"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
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
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
              <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
              <TabsTrigger value="phd" className="text-xs">PhD Status</TabsTrigger>
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
                        {newDegreeIsOther ? (
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Type your degree"
                              value={newEducation.degree}
                              onChange={(e) => handleNewEducationChange('degree', e.target.value)}
                              className="input input-bordered text-sm h-10 pr-8 w-full"
                              disabled={loading}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setNewDegreeIsOther(false); handleNewEducationChange('degree', ''); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Select
                            value={newEducation.degree}
                            onValueChange={(value) => {
                              if (value === "Other") {
                                setNewDegreeIsOther(true);
                                handleNewEducationChange('degree', '');
                              } else {
                                handleNewEducationChange('degree', value);
                              }
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Degree" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ph.D.">Ph.D.</SelectItem>
                              <SelectItem value="M.E.">M.E.</SelectItem>
                              <SelectItem value="B.E.">B.E.</SelectItem>
                              <SelectItem value="B.Tech">B.Tech</SelectItem>
                              <SelectItem value="M.Tech">M.Tech</SelectItem>
                              <SelectItem value="M.S.">M.S.</SelectItem>
                              <SelectItem value="Diploma">Diploma</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Branch *</label>
                        {newBranchIsOther ? (
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Type your branch"
                              value={newEducation.branch}
                              onChange={(e) => handleNewEducationChange('branch', e.target.value)}
                              className="input input-bordered text-sm h-10 pr-8 w-full"
                              disabled={loading}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setNewBranchIsOther(false); handleNewEducationChange('branch', ''); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Select
                            value={newEducation.branch}
                            onValueChange={(value) => {
                              if (value === "Other") {
                                setNewBranchIsOther(true);
                                handleNewEducationChange('branch', '');
                              } else {
                                handleNewEducationChange('branch', value);
                              }
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                              <SelectItem value="Electronics & Communication Engineering">Electronics & Communication Engineering</SelectItem>
                              <SelectItem value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</SelectItem>
                              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                              <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                              <SelectItem value="Information Technology">Information Technology</SelectItem>
                              <SelectItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</SelectItem>
                              <SelectItem value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</SelectItem>
                              <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                              <SelectItem value="Internet of Things">Internet of Things</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">College</label>
                      <input
                        type="text"
                        placeholder="Nadar saraswathi college of engineering and technology"
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
                          placeholder="e.g., 2023"
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
                            value={tempEducation!.degree}
                            onChange={(e) => handleEducationFieldChange('degree', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Branch:</label>
                          <input
                            type="text"
                            value={tempEducation!.branch}
                            onChange={(e) => handleEducationFieldChange('branch', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">College:</label>
                          <input
                            type="text"
                            value={tempEducation!.college}
                            onChange={(e) => handleEducationFieldChange('college', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">University:</label>
                          <input
                            type="text"
                            value={tempEducation!.university}
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
                              value={tempEducation!.year}
                              onChange={(e) => handleEducationFieldChange('year', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-24">Percentage:</label>
                            <input
                              type="text"
                              value={tempEducation!.percentage}
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
                        value={newMembership.society_name}
                        onChange={(e) => handleNewMembershipChange('society_name', e.target.value)}
                        className="input input-bordered text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Membership ID *</label>
                      <input
                        type="text"
                        placeholder="e.g., 123456"
                        value={newMembership.membership_id}
                        onChange={(e) => handleNewMembershipChange('membership_id', e.target.value)}
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
                            value={tempMembership!.society_name}
                            onChange={(e) => handleMembershipFieldChange('society_name', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">ID:</label>
                          <input
                            type="text"
                            value={tempMembership!.membership_id}
                            onChange={(e) => handleMembershipFieldChange('membership_id', e.target.value)}
                            className="input input-bordered flex-1 text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium w-24">Status:</label>
                          <select
                            value={tempMembership!.status}
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
                            <p className="font-semibold text-foreground">{membership.society_name}</p>
                            <p className="text-sm text-muted-foreground">ID: {membership.membership_id}</p>
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
                      {/* Designation dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Designation *</label>
                        {newDesignationIsOther ? (
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Type your designation"
                              value={newTeachingExp.designation}
                              onChange={(e) => handleNewTeachingExpChange('designation', e.target.value)}
                              className="input input-bordered text-sm h-10 pr-8 w-full"
                              disabled={loading}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setNewDesignationIsOther(false); handleNewTeachingExpChange('designation', ''); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Select
                            value={newTeachingExp.designation}
                            onValueChange={(value) => {
                              if (value === "Other") {
                                setNewDesignationIsOther(true);
                                handleNewTeachingExpChange('designation', '');
                              } else {
                                handleNewTeachingExpChange('designation', value);
                              }
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Designation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Professor">Professor</SelectItem>
                              <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                              <SelectItem value="Non-Teaching Faculty">Non-Teaching Faculty</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {/* Institution Name */}
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
                      {/* University */}
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
                      {/* Department dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Department *</label>
                        {newTeachingDeptIsOther ? (
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Type your department"
                              value={newTeachingExp.department}
                              onChange={(e) => handleNewTeachingExpChange('department', e.target.value)}
                              className="input input-bordered text-sm h-10 pr-8 w-full"
                              disabled={loading}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setNewTeachingDeptIsOther(false); handleNewTeachingExpChange('department', ''); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Select
                            value={newTeachingExp.department}
                            onValueChange={(value) => {
                              if (value === "Other") {
                                setNewTeachingDeptIsOther(true);
                                handleNewTeachingExpChange('department', '');
                              } else {
                                handleNewTeachingExpChange('department', value);
                              }
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                              <SelectItem value="Electronics & Communication Engineering">Electronics & Communication Engineering</SelectItem>
                              <SelectItem value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</SelectItem>
                              <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                              <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                              <SelectItem value="Information Technology">Information Technology</SelectItem>
                              <SelectItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</SelectItem>
                              <SelectItem value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</SelectItem>
                              <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                              <SelectItem value="Internet of Things">Internet of Things</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {/* From / To date pickers */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">From Date</label>
                          <input
                            type="date"
                            value={newTeachingExp.from}
                            onChange={(e) => handleNewTeachingExpChange('from', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">To Date</label>
                          <input
                            type="date"
                            value={newTeachingExp.to}
                            onChange={(e) => handleNewTeachingExpChange('to', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading || newTeachingExp.current}
                          />
                        </div>
                      </div>
                      {/* Period */}
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
                              value={tempTeachingExp!.designation}
                              onChange={(e) => handleTeachingExpFieldChange('designation', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Institution:</label>
                            <input
                              type="text"
                              value={tempTeachingExp!.institutionName}
                              onChange={(e) => handleTeachingExpFieldChange('institutionName', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">University:</label>
                            <input
                              type="text"
                              value={tempTeachingExp!.university}
                              onChange={(e) => handleTeachingExpFieldChange('university', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Department:</label>
                            <input
                              type="text"
                              value={tempTeachingExp!.department}
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
                                value={tempTeachingExp!.from}
                                onChange={(e) => handleTeachingExpFieldChange('from', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">To:</label>
                              <input
                                type="text"
                                value={tempTeachingExp!.to}
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
                              value={tempTeachingExp!.period}
                              onChange={(e) => handleTeachingExpFieldChange('period', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`edit - teaching - current - ${index}`}
                              checked={tempTeachingExp!.current}
                              onChange={(e) => handleTeachingExpFieldChange('current', e.target.checked)}
                              className="checkbox checkbox-sm"
                              disabled={loading}
                            />
                            <label htmlFor={`edit - teaching - current - ${index}`} className="text-sm">Current Position</label>
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
                      {/* Job Title dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium">Job Title *</label>
                        {newJobTitleIsOther ? (
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Type your job title"
                              value={newIndustryExp.jobTitle}
                              onChange={(e) => handleNewIndustryExpChange('jobTitle', e.target.value)}
                              className="input input-bordered text-sm h-10 pr-8 w-full"
                              disabled={loading}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setNewJobTitleIsOther(false); handleNewIndustryExpChange('jobTitle', ''); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Back to dropdown"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Select
                            value={newIndustryExp.jobTitle}
                            onValueChange={(value) => {
                              if (value === "Other") {
                                setNewJobTitleIsOther(true);
                                handleNewIndustryExpChange('jobTitle', '');
                              } else {
                                handleNewIndustryExpChange('jobTitle', value);
                              }
                            }}
                            disabled={loading}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Job Title" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                              <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                              <SelectItem value="Web Developer">Web Developer</SelectItem>
                              <SelectItem value="System Administrator">System Administrator</SelectItem>
                              <SelectItem value="Network Engineer">Network Engineer</SelectItem>
                              <SelectItem value="Project Manager">Project Manager</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {/* Company */}
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
                      {/* Location */}
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
                      {/* From / To date pickers */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">From Date</label>
                          <input
                            type="date"
                            value={newIndustryExp.from}
                            onChange={(e) => handleNewIndustryExpChange('from', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium">To Date</label>
                          <input
                            type="date"
                            value={newIndustryExp.to}
                            onChange={(e) => handleNewIndustryExpChange('to', e.target.value)}
                            className="input input-bordered text-sm"
                            disabled={loading || newIndustryExp.current}
                          />
                        </div>
                      </div>
                      {/* Period */}
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
                              value={tempIndustryExp!.jobTitle}
                              onChange={(e) => handleIndustryExpFieldChange('jobTitle', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Company:</label>
                            <input
                              type="text"
                              value={tempIndustryExp!.company}
                              onChange={(e) => handleIndustryExpFieldChange('company', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium w-28">Location:</label>
                            <input
                              type="text"
                              value={tempIndustryExp!.location}
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
                                value={tempIndustryExp!.from}
                                onChange={(e) => handleIndustryExpFieldChange('from', e.target.value)}
                                className="input input-bordered flex-1 text-sm"
                                disabled={loading}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium w-20">To:</label>
                              <input
                                type="text"
                                value={tempIndustryExp!.to}
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
                              value={tempIndustryExp!.period}
                              onChange={(e) => handleIndustryExpFieldChange('period', e.target.value)}
                              className="input input-bordered flex-1 text-sm"
                              disabled={loading}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`edit - industry - current - ${index}`}
                              checked={tempIndustryExp!.current}
                              onChange={(e) => handleIndustryExpFieldChange('current', e.target.checked)}
                              className="checkbox checkbox-sm"
                              disabled={loading}
                            />
                            <label htmlFor={`edit - industry - current - ${index}`} className="text-sm">Current Position</label>
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

              {/* Filter Buttons */}
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <Button
                  variant={selectedSubjectFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubjectFilter(null)}
                  className={selectedSubjectFilter === null ? "" : "hover:bg-muted"}
                >
                  All
                </Button>
                <Button
                  variant={selectedSubjectFilter === "T" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubjectFilter("T")}
                  className={selectedSubjectFilter === "T" ? "bg-blue-600 hover:bg-blue-700 text-white border-0" : "hover:bg-blue-50"}
                >
                  <span className={selectedSubjectFilter === "T" ? "" : "text-blue-600 font-semibold"}>T</span>
                </Button>
                <Button
                  variant={selectedSubjectFilter === "P" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubjectFilter("P")}
                  className={selectedSubjectFilter === "P" ? "bg-green-600 hover:bg-green-700 text-white border-0" : "hover:bg-green-50"}
                >
                  <span className={selectedSubjectFilter === "P" ? "" : "text-green-600 font-semibold"}>P</span>
                </Button>
                <Button
                  variant={selectedSubjectFilter === "TCL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubjectFilter("TCL")}
                  className={selectedSubjectFilter === "TCL" ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : "hover:bg-orange-50"}
                >
                  <span className={selectedSubjectFilter === "TCL" ? "" : "text-orange-500 font-semibold"}>TCL</span>
                </Button>
              </div>

              <div className="space-y-4">
                {subjectsHandled
                  .filter((subject) => selectedSubjectFilter === null || subject.category === selectedSubjectFilter)
                  .map((subject, index) => (
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
                            <Badge
                              className={`text-white ${subject.category === "T" ? "bg-blue-600" :
                                subject.category === "P" ? "bg-green-600" :
                                  subject.category === "TCL" ? "bg-orange-500" :
                                    "bg-gray-600"
                                }`}
                            >
                              {subject.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Semester {subject.semester}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground">{subject.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Result</p>
                          <p className={`text - lg font - bold ${parseInt(subject.result) >= 90 ? "text-success" :
                            parseInt(subject.result) >= 80 ? "text-secondary" : "text-warning"
                            } `}>
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
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Organizer</label>
                      {newEventOrganizerType === "participated" ? (
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Enter organizer name / organization / institute"
                            value={newEvent.organizer}
                            onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                            className="input input-bordered w-full bg-white text-foreground pr-8"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => { setNewEventOrganizerType(""); setNewEvent({ ...newEvent, organizer: "" }); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            title="Back to dropdown"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Select
                          value={newEventOrganizerType}
                          onValueChange={(value: "organized" | "participated") => {
                            setNewEventOrganizerType(value);
                            if (value === "organized") {
                              setNewEvent({ ...newEvent, organizer: facultyData.name });
                            } else {
                              setNewEvent({ ...newEvent, organizer: "" });
                            }
                          }}
                        >
                          <SelectTrigger className="h-10 text-sm bg-white">
                            <SelectValue placeholder="Select organizer type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="organized">Organized</SelectItem>
                            <SelectItem value="participated">Participated</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {newEventOrganizerType === "organized" && (
                        <p className="text-xs text-muted-foreground mt-1 ml-1 flex items-center gap-1">
                          <span className="font-medium text-foreground">{facultyData.name}</span>
                        </p>
                      )}
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
                    <Button size="sm" variant="outline" onClick={() => { setAddingEvent(false); setNewEventOrganizerType(""); setNewEvent({ name: "", date: "", organizer: "", url: "" }); }}>Cancel</Button>
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

            {/* PhD Status Section */}
            <TabsContent value="phd">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold text-foreground border-b-2 border-primary/20 pb-2 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                  PhD Status
                </h3>
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-secondary text-white hover:bg-secondary/90"
                  onClick={handleAddPhd}
                  disabled={addingPhd}
                >
                  <Plus className="w-4 h-4" />
                  Add PhD
                </Button>
              </div>

              {editingPhd ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-card rounded-xl border-2 border-secondary/30 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">PhD Status</label>
                      <select
                        value={tempPhd.phdStatus}
                        onChange={(e) => handlePhdFieldChange('phdStatus', e.target.value)}
                        className="select select-bordered w-full bg-white text-foreground"
                      >
                        <option value="Pursuing">Pursuing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">ORCID ID</label>
                      <input
                        type="text"
                        value={tempPhd.orcidId}
                        onChange={(e) => handlePhdFieldChange('orcidId', e.target.value)}
                        className="input input-bordered w-full bg-white text-foreground"
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Thesis Title / Field of research</label>
                      <input
                        type="text"
                        value={tempPhd.thesisTitle}
                        onChange={(e) => handlePhdFieldChange('thesisTitle', e.target.value)}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Register No</label>
                      <input
                        type="text"
                        value={tempPhd.registerNo}
                        onChange={(e) => handlePhdFieldChange('registerNo', e.target.value)}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Guide Name</label>
                      <input
                        type="text"
                        value={tempPhd.guideName}
                        onChange={(e) => handlePhdFieldChange('guideName', e.target.value)}
                        className="input input-bordered w-full bg-white text-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditPhd}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-secondary text-white hover:bg-secondary/90 flex items-center gap-2"
                      onClick={handleSavePhd}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save PhD Details
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">PhD Status</p>
                        {facultyData.phdStatus ? (
                          <Badge variant={facultyData.phdStatus === "Completed" ? "default" : "secondary"} className="mt-1">
                            {facultyData.phdStatus}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary" onClick={handleEditPhd}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeletePrimaryPhd()} title="Delete primary PhD record">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {facultyData.thesisTitle ? (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Thesis Title / Research Field</p>
                      <p className="text-foreground font-medium italic">{facultyData.thesisTitle}</p>
                    </div>
                  ) : null}

                  {(facultyData.registerNo || facultyData.guideName) ? (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {facultyData.registerNo ? (
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Register No</p>
                          <p className="text-foreground font-mono">{facultyData.registerNo}</p>
                        </div>
                      ) : null}
                      {facultyData.guideName ? (
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Guide Name</p>
                          <p className="text-foreground">{facultyData.guideName}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {facultyData.orcidId ? (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">ORCID ID</p>
                      <div className="flex items-center gap-2 text-primary">
                        <Globe className="w-4 h-4" />
                        <span className="font-mono">{facultyData.orcidId}</span>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}

              {/* Add New PhD Form */}
              {addingPhd && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 mt-6 bg-primary/5 rounded-xl border-2 border-primary/30 shadow-sm"
                >
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-primary">
                    <Plus className="w-4 h-4" /> Add New PhD Record
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">PhD Status</label>
                      <select
                        value={newPhd.phdStatus}
                        onChange={(e) => setNewPhd(prev => ({ ...prev, phdStatus: e.target.value }))}
                        className="select select-bordered w-full bg-white text-foreground"
                      >
                        <option value="Pursuing">Pursuing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">ORCID ID</label>
                      <input
                        type="text"
                        value={newPhd.orcidId}
                        onChange={(e) => setNewPhd(prev => ({ ...prev, orcidId: e.target.value }))}
                        className="input input-bordered w-full bg-white text-foreground"
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Thesis Title / Field of Research</label>
                      <input
                        type="text"
                        value={newPhd.thesisTitle}
                        onChange={(e) => setNewPhd(prev => ({ ...prev, thesisTitle: e.target.value }))}
                        className="input input-bordered w-full bg-white text-foreground"
                        placeholder="e.g., Deep Learning for Medical Imaging"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Register No</label>
                      <input
                        type="text"
                        value={newPhd.registerNo}
                        onChange={(e) => setNewPhd(prev => ({ ...prev, registerNo: e.target.value }))}
                        className="input input-bordered w-full bg-white text-foreground"
                        placeholder="e.g., PHD2024001"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Guide Name</label>
                      <input
                        type="text"
                        value={newPhd.guideName}
                        onChange={(e) => setNewPhd(prev => ({ ...prev, guideName: e.target.value }))}
                        className="input input-bordered w-full bg-white text-foreground"
                        placeholder="e.g., Dr. A. Kumar"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-4">
                    <Button size="sm" variant="outline" onClick={handleCancelAddPhd}>
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSaveNewPhd}>
                      <Check className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Additional PhD Records */}
              {phdList.length > 0 && (
                <div className="space-y-4 mt-6">
                  {phdList.map((phd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-4"
                    >
                      {editingPhdIndex === index ? (
                        // Inline edit mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground ml-1">PhD Status</label>
                              <select
                                value={tempPhdEntry.phdStatus}
                                onChange={(e) => setTempPhdEntry(prev => ({ ...prev, phdStatus: e.target.value }))}
                                className="select select-bordered w-full bg-white text-foreground"
                              >
                                <option value="Pursuing">Pursuing</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground ml-1">ORCID ID</label>
                              <input type="text" value={tempPhdEntry.orcidId} onChange={(e) => setTempPhdEntry(prev => ({ ...prev, orcidId: e.target.value }))} className="input input-bordered w-full bg-white text-foreground" placeholder="0000-0000-0000-0000" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-xs font-semibold text-muted-foreground ml-1">Thesis Title / Field of Research</label>
                              <input type="text" value={tempPhdEntry.thesisTitle} onChange={(e) => setTempPhdEntry(prev => ({ ...prev, thesisTitle: e.target.value }))} className="input input-bordered w-full bg-white text-foreground" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground ml-1">Register No</label>
                              <input type="text" value={tempPhdEntry.registerNo} onChange={(e) => setTempPhdEntry(prev => ({ ...prev, registerNo: e.target.value }))} className="input input-bordered w-full bg-white text-foreground" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-muted-foreground ml-1">Guide Name</label>
                              <input type="text" value={tempPhdEntry.guideName} onChange={(e) => setTempPhdEntry(prev => ({ ...prev, guideName: e.target.value }))} className="input input-bordered w-full bg-white text-foreground" />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setEditingPhdIndex(null)}>Cancel</Button>
                            <Button size="sm" className="bg-secondary text-white hover:bg-secondary/90 flex items-center gap-2" onClick={() => handleSavePhdEntry(index)}>
                              <Check className="w-4 h-4" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode — same layout as main card
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Target className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">PhD Status</p>
                                <Badge variant={phd.phdStatus === "Completed" ? "default" : "secondary"} className="mt-1">
                                  {phd.phdStatus}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary" onClick={() => handleEditPhdEntry(index)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAdditionalPhd(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {phd.thesisTitle && (
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Thesis Title / Research Field</p>
                              <p className="text-foreground font-medium italic">{phd.thesisTitle}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            {phd.registerNo && (
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Register No</p>
                                <p className="text-foreground font-mono">{phd.registerNo}</p>
                              </div>
                            )}
                            {phd.guideName && (
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Guide Name</p>
                                <p className="text-foreground">{phd.guideName}</p>
                              </div>
                            )}
                          </div>

                          {phd.orcidId && (
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">ORCID ID</p>
                              <div className="flex items-center gap-2 text-primary">
                                <Globe className="w-4 h-4" />
                                <span className="font-mono">{phd.orcidId}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout >
  );
}