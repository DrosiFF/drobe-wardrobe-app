# 👗 Drobe - Your Digital Wardrobe

A modern, Spotify-inspired wardrobe management application built with Next.js, Prisma, and PostgreSQL.

## ✨ Features

- **Smart Upload**: AI-powered clothing analysis and categorization
- **Digital Closet**: Browse your items with advanced filtering and search
- **Outfit Builder**: Create and save outfit combinations with drag-and-drop
- **Style Analytics**: Insights about your wardrobe and wearing patterns
- **Calendar Planning**: Plan your outfits for future dates
- **Dark Theme**: Sleek, modern interface inspired by music streaming apps
- **Smart Organization**: Tag items, track seasons, occasions, and more

## 🎨 Design System

Drobe features a sleek, dark theme inspired by Spotify with:
- Professional dark color palette
- Smooth animations and micro-interactions
- Album-style item cards
- Sidebar navigation with quick actions
- Advanced filtering and search capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   cd closetapp
   npm install
   ```

2. **Set up your database:**
   - Create a PostgreSQL database
   - Copy `env.example` to `.env`
   - Update the `DATABASE_URL` in `.env` with your database credentials

3. **Initialize the database:**
   ```bash
   npm run db:push
   ```

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 Pages

- **Dashboard** (`/`) - Overview of your wardrobe with quick actions
- **Items** (`/items`) - Browse and manage your clothing collection
- **Upload** (`/upload`) - Add new items with AI analysis
- **Outfits** (`/outfits`) - Create and manage outfit combinations
- **Analytics** (`/analytics`) - Insights about your style and usage patterns

## 🗄️ Database Schema

The application uses the following main models:

- **User**: User accounts and profiles
- **Item**: Individual clothing items with categories, colors, brands, etc.
- **Outfit**: Collections of items that make complete outfits
- **WearLog**: Track when items/outfits were worn
- **CalendarPlan**: Plan outfits for specific dates
- **Tag**: Flexible tagging system for items

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui components
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Language**: TypeScript

## 🎯 Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run lint` - Run ESLint

## 📄 License

ISC