'use client';

import { useCallback, useEffect, useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';

import type { AdminUserListItem, PaginatedAdminResult } from '@/types/admin';
import { AdminActionDialog } from '@/components/admin/admin-action-dialog';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type UserActionType = 'SUSPEND' | 'REACTIVATE';
type ActiveFilterValue = '' | 'true' | 'false';

const roleOptions = ['', 'DENTIST', 'LAB', 'DESIGNER', 'ADMIN'] as const;

/**
 * Users tab for the admin workspace.
 *
 * @returns User directory with suspend/reactivate controls
 */
export function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<(typeof roleOptions)[number]>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilterValue>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [selectedAction, setSelectedAction] = useState<UserActionType>('SUSPEND');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      if (roleFilter) {
        params.set('role', roleFilter);
      }

      if (activeFilter) {
        params.set('is_active', activeFilter);
      }

      const response = await fetch(`/api/v1/admin/users?${params.toString()}`);
      const json = (await response.json()) as PaginatedAdminResult<AdminUserListItem> & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to load users');
      }

      setUsers(json.data);
      setTotalPages(json.meta.total_pages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, page, query, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openActionDialog(user: AdminUserListItem, action: UserActionType) {
    setSelectedUser(user);
    setSelectedAction(action);
    setDialogError(null);
  }

  async function handleConfirmAction(payload: {
    ticket_reference: string;
    reason: string;
  }) {
    if (!selectedUser) {
      return;
    }

    setIsSubmitting(true);
    setDialogError(null);

    try {
      const response = await fetch(`/api/v1/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          ...payload,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to update the user');
      }

      setSelectedUser(null);
      await loadUsers();
    } catch (submitError) {
      setDialogError(
        submitError instanceof Error ? submitError.message : 'Failed to update the user',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="admin-user-search" className="text-sm font-medium">
              Search
            </label>
            <Input
              id="admin-user-search"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-user-role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="admin-user-role"
              value={roleFilter}
              onChange={(event) => {
                setPage(1);
                setRoleFilter(event.target.value as (typeof roleOptions)[number]);
              }}
              className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="">All roles</option>
              {roleOptions
                .filter((value) => value)
                .map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-user-active" className="text-sm font-medium">
              Account status
            </label>
            <select
              id="admin-user-active"
              value={activeFilter}
              onChange={(event) => {
                setPage(1);
                setActiveFilter(event.target.value as ActiveFilterValue);
              }}
              className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="">All accounts</option>
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-muted-foreground text-xs">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={user.is_active ? 'success' : 'destructive'}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                        {user.designer_available !== null && (
                          <Badge
                            variant={user.designer_available ? 'secondary' : 'outline'}
                          >
                            {user.designer_available
                              ? 'Designer available'
                              : 'Designer unavailable'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_verified ? 'success' : 'outline'}>
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {user.last_seen_at
                        ? new Date(user.last_seen_at).toLocaleString()
                        : 'No activity'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.is_active ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionDialog(user, 'SUSPEND')}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(user, 'REACTIVATE')}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AdminActionDialog
        open={selectedUser !== null}
        title={selectedAction === 'SUSPEND' ? 'Suspend user' : 'Reactivate user'}
        description={
          selectedAction === 'SUSPEND'
            ? 'This blocks the user from operating in the marketplace until support restores access.'
            : 'This restores the user to normal marketplace access.'
        }
        confirmLabel={selectedAction === 'SUSPEND' ? 'Suspend user' : 'Reactivate user'}
        isSubmitting={isSubmitting}
        error={dialogError}
        onConfirm={handleConfirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
          }
        }}
      />
    </div>
  );
}
