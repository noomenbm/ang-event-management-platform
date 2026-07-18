export function parseDateOnly(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isEventPast(eventDate: string, today = new Date()): boolean {
  return parseDateOnly(eventDate).getTime() < startOfDay(today).getTime();
}

export function isEventUpcoming(eventDate: string, today = new Date()): boolean {
  return !isEventPast(eventDate, today);
}
