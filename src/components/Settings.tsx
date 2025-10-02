import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Loader2, Moon, Sun, AlertCircle } from "lucide-react";
import { settingsService, AppSettings } from "@/lib/settingsService";
import { authLib } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TEMPLATE_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'extrape', label: 'Extrape' },
  { value: 'default', label: 'Default' },
];

export const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      // Get current user from custom auth system
      const session = authLib.getSession();
      
      if (!session || !session.user) {
        console.error('No active session found');
        setLoading(false);
        return;
      }

      const user = session.user;
      setUserId(user.id);

      // Load or create settings
      const userSettings = await settingsService.getOrCreateSettings(user.id);
      setSettings(userSettings);

      // Apply theme
      applyTheme(userSettings.theme);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: error instanceof Error ? error.message : "Failed to load your settings. The settings table may not exist yet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    if (!userId || !settings) return;

    setSaving(true);
    try {
      const updatedSettings = await settingsService.updateSettings(userId, {
        enable_s3_upload: settings.enable_s3_upload,
        enable_email_notifications: settings.enable_email_notifications,
        enable_default_template_button: settings.enable_default_template_button,
        theme: settings.theme,
        default_template_id: settings.default_template_id,
      });

      setSettings(updatedSettings);
      applyTheme(updatedSettings.theme);

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access settings. Please refresh the page or log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Migration Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>The settings feature requires a database migration to be run first.</p>
            <p className="font-semibold">To enable settings:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Run the migration file: <code className="bg-muted px-2 py-1 rounded">supabase/migrations/20251002000000_add_settings_and_tags.sql</code></li>
              <li>Execute it in your Supabase SQL editor or via CLI</li>
              <li>Refresh this page</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              The migration creates the app_settings table and adds tags/comments fields to company_profile.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and features</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>
              Enable or disable features based on your requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* S3 Upload Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="s3-upload" className="text-base font-medium">
                  AWS S3 Upload
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload PDFs and images to AWS S3. When disabled, files will be generated locally only.
                </p>
              </div>
              <Switch
                id="s3-upload"
                checked={settings.enable_s3_upload}
                onCheckedChange={(checked) => updateSetting('enable_s3_upload', checked)}
              />
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-medium">
                  Email Notifications (SES)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send invoice emails to clients via AWS SES. Requires S3 upload to be enabled.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.enable_email_notifications}
                onCheckedChange={(checked) => updateSetting('enable_email_notifications', checked)}
                disabled={!settings.enable_s3_upload}
              />
            </div>

            {/* Default Template Button Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="default-template-button" className="text-base font-medium">
                  Quick Default Template Button
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show a secondary button to quickly generate invoices with your default template.
                </p>
              </div>
              <Switch
                id="default-template-button"
                checked={settings.enable_default_template_button}
                onCheckedChange={(checked) => updateSetting('enable_default_template_button', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-base font-medium">
                Theme
              </Label>
              <div className="flex items-center gap-4">
                <Select
                  value={settings.theme}
                  onValueChange={(value: 'light' | 'dark') => updateSetting('theme', value)}
                >
                  <SelectTrigger id="theme" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Template</CardTitle>
            <CardDescription>
              Configure your default invoice template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="default-template" className="text-base font-medium">
                Default Template
              </Label>
              <div className="flex items-center gap-4">
                <Select
                  value={settings.default_template_id}
                  onValueChange={(value) => updateSetting('default_template_id', value)}
                >
                  <SelectTrigger id="default-template" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_OPTIONS.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Template used for quick generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
