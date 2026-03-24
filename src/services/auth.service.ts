import type { AppSupabaseClient } from '@/lib/supabase/types';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
} from '@/lib/validations/auth';

type Client = AppSupabaseClient;

/**
 * Service layer for authentication operations.
 * Wraps Supabase Auth and the public `users` table.
 */
export class AuthService {
  /**
   * Register a new user (Supabase Auth + public.users row).
   *
   * @param client - Supabase server client (uses anon key; RLS applies)
   * @param input  - Validated registration data
   * @returns The created auth user and session
   * @throws Error if sign-up or user-row insert fails
   */
  async register(client: Client, input: RegisterInput) {
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          role: input.role,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Insert a row in the public.users table
    const { data: userRow, error: insertError } = await client
      .from('users')
      .insert({
        id: data.user!.id,
        email: input.email,
        full_name: input.full_name,
        role: input.role,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return { user: userRow, session: data.session };
  }

  /**
   * Log in with email and password.
   *
   * @param client - Supabase server client
   * @param input  - Validated login credentials
   * @returns The authenticated user and session
   * @throws Error if credentials are invalid
   */
  async login(client: Client, input: LoginInput) {
    const { data, error } = await client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { user: data.user, session: data.session };
  }

  /**
   * Sign out the current user.
   *
   * @param client - Supabase server client
   * @throws Error if sign-out fails
   */
  async logout(client: Client) {
    const { error } = await client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send a password-reset email. Does not reveal whether the email exists.
   *
   * @param client - Supabase server client
   * @param input  - Validated forgot-password data (email)
   */
  async forgotPassword(client: Client, input: ForgotPasswordInput) {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

    await client.auth.resetPasswordForEmail(input.email, { redirectTo });
  }

  /**
   * Set a new password for the authenticated user (after token verification).
   *
   * @param client - Supabase server client (must have an active session from the reset token)
   * @param input  - Object containing the new password
   * @throws Error if the password update fails (e.g. expired token)
   */
  async resetPassword(client: Client, input: { password: string }) {
    const { error } = await client.auth.updateUser({
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get the currently authenticated user from the session.
   *
   * @param client - Supabase server client
   * @returns The user object, or null if not authenticated
   * @throws Error if the session check itself fails
   */
  async getCurrentUser(client: Client) {
    const { data, error } = await client.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  }
}
