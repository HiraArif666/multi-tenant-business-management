import { getPermissions, getUser } from "./auth";

const isSuperAdmin = (): boolean => {
  const user = getUser();
  return user?.role === "superadmin";
};

export const hasPermission = (
  permission: string,
): boolean => {
  if (isSuperAdmin()) {
    return true;
  }

  const permissions = getPermissions();

  return permissions.includes(permission);
};

export const hasAnyPermission = (
  permissionList: string[],
): boolean => {
  if (isSuperAdmin()) {
    return true;
  }

  const permissions = getPermissions();

  return permissionList.some((permission) =>
    permissions.includes(permission),
  );
};

export const hasAllPermissions = (
  permissionList: string[],
): boolean => {
  if (isSuperAdmin()) {
    return true;
  }

  const permissions = getPermissions();

  return permissionList.every((permission) =>
    permissions.includes(permission),
  );
};