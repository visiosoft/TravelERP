import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendorService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import VendorForm from '@/components/forms/VendorForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Vendors() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; vendor: any }>({ isOpen: false, vendor: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['vendors', page],
        queryFn: () => vendorApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (vendor: any) => {
        setSelectedVendor(vendor);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedVendor(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
    };

    const handleDeleteClick = (vendor: any) => {
        setDeleteDialog({ isOpen: true, vendor });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.vendor) return;

        setIsDeleting(true);
        try {
            await vendorApi.delete(deleteDialog.vendor._id);
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            setDeleteDialog({ isOpen: false, vendor: null });
        } catch (error) {
            console.error('Failed to delete vendor:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Vendor
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((vendor: any) => (
                                        <tr key={vendor._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.country}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.email || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{vendor.defaultCurrency}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{vendor.defaultCurrency} {vendor.totalPayable?.toLocaleString() || '0'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(vendor)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(vendor)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
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
                                            No vendors found. Click "Add Vendor" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <VendorForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                vendor={selectedVendor}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, vendor: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Vendor"
                message={`Are you sure you want to delete ${deleteDialog.vendor?.name}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
