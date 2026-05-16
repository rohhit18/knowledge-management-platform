import { UserRole, ADMIN_ROLES, MANAGER_ROLES, WRITE_ROLES } from "@/types";

export function canAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role as UserRole);
}

export function canManage(role: string): boolean {
  return MANAGER_ROLES.includes(role as UserRole);
}

export function canWrite(role: string): boolean {
  return WRITE_ROLES.includes(role as UserRole);
}

export function canRead(_role: string): boolean {
  return true;
}

export function requireRole(userRole: string, allowed: UserRole[]): boolean {
  return allowed.includes(userRole as UserRole);
}
