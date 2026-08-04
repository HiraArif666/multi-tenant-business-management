// Registry of modules that can have Approval Settings configured against
// them. To make a new module approvable later (e.g. Purchase Orders),
// add an entry here and use `moduleName` when checking approvers in that
// module's service, the same way ExpensesService does.
export const APPROVABLE_MODULES = [
  {
    key: 'expense',
    label: 'Expense',
  },
];