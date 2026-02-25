import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Download, Share2 } from 'lucide-react';
import { Button } from '@/pages/admin/superadmin/components/ui/button';

interface FacultyTimetableSlot {
  id: number;
  day_of_week: string;
  period_number: number;
  subject: { id: number; subject_code: string; subject_name: string };
  class: { id: number; name: string; room: string };
  room_number: string;
  period_type: string;
  is_break: boolean;
  status: string;
}

interface FacultyTimetableProps {
  facultyId: number;
  academicYear?: string;
  semester?: string;
}

export default function FacultyTimetableView({
  facultyId,
  academicYear,
  semester
}: FacultyTimetableProps) {
  const [timetable, setTimetable] = useState<FacultyTimetableSlot[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<number[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchFacultyTimetable();
  }, [facultyId, academicYear, semester]);

  const fetchFacultyTimetable = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (academicYear) params.append('academic_year', academicYear);
      if (semester) params.append('semester', semester);

      const response = await fetch(`/api/v1/timetable-management/faculty/${facultyId}?${params}`);
      const result = await response.json();

      if (result.success) {
        setTimetable(result.data.timetable);
        setLeaves(result.data.leaves);
        setIsOnLeave(result.data.isOnLeave);

        // Extract unique periods
        const periodNumbers = result.data.timetable.map((t: FacultyTimetableSlot) => t.period_number);
        const uniquePeriods = Array.from(new Set<number>(periodNumbers)).sort((a: number, b: number) => a - b);
        setPeriods(uniquePeriods);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTimetableSlot = (day: string, periodNumber: number) => {
    return timetable.find(t => t.day_of_week === day && t.period_number === periodNumber);
  };

  const downloadTimetable = () => {
    const content = `
Faculty Timetable - ${facultyId}
${academicYear} - ${semester}

${days.map(day => {
  let dayContent = `${day}:\n`;
  periods.forEach(period => {
    const slot = getTimetableSlot(day, period);
    if (slot) {
      const classroom = slot.room_number ? ` [Classroom: ${slot.room_number}]` : '';
      dayContent += `  Period ${period}: ${slot.subject?.subject_name} (${slot.class.name})${classroom}\n`;
    }
  });
  return dayContent;
}).join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `faculty_timetable_${facultyId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading timetable...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Status Alert */}
      {isOnLeave && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Currently on Leave</h3>
              <p className="text-sm text-red-800 mt-1">
                {leaves[0]?.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Headers */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Timetable</h2>
          <p className="text-gray-600 mt-1">{academicYear} - {semester?.toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadTimetable} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100">Period</th>
              {days.map(day => (
                <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[180px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-900 sticky left-0 bg-white border-r">
                  Period {period}
                </td>
                {days.map(day => {
                  const slot = getTimetableSlot(day, period);
                  return (
                    <td key={`${day}-${period}`} className="px-4 py-4 text-center">
                      {slot ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {slot.subject?.subject_code}
                          </div>
                          <div className="text-xs text-gray-600">
                            {slot.class.name}
                          </div>
                          {slot.room_number && (
                            <div className="text-xs font-medium text-blue-700 pt-1 border-t border-blue-100">
                              📍 Classroom {slot.room_number}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
