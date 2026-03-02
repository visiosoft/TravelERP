import api from '@/lib/api';

export interface Vendor {
    _id: string;
    code: string;
    name: string;
    email?: string;
    phone: string;
    address?: string;
    currency: string;
    balance: number;
    totalPayables: number;
    totalPurchases: number;
    isActive: boolean;
    createdAt: string;
}

export interface VendorFormData {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    currency: string;
}

export const vendorApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get('/vendors', { params });
        return {
            items: data.data,
            total: data.pagination?.totalRecords || 0,
            page: data.pagination?.currentPage || 1,
            limit: data.pagination?.pageSize || 10
        };
    },

    getById: async (id: string): Promise<Vendor> => {
        const { data } = await api.get(`/vendors/${id}`);
        return data.data;
    },

    create: async (vendor: VendorFormData): Promise<Vendor> => {
        const { data } = await api.post('/vendors', vendor);
        return data.data;
    },

    update: async (id: string, vendor: Partial<VendorFormData>): Promise<Vendor> => {
        const { data } = await api.put(`/vendors/${id}`, vendor);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/vendors/${id}`);
    },

    getPurchaseHistory: async (id: string) => {
        const { data } = await api.get(`/vendors/${id}/purchases`);
        return data.data;
    },

    getPaymentHistory: async (id: string) => {
        const { data } = await api.get(`/vendors/${id}/payments`);
        return data.data;
    },
};
