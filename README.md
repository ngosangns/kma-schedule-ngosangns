# KMA Schedule by ngosangns

A comprehensive schedule management application for KMA (Học viện Kỹ thuật Mật mã) students, featuring both official schedule viewing and course planning capabilities.

## Features

### 📅 Official Schedule Viewing

- Convert raw HTML from the official KMA website into readable schedule timetables
- Clean, modern interface for viewing class schedules
- Semester-based navigation and filtering
- Responsive design for desktop and mobile devices

### 📚 Course Planning (Lập lịch tín chỉ)

- **Excel File Processing**: Upload and process Excel files containing course information
- **Smart Subject Selection**: Interactive interface for selecting subjects and classes
- **Automatic Schedule Generation**: AI-powered optimization to create conflict-free schedules
- **Multiple Optimization Modes**: Morning, afternoon, evening preferences
- **Visual Calendar Display**: Color-coded calendar view with conflict detection
- **Alternative Solutions**: Generate multiple schedule options

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/ngosangns/kma-schedule-ngosangns.git
cd kma-schedule-ngosangns

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
yarn dev
```

### Usage

#### Official Schedule

1. Navigate to the application
2. Log in with your KMA credentials
3. Select your semester
4. View your schedule in calendar format

#### Course Planning

1. Go to "Lập lịch tín chỉ" in the navigation
2. Upload an Excel file with course information
3. Select subjects you want to register for
4. Choose optimization preferences
5. Generate and view your optimal schedule

## Documentation

- [Course Planning Guide](docs/course-planning.md) - Detailed guide for the course planning feature
- [API Documentation](docs/api.md) - API endpoints and usage
- [Development Guide](docs/development.md) - Setup and development instructions

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Context API
- **File Processing**: xlsx library
- **Testing**: Jest, React Testing Library
- **Performance**: Web Workers for heavy computations

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run development server
yarn dev

# Build for production
yarn build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original tin-chi-master Angular application for course planning algorithms
- KMA for providing the official schedule data
- The open-source community for the amazing tools and libraries
