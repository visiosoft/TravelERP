import api from '@/lib/api';

export interface ExchangeRate {
    _id: string;
    currency: string;
    rate: number;
    date: string;
    createdBy: any;
    createdAt: string;
}

export interface ExchangeRateFormData {
    currency: string;
    rate: number;
    date: string;
}

export const exchangeRateApi = {
    getAll: async (params?: { page?: number; limit?: number }) => {
        const { data } = await api.get('/exchange-rates', { params });
        return data.data;
    },

    getById: async (id: string): Promise<ExchangeRate> => {
        const { data } = await api.get(`/exchange-rates/${id}`);
        return data.data;
    },

    create: async (exchangeRate: ExchangeRateFormData): Promise<ExchangeRate> => {
        const { data } = await api.post('/exchange-rates', exchangeRate);
        return data.data;
    },

    update: async (id: string, exchangeRate: Partial<ExchangeRateFormData>): Promise<ExchangeRate> => {
        const { data } = await api.put(`/exchange-rates/${id}`, exchangeRate);
        return data.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/exchange-rates/${id}`);
    },

    getLatest: async (currency: string) => {
        const { data } = await api.get(`/exchange-rates/latest/${currency}`);
        return data.data;
    },
};
