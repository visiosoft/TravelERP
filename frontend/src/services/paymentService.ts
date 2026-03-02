import api from '@/lib/api';

export interface CustomerPayment {
    _id: string;
    paymentNumber: string;
    customer: any;
    amount: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'bank';
    reference?: string;
    notes?: string;
    createdBy: any;
    createdAt: string;
}

export interface VendorPayment {
    _id: string;
    paymentNumber: string;
    vendor: any;
    currency: string;
    amountForeign: number;
    exchangeRateUsed: number;
    amountPKR: number;
    exchangeGainLoss?: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'bank';
    referenceNumber?: string;
    notes?: string;
    createdBy: any;
    createdAt: string;
}

export interface CustomerPaymentFormData {
    customerId: string;
    saleId?: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'bank';
    referenceNumber?: string;
    notes?: string;
}

export interface VendorPaymentFormData {
    vendorId: string;
    currency: string;
    amountForeign: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'bank';
    referenceNumber?: string;
    notes?: string;
}

export const paymentApi = {
    // Customer Payments
    getAllCustomerPayments: async (params?: { page?: number; limit?: number }) => {
        const { data } = await api.get('/payments/customer', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getCustomerPaymentById: async (id: string): Promise<CustomerPayment> => {
        const { data } = await api.get(`/payments/customer/${id}`);
        return data.data;
    },

    createCustomerPayment: async (payment: CustomerPaymentFormData): Promise<CustomerPayment> => {
        const { data } = await api.post('/payments/customer', payment);
        return data.data;
    },

    updateCustomerPayment: async (id: string, payment: CustomerPaymentFormData): Promise<CustomerPayment> => {
        const { data } = await api.put(`/payments/customer/${id}`, payment);
        return data.data;
    },

    deleteCustomerPayment: async (id: string): Promise<void> => {
        await api.delete(`/payments/customer/${id}`);
    },

    // Vendor Payments
    getAllVendorPayments: async (params?: { page?: number; limit?: number }) => {
        const { data } = await api.get('/payments/vendor', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getVendorPaymentById: async (id: string): Promise<VendorPayment> => {
        const { data } = await api.get(`/payments/vendor/${id}`);
        return data.data;
    },

    createVendorPayment: async (payment: VendorPaymentFormData): Promise<VendorPayment> => {
        const { data } = await api.post('/payments/vendor', payment);
        return data.data;
    },

    updateVendorPayment: async (id: string, payment: VendorPaymentFormData): Promise<VendorPayment> => {
        const { data } = await api.put(`/payments/vendor/${id}`, payment);
        return data.data;
    },

    deleteVendorPayment: async (id: string): Promise<void> => {
        await api.delete(`/payments/vendor/${id}`);
    },
};
