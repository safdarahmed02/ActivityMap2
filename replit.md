# Overview

This is a full-stack web application called "Heatmap Tracker" that allows users to track their daily progress across different activities through GitHub-style heatmap visualizations. Users can create topics (like coding hours, exercise minutes, reading pages) and log daily values, which are then displayed as interactive heatmaps showing activity patterns over time.

The application features a clean, modern interface with a sidebar for topic management and a main area displaying the heatmap visualization with statistics and quick-add functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool and development server
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Data Visualization**: D3.js for rendering the heatmap charts

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with JSON responses
- **Data Storage**: In-memory storage with sample data initialization (development setup)
- **Database ORM**: Drizzle ORM configured for PostgreSQL (production-ready schema)
- **Validation**: Zod schemas for request/response validation

## Data Storage Solutions
- **Development**: MemStorage class providing in-memory data persistence with sample data
- **Production**: PostgreSQL database with Drizzle ORM schema defining topics table
- **Database Schema**: Topics table with id, name, unit, and JSONB data fields for flexible daily tracking

## Authentication and Authorization
- **Current State**: No authentication implemented (open application)
- **Session Management**: Basic Express session configuration present but not actively used
- **Future Ready**: Infrastructure in place for adding authentication layers

## API Structure
- **GET /api/topics**: Retrieve all topics
- **GET /api/topics/:id**: Retrieve specific topic
- **POST /api/topics**: Create new topic with validation
- **PATCH /api/topics/:id**: Update topic data (daily entries)
- **DELETE /api/topics/:id**: Delete topic (endpoint prepared)

The API follows REST conventions with proper HTTP status codes and error handling. All endpoints include validation and error responses.

# External Dependencies

## Database and ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for production database connectivity
- **drizzle-orm**: Modern TypeScript ORM for database operations and query building
- **drizzle-kit**: Development tools for schema migrations and database management

## UI and Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives for building the component library
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx**: Utility for constructing className strings conditionally

## Data Fetching and Forms
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **react-hook-form**: Performant forms library with easy validation
- **@hookform/resolvers**: Resolver library for integrating Zod validation with react-hook-form

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