// Date helpers. The backend works with local date-times without timezone ("2026-10-12T20:00:00"),
// so dates are always built and parsed by hand instead of using toISOString (which is UTC).

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const pad = (value: number) => String(value).padStart(2, '0');

/** "2026-10-12T20:00:00" -> Date in local time. */
export function parseDateTime(value: string): Date {
  const [datePart, timePart = '00:00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/** Date -> "2026-10-12" */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Date -> "2026-10-12T20:00:00" (local time) */
export function toIsoDateTime(date: Date): string {
  return `${toIsoDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Date -> "2026-10" */
export function toIsoMonth(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** "20:00" */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "12/10/2026" */
export function formatShortDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** "lunes 12 de octubre" */
export function formatLongDate(date: Date): string {
  return `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

/** "Octubre 2026" */
export function formatMonth(date: Date): string {
  const name = MONTHS[date.getMonth()];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${date.getFullYear()}`;
}

/** 12.5 -> "12,5 hs" */
export function formatHours(hours: number): string {
  const rounded = Math.round(hours * 100) / 100;
  return `${String(rounded).replace('.', ',')} hs`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** "08:00 – 20:00", adding the end day when the shift ends on another day. */
export function formatShiftRange(startValue: string, endValue: string): string {
  const start = parseDateTime(startValue);
  const end = parseDateTime(endValue);
  const endLabel = isSameDay(start, end) ? formatTime(end) : `${formatTime(end)} (${pad(end.getDate())}/${pad(end.getMonth() + 1)})`;
  return `${formatTime(start)} – ${endLabel}`;
}

/** A shift is shown as "night" when it ends on a later day than it starts. */
export function isOvernight(startValue: string, endValue: string): boolean {
  return !isSameDay(parseDateTime(startValue), parseDateTime(endValue));
}
