import type { Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];

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
