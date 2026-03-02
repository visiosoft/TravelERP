import api from '@/lib/api';

export interface Purchase {
    _id: string;
    purchaseNumber: string;
    vendor: any;
    service: any;
    quantity: number;
    currency: string;
    unitCostForeign: number;
    totalCostForeign: number;
    exchangeRateSnapshot: number;
    totalCostPKR: number;
    payableAmount: number;
    paidAmount: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    purchaseDate: string;
    invoiceNumber?: string;
    notes?: string;
    createdBy: any;
    createdAt: string;
}

export interface PurchaseFormData {
    vendorId: string;
    serviceId: string;
    quantity?: number;
    currency: string;
    unitCostForeign: number;
    invoiceNumber?: string;
    purchaseDate?: string;
    notes?: string;
}

export const purchaseApi = {
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get('/purchases', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getById: async (id: string): Promise<Purchase> => {
        const { data } = await api.get(`/purchases/${id}`);
        return data.data;
    },

    create: async (purchase: PurchaseFormData): Promise<Purchase> => {
        const { data } = await api.post('/purchases', purchase);
        return data.data;
    },

    update: async (id: string, purchase: Partial<PurchaseFormData>): Promise<Purchase> => {
        const { data } = await api.put(`/purchases/${id}`, purchase);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/purchases/${id}`);
    },
};
