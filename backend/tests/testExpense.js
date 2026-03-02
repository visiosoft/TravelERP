import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testExpense = {
    category: 'Rent',
    description: 'Monthly office rent payment',
    amount: 50000,
    currency: 'PKR',
    expenseDate: new Date().toISOString(),
    paymentMethod: 'bank',
    notes: 'Test expense for office rent'
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

async function createExpense() {
    try {
        console.log('\n2️⃣ Creating Test Expense...');
        console.log('Payload:', JSON.stringify(testExpense, null, 2));

        const response = await axios.post(
            `${BASE_URL}/expenses`,
            testExpense,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Expense created successfully');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data.data.expense._id;
    } catch (error) {
        console.error('❌ Create expense failed:', error.response?.data || error.message);
        return null;
    }
}

async function getAllExpenses() {
    try {
        console.log('\n3️⃣ Fetching All Expenses...');
        const response = await axios.get(
            `${BASE_URL}/expenses?page=1&limit=10`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Expenses fetched successfully');

        const expenses = response.data.data;
        const pagination = response.data.pagination;

        console.log('Total expenses:', pagination.totalRecords);
        console.log('Expenses on this page:', expenses.length);
        console.log('\nExpenses List:');
        expenses.forEach((expense, index) => {
            console.log(`\n  ${index + 1}. ${expense.category}`);
            console.log(`     ID: ${expense._id}`);
            console.log(`     Description: ${expense.description}`);
            console.log(`     Amount: ${expense.currency} ${expense.amount}`);
            console.log(`     Payment Method: ${expense.paymentMethod || 'N/A'}`);
            console.log(`     Date: ${new Date(expense.expenseDate).toLocaleDateString()}`);
        });

        return expenses;
    } catch (error) {
        console.error('❌ Fetch expenses failed:', error.response?.data || error.message);
        return [];
    }
}

async function getExpenseById(id) {
    try {
        console.log(`\n4️⃣ Fetching Expense by ID: ${id}`);
        const response = await axios.get(
            `${BASE_URL}/expenses/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Expense fetched successfully');
        console.log('Expense Details:', JSON.stringify(response.data.data.expense, null, 2));
        return response.data.data.expense;
    } catch (error) {
        console.error('❌ Fetch expense by ID failed:', error.response?.data || error.message);
        return null;
    }
}

async function updateExpense(id) {
    try {
        console.log(`\n5️⃣ Updating Expense: ${id}`);
        const updatedData = {
            amount: 55000,
            notes: 'Updated amount - rent increased'
        };

        const response = await axios.put(
            `${BASE_URL}/expenses/${id}`,
            updatedData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Expense updated successfully');
        console.log('Updated amount:', response.data.data.expense.amount);
        return true;
    } catch (error) {
        console.error('❌ Update expense failed:', error.response?.data || error.message);
        return false;
    }
}

async function deleteExpense(id) {
    try {
        console.log(`\n6️⃣ Deleting Expense: ${id}`);
        await axios.delete(
            `${BASE_URL}/expenses/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Expense deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Delete expense failed:', error.response?.data || error.message);
        return false;
    }
}

async function getExpenseStats() {
    try {
        console.log('\n7️⃣ Fetching Expense Statistics...');
        const response = await axios.get(
            `${BASE_URL}/expenses/stats/summary`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        console.log('✅ Expense stats fetched successfully');
        console.log('Statistics:', JSON.stringify(response.data.data, null, 2));
        return response.data.data;
    } catch (error) {
        console.error('❌ Fetch expense stats failed:', error.response?.data || error.message);
        return null;
    }
}

async function runTests() {
    console.log('🧪 Starting Expense API Tests...\n');
    console.log('='.repeat(60));

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted - login failed');
        return;
    }

    // Create expense
    const expenseId = await createExpense();
    if (!expenseId) {
        console.log('\n❌ Tests aborted - expense creation failed');
        return;
    }

    // Get all expenses
    await getAllExpenses();

    // Get expense by ID
    await getExpenseById(expenseId);

    // Update expense
    await updateExpense(expenseId);

    // Get expense statistics
    await getExpenseStats();

    // Delete expense (uncomment to clean up)
    // await deleteExpense(expenseId);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All expense tests completed!\n');
}

// Run the tests
runTests().catch(console.error);
