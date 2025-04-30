
# Data Mapping Conventions

This document outlines the naming conventions and data transformation rules used throughout the application to ensure consistency between frontend interfaces and backend database.

## Naming Conventions

### CamelCase vs Snake_case
- **Frontend**: All object properties use camelCase
- **Backend**: All database columns use snake_case
- Conversion between these formats is handled by the `camelToSnake()` and `snakeToCamel()` utility functions

### Special Field Mappings

Some fields have different names between the frontend and backend:

| Entity   | Frontend Property | Database Column  | Notes                                      |
|----------|-------------------|------------------|-------------------------------------------|
| Visual   | `image`           | `image_url`      | This mapping is handled in visualApi.ts    |
| Product  | `type`            | `type`/`product_type` | `type` is prioritized but `product_type` is used as fallback |

## Date Handling

- Database uses `timestamp with time zone` for all date fields
- Frontend represents dates as ISO strings
- All tables use consistent date field naming:
  - `created_at` (DB) → `createdAt` (Frontend)
  - `updated_at` (DB) → `updatedAt` (Frontend)

## Required vs Optional Fields

- In TypeScript interfaces, optional fields are marked with `?`
- In the database, nullable fields are marked as such
- Non-nullable database fields must have corresponding required properties in TypeScript interfaces

## Supabase Integration Notes

### Visuals Table
When creating or updating visuals:
- Frontend `image` property is mapped to `image_url` in Supabase
- When retrieving from Supabase, `image_url` is mapped back to `image`

### Data Synchronization
Local data synchronization with Supabase uses `syncLocalDataToSupabase()` which:
1. Converts object properties from camelCase to snake_case
2. Handles special field mappings like Visual's image → image_url
3. Uses upsert to preserve IDs and relationships

## Best Practices

1. Always check field nullability in both TypeScript and database schema
2. Use type guards when processing data from the database
3. Include validation in services before submitting data to backend
4. Document any new field mappings in this file
