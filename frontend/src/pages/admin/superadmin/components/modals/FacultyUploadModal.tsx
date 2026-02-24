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
import { Loader2 } from 'lucide-react';

interface FacultyUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FacultyUploadModal({ open, onOpenChange, onSuccess }: FacultyUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const downloadSample = () => {
    // simple CSV sample, user can open in Excel
    const sample =
      'Name,faculty_college_code,email,department_id,department,designation,coe_id,AICTE_ID,Anna_University_ID,phone_number,gender,date_of_birth,date_of_joining,blood_group,aadhar_number,pan_number,perm_address,curr_address,linkedin_url\n' +
      'John Doe,CS001,john.doe@example.com,1,Computer Science,Assistant Professor,,123,456,9876543210,Male,1980-01-01,2010-06-01,O+,123456789012,ABCDE1234F,123 Main St,456 College Rd,\n';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty_upload_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      const res = await fetch('/api/v1/faculty/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        toast.success(
          `Imported ${result.count} faculty record${result.count === 1 ? '' : 's'}`
        );
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Failed to upload file');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Faculty Data</DialogTitle>
          <DialogDescription>
            Select an Excel/CSV file containing faculty information. Use the sample for
            the limited set of fields managed by super‑admin – other data is updated
            later through the faculty profile module.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" type="button" onClick={downloadSample}>
              Download Sample CSV
            </Button>
            <span className="text-sm text-muted-foreground">
              (You can edit the CSV in Excel and save as .xlsx if needed)
            </span>
          </div>
          <Input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            disabled={loading}
          />
          <DialogFooter>
            <Button disabled={loading || !file} type="submit">
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
