/**
 * Generate academic years in the format "YYYY-YYYY"
 * Example: For current year 2026, returns "2023-2027"
 * @param currentYear - The current year (default: current year)
 * @param rangeYears - Number of years to go back (default: 3, so total span is 4 years)
 * @returns Array of academic year strings like ["2023-2027", "2024-2028", ...]
 */
export function generateAcademicYears(currentYear = new Date().getFullYear(), rangeYears = 3) {
  const years = [];
  for (let i = rangeYears; i >= 0; i--) {
    const startYear = currentYear - i;
    const endYear = startYear + 4; // 4-year program
    years.push(`${startYear}-${endYear}`);
  }
  return years;
}

/**
 * Get the current academic year in the format "YYYY-YYYY"
 * Example: For year 2026, returns "2023-2027"
 * @returns Current academic year string like "2023-2027"
 */
export function getCurrentAcademicYear() {
  const currentYear = new Date().getFullYear();
  // For a 4-year program starting from previous academic year
  const startYear = currentYear - 3;
  const endYear = currentYear + 1;
  return `${startYear}-${endYear}`;
}

/**
 * Parse academic year string to get start and end years
 * Example: "2023-2027" returns {start: 2023, end: 2027}
 * @param academicYear - Academic year string like "2023-2027"
 * @returns Object with start and end years
 */
export function parseAcademicYear(academicYear: string) {
  const [start, end] = academicYear.split('-').map(Number);
  return { start, end };
}
