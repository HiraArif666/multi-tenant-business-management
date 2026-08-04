export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface Expense {
  id: number;

  title: string;
  description: string | null;
  amount: number;

  status: ExpenseStatus;

  approvedBy: number | null;
  approver?: {
    id: number;
    name: string;
  };

  businessUnitId: number;
  isActive: boolean;

  createdByName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpensePayload {
  title: string;
  description?: string;
  amount: number;
}

export interface UpdateExpensePayload {
  title?: string;
  description?: string;
  amount?: number;
}