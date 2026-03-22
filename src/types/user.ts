import type { UserRole } from '@/lib/constants';

/** User profile as returned from the API */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
