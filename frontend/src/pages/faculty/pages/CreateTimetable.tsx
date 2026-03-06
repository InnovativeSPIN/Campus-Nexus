import React, { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/pages/faculty/components/ui/card";
import { Label } from "@/pages/faculty/components/ui/label";
import { Button } from "@/pages/faculty/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/pages/faculty/components/ui/select";
import { Upload, CheckCircle2, FileText, Loader2, X, Calendar, Clock, User } from "lucide-react";
import { useToast } from "@/pages/faculty/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/pages/faculty/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

interface TimetablePreview {
  facultyId: string;
  facultyName: string;
  department: string;
  day: string;
  hour: number;
  subject: string;
  section: string;
  year: string;
  academicYear: string;
}

interface TimetableSlot {
  id: number;
  facultyId: string;
  facultyName: string;
  department: string;
  year: number;
  section: string;
  day: string;
  hour: number;
  subject: string;
  academicYear: string;
  isAltered?: boolean;
  alteredAt?: string;
  originalFacultyId?: string;
  originalFacultyName?: string;
}

interface FreeFaculty {
  id: number;
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  isFree?: boolean;
}

interface AlterationRecord {
  id: number;
  department: string;
  year: number;
  section: string;
  day: string;
  hour: number;
  subject: string;
  originalFacultyId: string;
  originalFacultyName: string;
  replacementFacultyId: string;
  replacementFacultyName: string;
  createdAt: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [1, 2, 3, 4, 5, 6, 7];

// Helper to convert hour number to display time
const formatHourForDisplay = (hour: number): string => {
  const timeMap: { [key: number]: string } = {
    1: "09:00 - 10:00",
    2: "10:00 - 11:00",
    3: "11:00 - 12:00",
    4: "12:00 - 13:00",
    5: "14:00 - 15:00",
    6: "15:00 - 16:00",
    7: "16:00 - 17:00"
  };
  return timeMap[hour] || `Hour ${hour}`;
};

export default function CreateTimetable() {
  // Bulk Upload State
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("odd");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewData, setPreviewData] = useState<TimetablePreview[]>([]);
  
  // Toggle State
  const [actionType, setActionType] = useState<'bulk' | 'alteration'>('bulk');
  
  // Timetable Alteration State
  const [selectedYear, setSelectedYear] = useState<string>("1");
  const [timetableData, setTimetableData] = useState<TimetableSlot[]>([]);
  const [alterations, setAlterations] = useState<AlterationRecord[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  
  // Modal State
  const [isAlterModalOpen, setIsAlterModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [freeFaculty, setFreeFaculty] = useState<FreeFaculty[]>([]);
  const [loadingFreeFaculty, setLoadingFreeFaculty] = useState(false);
  const [selectedReplacementFaculty, setSelectedReplacementFaculty] = useState<string>("");
  const [isApplyingAlteration, setIsApplyingAlteration] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { authToken, user } = useAuth();

  // Fetch timetable when year changes
  useEffect(() => {
    if (actionType === 'alteration' && selectedYear) {
      fetchTimetable();
    }
  }, [actionType, selectedYear]);

  // Fetch alterations when switching to alteration mode
  useEffect(() => {
    if (actionType === 'alteration') {
      fetchAlterations();
    }
  }, [actionType]);

  const fetchAlterations = async () => {
    try {
      const token = authToken || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/faculty/timetable/alterations', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      console.log('Alterations response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Alterations API error:', errorData);
        return;
      }
      
      const data = await response.json();
      console.log('Alterations data:', data);
      
      if (data.success && data.data) {
        setAlterations(data.data);
      }
    } catch (error) {
      console.error('Error fetching alterations:', error);
    }
  };

  const fetchTimetable = async () => {
    setLoadingTimetable(true);
    try {
      const token = authToken || localStorage.getItem('authToken');
      console.log('Fetching timetable for year:', selectedYear);
      const response = await fetch(
        `/api/v1/timetable/department/${selectedYear}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Timetable response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Timetable API error:', errorData);
        setLoadingTimetable(false);
        return;
      }

      const data = await response.json();
      console.log('Timetable data:', data);

      if (data.success) {
        let timetable = data.timetable || data.data || [];
        
        // Apply alterations to the timetable (check 24-hour validity)
        const now = new Date();
        const validAlterations = alterations.filter(alt => {
          const altDate = new Date(alt.createdAt);
          const hoursDiff = (now.getTime() - altDate.getTime()) / (1000 * 60 * 60);
          return hoursDiff <= 24;
        });
        
        // Apply alterations to timetable slots
        timetable = timetable.map((slot: TimetableSlot) => {
          const matchingAlt = validAlterations.find(
            alt => alt.day === slot.day && 
                   alt.hour === slot.hour && 
                   alt.section === slot.section
          );
          
          if (matchingAlt) {
            return {
              ...slot,
              isAltered: true,
              alteredAt: matchingAlt.createdAt,
              originalFacultyId: slot.facultyId,
              originalFacultyName: slot.facultyName,
              facultyId: matchingAlt.replacementFacultyId,
              facultyName: matchingAlt.replacementFacultyName
            };
          }
          return slot;
        });
        
        setTimetableData(timetable);
      } else {
        setTimetableData([]);
        toast({
          title: "Error",
          description: data.error || "Failed to load timetable",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching timetable:", error);
      setTimetableData([]);
      toast({
        title: "Error",
        description: "Failed to load timetable",
        variant: "destructive",
      });
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleSlotClick = async (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsAlterModalOpen(true);
    setSelectedReplacementFaculty("");
    setFreeFaculty([]);
    
    // Fetch free faculty for this slot
    await fetchFreeFaculty(slot);
  };

  const fetchFreeFaculty = async (slot: TimetableSlot) => {
    setLoadingFreeFaculty(true);
    try {
      const token = authToken || localStorage.getItem('authToken');
      const response = await fetch(
        `/api/v1/faculty/free?department=${slot.department}&day=${slot.day}&hour=${slot.hour}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setFreeFaculty(data.data || []);
      } else {
        setFreeFaculty([]);
      }
    } catch (error: any) {
      console.error("Error fetching free faculty:", error);
      setFreeFaculty([]);
    } finally {
      setLoadingFreeFaculty(false);
    }
  };

  const handleApplyAlteration = async () => {
    if (!selectedSlot || !selectedReplacementFaculty) {
      toast({
        title: "Validation Error",
        description: "Please select a replacement faculty",
        variant: "destructive",
      });
      return;
    }

    const replacement = freeFaculty.find(f => f.facultyId === selectedReplacementFaculty);
    
    setIsApplyingAlteration(true);
    try {
      const token = authToken || localStorage.getItem('authToken');
      const response = await fetch(
        "/api/v1/timetable/alteration",
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            department: selectedSlot.department,
            year: selectedSlot.year,
            section: selectedSlot.section,
            day: selectedSlot.day,
            hour: selectedSlot.hour,
            subject: selectedSlot.subject,
            originalFacultyId: selectedSlot.facultyId,
            replacementFacultyId: selectedReplacementFaculty,
            replacementFacultyName: replacement ? `${replacement.firstName} ${replacement.lastName}` : 'TBA'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Timetable altered successfully!",
        });
        setIsAlterModalOpen(false);
        
        // Fetch fresh data from server
        let freshAlterations: AlterationRecord[] = [];
        try {
          const token = authToken || localStorage.getItem('authToken');
          const alterationsResponse = await fetch('/api/v1/faculty/timetable/alterations', {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          if (alterationsResponse.ok) {
            const alterationsData = await alterationsResponse.json();
            if (alterationsData.success && alterationsData.data) {
              freshAlterations = alterationsData.data;
              setAlterations(freshAlterations);
            }
          }
        } catch (error) {
          console.error('Error fetching fresh alterations:', error);
        }

        // Now fetch and update timetable with fresh alterations
        setLoadingTimetable(true);
        try {
          const token = authToken || localStorage.getItem('authToken');
          const response = await fetch(
            `/api/v1/timetable/department/${selectedYear}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const timetableData = await response.json();

            if (timetableData.success) {
              let timetable = timetableData.timetable || timetableData.data || [];
              
              // Apply fresh alterations to the timetable (check 24-hour validity)
              const now = new Date();
              const validAlterations = freshAlterations.filter(alt => {
                const altDate = new Date(alt.createdAt);
                const hoursDiff = (now.getTime() - altDate.getTime()) / (1000 * 60 * 60);
                return hoursDiff <= 24;
              });

              console.log('Valid alterations to apply:', validAlterations);
              
              // Apply alterations to timetable slots
              timetable = timetable.map((slot: TimetableSlot) => {
                const matchingAlt = validAlterations.find(
                  alt => alt.day === slot.day && 
                         alt.hour === slot.hour && 
                         alt.section === slot.section
                );
                
                if (matchingAlt) {
                  console.log('Applying alteration to slot:', slot, 'with alt:', matchingAlt);
                  return {
                    ...slot,
                    isAltered: true,
                    alteredAt: matchingAlt.createdAt,
                    originalFacultyId: slot.facultyId,
                    originalFacultyName: slot.facultyName,
                    facultyId: matchingAlt.replacementFacultyId,
                    facultyName: matchingAlt.replacementFacultyName
                  };
                }
                return slot;
              });
              
              setTimetableData(timetable);
            }
          }
        } catch (error: any) {
          console.error("Error updating timetable after alteration:", error);
        } finally {
          setLoadingTimetable(false);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to apply alteration",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error applying alteration:", error);
      toast({
        title: "Error",
        description: "Failed to apply alteration",
        variant: "destructive",
      });
    } finally {
      setIsApplyingAlteration(false);
    }
  };

  // Build timetable grid data
  const getTimetableForCell = (day: string, hour: number): TimetableSlot[] => {
    return timetableData.filter(
      slot => slot.day === day && slot.hour === hour
    );
  };

  // Bulk Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setUploadSuccess(false);
      setPreviewData([]);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file",
          description: "Please select a valid CSV file.",
          variant: "destructive",
        });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadSuccess(false);
      setPreviewData([]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadSuccess(false);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ 
        title: "Validation Error", 
        description: "Please select a CSV file to upload.", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('academicYear', academicYear);
    formData.append('semester', semester);

    try {
      const token = authToken || localStorage.getItem('authToken');
      
      const response = await fetch(
        "/api/v1/timetable/bulk-upload",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Bulk timetable uploaded successfully! ${data.insertedCount} records inserted and ${data.deletedCount || 0} old records replaced.`,
        });
        
        setUploadSuccess(true);
        
        if (data.preview && data.preview.length > 0) {
          const preview: TimetablePreview[] = data.preview.map((item: any, index: number) => ({
            facultyId: item.facultyId || "",
            facultyName: item.facultyName || "",
            department: item.department || "",
            day: item.day || "",
            hour: item.hour || 0,
            subject: item.subject || "",
            section: item.section || "",
            year: item.year || "",
            academicYear: item.academicYear || academicYear
          }));
          setPreviewData(preview);
        }
        
        clearFile();
      } else {
        const errorMsg = data.error || data.message || "Failed to upload timetable.";
        toast({
          title: "Upload Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error uploading timetable:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Timetable</h1>
          <p className="text-muted-foreground">
            Upload or alter department-wide timetable
          </p>
        </div>

        {/* Action Type Toggle */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActionType('bulk')}
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px",
              actionType === 'bulk'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Bulk Upload
          </button>
          <button
            onClick={() => setActionType('alteration')}
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px",
              actionType === 'alteration'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Timetable Alteration
          </button>
        </div>

        {/* Bulk Upload Section */}
        {actionType === 'bulk' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Side - Upload Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Bulk Timetable</CardTitle>
                  <CardDescription>
                    Fill in the details and upload your CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Academic Year */}
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Select value={academicYear} onValueChange={setAcademicYear}>
                      <SelectTrigger id="academicYear">
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="odd">Odd Semester</SelectItem>
                        <SelectItem value="even">Even Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Upload - Drag & Drop Style */}
                  <div className="space-y-2">
                    <Label>CSV File Upload</Label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                        isDragging 
                          ? "border-primary bg-primary/5" 
                          : file 
                            ? "border-green-500 bg-green-50" 
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                        "relative"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {file ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-green-500" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{file.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                              }}
                              className="p-1 hover:bg-muted rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                          <p className="font-medium">Drag and drop your CSV file here</p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                        </div>
                      )}
                    </div>
                    {file && (
                      <p className="text-sm text-green-600 flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {file.name} selected ({Math.round(file.size / 1024)} KB)
                      </p>
                    )}
                  </div>

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    className="w-full"
                    disabled={isUploading || !file}
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Bulk Timetable
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview Table */}
              {uploadSuccess && previewData.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Upload Preview</CardTitle>
                    <CardDescription>
                      Showing sample of uploaded timetable data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left font-medium">Faculty ID</th>
                            <th className="p-2 text-left font-medium">Faculty Name</th>
                            <th className="p-2 text-left font-medium">Department</th>
                            <th className="p-2 text-left font-medium">Day</th>
                            <th className="p-2 text-left font-medium">Hour</th>
                            <th className="p-2 text-left font-medium">Subject</th>
                            <th className="p-2 text-left font-medium">Section</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-2">{row.facultyId}</td>
                              <td className="p-2">{row.facultyName}</td>
                              <td className="p-2">{row.department}</td>
                              <td className="p-2">{row.day}</td>
                              <td className="p-2">{row.hour}</td>
                              <td className="p-2">{row.subject}</td>
                              <td className="p-2">{row.section}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - CSV Format Requirements */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>CSV Format Requirements</CardTitle>
                  <CardDescription>
                    Required columns for bulk upload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Required Columns (Header Row Mandatory):
                    </p>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">facultyId</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">facultyName</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">department</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">year</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">section</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">day</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">hour</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">subject</span>
                      </div>
                      <div className="bg-background p-2 rounded border">
                        <span className="text-primary font-semibold">academicYear</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                      Note: Column names must match exactly as shown above.
                    </p>
                  </div>

                  {/* Sample CSV */}
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">Example CSV Content:</p>
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs font-mono whitespace-pre">
{`facultyId,facultyName,department,year,section,day,hour,subject,academicYear
FAC001,John Smith,CSE,1,A,Monday,1,Math,2025-2026
FAC001,John Smith,CSE,1,A,Monday,2,Physics,2025-2026
FAC002,Jane Doe,CSE,2,B,Tuesday,1,Chemistry,2025-2026`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Timetable Alteration Section */}
        {actionType === 'alteration' && (
          <div className="space-y-6">
            {/* Year and Academic Year Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Timetable Alteration</CardTitle>
                <CardDescription>
                  Select year and modify the timetable as needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2 min-w-[200px]">
                    <Label>Select Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">I Year</SelectItem>
                        <SelectItem value="2">II Year</SelectItem>
                        <SelectItem value="3">III Year</SelectItem>
                        <SelectItem value="4">IV Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchTimetable} disabled={loadingTimetable}>
                      {loadingTimetable ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Fetch Timetable
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timetable Grid */}
            {loadingTimetable ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : timetableData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Class Timetable - Year {selectedYear}</CardTitle>
                  <CardDescription>
                    Click on any cell to alter the faculty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-3 text-left font-semibold min-w-[100px]">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Time
                          </th>
                          {days.map(day => (
                            <th key={day} className="border p-3 text-center font-semibold min-w-[140px]">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hours.map(hour => (
                          <tr key={hour}>
                            <td className="border p-2 text-sm font-medium bg-muted/30">
                              <div className="flex flex-col">
                                <span>Hour {hour}</span>
                                <span className="text-xs text-muted-foreground font-normal">
                                  {formatHourForDisplay(hour)}
                                </span>
                              </div>
                            </td>
                            {days.map(day => {
                              const slots = getTimetableForCell(day, hour);
                              const hasAlteredSlot = slots.some(s => s.isAltered);
                              return (
                                <td 
                                  key={`${day}-${hour}`} 
                                  className={cn(
                                    "border p-2 min-h-[80px] cursor-pointer hover:bg-primary/5 transition-colors",
                                    hasAlteredSlot && "bg-yellow-50"
                                  )}
                                  title={hasAlteredSlot ? "Substituted Class" : ""}
                                  onClick={() => {
                                    if (slots.length > 0) {
                                      handleSlotClick(slots[0]);
                                    }
                                  }}
                                >
                                  {slots.length > 0 ? (
                                    <div className="space-y-1">
                                      {slots.map((slot, idx) => (
                                        <div 
                                          key={slot.id || idx}
                                          className={cn(
                                            "p-2 rounded text-xs hover:bg-primary/20 transition-colors",
                                            slot.isAltered ? "bg-yellow-100 border border-yellow-300" : "bg-primary/10"
                                          )}
                                        >
                                          <div className="font-semibold text-primary">{slot.subject}</div>
                                          <div className="text-muted-foreground flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {slot.facultyName}
                                          </div>
                                          <div className="text-muted-foreground text-[10px]">
                                            Section: {slot.section}
                                          </div>
                                          {slot.isAltered && (
                                            <div className="text-yellow-700 text-[10px] font-medium mt-1">
                                              (Substituted)
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                                      -
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No timetable found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select a year and click "Fetch Timetable" to load the timetable.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Alter Period Modal */}
        <Dialog open={isAlterModalOpen} onOpenChange={setIsAlterModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Alter Period</DialogTitle>
              <DialogDescription>
                Replace the faculty for this timetable slot
              </DialogDescription>
            </DialogHeader>
            
            {selectedSlot && (
              <div className="space-y-4 py-4">
                {/* Current Slot Details */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Day:</span>
                      <span className="ml-2 font-medium">{selectedSlot.day}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hour:</span>
                      <span className="ml-2 font-medium">{selectedSlot.hour} ({formatHourForDisplay(selectedSlot.hour)})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="ml-2 font-medium">{selectedSlot.subject}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Section:</span>
                      <span className="ml-2 font-medium">{selectedSlot.section}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Current Faculty:</span>
                    <span className="ml-2 font-medium">{selectedSlot.facultyName}</span>
                  </div>
                </div>

                {/* Replacement Faculty Selection */}
                <div className="space-y-3">
                  <Label>Select Faculty for Substitution</Label>
                  {loadingFreeFaculty ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading faculty list...
                    </div>
                  ) : freeFaculty.length > 0 ? (
                    <div className="space-y-3">
                      {/* Faculty List with Availability Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                        {freeFaculty.map(faculty => (
                          <button
                            key={faculty.facultyId}
                            onClick={() => setSelectedReplacementFaculty(faculty.facultyId)}
                            className={cn(
                              "p-3 text-left rounded-md border-2 transition-colors",
                              selectedReplacementFaculty === faculty.facultyId
                                ? "border-red-600 bg-red-50 dark:bg-red-950"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {faculty.firstName} {faculty.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {faculty.facultyId}
                                </p>
                              </div>
                              {faculty.isFree && (
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded whitespace-nowrap">
                                  Free
                                </span>
                              )}
                              {!faculty.isFree && (
                                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded whitespace-nowrap">
                                  Busy
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {selectedReplacementFaculty && (
                        <div className="text-sm bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-2">
                          Selected: <span className="font-medium">
                            {freeFaculty.find(f => f.facultyId === selectedReplacementFaculty)?.firstName}{' '}
                            {freeFaculty.find(f => f.facultyId === selectedReplacementFaculty)?.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">
                      No faculty found in this department.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAlterModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApplyAlteration} 
                disabled={!selectedReplacementFaculty || isApplyingAlteration}
              >
                {isApplyingAlteration ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Alteration"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
