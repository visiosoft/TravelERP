# Travel Agency ERP - Frontend

Modern React TypeScript frontend for Travel Agency ERP system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Router** for routing
- **Tailwind CSS** for styling
- **Shadcn UI** for components
- **Axios** for API calls
- **React Hook Form** for form management

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL (default: http://localhost:5000/api)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layouts/       # Layout components
│   └── navigation/    # Navigation components
├── pages/             # Page components
│   └── auth/         # Authentication pages
├── services/         # API service functions
├── store/            # Zustand state management
├── lib/              # Utility libraries
│   ├── api.ts        # Axios instance with interceptors
│   └── utils.ts      # Helper functions
├── App.tsx           # Main app component with routes
├── main.tsx          # App entry point
└── index.css         # Global styles

```

## Features

- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Dashboard with KPIs
- ✅ Master Data Management (Customers, Vendors, Services)
- ✅ Transaction Management (Purchases, Sales)
- ✅ Payment Processing
- ✅ Expense Tracking
- ✅ Financial Reports
- ✅ Responsive Design
- ✅ API Error Handling
- ✅ Token Refresh

## Default Login

- Email: `admin@travelagency.com`
- Password: `Admin@123`

## API Integration

All API calls go through the centralized `api.ts` instance which:
- Adds auth tokens automatically
- Handles 401 errors (auto logout)
- Provides consistent error handling
- Proxies requests through Vite dev server

## License

Private - Internal Use Only
