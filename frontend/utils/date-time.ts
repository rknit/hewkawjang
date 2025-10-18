// Helper functions for date and time manipulation
export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Constants for time selection
export const MINUTE_STEPS = [0, 15, 30, 45];

// Get valid hours for a given date
export function getValidHours(
  date: string,
  earliest: Date,
  now: Date,
): number[] {
  const todayISO = formatDateISO(now);
  if (date === todayISO) {
    const startHour = earliest.getHours();
    return Array.from(
      { length: Math.max(1, 24 - startHour) },
      (_, i) => startHour + i,
    );
  }
  return Array.from({ length: 24 }, (_, i) => i);
}

// Get valid minutes for a given hour
export function getValidMinutes(
  date: string,
  hour: number,
  earliest: Date,
  now: Date,
): number[] {
  const todayISO = formatDateISO(now);
  if (date === todayISO && hour === earliest.getHours()) {
    const m = earliest.getMinutes();
    return MINUTE_STEPS.filter((step) => step >= m);
  }
  return MINUTE_STEPS;
}

// Initialize default minute based on current time
export function getDefaultMinute(now: Date): number {
  const m = now.getMinutes();
  return MINUTE_STEPS.reduce((prev, step) => (m <= step ? step : prev), 45);
}

// Format relative time for display (e.g., "Today", "2 days ago", "1 week ago")
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
