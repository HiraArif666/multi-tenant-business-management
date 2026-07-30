import { getPermissions } from "./auth";

export const hasPermission = (
  permission: string,
): boolean => {
  const permissions = getPermissions();

  return permissions.includes(permission);
};

export const hasAnyPermission = (
  permissionList: string[],
): boolean => {
  const permissions = getPermissions();

  return permissionList.some((permission) =>
    permissions.includes(permission),
  );
};

export const hasAllPermissions = (
  permissionList: string[],
): boolean => {
  const permissions = getPermissions();

  return permissionList.every((permission) =>
    permissions.includes(permission),
  );
};