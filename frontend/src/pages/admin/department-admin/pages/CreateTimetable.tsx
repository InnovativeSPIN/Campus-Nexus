import React, { useState, useRef } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle2, FileText, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";

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

export const CreateTimetable = () => {
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("odd");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewData, setPreviewData] = useState<TimetablePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { authToken } = useAuth();

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
      // Only set Authorization header, NOT Content-Type
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

        // Set preview data from response
        if (data.preview && data.preview.length > 0) {
          // Use preview data directly from the response
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

        // Clear file input after success
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
          <h1 className="text-2xl font-bold tracking-tight">Bulk Timetable Upload</h1>
          <p className="text-muted-foreground">
            Upload department-wide timetable CSV file containing multiple faculty schedules.
          </p>
        </div>

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

            {/* Preview Table - Shows after successful upload */}
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
                      <span className="text-primary font-semibold">id</span>
                    </div>
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
                    <div className="bg-background p-2 rounded border">
                      <span className="text-primary font-semibold">createdAt</span>
                    </div>
                    <div className="bg-background p-2 rounded border">
                      <span className="text-primary font-semibold">updatedAt</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Note: Column names must match exactly. The id, createdAt, and updatedAt fields are auto-generated if not provided.
                  </p>
                </div>

                {/* Sample CSV */}
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Example CSV Content:</p>
                  <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre">
                      {`facultyId,facultyName,department,year,section,day,hour,subject,academicYear
FAC001,John Smith,CSE,1st,A,Monday,1,Math,2025-2026
FAC001,John Smith,CSE,1st,A,Monday,2,Physics,2025-2026
FAC002,Jane Doe,CSE,2nd,B,Tuesday,1,Chemistry,2025-2026`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateTimetable;
