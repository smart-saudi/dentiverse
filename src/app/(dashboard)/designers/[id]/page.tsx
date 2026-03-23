'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, Monitor, Globe, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/lib/database.types';

type DesignerProfileRow = Database['public']['Tables']['designer_profiles']['Row'];

interface DesignerProfilePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Designer public profile page with bio, skills, stats, and portfolio.
 */
export default function DesignerProfilePage({ params }: DesignerProfilePageProps) {
  const router = useRouter();
  const [designer, setDesigner] = useState<DesignerProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [designerId, setDesignerId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setDesignerId(p.id));
  }, [params]);

  const fetchDesigner = useCallback(async () => {
    if (!designerId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/designers/${designerId}`);
      if (!res.ok) throw new Error('Failed to load designer');
      const json = await res.json();
      setDesigner(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [designerId]);

  useEffect(() => {
    fetchDesigner();
  }, [fetchDesigner]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !designer) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error ?? 'Designer not found'}
        </div>
        <Button variant="outline" onClick={() => router.push('/designers')}>
          Back to designers
        </Button>
      </div>
    );
  }

  const specializations = (designer.specializations as string[]) ?? [];
  const softwareSkills = (designer.software_skills as string[]) ?? [];
  const languages = (designer.languages as string[]) ?? [];
  const certifications = (designer.certifications as string[]) ?? [];
  const portfolioUrls = (designer.portfolio_urls as string[]) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/designers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Designer Profile</h1>
            {designer.is_available ? (
              <Badge variant="default" className="bg-green-600">Available</Badge>
            ) : (
              <Badge variant="secondary">Unavailable</Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{designer.avg_rating.toFixed(1)}</span>
            <span>({designer.total_reviews} reviews)</span>
            <span>&middot;</span>
            <span>{designer.years_experience} years experience</span>
            {designer.hourly_rate && (
              <>
                <span>&middot;</span>
                <span>${designer.hourly_rate}/hr</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {designer.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{designer.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats + Skills grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed Cases</span>
              <span className="font-medium">{designer.completed_cases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cases</span>
              <span className="font-medium">{designer.total_cases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Delivery</span>
              <span className="font-medium">{designer.avg_delivery_hours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Rate</span>
              <span className="font-medium">{designer.response_rate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills & Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {specializations.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Specializations</span>
                <div className="flex flex-wrap gap-1">
                  {specializations.map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}
            {softwareSkills.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Software</span>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="h-3.5 w-3.5" />
                  {softwareSkills.join(', ')}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Languages</span>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  {languages.join(', ')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-1 text-sm">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio */}
      {portfolioUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md border p-3 text-sm text-primary hover:border-primary/50"
                >
                  Portfolio Item {i + 1}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
