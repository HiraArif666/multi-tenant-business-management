import api from "./api";
import type {
  CreateJobSchedulePayload,
  UpdateJobSchedulePayload,
} from "../types/jobSchedule";

export const getJobSchedules = async (params?: any) => {
  const response = await api.get("/api/job-schedules", {
    params,
  });

  return response.data;
};

export const getJobSchedule = async (id: number) => {
  const response = await api.get(
    `/api/job-schedules/${id}`,
  );

  return response.data;
};

export const createJobSchedule = async (
  data: CreateJobSchedulePayload,
) => {
  const response = await api.post(
    "/api/job-schedules",
    data,
  );

  return response.data;
};

export const updateJobSchedule = async (
  id: number,
  data: UpdateJobSchedulePayload,
) => {
  const response = await api.put(
    `/api/job-schedules/${id}`,
    data,
  );

  return response.data;
};

export const deleteJobSchedule = async (
  id: number,
) => {
  const response = await api.delete(
    `/api/job-schedules/${id}`,
  );

  return response.data;
};