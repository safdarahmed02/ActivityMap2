# Overview

This is a client-side web application called "Heatmap Tracker" optimized for Vercel deployment. It allows users to track their daily progress across different activities through GitHub-style heatmap visualizations. Users can create topics (like coding hours, exercise minutes, reading pages) and log daily values, which are then displayed as interactive heatmaps showing activity patterns over time.

The application features a clean, modern interface with a sidebar for topic management and a main area displaying the heatmap visualization with statistics and quick-add functionality. All data is stored locally in the browser using localStorage, making it perfect for personal use and Vercel's static hosting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool and development server
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React useState/useEffect hooks for local state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for dark theming
- **Data Visualization**: D3.js for rendering the heatmap charts

## Data Storage Solutions
- **Client-Side Storage**: Browser localStorage for persistent data storage
- **Import/Export**: JSON file import/export functionality for data backup and sharing
- **Data Structure**: Topics with id, name, unit, and data object containing date-value pairs
- **Filename Format**: JSON exports include datetime in format "heatmap-data-DDMMYYHHMM.json"

## Deployment Architecture
- **Platform**: Vercel static site hosting
- **Build Process**: Vite builds the React application to static files
- **Configuration**: vercel.json configured for SPA routing with catch-all rewrites
- **No Backend Required**: Completely client-side application with no server dependencies

# External Dependencies

## Deployment and Build Tools
- **vercel**: Static site hosting platform optimized for frontend frameworks
- **vite**: Fast build tool and development server for production builds

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives for building the component library
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx**: Utility for constructing className strings conditionally

## Forms and Validation
- **react-hook-form**: Performant forms library with easy validation
- **@hookform/resolvers**: Resolver library for integrating Zod validation with react-hook-form
- **Client-side Storage**: Direct localStorage operations replace API calls

## Data Visualization
- **d3**: Industry-standard library for creating data-driven visualizations
- **date-fns**: Modern JavaScript date utility library for date formatting and manipulation

## Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React plugin for Vite
- **typescript**: Type safety and enhanced developer experience
- **wouter**: Minimalist routing library for React

## Additional Utilities
- **zod**: TypeScript-first schema validation library
- **cmdk**: Command palette component for enhanced UX
- **html2canvas**: Library for taking screenshots of heatmaps (export functionality)

# Vercel Deployment Instructions

## Deployment Steps
1. **Push to GitHub**: Commit all changes and push to a GitHub repository
2. **Connect to Vercel**: Import the repository in Vercel dashboard
3. **Configure Build**: Vercel will automatically detect the configuration from `vercel.json`
4. **Deploy**: Vercel will build and deploy the application automatically

## Build Configuration
- **Build Command**: `npm run build` (builds the client-side application)
- **Output Directory**: `dist/public` (contains the built static files)
- **Framework**: Vite (automatically detected)
- **SPA Routing**: Configured with catch-all rewrites for client-side routing

## Local Development
Since the application is now client-only, you can run it locally using:
```bash
cd client && npx vite --host 0.0.0.0 --port 5000
```

## Features Optimized for Vercel
- **No Server Dependencies**: Pure client-side application
- **localStorage Persistence**: Data persists in browser without backend
- **JSON Import/Export**: Backup and restore data through file downloads
- **Static Hosting**: Perfect for Vercel's edge network delivery