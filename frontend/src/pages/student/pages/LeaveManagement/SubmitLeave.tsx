import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/pages/student/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Button } from '@/pages/student/components/ui/button';
import { Input } from '@/pages/student/components/ui/input';
import { Label } from '@/pages/student/components/ui/label';
import { Textarea } from '@/pages/student/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/student/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/pages/student/components/ui/card';
import {
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/pages/student/hooks/use-toast';

interface LeaveFormData {
  leaveType: string;
  leaveSubType: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  reason: string;
  attachment: File | null;
  recipient: string;
}

export default function SubmitLeave() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: '',
    leaveSubType: '',
    startDate: '',
    endDate: '',
    totalDays: '',
    reason: '',
    attachment: null,
    recipient: 'Class Incharge',
  });

  const leaveTypes = [
    'Casual',
    'Medical',
    'On-Duty',
    'Special',
    'Other',
  ];

  const leaveSubTypes = {
    'Casual': ['Personal', 'Family Event', 'Travel', 'Other'],
    'Medical': ['Sick', 'Hospitalization', 'Medical Checkup'],
    'On-Duty': ['Academic', 'Sports', 'Cultural', 'Other'],
    'Special': ['Semester Exams', 'Supplementary', 'Emergency'],
    'Other': ['Emergency', 'Other Reason'],
  };

  // Calculate total days
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return '0';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, days).toString();
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (newData.startDate && newData.endDate) {
      newData.totalDays = calculateDays(newData.startDate, newData.endDate);
      setFormData(newData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, attachment: e.target.files?.[0] || null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/student-leaves/approvals/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveType: formData.leaveType,
          leaveSubType: formData.leaveSubType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalDays: formData.totalDays,
          reason: formData.reason,
          submitted_to: formData.recipient,
        }),
      });

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Leave application submitted successfully',
        });
        navigate('/student/my-leaves');
      } else {
        const error = await response.json();
        toast({
          title: '❌ Error',
          description: error.message || 'Failed to submit leave',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error submitting leave:', err);
      toast({
        title: '❌ Error',
        description: 'Failed to submit leave application',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="page-header font-serif">Submit Leave Application</h1>
        <p className="text-muted-foreground -mt-4">
          Fill in the details to apply for leave
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Form Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Leave Details
            </CardTitle>
            <CardDescription>
              Application Flow: You → Class Incharge → Department Admin → Approved
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <Label>Leave Type *</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value, leaveSubType: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'On-Duty' ? 'On-Duty' :
                         type === 'Other' ? 'Other' :
                         type + ' Leave'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit To */}
              <div>
                <Label>Submit To *</Label>
                <Select value={formData.recipient} onValueChange={(value) => setFormData({ ...formData, recipient: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class Incharge">Class Incharge</SelectItem>
                    <SelectItem value="Faculty Advisor">Faculty Advisor</SelectItem>
                    <SelectItem value="HOD">Head of Department (HOD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Sub Type */}
              {formData.leaveType && (
                <div>
                  <Label>Sub Type</Label>
                  <Select value={formData.leaveSubType} onValueChange={(value) => setFormData({ ...formData, leaveSubType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(leaveSubTypes[formData.leaveType as keyof typeof leaveSubTypes] || []).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label>To Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Total Days - Read Only */}
              <div>
                <Label>Total Days</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold">{formData.totalDays} days</span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label>Reason for Leave *</Label>
                <Textarea
                  placeholder="Enter your reason for taking leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Attachment */}
              <div>
                <Label>Attachment (Optional)</Label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !formData.leaveType}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Application'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Your Submission</p>
                    <p className="text-xs text-muted-foreground">
                      Submit your leave application
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Class Incharge Review</p>
                    <p className="text-xs text-muted-foreground">
                      Approval from your class incharge
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Department Admin Approval</p>
                    <p className="text-xs text-muted-foreground">
                      Final approval from department admin
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-sm">Approved</p>
                    <p className="text-xs text-muted-foreground">
                      Your leave is now approved
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Submit at least 2 days before your leave</p>
              <p>• You can withdraw pending applications</p>
              <p>• Check status regularly in your leave tracker</p>
              <p>• Approval remarks will be shown at each stage</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
}
