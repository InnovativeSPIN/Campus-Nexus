/**
 * Period Configuration Utility
 * According to the specification document:
 * - Periods: 1=I (9:30-10:20), 2=II (10:20-11:10), 3=Tea Break (11:10-11:30) SKIP,
 *   4=III (11:30-12:25), 5=Lunch (12:25-13:10) SKIP, 6=IV (13:10-14:00),
 *   7=V (14:00-14:50), 8=Short Break (14:50-15:10) SKIP, 9=VI (15:10-16:00), 10=VII (16:00-16:45)
 */

// Break period IDs that should not be marked for attendance
const BREAK_PERIOD_IDS = [3, 5, 8];

// Teaching period IDs (only these can be marked for attendance)
const TEACHING_PERIOD_IDS = [1, 2, 4, 6, 7, 9, 10];

interface PeriodInfo {
  label: string;
  startTime: string;
  endTime: string;
  type: 'teaching' | 'break';
}

// Period configuration with labels and times
export const PERIOD_CONFIG: Record<number, PeriodInfo> = {
  1: { label: 'I', startTime: '09:30', endTime: '10:20', type: 'teaching' },
  2: { label: 'II', startTime: '10:20', endTime: '11:10', type: 'teaching' },
  3: { label: 'Tea Break', startTime: '11:10', endTime: '11:30', type: 'break' },
  4: { label: 'III', startTime: '11:30', endTime: '12:25', type: 'teaching' },
  5: { label: 'Lunch', startTime: '12:25', endTime: '13:10', type: 'break' },
  6: { label: 'IV', startTime: '13:10', endTime: '14:00', type: 'teaching' },
  7: { label: 'V', startTime: '14:00', endTime: '14:50', type: 'teaching' },
  8: { label: 'Short Break', startTime: '14:50', endTime: '15:10', type: 'break' },
  9: { label: 'VI', startTime: '15:10', endTime: '16:00', type: 'teaching' },
  10: { label: 'VII', startTime: '16:00', endTime: '16:45', type: 'teaching' }
};

/**
 * Check if a period ID is a teaching period
 */
export const isTeachingPeriod = (periodId: number) => {
  return TEACHING_PERIOD_IDS.includes(periodId);
};

/**
 * Check if a period ID is a break period
 */
export const isBreakPeriod = (periodId: number) => {
  return BREAK_PERIOD_IDS.includes(periodId);
};

/**
 * Get all teaching periods
 */
export const getTeachingPeriods = () => {
  return TEACHING_PERIOD_IDS.map(id => ({
    id,
    ...PERIOD_CONFIG[id]
  }));
};

/**
 * Get period label
 */
export const getPeriodLabel = (periodId: number) => {
  return PERIOD_CONFIG[periodId]?.label || `Period ${periodId}`;
};

/**
 * Get period time
 */
export const getPeriodTime = (periodId: number) => {
  const config = PERIOD_CONFIG[periodId];
  return config ? `${config.startTime} - ${config.endTime}` : 'N/A';
};

/**
 * Format period for display
 */
export const formatPeriodDisplay = (periodId: number) => {
  const config = PERIOD_CONFIG[periodId];
  if (!config) return `Unknown Period ${periodId}`;
  return `${config.label} (${config.startTime} - ${config.endTime})`;
};

/**
 * Get all periods (teaching + breaks)
 */
export const getAllPeriods = () => {
  const periods = [];
  for (let i = 1; i <= 10; i++) {
    periods.push({
      id: i,
      ...PERIOD_CONFIG[i]
    });
  }
  return periods;
};

/**
 * Get teaching periods with options for select/dropdown
 */
export const getTeachingPeriodsOptions = () => {
  return TEACHING_PERIOD_IDS.map(id => ({
    value: id,
    label: formatPeriodDisplay(id)
  }));
};
