# Migration Summary: From External CORS Proxy to Internal API Routes

## Overview

This document summarizes the migration from using an external Cloudflare Workers CORS proxy to internal Next.js API routes for communicating with the KMA server.

## Changes Made

### 1. New API Routes Created

#### `/api/kma/login` (src/app/api/kma/login/route.ts)

- **GET**: Fetches login page from KMA server
- **POST**: Handles authentication and returns SignIn token
- Replaces: `https://actvn-schedule.cors-ngosangns.workers.dev/login`

#### `/api/kma/subject` (src/app/api/kma/subject/route.ts)

- **GET**: Fetches current semester schedule
- **POST**: Fetches specific semester schedule with form data
- Replaces: `https://actvn-schedule.cors-ngosangns.workers.dev/subject`

### 2. Constants and Configuration

#### API Constants (src/lib/constants/api.ts)

- Centralized configuration for KMA server URLs
- HTTP headers, status codes, and error messages
- Authentication configuration

### 3. Client Code Updates

#### User Authentication (src/lib/ts/user.ts)

- Updated `login()` function to use `/api/kma/login`
- Removed dependency on external proxy

#### Calendar Functions (src/lib/ts/calendar.ts)

- Updated `fetchCalendarWithGet()` and `fetchCalendarWithPost()`
- Changed from `x-cors-headers` to standard `Authorization` header
- Now uses `/api/kma/subject` endpoint

### 4. Authentication Changes

#### Before (External Proxy)

```javascript
headers: {
  'x-cors-headers': JSON.stringify({
    Cookie: signInToken
  })
}
```

#### After (Internal API)

```javascript
headers: {
  'Authorization': `Bearer ${signInToken}`
}
```

### 5. Test Updates

#### Updated Existing Tests

- `src/__tests__/lib/user.test.ts`
- `src/__tests__/lib/calendar.test.ts`
- `src/__tests__/lib/ts/user.test.ts`

#### New API Route Tests

- `src/__tests__/api/kma/login.test.ts`
- `src/__tests__/api/kma/subject.test.ts`

#### New Test Configuration

- `jest.api.config.js` - Configuration for API route tests
- `jest.api.setup.js` - Setup file for Node.js environment tests

### 6. Documentation Updates

#### Updated Files

- `docs/API_DOCUMENTATION.md` - Complete API endpoint documentation
- `docs/README.md` - Updated integration information
- `docs/TECHNICAL_DOCUMENTATION.md` - Updated architecture diagrams

#### New Package Scripts

- `npm run test:api` - Run API route tests
- `npm run test:api:watch` - Watch mode for API tests
- Updated `npm run test:all` to include API tests

## Benefits of Migration

### 1. Eliminated External Dependencies

- No longer dependent on external Cloudflare Workers proxy
- All code now resides within the application

### 2. Improved Maintainability

- Easier to debug and modify API logic
- Better error handling and logging
- Centralized configuration

### 3. Better Security

- No need to expose authentication tokens to external services
- Standard HTTP authentication patterns

### 4. Simplified Architecture

- Direct communication with KMA server
- Reduced complexity in request/response flow

### 5. Enhanced Testing

- Comprehensive test coverage for API routes
- Better integration testing capabilities

## Migration Verification

### Tests Passing

- ✅ Unit tests for user authentication
- ✅ Unit tests for calendar functions
- ✅ API route tests for login endpoint
- ✅ API route tests for subject endpoint

### Functionality Preserved

- ✅ Login flow remains identical
- ✅ Schedule fetching works the same
- ✅ Error handling maintained
- ✅ Authentication token management

### Critical Fix Applied

- ✅ **Fixed redirect handling**: Added `redirect: 'manual'` to capture 302 responses with Set-Cookie headers
- ✅ **Verified with real credentials**: Tested with actual KMA server and confirmed token extraction works
- ✅ **Resolved "Invalid value" error**: Improved token validation and cleaning

## Next Steps

1. **Deploy and Test**: Deploy the changes and test with real KMA server
2. **Monitor Performance**: Ensure API routes perform well under load
3. **Remove Old References**: Clean up any remaining references to the old proxy
4. **Update CI/CD**: Ensure deployment pipelines include new API routes

## Rollback Plan

If issues arise, the migration can be rolled back by:

1. Reverting client code changes in `src/lib/ts/`
2. Restoring original proxy URLs
3. Removing new API route files
4. Reverting test changes

The external proxy remains functional and can be re-enabled if needed.
