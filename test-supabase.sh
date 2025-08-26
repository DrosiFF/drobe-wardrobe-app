#!/bin/bash
echo "🔍 SUPABASE CONNECTION TEST"
echo "=================================="

echo "Current Supabase configuration:"
grep SUPABASE .env.local

echo ""
echo "Checking if Supabase is working..."
echo "1. Check your .env.local file"
echo "2. Make sure you have REAL values (not placeholders)"
echo "3. Restart server after changes"
echo ""

echo "Current server status:"
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Server is running"
    echo "Visit: http://localhost:3000"
    echo ""
    echo "Expected behavior:"
    echo "- If Supabase works: No 'guest mode' messages"
    echo "- If not working: 'Supabase keys are missing. Running in guest mode'"
else
    echo "❌ Server is not running"
    echo "Start with: npm run dev"
fi

echo ""
echo "Files created for you:"
echo "📁 .env.local - Your main environment file"
echo "📁 .env.backup - Template with instructions"
echo "📁 test-supabase.sh - This test script"
