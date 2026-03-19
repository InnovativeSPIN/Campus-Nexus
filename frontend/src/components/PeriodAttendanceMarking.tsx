import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { CheckCircle2, Clock, Calendar, Save } from 'lucide-react';
import { getTeachingPeriodsOptions, formatPeriodDisplay } from '@/utils/periodConfiguration';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  photo?: string;
}

interface PeriodAttendanceProps {
  classDate: string;
  classSectionId: number;
  subjectId: number;
  students: Student[];
  loading?: boolean;
  authToken?: string;
  onSuccess?: () => void;
}

export const PeriodAttendanceMarking: React.FC<PeriodAttendanceProps> = ({
  classDate,
  classSectionId,
  subjectId,
  students,
  loading = false,
  authToken,
  onSuccess
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [markAllPresent, setMarkAllPresent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  
  const teachingPeriods = getTeachingPeriodsOptions();
  
  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAttendanceChange = (studentId: string, value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleMarkAll = (checked: boolean) => {
    setMarkAllPresent(checked);
    if (checked) {
      const allPresent: Record<string, string> = {};
      students.forEach(s => {
        allPresent[s.id] = 'present';
      });
      setAttendanceData(allPresent);
    } else {
      setAttendanceData({});
    }
  };

  const handleSave = async () => {
    if (!authToken) {
      toast.error('Authentication required');
      return;
    }

    if (Object.keys(attendanceData).length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/v1/student/attendance/mark-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          classDate,
          classSectionId,
          subjectId,
          periodSlotId: selectedPeriod,
          attendance: attendanceData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Attendance saved for ${result.data.successful} students`);
        if (result.data.failed > 0) {
          toast.warning(`Failed to save for ${result.data.failed} students`);
        }
        setAttendanceData({});
        setMarkAllPresent(false);
        onSuccess?.();
      } else {
        toast.error(result.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceCount = () => {
    return {
      total: Object.keys(attendanceData).length,
      present: Object.values(attendanceData).filter(v => v === 'present').length,
      absent: Object.values(attendanceData).filter(v => v === 'absent').length,
      late: Object.values(attendanceData).filter(v => v === 'late').length,
      onDuty: Object.values(attendanceData).filter(v => v === 'od').length,
    };
  };

  const count = getAttendanceCount();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Period Selection */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
        <Clock className="w-5 h-5 text-primary" />
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {teachingPeriods.map(period => (
              <SelectItem key={period.value} value={period.value.toString()}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-2" />
            {classDate}
          </span>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-5 gap-3">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-blue-600">{count.total}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
          <p className="text-xs text-muted-foreground">Present</p>
          <p className="text-2xl font-bold text-green-600">{count.present}</p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
          <p className="text-xs text-muted-foreground">Absent</p>
          <p className="text-2xl font-bold text-red-600">{count.absent}</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-xs text-muted-foreground">Late</p>
          <p className="text-2xl font-bold text-yellow-600">{count.late}</p>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
          <p className="text-xs text-muted-foreground">On Duty</p>
          <p className="text-2xl font-bold text-purple-600">{count.onDuty}</p>
        </div>
      </div>

      {/* Search and Mark All */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by name or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card">
          <Switch
            id="mark-all"
            checked={markAllPresent}
            onCheckedChange={handleMarkAll}
          />
          <Label htmlFor="mark-all" className="cursor-pointer">Mark All Present</Label>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2 max-h-96 overflow-y-auto border border-border rounded-lg p-3">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              attendanceData[student.id] ? 'bg-muted/50 border-primary/30' : 'bg-card border-border hover:border-primary/20'
            )}
          >
            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
            </div>

            {/* Attendance Options */}
            <RadioGroup
              value={attendanceData[student.id] || ''}
              onValueChange={(value) => handleAttendanceChange(student.id, value)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="present" id={`present-${student.id}`} />
                  <Label
                    htmlFor={`present-${student.id}`}
                    className="text-xs cursor-pointer font-medium text-green-600"
                  >
                    P
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                  <Label
                    htmlFor={`absent-${student.id}`}
                    className="text-xs cursor-pointer font-medium text-red-600"
                  >
                    A
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="late" id={`late-${student.id}`} />
                  <Label
                    htmlFor={`late-${student.id}`}
                    className="text-xs cursor-pointer font-medium text-yellow-600"
                  >
                    L
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="od" id={`od-${student.id}`} />
                  <Label
                    htmlFor={`od-${student.id}`}
                    className="text-xs cursor-pointer font-medium text-purple-600"
                  >
                    OD
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setAttendanceData({});
            setMarkAllPresent(false);
          }}
          disabled={saving}
        >
          Clear
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || Object.keys(attendanceData).length === 0}
          className="flex-1"
        >
          {saving ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Attendance
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default PeriodAttendanceMarking;
