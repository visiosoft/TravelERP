import api from '@/lib/api';

export interface Sale {
    _id: string;
    saleNumber: string;
    customer: any;
    linkedPurchase: any;
    service: any;
    quantity: number;
    sellingPricePKR: number;
    totalAmount: number;
    costPKR: number;
    profitAmount: number;
    profitPercentage: number;
    receivableAmount: number;
    receivedAmount: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    saleDate: string;
    invoiceNumber?: string;
    notes?: string;
    createdBy: any;
    createdAt: string;
}

export interface SaleFormData {
    customerId: string;
    serviceId: string;
    linkedPurchaseId?: string;
    quantity?: number;
    sellingPricePKR: number;
    invoiceNumber?: string;
    saleDate?: string;
    notes?: string;
}

export const saleApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get('/sales', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getById: async (id: string): Promise<Sale> => {
        const { data } = await api.get(`/sales/${id}`);
        return data.data;
    },

    create: async (sale: SaleFormData): Promise<Sale> => {
        const { data } = await api.post('/sales', sale);
        return data.data;
    },

    update: async (id: string, sale: Partial<SaleFormData>): Promise<Sale> => {
        const { data } = await api.put(`/sales/${id}`, sale);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/sales/${id}`);
    },

    getAvailablePurchases: async () => {
        const { data } = await api.get('/purchases?paymentStatus=paid&limit=100');
        return data.data.items;
    },
};
