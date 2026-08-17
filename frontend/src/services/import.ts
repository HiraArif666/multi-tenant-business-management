import api from './api';
import type {
  ImportPreviewResponse,
  ImportPreviewRow,
} from '../types/import';

export const getImportModules = async () => {
  const response = await api.get('/api/import/modules');

  return response.data;
};

export const downloadImportTemplate = async (
  moduleName: string,
) => {
  const response = await api.get('/api/import/template', {
    params: { module: moduleName },
    responseType: 'blob',
  });

  return response.data;
};

export const previewImport = async (
  moduleName: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append('module', moduleName);
  formData.append('file', file);

  const response = await api.post<ImportPreviewResponse>(
    '/api/import/preview',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};

export const confirmImport = async (
  moduleName: string,
  rows: ImportPreviewRow[],
) => {
  const response = await api.post('/api/import/confirm', {
    module: moduleName,
    rows,
  });

  return response.data;
};
