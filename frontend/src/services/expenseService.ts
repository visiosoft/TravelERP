import api from '@/lib/api';

export interface Expense {
    _id: string;
    expenseNumber: string;
    category: string;
    description: string;
    amount: number;
    expenseDate: string;
    paymentMethod: 'cash' | 'bank';
    notes?: string;
    createdBy: any;
    createdAt: string;
}

export interface ExpenseFormData {
    category: string;
    description: string;
    amount: number;
    expenseDate: string;
    paymentMethod: 'cash' | 'bank';
    notes?: string;
}

export const expenseApi = {
    getAll: async (params?: { page?: number; limit?: number; category?: string }) => {
        const { data } = await api.get('/expenses', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getById: async (id: string): Promise<Expense> => {
        const { data } = await api.get(`/expenses/${id}`);
        return data.data;
    },

    create: async (expense: ExpenseFormData): Promise<Expense> => {
        const { data } = await api.post('/expenses', expense);
        return data.data;
    },

    update: async (id: string, expense: Partial<ExpenseFormData>): Promise<Expense> => {
        const { data } = await api.put(`/expenses/${id}`, expense);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/expenses/${id}`);
    },
};

export const EXPENSE_CATEGORIES = [
    'Salaries',
    'Rent',
    'Utilities',
    'Office Supplies',
    'Marketing',
    'Travel',
    'Maintenance',
    'Insurance',
    'Taxes',
    'Professional Fees',
    'Telecommunications',
    'Entertainment',
    'Other',
];
