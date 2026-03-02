import api from '@/lib/api';

export interface DashboardKPIs {
    todaySales: {
        amount: number;
        count: number;
    };
    cashBalance: number;
    bankBalance: number;
    totalReceivables: number;
    totalPayables: number;
    monthlyProfit: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
}

export interface MonthlyProfitReport {
    month: number;
    year: number;
    revenue?: number;
    totalRevenue?: number;
    cost?: number;
    totalCost?: number;
    grossProfit: number;
    expenses?: number;
    totalExpenses?: number;
    netProfit: number;
    profitMargin: number;
    salesCount: number;
    expenseCount: number;
}

export interface ServiceProfitabilityReport {
    service: any;
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    salesCount: number;
}

export interface CustomerOutstandingReport {
    customers: Array<{
        _id: string;
        name: string;
        phone: string;
        email: string;
        totalReceivable: number;
        totalSales: number;
        totalReceived: number;
    }>;
    totalOutstanding: number;
    customerCount: number;
}

export interface VendorPayableReport {
    vendors: Array<{
        _id: string;
        name: string;
        country: string;
        defaultCurrency: string;
        totalPayable: number;
        totalPurchases: number;
        totalPaid: number;
    }>;
    totalPayable: number;
    vendorCount: number;
}

export const reportApi = {
    getDashboardKPIs: async (): Promise<DashboardKPIs> => {
        const { data } = await api.get('/reports/dashboard');
        return data.data;
    },

    getDailyFinancialSummary: async (date: string) => {
        const { data } = await api.get(`/reports/daily-summary?date=${date}`);
        return data.data;
    },

    getMonthlyProfitReport: async (year: number, month: number): Promise<MonthlyProfitReport> => {
        const { data } = await api.get(`/reports/monthly-profit?year=${year}&month=${month}`);
        return data.data;
    },

    getCustomerOutstandingReport: async (): Promise<CustomerOutstandingReport> => {
        const { data } = await api.get('/reports/customer-outstanding');
        return data.data;
    },

    getVendorPayableReport: async (): Promise<VendorPayableReport> => {
        const { data } = await api.get('/reports/vendor-payable');
        return data.data;
    },

    getServiceProfitabilityReport: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<ServiceProfitabilityReport[]> => {
        const { data } = await api.get('/reports/service-profitability', { params });
        return data.data;
    },

    getCashFlowReport: async (params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        const { data } = await api.get('/reports/cash-flow', { params });
        return data.data;
    },
};
