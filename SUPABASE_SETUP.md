# Supabase Setup Guide for AquaDex

Follow these steps to set up your Supabase backend for AquaDex.

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or sign in with your GitHub account
3. Click "New Project"
4. Choose your organization or create a new one
5. Fill in project details:
   - **Name**: `aquadex` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is perfect for development

## Step 2: Get Your Project Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiI...`)

## Step 3: Set Up Environment Variables

1. In your AquaDex project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (users, aquariums, water_tests, etc.)
- Row Level Security policies
- Indexes for performance
- Triggers for automatic timestamps
- Functions for user profile creation

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. **Site URL**: Set to `http://localhost:3000` (for development)
3. **Redirect URLs**: Add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000` (optional, for general redirects)

### Optional: Enable Google OAuth

If you want Google sign-in:

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Add the Client ID and Client Secret in Supabase

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`
3. Try creating a new account
4. Check your Supabase dashboard under **Authentication** → **Users**

## Step 7: Verify Database

1. In Supabase, go to **Table Editor**
2. You should see all tables created:
   - `users`
   - `aquariums`
   - `water_tests`
   - `marketplace_listings`
   - `questions`
   - `answers`

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your environment variables
2. **"Project not found"**: Ensure your project URL is correct
3. **Authentication not working**: Verify your site URL and redirect URLs
4. **Database errors**: Check that the schema was applied successfully

### Checking Logs:

- Supabase Dashboard → **Logs** → **Auth Logs**
- Browser Developer Console for client-side errors

## Production Deployment

When deploying to production:

1. Update environment variables with production URLs
2. Add production domain to Site URL and Redirect URLs
3. Consider upgrading from Free tier based on usage
4. Set up database backups
5. Configure custom domain (optional)

## Security Notes

- Never commit `.env.local` to version control
- The anon key is safe to expose in client-side code
- Service role key (if used) should be server-side only
- Review RLS policies before going to production

## Next Steps

Once setup is complete, you can:
1. Test user registration and login
2. Create aquariums and water tests
3. Use the marketplace features
4. Ask questions in the Q&A section

For help, check the [Supabase Documentation](https://supabase.com/docs) or the AquaDex project README.

---

## Automated migrations (alternative to manual SQL)

If you prefer not to use the dashboard, you can apply the SQL migrations in `database/migrations` from your terminal.

1. Ensure your `.env.local` contains a valid `DATABASE_URL` to your Supabase Postgres (or Neon) instance.
2. Run the migration script:

```bash
npm run db:migrate
```

This will:
- Create the `stores` and `deals` tables with PostGIS enabled
- Add spatial indexes and helpful views
- Create the RPC function `search_stores` for geospatial search with pagination and ordering
- Create the public storage bucket `store-images` and basic policies

Notes:
- The script records applied files in a `migration_history` table and is safe to re-run.
- The `search_stores` RPC is used automatically by the app when present; otherwise, the app falls back to a basic search.