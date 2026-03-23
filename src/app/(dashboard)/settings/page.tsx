'use client';

import Link from 'next/link';
import { User, Bell, Shield } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SETTINGS_SECTIONS = [
  {
    title: 'Profile',
    description: 'Manage your personal information',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Notifications',
    description: 'Configure email and in-app notification preferences',
    href: '/settings',
    icon: Bell,
    disabled: true,
  },
  {
    title: 'Security',
    description: 'Password, two-factor authentication',
    href: '/settings',
    icon: Shield,
    disabled: true,
  },
];

/**
 * General settings page — links to sub-sections.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.title}
              href={section.disabled ? '#' : section.href}
              className={section.disabled ? 'pointer-events-none opacity-50' : ''}
            >
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </CardHeader>
                {section.disabled && (
                  <CardContent>
                    <span className="text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </CardContent>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
