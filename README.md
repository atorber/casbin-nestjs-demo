# Casbin Demo Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-8.x-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13.x-black.svg)](https://nextjs.org/)
[![Casbin](https://img.shields.io/badge/Casbin-5.x-blue.svg)](https://casbin.org/)

A full-stack demo application showcasing Role-Based Access Control (RBAC) using NestJS, Next.js, and Casbin. This project demonstrates how to implement secure, role-based authorization in a modern web application.

## Features

- 🔐 Role-Based Access Control (RBAC) using Casbin
- 🔑 JWT Authentication
- 👤 User Management
- 📱 Responsive UI with Shadcn/UI
- 📚 API Documentation with Swagger
- 🔄 Real-time Permission Updates
- 🎯 TypeScript Support

## Project Structure

```
.
├── api/                # NestJS Backend
│   ├── src/
│   │   ├── auth/      # Authentication Module
│   │   ├── users/     # User Management
│   │   └── casbinconfig/ # Casbin Configuration
│   └── package.json
│
└── web/               # Next.js Frontend
    ├── src/
    │   ├── app/       # Next.js App Router
    │   ├── components/# React Components
    │   └── lib/       # Utilities
    └── package.json
```

## Prerequisites

- Node.js (v18.x or later)
- npm (v10.x or later)
- SQLite (included)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd casbindemo
```

2. Install dependencies:
```bash
# Install API dependencies
cd api
npm install

# Install Web dependencies
cd ../web
npm install
```

3. Set up environment variables:
```bash
# In api/.env
PORT=8000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# In web/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Create initial users:
```bash
cd api
npm run create:users
```

5. Start the development servers:
```bash
# Start API server (in api directory)
npm run start:dev

# Start Web server (in web directory)
npm run dev
```

6. Access the application:
- Frontend: http://localhost:8001
- API Documentation: http://localhost:8000/api-docs

## Default Users

The application comes with pre-configured users:

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | Admin123! | admin |
| user     | User123!  | user  |
| demo     | Demo123!  | user  |

## API Documentation

The API documentation is available through Swagger UI at http://localhost:8000/api-docs. This provides:
- Detailed endpoint documentation
- Request/response schemas
- Authentication requirements
- Interactive API testing interface

## Development

### API (NestJS)

```bash
cd api

# Run in development mode
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build
```

### Web (Next.js)

```bash
cd web

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Dependencies License Overview

This project uses the following major dependencies and their licenses:

- NestJS (MIT License)
- Next.js (MIT License)
- Casbin (Apache 2.0 License)
- React (MIT License)
- TypeORM (MIT License)
- SQLite (Public Domain)
- Shadcn/UI (MIT License)
- Radix UI (MIT License)
- Tailwind CSS (MIT License)

All dependencies are compatible with the MIT License terms. 