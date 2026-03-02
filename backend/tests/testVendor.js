import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testVendor = {
    name: 'Test Vendor Co.',
    country: 'Pakistan',
    defaultCurrency: 'PKR',
    contactPerson: 'John Doe',
    phone: '+92-300-1234567',
    email: 'test@vendor.com',
    address: {
        street: '123 Main Street',
        city: 'Karachi',
        country: 'Pakistan',
        postalCode: '75500'
    },
    paymentTerms: 'Net 30 days',
    notes: 'Test vendor for verification'
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
        if (authToken) {
            console.log('Token:', authToken.substring(0, 20) + '...');
        }
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}

async function createVendor() {
    try {
        console.log('\n2️⃣ Creating Test Vendor...');
        console.log('Payload:', JSON.stringify(testVendor, null, 2));

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

        console.log('✅ Vendor created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.vendor._id;
    } catch (error) {
        console.error('❌ Create vendor failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllVendors() {
    try {
        console.log('\n3️⃣ Fetching All Vendors...');
        const response = await axios.get(
            `${BASE_URL}/vendors?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Vendors fetched successfully');

        const vendors = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total vendors:', pagination.totalRecords);
        console.log('Vendors on this page:', vendors.length);
        console.log('\nVendors List:');
        vendors.forEach((vendor, index) => {
            console.log(`\n  ${index + 1}. ${vendor.name}`);
            console.log(`     ID: ${vendor._id}`);
            console.log(`     Country: ${vendor.country}`);
            console.log(`     Currency: ${vendor.defaultCurrency}`);
            console.log(`     Phone: ${vendor.phone || 'N/A'}`);
            console.log(`     Email: ${vendor.email || 'N/A'}`);
            console.log(`     Total Payable: ${vendor.totalPayable || 0}`);
        });

        return vendors;
    } catch (error) {
        console.error('❌ Fetch vendors failed:', error.response?.data || error.message);
        return [];
    }
}

async function getVendorById(id) {
    try {
        console.log(`\n4️⃣ Fetching Vendor by ID: ${id}`);
        const response = await axios.get(
            `${BASE_URL}/vendors/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Vendor fetched successfully');
        console.log('Vendor Details:', JSON.stringify(response.data.data.vendor, null, 2));
        return response.data.data.vendor;
    } catch (error) {
        console.error('❌ Fetch vendor by ID failed:', error.response?.data || error.message);
        return null;
    }
}

async function deleteVendor(id) {
    try {
        console.log(`\n5️⃣ Deleting Vendor: ${id}`);
        const response = await axios.delete(
            `${BASE_URL}/vendors/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Vendor deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Delete vendor failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Starting Vendor API Tests...\n');
    console.log('='.repeat(60));

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted - login failed');
        return;
    }

    // Create vendor
    const vendorId = await createVendor();
    if (!vendorId) {
        console.log('\n❌ Tests aborted - vendor creation failed');
        return;
    }

    // Get all vendors
    await getAllVendors();

    // Get vendor by ID
    await getVendorById(vendorId);

    // Optional: Delete the test vendor (uncomment to clean up)
    // await deleteVendor(vendorId);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
