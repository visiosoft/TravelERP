import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@travelagency.com',
            password: 'Admin@123'
        });
        authToken = response.data.data.accessToken;
        console.log('✅ Login successful\n');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return false;
    }
}

async function fetchData(endpoint, label) {
    try {
        const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = response.data.data;
        const items = data.items || data.data || data;
        const count = Array.isArray(items) ? items.length : 0;

        console.log(`\n📊 ${label}: ${count} records`);
        console.log('═'.repeat(60));

        if (count > 0) {
            items.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. ${formatItem(item, endpoint)}`);
            });
            if (count > 5) {
                console.log(`   ... and ${count - 5} more`);
            }
        } else {
            console.log('   (No records found)');
        }

        return count;
    } catch (error) {
        console.error(`❌ Failed to fetch ${label}:`, error.response?.data?.message || error.message);
        return 0;
    }
}

function formatItem(item, endpoint) {
    switch (endpoint) {
        case 'customers':
            return `${item.name} - ${item.email} - Balance: PKR ${item.balance || 0}`;
        case 'vendors':
            return `${item.name} - ${item.country} - Payable: PKR ${item.totalPayable || 0}`;
        case 'services':
            return `${item.name} (${item.type}) - Cost: ${item.defaultCostPrice} / Sell: ${item.defaultSellingPrice}`;
        case 'sales':
            return `${item.saleNumber} - Customer: ${item.customer?.name || 'N/A'} - Total: PKR ${item.totalAmount}`;
        case 'purchases':
            return `${item.purchaseNumber} - Vendor: ${item.vendor?.name || 'N/A'} - Total: PKR ${item.totalCostPKR}`;
        case 'expenses':
            return `${item.category} - ${item.description} - Amount: PKR ${item.amount}`;
        case 'ledgers':
            return `${item.accountType} - Debit: ${item.debit} / Credit: ${item.credit} - ${item.description}`;
        default:
            return JSON.stringify(item).slice(0, 100);
    }
}

async function main() {
    console.log('\n🔍 Database Content Viewer');
    console.log('═'.repeat(60));

    if (!await login()) {
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }

    const totals = {
        customers: await fetchData('customers', 'CUSTOMERS'),
        vendors: await fetchData('vendors', 'VENDORS'),
        services: await fetchData('services', 'SERVICES'),
        sales: await fetchData('sales', 'SALES'),
        purchases: await fetchData('purchases', 'PURCHASES'),
        expenses: await fetchData('expenses', 'EXPENSES'),
        ledgers: await fetchData('ledgers', 'LEDGER ENTRIES')
    };

    console.log('\n\n📈 SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Customers:      ${totals.customers}`);
    console.log(`Total Vendors:        ${totals.vendors}`);
    console.log(`Total Services:       ${totals.services}`);
    console.log(`Total Sales:          ${totals.sales}`);
    console.log(`Total Purchases:      ${totals.purchases}`);
    console.log(`Total Expenses:       ${totals.expenses}`);
    console.log(`Total Ledger Entries: ${totals.ledgers}`);
    console.log('═'.repeat(60));

    console.log('\n✅ View this data in your browser:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   - Sales: http://localhost:5173/sales');
    console.log('   - Purchases: http://localhost:5173/purchases');
    console.log('   - Expenses: http://localhost:5173/expenses');
    console.log('   - Customers: http://localhost:5173/customers');
    console.log('   - Vendors: http://localhost:5173/vendors');
    console.log('\n');
}

main().catch(console.error);
