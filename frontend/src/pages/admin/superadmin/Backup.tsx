import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/pages/admin/superadmin/components/ui/card';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { Checkbox } from '@/pages/admin/superadmin/components/ui/checkbox';
import { Label } from '@/pages/admin/superadmin/components/ui/label';
import { Database, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/pages/admin/superadmin/components/ui/progress';

interface BackupOption {
  id: string;
  label: string;
  description: string;
  size: string;
}

const backupOptions: BackupOption[] = [
  { id: 'students', label: 'Student Data', description: 'All student records and enrollment data', size: '24 MB' },
  { id: 'faculty', label: 'Faculty Data', description: 'Faculty profiles and assignments', size: '8 MB' },
  { id: 'departments', label: 'Department Data', description: 'Department configurations and mappings', size: '2 MB' },
  { id: 'attendance', label: 'Attendance Records', description: 'Historical attendance data', size: '156 MB' },
  { id: 'grades', label: 'Grade Records', description: 'Student grades and transcripts', size: '89 MB' },
];

interface BackupHistory {
  id: string;
  date: string;
  type: string;
  status: 'completed' | 'failed';
  size: string;
}

const backupHistory: BackupHistory[] = [
  { id: '1', date: '2024-01-15 14:30', type: 'Full Backup', status: 'completed', size: '279 MB' },
  { id: '2', date: '2024-01-14 14:30', type: 'Student Data', status: 'completed', size: '24 MB' },
  { id: '3', date: '2024-01-13 14:30', type: 'Full Backup', status: 'failed', size: '0 MB' },
  { id: '4', date: '2024-01-12 14:30', type: 'Faculty Data', status: 'completed', size: '8 MB' },
];

export default function SuperAdminBackup() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedOptions.length === backupOptions.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(backupOptions.map((o) => o.id));
    }
  };

  const startBackup = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one data type to backup');
      return;
    }

    setIsBackingUp(true);
    setProgress(0);

    // Simulate backup progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsBackingUp(false);
    setProgress(0);
    toast.success('Backup completed successfully!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Backup</h1>
          <p className="text-muted-foreground">Create and manage data backups</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Backup Options */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Create Backup</CardTitle>
                  <CardDescription>Select data to include in backup</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedOptions.length === backupOptions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {backupOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="font-medium text-foreground cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{option.size}</span>
                </div>
              ))}

              {isBackingUp && (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Backup in progress...</span>
                    <span className="font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={startBackup}
                disabled={isBackingUp || selectedOptions.length === 0}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isBackingUp ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Start Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Backup History</CardTitle>
              <CardDescription>Previous backup records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backupHistory.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      {backup.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{backup.type}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {backup.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{backup.size}</span>
                      {backup.status === 'completed' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
