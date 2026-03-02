import api from '@/lib/api';

export interface Customer {
    _id: string;
    code: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    balance: number;
    totalReceivables: number;
    totalSales: number;
    isActive: boolean;
    createdAt: string;
}

export interface CustomerFormData {
    name: string;
    email?: string;
    phone: string;
    address?: string;
}

export const customerApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get('/customers', { params });
        return {
            items: data.data,
            total: data.pagination?.totalRecords || 0,
            page: data.pagination?.currentPage || 1,
            limit: data.pagination?.pageSize || 10
        };
    },

    getById: async (id: string): Promise<Customer> => {
        const { data } = await api.get(`/customers/${id}`);
        return data.data;
    },

    create: async (customer: CustomerFormData): Promise<Customer> => {
        const { data } = await api.post('/customers', customer);
        return data.data;
    },

    update: async (id: string, customer: Partial<CustomerFormData>): Promise<Customer> => {
        const { data } = await api.put(`/customers/${id}`, customer);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },

    getSalesHistory: async (id: string) => {
        const { data } = await api.get(`/customers/${id}/sales`);
        return data.data;
    },

    getPaymentHistory: async (id: string) => {
        const { data } = await api.get(`/customers/${id}/payments`);
        return data.data;
    },
};
