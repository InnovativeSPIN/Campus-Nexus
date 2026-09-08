import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeImageUrl } from '@/utils/imageUrl';
import { toast } from "@/pages/faculty/hooks/use-toast";
import { AdminLayout } from "@/pages/admin/executive/components/layout/AdminLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { Badge } from "@/pages/faculty/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/pages/faculty/components/ui/select";
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
  membership_id?: string;
  degree: string;
  branch: string;
  college: string;
  university: string;
  year: string;
  percentage: string;
  url?: string;
}

interface MembershipDetail {
  id?: number;
  membership_id?: string;
  degree?: string;
  branch?: string;
  university?: string;
  society_name: string;
  status: string;
  url?: string;
}

interface ExperienceDetail {
  id?: number;
  designation: string;
  institutionName: string;
  university: string;
  department: string;
  from: string;
  to: string;
  period: string;
  current: boolean;
  url?: string;
}

interface IndustryDetail {
  id?: number;
  jobTitle: string;
  company: string;
  location: string;
  from: string;
  to: string;
  period: string;
  current: boolean;
  url?: string;
}

interface EventDetail {
  id?: number;
  event_id?: number;
  event_name: string;
  category: 'Resource Person' | 'FDP' | 'Seminar' | 'Workshop';
  organizer_type?: 'organized' | 'participated';
  organizer: string;
  event_date: string;
  url?: string;
  document_url?: string;
  created_at?: string;
  updated_at?: string;
  // For frontend compatibility with local form
  name?: string;
  date?: string;
}

// Faculty data based on the Self-Appraisal Form
const initialFacultyData = {
  // Basic Information
  name: "",
  employeeId: "",
  aicteId: "",
  coeId: "",
  designation: "",
  department: "",
  collegeCode: "",
  orcidId: "",
  dateOfBirth: "",
  age: "",
  dateOfJoining: "",
  email: "",
  phone: "",
  address: "",
  linkedinUrl: "",
  profilePhoto: "",
  phdStatus: "",
  thesisTitle: "",
  registerNo: "",
  guideName: "",
};

// Experience Details (split into teaching and industry)
// Subjects Handled
// Removed static subjectsHandled, it is now fetched dynamically from API.

// Leave Details
const leaveDetails = {
  totalWorkingDays: "—",
  availedLeave: "—",
  onDuty: "—",
  effectiveAttendance: "—",
  attendancePercentage: "—",
};

// Event categories
const EVENT_CATEGORIES = ['Resource Person', 'FDP', 'Seminar', 'Workshop'] as const;
type EventCategoryType = typeof EVENT_CATEGORIES[number];

export default function SecretaryProfile() {
  const { user, updateUserData } = useAuth();
  const [subjectsHandled, setSubjectsHandled] = useState<any[]>([]);
  const [selectedEventCategory, setSelectedEventCategory] = useState<EventCategoryType>("Resource Person");
  const [selectedResearchCategory, setSelectedResearchCategory] = useState<string>("Conference");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [facultyData, setFacultyData] = useState({
    ...initialFacultyData,
    name: user?.name || initialFacultyData.name,
    email: user?.email || initialFacultyData.email,
    profilePhoto: normalizeImageUrl(user?.avatar) || initialFacultyData.profilePhoto
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
        profilePhoto: normalizeImageUrl(user.avatar) || prev.profilePhoto,
        designation: user.designation || prev.designation,
        department: departmentFullName || prev.department,
        linkedinUrl: (user as any)?.linkedin_url || prev.linkedinUrl
      }));

      // fetch full executive admin / faculty profile from backend to populate all details
      (async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) return;
          let res = await fetch('/api/v1/faculty/me/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            res = await fetch('/api/v1/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
          if (res.ok) {
            const payload = await res.json();
            const p = payload.data || payload;
            if (p) {
              const deptName = typeof p.department === 'object'
                ? p.department?.full_name || p.department?.short_name || ''
                : p.department || '';

              setFacultyData(prev => ({
                ...prev,
                name: p.Name || p.name || prev.name,
                email: p.email || prev.email,
                profilePhoto: normalizeImageUrl(p.profile_image_url || p.avatar) || prev.profilePhoto,
                designation: p.designation || prev.designation,
                department: deptName || prev.department,
                employeeId: p.faculty_college_code ?? p.employee_id ?? p.employeeId ?? prev.employeeId,
                aicteId: p.AICTE_ID ?? p.aicte_id ?? p.aicteId ?? prev.aicteId,
                coeId: p.Anna_University_ID ?? p.anna_university_id ?? p.coeId ?? prev.coeId,
                orcidId: p.orcid_id ?? p.orcidId ?? prev.orcidId,
                dateOfBirth: p.date_of_birth ?? p.dob ?? prev.dateOfBirth,
                dateOfJoining: p.date_of_joining ?? p.dateOfJoining ?? prev.dateOfJoining,
                linkedinUrl: p.linkedin_url ?? p.linkedinUrl ?? prev.linkedinUrl,
                address: p.curr_address ?? p.address ?? prev.address,
                phone: p.phone_number ?? p.phone ?? prev.phone,
              }));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch profile details', e);
        }
      })();
    }
  }, [user]);

  // Fetch education and membership records from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/v1/faculty/education', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json().catch((e) => {
          console.error('[PARSE ERROR] Education data:', e);
          throw new Error('Failed to parse education response. Check console for details.');
        });
        if (result.success && Array.isArray(result.data)) {
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
            percentage: r.percentage
          })));

          setMembershipData(pMemberships.map((r: any) => ({
            // Prefer DB primary id; keep membership_id separate
            id: r.id ?? null,
            membership_id: r.membership_id,
            society_name: r.society_name,
            status: r.status
          })));
        }
        // Teaching experiences
        const expResponse = await fetch('/api/v1/faculty/experience', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!expResponse.ok) {
          throw new Error(`HTTP ${expResponse.status}: Failed to fetch experiences`);
        }

        const expResult = await expResponse.json().catch((e) => {
          console.error('[PARSE ERROR] Experience data:', e);
          throw new Error('Failed to parse experience response');
        });
        if (expResult.success && Array.isArray(expResult.data)) {
          setTeachingExpData(expResult.data.map((r: any) => ({
            id: r.id,
            designation: r.designation,
            institutionName: r.institution_name,
            university: r.university,
            department: r.department,
            from: r.from_date,
            to: r.to_date,
            period: r.period,
            current: r.is_current
          })));
        }

        // Industry experiences (separate table)
        const indResponse = await fetch('/api/v1/faculty/experience/industry', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!indResponse.ok) {
          throw new Error(`HTTP ${indResponse.status}: Failed to fetch industry experiences`);
        }

        const indResult = await indResponse.json().catch((e) => {
          console.error('[PARSE ERROR] Industry experience data:', e);
          throw new Error('Failed to parse industry experience response');
        });
        if (indResult.success && Array.isArray(indResult.data)) {
          setIndustryExpData(indResult.data.map((r: any) => ({
            id: r.id,
            jobTitle: r.job_title,
            company: r.company,
            location: r.location,
            from: r.from_date,
            to: r.to_date,
            period: r.period,
            current: r.is_current
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
            const phdResult = await phdResponse.json().catch((e) => {
              console.error('[PARSE ERROR] PhD data:', e);
              throw new Error('Failed to parse PhD response');
            });
            if (phdResult.success && Array.isArray(phdResult.data)) {
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
                setFacultyData(prev => ({
                  ...prev,
                  phdStatus: primary.phdStatus || prev.phdStatus,
                  orcidId: primary.orcidId || prev.orcidId,
                  thesisTitle: primary.thesisTitle || prev.thesisTitle,
                  registerNo: primary.registerNo || prev.registerNo,
                  guideName: primary.guideName || prev.guideName,
                }));
                setPrimaryPhdId(primary.id ?? null);

                setPhdList(entries.slice(1));
              }
            }
          }
        } catch (e) {
          console.warn('Failed to fetch PhD records', e);
        }

        // Fetch events from API
        try {
          const eventsResponse = await fetch('/api/v1/faculty/events', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (eventsResponse.ok) {
            const eventsResult = await eventsResponse.json().catch((e) => {
              console.error('[PARSE ERROR] Events data:', e);
              throw new Error('Failed to parse events response');
            });
            if (eventsResult.success && Array.isArray(eventsResult.data)) {
              setEventsData(eventsResult.data.map((r: any) => ({
                id: r.id ?? r.event_id ?? null,
                event_id: r.event_id,
                event_name: r.event_name,
                category: r.category,
                organizer_type: r.organizer_type,
                organizer: r.organizer,
                event_date: r.event_date,
                document_url: r.document_url,
                url: r.url,
                created_at: r.created_at,
                updated_at: r.updated_at,
                // Add frontend compatibility fields
                name: r.event_name,
                date: r.event_date
              })));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch events', e);
        }

        // Fetch research from API
        try {
          const researchResponse = await fetch('/api/v1/faculty/research', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (researchResponse.ok) {
            const researchResult = await researchResponse.json().catch((e) => {
              console.error('[PARSE ERROR] Research data:', e);
              throw new Error('Failed to parse research response');
            });
            if (researchResult.success && Array.isArray(researchResult.data)) {
              setResearchData(researchResult.data.map((r: any) => ({
                research_id: r.research_id,
                faculty_id: r.faculty_id,
                category: r.category,
                title: r.title,
                author_names: r.author_names,
                abstract: r.abstract,
                keywords: r.keywords,
                publication_date: r.publication_date,
                publisher_organizer: r.publisher_organizer,
                issn_isbn: r.issn_isbn,
                volume_issue: r.volume_issue,
                pages: r.pages,
                type: r.type,
                status: r.status,
                research_type: r.research_type,
                impact_factor: r.impact_factor,
                citations: r.citations,
                indexed_in: r.indexed_in,
                url: r.url,
                document_url: r.document_url,
                ORCID_ID: r.ORCID_ID,
                created_at: r.created_at,
                updated_at: r.updated_at
              })));
            }
          }
        } catch (e) {
          console.warn('Failed to fetch research', e);
        }

        // Fetch subjects
        try {
          const subjectsResponse = await fetch('/api/v1/faculty/me/subjects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (subjectsResponse.ok) {
            const subjectsResult = await subjectsResponse.json();
            if (subjectsResult.success && Array.isArray(subjectsResult.data)) {
              setSubjectsHandled(subjectsResult.data);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch subjects', e);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Data Load Warning',
          description: 'Some data could not be loaded. Please refresh the page if you see incomplete information.',
          variant: 'destructive'
        });
      }
    };

    fetchData();
  }, [user]);

  // Events and Research states
  const [eventsData, setEventsData] = useState<EventDetail[]>([]);
  const [researchData, setResearchData] = useState<any[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);

  const [addingEvent, setAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<EventDetail>>({ event_name: "", event_date: "", organizer: "", url: "" });
  const [tempEvent, setTempEvent] = useState<Partial<EventDetail>>({ event_name: "", event_date: "", organizer: "", url: "" });
  const [newEventOrganizerType, setNewEventOrganizerType] = useState<"" | "organized" | "participated">("");

  const [addingResearch, setAddingResearch] = useState(false);
  const [editingResearch, setEditingResearch] = useState<number | null>(null);
  const [newResearch, setNewResearch] = useState({ title: "", publication_date: "", author_names: "", abstract: "", keywords: "", publisher_organizer: "", url: "", issn_isbn: "", volume_issue: "", pages: "", type: "International", status: "Published", research_type: "", impact_factor: "", indexed_in: "" });
  const [tempResearch, setTempResearch] = useState<any>({});

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
    url: "",
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
    url: "",
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
  const [primaryPhdId, setPrimaryPhdId] = useState<number | null>(null);
  const [editingPhdIndex, setEditingPhdIndex] = useState<number | null>(null);
  const [tempPhdEntry, setTempPhdEntry] = useState({ orcidId: "", phdStatus: "", thesisTitle: "", registerNo: "", guideName: "" });

  function validateEmail(email: string) {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }

  function validatePhone(phone: string) {
    // Accept any phone number with 10 or more digits (allows +91, local, international formats)
    if (!phone || phone.trim() === '') return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10; // Modified: Accept 10+ digits (most standard phone numbers)
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
    if (primaryPhdId) {
      if (!window.confirm('Are you sure you want to delete the primary PhD record?')) return;
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: 'Error', description: 'Authentication required. Please log in again.', variant: 'destructive' });
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/phd/${primaryPhdId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to delete PhD record`);
        }

        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('[Delete PhD] Response parse error:', parseError);
          throw new Error('Failed to parse delete response');
        }

        if (result.success) {
          // Refresh canonical list
          const phdResponse = await fetch('/api/v1/faculty/phd', { headers: { 'Authorization': `Bearer ${token}` } });
          if (phdResponse.ok) {
            try {
              const phdResult = await phdResponse.json();
              if (phdResult.success && Array.isArray(phdResult.data)) {
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
                  setPrimaryPhdId(primary.id ?? null);
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
                  // No entries remain
                  setPrimaryPhdId(null);
                  setFacultyData(prev => ({ ...prev, phdStatus: "", orcidId: "", thesisTitle: "", registerNo: "", guideName: "" }));
                  setPhdList([]);
                }
              }
            } catch (refreshError) {
              console.warn('Failed to refresh PhD list after delete:', refreshError);
            }
          }

          toast({ title: 'PhD Record Deleted', description: 'Primary PhD record has been deleted successfully.' });
        } else {
          throw new Error(result.message || 'Failed to delete PhD record');
        }
      } catch (error: any) {
        console.error('Delete primary PhD error', error);
        const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast({ title: 'Deletion Failed', description: errorMsg || 'Failed to delete PhD.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      // No primary id persisted; clear fields via profile update
      const token = localStorage.getItem('authToken');
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch('/api/v1/faculty/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ phd_status: "", orcid_id: "", thesis_title: "", register_no: "", guide_name: "" })
        });
        const result = await response.json();
        if (result.success) {
          setFacultyData(prev => ({ ...prev, phdStatus: "", orcidId: "", thesisTitle: "", registerNo: "", guideName: "" }));
          setPhdList([]);
          setPrimaryPhdId(null);
          toast({ title: 'Primary PhD cleared' });
        } else {
          throw new Error(result.message || 'Failed to clear primary PhD');
        }
      } catch (error: any) {
        console.error('Clear primary PhD error', error);
        toast({ title: 'Error', description: error.message || 'Failed to clear primary PhD.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
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
      let valueToSave: any = tempValue;
      let payloadField = field;
      
      if (field === 'phone') {
        // Validate and clean phone number (remove all non-digits)
        const cleaned = tempValue.replace(/\D/g, '');
        if (cleaned.length < 10) {
          setFieldError('Phone number must be at least 10 digits');
          setLoading(false);
          return;
        }
        // Store the full cleaned phone number (supports 10-digit or country code + 10-digit)
        valueToSave = cleaned;
        payloadField = 'phone_number'; // Map to phone_number for backend
      } else if (field === 'address') {
        payloadField = 'curr_address'; // Map to curr_address for backend
      } else if (field === 'aicteId') {
        payloadField = 'AICTE_ID'; // Map to AICTE_ID for backend
        valueToSave = tempValue ? String(tempValue).trim() : null; // Keep as string
      } else if (field === 'coeId') {
        payloadField = 'Anna_University_ID'; // Map to Anna_University_ID for backend
        valueToSave = tempValue ? String(tempValue).trim() : null; // Keep as string
      }
      updatePayload[payloadField] = valueToSave;

      const response = await fetch('/api/v1/faculty/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('[PROFILE UPDATE ERROR]', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
        } catch (parseError) {
          console.error('[PROFILE UPDATE ERROR - JSON Parse]', {
            status: response.status,
            statusText: response.statusText,
            parseError: parseError
          });
        }
        setFieldError(errorMessage);
        setLoading(false);
        return;
      }

      try {
        await response.json();
      } catch (parseError) {
        console.warn('[PROFILE UPDATE] Response body parse error (non-critical):', parseError);
        // Continue anyway since we got a successful status
      }

      // Update local state with the saved value (use cleaned value for phone)
      setFacultyData((prev) => ({
        ...prev,
        [field]: field === 'phone' ? valueToSave : tempValue,
      }));
      
      // For phone field, refresh from database to confirm save
      if (field === 'phone') {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const refreshRes = await fetch('/api/v1/faculty/me/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (refreshRes.ok) {
              const refreshPayload = await refreshRes.json();
              if (refreshPayload && refreshPayload.success && refreshPayload.data) {
                const phoneFromDB = refreshPayload.data.phone_number ?? refreshPayload.data.phone;
                console.log('[PHONE FIELD] Database confirmation - Phone saved as:', phoneFromDB);
                setFacultyData(prev => ({
                  ...prev,
                  phone: phoneFromDB
                }));
              }
            }
          }
        } catch (refreshError) {
          console.warn('[PHONE FIELD] Could not refresh from DB (non-critical):', refreshError);
        }
      }
      
      setEditingField(null);
      setTempValue("");
      setFieldError("");

      toast({
        title: 'Profile updated',
        description: `Your ${field} has been updated successfully.`
      });
    } catch (error) {
      console.error('Update error:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFieldError(`Failed to update profile: ${errorMsg}`);
      toast({
        title: 'Error',
        description: `Failed to update profile: ${errorMsg}`,
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
      toast({ title: 'Authentication Required', description: 'Please log in and try again.', variant: 'destructive' });
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[EDUCATION UPDATE - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
        throw new Error(result.message || result.error || 'Failed to update record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Update Education Failed',
        description: errorMsg || 'Failed to update education record.',
        variant: 'destructive'
      });
      console.error('[EDUCATION UPDATE ERROR]', error);
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
      toast({ title: 'Authentication Required', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const recId = membershipData[index]?.id;
    console.debug('[PROFILE] handleSaveMembership', { recId, hasToken: !!token });
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
          society_name: tempMembership.society_name || null,
          status: tempMembership.status || null,
          membership_id: tempMembership.membership_id || null,
          url: tempMembership.url || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[MEMBERSHIP UPDATE - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

      if (result.success) {
        const updated = [...membershipData];
        updated[index] = { ...tempMembership, id: result.data.id };
        setMembershipData(updated);
        setEditingMembership(null);
        setTempMembership(null);
        toast({
          title: 'Membership updated',
          description: 'Professional membership has been updated successfully.'
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to update record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Update Membership Failed',
        description: errorMsg || 'Failed to update membership record.',
        variant: 'destructive'
      });
      console.error('[MEMBERSHIP UPDATE ERROR]', error);
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
      url: "",
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

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in again to save education record.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          degree: newEducation.degree || null,
          branch: newEducation.branch || null,
          college: newEducation.college || null,
          university: newEducation.university || null,
          year: newEducation.year || null,
          percentage: newEducation.percentage || null,
          society_name: "",
          url: newEducation.url || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[EDUCATION ADD - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
        });
        toast({
          title: 'Education added',
          description: 'New educational qualification has been added successfully.'
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to save record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Add Education Failed',
        description: errorMsg || 'Failed to save education record.',
        variant: 'destructive'
      });
      console.error('[EDUCATION ADD ERROR]', error);
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
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in again to delete education record.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/education/${educationData[index].id}?section=education`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json().catch((e) => {
          console.error('[EDUCATION DELETE - JSON Parse]', e);
          throw new Error('Failed to parse response. Check console for details.');
        });

        if (result.success) {
          // If record was fully deleted, remove from both lists
          if (!result.data || Object.keys(result.data).length === 0) {
            setEducationData(educationData.filter((_, i) => i !== index));
            setMembershipData(membershipData.filter(m => m.id !== educationData[index].id));
          } else {
            // Record was just updated (section cleared), remove from education list
            setEducationData(educationData.filter((_, i) => i !== index));
            // Update membership list if it exists there
            setMembershipData(membershipData.map(m => m.id === result.data.id ? result.data : m));
          }

          toast({
            title: 'Education deleted',
            description: 'Educational qualification has been cleared successfully.'
          });
        } else {
          throw new Error(result.message || result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast({
          title: 'Delete Education Failed',
          description: errorMsg || 'Failed to delete education record.',
          variant: 'destructive'
        });
        console.error('[EDUCATION DELETE ERROR]', error);
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
      url: "",
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
    if (!newMembership.society_name || !newMembership.membership_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in society name and ID fields.',
        variant: 'destructive'
      });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in again to save membership record.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/faculty/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          degree: "Membership",
          branch: "Professional Membership",
          college: "",
          university: "",
          year: "",
          percentage: "",
          society_name: newMembership.society_name || null,
          status: newMembership.status || null,
          url: newMembership.url || null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[MEMBERSHIP ADD - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
          url: "",
        });
        toast({
          title: 'Membership added',
          description: 'Professional membership has been added successfully.'
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to save record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Add Membership Failed',
        description: errorMsg || 'Failed to save membership record.',
        variant: 'destructive'
      });
      console.error('[MEMBERSHIP ADD ERROR]', error);
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
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in again to delete membership record.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/education/${membershipData[index].id}?section=membership`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json().catch((e) => {
          console.error('[MEMBERSHIP DELETE - JSON Parse]', e);
          throw new Error('Failed to parse response. Check console for details.');
        });

        if (result.success) {
          // If record was fully deleted, remove from both lists
          if (!result.data || Object.keys(result.data).length === 0) {
            setMembershipData(membershipData.filter((_, i) => i !== index));
            setEducationData(educationData.filter(e => e.id !== membershipData[index].id));
          } else {
            // Record was just updated (section cleared), remove from membership list
            setMembershipData(membershipData.filter((_, i) => i !== index));
            // Update education list if it exists there
            setEducationData(educationData.map(e => e.id === result.data.id ? result.data : e));
          }

          toast({
            title: 'Membership deleted',
            description: 'Professional membership has been cleared successfully.'
          });
        } else {
          throw new Error(result.message || result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast({
          title: 'Delete Membership Failed',
          description: errorMsg || 'Failed to delete membership record.',
          variant: 'destructive'
        });
        console.error('[MEMBERSHIP DELETE ERROR]', error);
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
      url: "",
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

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in again to save teaching experience.',
        variant: 'destructive'
      });
      return;
    }

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
          from_date: newTeachingExp.from || null,
          to_date: newTeachingExp.current ? null : (newTeachingExp.to || null),
          period: newTeachingExp.period,
          is_current: newTeachingExp.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[TEACHING EXP ADD - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
          url: ""
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
        throw new Error(result.message || result.error || 'Failed to save experience');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Add Teaching Experience Failed',
        description: errorMsg || 'Failed to save teaching experience.',
        variant: 'destructive'
      });
      console.error('[TEACHING EXP ADD ERROR]', error);
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
      toast({ title: 'Authentication Required', description: 'Please log in and try again.', variant: 'destructive' });
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
          from_date: tempTeachingExp.from || null,
          to_date: tempTeachingExp.current ? null : (tempTeachingExp.to || null),
          period: tempTeachingExp.period,
          is_current: tempTeachingExp.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[TEACHING EXP UPDATE - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
        throw new Error(result.message || result.error || 'Failed to update record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Update Teaching Experience Failed',
        description: errorMsg || 'Failed to update teaching experience.',
        variant: 'destructive'
      });
      console.error('[TEACHING EXP UPDATE ERROR]', error);
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
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in again to delete teaching experience.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/experience/${teachingExpData[index].id}?section=teaching`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json().catch((e) => {
          console.error('[TEACHING EXP DELETE - JSON Parse]', e);
          throw new Error('Failed to parse response. Check console for details.');
        });

        if (result.success) {
          // If record was fully deleted, remove from both lists
          if (!result.data || Object.keys(result.data).length === 0) {
            setTeachingExpData(teachingExpData.filter((_, i) => i !== index));
            setIndustryExpData(industryExpData.filter(m => m.id !== teachingExpData[index].id));
          } else {
            // Record was just updated (section cleared), remove from teaching list
            setTeachingExpData(teachingExpData.filter((_, i) => i !== index));
            // Update industry list if it exists there
            setIndustryExpData(industryExpData.map(m => m.id === result.data.id ? {
              ...m,
              from: result.data.from_date,
              to: result.data.to_date,
              period: result.data.period,
              current: result.data.is_current
            } : m));
          }

          toast({
            title: 'Experience deleted',
            description: 'Teaching experience has been cleared successfully.'
          });
        } else {
          throw new Error(result.message || result.error || 'Failed to delete record');
        }
      } catch (error: any) {
        const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
        toast({
          title: 'Delete Teaching Experience Failed',
          description: errorMsg || 'Failed to delete teaching experience.',
          variant: 'destructive'
        });
        console.error('[TEACHING EXP DELETE ERROR]', error);
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
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in again to save industry experience.',
        variant: 'destructive'
      });
      return;
    }

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
          from_date: newIndustryExp.from || null,
          to_date: newIndustryExp.current ? null : (newIndustryExp.to || null),
          period: newIndustryExp.period,
          is_current: newIndustryExp.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[INDUSTRY EXP ADD - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
          url: ""
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
        throw new Error(result.message || result.error || 'Failed to save experience');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Add Industry Experience Failed',
        description: errorMsg || 'Failed to save industry experience.',
        variant: 'destructive'
      });
      console.error('[INDUSTRY EXP ADD ERROR]', error);
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
      toast({ title: 'Authentication Required', description: 'Please log in and try again.', variant: 'destructive' });
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
          from_date: tempIndustryExp.from || null,
          to_date: tempIndustryExp.current ? null : (tempIndustryExp.to || null),
          period: tempIndustryExp.period,
          is_current: tempIndustryExp.current
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json().catch((e) => {
        console.error('[INDUSTRY EXP UPDATE - JSON Parse]', e);
        throw new Error('Failed to parse response. Check console for details.');
      });

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
        throw new Error(result.message || result.error || 'Failed to update record');
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Update Industry Experience Failed',
        description: errorMsg || 'Failed to update industry experience.',
        variant: 'destructive'
      });
      console.error('[INDUSTRY EXP UPDATE ERROR]', error);
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
    setNewEvent({ event_name: "", event_date: "", organizer: "", url: "", category: selectedEventCategory });
  };

  const handleEditEvent = (index: number) => {
    setEditingEvent(index);
    const event = getEventsByCategory(selectedEventCategory)[index];
    setTempEvent({ ...event });
  };

  const getEventsByCategory = (category: EventCategoryType): EventDetail[] => {
    return eventsData.filter((e) => e.category === category);
  };

  const handleSaveNewEvent = async () => {
    if (!newEvent.event_name || !newEvent.event_date) {
      toast({ title: "Validation Error", description: "Event Name and Date are required.", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Always use FormData to avoid content-type mismatches (backend expects multipart for files)
      const form = new FormData();
      form.append('event_name', newEvent.event_name!);
      form.append('event_date', newEvent.event_date!);
      form.append('category', (newEvent.category || selectedEventCategory) as string);
      if (newEvent.organizer) form.append('organizer', newEvent.organizer);
      form.append('organizer_type', newEventOrganizerType || 'participated');
      if (newEvent.url) form.append('url', newEvent.url);
      const file = fileInputRef.current?.files?.[0];
      if (file) form.append('file', file);

      const response = await fetch('/api/v1/faculty/events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Failed to add event: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        const newEventData = {
          id: result.data.id ?? result.data.event_id ?? null,
          event_id: result.data.event_id,
          event_name: result.data.event_name,
          category: result.data.category,
          organizer_type: result.data.organizer_type,
          organizer: result.data.organizer,
          event_date: result.data.event_date,
          document_url: result.data.document_url,
          url: result.data.url,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
          name: result.data.event_name,
          date: result.data.event_date
        };
        console.log('[Events] New event created with ID:', newEventData.event_id, 'Category:', newEventData.category);
        setEventsData([...eventsData, newEventData]);
        setAddingEvent(false);
        setNewEventOrganizerType("");
        setNewEvent({ event_name: "", event_date: "", organizer: "", url: "" });
        toast({ title: "Event added", description: "New event has been added successfully." });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add event.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditEvent = async () => {
    if (!tempEvent.event_id) {
      toast({ title: 'Error', description: 'Event ID missing', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let response;
      const file = editFileInputRef.current?.files?.[0];
      if (file) {
        const form = new FormData();
        form.append('event_name', tempEvent.event_name as string);
        form.append('event_date', tempEvent.event_date as string);
        if (tempEvent.category) form.append('category', tempEvent.category as string);
        if (tempEvent.organizer) form.append('organizer', tempEvent.organizer as string);
        if (tempEvent.organizer_type) form.append('organizer_type', tempEvent.organizer_type as string);
        if (tempEvent.url) form.append('url', tempEvent.url as string);
        form.append('file', file);

        response = await fetch(`/api/v1/faculty/events/${tempEvent.event_id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form
        });
      } else {
        response = await fetch(`/api/v1/faculty/events/${tempEvent.event_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            event_name: tempEvent.event_name,
            event_date: tempEvent.event_date,
            category: tempEvent.category,
            organizer: tempEvent.organizer,
            organizer_type: tempEvent.organizer_type,
            url: tempEvent.url,
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setEventsData(eventsData.map(e => e.event_id === tempEvent.event_id ? result.data : e));
        setEditingEvent(null);
        setTempEvent({});
        toast({ title: "Event updated", description: "Event has been updated successfully." });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update event.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (index: number) => {
    const events = getEventsByCategory(selectedEventCategory);
    const event = events[index];

    if (!event.event_id) {
      toast({ title: 'Error', description: 'Event ID missing', variant: 'destructive' });
      return;
    }

    if (window.confirm("Are you sure you want to delete this event?")) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/v1/faculty/events/${event.event_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to delete event: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setEventsData(eventsData.filter(e => e.event_id !== event.event_id));
          toast({ title: "Event deleted", description: "Event has been deleted successfully." });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete event.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Research Handlers
  const getResearchByCategory = (category: string): any[] => {
    return researchData.filter((item: any) => item.category === category);
  };

  const handleAddResearch = () => {
    setAddingResearch(true);
    setNewResearch({ title: "", publication_date: "", author_names: "", abstract: "", keywords: "", publisher_organizer: "", url: "", issn_isbn: "", volume_issue: "", pages: "", type: "International", status: "Published", research_type: "", impact_factor: "", indexed_in: "" });
  };

  const handleEditResearch = (index: number) => {
    setEditingResearch(index);
    const filteredResearch = getResearchByCategory(selectedResearchCategory);
    setTempResearch({ ...filteredResearch[index] });
  };

  const handleSaveNewResearch = async () => {
    if (!newResearch.title) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('category', selectedResearchCategory);
      form.append('title', newResearch.title);
      form.append('publication_date', newResearch.publication_date);
      form.append('author_names', newResearch.author_names);
      form.append('abstract', newResearch.abstract);
      form.append('keywords', newResearch.keywords);
      form.append('publisher_organizer', newResearch.publisher_organizer);
      form.append('url', newResearch.url);
      form.append('issn_isbn', newResearch.issn_isbn);
      form.append('volume_issue', newResearch.volume_issue);
      form.append('pages', newResearch.pages);
      form.append('type', newResearch.type);
      form.append('status', newResearch.status);
      form.append('research_type', newResearch.research_type);
      form.append('impact_factor', newResearch.impact_factor);
      form.append('indexed_in', newResearch.indexed_in);

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        form.append('file', file);
      }

      const response = await fetch('/api/v1/faculty/research', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Failed to add research: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setResearchData([...researchData, result.data]);
        setAddingResearch(false);
        setNewResearch({ title: "", publication_date: "", author_names: "", abstract: "", keywords: "", publisher_organizer: "", url: "", issn_isbn: "", volume_issue: "", pages: "", type: "International", status: "Published", research_type: "", impact_factor: "", indexed_in: "" });
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast({ title: 'Success', description: 'Research added successfully' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add research.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditResearch = async () => {
    if (!tempResearch.research_id) {
      toast({ title: 'Error', description: 'Research ID missing', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let response;
      const file = editFileInputRef.current?.files?.[0];
      if (file) {
        const form = new FormData();
        form.append('title', tempResearch.title);
        form.append('category', tempResearch.category);
        if (tempResearch.publication_date) form.append('publication_date', tempResearch.publication_date);
        if (tempResearch.author_names) form.append('author_names', tempResearch.author_names);
        if (tempResearch.abstract) form.append('abstract', tempResearch.abstract);
        if (tempResearch.keywords) form.append('keywords', tempResearch.keywords);
        if (tempResearch.publisher_organizer) form.append('publisher_organizer', tempResearch.publisher_organizer);
        if (tempResearch.url) form.append('url', tempResearch.url);
        if (tempResearch.issn_isbn) form.append('issn_isbn', tempResearch.issn_isbn);
        if (tempResearch.volume_issue) form.append('volume_issue', tempResearch.volume_issue);
        if (tempResearch.pages) form.append('pages', tempResearch.pages);
        if (tempResearch.type) form.append('type', tempResearch.type);
        if (tempResearch.status) form.append('status', tempResearch.status);
        if (tempResearch.research_type) form.append('research_type', tempResearch.research_type);
        if (tempResearch.impact_factor) form.append('impact_factor', tempResearch.impact_factor);
        if (tempResearch.indexed_in) form.append('indexed_in', tempResearch.indexed_in);
        form.append('file', file);

        response = await fetch(`/api/v1/faculty/research/${tempResearch.research_id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form
        });
      } else {
        response = await fetch(`/api/v1/faculty/research/${tempResearch.research_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            title: tempResearch.title,
            category: tempResearch.category,
            publication_date: tempResearch.publication_date,
            author_names: tempResearch.author_names,
            abstract: tempResearch.abstract,
            keywords: tempResearch.keywords,
            publisher_organizer: tempResearch.publisher_organizer,
            url: tempResearch.url,
            issn_isbn: tempResearch.issn_isbn,
            volume_issue: tempResearch.volume_issue,
            pages: tempResearch.pages,
            type: tempResearch.type,
            status: tempResearch.status,
            research_type: tempResearch.research_type,
            impact_factor: tempResearch.impact_factor,
            indexed_in: tempResearch.indexed_in
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to update research: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setResearchData(researchData.map(r => r.research_id === tempResearch.research_id ? result.data : r));
        setEditingResearch(null);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
        toast({ title: 'Success', description: 'Research updated successfully' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update research.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResearch = async (index: number) => {
    const filteredResearch = getResearchByCategory(selectedResearchCategory);
    const research = filteredResearch[index];

    if (!window.confirm('Are you sure you want to delete this research?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: 'Not authenticated', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/faculty/research/${research.research_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete research: ${response.statusText}`);
      }

      setResearchData(researchData.filter(r => r.research_id !== research.research_id));
      toast({ title: 'Success', description: 'Research deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete research.', variant: 'destructive' });
    } finally {
      setLoading(false);
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
      if (!token) throw new Error('Not authenticated. Please log in again.');

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
        let errorMessage = 'Failed to update PhD status';
        try {
          const err = await resp.json();
          errorMessage = err.message || errorMessage;
        } catch (parseError) {
          console.error('[PhD UPDATE] Error response parse failed:', parseError);
          errorMessage = `HTTP ${resp.status}: ${resp.statusText || errorMessage}`;
        }
        throw new Error(errorMessage);
      }

      // Verify response body can be parsed
      try {
        await resp.json();
      } catch (parseError) {
        console.warn('[PhD UPDATE] Success response parse warning:', parseError);
      }

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
          const phdJson = await phdRes.json().catch((e) => {
            console.warn('[PhD REFRESH] Parse error:', e);
            return { success: false };
          });
          if (phdJson.success && Array.isArray(phdJson.data)) {
            setPhdList(phdJson.data.map((r: any) => ({ id: r.phd_id ?? r.id, orcidId: r.orcid_id, phdStatus: r.status, thesisTitle: r.thesis_title, registerNo: r.register_no, guideName: r.guide_name })));
          }
        }
      } catch (e) {
        console.warn('Failed to refresh phd list', e);
      }
      setEditingPhd(false);
      toast({ title: 'PhD details updated', description: 'Your PhD information has been updated successfully.' });
    } catch (error: any) {
      console.error('Failed to save PhD details', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ 
        title: 'Update Failed', 
        description: errorMsg || 'Failed to update PhD details', 
        variant: 'destructive' 
      });
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
                setFacultyData(prev => ({
                  ...prev,
                  phdStatus: primary.phdStatus || prev.phdStatus,
                  orcidId: primary.orcidId || prev.orcidId,
                  thesisTitle: primary.thesisTitle || prev.thesisTitle,
                  registerNo: primary.registerNo || prev.registerNo,
                  guideName: primary.guideName || prev.guideName,
                }));
                setPrimaryPhdId(primary.id ?? null);
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

  const handleViewDocument = (url: string, fileName?: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL not available.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Fetch the document
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch document');
          return response.blob();
        })
        .then(blob => {
          // Create a blob URL and trigger download
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || `document_${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          toast({
            title: "Success",
            description: "Document downloaded successfully."
          });
        })
        .catch(error => {
          console.error('Document download error:', error);
          toast({
            title: "Error",
            description: "Failed to download document. Please try again.",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process document.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Profile</h1>
          <p className="text-muted-foreground -mt-4"></p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleDownloadProfile} className="bg-secondary hover:bg-secondary/90 w-full sm:w-auto">
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
                  src={user?.avatar || ""}
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
          </div>

          <div className="mt-6 space-y-4">
            {/* Employee ID */}
            {facultyData.employeeId && (
              <div className="bg-muted rounded-xl p-2.5 border border-border/50 text-center mb-8 max-w-[260px] mx-auto shadow-sm">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Employee ID</p>
                <p className="font-mono font-bold text-foreground text-base tracking-wide">{facultyData.employeeId}</p>
              </div>
            )}

            {/* DOB */}
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">DOB</p>
                {editingField === 'dateOfBirth' ? (
                  <div className="space-y-1 mt-1">
                    <input
                      type="date"
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full"
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('dateOfBirth')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{facultyData.dateOfBirth || <span className="text-muted-foreground italic text-xs">Not set</span>}</p>
                    <button onClick={() => handleEditField('dateOfBirth', facultyData.dateOfBirth)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" title="Edit DOB"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Date of Joining */}
            <div className="flex items-start gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Date of Joined</p>
                {editingField === 'dateOfJoining' ? (
                  <div className="space-y-1 mt-1">
                    <input
                      type="date"
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full"
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('dateOfJoining')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{facultyData.dateOfJoining || <span className="text-muted-foreground italic text-xs">Not set</span>}</p>
                    <button onClick={() => handleEditField('dateOfJoining', facultyData.dateOfJoining)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" title="Edit Joining Date"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* LinkedIn Profile */}
            <div className="flex items-start gap-3 text-sm">
              <Linkedin className="w-4 h-4 text-[#0077B5] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">LinkedIn Profile</p>
                {editingField === 'linkedin_url' ? (
                  <div className="space-y-1 mt-1">
                    <input
                      type="url"
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full"
                      placeholder="https://linkedin.com/in/..."
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('linkedin_url')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {facultyData.linkedinUrl ? (
                      <a href={facultyData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">View Profile</a>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Not set</span>
                    )}
                    <button onClick={() => handleEditField('linkedin_url', facultyData.linkedinUrl)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" title="Edit LinkedIn"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                {editingField === 'email' ? (
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full"
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('email')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href={`mailto:${facultyData.email}`} className="font-medium text-sm break-all hover:underline text-blue-600">{facultyData.email}</a>
                    <button onClick={() => handleEditField('email', facultyData.email)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" title="Edit email"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">Phone</p>
                {editingField === 'phone' ? (
                  <div className="space-y-1">
                    <input
                      type="tel"
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full"
                      placeholder="e.g. 9876543210 or +91 9876543210"
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('phone')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <a href={`tel:${facultyData.phone}`} className="font-medium text-sm break-all hover:underline">{facultyData.phone}</a>
                    <button onClick={() => handleEditField('phone', facultyData.phone)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0" title="Edit phone"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">Current Address</p>
                {editingField === 'address' ? (
                  <div className="space-y-1">
                    <textarea
                      value={tempValue}
                      onChange={(e) => { setTempValue(e.target.value); setFieldError(''); }}
                      className="input input-bordered text-sm w-full resize-none"
                      rows={2}
                      autoFocus
                    />
                    {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveField('address')} className="p-1 bg-green-600 text-white rounded"><Check className="w-3 h-3" /></button>
                      <button onClick={handleCancelEdit} className="p-1 bg-muted rounded"><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="font-medium text-foreground break-all flex-1">{facultyData.address || <span className="text-muted-foreground italic text-xs">Not set</span>}</p>
                    <button onClick={() => handleEditField('address', facultyData.address)} className="p-1 hover:bg-muted rounded opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" title="Edit address"><Edit2 className="w-3 h-3" /></button>
                  </div>
                )}
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
            <div className="overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              <TabsList className="flex w-max lg:grid lg:w-full lg:grid-cols-6 mb-2">
                <TabsTrigger value="education" className="text-xs min-w-[100px] lg:min-w-0">Education</TabsTrigger>
                <TabsTrigger value="experience" className="text-xs min-w-[100px] lg:min-w-0">Experience</TabsTrigger>
              </TabsList>
            </div>

            {/* Educational Qualifications */}
            <TabsContent value="education">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="section-title flex items-center gap-2 mb-0">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mt-3 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">University:</span>
                              <span className="text-foreground">{edu.university}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year:</span>
                              <span className="text-foreground">{edu.year}</span>
                            </div>
                            {edu.percentage !== "-" && (
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score:</span>
                                <span className="text-secondary font-bold text-lg">{edu.percentage}</span>
                              </div>
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
            </TabsContent>

            {/* Experience Details */}
            <TabsContent value="experience">
              <h3 className="section-title flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-secondary" />
                Experience
              </h3>

              {/* Teaching Experience Section */}
              <div className="mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h4 className="font-semibold text-base text-primary mb-0">Teaching Experience</h4>
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
                              <SelectItem value="Associate Professor">Associate Professor</SelectItem>
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
                          {newTeachingExp.current ? (
                            <input
                              type="text"
                              value="Present / Currently Working"
                              className="input input-bordered text-sm bg-muted/50 cursor-not-allowed"
                              disabled
                            />
                          ) : (
                            <input
                              type="date"
                              value={newTeachingExp.to}
                              onChange={(e) => handleNewTeachingExpChange('to', e.target.value)}
                              className="input input-bordered text-sm"
                              disabled={loading}
                            />
                          )}
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
                              {tempTeachingExp!.current ? (
                                <input
                                  type="text"
                                  value="Present"
                                  className="input input-bordered flex-1 text-sm bg-muted/50 cursor-not-allowed"
                                  disabled
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={tempTeachingExp!.to}
                                  onChange={(e) => handleTeachingExpFieldChange('to', e.target.value)}
                                  className="input input-bordered flex-1 text-sm"
                                  disabled={loading}
                                />
                              )}
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
                            <div className="p-2 bg-primary/10 rounded-lg shrink-0 hidden sm:block">
                              <Building className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                                <p className="font-bold text-foreground text-lg">{exp.designation}</p>
                                <span className="text-sm text-secondary font-medium">{exp.department}</span>
                              </div>
                              <p className="text-sm text-foreground mt-2 leading-relaxed">
                                <span className="font-semibold">{exp.institutionName}</span>
                                {exp.university && <span className="text-muted-foreground italic">, {exp.university}</span>}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-4">
                                <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-[11px] font-medium">
                                  <Calendar className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-foreground">
                                    {exp.from} â€” {exp.current ? 'Present' : exp.to}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{exp.period}</Badge>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h4 className="font-semibold text-base text-primary mb-0">Industry Experience</h4>
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
                          {newIndustryExp.current ? (
                            <input
                              type="text"
                              value="Present / Currently Working"
                              className="input input-bordered text-sm bg-muted/50 cursor-not-allowed"
                              disabled
                            />
                          ) : (
                            <input
                              type="date"
                              value={newIndustryExp.to}
                              onChange={(e) => handleNewIndustryExpChange('to', e.target.value)}
                              className="input input-bordered text-sm"
                              disabled={loading}
                            />
                          )}
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
                              {tempIndustryExp!.current ? (
                                <input
                                  type="text"
                                  value="Present"
                                  className="input input-bordered flex-1 text-sm bg-muted/50 cursor-not-allowed"
                                  disabled
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={tempIndustryExp!.to}
                                  onChange={(e) => handleIndustryExpFieldChange('to', e.target.value)}
                                  className="input input-bordered flex-1 text-sm"
                                  disabled={loading}
                                />
                              )}
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
                                    {exp.from} - {exp.current ? 'Present' : exp.to}
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

            {/* Research Section */}

            {/* PhD Status Section */}
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

