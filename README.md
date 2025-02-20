# Singapore Rental Dashboard

The **Singapore Rental Dashboard** is a full-stack web application designed to visualize and analyze rental properties across Singapore. It offers an interactive map with real-time filtering, detailed property data, and insightful statistical analysis to help users explore rental trends across districts.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Folder Structure](#folder-structure)
- [Key Algorithms](#key-algorithms)
- [Data Sources](#data-sources)
- [Development Workflow](#development-workflow)
- [Security](#security)
- [Contributing](#contributing)
- [Maintenance](#maintenance)
- [License](#license)

---

## Overview

The Singapore Rental Dashboard enables users to:
- **Search and filter** properties by district, type (Condo, HDB, Landed), number of bedrooms, and square footage.
- **Interact with a map** that displays property markers, district boundaries, and real-time statistics.
- **Analyze data** through visualizations and statistics at both the property and district levels.

---

## Features

- **Property Search & Filtering:**
  - Filter properties based on district, property type, bedroom count, and square footage.
  - Real-time updates and dynamic filtering.

- **Interactive Map:**
  - Visualizes district boundaries and clusters property markers.
  - Custom popups display detailed property information.
  - Dynamic marker colors based on property type.

- **Data Analysis:**
  - Provides district-level statistics including average price, property counts, and property type distributions.
  - Analyzes price ranges and property sizes for deeper insights.

---

## Technology Stack

### Core Framework & Languages
- **Next.js** (v14.1.3) – React framework for server-side and client-side rendering
- **React** (v18.2.0)
- **TypeScript** (v5.4.2)
- **Node.js**

### UI Libraries & Tools
- **Tailwind CSS** (v3.4.1)
- **shadcn/ui** and **Radix UI** for building custom UI components
- **Lucide Icons**, **class-variance-authority**, **clsx**, and **tailwind-merge** for styling utilities

### Data Management & APIs
- **Supabase** for database and authentication (with PostGIS for geospatial queries)
- **@tanstack/react-query** for efficient data fetching and caching
- **@supabase/supabase-js** and **@supabase/ssr** for seamless integration with Supabase

### Mapping & Data Processing
- **Leaflet** (v1.9.4) and **React Leaflet** (v4.2.1) for interactive map rendering
- **csv-parse** for CSV file processing
- **zod** for data validation

---

## Architecture

### Frontend
- **React/Next.js Application:** Combines client-side interactivity (maps, filters) with server-side rendering for static content.
- **Data Fetching:** Utilizes React Query for caching and fetching data efficiently.
- **Styling:** Built with Tailwind CSS ensuring a responsive and modern UI.

### Backend
- **API Routes:** Next.js API routes handle server-side operations.
- **Database & Authentication:** Powered by Supabase, with PostgreSQL (and PostGIS extensions) providing geospatial capabilities.
- **Hosting:** Deployed on Vercel with serverless functions and automatic updates.

---

## Database Schema

### Properties Table

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY,
  property_name TEXT,
  property_type ENUM ('Condo', 'HDB', 'Landed'),
  district INTEGER,
  rental_price INTEGER,
  beds INTEGER,
  baths INTEGER,
  sqft NUMERIC,
  mrt TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  completion_year INTEGER,
  url TEXT,
  street_name TEXT,
  lease_date TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

## Districts Table

CREATE TABLE districts (
  id INTEGER PRIMARY KEY,
  name TEXT,
  region TEXT,
  center_lat NUMERIC,
  center_lng NUMERIC,
  property_count INTEGER,
  avg_price NUMERIC,
  min_rent NUMERIC,
  max_rent NUMERIC,
  condo_count INTEGER,
  hdb_count INTEGER,
  landed_count INTEGER,
  avg_size NUMERIC,
  top_properties JSONB[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

### Folder Structure
src/
├── app/                   # Next.js app router and API routes
├── components/            # React components (filters, map, UI)
├── data/                  # Static data (e.g., district info)
├── lib/                   # Utility functions and Supabase clients
├── scripts/               # Data processing and cleaning scripts
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks

###Key Algorithms
##District Assignment:
- Utilizes a ray casting algorithm for point-in-polygon testing.
- Maps properties to districts based on geographic coordinates.
- Implements fuzzy matching for property names to enhance accuracy.

##Data Processing:
- Classifies property types and estimates bedroom counts (especially for landed properties).
- Calculates district boundaries and normalizes price ranges.

##Data Sources
- Singapore Urban Redevelopment Authority (URA) for property data
- Google Maps API for geocoding and map rendering
- OpenStreetMap for district boundaries and geographic data

##Development Workflow
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the development server
5. Make changes and commit
6. Push to the main branch
7. Create a pull request  

##Security
- Supabase handles authentication and database security.
- API routes are protected and rate limited.
- Data validation is implemented using Zod.


##Contributing
- Fork the repository
- Create a new branch
- Make your changes and commit
- Push to the branch
- Create a pull request   

##Maintenance
- Regularly update dependencies
- Monitor performance and user feedback
- Address issues and feature requests



##License
This project is licensed under the MIT License. See the LICENSE file for details.   


