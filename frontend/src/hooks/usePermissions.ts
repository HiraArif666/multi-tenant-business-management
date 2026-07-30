import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../services/permission";

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });
}