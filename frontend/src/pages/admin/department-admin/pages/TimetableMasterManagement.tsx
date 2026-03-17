import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Calendar,
  Users,
  Clock,
  Settings,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Power,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";
import { toast } from "@/pages/admin/department-admin/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TimetableMaster {
  id: number;
  class_id: number;
  department_id: number;
  academic_year: string;
  semester: number;
  semester_type: "odd" | "even";
  batch: string;
  room_no: string;
  effective_from: string;
  revision_no: string;
  status: "draft" | "active" | "inactive";
  class_coordinator_id: number | null;
  asst_coordinator_id: number | null;
  timetable_incharge_id: number | null;
  hod_id: number | null;
  class?: { name: string };
  department?: { short_name?: string; full_name?: string };
  class_coordinator?: { Name: string };
  asst_coordinator?: { Name: string };
  timetable_incharge?: { Name: string };
  hod?: { Name: string };
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

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [
  { id: 1, label: "I", time: "09:30–10:20" },
  { id: 2, label: "II", time: "10:20–11:10" },
  { id: 4, label: "III", time: "11:30–12:25" },
  { id: 6, label: "IV", time: "13:10–14:00" },
  { id: 7, label: "V", time: "14:00–14:50" },
  { id: 9, label: "VI", time: "15:10–16:00" },
  { id: 10, label: "VII", time: "16:00–16:45" },
];

export default function TimetableMasterManagement() {
  const [timetables, setTimetables] = useState<TimetableMaster[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<TimetableMaster | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCoordinatorDialogOpen, setIsCoordinatorDialogOpen] = useState(false);
  const { authToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    class_id: "",
    academic_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    semester: "1",
    semester_type: "odd",
    batch: "",
    room_no: "",
    effective_from: "",
    revision_no: "",
  });

  const [coordinatorData, setCoordinatorData] = useState({
    class_coordinator_id: "",
    asst_coordinator_id: "",
    timetable_incharge_id: "",
    hod_id: "",
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch timetables
        const ttResponse = await fetch("/api/v1/timetable-master", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (ttResponse.ok) {
          const ttData = await ttResponse.json();
          console.log("[TIMETABLE DEBUG] Timetables data:", ttData.data);
          if (ttData.data?.length > 0) {
            console.log("[TIMETABLE DEBUG] First timetable ALL fields:", ttData.data[0]);
            console.log("[TIMETABLE DEBUG] Status field:", {
              status: ttData.data[0].status,
              statusLowercase: ttData.data[0].status?.toLowerCase(),
              statusType: typeof ttData.data[0].status,
              isEmpty: ttData.data[0].status === "",
              allKeys: Object.keys(ttData.data[0])
            });
          }
          setTimetables(ttData.data || []);
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

  const handleCreateTimetable = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/v1/timetable-master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTimetable = await response.json();
        setTimetables((prev) => [newTimetable.data, ...prev]);
        setIsCreateDialogOpen(false);
        setFormData({
          class_id: "",
          academic_year: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
          semester: "1",
          semester_type: "odd",
          batch: "",
          room_no: "",
          effective_from: "",
          revision_no: "",
        });
        toast({
          title: "Success",
          description: "Timetable created in draft status",
        });
      } else {
        throw new Error("Failed to create timetable");
      }
    } catch (error) {
      console.error("Error creating timetable:", error);
      toast({
        title: "Error",
        description: "Failed to create timetable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoordinators = async () => {
    if (!selectedTimetable) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/v1/timetable-master/${selectedTimetable.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          class_coordinator_id: coordinatorData.class_coordinator_id || null,
          asst_coordinator_id: coordinatorData.asst_coordinator_id || null,
          timetable_incharge_id: coordinatorData.timetable_incharge_id || null,
          hod_id: coordinatorData.hod_id || null,
        }),
      });

      if (response.ok) {
        const updatedTimetable = await response.json();
        setTimetables((prev) =>
          prev.map((t) => (t.id === selectedTimetable.id ? updatedTimetable.data : t))
        );
        setSelectedTimetable(updatedTimetable.data);
        setIsCoordinatorDialogOpen(false);
        toast({
          title: "Success",
          description: "Coordinator assignments updated",
        });
      } else {
        throw new Error("Failed to update coordinators");
      }
    } catch (error) {
      console.error("Error updating coordinators:", error);
      toast({
        title: "Error",
        description: "Failed to update coordinators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (timetableId: number) => {
    if (!authToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in again to activate timetables.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[handleActivate] timetableId:', timetableId, 'authToken present:', !!authToken);

      const response = await fetch(`/api/v1/timetable-master/${timetableId}/activate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log('[handleActivate] response status:', response.status);

      if (response.ok) {
        const updatedTimetable = await response.json();
        setTimetables((prev) =>
          prev.map((t) => (t.id === timetableId ? updatedTimetable.data : t))
        );
        toast({
          title: "✅ Success",
          description: "Timetable activated successfully",
        });
      } else {
        const errorData = await response.json();
        console.log('[handleActivate] error response:', errorData);
        throw new Error(errorData.message || "Failed to activate timetable");
      }
    } catch (error) {
      console.error("Error activating timetable:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to activate timetable";
      toast({
        title: "❌ Activation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (timetableId: number) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/v1/timetable-master/${timetableId}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const updatedTimetable = await response.json();
        setTimetables((prev) =>
          prev.map((t) => (t.id === timetableId ? updatedTimetable.data : t))
        );
        toast({
          title: "✅ Success",
          description: "Timetable deactivated successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deactivate timetable");
      }
    } catch (error) {
      console.error("Error deactivating timetable:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to deactivate timetable";
      toast({
        title: "❌ Deactivation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCoordinatorDialog = (timetable: TimetableMaster) => {
    setSelectedTimetable(timetable);
    setCoordinatorData({
      class_coordinator_id: timetable.class_coordinator_id?.toString() || "",
      asst_coordinator_id: timetable.asst_coordinator_id?.toString() || "",
      timetable_incharge_id: timetable.timetable_incharge_id?.toString() || "",
      hod_id: timetable.hod_id?.toString() || "",
    });
    setIsCoordinatorDialogOpen(true);
  };

  const statusStyles = {
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="page-header font-serif">Timetable Master Management</h1>
          <p className="text-muted-foreground -mt-4">
            Create and manage class timetable schedules
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Timetable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Timetable Master</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class *</Label>
                  <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
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
                  <Label>Academic Year *</Label>
                  <Input
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    placeholder="2025-2026"
                  />
                </div>

                <div>
                  <Label>Semester *</Label>
                  <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Semester Type *</Label>
                  <Select value={formData.semester_type} onValueChange={(v: "odd" | "even") => setFormData({ ...formData, semester_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="odd">Odd</SelectItem>
                      <SelectItem value="even">Even</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Batch *</Label>
                  <Input
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g., 2023-2027"
                  />
                </div>

                <div>
                  <Label>Room No.</Label>
                  <Input
                    value={formData.room_no}
                    onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
                    placeholder="e.g., CR-15"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Effective From *</Label>
                  <Input
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Revision No.</Label>
                  <Input
                    value={formData.revision_no}
                    onChange={(e) => setFormData({ ...formData, revision_no: e.target.value })}
                    placeholder="e.g., 05.01.2026/01"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTimetable} disabled={loading}>
                  Create Timetable
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Timetables List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {timetables.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No timetables created yet</p>
          </Card>
        ) : (
          timetables.map((timetable) => (
            <Card key={timetable.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {timetable.class?.name} - {timetable.academic_year}
                    </CardTitle>
                    <CardDescription>
                      Semester {timetable.semester} ({timetable.semester_type}) | Batch: {timetable.batch}
                    </CardDescription>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    statusStyles[timetable.status]
                  )}>
                    {timetable.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Coordinator Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Class Coordinator</p>
                    <p className="text-sm font-medium">{timetable.class_coordinator?.Name || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Asst. Coordinator</p>
                    <p className="text-sm font-medium">{timetable.asst_coordinator?.Name || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Timetable Incharge</p>
                    <p className="text-sm font-medium">{timetable.timetable_incharge?.Name || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">HOD</p>
                    <p className="text-sm font-medium">{timetable.hod?.Name || "Not assigned"}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Room</p>
                    <p className="font-medium">{timetable.room_no || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Effective From</p>
                    <p className="font-medium">{new Date(timetable.effective_from).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Revision</p>
                    <p className="font-medium">{timetable.revision_no || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Department</p>
                    <p className="font-medium">
                      {timetable.department?.short_name || timetable.department?.full_name || timetable.class?.department?.short_name || timetable.class?.department?.full_name || "-"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCoordinatorDialog(timetable)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Assign Coordinators
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/department-admin/timetable-master/${timetable.id}/slots`)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Manage Slots
                  </Button>

                  {((!timetable.status) || timetable.status?.toLowerCase?.() === "draft" || timetable.status?.toLowerCase?.() === "inactive") && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleActivate(timetable.id)}
                      disabled={loading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  )}

                  {timetable.status?.toLowerCase?.() === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivate(timetable.id)}
                      disabled={loading}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Coordinator Assignment Dialog */}
      <Dialog open={isCoordinatorDialogOpen} onOpenChange={setIsCoordinatorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Coordinators</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class Coordinator</Label>
              <Select value={coordinatorData.class_coordinator_id} onValueChange={(v) => setCoordinatorData({ ...coordinatorData, class_coordinator_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                      {fac.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assistant Coordinator</Label>
              <Select value={coordinatorData.asst_coordinator_id} onValueChange={(v) => setCoordinatorData({ ...coordinatorData, asst_coordinator_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                      {fac.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Timetable Incharge</Label>
              <Select value={coordinatorData.timetable_incharge_id} onValueChange={(v) => setCoordinatorData({ ...coordinatorData, timetable_incharge_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                      {fac.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Head of Department (HOD)</Label>
              <Select value={coordinatorData.hod_id} onValueChange={(v) => setCoordinatorData({ ...coordinatorData, hod_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.faculty_id} value={fac.faculty_id.toString()}>
                      {fac.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateCoordinators} disabled={loading}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsCoordinatorDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
