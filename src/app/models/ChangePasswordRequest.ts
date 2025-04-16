export interface ChangePasswordRequest {
    token: string | null;
    currentPassword: string;
    newPassword: string;
  }