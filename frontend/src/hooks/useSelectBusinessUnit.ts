import { useMutation } from "@tanstack/react-query";
import { selectBusinessUnit } from "../services/selectBusinessUnit";

export function useSelectBusinessUnit() {
  return useMutation({
    mutationFn: selectBusinessUnit,
  });
}