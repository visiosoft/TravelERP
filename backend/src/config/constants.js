// User Roles
export const ROLES = {
    ADMIN: 'Admin',
    ACCOUNTANT: 'Accountant',
    SALES_AGENT: 'SalesAgent',
};

// Service Types
export const SERVICE_TYPES = {
    MAIN: 'main',
    SUB: 'sub',
};

// Payment Status
export const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PARTIAL: 'partial',
    PAID: 'paid',
};

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: 'cash',
    BANK: 'bank',
    TRANSFER: 'transfer',
    CHEQUE: 'cheque',
};

// Account Types for Ledger
export const ACCOUNT_TYPES = {
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    CASH: 'cash',
    BANK: 'bank',
    REVENUE: 'revenue',
    EXPENSE: 'expense',
    CAPITAL: 'capital',
};

// Reference Types for Ledger
export const REFERENCE_TYPES = {
    PURCHASE: 'purchase',
    SALE: 'sale',
    CUSTOMER_PAYMENT: 'customer_payment',
    VENDOR_PAYMENT: 'vendor_payment',
    EXPENSE: 'expense',
    OPENING_BALANCE: 'opening_balance',
};

// Currencies
export const CURRENCIES = {
    PKR: 'PKR',
    USD: 'USD',
    SAR: 'SAR',
    AED: 'AED',
    EUR: 'EUR',
    GBP: 'GBP',
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
    RENT: 'Rent',
    ELECTRICITY: 'Electricity',
    SALARY: 'Salary',
    MARKETING: 'Marketing',
    INTERNET: 'Internet',
    OFFICE_SUPPLIES: 'Office Supplies',
    MAINTENANCE: 'Maintenance',
    MISCELLANEOUS: 'Miscellaneous',
};

// Customer/Vendor Status
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
};

// Transaction Status
export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};
