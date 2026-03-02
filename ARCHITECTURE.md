# Travel Agency ERP - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React 18 + TypeScript + Vite                      │    │
│  │  • Tailwind CSS + Shadcn UI                        │    │
│  │  • TanStack Query (data fetching)                  │    │
│  │  • Zustand (state management)                      │    │
│  │  • React Router (routing)                          │    │
│  │  • Axios (HTTP client)                             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Express.js REST API                               │    │
│  │  • JWT Authentication                              │    │
│  │  • Role-based Authorization                        │    │
│  │  • Request Validation (Joi)                        │    │
│  │  • Error Handling Middleware                       │    │
│  │  • Rate Limiting                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Service Classes                                   │    │
│  │  • Customer Service                                │    │
│  │  • Vendor Service                                  │    │
│  │  • Purchase Service                                │    │
│  │  • Sales Service                                   │    │
│  │  • Payment Service                                 │    │
│  │  • Expense Service                                 │    │
│  │  • Ledger Service (Double-Entry)                  │    │
│  │  • Report Service (Analytics)                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Mongoose ODM                                      │    │
│  │  • Schema Validation                               │    │
│  │  • Indexing Strategy                               │    │
│  │  • Transaction Support                             │    │
│  │  • Middleware Hooks                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MongoDB 6.0+                                      │    │
│  │  • Document-based NoSQL                            │    │
│  │  • ACID Transactions                               │    │
│  │  • Sharding Ready                                  │    │
│  │  • Replica Sets                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. Purchase Flow
```
User Action → API Request → Validation → Purchase Service
                                              ↓
                            Check Exchange Rate (snapshot)
                                              ↓
                            Convert to PKR using current rate
                                              ↓
                            MongoDB Transaction Start
                                              ↓
                    ┌──────────────────────────────────────┐
                    │  Create Purchase Record              │
                    │  Update Vendor Balance               │
                    │  Create Ledger Entries:              │
                    │    - DR: Purchase Account            │
                    │    - CR: Accounts Payable            │
                    └──────────────────────────────────────┘
                                              ↓
                            MongoDB Transaction Commit
                                              ↓
                            Return Success Response
```

### 2. Sales Flow
```
User Action → API Request → Validation → Sales Service
                                              ↓
                            Get Related Purchase (with cost)
                                              ↓
                            Calculate Profit:
                            Gross = Sale Amount - Purchase Cost PKR
                            Margin = (Gross / Sale) × 100
                                              ↓
                            MongoDB Transaction Start
                                              ↓
                    ┌──────────────────────────────────────┐
                    │  Create Sale Record                  │
                    │  Update Customer Balance             │
                    │  Update Service Statistics           │
                    │  Create Ledger Entries:              │
                    │    - DR: Accounts Receivable         │
                    │    - CR: Sales Revenue               │
                    │    - DR: Cost of Sales               │
                    │    - CR: Inventory/Purchase          │
                    └──────────────────────────────────────┘
                                              ↓
                            MongoDB Transaction Commit
                                              ↓
                            Return Success with Profit Data
```

### 3. Payment Flow

#### Customer Payment (Receipt)
```
User → Payment Service → Validation
                              ↓
                    MongoDB Transaction Start
                              ↓
            ┌──────────────────────────────────────┐
            │  Create Customer Payment Record      │
            │  Reduce Customer Balance             │
            │  Create Ledger Entries:              │
            │    - DR: Cash/Bank                   │
            │    - CR: Accounts Receivable         │
            └──────────────────────────────────────┘
                              ↓
                    Transaction Commit
```

#### Vendor Payment
```
User → Payment Service → Validation
                              ↓
                    Get Current Exchange Rate
                              ↓
                    Compare with Purchase Exchange Rate
                              ↓
                    Calculate Exchange Gain/Loss
                              ↓
                    MongoDB Transaction Start
                              ↓
            ┌──────────────────────────────────────┐
            │  Create Vendor Payment Record        │
            │  Reduce Vendor Balance               │
            │  Create Ledger Entries:              │
            │    - DR: Accounts Payable            │
            │    - CR: Cash/Bank                   │
            │    - DR/CR: Exchange Gain/Loss       │
            └──────────────────────────────────────┘
                              ↓
                    Transaction Commit
```

## Database Schema Design

### Core Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['Admin', 'Accountant', 'SalesAgent'],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Customers
```javascript
{
  _id: ObjectId,
  code: String (auto, indexed),
  name: String (indexed),
  email: String,
  phone: String (indexed),
  address: String,
  balance: Number (default: 0),
  totalReceivables: Number,
  totalSales: Number,
  isActive: Boolean,
  isDeleted: Boolean (soft delete),
  createdAt: Date
}
```

#### Vendors
```javascript
{
  _id: ObjectId,
  code: String (auto, indexed),
  name: String (indexed),
  email: String,
  phone: String,
  address: String,
  currency: String (default: 'PKR'),
  balance: Number (default: 0),
  totalPayables: Number,
  totalPurchases: Number,
  isActive: Boolean,
  isDeleted: Boolean,
  createdAt: Date
}
```

#### Purchases
```javascript
{
  _id: ObjectId,
  purchaseNumber: String (auto, unique),
  vendor: ObjectId (ref: Vendor),
  service: ObjectId (ref: Service),
  purchaseDate: Date (indexed),
  ticketNumber: String,
  pnr: String,
  passengerName: String,
  sector: String,
  currency: String,
  amount: Number, // Original currency
  exchangeRate: {  // Snapshot!
    currency: String,
    rate: Number,
    date: Date
  },
  amountPKR: Number (indexed), // Converted amount
  paymentStatus: Enum,
  paidAmount: Number,
  balanceAmount: Number,
  notes: String,
  createdBy: ObjectId,
  isDeleted: Boolean,
  createdAt: Date
}
```

#### Sales
```javascript
{
  _id: ObjectId,
  saleNumber: String (auto, unique),
  customer: ObjectId (ref: Customer),
  relatedPurchase: ObjectId (ref: Purchase),
  service: ObjectId (ref: Service),
  saleDate: Date (indexed),
  passengerName: String,
  saleAmount: Number, // Always PKR
  purchaseCostPKR: Number, // Snapshot from Purchase
  grossProfit: Number (calculated),
  profitMargin: Number (calculated),
  paymentStatus: Enum,
  receivedAmount: Number,
  balanceAmount: Number,
  notes: String,
  createdBy: ObjectId,
  isDeleted: Boolean,
  createdAt: Date
}
```

#### Ledgers (Double-Entry)
```javascript
{
  _id: ObjectId,
  transactionDate: Date (indexed),
  transactionType: Enum['purchase', 'sale', 'customer_payment', 'vendor_payment', 'expense'],
  referenceId: ObjectId, // Purchase/Sale/Payment ID
  referenceNumber: String,
  account: ObjectId (ref: Account),
  debit: Number,
  credit: Number,
  description: String,
  createdBy: ObjectId,
  createdAt: Date
}
```

#### Accounts (Chart of Accounts)
```javascript
{
  _id: ObjectId,
  code: String (unique),
  name: String,
  type: Enum['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
  category: String, // Cash, Bank, Receivables, etc.
  balance: Number,
  isActive: Boolean,
  createdAt: Date
}
```

## Security Architecture

### Authentication Flow
```
1. Login Request
   ↓
2. Validate Credentials (bcrypt compare)
   ↓
3. Generate JWT Access Token (15min)
   ↓
4. Generate Refresh Token (7 days)
   ↓
5. Store Refresh Token in DB
   ↓
6. Return both tokens to client
   ↓
7. Client stores in localStorage
   ↓
8. Each request: Bearer token in header
   ↓
9. Middleware validates token
   ↓
10. If expired: Use refresh token
```

### Authorization Layers
```
Request → JWT Validation → Role Check → Resource Check → Allow/Deny
```

### Role Permissions Matrix

| Resource | Admin | Accountant | SalesAgent |
|----------|-------|------------|------------|
| Users | CRUD | - | - |
| Customers | CRUD | CRUD | CRUD |
| Vendors | CRUD | CRUD | Read |
| Services | CRUD | CRUD | Read |
| Exchange Rates | CRUD | CRUD | Read |
| Purchases | CRUD | CRUD | - |
| Sales | CRUD | CRUD | Create, Read |
| Payments | CRUD | CRUD | - |
| Expenses | CRUD | CRUD | - |
| Reports | All | All | Limited |

## API Architecture

### RESTful Endpoints Pattern
```
/api/resource
  GET    /           → List all (with pagination)
  POST   /           → Create new
  GET    /:id        → Get one
  PUT    /:id        → Update
  DELETE /:id        → Soft delete
  GET    /:id/sub    → Get related resources
```

### Request/Response Flow
```
Client Request
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Helmet (Security Headers)
    ↓
Rate Limiter
    ↓
Route Handler
    ↓
Auth Middleware (protect)
    ↓
Role Middleware (restrictTo)
    ↓
Validation Middleware (Joi)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Model (Database)
    ↓
Response Formatter
    ↓
Error Handler (if error)
    ↓
Client Response
```

## Frontend Architecture

### Component Hierarchy
```
App
├── BrowserRouter
│   ├── AuthLayout
│   │   └── Login
│   │
│   └── DashboardLayout
│       ├── Sidebar
│       ├── Header
│       └── Outlet (Pages)
│           ├── Dashboard
│           ├── Customers
│           ├── Vendors
│           ├── Services
│           ├── Purchases
│           ├── Sales
│           ├── CustomerPayments
│           ├── VendorPayments
│           ├── Expenses
│           └── Reports
```

### State Management Strategy

**Global State (Zustand):**
- Authentication (user, tokens)
- Theme preferences

**Server State (TanStack Query):**
- All data from API
- Cached and auto-refreshed
- Optimistic updates

**Local State (React useState):**
- Form inputs
- UI state (modals, dropdowns)

### Data Fetching Pattern
```typescript
// Custom hook pattern
const useCustomers = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getAll(params)
  });
};

// Usage in component
const { data, isLoading, error } = useCustomers({ page: 1 });
```

## Performance Optimization

### Database
- Indexes on frequently queried fields
- Compound indexes for common queries
- Text search indexes
- Lean queries for read-only operations
- Aggregation pipelines for reports

### Backend
- Response caching (Redis - future)
- Compression middleware
- Query result pagination
- Lazy loading of relationships

### Frontend
- Code splitting (React.lazy)
- Image optimization
- TanStack Query caching
- Debounced search inputs
- Virtual scrolling for large lists

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│             Load Balancer (Nginx)               │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   Frontend (Static CDN)      │
        │   - Vercel / Netlify         │
        └─────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   Backend API Servers        │
        │   - PM2 Cluster Mode         │
        │   - Multiple instances       │
        └─────────────────────────────┘
                      ↓
        ┌─────────────────────────────┐
        │   MongoDB Atlas              │
        │   - Replica Set (3 nodes)    │
        │   - Auto-scaling             │
        │   - Automated backups        │
        └─────────────────────────────┘
```

## File Structure Summary

```
TravelAgencyERP/
├── backend/ (48 files)
│   ├── models/ (11)
│   ├── controllers/ (10)
│   ├── services/ (10)
│   ├── routes/ (9)
│   ├── validators/ (8)
│   ├── middleware/ (3)
│   ├── utils/ (3)
│   ├── config/ (2)
│   └── [server.js, package.json, .env.example]
│
└── frontend/ (43 files)
    ├── src/
    │   ├── components/ (8)
    │   ├── pages/ (10)
    │   ├── services/ (9)
    │   ├── store/ (1)
    │   ├── lib/ (2)
    │   └── [App.tsx, main.tsx]
    └── [config files]

Total: 91 files created
```

---

**System designed for scalability, security, and maintainability.**
