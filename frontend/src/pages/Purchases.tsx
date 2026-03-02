import { useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/services/purchaseService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import PurchaseForm from '@/components/forms/PurchaseForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Purchases() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; purchase: any }>({ isOpen: false, purchase: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['purchases', page],
        queryFn: () => purchaseApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (purchase: any) => {
        setSelectedPurchase(purchase);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedPurchase(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['purchases'] });
    };

    const handleDeleteClick = (purchase: any) => {
        setDeleteDialog({ isOpen: true, purchase });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.purchase) return;

        setIsDeleting(true);
        try {
            await purchaseApi.delete(deleteDialog.purchase._id);
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            setDeleteDialog({ isOpen: false, purchase: null });
        } catch (error) {
            console.error('Failed to delete purchase:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Purchase
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity × Unit Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((purchase: any) => (
                                        <tr key={purchase._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.purchaseNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(purchase.purchaseDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{purchase.vendor?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{purchase.service?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                Qty: {purchase.quantity} × {formatCurrency(purchase.unitCostForeign, purchase.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(purchase.totalCostForeign, purchase.currency)}
                                                <div className="text-xs text-gray-500">PKR {purchase.totalCostPKR?.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${purchase.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                    purchase.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {purchase.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(purchase)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(purchase)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No purchases found. Click "New Purchase" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PurchaseForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                purchase={selectedPurchase}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, purchase: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Purchase"
                message={`Are you sure you want to delete purchase ${deleteDialog.purchase?.purchaseNumber}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
