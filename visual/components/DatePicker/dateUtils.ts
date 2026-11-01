// Calendar dates as "YYYY-MM-DD" strings. A date here is a day on the calendar, not an instant: all arithmetic counts whole days from a
// fixed UTC epoch with Date.UTC, so no local timezone or daylight-saving change can move a day, and nothing goes through toISOString().
// Only `todayLocal` reads the local clock, and it reads the local year, month and day, which is what "today" means to the user.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function dayNumber(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day); // setUTCFullYear keeps years 0-99 literal, unlike Date.UTC
  return Math.round(date.getTime() / MS_PER_DAY);
}

function fromDayNumber(days: number): {year: number; month: number; day: number} {
  const date = new Date(days * MS_PER_DAY);
  return {year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()};
}

const pad = (n: number, length: number) => String(n).padStart(length, "0");

function format(parts: {year: number; month: number; day: number}): string {
  return `${pad(parts.year, 4)}-${pad(parts.month, 2)}-${pad(parts.day, 2)}`;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** The parts of a strictly valid "YYYY-MM-DD" string, or null for anything else (wrong shape, month 13, 31 February, year 0000, ...). */
export function parseDate(text: string | null | undefined): {year: number; month: number; day: number} | null {
  const match = text ? ISO.exec(text) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return {year, month, day};
}

export const isValidDate = (text: string | null | undefined): text is string => parseDate(text) !== null;

export function addDays(date: string, days: number): string {
  const p = parseDate(date)!;
  return format(fromDayNumber(dayNumber(p.year, p.month, p.day) + days));
}

/** Moves by whole months and keeps the day, or the last day of a shorter month: 31 January + 1 month is 28 or 29 February. */
export function addMonths(date: string, months: number): string {
  const p = parseDate(date)!;
  const index = p.year * 12 + (p.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return format({year, month, day: Math.min(p.day, daysInMonth(year, month))});
}

export const startOfMonth = (date: string) => `${date.slice(0, 8)}01`;
export const endOfMonth = (date: string) => { const p = parseDate(date)!; return format({...p, day: daysInMonth(p.year, p.month)}); };

/** 0 is Sunday. */
export function weekday(date: string): Weekday {
  const p = parseDate(date)!;
  return (((dayNumber(p.year, p.month, p.day) + 4) % 7 + 7) % 7) as Weekday; // 1970-01-01 was a Thursday
}

/** The first day of the week that contains `date`. */
export function startOfWeek(date: string, weekStartsOn: Weekday): string {
  return addDays(date, -((weekday(date) - weekStartsOn + 7) % 7));
}

export function endOfWeek(date: string, weekStartsOn: Weekday): string {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

/** Dates in this format sort correctly as plain strings. Missing or invalid bounds are open. */
export function isWithin(date: string, min?: string, max?: string): boolean {
  return (!isValidDate(min) || date >= min) && (!isValidDate(max) || date <= max);
}

export function clampDate(date: string, min?: string, max?: string): string {
  if (isValidDate(min) && date < min) return min;
  if (isValidDate(max) && date > max) return max;
  return date;
}

/** Today in the user's calendar. */
export function todayLocal(now: Date = new Date()): string {
  return format({year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()});
}

// Names come from Intl with timeZone "UTC", so formatting a calendar date cannot shift it either.
function utcDate(date: string): Date {
  const p = parseDate(date)!;
  const value = new Date(0);
  value.setUTCFullYear(p.year, p.month - 1, p.day);
  return value;
}

export function formatLongDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {dateStyle: "full", timeZone: "UTC"}).format(utcDate(date));
}

export function formatMonthTitle(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {month: "long", year: "numeric", timeZone: "UTC"}).format(utcDate(date));
}

export function weekdayNames(locale: string, weekStartsOn: Weekday): {long: string; short: string}[] {
  const sunday = "2024-01-07";
  return Array.from({length: 7}, (_, i) => {
    const day = utcDate(addDays(sunday, weekStartsOn + i));
    return {
      long: new Intl.DateTimeFormat(locale, {weekday: "long", timeZone: "UTC"}).format(day),
      short: new Intl.DateTimeFormat(locale, {weekday: "short", timeZone: "UTC"}).format(day),
    };
  });
}
