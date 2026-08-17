export interface ImportModuleDefinition {
  value: string;
  label: string;
}

export const IMPORT_MODULES: ImportModuleDefinition[] = [
  {
    value: 'expense',
    label: 'Expense',
  },
  {
    value: 'user',
    label: 'User',
  },
];

export function isSupportedImportModule(
  moduleName: string,
): moduleName is 'expense' | 'user' {
  return IMPORT_MODULES.some(
    (module) => module.value === moduleName,
  );
}
