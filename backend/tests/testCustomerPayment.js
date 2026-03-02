import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testCustomerId = '';

// Test data
const testCustomer = {
    name: 'Bilal Ahmed',
    phone: '+92-345-7777777',
    email: 'bilal@example.com',
    cnicNo: '42501-8888888-1'
};

const testPayment = {
    customerId: '', // Will be set after customer creation
    amount: 15000,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString(),
    notes: 'Test payment received from customer'
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

async function createTestCustomer() {
    try {
        console.log('\n2️⃣ Creating Test Customer...');
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

        testCustomerId = response.data.data.customer._id;
        console.log('✅ Test customer created:', testCustomerId);
        return testCustomerId;
    } catch (error) {
        console.error('❌ Create customer failed:', error.response?.data || error.message);
        return null;
    }
}

async function createPayment() {
    try {
        console.log('\n3️⃣ Creating Test Customer Payment...');
        testPayment.customerId = testCustomerId;

        console.log('Payload:', JSON.stringify(testPayment, null, 2));

        const response = await axios.post(
            `${BASE_URL}/payments/customer`,
            testPayment,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Customer payment created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.payment._id;
    } catch (error) {
        console.error('❌ Create payment failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllPayments() {
    try {
        console.log('\n4️⃣ Fetching All Customer Payments...');
        const response = await axios.get(
            `${BASE_URL}/payments/customer?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Customer payments fetched successfully');

        const payments = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total payments:', pagination.totalRecords);
        console.log('Payments on this page:', payments.length);
        console.log('\nPayments List:');
        payments.forEach((payment, index) => {
            console.log(`\n  ${index + 1}. Payment #${payment._id.substring(0, 8)}`);
            console.log(`     Customer: ${payment.customer?.name || 'N/A'}`);
            console.log(`     Amount: ${payment.currency} ${payment.amount}`);
            console.log(`     Method: ${payment.paymentMethod}`);
            console.log(`     Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
        });

        return payments;
    } catch (error) {
        console.error('❌ Fetch payments failed:', error.response?.data || error.message);
        return [];
    }
}

async function getPaymentById(id) {
    try {
        console.log(`\n5️⃣ Fetching Payment by ID: ${id}`);
        const response = await axios.get(
            `${BASE_URL}/payments/customer/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Payment fetched successfully');
        console.log('Payment Details:', JSON.stringify(response.data.data.payment, null, 2));
        return response.data.data.payment;
    } catch (error) {
        console.error('❌ Fetch payment by ID failed:', error.response?.data || error.message);
        return null;
    }
}

async function updatePayment(id) {
    try {
        console.log(`\n6️⃣ Updating Payment: ${id}`);
        const updatedData = {
            amount: 18000,
            notes: 'Updated payment amount'
        };

        const response = await axios.put(
            `${BASE_URL}/payments/customer/${id}`,
            updatedData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Payment updated successfully');
        console.log('Updated amount:', response.data.data.payment.amount);
        return true;
    } catch (error) {
        console.error('❌ Update payment failed:', error.response?.data || error.message);
        return false;
    }
}

async function deletePayment(id) {
    try {
        console.log(`\n7️⃣ Deleting Payment: ${id}`);
        await axios.delete(
            `${BASE_URL}/payments/customer/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Payment deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Delete payment failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Customer Payment API Tests...\n');
    console.log('⚠️  NOTE: Customer payments require existing sales/receivables');
    console.log('    This test will fail if customer has no outstanding balance\n');
    console.log('='.repeat(60));

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted - login failed');
        return;
    }

    // Create test customer
    const customerId = await createTestCustomer();
    if (!customerId) {
        console.log('\n❌ Tests aborted - customer creation failed');
        return;
    }

    // Create payment
    const paymentId = await createPayment();
    if (!paymentId) {
        console.log('\n❌ Tests aborted - payment creation failed');
        return;
    }

    // Get all payments
    await getAllPayments();

    // Get payment by ID
    await getPaymentById(paymentId);

    // Update payment
    await updatePayment(paymentId);

    // Delete payment (uncomment to clean up)
    // await deletePayment(paymentId);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All customer payment tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
