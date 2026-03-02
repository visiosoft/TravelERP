import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    TrendingUp,
    Users,
    Building2,
    DollarSign,
    CreditCard,
} from 'lucide-react';

export default function Dashboard() {
    const { data: kpis, isLoading } = useQuery({
        queryKey: ['dashboard-kpis'],
        queryFn: async () => {
            const { data } = await api.get('/reports/dashboard');
            return data.data;
        },
    });

    if (isLoading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    const stats = [
        {
            name: "Today's Sales",
            value: `PKR ${kpis?.todaySales.amount.toLocaleString() || 0}`,
            change: `${kpis?.todaySales.count || 0} transactions`,
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            name: 'Cash Balance',
            value: `PKR ${kpis?.cashBalance.toLocaleString() || 0}`,
            icon: CreditCard,
            color: 'bg-blue-500',
        },
        {
            name: 'Bank Balance',
            value: `PKR ${kpis?.bankBalance.toLocaleString() || 0}`,
            icon: CreditCard,
            color: 'bg-purple-500',
        },
        {
            name: 'Total Receivables',
            value: `PKR ${kpis?.totalReceivables.toLocaleString() || 0}`,
            icon: Users,
            color: 'bg-orange-500',
        },
        {
            name: 'Total Payables',
            value: `PKR ${kpis?.totalPayables.toLocaleString() || 0}`,
            icon: Building2,
            color: 'bg-red-500',
        },
        {
            name: 'Monthly Profit',
            value: `PKR ${kpis?.monthlyProfit.toLocaleString() || 0}`,
            icon: TrendingUp,
            color: 'bg-emerald-500',
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {stat.value}
                                </p>
                                {stat.change && (
                                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                                )}
                            </div>
                            <div className={`${stat.color} p-3 rounded-full`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Monthly Revenue vs Expenses
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-semibold text-green-600">
                                PKR {kpis?.monthlyRevenue.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Expenses:</span>
                            <span className="font-semibold text-red-600">
                                PKR {kpis?.monthlyExpenses.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                            <span className="text-gray-900 font-medium">Net Profit:</span>
                            <span className="font-bold text-blue-600">
                                PKR {kpis?.monthlyProfit.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
