import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AccountDisabledError, ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedAdminContext } from '@/lib/user-access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Panel',
};

/**
 * Guard the admin workspace for active admin users only.
 *
 * @param props - Layout props
 * @param props.children - Nested admin page content
 * @returns Guarded admin layout content
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthenticatedAdminContext(supabase);
  } catch (error) {
    if (error instanceof AccountDisabledError) {
      redirect('/login?disabled=1');
    }

    if (error instanceof UnauthorizedError) {
      redirect('/login?redirectTo=%2Fadmin');
    }

    if (error instanceof ForbiddenError) {
      redirect('/dashboard');
    }

    throw error;
  }

  return children;
}
