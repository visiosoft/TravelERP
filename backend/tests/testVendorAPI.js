import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testVendorAPI() {
    console.log('\n🧪 Testing Vendor API');
    console.log('════════════════════════════════════════════════════════════\n');

    try {
        // Login first
        console.log('1️⃣ Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@travelagency.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.data.accessToken;
        console.log('✅ Login successful');
        console.log('');

        // Test vendor endpoint
        console.log('2️⃣ Fetching vendors...');
        const vendorRes = await axios.get(`${API_URL}/vendors?page=1&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Vendor API Response:', JSON.stringify(vendorRes.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testVendorAPI();
