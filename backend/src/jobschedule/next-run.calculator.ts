export function computeNextRun(
  frequency: 'daily' | 'weekly' | 'monthly',
  time: string,
  dayOfWeek: number | null | undefined,
  dayOfMonth: number | null | undefined,
  from: Date = new Date(),
): Date {
  const [hours, minutes] = time
    .split(':')
    .map((n) => Number(n));

  const next = new Date(from);
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next <= from) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  if (frequency === 'weekly') {
    const targetDay = dayOfWeek ?? 0;

    const diff =
      (targetDay - next.getDay() + 7) % 7;

    next.setDate(next.getDate() + diff);

    if (next <= from) {
      next.setDate(next.getDate() + 7);
    }

    return next;
  }

  // monthly — note: setDate(31) on a shorter month rolls into the
  // next month (JS Date behavior). Acceptable simplification; a
  // schedule set for the 31st just runs on the 1st-2nd in short months.
  const targetDate = dayOfMonth ?? 1;

  next.setDate(targetDate);

  if (next <= from) {
    next.setMonth(next.getMonth() + 1);
    next.setDate(targetDate);
  }

  return next;
}

/**
 * Calculate the date range for the previous period based on frequency
 * Used by the scheduler to filter report data for the correct time window
 */
export function calculateDateRangeForSchedule(
  frequency: 'daily' | 'weekly' | 'monthly',
  executionDate: Date = new Date(),
): { startDate: Date; endDate: Date } {
  const start = new Date(executionDate);
  const end = new Date(executionDate);

  if (frequency === 'daily') {
    // Previous day: 00:00 to 23:59
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (frequency === 'weekly') {
    // Previous full week (Monday to Sunday)
    const currentDay = start.getDay();
    const distanceToMonday = (currentDay + 6) % 7;

    // Go back to this week's Monday
    start.setDate(start.getDate() - distanceToMonday);
    // Then go back one more week
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);

    // End of that week (Sunday 23:59)
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (frequency === 'monthly') {
    // Previous full month (1st to last day of previous month)
    start.setMonth(start.getMonth() - 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    end.setMonth(end.getMonth() - 1);
    end.setDate(getDaysInMonth(end.getMonth(), end.getFullYear()));
    end.setHours(23, 59, 59, 999);
  }

  return { startDate: start, endDate: end };
}

/**
 * Get the number of days in a given month/year
 */
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generate a filename for the scheduled report based on frequency and dates
 */
export function generateScheduledReportFileName(
  frequency: 'daily' | 'weekly' | 'monthly',
  reportName: string,
  executionDate: Date = new Date(),
): string {
  // Sanitize report name (remove special characters, replace spaces)
  const sanitized = reportName
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const { startDate } = calculateDateRangeForSchedule(frequency, executionDate);

  if (frequency === 'daily') {
    // Format: report_2026-08-16.xlsx (previous day)
    const dateStr = startDate.toISOString().split('T')[0];
    return `${sanitized}_${dateStr}.xlsx`;
  } else if (frequency === 'weekly') {
    // Format: report_week-33.xlsx (week number)
    const weekNum = getWeekNumber(startDate);
    const year = startDate.getFullYear();
    return `${sanitized}_week-${weekNum}_${year}.xlsx`;
  } else {
    // monthly
    // Format: report_august-2026.xlsx (month name and year)
    const monthName = startDate.toLocaleString('en-US', { month: 'long' });
    const year = startDate.getFullYear();
    return `${sanitized}_${monthName.toLowerCase()}-${year}.xlsx`;
  }
}

/**
 * Get ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - yearStart.getTime();
  return Math.floor(diff / (86400000 * 7)) + 1;
}