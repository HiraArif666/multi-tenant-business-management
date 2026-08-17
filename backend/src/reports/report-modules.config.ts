export interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface ReportModuleConfig {
  key: string;
  label: string;
  columns: ReportColumn[];
  hasStatusFilter?: boolean;
  // Only set for modules backed by the shared Company table
  // (all 5 Master Data types) — tells the service which
  // CompanyType to filter by.
  companyTypeName?: string;
}

const EXPENSE_COLUMNS: ReportColumn[] = [
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'description', label: 'Description', type: 'string' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'approverName', label: 'Decided By', type: 'string' },
  { key: 'createdByName', label: 'Created By', type: 'string' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

const USER_COLUMNS: ReportColumn[] = [
  { key: 'name', label: 'Full Name', type: 'string' },
  { key: 'username', label: 'Username', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'role', label: 'Role', type: 'string' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

// Shared by all 5 Master Data types — they're all Company rows,
// just filtered to a different CompanyType.
const MASTER_DATA_COLUMNS: ReportColumn[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'phone', label: 'Phone', type: 'string' },
  { key: 'address', label: 'Address', type: 'string' },
  { key: 'website', label: 'Website', type: 'string' },
  { key: 'contactPersonName', label: 'Contact Person', type: 'string' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

const REPORT_COLUMNS: ReportColumn[] = [
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'description', label: 'Description', type: 'string' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'createdByName', label: 'Created By', type: 'string' },
  { key: 'isActive', label: 'Active', type: 'boolean' },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

export const REPORT_MODULES: ReportModuleConfig[] = [
  {
    key: 'expense',
    label: 'Expense',
    columns: EXPENSE_COLUMNS,
    hasStatusFilter: true,
  },
  {
    key: 'users',
    label: 'Users',
    columns: USER_COLUMNS,
  },
  {
    key: 'vendors',
    label: 'Vendor',
    columns: MASTER_DATA_COLUMNS,
    companyTypeName: 'Vendor',
  },
  {
    key: 'suppliers',
    label: 'Supplier',
    columns: MASTER_DATA_COLUMNS,
    companyTypeName: 'Supplier',
  },
  {
    key: 'contractors',
    label: 'Contractor',
    columns: MASTER_DATA_COLUMNS,
    companyTypeName: 'Contractor',
  },
  {
    key: 'consultants',
    label: 'Consultant',
    columns: MASTER_DATA_COLUMNS,
    companyTypeName: 'Consultant',
  },
  {
    key: 'customers',
    label: 'Customer',
    columns: MASTER_DATA_COLUMNS,
    companyTypeName: 'Customer',
  },
];

export function getReportModuleConfig(
  key: string,
): ReportModuleConfig | undefined {
  return REPORT_MODULES.find((m) => m.key === key);
}