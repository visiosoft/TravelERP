import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function login() {
    try {
        console.log('\n1️⃣ Testing Login...');
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

async function getFirstSale() {
    try {
        const response = await axios.get(`${BASE_URL}/sales`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const sales = response.data.data;
        if (sales && sales.length > 0) {
            const sale = sales[0];
            console.log(`✅ Found sale: ${sale.saleNumber} - Customer: ${sale.customer?.name} - Amount: PKR ${sale.totalAmount}`);
            return sale;
        }
        console.log('⚠️ No sales found in database');
        return null;
    } catch (error) {
        console.error('❌ Failed to fetch sales:', error.response?.data?.message || error.message);
        return null;
    }
}

async function getFirstPurchase() {
    try {
        const response = await axios.get(`${BASE_URL}/purchases`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const purchases = response.data.data;
        if (purchases && purchases.length > 0) {
            const purchase = purchases[0];
            console.log(`✅ Found purchase: ${purchase.purchaseNumber} - Vendor: ${purchase.vendor?.name} - Amount: PKR ${purchase.totalCostPKR}`);
            return purchase;
        }
        console.log('⚠️ No purchases found in database');
        return null;
    } catch (error) {
        console.error('❌ Failed to fetch purchases:', error.response?.data?.message || error.message);
        return null;
    }
}

async function createCustomerPayment(sale) {
    try {
        console.log('\n2️⃣ Creating Customer Payment...');

        // Pay partial amount (half of the total)
        const paymentAmount = Math.floor(sale.totalAmount / 2);

        const paymentData = {
            customerId: sale.customer._id,
            amount: paymentAmount,
            paymentMethod: 'bank',
            paymentDate: new Date().toISOString(),
            reference: 'BANK-TRANSFER-001',
            notes: 'Partial payment for sale'
        };

        console.log('Payload:', JSON.stringify(paymentData, null, 2));

        const response = await axios.post(
            `${BASE_URL}/payments/customer`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Customer payment created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.error('❌ Create customer payment failed:', error.response?.data || error.message);
        return null;
    }
}

async function createVendorPayment(purchase) {
    try {
        console.log('\n3️⃣ Creating Vendor Payment...');

        // Pay partial amount (half of the total)
        const paymentAmount = Math.floor(purchase.totalCostPKR / 2);

        const paymentData = {
            vendorId: purchase.vendor._id,
            amountForeign: paymentAmount,  // Backend expects amountForeign
            currency: 'PKR',
            paymentMethod: 'bank',
            paymentDate: new Date().toISOString(),
            referenceNumber: 'BANK-PAYMENT-001',
            notes: 'Partial payment for purchase'
        };

        console.log('Payload:', JSON.stringify(paymentData, null, 2));

        const response = await axios.post(
            `${BASE_URL}/payments/vendor`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Vendor payment created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.error('❌ Create vendor payment failed:', error.response?.data || error.message);
        return null;
    }
}

async function main() {
    console.log('\n🧪 Creating Test Payment Data');
    console.log('═'.repeat(60));

    if (!await login()) {
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }

    const sale = await getFirstSale();
    const purchase = await getFirstPurchase();

    if (sale) {
        await createCustomerPayment(sale);
    } else {
        console.log('\n⚠️ Skipping customer payment - no sales found');
    }

    if (purchase) {
        await createVendorPayment(purchase);
    } else {
        console.log('\n⚠️ Skipping vendor payment - no purchases found');
    }

    console.log('\n═'.repeat(60));
    console.log('🎉 Payment creation process completed!');
    console.log('\nCheck these pages:');
    console.log('   Customer Payments: http://localhost:5173/payments/customer');
    console.log('   Vendor Payments: http://localhost:5173/payments/vendor\n');
}

main().catch(console.error);
