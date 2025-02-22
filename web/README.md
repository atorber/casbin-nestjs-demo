# Next.js Casbin Demo Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The frontend application for the Casbin Demo project, built with Next.js and featuring a modern, responsive UI with role-based access control.

## Features

- 🎨 Modern UI with Shadcn/UI
- 🔐 Role-Based Access Control
- 📱 Responsive Design
- 🔑 JWT Authentication
- 🎯 TypeScript Support
- ⚡ Fast Refresh
- 🎨 Tailwind CSS

## Prerequisites

- Node.js (v18.x or later)
- npm (v10.x or later)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Update with your API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:8001

## Available Scripts

```bash
# development
npm run dev

# build
npm run build

# production
npm start

# lint
npm run lint
```

## Project Structure

```
src/
├── app/                # Next.js App Router
├── components/         # React Components
│   ├── ui/            # Shadcn UI Components
│   ├── auth/          # Authentication Components
│   └── users/         # User Management Components
├── contexts/          # React Contexts
├── lib/               # Utilities and API Client
└── styles/            # Global Styles
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:8000 |
| `PORT` | Frontend port | 8001 |

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 