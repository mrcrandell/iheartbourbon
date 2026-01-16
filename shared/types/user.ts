export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  appleId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
