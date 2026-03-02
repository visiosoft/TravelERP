# Travel Agency ERP - Database Setup

## Quick Setup (After Database Reset)

If you've deleted the database and need to set it up again, simply run:

```bash
cd backend
npm run setup
```

This will:
- ✅ Create the admin user
- ✅ Set up exchange rates for all supported currencies
- ✅ Display login credentials

## Manual Setup

If you prefer to set up components individually:

### 1. Create Admin User Only
```bash
cd backend
npm run seed
```

### 2. Create Exchange Rates
```bash
cd backend
node src/scripts/seedExchangeRates.js
```

## Default Login Credentials

After running the setup:

- **Email**: `admin@travelagency.com`
- **Password**: `Admin@123`

## Supported Currencies

The system supports the following currencies with automatic exchange rate conversion to PKR:

- 🇺🇸 **USD** - US Dollar (PKR 278.50)
- 🇪🇺 **EUR** - Euro (PKR 303.20)
- 🇬🇧 **GBP** - British Pound (PKR 354.75)
- 🇦🇪 **AED** - UAE Dirham (PKR 75.85)
- 🇸🇦 **SAR** - Saudi Riyal (PKR 74.27)
- 🇵🇰 **PKR** - Pakistani Rupee (Base Currency)

## Next Steps After Setup

1. **Start Backend Server**:
   ```bash
   cd backend
   node src/server.js
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Open browser: http://localhost:5173
   - Login with credentials above

## Database Connection

Make sure your `.env` file in the backend folder contains:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
DEFAULT_ADMIN_EMAIL=admin@travelagency.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

## Troubleshooting

**Issue**: "Admin user already exists"
- **Solution**: This is normal if you've already run setup. The script won't create duplicate users.

**Issue**: "Exchange rates already exist"
- **Solution**: This is normal. The script checks for existing rates before creating new ones.

**Issue**: "Connection error"
- **Solution**: Verify your MongoDB connection string in the `.env` file.

---

For more information, see the main project documentation.
