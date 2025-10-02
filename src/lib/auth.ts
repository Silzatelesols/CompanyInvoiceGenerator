import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AdminUser;
  expires: number;
}

const SESSION_KEY = 'invoice_admin_session';

// Simple function to generate a timestamp-based token
const generateToken = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const authLib = {
  async login(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid email or password' };
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user: AdminUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Create session with 24 hour expiry
      const session: AuthSession = {
        user,
        expires: Date.now() + (24 * 60 * 60 * 1000)
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: AuthSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expires) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const resetToken = generateToken();
      const expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour

      const { error } = await supabase
        .from('admin_users')
        .update({
          reset_token: resetToken,
          reset_token_expires: expiresAt.toISOString()
        })
        .eq('email', email.toLowerCase());

      if (error) {
        return { success: false, error: 'Failed to process reset request' };
      }

      // In a real app, you'd send an email here
      console.log(`Password reset link: /reset-password?token=${resetToken}`);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to process reset request' };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('reset_token', token)
        .gte('reset_token_expires', new Date().toISOString())
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: hashedPassword,
          reset_token: null,
          reset_token_expires: null
        })
        .eq('id', data.id);

      if (updateError) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }
};