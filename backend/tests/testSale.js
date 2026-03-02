import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testCustomerId = '';
let testServiceId = '';
let testPurchaseId = '';

// Test data
const testCustomer = {
    name: 'Sara Ali',
    phone: '+92-333-9999999',
    email: 'sara@example.com',
    cnicNo: '42301-1111111-1'
};

const testService = {
    name: 'Flight Ticket - Karachi to Dubai',
    type: 'main',
    description: 'Economy class ticket',
    defaultCostPrice: 20000,
    defaultSellingPrice: 35000
};

const testSale = {
    customerId: '', // Will be set after customer creation
    serviceId: '', // Will be set after service creation
    // linkedPurchaseId: optional, only if linking to a purchase
    quantity: 1,
    sellingPricePKR: 35000,
    invoiceNumber: 'SALE-TEST-001',
    saleDate: new Date().toISOString(),
    notes: 'Test flight booking sale without linked purchase'
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

async function createTestService() {
    try {
        console.log('\n3️⃣ Creating Test Service...');
        const response = await axios.post(
            `${BASE_URL}/services`,
            testService,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        testServiceId = response.data.data.service._id;
        console.log('✅ Test service created:', testServiceId);
        return testServiceId;
    } catch (error) {
        console.error('❌ Create service failed:', error.response?.data || error.message);
        return null;
    }
}

async function createSale() {
    try {
        console.log('\n4️⃣ Creating Test Sale...');
        testSale.customerId = testCustomerId;
        testSale.serviceId = testServiceId;

        console.log('Payload:', JSON.stringify(testSale, null, 2));

        const response = await axios.post(
            `${BASE_URL}/sales`,
            testSale,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Sale created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.sale._id;
    } catch (error) {
        console.error('❌ Create sale failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllSales() {
    try {
        console.log('\n5️⃣ Fetching All Sales...');
        const response = await axios.get(
            `${BASE_URL}/sales?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Sales fetched successfully');

        const sales = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total sales:', pagination.totalRecords);
        console.log('Sales on this page:', sales.length);
        console.log('\nSales List:');
        sales.forEach((sale, index) => {
            console.log(`\n  ${index + 1}. Sale #${sale._id.substring(0, 8)}`);
            console.log(`     Customer: ${sale.customer?.name || 'N/A'}`);
            console.log(`     Service: ${sale.service?.name || 'N/A'}`);
            console.log(`     Quantity: ${sale.quantity}`);
            console.log(`     Selling Price: PKR ${sale.sellingPricePKR}`);
            console.log(`     Total: PKR ${sale.totalRevenuePKR}`);
            console.log(`     Profit: PKR ${sale.profitPKR || 0}`);
        });

        return sales;
    } catch (error) {
        console.error('❌ Fetch sales failed:', error.response?.data || error.message);
        return [];
    }
}

async function getSaleById(id) {
    try {
        console.log(`\n6️⃣ Fetching Sale by ID: ${id}`);
        const response = await axios.get(
            `${BASE_URL}/sales/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Sale fetched successfully');
        console.log('Sale Details:', JSON.stringify(response.data.data.sale, null, 2));
        return response.data.data.sale;
    } catch (error) {
        console.error('❌ Fetch sale by ID failed:', error.response?.data || error.message);
        return null;
    }
}

async function updateSale(id) {
    try {
        console.log(`\n7️⃣ Updating Sale: ${id}`);
        const updatedData = {
            invoiceNumber: 'SALE-TEST-001-UPDATED',
            notes: 'Updated test sale notes'
        };

        const response = await axios.put(
            `${BASE_URL}/sales/${id}`,
            updatedData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Sale updated successfully');
        console.log('Updated invoice number:', response.data.data.sale.invoiceNumber);
        return true;
    } catch (error) {
        console.error('❌ Update sale failed:', error.response?.data || error.message);
        return false;
    }
}

async function deleteSale(id) {
    try {
        console.log(`\n8️⃣ Deleting Sale: ${id}`);
        await axios.delete(
            `${BASE_URL}/sales/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Sale deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Delete sale failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Sale API Tests...\n');
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

    // Create test service
    const serviceId = await createTestService();
    if (!serviceId) {
        console.log('\n❌ Tests aborted - service creation failed');
        return;
    }

    // Create sale
    const saleId = await createSale();
    if (!saleId) {
        console.log('\n❌ Tests aborted - sale creation failed');
        return;
    }

    // Get all sales
    await getAllSales();

    // Get sale by ID
    await getSaleById(saleId);

    // Update sale
    await updateSale(saleId);

    // Delete sale (uncomment to clean up)
    // await deleteSale(saleId);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All sale tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
