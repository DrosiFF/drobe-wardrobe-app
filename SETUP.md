# Closet App Setup Guide

## Prerequisites Installation

Since npm is not currently installed on your system, you'll need to install Node.js and npm first.

### Install Node.js and npm

#### Option 1: Using Homebrew (Recommended for macOS)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node
```

#### Option 2: Download from Official Website
1. Go to https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Verify installation by running: `node --version` and `npm --version`

## Project Setup

Once Node.js and npm are installed:

### 1. Install Dependencies
```bash
cd /Users/drosi/Desktop/closetapp
npm install
```

### 2. Set up Environment Variables
```bash
# Copy the example environment file
cp env.example .env.local

# Edit the environment file with your actual values
nano .env.local
```

Required environment variables:
- `DATABASE_URL`: Your PostgreSQL database connection string
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: A random secret key for NextAuth

### 3. Set up Database

#### Install PostgreSQL
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create a database
createdb closetapp
```

#### Set up Prisma
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Optional: Open Prisma Studio to view your database
npm run db:studio
```

### 4. Run the Development Server
```bash
npm run dev
```

Your app should now be running at http://localhost:3000

## Features Implemented

✅ **Navigation & Layout**
- Modern responsive navigation bar
- Mobile-friendly design
- Route-based navigation highlighting

✅ **Homepage**
- Welcoming hero section with gradient design
- Feature highlights
- Statistics overview with real data
- Recent items showcase
- Call-to-action sections

✅ **Items Management**
- Photo upload with drag & drop
- Comprehensive item details form
- Grid view with filtering and search
- Category, season, and occasion filters
- Favorites functionality
- Responsive design

✅ **Mock Data Structure**
- 8 sample clothing items with realistic data
- 2 sample outfits
- Utility functions for filtering and searching
- High-quality stock images from Unsplash

✅ **API Routes**
- `/api/items` - CRUD operations for clothing items
- `/api/upload` - File upload handling
- Integration with Prisma ORM
- Error handling and validation

✅ **Additional Pages**
- Outfits page with grid layout
- Analytics page with charts and insights
- All pages responsive and accessible

## Database Schema

The app uses a comprehensive Prisma schema with:
- Users with authentication support
- Items with categories, seasons, occasions
- Outfits with item relationships
- Tags system for flexible categorization
- Wear logs for tracking usage
- Calendar planning for outfit scheduling

## Next Steps

1. **Set up Image Upload Service**
   - Integrate Cloudinary or AWS S3
   - Add background removal API
   - Implement image optimization

2. **Add Authentication**
   - Set up NextAuth providers
   - Implement user sessions
   - Add protected routes

3. **Enhance Features**
   - Outfit creation interface
   - Calendar planning
   - Advanced analytics
   - Social sharing

4. **Deploy**
   - Set up Vercel deployment
   - Configure production database
   - Set up domain and SSL

## Troubleshooting

### Common Issues

1. **Module not found errors**: Run `npm install` to ensure all dependencies are installed
2. **Database connection errors**: Check your DATABASE_URL in .env.local
3. **Prisma errors**: Run `npm run db:generate` and `npm run db:push`
4. **Port already in use**: Kill the process using port 3000 or use `npm run dev -- -p 3001`

### Getting Help

- Check the console for error messages
- Verify environment variables are set correctly
- Ensure PostgreSQL is running
- Try restarting the development server

## App Structure

```
closetapp/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── items/             # Items pages
│   ├── outfits/           # Outfits pages
│   ├── analytics/         # Analytics page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities and configurations
├── prisma/                # Database schema
└── types/                 # TypeScript type definitions
```

The app is built with modern web technologies:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Prisma** for database management
- **Heroicons** for icons
- **PostgreSQL** for data storage
