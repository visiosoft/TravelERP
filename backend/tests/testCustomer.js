import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testCustomer = {
    name: 'Ahmed Khan',
    phone: '+92-321-9876543',
    email: 'ahmed@example.com',
    passportNo: 'AB1234567',
    cnicNo: '42101-1234567-1',
    address: {
        street: '456 Park Avenue',
        city: 'Lahore',
        country: 'Pakistan',
        postalCode: '54000'
    },
    notes: 'VIP customer - frequent traveler'
};

async function login() {
    try {
        console.log('\n1️⃣ Testing Login...');
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@travelagency.com',
            password: 'Admin@123'
        });

        authToken = response.data.data.accessToken;
        console.log('✅ Login successful');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function createCustomer() {
    try {
        console.log('\n2️⃣ Creating Test Customer...');
        console.log('Payload:', JSON.stringify(testCustomer, null, 2));

        const response = await axios.post(
            `${BASE_URL}/customers`,
            testCustomer,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Customer created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.customer._id;
    } catch (error) {
        console.error('❌ Create customer failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllCustomers() {
    try {
        console.log('\n3️⃣ Fetching All Customers...');
        const response = await axios.get(
            `${BASE_URL}/customers?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Customers fetched successfully');

        const customers = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total customers:', pagination.totalRecords);
        console.log('Customers on this page:', customers.length);
        console.log('\nCustomers List:');
        customers.forEach((customer, index) => {
            console.log(`\n  ${index + 1}. ${customer.name}`);
            console.log(`     ID: ${customer._id}`);
            console.log(`     Phone: ${customer.phone}`);
            console.log(`     Email: ${customer.email || 'N/A'}`);
            console.log(`     CNIC: ${customer.cnicNo || 'N/A'}`);
            console.log(`     Balance: PKR ${customer.balance || 0}`);
        });

        return customers;
    } catch (error) {
        console.error('❌ Fetch customers failed:', error.response?.data || error.message);
        return [];
    }
}

async function runTests() {
    console.log('🧪 Starting Customer API Tests...\n');
    console.log('='.repeat(60));

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted - login failed');
        return;
    }

    // Create customer
    const customerId = await createCustomer();
    if (!customerId) {
        console.log('\n❌ Tests aborted - customer creation failed');
        return;
    }

    // Get all customers
    await getAllCustomers();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
