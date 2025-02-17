# Technical Documentation: Singapore Rental Dashboard

## 1. Dependencies & Technology Stack

### Core Framework
- Next.js 14.1.3 (React framework)
- TypeScript 5.4.2
- React 18.2.0
- Node.js

### UI Libraries
- Tailwind CSS 3.4.1
- shadcn/ui (Custom UI components)
- Radix UI (Primitive UI components)
- Lucide Icons
- class-variance-authority (UI variants)
- clsx & tailwind-merge (Class utilities)

### Data Management
- Supabase (Database & Authentication)
- @tanstack/react-query (Data fetching)
- @supabase/ssr (Supabase SSR utilities)
- @supabase/supabase-js (Supabase client)

### Mapping
- Leaflet 1.9.4
- React Leaflet 4.2.1

### Data Processing
- csv-parse (CSV file processing)
- zod (Data validation)

## 2. Architecture

### Frontend
- React/Next.js application with TypeScript
- Client-side rendering for map components
- Server-side rendering for static content
- React Query for data fetching and caching
- Tailwind CSS for styling

### Backend
- Supabase for database and authentication
- Next.js API routes for server-side operations
- Vercel for hosting and serverless functions

### Database
- PostgreSQL (via Supabase)
- PostGIS extensions for geospatial queries

## 3. Database Schema

### Properties Table
    properties (
      id: uuid PRIMARY KEY,
      property_name: text,
      property_type: enum ('Condo', 'HDB', 'Landed'),
      district: integer,
      rental_price: integer,
      beds: integer,
      baths: integer,
      sqft: numeric,
      mrt: text,
      latitude: numeric,
      longitude: numeric,
      completion_year: integer,
      url: text,
      street_name: text,
      lease_date: text,
      created_at: timestamptz,
      updated_at: timestamptz
    )

### Districts Table
    districts (
      id: integer PRIMARY KEY,
      name: text,
      region: text,
      center_lat: numeric,
      center_lng: numeric,
      property_count: integer,
      avg_price: numeric,
      min_rent: numeric,
      max_rent: numeric,
      condo_count: integer,
      hdb_count: integer,
      landed_count: integer,
      avg_size: numeric,
      top_properties: jsonb[],
      created_at: timestamptz,
      updated_at: timestamptz
    )

## 4. Features

### Property Search & Filtering
- District selection
- Property type filtering (Condo, HDB, Landed)
- Bedroom count filtering
- Square footage range selection
- Real-time filter updates

### Interactive Map
- District boundaries visualization
- Property markers with clustering
- Custom popups with property details
- District-level statistics
- Dynamic marker colors by property type

### Data Analysis
- District-level statistics
- Property type distribution
- Price range analysis
- Size distribution analysis
- Automated data cleaning and processing

## 5. Folder Structure

    src/
    ├── app/                    # Next.js app router
    │   ├── api/               # API routes
    │   └── providers.tsx      # App-wide providers
    ├── components/            # React components
    │   ├── filters/          # Filter components
    │   ├── map/              # Map components
    │   └── ui/               # UI components
    ├── data/                 # Static data
    │   └── districts/        # District information
    ├── lib/                  # Utility functions
    │   ├── supabase/        # Supabase clients
    │   └── utils/           # Helper functions
    ├── scripts/             # Data processing scripts
    ├── types/               # TypeScript types
    └── hooks/               # Custom React hooks

## 6. Key Algorithms

### District Assignment
- Ray casting algorithm for point-in-polygon testing
- Property-to-district mapping based on coordinates
- Fuzzy matching for property names

### Data Processing
- Property type classification
- Bedroom count estimation for landed properties
- District boundary calculation
- Price range normalization

## 7. Data Sources

### Government Data
- URA (Urban Redevelopment Authority) API
- Property transaction data
- District boundaries

### Property Data
- Rental listings
- Property details
- Geographical coordinates

## 8. Development Workflow

### Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start development server: `npm run dev`

### Data Updates
1. Process raw data: `npm run process-data`
2. Clean data: `npm run clean-data`
3. Import to Supabase: `npm run import-data`
4. Update coordinates: `npm run add-coordinates`

### Deployment
- Automatic deployment via Vercel
- Database migrations via Supabase CLI
- Scheduled data updates via cron jobs

## 9. Security

- Environment variables for sensitive data
- Supabase RLS policies
- API route protection
- CORS configuration
- Rate limiting on API routes

## 10. Contributing

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component-first architecture

### Testing
- Unit tests with Jest
- Integration tests with Cypress
- API testing with Postman

### Version Control
- Git branching strategy
- Pull request reviews
- Semantic versioning

## 11. Maintenance

### Monitoring
- Vercel Analytics
- Error tracking
- Performance monitoring
- Database health checks

### Updates
- Regular dependency updates
- Security patches
- Data refresh schedule
- Backup procedures

### Troubleshooting
- Common issues and solutions
- Debug procedures
- Support contacts
- Emergency protocols

---

This documentation provides a comprehensive overview of the Singapore Rental Dashboard project. For specific implementation details, refer to the individual source files and comments within the codebase. 