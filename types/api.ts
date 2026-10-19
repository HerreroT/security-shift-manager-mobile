// Types that mirror the backend DTOs. Dates come as local date-times without timezone,
// e.g. "2026-10-12T20:00:00", and days as "2026-10-12".

export type LoginResponse = {
  token: string;
  id: number;
  username: string;
  email: string;
};

export type Guard = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  active: boolean;
};

export type GuardRequest = Omit<Guard, 'id'>;

export type Service = {
  id: number;
  name: string;
  location: string;
  description: string | null;
  active: boolean;
};

export type ServiceRequest = Omit<Service, 'id'>;

export type ShiftAssignment = {
  id: number;
  guard: Guard;
  service: Service;
  startDateTime: string;
  endDateTime: string;
  totalHours: number;
  notes: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
};

export type ShiftAssignmentRequest = {
  guardId: number;
  serviceId: number;
  startDateTime: string;
  endDateTime: string;
  notes?: string | null;
};

export type GuardHoursReport = {
  guard: Guard;
  from: string;
  to: string;
  totalHours: number;
  shiftCount: number;
  shifts: ShiftAssignment[];
};

export type MonthlyHoursRow = {
  guardId: number;
  firstName: string;
  lastName: string;
  dni: string;
  active: boolean;
  shiftCount: number;
  totalHours: number;
};

export type MonthlyHoursReport = {
  month: string;
  totalHours: number;
  shiftCount: number;
  guards: MonthlyHoursRow[];
};
