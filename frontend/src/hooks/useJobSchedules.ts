import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getJobSchedules,
  getJobSchedule,
  createJobSchedule,
  updateJobSchedule,
  deleteJobSchedule,
} from "../services/jobSchedule";

import type {
  CreateJobSchedulePayload,
  UpdateJobSchedulePayload,
} from "../types/jobSchedule";

export function useJobSchedules(filters: any) {
  return useQuery({
    queryKey: ["job-schedules", filters],
    queryFn: () => getJobSchedules(filters),
  });
}

export function useJobSchedule(id?: number) {
  return useQuery({
    queryKey: ["job-schedule", id],
    queryFn: () => getJobSchedule(id!),
    enabled: !!id,
  });
}

export function useCreateJobSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobSchedulePayload) =>
      createJobSchedule(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job-schedules"],
      });
    },
  });
}

export function useUpdateJobSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateJobSchedulePayload;
    }) => updateJobSchedule(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job-schedules"],
      });
    },
  });
}

export function useDeleteJobSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteJobSchedule(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job-schedules"],
      });
    },
  });
}