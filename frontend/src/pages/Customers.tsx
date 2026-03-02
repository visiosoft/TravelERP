import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/services/customerService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import CustomerForm from '@/components/forms/CustomerForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Customers() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; customer: any }>({ isOpen: false, customer: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['customers', page],
        queryFn: () => customerApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (customer: any) => {
        setSelectedCustomer(customer);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedCustomer(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
    };

    const handleDeleteClick = (customer: any) => {
        setDeleteDialog({ isOpen: true, customer });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.customer) return;

        setIsDeleting(true);
        try {
            await customerApi.delete(deleteDialog.customer._id);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setDeleteDialog({ isOpen: false, customer: null });
        } catch (error) {
            console.error('Failed to delete customer:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Customer
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((customer: any) => (
                                        <tr key={customer._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{customer.email || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{customer.cnicNo || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">PKR {customer.balance?.toLocaleString() || '0'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(customer)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No customers found. Click "Add Customer" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CustomerForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                customer={selectedCustomer}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, customer: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Customer"
                message={`Are you sure you want to delete ${deleteDialog.customer?.name}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
