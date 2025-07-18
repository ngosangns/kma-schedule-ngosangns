# KMA Schedule - Project Structure Documentation

## Project Overview

This document provides a comprehensive overview of the KMA Schedule project structure, file organization, component hierarchy, and development setup.

## Directory Structure

```
kma-schedule-ngosangns/
├── docs/                           # Documentation files
│   ├── TECHNICAL_DOCUMENTATION.md  # Technical architecture docs
│   └── PROJECT_STRUCTURE.md        # This file
├── public/                         # Static assets
│   └── favicon.png                 # Application favicon
├── src/                           # Source code
│   ├── __tests__/                 # Test files
│   ├── app/                       # Next.js App Router pages
│   ├── components/                # React components
│   ├── contexts/                  # React contexts
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility libraries
│   ├── types/                     # TypeScript type definitions
│   ├── middleware.ts              # Next.js middleware
│   └── setupTests.ts              # Test setup configuration
├── static/                        # Additional static files
├── .env                          # Environment variables (not in repo)
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui configuration
├── jest.config.js                # Jest testing configuration
├── jest.integration.config.js    # Integration test configuration
├── next.config.js                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.cjs           # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── yarn.lock                     # Yarn lock file
```

## Source Code Organization

### `/src/app/` - Next.js App Router

```
src/app/
├── (main)/                       # Route group for authenticated pages
│   ├── about/                    # About page
│   ├── calendar/                 # Main calendar page with integrated login
│   │   └── page.tsx             # Calendar view component with LoginForm
│   ├── changelogs/              # Changelog page
│   ├── course-planning/         # Course planning page
│   └── layout.tsx               # Layout for authenticated pages
├── globals.css                  # Global CSS styles
├── layout.tsx                   # Root layout component
└── page.tsx                     # Home page (redirects to calendar)
```

#### Key Pages

- **`/calendar`**: Main application page with schedule display and integrated login
- **`/course-planning`**: Course planning and Excel processing page
- **`/about`**: Application information
- **`/changelogs`**: Version history and updates

### `/src/components/` - React Components

```
src/components/
├── layout/                      # Layout components
│   ├── AppLayout.tsx           # Main application layout wrapper
│   ├── Footer.tsx              # Application footer
│   └── Header.tsx              # Application header with navigation
└── ui/                         # Reusable UI components
    ├── alert.tsx               # Alert component
    ├── badge.tsx               # Badge component
    ├── bottom-sheet.tsx        # Mobile bottom sheet
    ├── button.tsx              # Button component
    ├── card.tsx                # Card component
    ├── dialog.tsx              # Modal dialog component
    ├── empty-state.tsx         # Empty state component
    ├── error-boundary.tsx      # Error boundary wrapper
    ├── floating-action-button.tsx # FAB component
    ├── form.tsx                # Form components
    ├── input.tsx               # Input component
    ├── label.tsx               # Label component
    ├── lazy-image.tsx          # Lazy loading image
    ├── loading-spinner.tsx     # Loading indicators
    ├── mobile-drawer.tsx       # Mobile navigation drawer
    ├── mobile-modal.tsx        # Mobile modal component
    ├── notification-settings.tsx # Notification preferences
    ├── popover.tsx             # Popover component
    ├── select.tsx              # Select dropdown
    ├── separator.tsx           # Visual separator
    ├── skeleton.tsx            # Loading skeleton
    ├── skip-to-content.tsx     # Accessibility skip link
    ├── switch.tsx              # Toggle switch
    ├── table.tsx               # Table component
    ├── textarea.tsx            # Textarea component
    ├── toast.tsx               # Toast notification
    └── toaster.tsx             # Toast container
```

#### Component Architecture

- **Layout Components**: Handle application structure and navigation
- **UI Components**: Reusable, accessible components based on Radix UI
- **Design System**: Consistent styling with Tailwind CSS and CSS variables

### `/src/contexts/` - State Management

```
src/contexts/
└── AppContext.tsx              # Main application context
```

#### Context Structure

```typescript
// Combined application state
interface AppState {
	auth: AuthState; // Authentication state
	calendar: ProcessedCalendarData; // Calendar data
	ui: UIState; // UI preferences
	student: string | null; // Student information
}

// Available contexts
-useAuth() - // Authentication management
	useCalendar() - // Calendar data management
	useUI(); // UI state management
```

### `/src/hooks/` - Custom React Hooks

```
src/hooks/
├── use-calendar-data.ts        # Calendar data operations
├── use-notification-settings.ts # Notification preferences
├── use-notifications.ts        # Toast notifications
└── use-toast.ts               # Toast hook implementation
```

#### Hook Responsibilities

- **`useCalendarData`**: Complex calendar operations (login, data processing, semester switching)
- **`useNotifications`**: Toast notification management
- **`useNotificationSettings`**: Browser notification preferences
- **`useToast`**: Toast notification display

### `/src/lib/` - Utility Libraries

```
src/lib/
├── ts/                         # TypeScript utilities
│   ├── calendar.ts            # Calendar processing logic
│   ├── notifications.ts       # Notification service
│   ├── storage.ts             # Local storage utilities
│   ├── user.ts                # User authentication
│   └── worker.ts              # Web worker utilities
└── utils.ts                   # General utility functions
```

#### Library Functions

- **`calendar.ts`**: HTML parsing, data transformation, calendar processing
- **`user.ts`**: Authentication, login/logout operations
- **`storage.ts`**: Local storage management
- **`notifications.ts`**: Browser notification service
- **`utils.ts`**: Date formatting, validation, helper functions

### `/src/types/` - TypeScript Definitions

```
src/types/
└── index.ts                   # All type definitions
```

#### Key Type Categories

- **User & Authentication**: `User`, `AuthState`, `LoginCredentials`
- **Calendar Data**: `Subject`, `CalendarData`, `ProcessedCalendarData`
- **API Types**: `MainFormData`, `SemesterData`, `ApiResponse`
- **UI Types**: `UIState`, `FormState`, `PageProps`
- **Hook Types**: `UseAuthReturn`, `UseCalendarReturn`, `UseUIReturn`

### `/src/__tests__/` - Test Files

```
src/__tests__/
├── api/                       # API tests
│   └── kma/                   # KMA API specific tests
├── components/                # Component tests
│   ├── month-view.test.tsx    # Month view component test
│   ├── notification-settings.test.tsx # Notification settings test
│   └── ui/                    # UI component tests
├── contexts/                  # Context tests
│   └── AppContext.test.tsx    # Main app context test
├── hooks/                     # Hook tests
│   ├── use-calendar-data.test.ts
│   ├── use-notification-settings.test.ts
│   ├── use-notifications.test.ts
│   └── use-toast.test.ts
├── integration/               # Integration tests
│   ├── calendar-display.test.ts
│   ├── calendar-layout.test.ts
│   ├── calendar-processing.test.ts
│   ├── hooks-integration.test.ts
│   ├── real-account.test.ts
│   ├── semester-change-validation.test.ts
│   ├── shift-range-display.test.ts
│   ├── simple-login.test.ts
│   ├── ui-improvements.test.ts
│   └── README.md
├── lib/                       # Library tests
│   ├── calendar-weeks.test.ts
│   ├── calendar.test.ts
│   ├── config/                # Config tests
│   ├── notifications.test.ts
│   ├── shift-time.test.ts
│   ├── ts/                    # TypeScript utility tests
│   ├── user.test.ts
│   └── utils.test.ts
├── mocks/                     # Test mocks and fixtures
│   ├── data.ts
│   └── providers.tsx
├── utils/                     # Test utilities
│   └── test-utils.tsx
├── auth-loading-state.test.tsx
├── empty-calendar-display.test.tsx
└── semester-data-replacement.test.ts
```

#### Test Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Real API interactions with test credentials
- **Component Tests**: React component behavior
- **Hook Tests**: Custom hook functionality

## Configuration Files

### Build & Development

- **`next.config.js`**: Next.js configuration
- **`tsconfig.json`**: TypeScript compiler options
- **`tailwind.config.cjs`**: Tailwind CSS configuration
- **`postcss.config.js`**: PostCSS configuration

### Testing

- **`jest.config.js`**: Unit test configuration
- **`jest.integration.config.js`**: Integration test configuration
- **`jest.setup.js`**: Test environment setup
- **`jest.integration.setup.js`**: Integration test environment setup
- **`jest.polyfills.js`**: Test polyfills

### Package Management

- **`package.json`**: Dependencies, scripts, and project metadata
- **`yarn.lock`**: Dependency lock file
- **`components.json`**: shadcn/ui component configuration

## Development Setup

### Prerequisites

```bash
# Required software
- Node.js 18+
- Yarn package manager
- Git
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd kma-schedule-ngosangns

# Install dependencies
yarn install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```bash
# .env file structure
TEST_USERNAME=your_kma_username    # For integration tests
TEST_PASSWORD=your_kma_password    # For integration tests
```

### Development Commands

```bash
# Development server
yarn dev                    # Start development server on http://localhost:3000

# Building
yarn build                  # Build for production
yarn start                  # Start production server

# Code Quality
yarn lint                   # Run ESLint
yarn format                 # Format code with Prettier

# Testing
yarn test                   # Run unit tests
yarn test:unit              # Run unit tests only
yarn test:integration       # Run integration tests
yarn test:all              # Run all tests
yarn test:watch            # Run tests in watch mode
yarn test:coverage         # Run tests with coverage
yarn test:ci               # Run tests for CI/CD
```

## File Naming Conventions

### Components

- **React Components**: PascalCase (e.g., `CalendarView.tsx`)
- **Page Components**: `page.tsx` (Next.js App Router convention)
- **Layout Components**: `layout.tsx` (Next.js App Router convention)

### Utilities & Libraries

- **TypeScript Files**: kebab-case (e.g., `calendar-utils.ts`)
- **Hook Files**: kebab-case with `use-` prefix (e.g., `use-calendar-data.ts`)
- **Type Files**: kebab-case (e.g., `api-types.ts`)

### Tests

- **Test Files**: `*.test.ts` or `*.test.tsx`
- **Spec Files**: `*.spec.ts` or `*.spec.tsx`
- **Mock Files**: `*.mock.ts`

## Import/Export Patterns

### Absolute Imports

```typescript
// Use @ alias for src directory
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';
```

### Component Exports

```typescript
// Default exports for components
export default function CalendarPage() { ... }

// Named exports for utilities
export { formatDate, formatTime };
```

### Type Exports

```typescript
// Centralized type exports
export type { User, AuthState, CalendarData };
export interface { ApiResponse, FormState };
```

## Code Organization Principles

### 1. Separation of Concerns

- **UI Components**: Pure presentation logic
- **Business Logic**: Separate utility functions
- **State Management**: Centralized in contexts
- **API Logic**: Isolated in lib/ts files

### 2. Reusability

- **UI Components**: Generic, configurable components
- **Hooks**: Reusable stateful logic
- **Utilities**: Pure functions for common operations

### 3. Type Safety

- **Strict TypeScript**: Comprehensive type definitions
- **Interface Contracts**: Clear API boundaries
- **Runtime Validation**: Type checking for external data

### 4. Performance

- **Code Splitting**: Route-based and component-based
- **Lazy Loading**: Dynamic imports where appropriate
- **Memoization**: React.memo and useMemo for expensive operations

### 5. Accessibility

- **Semantic HTML**: Proper HTML structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling

## Development Guidelines

### 1. Component Development

- Use TypeScript for all components
- Implement proper prop types
- Include accessibility attributes
- Write unit tests for complex logic

### 2. State Management

- Use React Context for global state
- Keep local state when possible
- Implement proper error boundaries
- Handle loading and error states

### 3. API Integration

- Implement proper error handling
- Use TypeScript for API responses
- Cache data when appropriate
- Handle network failures gracefully

### 4. Testing

- Write tests for all business logic
- Test component behavior, not implementation
- Use integration tests for critical flows
- Maintain good test coverage

This structure provides a solid foundation for maintaining and extending the KMA Schedule application while ensuring code quality, performance, and developer experience.
