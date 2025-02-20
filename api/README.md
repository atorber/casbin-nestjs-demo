# NestJS Casbin Demo API

This is a demo application showcasing the integration of NestJS, NextJS, and Casbin. The application provides a RESTful API with OpenAPI (Swagger) documentation.

## Prerequisites

- Node.js (v18.x or later)
- npm (v10.x or later)
- PostgreSQL (optional, for database integration)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the `.env.example` file to `.env` and update the values as needed:
```bash
cp .env.example .env
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
http://localhost:3000/api-docs

## Features

- OpenAPI (Swagger) documentation
- Environment configuration
- CORS enabled
- Input validation using class-validator
- JWT authentication (prepared)
- Role-based access control with Casbin (prepared)

## Project Structure

```
src/
├── config/             # Configuration files
├── auth/              # Authentication module (to be implemented)
├── casbinconfig/     # Casbin configuration (to be implemented)
└── main.ts           # Application entry point
```

## License

MIT
