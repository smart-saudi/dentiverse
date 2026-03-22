/** Designer profile with marketplace details */
export interface DesignerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  specializations: string[];
  software: string[];
  experience_years: number;
  hourly_rate: number | null;
  portfolio_urls: string[];
  avg_rating: number;
  total_reviews: number;
  total_completed: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
