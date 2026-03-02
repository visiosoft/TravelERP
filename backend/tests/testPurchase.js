import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testVendorId = '';
let testServiceId = '';

// Test data
const testService = {
    name: 'Hotel Booking',
    type: 'main',
    description: 'Standard hotel room booking',
    defaultCostPrice: 4000,
    defaultSellingPrice: 5000
};

const testVendor = {
    name: 'Test Hotel Vendor',
    country: 'Pakistan',
    defaultCurrency: 'PKR',
    phone: '+92-300-1111111',
    email: 'hotel@vendor.com'
};

const testPurchase = {
    vendorId: '', // Will be set after vendor creation
    serviceId: '', // Will be set after service creation
    quantity: 2,
    unitCostForeign: 4000,
    currency: 'PKR',
    exchangeRate: 1,
    invoiceNumber: 'INV-TEST-001',
    purchaseDate: new Date().toISOString(),
    notes: 'Test hotel booking purchase'
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

async function createTestVendor() {
    try {
        console.log('\n2️⃣ Creating Test Vendor...');
        const response = await axios.post(
            `${BASE_URL}/vendors`,
            testVendor,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        testVendorId = response.data.data.vendor._id;
        console.log('✅ Test vendor created:', testVendorId);
        return testVendorId;
    } catch (error) {
        console.error('❌ Create vendor failed:', error.response?.data || error.message);
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

async function createPurchase() {
    try {
        console.log('\n4️⃣ Creating Test Purchase...');
        testPurchase.vendorId = testVendorId;
        testPurchase.serviceId = testServiceId;

        console.log('Payload:', JSON.stringify(testPurchase, null, 2));

        const response = await axios.post(
            `${BASE_URL}/purchases`,
            testPurchase,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Purchase created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.purchase._id;
    } catch (error) {
        console.error('❌ Create purchase failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllPurchases() {
    try {
        console.log('\n5️⃣ Fetching All Purchases...');
        const response = await axios.get(
            `${BASE_URL}/purchases?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Purchases fetched successfully');

        const purchases = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total purchases:', pagination.totalRecords);
        console.log('Purchases on this page:', purchases.length);
        console.log('\nPurchases List:');
        purchases.forEach((purchase, index) => {
            console.log(`\n  ${index + 1}. Purchase #${purchase._id.substring(0, 8)}`);
            console.log(`     Vendor: ${purchase.vendor?.name || 'N/A'}`);
            console.log(`     Service: ${purchase.service?.name || 'N/A'}`);
            console.log(`     Quantity: ${purchase.quantity}`);
            console.log(`     Unit Cost: ${purchase.currency} ${purchase.unitCostForeign}`);
            console.log(`     Total: ${purchase.currency} ${purchase.totalCostPKR}`);
            console.log(`     Exchange Rate: ${purchase.exchangeRate}`);
        });

        return purchases;
    } catch (error) {
        console.error('❌ Fetch purchases failed:', error.response?.data || error.message);
        return [];
    }
}

async function getPurchaseById(id) {
    try {
        console.log(`\n6️⃣ Fetching Purchase by ID: ${id}`);
        const response = await axios.get(
            `${BASE_URL}/purchases/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Purchase fetched successfully');
        console.log('Purchase Details:', JSON.stringify(response.data.data.purchase, null, 2));
        return response.data.data.purchase;
    } catch (error) {
        console.error('❌ Fetch purchase by ID failed:', error.response?.data || error.message);
        return null;
    }
}

async function updatePurchase(id) {
    try {
        console.log(`\n7️⃣ Updating Purchase: ${id}`);
        const updatedData = {
            invoiceNumber: 'INV-TEST-001-UPDATED',
            notes: 'Updated test purchase notes'
        };

        const response = await axios.put(
            `${BASE_URL}/purchases/${id}`,
            updatedData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Purchase updated successfully');
        console.log('Updated invoice number:', response.data.data.purchase.invoiceNumber);
        return true;
    } catch (error) {
        console.error('❌ Update purchase failed:', error.response?.data || error.message);
        return false;
    }
}

async function deletePurchase(id) {
    try {
        console.log(`\n8️⃣ Deleting Purchase: ${id}`);
        await axios.delete(
            `${BASE_URL}/purchases/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Purchase deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Delete purchase failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Purchase API Tests...\n');
    console.log('='.repeat(60));

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted - login failed');
        return;
    }

    // Create test vendor
    const vendorId = await createTestVendor();
    if (!vendorId) {
        console.log('\n❌ Tests aborted - vendor creation failed');
        return;
    }

    // Create test service
    const serviceId = await createTestService();
    if (!serviceId) {
        console.log('\n❌ Tests aborted - service creation failed');
        return;
    }

    // Create purchase
    const purchaseId = await createPurchase();
    if (!purchaseId) {
        console.log('\n❌ Tests aborted - purchase creation failed');
        return;
    }

    // Get all purchases
    await getAllPurchases();

    // Get purchase by ID
    await getPurchaseById(purchaseId);

    // Update purchase
    await updatePurchase(purchaseId);

    // Delete purchase (uncomment to clean up)
    // await deletePurchase(purchaseId);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All purchase tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
