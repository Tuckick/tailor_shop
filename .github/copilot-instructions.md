# Tailor Shop Management System - AI Assistant Instructions

## Project Overview

This is a **Next.js 15 tailor shop management system** built with TypeScript, Prisma ORM, and SQLite. The system manages customer orders, tracks processing status, handles image uploads, and generates income reports.

## Architecture & Key Patterns

### Database Schema (Prisma + SQLite)

- **Orders**: Core entity with queue numbers, customer info, service types, dates, pricing, and status
- **Images**: Base64-encoded images stored in database, linked to orders via `orderId` (nullable for temp uploads)
- **Migration pattern**: Use `npm run prisma:migrate` for schema changes, `npm run prisma:generate` for client updates

### Image Upload System (Critical Pattern)

The image system uses a **two-phase upload approach**:

1. **Temporary Upload**: Images uploaded to `/api/upload` without orderId, stored with `orderId: null`
2. **Order Association**: When order is created via `/api/orders`, images are linked using the `imageIds` array
3. **Display in Edit Mode**: Images loaded from `/api/images/[id]` and displayed using data URLs

**Key files:**

- `src/components/ui/image-uploader.tsx` - Handles frontend upload logic
- `src/components/ui/safe-image.tsx` - Displays images (handles data URLs vs regular URLs)
- `src/app/api/upload/route.ts` - Processes file uploads, validates, converts to base64
- `src/app/api/images/[id]/route.ts` - Retrieves image data as base64 data URLs
- `src/app/api/orders/route.ts` - Links uploaded images to orders during creation

**Common Issues:**

- **Black image thumbnails**: Use regular `<img>` tag for data URLs, Next.js Image for external URLs
- **Images not showing in edit mode**: Ensure `initialDataUrls` prop is passed to ImageUploader
- Prisma type strictness: Use `as any` for complex data structures when needed
- Null handling: Filter images with `image.orderId === null` rather than Prisma filters
- Error handling: Always include detailed error messages in API responses
- **Async loading**: Use `Promise.all()` for parallel image loading in edit mode

### Next.js 15 App Router Structure

```
src/app/
├── (app)/          # Route group for main app pages
│   ├── orders/     # Order management pages
│   │   ├── new/    # Create new order
│   │   └── [id]/   # Edit/view specific order
│   └── reports/    # Income reporting
└── api/            # API routes for CRUD operations
```

### State Management Patterns

- Use `useState` for form data with structured objects
- Form validation happens client-side before API calls
- Error states displayed via `alert()` and error state variables
- Router refresh pattern: `router.push()` followed by `router.refresh()`

## Development Workflows

### Essential Commands

```bash
npm run dev                 # Development server with Turbopack
npm run prisma:studio      # Visual database management
npm run prisma:migrate     # Run database migrations
npm run prisma:generate    # Update Prisma client types
npm run build             # Production build check
```

### Database Access Patterns

```typescript
// Always import from centralized client
import { prisma } from "@/lib/prisma";

// Queue number auto-increment pattern
const highestQueue = await prisma.order.findFirst({
  orderBy: { queueNumber: "desc" },
});
const queueNumber = highestQueue ? highestQueue.queueNumber + 1 : 1;
```

### API Error Handling Standard

```typescript
return NextResponse.json(
  {
    error: "User-friendly message",
    details: error instanceof Error ? error.message : "Unknown error",
  },
  { status: 500 }
);
```

## UI/Component Conventions

### Form Patterns

- Use Radix UI components with Tailwind CSS
- Form state managed in single `formData` object
- Violet color scheme (`violet-600`, `violet-50`, etc.)
- Thai language UI with English code/comments

### Critical UI Components

- `ImageUploader`: Handles file validation, upload, preview, and removal
- `CustomDatePicker`: Date selection for pickup dates
- `SafeImage`: Wrapper for Next.js Image with error handling
- `Select` components: Dropdown menus for status/service types

## Common Debugging Patterns

### Image Upload Issues

1. Check browser network tab for API error details
2. Verify file size (<5MB) and type (jpeg/png/webp/gif)
3. Check database for orphaned images with `orderId: null`
4. Use Prisma Studio to inspect data relationships

### Database Connection Issues

- Run `npm run prisma:generate` if client types are stale
- Check `.env` file for `DATABASE_URL="file:./tailor.db"`
- Use `npm run prisma:studio` for visual data inspection

### TypeScript Strict Mode

- Prisma types are strict - use interface definitions or `as any` when needed
- Nullable fields require explicit null checks
- Use proper typing for API request/response objects

## Project-Specific Context

- Thai tailoring business context: services include ตัด (cutting), เย็บ (sewing), ปัก (embroidery), ซ่อม (repair)
- Status workflow: not_started → in_progress → completed
- Queue-based system with auto-incrementing queue numbers
- Base64 image storage in SQLite (no external file storage)
- Thai language UI but English codebase
