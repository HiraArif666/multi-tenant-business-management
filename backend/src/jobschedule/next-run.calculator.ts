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