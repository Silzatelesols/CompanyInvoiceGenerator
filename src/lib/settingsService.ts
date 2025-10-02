import { supabase } from "@/integrations/supabase/client";

export interface AppSettings {
  id: string;
  user_id: string | null;
  enable_s3_upload: boolean;
  enable_email_notifications: boolean;
  enable_default_template_button: boolean;
  theme: 'light' | 'dark';
  default_template_id: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsUpdate {
  enable_s3_upload?: boolean;
  enable_email_notifications?: boolean;
  enable_default_template_button?: boolean;
  theme?: 'light' | 'dark';
  default_template_id?: string;
}

class SettingsService {
  /**
   * Get settings for the current user
   */
  async getUserSettings(userId: string): Promise<AppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data as AppSettings | null;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      return null;
    }
  }

  /**
   * Get or create default settings for a user
   */
  async getOrCreateSettings(userId: string): Promise<AppSettings> {
    try {
      // Try to get existing settings
      let settings = await this.getUserSettings(userId);

      // If no settings exist, create default ones
      if (!settings) {
        const { data, error } = await supabase
          .from('app_settings')
          .insert({
            user_id: userId,
            enable_s3_upload: true,
            enable_email_notifications: true,
            enable_default_template_button: false,
            theme: 'light' as const,
            default_template_id: 'modern',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating default settings:', error);
          throw error;
        }

        settings = data as AppSettings;
      }

      return settings;
    } catch (error) {
      console.error('Failed to get or create settings:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, updates: SettingsUpdate): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }

      return data as AppSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Check if a specific feature is enabled
   */
  async isFeatureEnabled(userId: string, feature: keyof Pick<AppSettings, 'enable_s3_upload' | 'enable_email_notifications' | 'enable_default_template_button'>): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings ? settings[feature] : false;
    } catch (error) {
      console.error(`Failed to check if ${feature} is enabled:`, error);
      return false;
    }
  }

  /**
   * Get theme preference
   */
  async getTheme(userId: string): Promise<'light' | 'dark'> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.theme || 'light';
    } catch (error) {
      console.error('Failed to get theme:', error);
      return 'light';
    }
  }

  /**
   * Get default template ID
   */
  async getDefaultTemplate(userId: string): Promise<string> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.default_template_id || 'modern';
    } catch (error) {
      console.error('Failed to get default template:', error);
      return 'modern';
    }
  }
}

export const settingsService = new SettingsService();
