export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface JobScheduleRecipient {
  id: number;
  name?: string;
  email?: string;
}

export interface JobSchedule {
  id: number;

  reportId: number;
  reportName?: string;

  recipientUserIds: number[];
  recipients?: JobScheduleRecipient[];

  frequency: ScheduleFrequency;
  time: string;

  dayOfWeek: number | null;
  dayOfMonth: number | null;

  isActive: boolean;

  lastRunAt: string | null;
  nextRunAt: string | null;

  businessUnitId: number;
  createdAt?: string;
}

export interface CreateJobSchedulePayload {
  reportId: number;
  recipientUserIds: number[];
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export interface UpdateJobSchedulePayload
  extends Partial<CreateJobSchedulePayload> {
  isActive?: boolean;
}