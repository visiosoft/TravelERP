# Travel Agency ERP System

A comprehensive ERP system for travel agencies with complete financial management, multi-currency support, and real-time reporting.

## 🎯 Overview

This is an **INTERNAL BUSINESS ERP SYSTEM** designed to manage travel agency operations including:

- Multi-currency purchase and sales tracking
- Customer and vendor accounting
- Payment processing with exchange rate management
- Double-entry bookkeeping ledger system
- Expense tracking
- Comprehensive financial reports
- Real-time KPI dashboards

## 🏗️ Architecture

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with refresh tokens
- **Validation:** Joi schemas
- **Architecture:** MVC + Service Layer pattern

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **UI:** Tailwind CSS + Shadcn UI
- **Forms:** React Hook Form with Zod

## 📋 Features

### Master Data Management
- ✅ Customer management with balance tracking
- ✅ Vendor management with multi-currency support
- ✅ Service catalog (main services and sub-services)
- ✅ Exchange rate management with historical tracking

### Financial Transactions
- ✅ Purchase recording with foreign currency support
- ✅ Sales with automatic profit calculation
- ✅ Customer payment receipts
- ✅ Vendor payments with exchange gain/loss calculation
- ✅ Expense tracking with categories

### Accounting & Ledger
- ✅ Double-entry bookkeeping system
- ✅ Automatic ledger entries for all transactions
- ✅ Chart of accounts (Assets, Liabilities, Equity, Revenue, Expenses)
- ✅ Real-time balance calculations

### Reporting
- ✅ Dashboard with real-time KPIs
- ✅ Daily financial summary
- ✅ Monthly profit/loss reports
- ✅ Customer outstanding balances
- ✅ Vendor payable balances
- ✅ Service profitability analysis
- ✅ Cash flow reports

### Security
- ✅ Role-based access control (Admin, Accountant, Sales Agent)
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ API rate limiting
- ✅ Input validation at all layers
- ✅ Soft deletion for audit trails

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd TravelAgencyERP
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. **Setup Frontend:**
```bash
cd ../frontend
npm install
cp .env.example .env
# Default API URL is already set
```

### Running the Application

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start Backend Server** (from backend directory):
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

3. **Start Frontend Development Server** (from frontend directory):
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

4. **Seed Initial Data** (optional):
```bash
cd backend
node seedData.js
```

### Default Login Credentials

- **Email:** admin@travelagency.com
- **Password:** Admin@123

## 📁 Project Structure

```
TravelAgencyERP/
├── backend/
│   ├── models/           # Mongoose schemas
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, validation, error handling
│   ├── validators/       # Joi validation schemas
│   ├── utils/            # Helper functions
│   ├── config/           # Database and constants
│   └── server.js         # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API service layer
    │   ├── store/        # Zustand stores
    │   ├── lib/          # Utilities
    │   └── App.tsx       # Main app with routes
    └── package.json
```

## 🔑 Key Concepts

### Multi-Currency Handling
- All purchases are recorded in vendor's currency (USD, EUR, etc.)
- Exchange rates are snapshot at transaction time
- Automatic conversion to PKR for accounting
- Exchange gain/loss calculated on vendor payments

### Double-Entry Bookkeeping
Every transaction creates balanced ledger entries:
- Purchase: DR Purchase Account, CR Accounts Payable
- Sale: DR Accounts Receivable, CR Sales Revenue
- Customer Payment: DR Cash/Bank, CR Accounts Receivable
- Vendor Payment: DR Accounts Payable, CR Cash/Bank
- Expense: DR Expense Account, CR Cash/Bank

### Profit Calculation
```
Gross Profit = Sale Amount - Purchase Cost (PKR)
Net Profit = Gross Profit - Allocated Expenses
Profit Margin = (Gross Profit / Sale Amount) × 100
```

## 🛠️ API Documentation

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Master Data
- `GET/POST /api/customers` - Customer CRUD
- `GET/POST /api/vendors` - Vendor CRUD
- `GET/POST /api/services` - Service CRUD
- `GET/POST /api/exchange-rates` - Exchange rate CRUD

### Transactions
- `GET/POST /api/purchases` - Purchase transactions
- `GET/POST /api/sales` - Sales transactions
- `GET/POST /api/payments/customer` - Customer payments
- `GET/POST /api/payments/vendor` - Vendor payments
- `GET/POST /api/expenses` - Expense tracking

### Reports
- `GET /api/reports/dashboard` - Dashboard KPIs
- `GET /api/reports/daily-summary` - Daily financial summary
- `GET /api/reports/monthly-profit` - Monthly P&L report
- `GET /api/reports/customer-outstanding` - Outstanding receivables
- `GET /api/reports/vendor-payable` - Payable balances
- `GET /api/reports/service-profitability` - Service-wise profit
- `GET /api/reports/cash-flow` - Cash flow statement

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, all reports |
| **Accountant** | Financial transactions, reports, master data |
| **Sales Agent** | Sales, customer management, limited financial access |

## 🧪 Testing

Backend tests (if implemented):
```bash
cd backend
npm test
```

Frontend tests (if implemented):
```bash
cd frontend
npm test
```

## 📊 Database Schema

### Collections
- `users` - System users with roles
- `customers` - Customer master data
- `vendors` - Vendor master data with currency
- `services` - Service catalog (main/sub)
- `exchangerates` - Historical exchange rates
- `purchases` - Purchase transactions
- `sales` - Sales transactions
- `customerpayments` - Customer receipts
- `vendorpayments` - Vendor payments
- `expenses` - Business expenses
- `ledgers` - Double-entry ledger
- `accounts` - Chart of accounts

## 🚢 Deployment

### Backend Deployment
1. Set production environment variables
2. Build: `npm run build` (if using TypeScript)
3. Start: `npm start`
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name travel-erp-api
```

### Frontend Deployment
1. Build production bundle:
```bash
npm run build
```
2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

### Database
- Use MongoDB Atlas for managed hosting
- Enable authentication
- Set up regular backups
- Configure IP whitelist

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel_agency_erp
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DEFAULT_ADMIN_EMAIL=admin@travelagency.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a private internal project. For modifications:
1. Create a feature branch
2. Make changes with proper commit messages
3. Test thoroughly
4. Create pull request for review

## 📄 License

Private - Internal Use Only

## 👥 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for modern travel agencies**
