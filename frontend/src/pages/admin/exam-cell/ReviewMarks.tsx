import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Megaphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/pages/faculty/hooks/use-toast';

interface StudentMark {
  markId: number;
  regNo: string;
  name: string;
  internal100: string;
  internal60: string;
  assignment1: string;
  assignment2: string;
  assignmentTotal: string;
  workingHours: string;
  presentHours: string;
  attendancePercentage: string;
  totalMarks: string;
  remarks: string;
  status: "Pass" | "Fail" | "-";
  verified: boolean;
  dbStatus: string;
}

interface SubmissionDetails {
  id: number;
  batch: string;
  semester: number;
  academic_year: string;
  internal_number: number;
  status: string;
  total_students: number;
  submitted_at: string;
  rejection_reason?: string;
  faculty?: {
    Name: string;
    email: string;
  };
  subject?: {
    subject_name: string;
    subject_code: string;
  };
  class?: {
    id: number;
    name: string;
    section: string;
    semester: number;
  };
}

export default function ReviewMarks() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [details, setDetails] = useState<SubmissionDetails | null>(null);
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inline edit state
  const [editingMarkId, setEditingMarkId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<StudentMark>>({});
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Operation loading states
  const [verifying, setVerifying] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [savingRowId, setSavingRowId] = useState<number | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`/api/v1/exam-cell/submissions/${id}`, { headers });
      const result = await response.json();
      
      if (result.success && result.data) {
        setDetails(result.data.submission);
        setMarks(result.data.marks || []);
      } else {
        toast({
          title: "Error Loading Details",
          description: result.error || "Batch not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleStartEdit = (mark: StudentMark) => {
    // Cannot edit if already published
    if (details?.status === 'published') {
      toast({
        title: "Edit Locked",
        description: "Marks already published to students cannot be modified.",
        variant: "destructive",
      });
      return;
    }
    setEditingMarkId(mark.markId);
    setEditForm({ ...mark });
  };

  const handleCancelEdit = () => {
    setEditingMarkId(null);
    setEditForm({});
  };

  const handleEditChange = (field: keyof StudentMark, value: string) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value } as StudentMark;

      // 1. Convert Internal 100 to 60
      if (field === 'internal100') {
        const val = parseFloat(value);
        if (!isNaN(val)) {
          if (val > 100 || val < 0) return prev;
          updated.internal60 = Math.round((val / 100) * 60).toString();
        } else {
          updated.internal60 = "";
        }
      }

      // 2. Attendance %
      if (field === 'presentHours' || field === 'workingHours') {
        const present = parseFloat(field === 'presentHours' ? value : updated.presentHours);
        const total = parseFloat(field === 'workingHours' ? value : updated.workingHours);

        if (!isNaN(present) && !isNaN(total) && total > 0) {
          if (present > total || present < 0 || total < 0) return prev;
          const percentage = Math.round((present / total) * 100);
          updated.attendancePercentage = percentage.toString() + "%";
        } else {
          updated.attendancePercentage = "";
        }
      }

      // 3. Assignments Total (max 40)
      const ass1 = parseFloat(field === 'assignment1' ? value : updated.assignment1) || 0;
      const ass2 = parseFloat(field === 'assignment2' ? value : updated.assignment2) || 0;
      if (ass1 < 0 || ass1 > 40) return prev;
      if (ass2 < 0 || ass2 > 40) return prev;
      if (ass1 + ass2 > 40) return prev;

      updated.assignmentTotal = (ass1 + ass2).toString();

      // 4. Grand Total & Pass/Fail status
      const int60 = parseFloat(updated.internal60) || 0;
      const assTotal = parseFloat(updated.assignmentTotal) || 0;

      if (updated.internal60 !== "") {
        const grandTotal = int60 + assTotal;
        updated.totalMarks = grandTotal.toString();
        updated.status = grandTotal >= 50 ? "Pass" : "Fail";
      } else {
        updated.totalMarks = "";
        updated.status = "-";
      }

      return updated;
    });
  };

  const handleSaveRow = async (markId: number) => {
    setSavingRowId(markId);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const response = await fetch(`/api/v1/exam-cell/marks/${markId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          internal100: editForm.internal100,
          internal60: editForm.internal60,
          assignment1: editForm.assignment1,
          assignment2: editForm.assignment2,
          assignmentTotal: editForm.assignmentTotal,
          workingHours: editForm.workingHours,
          presentHours: editForm.presentHours,
          attendancePercentage: editForm.attendancePercentage?.replace('%', ''),
          totalMarks: editForm.totalMarks,
          remarks: editForm.remarks
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Row Updated",
          description: "Student mark updated in database successfully.",
        });
        
        // Update local list
        setMarks(prev => prev.map(m => m.markId === markId ? { ...m, ...editForm } as StudentMark : m));
        handleCancelEdit();
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update mark.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Saving",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSavingRowId(null);
    }
  };

  const handleVerifyBatch = async () => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`/api/v1/exam-cell/submissions/${id}/verify`, {
        method: 'PUT',
        headers
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Batch Verified",
          description: "This batch is now verified and under auditing review.",
        });
        setDetails(prev => prev ? { ...prev, status: 'under_review' } : null);
        setMarks(prev => prev.map(m => ({ ...m, dbStatus: 'verified', verified: true })));
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Failed to verify batch.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handlePublishBatch = async () => {
    const confirmPublish = window.confirm("Are you sure you want to publish these marks? This will release the results to all student and faculty portals immediately.");
    if (!confirmPublish) return;

    setPublishing(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`/api/v1/exam-cell/submissions/${id}/publish`, {
        method: 'POST',
        headers
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Results Published!",
          description: `Released assessment marks for ${result.publishedCount} students.`,
        });
        setDetails(prev => prev ? { ...prev, status: 'published' } : null);
        setMarks(prev => prev.map(m => ({ ...m, dbStatus: 'published', verified: true })));
      } else {
        toast({
          title: "Publish Failed",
          description: result.error || "Failed to publish marks.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleRejectBatch = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please specify a reason for rejecting this marks batch.",
        variant: "destructive",
      });
      return;
    }

    setRejecting(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const response = await fetch(`/api/v1/exam-cell/submissions/${id}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: rejectionReason })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: "Batch Rejected",
          description: "Sent back to faculty for corrections.",
        });
        setShowRejectModal(false);
        setDetails(prev => prev ? { ...prev, status: 'rejected', rejection_reason: rejectionReason } : null);
        setMarks(prev => prev.map(m => ({ ...m, dbStatus: 'rejected' })));
      } else {
        toast({
          title: "Rejection Failed",
          description: result.error || "Failed to reject batch.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  const isReadOnly = details?.status === 'published';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-destructive">Submission batch not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/exam-cell/submissions')}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate('/admin/exam-cell/submissions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-serif">Audit Marks Ledger</h1>
          <p className="text-muted-foreground text-xs">
            Reviewing batch submission ID #{details.id}
          </p>
        </div>
      </div>

      {/* Batch Header Info */}
      <Card className="border border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-foreground">
                  {details.subject?.subject_name} ({details.subject?.subject_code})
                </h3>
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${
                  details.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' :
                  details.status === 'under_review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  details.status === 'rejected' ? 'bg-red-50 text-red-700 border-rose-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {details.status === 'under_review' ? 'VERIFIED (UNDER REVIEW)' : details.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[10px] mb-1">Class/Section</p>
                  <p className="font-bold text-foreground text-sm">{details.class?.name} - {details.class?.section}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[10px] mb-1">Semester / Year</p>
                  <p className="font-bold text-foreground text-sm">Sem {details.semester} • {details.academic_year}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[10px] mb-1">Internal Exam</p>
                  <p className="font-bold text-foreground text-sm">Internal Assessment #{details.internal_number}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[10px] mb-1">Faculty In-charge</p>
                  <p className="font-bold text-foreground text-sm">{details.faculty?.Name}</p>
                </div>
              </div>
            </div>

            {/* General Actions */}
            <div className="flex flex-wrap gap-3 shrink-0">
              {details.status === 'submitted' && (
                <>
                  <Button
                    onClick={handleVerifyBatch}
                    disabled={verifying}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs font-bold h-10 px-5"
                  >
                    <CheckCircle2 className="h-4 w-4" /> {verifying ? 'Verifying...' : 'Verify Batch'}
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 text-xs font-bold h-10 px-5"
                  >
                    <XCircle className="h-4 w-4" /> Reject Batch
                  </Button>
                </>
              )}

              {details.status === 'under_review' && (
                <>
                  <Button
                    onClick={handlePublishBatch}
                    disabled={publishing}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs font-bold h-10 px-5"
                  >
                    <CheckCircle2 className="h-4 w-4" /> {publishing ? 'Publishing...' : 'Publish to Portals'}
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 text-xs font-bold h-10 px-5"
                  >
                    <XCircle className="h-4 w-4" /> Reject Batch
                  </Button>
                </>
              )}

              {details.status === 'rejected' && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl max-w-md">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  <div className="text-xs text-rose-800">
                    <p className="font-bold">Batch Rejected by Exam Cell</p>
                    <p className="mt-0.5 italic">"{(details as any).rejection_reason || details.rejection_reason}"</p>
                  </div>
                </div>
              )}

              {details.status === 'published' && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div className="text-xs text-emerald-800 font-semibold">
                    Published and released to student portal.
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-serif">Audit Spreadsheet</CardTitle>
          <CardDescription>Double click or click the edit icon on any row to override marks.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium text-xs border-b">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Reg No</th>
                  <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">Name</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Internal<br /><span className="text-[10px]">(Max 100)</span></th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px] bg-blue-50/50">Conv.<br /><span className="text-[10px]">(60)</span></th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Assign 1</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Assign 2</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px] bg-blue-50/50">Assign Total<br /><span className="text-[10px]">(40)</span></th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Work Hrs</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Present</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[70px] bg-blue-50/50">Att %</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[70px] font-bold bg-green-50/50">Total</th>
                  <th className="px-2 py-3 text-center whitespace-nowrap min-w-[80px]">Status</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {marks.map((student) => {
                  const isEditing = editingMarkId === student.markId;
                  
                  return (
                    <tr key={student.markId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{student.regNo}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{student.name}</td>

                      {/* Internal 100 */}
                      <td className="px-2 py-3 text-center">
                        {isEditing ? (
                          <Input
                            value={editForm.internal100 || ''}
                            onChange={(e) => handleEditChange("internal100", e.target.value)}
                            className="h-8 text-center p-1 w-16 mx-auto"
                          />
                        ) : (
                          student.internal100 || '0'
                        )}
                      </td>

                      {/* Converted 60 (Read Only) */}
                      <td className="px-2 py-3 bg-blue-50/20 text-center font-semibold text-blue-700">
                        {isEditing ? editForm.internal60 : student.internal60}
                      </td>

                      {/* Assignment 1 */}
                      <td className="px-2 py-3 text-center">
                        {isEditing ? (
                          <Input
                            value={editForm.assignment1 || ''}
                            onChange={(e) => handleEditChange("assignment1", e.target.value)}
                            className="h-8 text-center p-1 w-16 mx-auto"
                          />
                        ) : (
                          student.assignment1 || '0'
                        )}
                      </td>

                      {/* Assignment 2 */}
                      <td className="px-2 py-3 text-center">
                        {isEditing ? (
                          <Input
                            value={editForm.assignment2 || ''}
                            onChange={(e) => handleEditChange("assignment2", e.target.value)}
                            className="h-8 text-center p-1 w-16 mx-auto"
                            placeholder="Opt"
                          />
                        ) : (
                          student.assignment2 || '-'
                        )}
                      </td>

                      {/* Assignment Total (Read Only) */}
                      <td className="px-2 py-3 bg-blue-50/20 text-center font-semibold text-blue-700">
                        {isEditing ? editForm.assignmentTotal : student.assignmentTotal}
                      </td>

                      {/* Working Hours */}
                      <td className="px-2 py-3 text-center">
                        {isEditing ? (
                          <Input
                            value={editForm.workingHours || ''}
                            onChange={(e) => handleEditChange("workingHours", e.target.value)}
                            className="h-8 text-center p-1 w-16 mx-auto"
                          />
                        ) : (
                          student.workingHours
                        )}
                      </td>

                      {/* Present Hours */}
                      <td className="px-2 py-3 text-center">
                        {isEditing ? (
                          <Input
                            value={editForm.presentHours || ''}
                            onChange={(e) => handleEditChange("presentHours", e.target.value)}
                            className="h-8 text-center p-1 w-16 mx-auto"
                          />
                        ) : (
                          student.presentHours || '0'
                        )}
                      </td>

                      {/* Attendance % */}
                      <td className="px-2 py-3 bg-blue-50/20 text-center">
                        <div className={`font-bold ${
                          parseInt(isEditing ? editForm.attendancePercentage || '0' : student.attendancePercentage) < 75 
                            ? 'text-red-500' 
                            : 'text-green-600'
                        }`}>
                          {isEditing ? editForm.attendancePercentage : student.attendancePercentage}
                        </div>
                      </td>

                      {/* Total Marks */}
                      <td className="px-2 py-3 bg-green-50/20 text-center font-black text-green-800 text-base">
                        {isEditing ? editForm.totalMarks : student.totalMarks}
                      </td>

                      {/* Status */}
                      <td className="px-2 py-3 text-center">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          (isEditing ? editForm.status : student.status) === 'Pass' 
                            ? 'bg-green-100 text-green-700' 
                            : (isEditing ? editForm.status : student.status) === 'Fail' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isEditing ? editForm.status : student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        {isReadOnly ? (
                          <span className="text-xs text-muted-foreground font-medium italic">Published</span>
                        ) : isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-green-600 bg-green-50 hover:bg-green-100"
                              onClick={() => handleSaveRow(student.markId)}
                              disabled={savingRowId === student.markId}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-rose-600 bg-rose-50 hover:bg-rose-100"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            onClick={() => handleStartEdit(student)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border w-full max-w-md p-6 rounded-2xl shadow-2xl mx-4"
            >
              <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                Reject Marks Submission
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Provide a detailed audit reason to the faculty explaining why this batch is rejected. It will unlock their portal to make modifications and submit again.
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Reason: e.g. Mismatch in assignment scores for Aarav Sharma, attendance records require checking..."
                className="w-full mt-4 p-3 border rounded-xl bg-background text-sm h-32 focus:ring-2 focus:ring-primary outline-none"
              />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectBatch}
                  disabled={rejecting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {rejecting ? 'Rejecting...' : 'Reject Batch'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
