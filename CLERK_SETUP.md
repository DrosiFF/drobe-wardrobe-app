# Clerk Authentication Setup Guide

## 1. Create Clerk Account & Get Keys

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application called "Drobe"
3. Copy your keys from the API Keys section:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

## 2. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. Configure Clerk Dashboard

In your Clerk dashboard:

1. **Paths**: Set the sign-in URL to `/sign-in` and sign-up URL to `/sign-up`

2. **Social Providers** (REQUIRED - Top 3 Most Used):
   - **Apple**: Go to Social Providers → Enable Apple
   - **Google**: Go to Social Providers → Enable Google  
   - **GitHub**: Go to Social Providers → Enable GitHub
   
   💡 These are the most popular login methods and provide the best user experience!

3. **User Profile**: Enable email, username, and any other fields you need
4. **Webhooks**: We'll set this up later for Supabase sync

## 4. Test Authentication

Once you add the keys, restart your development server and visit:
- `http://localhost:3000/sign-in` - Sign in page
- `http://localhost:3000/sign-up` - Sign up page

The authentication system will automatically protect your routes and sync user data!
