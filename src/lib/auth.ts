// Auth configuration and utilities for role-based access control

const AUTH_STORAGE_KEY = "clarity-auth-user";
const ADMIN_EMAILS_KEY = "clarity-admin-emails";

export type UserRole = "admin" | "user";

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Default admin emails - the site owner
const DEFAULT_ADMIN_EMAILS = ["admin@claritymode.com", "gaurav@claritymode.com"];

export function getAdminEmails(): string[] {
  try {
    const stored = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return DEFAULT_ADMIN_EMAILS;
}

export function setAdminEmails(emails: string[]) {
  localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails));
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase().trim());
}

export function getStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return null;
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function signIn(email: string, password: string): AuthUser | null {
  // In production, this would be an API call
  // For now, we validate against stored users or create new ones
  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }

  const role: UserRole = isAdminEmail(normalized) ? "admin" : "user";

  const user: AuthUser = {
    email: normalized,
    name: normalized.split("@")[0],
    role,
    createdAt: new Date().toISOString(),
  };

  setStoredUser(user);
  return user;
}

export function signUp(
  email: string,
  password: string,
  name: string
): AuthUser | null {
  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }

  const role: UserRole = isAdminEmail(normalized) ? "admin" : "user";

  const user: AuthUser = {
    email: normalized,
    name: name.trim() || normalized.split("@")[0],
    role,
    createdAt: new Date().toISOString(),
  };

  setStoredUser(user);
  return user;
}

export function signOutUser() {
  clearStoredUser();
}

export function canAccessRoute(user: AuthUser | null, path: string): boolean {
  if (path.startsWith("/admin")) {
    return user?.role === "admin";
  }
  return true;
}