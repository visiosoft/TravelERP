import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/reportService';
import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Building2,
    FileText,
    Calendar,
    Download,
} from 'lucide-react';

export default function Reports() {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    // Monthly Profit Report
    const { data: monthlyProfit, isLoading: profitLoading } = useQuery({
        queryKey: ['monthly-profit', selectedMonth, selectedYear],
        queryFn: () => reportApi.getMonthlyProfitReport(selectedYear, selectedMonth),
    });

    // Customer Outstanding Report
    const { data: customerOutstanding, isLoading: customerLoading } = useQuery({
        queryKey: ['customer-outstanding'],
        queryFn: () => reportApi.getCustomerOutstandingReport(),
    });

    // Vendor Payable Report
    const { data: vendorPayable, isLoading: vendorLoading } = useQuery({
        queryKey: ['vendor-payable'],
        queryFn: () => reportApi.getVendorPayableReport(),
    });

    // Cash Flow Report (current month)
    const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

    const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
        queryKey: ['cash-flow', startOfMonth, endOfMonth],
        queryFn: () => reportApi.getCashFlowReport({ startDate: startOfMonth, endDate: endOfMonth }),
    });

    const formatCurrency = (amount: number) => {
        return `PKR ${amount?.toLocaleString() || '0'}`;
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

    const exportToCSV = (data: any[], filename: string) => {
        // Simple CSV export
        const csv = data.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>

                {/* Month/Year Selector */}
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index + 1}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Monthly Profit & Loss Report */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Profit & Loss Statement - {months[selectedMonth - 1]} {selectedYear}
                            </h2>
                        </div>
                        <button
                            onClick={() => monthlyProfit && exportToCSV([monthlyProfit], `profit-loss-${selectedMonth}-${selectedYear}`)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {profitLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : monthlyProfit ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Revenue</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(monthlyProfit.revenue || monthlyProfit.totalRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Cost of Sales</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatCurrency(monthlyProfit.cost || monthlyProfit.totalCost)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Gross Profit</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {formatCurrency(monthlyProfit.grossProfit)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Operating Expenses</span>
                                    <span className="text-xl font-bold text-red-600">
                                        {formatCurrency(monthlyProfit.expenses || monthlyProfit.totalExpenses)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                        <span className="text-gray-700 font-bold">Net Profit</span>
                                    </div>
                                    <span className={`text-2xl font-bold ${monthlyProfit.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                        {formatCurrency(monthlyProfit.netProfit)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Profit Margin</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {monthlyProfit.profitMargin}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Total Sales:</span> {monthlyProfit.salesCount || 0} transactions
                                </div>
                                <div>
                                    <span className="font-medium">Total Expenses:</span> {monthlyProfit.expenseCount || 0} entries
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">No data available</div>
                )}
            </div>

            {/* Customer Outstanding Report */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Customer Outstanding Receivables</h2>
                        </div>
                        <button
                            onClick={() => customerOutstanding?.customers && exportToCSV(customerOutstanding.customers, 'customer-outstanding')}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {customerLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : customerOutstanding && customerOutstanding.customers?.length > 0 ? (
                    <div>
                        <div className="p-6 bg-orange-50 border-b border-orange-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Total Outstanding</span>
                                <span className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(customerOutstanding.totalOutstanding)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                {customerOutstanding.customerCount} customers with outstanding balances
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customerOutstanding.customers.map((customer: any) => (
                                        <tr key={customer._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div>{customer.phone}</div>
                                                <div className="text-xs text-gray-500">{customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-900">
                                                {formatCurrency(customer.totalSales)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-green-600">
                                                {formatCurrency(customer.totalReceived)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-orange-600">
                                                {formatCurrency(customer.totalReceivable)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">No outstanding receivables</div>
                )}
            </div>

            {/* Vendor Payable Report */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Vendor Accounts Payable</h2>
                        </div>
                        <button
                            onClick={() => vendorPayable?.vendors && exportToCSV(vendorPayable.vendors, 'vendor-payable')}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {vendorLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : vendorPayable && vendorPayable.vendors?.length > 0 ? (
                    <div>
                        <div className="p-6 bg-red-50 border-b border-red-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Total Payable</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {formatCurrency(vendorPayable.totalPayable)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                {vendorPayable.vendorCount} vendors with outstanding balances
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Purchases</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payable</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vendorPayable.vendors.map((vendor: any) => (
                                        <tr key={vendor._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.country}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.defaultCurrency}</td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-900">
                                                {formatCurrency(vendor.totalPurchases)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-green-600">
                                                {formatCurrency(vendor.totalPaid)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                                                {formatCurrency(vendor.totalPayable)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">No outstanding payables</div>
                )}
            </div>

            {/* Cash Flow Report */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Cash Flow Statement - {months[selectedMonth - 1]} {selectedYear}
                            </h2>
                        </div>
                    </div>
                </div>

                {cashFlowLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : cashFlow ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Cash Inflows */}
                            <div className="bg-green-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Cash Inflows</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Customer Payments</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(cashFlow.cashInflows?.customerPayments || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Sales Revenue</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(cashFlow.cashInflows?.salesRevenue || 0)}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-green-200">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">Total Inflows</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                {formatCurrency(cashFlow.cashInflows?.total || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cash Outflows */}
                            <div className="bg-red-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                    <h3 className="font-semibold text-gray-900">Cash Outflows</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Vendor Payments</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(cashFlow.cashOutflows?.vendorPayments || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Expenses</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(cashFlow.cashOutflows?.expenses || 0)}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-red-200">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">Total Outflows</span>
                                            <span className="font-bold text-red-600 text-lg">
                                                {formatCurrency(cashFlow.cashOutflows?.total || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net Cash Flow */}
                            <div className={`${cashFlow.netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-6`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className={`w-5 h-5 ${cashFlow.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                    <h3 className="font-semibold text-gray-900">Net Cash Flow</h3>
                                </div>
                                <div className="flex flex-col items-center justify-center h-24">
                                    <span className={`text-3xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {formatCurrency(cashFlow.netCashFlow)}
                                    </span>
                                    <span className="text-sm text-gray-600 mt-2">
                                        {cashFlow.netCashFlow >= 0 ? 'Positive' : 'Negative'} Cash Flow
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">No cash flow data available</div>
                )}
            </div>
        </div>
    );
}
