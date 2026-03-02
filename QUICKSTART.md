# Quick Start Guide - Travel Agency ERP

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
```env
MONGODB_URI=mongodb://localhost:27017/travel_agency_erp
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```
(No changes needed - default values work)

### Step 3: Make Sure MongoDB is Running

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) and update the connection string in backend/.env

### Step 4: Seed Initial Data

```bash
cd backend
node seedData.js
```

This creates:
- Default admin user
- Sample customers, vendors, services
- Initial exchange rates
- Chart of accounts

### Step 5: Start the Servers

**Terminal 1 - Backend (from backend directory):**
```bash
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend (from frontend directory):**
```bash
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 6: Login

Open browser to: http://localhost:5173

Login with:
- **Email:** admin@travelagency.com
- **Password:** Admin@123

## 🎉 You're Ready!

You should now see the dashboard with:
- Today's sales summary
- Cash and bank balances
- Receivables and payables
- Monthly profit

## 📱 Next Steps

1. **Add Your First Customer:**
   - Go to Customers → Add New
   - Fill in name, phone, email

2. **Add Your First Vendor:**
   - Go to Vendors → Add New
   - Specify currency (USD, EUR, etc.)

3. **Add Services:**
   - Go to Services → Add New
   - Create main services (Airline Tickets, Hotel Bookings, etc.)

4. **Update Exchange Rates:**
   - Go to Exchange Rates → Add New
   - Add current rates for your currencies

5. **Record a Purchase:**
   - Go to Purchases → New Purchase
   - Select vendor, service, amount in vendor currency
   - System auto-converts to PKR

6. **Make a Sale:**
   - Go to Sales → New Sale
   - Select purchase (link sale to purchase)
   - Enter sale amount in PKR
   - System calculates profit automatically

## ❓ Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running
- ✅ Check port 5000 is not in use
- ✅ Verify .env file exists and has correct values

### Frontend won't start
- ✅ Check port 5173 is not in use
- ✅ Run `npm install` again if dependencies missing

### Can't login
- ✅ Did you run `node seedData.js`?
- ✅ Check backend console for errors
- ✅ Verify backend is running on port 5000

### "Network Error" on frontend
- ✅ Make sure backend is running
- ✅ Check `.env` in frontend has correct API URL
- ✅ Open browser console for detailed error

## 🔄 Daily Workflow Example

1. **Morning:** Check Dashboard KPIs
2. **Record Purchases:** As tickets are bought from airlines
3. **Record Sales:** When customers book through you
4. **Record Payments:** Customer payments received, vendor payments made
5. **Track Expenses:** Office expenses, salaries, etc.
6. **Evening:** Run reports to see daily profit

## 📊 Understanding the System

### Currency Flow
```
1. Vendor (e.g., Airline) → Purchase in USD
   ↓ (Exchange rate snapshot stored)
2. System converts to PKR for accounting
   ↓
3. Sale to Customer in PKR
   ↓
4. System calculates profit = Sale PKR - Purchase PKR
```

### Payment Flow
```
Customer Payment:
- Reduces customer balance (receivables)
- Increases cash/bank balance

Vendor Payment:
- Reduces vendor balance (payables)
- Decreases cash/bank balance
- Calculates exchange gain/loss if rate changed
```

## 🛠️ Common Tasks

### Add a new user
Only admin can do this:
- Login as admin
- POST to `/api/auth/register` with new user details
- Assign role: Admin, Accountant, or SalesAgent

### View financial reports
- Dashboard → Current month overview
- Reports → Monthly Profit Report
- Reports → Service Profitability
- Reports → Outstanding Balances

### Backup database
```bash
mongodump --db travel_agency_erp --out ./backup
```

### Restore database
```bash
mongorestore --db travel_agency_erp ./backup/travel_agency_erp
```

## 🎯 Tips for Best Results

1. **Always update exchange rates daily** - Ensures accurate conversions
2. **Link sales to purchases** - For accurate profit tracking
3. **Use payment methods correctly** - Cash vs Bank affects ledger
4. **Categorize expenses properly** - Better expense analysis
5. **Check dashboard daily** - Stay on top of finances

## 📞 Need Help?

- Check the main README.md for detailed docs
- Review backend/README.md for API documentation
- Review frontend/README.md for UI features

---

Happy managing! 🚀
