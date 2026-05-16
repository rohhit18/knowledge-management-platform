export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PRODUCT_MANAGER"
  | "PROJECT_MANAGER"
  | "BUSINESS_ANALYST"
  | "BACKEND_DEVELOPER"
  | "UI_UX_DESIGNER"
  | "QA_ENGINEER"
  | "EMPLOYEE";

export type DocumentType =
  | "FUNCTIONAL"
  | "TECHNICAL"
  | "API_DOC"
  | "UI_UX"
  | "QA"
  | "RELEASE_NOTE"
  | "TRAINING"
  | "GENERAL";

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED";

export type ModuleStatus = "ACTIVE" | "DEPRECATED" | "IN_DEVELOPMENT";

export type LessonType = "TEXT" | "VIDEO" | "QUIZ";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PRODUCT_MANAGER: "Product Manager",
  PROJECT_MANAGER: "Project Manager",
  BUSINESS_ANALYST: "Business Analyst",
  BACKEND_DEVELOPER: "Backend Developer",
  UI_UX_DESIGNER: "UI/UX Designer",
  QA_ENGINEER: "QA Engineer",
  EMPLOYEE: "Employee",
};

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  FUNCTIONAL: "Functional",
  TECHNICAL: "Technical",
  API_DOC: "API Documentation",
  UI_UX: "UI/UX",
  QA: "QA",
  RELEASE_NOTE: "Release Note",
  TRAINING: "Training",
  GENERAL: "General",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  ACTIVE: "Active",
  DEPRECATED: "Deprecated",
  IN_DEVELOPMENT: "In Development",
};

export const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];
export const MANAGER_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_MANAGER",
  "PROJECT_MANAGER",
];
export const WRITE_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_MANAGER",
  "PROJECT_MANAGER",
  "BUSINESS_ANALYST",
  "BACKEND_DEVELOPER",
  "UI_UX_DESIGNER",
  "QA_ENGINEER",
];
