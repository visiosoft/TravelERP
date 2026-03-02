import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceApi } from '@/services/serviceService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import ServiceForm from '@/components/forms/ServiceForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Services() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; service: any }>({ isOpen: false, service: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['services', page],
        queryFn: () => serviceApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (service: any) => {
        setSelectedService(service);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedService(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['services'] });
    };

    const handleDeleteClick = (service: any) => {
        setDeleteDialog({ isOpen: true, service });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.service) return;

        setIsDeleting(true);
        try {
            await serviceApi.delete(deleteDialog.service._id);
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setDeleteDialog({ isOpen: false, service: null });
        } catch (error) {
            console.error('Failed to delete service:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Service
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((service: any) => (
                                        <tr key={service._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{service.code}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded-full text-xs ${service.type === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {service.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">PKR {service.statistics?.totalSales?.toLocaleString() || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">PKR {service.statistics?.totalProfit?.toLocaleString() || 0}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(service)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
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
                                            No services found. Click "Add Service" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ServiceForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                service={selectedService}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, service: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Service"
                message={`Are you sure you want to delete ${deleteDialog.service?.name}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
