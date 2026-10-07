export type AdminRole = 'owner' | 'staff';

export interface AuthAdmin {
  id: number;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      /** Gắn bởi middleware request-id, trùng header X-Request-Id */
      id: string;
      /** Gắn bởi requireAdmin sau khi xác thực JWT */
      admin?: AuthAdmin;
    }
  }
}
