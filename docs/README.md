# KMA Schedule - Complete Documentation

## Project Overview

KMA Schedule is a modern, responsive web application that converts raw HTML from the official KMA (Academy of Military Science and Technology) website into readable, user-friendly schedule timetables for students. Built with Next.js and TypeScript, it provides a seamless experience for viewing class schedules, managing semesters, and receiving notifications.

## Key Features

### 🔐 Authentication System

- Secure login with KMA credentials
- MD5 password hashing (as required by KMA server)
- Session management with automatic token handling
- Manual data input option for offline use

### 📅 Calendar Management

- **Multiple View Modes**: Calendar grid, list view, and month view
- **Semester Switching**: Easy switching between different academic semesters
- **Real-time Sync**: Fetch latest schedule data from KMA server
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔔 Notification System

- Browser push notifications for class reminders
- Configurable notification timing (1 day, 1 hour, at start time)
- Persistent notification preferences
- Smart notification scheduling

### 📱 Mobile-First Design

- Progressive Web App (PWA) capabilities
- Touch-friendly interface
- Mobile-optimized navigation
- Offline data access

### 🎨 Modern UI/UX

- Dark theme by default with theme switching capability
- Accessible design with ARIA labels and keyboard navigation
- Smooth animations and transitions
- Consistent design system with Tailwind CSS

## Technology Stack

### Frontend

- **Framework**: Next.js 14.0.4 with App Router
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.6
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API with useReducer

### Development Tools

- **Package Manager**: Yarn
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript with strict mode

### Build & Deployment

- **Build Tool**: Next.js built-in bundler
- **Performance**: Web Workers for heavy processing
- **Optimization**: Automatic code splitting and optimization

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KMA Schedule App                         │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── Next.js App Router Pages                             │
│  ├── React Components (UI + Layout)                       │
│  └── Responsive Design (Mobile-First)                     │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── React Context (Auth, Calendar, UI)                   │
│  ├── Custom Hooks (Data Operations)                       │
│  └── Local Storage (Data Persistence)                     │
├─────────────────────────────────────────────────────────────┤
│  Business Logic                                             │
│  ├── Calendar Processing (Web Workers)                    │
│  ├── Authentication Logic                                  │
│  ├── Data Transformation                                   │
│  └── Notification Service                                  │
├─────────────────────────────────────────────────────────────┤
│  API Integration                                            │
│  ├── KMA Server Communication                             │
│  ├── Next.js API Routes (Server-side)                     │
│  └── HTML Parsing & Data Extraction                       │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kma-schedule-ngosangns

# Install dependencies
yarn install

# Create environment file (optional, for integration tests)
cp .env.example .env
# Edit .env with your KMA credentials for testing

# Start development server
yarn dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

```bash
# Development
yarn dev                    # Start development server
yarn build                  # Build for production
yarn start                  # Start production server

# Code Quality
yarn lint                   # Run ESLint
yarn format                 # Format code with Prettier

# Testing
yarn test                   # Run unit tests
yarn test:integration       # Run integration tests (requires .env)
yarn test:coverage         # Run tests with coverage report
yarn test:watch            # Run tests in watch mode
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Authenticated pages group
│   │   ├── calendar/      # Main calendar page with integrated login
│   │   ├── course-planning/ # Course planning page
│   │   ├── about/         # About page
│   │   └── changelogs/    # Changelog page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
│   └── AppContext.tsx    # Main application context
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── ts/              # TypeScript utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
└── __tests__/           # Test files
    ├── components/      # Component tests
    ├── hooks/          # Hook tests
    ├── integration/    # Integration tests
    ├── lib/           # Library tests
    └── mocks/         # Test mocks
```

## Core Features Deep Dive

### Authentication Flow

1. User enters KMA credentials
2. App fetches login page to get ViewState tokens
3. Credentials are submitted with MD5-hashed password
4. Session token is stored for subsequent requests
5. User is redirected to calendar page

### Calendar Processing

1. Raw HTML is fetched from KMA server
2. HTML is cleaned and parsed to extract table data
3. Data is processed in Web Worker to prevent UI blocking
4. Schedule is transformed into structured calendar format
5. Calendar is rendered with multiple view options

### Data Persistence

- User session and calendar data stored in localStorage
- Automatic data restoration on app reload
- Secure token management
- Data validation and error handling

### Notification System

- Browser notification permission management
- Scheduled notifications for upcoming classes
- Configurable notification preferences
- Smart notification timing based on class schedule

## API Integration

The application integrates with the KMA server through internal Next.js API routes:

### Endpoints

- **Login**: `GET/POST /api/kma/login` - Authentication
- **Schedule**: `GET/POST /api/kma/subject` - Calendar data

### Data Flow

```
Client → Next.js API Routes → KMA Server → Next.js API Routes → Client
```

### Security

- MD5 password hashing
- Secure token storage
- Proxy-based request handling
- Input validation and sanitization
- CORS protection via external proxy

## Testing Strategy

### Test Types

- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: Real API interactions
- **Component Tests**: React component behavior
- **Coverage**: 70% minimum threshold

### Test Configuration

- Jest with jsdom environment
- React Testing Library for component testing
- Real API testing with test credentials
- Comprehensive mocking strategy

## Development Guidelines

### Code Quality

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for consistent formatting
- Comprehensive type definitions

### Performance

- Web Workers for heavy processing
- Code splitting and lazy loading
- Optimized bundle sizes
- Mobile performance optimization

### Accessibility

- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Security

- Input validation and sanitization
- Secure credential handling
- XSS protection
- Content Security Policy

## Documentation

This project includes comprehensive documentation:

- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)**: Architecture, systems, and implementation details
- **[Project Structure](./PROJECT_STRUCTURE.md)**: File organization and component hierarchy
- **[API Documentation](./API_DOCUMENTATION.md)**: API endpoints, data models, and integration
- **[Testing Documentation](./TESTING_DOCUMENTATION.md)**: Testing strategy, configuration, and best practices

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Ensure all tests pass
5. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Maintain documentation
- Follow accessibility guidelines

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, Web Workers, Local Storage, Notifications API

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## License

This project is developed for educational purposes and KMA student use.

## Support

For issues, questions, or contributions:

- Create an issue in the repository
- Follow the contribution guidelines
- Ensure proper testing and documentation

---

**KMA Schedule** - Making class schedule management simple and accessible for KMA students.
