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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/pages/admin/department-admin/components/ui/dialog";
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
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  overall_status: "pending" | "approved" | "rejected" | "cancelled";
  leave_type: string;
  applicant_id: number;
  class_id: number;
  affected_periods: string; // JSON string
  substitute_faculty_id: number;
  created_at: string;
}

interface Faculty {
  faculty_id: number;
  Name: string;
  email: string;
  department_id: number;
}

interface Class {
  id: number;
  name: string;
  semester: number;
}

const leaveTypes = ["Medical", "Casual", "Earned", "On-Duty", "Personal", "Maternity"];

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

export default function LeaveManagementWithAlteration() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { authToken } = useAuth();

  const [formData, setFormData] = useState({
    class_id: "",
    leave_type: "Medical",
    start_date: "",
    end_date: "",
    reason: "",
    affected_periods: "[]",
    substitute_faculty_id: "",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch leave requests
        const leaveResponse = await fetch("/api/v1/leave", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();
          setLeaveRequests(leaveData.data || []);
        }

        // Fetch faculties
        const facResponse = await fetch("/api/v1/faculty", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (facResponse.ok) {
          const facData = await facResponse.json();
          setFaculties(facData.data || []);
        }

        // Fetch classes
        const classResponse = await fetch("/api/v1/classes", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (classResponse.ok) {
          const classData = await classResponse.json();
          setClasses(classData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const calculateTotalDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmitLeaveWithAlteration = async () => {
    try {
      setLoading(true);

      // Calculate total days
      const totalDays = calculateTotalDays(formData.start_date, formData.end_date);

      const response = await fetch("/api/v1/alteration/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          class_id: parseInt(formData.class_id),
          leave_type_id: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: totalDays,
          reason: formData.reason,
          affected_periods: JSON.parse(formData.affected_periods || "[]"),
          substitute_faculty_id: parseInt(formData.substitute_faculty_id),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests((prev) => [result.data, ...prev]);
        setIsCreateDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: "Leave request submitted with alteration",
        });
      } else {
        throw new Error("Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      class_id: "",
      leave_type: "Medical",
      start_date: "",
      end_date: "",
      reason: "",
      affected_periods: "[]",
      substitute_faculty_id: "",
    });
  };

  const StatusIcon = statusConfig[
    Object.keys(statusConfig).includes(
      leaveRequests.length > 0
        ? (leaveRequests[0].overall_status as keyof typeof statusConfig)
        : "pending"
    )
      ? (leaveRequests.length > 0
          ? (leaveRequests[0].overall_status as keyof typeof statusConfig)
          : "pending")
      : "pending"
  ]?.icon || Clock;

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
            Submit leave requests with class coverage arrangements
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Leave Request with Alteration</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Leave Details</TabsTrigger>
                <TabsTrigger value="substitute">Substitute Faculty</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Leave Type *</Label>
                    <Select
                      value={formData.leave_type}
                      onValueChange={(v) => setFormData({ ...formData, leave_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div>
                    <Label>Class *</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(v) => setFormData({ ...formData, class_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>

                  {formData.start_date && formData.end_date && (
                    <div>
                      <Label>Total Days</Label>
                      <div className="p-2 border border-dashed rounded bg-muted text-sm font-semibold">
                        {calculateTotalDays(formData.start_date, formData.end_date)} days
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Reason *</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Provide reason for leave"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="substitute" className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Select a faculty member to cover your classes during the leave period. They will
                    receive a request for confirmation.
                  </p>
                </div>

                <div>
                  <Label>Request Substitute Faculty *</Label>
                  <Select
                    value={formData.substitute_faculty_id}
                    onValueChange={(v) => setFormData({ ...formData, substitute_faculty_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty to request" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((fac) => (
                        <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                          {fac.Name} ({fac.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <p className="font-semibold mb-1">Workflow:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>You request a substitute faculty</li>
                    <li>Substitute accepts or rejects your request</li>
                    <li>Timetable incharge applies the alteration</li>
                    <li>Department admin is notified of the change</li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmitLeaveWithAlteration}
                disabled={loading || !formData.class_id || !formData.start_date || !formData.end_date || !formData.substitute_faculty_id}
              >
                Submit Leave Request
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {leaveRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No leave requests yet</p>
          </Card>
        ) : (
          leaveRequests.map((leave) => {
            const status = statusConfig[leave.overall_status as keyof typeof statusConfig];
            const StatusIconComponent = status?.icon || Clock;

            return (
              <Card key={leave.id} className={cn("border", status?.border)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {leave.leave_type} Leave
                      </CardTitle>
                      <CardDescription>
                        {new Date(leave.start_date).toLocaleDateString()} to{" "}
                        {new Date(leave.end_date).toLocaleDateString()} ({leave.total_days} days)
                      </CardDescription>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1",
                      status?.bg,
                      status?.border
                    )}>
                      <StatusIconComponent className="w-3 h-3" />
                      {status?.label}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Reason */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Reason</p>
                    <p className="text-sm">{leave.reason}</p>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Workflow Timeline</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex flex-cols gap-1 items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Request Submitted</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <div className="flex flex-cols gap-1 items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          leave.overall_status !== "pending" ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <span className="text-muted-foreground">Substitute Accepts</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <div className="flex flex-cols gap-1 items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          leave.overall_status === "approved" ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <span className="text-muted-foreground">Timetable Applied</span>
                      </div>
                    </div>
                  </div>

                  {/* Substitute Faculty Info */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Substitute Faculty</p>
                      <p className="text-sm font-medium">
                        {faculties.find((f) => f.faculty_id === leave.substitute_faculty_id)?.Name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Class</p>
                      <p className="text-sm font-medium">
                        {classes.find((c) => c.id === leave.class_id)?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {leave.overall_status === "pending" && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>
    </MainLayout>
  );
}
