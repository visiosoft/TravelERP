import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/services/paymentService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import VendorPaymentForm from '@/components/forms/VendorPaymentForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function VendorPayments() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; payment: any }>({ isOpen: false, payment: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['vendor-payments', page],
        queryFn: () => paymentApi.getAllVendorPayments({ page, limit: 10 }),
    });

    const handleEdit = (payment: any) => {
        setSelectedPayment(payment);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedPayment(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['vendor-payments'] });
    };

    const handleDeleteClick = (payment: any) => {
        setDeleteDialog({ isOpen: true, payment });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.payment) return;

        setIsDeleting(true);
        try {
            await paymentApi.deleteVendorPayment(deleteDialog.payment._id);
            queryClient.invalidateQueries({ queryKey: ['vendor-payments'] });
            setDeleteDialog({ isOpen: false, payment: null });
        } catch (error) {
            console.error('Failed to delete payment:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Vendor Payments</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Payment
                </button>
            </div>

            <div className="bg-white rounded-lg shadow">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((payment: any) => (
                                        <tr key={payment._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.paymentNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payment.paymentDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{payment.vendor?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(payment.amountForeign, payment.currency)}
                                                <div className="text-xs text-gray-500">PKR {payment.amountPKR?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${payment.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {payment.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {payment.exchangeGainLoss ? (
                                                    <span className={payment.exchangeGainLoss > 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {payment.exchangeGainLoss > 0 ? '+' : ''}{formatCurrency(payment.exchangeGainLoss)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(payment)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(payment)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No vendor payments found. Click "New Payment" to record one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <VendorPaymentForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                payment={selectedPayment}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, payment: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Payment"
                message={`Are you sure you want to delete payment ${deleteDialog.payment?.paymentNumber}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
