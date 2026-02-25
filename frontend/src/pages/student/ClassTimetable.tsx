import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { Download, Share2, Clock } from 'lucide-react';
import { Button } from '@/pages/admin/superadmin/components/ui/button';

interface TimetableSlot {
  period_number: number;
  day_of_week: string;
  subject?: { subject_code: string; subject_name: string };
  faculty?: { first_name: string; last_name: string };
  room_number: string;
  period_type: string;
  is_break: boolean;
}

interface BreakTiming {
  break_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

interface ClassTimetableProps {
  classId: number;
  timetableId: number;
}

export default function ClassTimetableView({
  classId,
  timetableId
}: ClassTimetableProps) {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [breakTimings, setBreakTimings] = useState<BreakTiming[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchClassTimetable();
  }, [classId, timetableId]);

  const fetchClassTimetable = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/timetable-management/class/${classId}/timetable/${timetableId}`);
      const result = await response.json();

      if (result.success) {
        setTimetable(result.data.timetable);
        setBreakTimings(result.data.breakTimings);
        setClassInfo(result.data.classInfo);

        // Fetch period configuration
        const periodResponse = await fetch(`/api/v1/timetable-management/periods/${result.data.classInfo.department_id}`);
        const periodResult = await periodResponse.json();
        if (periodResult.success) {
          setPeriods(periodResult.data);
        }
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
CLASS TIMETABLE
${classInfo?.name}
Room: ${classInfo?.room}

${days.map(day => {
  let dayContent = `${day}:\n`;
  periods.forEach((period: any) => {
    const slot = getTimetableSlot(day, period.period_number);
    const timing = `${period.start_time} - ${period.end_time}`;
    
    if (slot?.is_break) {
      dayContent += `  Period ${period.period_number} (${timing}): BREAK\n`;
    } else if (slot?.subject) {
      const classroom = slot.room_number ? ` [Classroom: ${slot.room_number}]` : '';
      dayContent += `  Period ${period.period_number} (${timing}): ${slot.subject.subject_name} - ${slot.faculty?.first_name} ${slot.faculty?.last_name}${classroom}\n`;
    } else {
      dayContent += `  Period ${period.period_number} (${timing}): -\n`;
    }
  });
  return dayContent;
}).join('\n\n')}

BREAK TIMINGS (${classInfo?.semester <= 2 ? '1st & 2nd Year' : '3rd & 4th Year'}):
${breakTimings.map(b => `${b.break_name}: ${b.start_time} - ${b.end_time}`).join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `timetable_${classInfo?.name}.txt`);
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{classInfo?.name}</h1>
          <p className="text-gray-600 mt-2">
            Room: <span className="font-semibold">{classInfo?.room}</span>
          </p>
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

      {/* Break Timings */}
      {breakTimings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Break Timings</h3>
              <div className="grid grid-cols-2 gap-2">
                {breakTimings.map((timing, idx) => (
                  <div key={idx} className="text-sm text-amber-800">
                    <span className="font-semibold">{timing.break_name}</span>: {timing.start_time} - {timing.end_time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 min-w-[140px]">
                Period
              </th>
              {days.map(day => (
                <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[200px]">
                  <div>{day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 sticky left-0 bg-white border-r">
                  <div className="text-sm font-semibold text-gray-900">
                    Period {period.period_number}
                  </div>
                  <div className="text-xs text-gray-500">
                    {period.start_time} - {period.end_time}
                  </div>
                </td>
                {days.map(day => {
                  const slot = getTimetableSlot(day, period.period_number);
                  
                  return (
                    <td key={`${day}-${period.period_number}`} className="px-4 py-4 text-center">
                      {slot?.is_break ? (
                        <div className="bg-amber-100 border border-amber-300 rounded p-2">
                          <div className="text-xs font-semibold text-amber-900">BREAK</div>
                        </div>
                      ) : slot?.subject ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {slot.subject.subject_code}
                          </div>
                          <div className="text-xs text-gray-700">
                            {slot.subject.subject_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {slot.faculty?.first_name} {slot.faculty?.last_name}
                          </div>
                          {slot.room_number && (
                            <div className="text-xs font-medium text-blue-700 pt-1 border-t border-blue-100">
                              📍 Classroom {slot.room_number}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-300 text-sm">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-700">Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-100 border border-amber-300 rounded"></div>
            <span className="text-sm text-gray-700">Break</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
            <span className="text-sm text-gray-700">Unused</span>
          </div>
        </div>
      </div>
    </div>
  );
}
