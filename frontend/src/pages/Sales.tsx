import { useQuery, useQueryClient } from '@tanstack/react-query';
import { saleApi } from '@/services/saleService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import SaleForm from '@/components/forms/SaleForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Sales() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; sale: any }>({ isOpen: false, sale: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['sales', page],
        queryFn: () => saleApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (sale: any) => {
        setSelectedSale(sale);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedSale(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
    };

    const handleDeleteClick = (sale: any) => {
        setDeleteDialog({ isOpen: true, sale });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.sale) return;

        setIsDeleting(true);
        try {
            await saleApi.delete(deleteDialog.sale._id);
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            setDeleteDialog({ isOpen: false, sale: null });
        } catch (error) {
            console.error('Failed to delete sale:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Sale
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity × Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((sale: any) => (
                                        <tr key={sale._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.saleNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sale.saleDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{sale.customer?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{sale.service?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                Qty: {sale.quantity} × {formatCurrency(sale.sellingPricePKR)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatCurrency(sale.totalAmount || 0)}</td>
                                            <td className="px-6 py-4 text-sm text-green-600 font-medium">
                                                {formatCurrency(sale.profitAmount || 0)}
                                                <div className="text-xs text-gray-500">{sale.profitPercentage?.toFixed(2)}%</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                    sale.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {sale.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(sale)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(sale)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No sales found. Click "New Sale" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SaleForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                sale={selectedSale}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, sale: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Sale"
                message={`Are you sure you want to delete sale ${deleteDialog.sale?.saleNumber}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
