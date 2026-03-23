import Link from 'next/link';
import { Star, Clock, Monitor, Globe } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/lib/database.types';

type DesignerProfileRow = Database['public']['Tables']['designer_profiles']['Row'];

interface DesignerCardProps {
  designer: DesignerProfileRow;
}

/**
 * Card component for displaying a designer summary in browse/search views.
 *
 * @param props - Component props
 * @param props.designer - The designer profile row data
 * @returns A clickable card linking to the designer's profile page
 */
export function DesignerCard({ designer }: DesignerCardProps) {
  const specializations = (designer.specializations as string[]) ?? [];
  const softwareSkills = (designer.software_skills as string[]) ?? [];
  const languages = (designer.languages as string[]) ?? [];

  return (
    <Link href={`/designers/${designer.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base">
                Designer
              </CardTitle>
              {designer.bio && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {designer.bio}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{designer.avg_rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({designer.total_reviews})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Specializations */}
            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{designer.years_experience}y exp</span>
              </div>
              {designer.hourly_rate && (
                <div className="flex items-center gap-1">
                  <span>${designer.hourly_rate}/hr</span>
                </div>
              )}
              {softwareSkills.length > 0 && (
                <div className="flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5" />
                  <span>{softwareSkills.slice(0, 3).join(', ')}</span>
                </div>
              )}
              {languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{languages.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{designer.completed_cases} completed</span>
              {designer.is_available ? (
                <span className="text-green-600">Available</span>
              ) : (
                <span className="text-muted-foreground">Unavailable</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
