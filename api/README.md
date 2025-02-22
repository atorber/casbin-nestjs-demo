# NestJS Casbin Demo API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a demo application showcasing the integration of NestJS and Casbin for Role-Based Access Control (RBAC). The application provides a RESTful API with OpenAPI (Swagger) documentation.

## Features

- 🔐 Role-Based Access Control with Casbin
- 🔑 JWT Authentication
- 📚 OpenAPI (Swagger) Documentation
- ✨ Input Validation
- 🎯 TypeScript Support
- 🔄 Real-time Permission Updates

## Prerequisites

- Node.js (v18.x or later)
- npm (v10.x or later)
- SQLite (included)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the `.env.example` file to `.env` and update the values:
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
http://localhost:8000/api-docs

## Available Scripts

```bash
# development
npm run start:dev

# build
npm run build

# production
npm run start:prod

# create initial users
npm run create:users

# run tests
npm run test
```

## Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management module
├── casbinconfig/      # Casbin configuration
├── config/            # Application configuration
└── main.ts           # Application entry point
```

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
