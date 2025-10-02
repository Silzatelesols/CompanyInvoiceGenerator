# How to Enable Settings Feature

## Quick Start

The Settings feature you just added requires a database migration. Follow these simple steps:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration

1. Click **New Query** button
2. Copy the entire contents of this file: `supabase/migrations/20251002000000_add_settings_and_tags.sql`
3. Paste it into the SQL editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Migration

You should see a success message. The migration creates:
- ✅ `app_settings` table
- ✅ `tags` column in `company_profile` table
- ✅ `comments` column in `company_profile` table
- ✅ Default settings for existing users

### Step 4: Refresh Your App

1. Go back to your Billify application
2. Refresh the page (F5 or Ctrl+R)
3. Click on **Settings** in the navigation menu
4. You should now see the Settings page!

## Alternative: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to your project directory
cd "g:\Code\Invoice generator\billify-easy-suite"

# Run the migration
supabase db push
```

## What You'll Get

Once the migration is complete, you'll have access to:

### 1. Settings Page
- **Feature Toggles**: Control S3 upload, email notifications, and quick generate button
- **Theme Settings**: Switch between light and dark mode
- **Template Preferences**: Set your default invoice template

### 2. Company Profile Enhancements
- **Tags**: Add tags like "main-office", "branch-mumbai" to organize company profiles
- **Comments**: Internal notes about each company profile

### 3. Smart PDF Generation
- PDF generation now respects your settings automatically
- Optional "Quick Generate" button for faster invoice creation
- Automatic S3 upload and email sending based on your preferences

## Troubleshooting

### "Authentication Required" Error

This means you're not logged in. Solution:
1. Make sure you're logged into the application
2. Refresh the page
3. Try accessing Settings again

### "Database Migration Required" Message

This means the migration hasn't been run yet. Follow Steps 1-3 above.

### Migration Fails

If the migration fails, check:
1. You have the correct permissions in Supabase
2. The tables don't already exist (if re-running)
3. Your Supabase project is active and accessible

### Settings Not Saving

1. Check browser console for errors (F12)
2. Verify the migration ran successfully
3. Make sure you're logged in
4. Try refreshing the page

## Features Overview

### AWS S3 Upload Toggle
- **Enabled**: PDFs uploaded to S3, images stored in cloud
- **Disabled**: Local download only, no cloud storage

### Email Notifications Toggle
- **Enabled**: Automatic emails sent to clients after PDF generation
- **Disabled**: No automatic emails
- **Note**: Requires S3 upload to be enabled

### Quick Generate Button
- **Enabled**: Shows "Quick Generate" button on invoice details
- **Disabled**: Only standard "Download PDF" button shown
- Uses your default template for instant generation

### Theme
- **Light**: Default bright theme
- **Dark**: Dark mode for reduced eye strain

### Default Template
- Choose: Modern, Extrape, or Default
- Used for quick generation feature

## Next Steps

After enabling settings:

1. **Configure Your Preferences**
   - Go to Settings page
   - Enable/disable features based on your needs
   - Set your preferred theme and default template
   - Click "Save Settings"

2. **Add Tags to Company Profiles**
   - Go to Companies page
   - Edit a company profile
   - Add tags like "main-office", "urgent-contact"
   - Add internal comments for context

3. **Test PDF Generation**
   - Create or view an invoice
   - Try the "Download PDF" button
   - If enabled, try the "Quick Generate" button
   - Check that S3 upload and email work as expected

## Support

If you encounter any issues:

1. Check the browser console (F12) for error messages
2. Verify the migration ran successfully in Supabase
3. Make sure all environment variables are set correctly
4. Review `SETTINGS-CONFIGURATION.md` for detailed documentation

## Summary

✅ Run migration SQL file in Supabase  
✅ Refresh your application  
✅ Access Settings from navigation menu  
✅ Configure your preferences  
✅ Enjoy the new features!

The settings system is now ready to use and will make your invoice generation workflow more efficient and customizable.
