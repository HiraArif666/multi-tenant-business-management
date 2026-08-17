import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  confirmImport,
  downloadImportTemplate,
  getImportModules,
  previewImport,
} from '../services/import';

export function useImportModules() {
  return useQuery({
    queryKey: ['import-modules'],
    queryFn: () => getImportModules(),
  });
}

export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: (moduleName: string) =>
      downloadImportTemplate(moduleName),
  });
}

export function usePreviewImport() {
  return useMutation({
    mutationFn: ({ module, file }: any) =>
      previewImport(module, file),
  });
}

export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ module, rows }: any) =>
      confirmImport(module, rows),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['expenses'],
      });
    },
  });
}
