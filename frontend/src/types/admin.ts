export type AdminRole = "ADMIN";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  name?: string | null;
}
