import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/pages/admin/superadmin/components/ui/dialog';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Input } from '@/pages/admin/superadmin/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Loader2, Download } from 'lucide-react';

interface StudentBulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StudentBulkUploadModal({ open, onOpenChange, onSuccess }: StudentBulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const downloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await fetch('/api/v1/students/bulk/template', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_bulk_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error(err.message || 'Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/students/bulk/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success(
          `Successfully created ${result.data.successfullyCreated} students`
        );
        setFile(null);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        // Show validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMsg = result.errors.slice(0, 5).join('\n');
          toast.error(`Upload failed:\n${errorMsg}`);
        } else {
          toast.error(result.message || 'Failed to upload file');
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student information. Download the template to see the required format and field descriptions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              type="button" 
              onClick={downloadTemplate}
              disabled={downloadingTemplate}
              className="gap-2"
            >
              {downloadingTemplate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              (CSV format with required fields)
            </span>
          </div>

          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
            <Input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={loading}
              className="cursor-pointer text-sm"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ {file.name} selected
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Fields:</p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• studentId (unique)</li>
              <li>• firstName, lastName</li>
              <li>• email (unique)</li>
              <li>• phone (10 digits)</li>
              <li>• gender (male/female/other)</li>
              <li>• departmentId</li>
              <li>• batch (e.g., 2024-2028)</li>
              <li>• semester, year</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button disabled={loading || !file} type="submit">
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {loading ? 'Uploading...' : 'Upload Students'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
