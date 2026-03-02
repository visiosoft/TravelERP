import api from '@/lib/api';

export interface Service {
    _id: string;
    code: string;
    name: string;
    type: 'main' | 'sub';
    parentService?: string;
    description?: string;
    isActive: boolean;
    statistics: {
        totalPurchases: number;
        totalSales: number;
        totalProfit: number;
    };
    createdAt: string;
}

export interface ServiceFormData {
    name: string;
    type: 'main' | 'sub';
    parentService?: string;
    description?: string;
}

export const serviceApi = {
    getAll: async (params?: { page?: number; limit?: number; type?: string }) => {
        const { data } = await api.get('/services', { params });
        // Backend returns: { success: true, data: [...], pagination: {...} }
        // Transform to: { items: [...], pagination: {...} }
        return {
            items: data.data || [],
            pagination: data.pagination || {}
        };
    },

    getById: async (id: string): Promise<Service> => {
        const { data } = await api.get(`/services/${id}`);
        return data.data;
    },

    create: async (service: ServiceFormData): Promise<Service> => {
        const { data } = await api.post('/services', service);
        return data.data;
    },

    update: async (id: string, service: Partial<ServiceFormData>): Promise<Service> => {
        const { data } = await api.put(`/services/${id}`, service);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/services/${id}`);
    },

    getMainServices: async () => {
        const { data } = await api.get('/services?type=main&limit=100');
        return data.data.items;
    },
};
