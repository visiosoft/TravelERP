import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function createMonthlyTestData() {
    console.log('\n🧪 Creating Monthly Test Data for Reports');
    console.log('════════════════════════════════════════════════════════════\n');

    try {
        // Login first
        console.log('1️⃣ Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@travelagency.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.data.accessToken;
        console.log('✅ Login successful\n');

        const headers = { Authorization: `Bearer ${token}` };

        // Get customers
        const customersRes = await axios.get(`${API_URL}/customers?limit=100`, { headers });
        const customers = customersRes.data.data;

        // Get services
        const servicesRes = await axios.get(`${API_URL}/services?limit=100`, { headers });
        const services = servicesRes.data.data;

        // Get vendors
        const vendorsRes = await axios.get(`${API_URL}/vendors?limit=100`, { headers });
        const vendors = vendorsRes.data.data;

        console.log('2️⃣ Creating Sales...');
        const salesCreated = [];

        // Create 10 sales for current month
        for (let i = 0; i < 10; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const service = services[Math.floor(Math.random() * services.length)];

            const sale = {
                customerId: customer._id,
                serviceId: service._id,
                quantity: Math.floor(Math.random() * 3) + 1,
                sellingPricePKR: service.sellingPricePKR || 35000,
                saleDate: new Date(2026, 2, Math.floor(Math.random() * 28) + 1).toISOString(),
                notes: `Test sale ${i + 1} for monthly report`
            };

            try {
                const saleRes = await axios.post(`${API_URL}/sales`, sale, { headers });
                salesCreated.push(saleRes.data.data);
                console.log(`  ✓ Sale ${i + 1} created: ${saleRes.data.data.saleNumber}`);
            } catch (err) {
                console.log(`  ✗ Sale ${i + 1} failed:`, err.response?.data?.message);
            }
        }

        console.log(`\n3️⃣ Creating Purchases...`);
        const purchasesCreated = [];

        // Create 5 purchases for current month
        for (let i = 0; i < 5; i++) {
            const vendor = vendors[Math.floor(Math.random() * vendors.length)];
            const service = services[Math.floor(Math.random() * services.length)];

            const purchase = {
                vendorId: vendor._id,
                serviceId: service._id,
                quantity: Math.floor(Math.random() * 5) + 1,
                unitCostForeign: service.costForeign || 4000,
                currency: vendor.defaultCurrency || 'PKR',
                purchaseDate: new Date(2026, 2, Math.floor(Math.random() * 28) + 1).toISOString(),
                notes: `Test purchase ${i + 1} for monthly report`
            };

            try {
                const purchaseRes = await axios.post(`${API_URL}/purchases`, purchase, { headers });
                purchasesCreated.push(purchaseRes.data.data);
                console.log(`  ✓ Purchase ${i + 1} created: ${purchaseRes.data.data.purchaseNumber}`);
            } catch (err) {
                console.log(`  ✗ Purchase ${i + 1} failed:`, err.response?.data?.message);
            }
        }

        console.log(`\n4️⃣ Creating Expenses...`);
        const expensesCreated = [];

        const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Office Supplies'];

        // Create 8 expenses for current month
        for (let i = 0; i < 8; i++) {
            const expense = {
                category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
                description: `Monthly ${expenseCategories[i % 5].toLowerCase()} expense for March 2026`,
                amount: Math.floor(Math.random() * 50000) + 10000,
                expenseDate: new Date(2026, 2, Math.floor(Math.random() * 28) + 1).toISOString(),
                paymentMethod: Math.random() > 0.5 ? 'bank' : 'cash'
            };

            try {
                const expenseRes = await axios.post(`${API_URL}/expenses`, expense, { headers });
                expensesCreated.push(expenseRes.data.data);
                console.log(`  ✓ Expense ${i + 1} created: ${expenseRes.data.data.expenseNumber}`);
            } catch (err) {
                console.log(`  ✗ Expense ${i + 1} failed:`, err.response?.data?.message);
            }
        }

        console.log('\n════════════════════════════════════════════════════════════');
        console.log('🎉 Monthly test data creation completed!');
        console.log(`\n📊 Summary:`);
        console.log(`   Sales Created: ${salesCreated.length}`);
        console.log(`   Purchases Created: ${purchasesCreated.length}`);
        console.log(`   Expenses Created: ${expensesCreated.length}`);
        console.log('\n✅ Visit the Reports page to view monthly reports:');
        console.log('   http://localhost:5173/reports\n');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

createMonthlyTestData();
