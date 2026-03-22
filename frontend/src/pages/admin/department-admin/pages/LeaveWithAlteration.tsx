import React, { useState, useEffect } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Label } from "@/pages/admin/department-admin/components/ui/label";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/pages/admin/department-admin/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/admin/department-admin/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/pages/admin/department-admin/components/ui/card";
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  ArrowRight,
  Wallet,
  Trash2,
  Search,
  RefreshCw,
  Users,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Faculty {
  faculty_id: number;
  name: string;
  email: string;
  phone_number?: string;
  designation?: string;
  department_id?: number;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  overall_status: string;
  substitute_faculty_id?: number;
  substitute_approval_status?: string;
  timetable_incharge_approval_status?: string;
  executive_admin_approval_status?: string;
  createdAt: string;
  substituteFaculty?: Faculty;
}

interface Period {
  id: number;
  date: string;
  day: string;
  period_number: number;
  start_time: string;
  end_time: string;
  type: string;
  subject?: {
    id: number;
    code: string;
    name: string;
  };
  class?: {
    id: number;
    name: string;
    semester: number;
  };
  academic_year: string;
  semester: number;
}

interface PeriodWithFaculty {
  period: Period;
  alternative_faculty: Faculty[];
  selected_faculty_id?: number;
}

const leaveTypes = ["Medical", "Casual", "Earned", "On-Duty", "Personal", "Maternity", "Comp-Off"];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  substitute_pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  substitute_approved: { label: "Substitute Approved", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  substitute_rejected: { label: "Substitute Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  timetable_pending: { label: "Pending Timetable", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  timetable_approved: { label: "Timetable Applied", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  executive_pending: { label: "Pending Executive", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
};

export default function LeaveManagementWithAlteration() {
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("apply");
  const { authToken } = useAuth();

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [periodsWithFaculty, setPeriodsWithFaculty] = useState<PeriodWithFaculty[]>([]);
  const [fetchingPeriods, setFetchingPeriods] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
  }, [authToken]);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/faculty/leave-request/my-applications", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();
      if (result.success) {
        setMyLeaves(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load leave applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodsForDateRange = async () => {
    if (!form.startDate || !form.endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      });
      return;
    }

    try {
      setFetchingPeriods(true);
      const response = await fetch(
        `/api/v1/faculty/leave-request/periods-for-dates?startDate=${form.startDate}&endDate=${form.endDate}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        await fetchAlternativeFaculty(result.data);
        toast({
          title: "Success",
          description: `Found ${result.data.length} class periods`,
        });
      } else {
        toast({
          title: "No Results",
          description: "No class periods found for the selected date range",
          variant: "destructive",
        });
        setPeriodsWithFaculty([]);
      }
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast({
        title: "Error",
        description: "Failed to fetch class periods",
        variant: "destructive",
      });
    } finally {
      setFetchingPeriods(false);
    }
  };

  const fetchAlternativeFaculty = async (periods: Period[]) => {
    try {
      const response = await fetch("/api/v1/faculty/leave-request/alternative-faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ periods }),
      });
      const result = await response.json();

      if (result.success) {
        setPeriodsWithFaculty(result.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch alternative faculty",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching alternative faculty:", error);
      toast({
        title: "Error",
        description: "Failed to fetch alternative faculty",
        variant: "destructive",
      });
    }
  };

  const handleSelectFaculty = (periodIndex: number, facultyId: number) => {
    const updated = [...periodsWithFaculty];
    updated[periodIndex].selected_faculty_id = facultyId;
    setPeriodsWithFaculty(updated);
  };

  const calculateTotalDays = () => {
    if (!form.startDate || !form.endDate) return "0";
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return totalDays.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const unselected = periodsWithFaculty.filter(p => !p.selected_faculty_id);
    if (unselected.length > 0) {
      toast({
        title: "Error",
        description: "Please select alternative faculty for all periods",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const affected_periods = periodsWithFaculty.map(p => ({
        date: p.period.date,
        period_slot_id: p.period.period_number,
        class_id: p.period.class?.id,
        subject_id: p.period.subject?.id,
        master_id: p.period.id,
        requested_substitute_faculty_id: p.selected_faculty_id,
      }));

      const payload = {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        substitute_faculty_id: periodsWithFaculty[0]?.selected_faculty_id,
        affected_periods,
      };

      const response = await fetch("/api/v1/faculty/leave-request/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
        });
        setForm({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
        setPeriodsWithFaculty([]);
        setActiveTab("status");
        fetchMyLeaves();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit leave request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (leaveId: number) => {
    if (!confirm("Are you sure you want to withdraw this request?")) return;

    try {
      const response = await fetch(`/api/v1/faculty/leave-request/${leaveId}/withdraw`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Success",
          description: "Leave request withdrawn",
        });
        fetchMyLeaves();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to withdraw request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error withdrawing request:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw request",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  const getStatusConfig = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Leave Management & Alteration</h1>
          <p className="text-muted-foreground -mt-4">
            Submit leave requests with automatic alternative faculty assignment
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apply">Apply Leave</TabsTrigger>
          <TabsTrigger value="status">My Applications</TabsTrigger>
        </TabsList>

        {/* Apply Leave Tab */}
        <TabsContent value="apply" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Submit New Leave Request</CardTitle>
                <CardDescription>
                  Enter your leave dates, and we'll automatically assign alternative faculty to cover your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Leave Type */}
                    <div className="space-y-2">
                      <Label className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Leave Type *
                      </Label>
                      <Select value={form.leaveType} onValueChange={(value) => setForm({ ...form, leaveType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Total Days Info */}
                    {form.startDate && form.endDate && (
                      <div className="space-y-2">
                        <Label className="font-medium flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Total Days
                        </Label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                          <p className="font-semibold text-blue-600">{calculateTotalDays()} days</p>
                          {parseInt(calculateTotalDays()) > 2 && (
                            <p className="text-xs text-blue-600">
                              Requires executive admin approval
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label className="font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Start Date *
                      </Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => {
                          setForm({ ...form, startDate: e.target.value });
                          setPeriodsWithFaculty([]);
                        }}
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label className="font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        End Date *
                      </Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => {
                          setForm({ ...form, endDate: e.target.value });
                          setPeriodsWithFaculty([]);
                        }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label className="font-medium">Reason for Leave *</Label>
                    <Textarea
                      placeholder="Explain the reason for your leave"
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Fetch Periods Button */}
                  {form.startDate && form.endDate && !fetchingPeriods && periodsWithFaculty.length === 0 && (
                    <div className="flex justify-center pt-4">
                      <Button
                        type="button"
                        onClick={fetchPeriodsForDateRange}
                        className="gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Find Classes & Alternative Faculty
                      </Button>
                    </div>
                  )}

                  {fetchingPeriods && (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      <p className="text-muted-foreground">Fetching your classes and finding alternative faculty...</p>
                    </div>
                  )}

                  {/* Periods withFaculty Selection */}
                  {periodsWithFaculty.length > 0 && (
                    <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Select Alternative Faculty ({periodsWithFaculty.length} classes)
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPeriodsWithFaculty([]);
                            setForm({ ...form, startDate: "", endDate: "" });
                          }}
                        >
                          Change Dates
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {periodsWithFaculty.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="font-medium">{formatDate(item.period.date)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Period</p>
                                <p className="font-medium">{formatTime(item.period.start_time)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Subject</p>
                                <p className="font-medium">{item.period.subject?.name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Class</p>
                                <p className="font-medium">{item.period.class?.name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Room</p>
                                <p className="font-medium">{item.period.type || "—"}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Select Alternative Faculty *</Label>
                              {item.alternative_faculty.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                                  <p className="text-yellow-800">No alternative faculty available for this subject-class</p>
                                </div>
                              ) : (
                                <Select
                                  value={item.selected_faculty_id?.toString() || ""}
                                  onValueChange={(value) => handleSelectFaculty(index, parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a faculty member" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {item.alternative_faculty.map((faculty) => (
                                      <SelectItem key={faculty.faculty_id} value={faculty.faculty_id.toString()}>
                                        <div className="flex items-center gap-2">
                                          <span>{faculty.name}</span>
                                          {faculty.designation && (
                                            <span className="text-xs text-muted-foreground">({faculty.designation})</span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {item.selected_faculty_id && (
                              <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  {item.alternative_faculty.find(f => f.faculty_id === item.selected_faculty_id)?.name} selected
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForm({
                          leaveType: "",
                          startDate: "",
                          endDate: "",
                          reason: "",
                        });
                        setPeriodsWithFaculty([]);
                      }}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || periodsWithFaculty.length === 0}
                      className="gap-2"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Submit Leave Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="status" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : myLeaves.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-3">No leave applications yet</p>
              <Button onClick={() => setActiveTab("apply")} variant="outline" size="sm">
                Apply for Leave
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myLeaves.map((leave) => {
                const config = getStatusConfig(leave.overall_status);
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn("border", config.border)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              {leave.leaveType} Leave
                            </CardTitle>
                            <CardDescription>
                              {formatDate(leave.startDate)} to {formatDate(leave.endDate)} ({leave.totalDays} days)
                            </CardDescription>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border",
                            config.bg,
                            config.border
                          )}>
                            {config.label}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground font-semibold mb-1">Reason</p>
                          <p className="text-sm">{leave.reason}</p>
                        </div>

                        {leave.substituteFaculty && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground font-semibold mb-1">Assigned Faculty</p>
                            <p className="text-sm font-medium">{leave.substituteFaculty.name}</p>
                          </div>
                        )}

                        {['pending', 'substitute_pending'].includes(leave.overall_status) && (
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleWithdraw(leave.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Withdraw
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
