import React, { useState, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/pages/faculty/components/ui/card";
import { Calendar, Clock, Users, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "@/pages/faculty/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Timetable {
  id: number;
  class_id: number;
  academic_year: string;
  semester: number;
  batch: string;
  status: "draft" | "active" | "inactive";
  class?: { name: string };
  class_coordinator?: { Name: string };
  asst_coordinator?: { Name: string };
  timetable_incharge?: { Name: string };
}

interface TimetableRoles {
  isClassCoordinator: boolean;
  isTimetableIncharge: boolean;
  isAnyCoordinator: boolean;
  departmentId: number | null;
  assignedTimetableIds: number[];
}

export default function TimetableManagement() {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [timetableRoles, setTimetableRoles] = useState<TimetableRoles | null>(null);
  const { authToken } = useAuth();

  useEffect(() => {
    checkTimetableRoles();
  }, [authToken]);

  const checkTimetableRoles = async () => {
    try {
      const response = await fetch("/api/v1/faculty/me/timetable-roles", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetableRoles(data.data);
        
        // If user is assigned as any coordinator role, fetch their timetables
        if (data.data?.isAnyCoordinator) {
          await fetchTimetables();
        } else {
          setAccessDenied(true);
          setLoading(false);
        }
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking timetable roles:", error);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/timetable-master", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTimetables(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load timetables",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching timetables:", error);
      toast({
        title: "Error",
        description: "Failed to load timetables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (accessDenied) {
    return (
      <MainLayout>
        <div className="min-h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-12 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
            <p className="text-slate-600 mb-4">
              You are not assigned as a Timetable Coordinator for any year in your department.
            </p>
            <p className="text-slate-500 text-sm">
              Each academic year has a dedicated coordinator (Class Coordinator, Asst. Coordinator, or Timetable Incharge)
              assigned by the Department Admin. Please contact your Department Admin to get assigned.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Timetable Management</h1>
            <p className="text-gray-600 mt-2">View and manage timetables for your classes</p>
          </div>
          <Button onClick={fetchTimetables}>Refresh</Button>
        </div>

        {/* Info Alert */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-medium">Your Timetable Coordinator Status</p>
                <div className="text-blue-700 text-sm mt-2 space-y-1">
                  <p>✓ Timetable Incharge: <span className="font-semibold text-blue-900">Assigned</span></p>
                </div>
                <p className="text-blue-700 text-sm mt-3">
                  You are the Timetable Incharge for your department. You can view the timetables assigned to you below.
                  Department admins create and manage timetables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetables Grid */}
        {timetables.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No timetables assigned yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Department admin will assign timetables to you
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {timetables.map((timetable, index) => (
              <motion.div
                key={timetable.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{timetable.class?.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {timetable.academic_year} • Sem {timetable.semester}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          timetable.status === "active"
                            ? "bg-green-100 text-green-800"
                            : timetable.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {timetable.status.charAt(0).toUpperCase() + timetable.status.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Class Coord: {timetable.class_coordinator?.Name || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Batch: {timetable.batch}</span>
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => navigate(`/faculty/timetable-management/${timetable.id}/slots`)}
                      >
                        View Slots
                      </Button>
                      {timetable.status === "active" && (
                        <Button 
                          className="flex-1" 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/faculty/alteration-approval')}
                        >
                          Alterations
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
