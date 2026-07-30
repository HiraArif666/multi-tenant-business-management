const TOKEN_KEY = "access_token";
const USER_KEY = "user";
const ROLES_KEY = "roles";
const PERMISSIONS_KEY = "permissions";

import { clearSelectedBusinessUnit } from "./businessUnit";

// ==========================
// Token
// ==========================

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ==========================
// User
// ==========================

export const saveUser = (user: unknown) => {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);

  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// ==========================
// Roles
// ==========================

export const saveRoles = (roles: unknown[]) => {
  localStorage.setItem(
    ROLES_KEY,
    JSON.stringify(roles)
  );
};

export const getRoles = () => {
  const roles = localStorage.getItem(ROLES_KEY);

  return roles ? JSON.parse(roles) : [];
};

export const removeRoles = () => {
  localStorage.removeItem(ROLES_KEY);
};

// ==========================
// Permissions
// ==========================

export const savePermissions = (
  permissions: unknown[],
) => {
  localStorage.setItem(
    PERMISSIONS_KEY,
    JSON.stringify(permissions)
  );
};

export const getPermissions = () => {
  const permissions = localStorage.getItem(
    PERMISSIONS_KEY,
  );

  return permissions
    ? JSON.parse(permissions)
    : [];
};

export const removePermissions = () => {
  localStorage.removeItem(
    PERMISSIONS_KEY,
  );
};

// ==========================
// Logout
// ==========================

export const logout = () => {
  removeToken();
  removeUser();
  removeRoles();
  removePermissions();

  clearSelectedBusinessUnit();
};

// ==========================
// Auth
// ==========================

export const isAuthenticated = () => {
  return !!getToken();
};