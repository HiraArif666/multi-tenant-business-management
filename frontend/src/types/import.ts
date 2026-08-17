export interface ImportModule {
  value: string;
  label: string;
}

export interface ExpenseImportData {
  title: string;
  description: string | null;
  amount: number;
}

export interface UserImportData {
  username: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
}

export interface ImportPreviewRow<T = any> {
  rowIndex: number;
  data: T;
  errors: string[];
}

export interface ImportPreviewResponse<T = any> {
  success: boolean;
  data: {
    module: string;
    rows: ImportPreviewRow<T>[];
  };
}
