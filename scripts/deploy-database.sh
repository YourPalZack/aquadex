#!/bin/bash

# AquaDex Database Deployment Script
# This script helps deploy the database schema to your Supabase project

set -e  # Exit on any error

echo "🐠 AquaDex Database Deployment Script"
echo "===================================="

# Check if required tools are installed
command -v supabase >/dev/null 2>&1 || { 
    echo "❌ Supabase CLI is required but not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "database" ]; then
    echo "❌ Please run this script from the AquaDex project root directory"
    exit 1
fi

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please set up your environment variables first."
    echo "Copy .env.local.example to .env.local and fill in your Supabase credentials."
    exit 1
fi

# Source environment variables
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing required environment variables in .env.local"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set"
    exit 1
fi

echo "✅ Environment variables loaded"

# Confirm deployment
echo ""
echo "📍 Target Supabase Project: $NEXT_PUBLIC_SUPABASE_URL"
echo ""
read -p "Do you want to deploy the database schema to this project? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting database deployment..."

# Initialize Supabase project (if not already done)
if [ ! -f "supabase/config.toml" ]; then
    echo "📝 Initializing Supabase project..."
    supabase init
fi

# Link to the remote project
echo "🔗 Linking to Supabase project..."
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
supabase link --project-ref $PROJECT_REF

# Run the migration
echo "📊 Deploying database schema..."
if [ -f "database/migrations/001_initial_schema.sql" ]; then
    # Use Supabase CLI to run the migration
    supabase db push
    echo "✅ Schema migration completed"
else
    echo "❌ Migration file not found: database/migrations/001_initial_schema.sql"
    exit 1
fi

# Optional: Load sample data
echo ""
read -p "Do you want to load sample data for testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Loading sample data..."
    if [ -f "database/sample_data.sql" ]; then
        supabase db reset --with-seed
        echo "✅ Sample data loaded"
    else
        echo "❌ Sample data file not found: database/sample_data.sql"
    fi
fi

# Generate TypeScript types
echo ""
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > src/lib/database.types.ts
echo "✅ TypeScript types generated in src/lib/database.types.ts"

echo ""
echo "🎉 Database deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your application code to use the new database structure"
echo "2. Test the authentication flow"
echo "3. Verify water testing functionality"
echo "4. Check marketplace and Q&A features"
echo ""
echo "📚 For more information, see:"
echo "- SUPABASE_SETUP.md for detailed setup instructions"
echo "- database/README.md for schema documentation"
echo ""