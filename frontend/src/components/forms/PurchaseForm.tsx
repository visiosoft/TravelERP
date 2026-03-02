import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import { purchaseApi } from '@/services/purchaseService';
import { vendorApi } from '@/services/vendorService';
import { serviceApi } from '@/services/serviceService';

interface PurchaseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    purchase?: any;
}

export default function PurchaseForm({ isOpen, onClose, onSuccess, purchase }: PurchaseFormProps) {
    const [formData, setFormData] = useState({
        vendorId: '',
        serviceId: '',
        quantity: '1',
        currency: 'PKR',
        unitCostForeign: '',
        invoiceNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: vendors } = useQuery({
        queryKey: ['vendors-all'],
        queryFn: () => vendorApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    const { data: services } = useQuery({
        queryKey: ['services-all'],
        queryFn: () => serviceApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    useEffect(() => {
        if (purchase) {
            setFormData({
                vendorId: purchase.vendor?._id || '',
                serviceId: purchase.service?._id || '',
                quantity: purchase.quantity?.toString() || '1',
                currency: purchase.currency || 'PKR',
                unitCostForeign: purchase.unitCostForeign?.toString() || '',
                invoiceNumber: purchase.invoiceNumber || '',
                purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                notes: purchase.notes || '',
            });
        } else {
            setFormData({
                vendorId: '',
                serviceId: '',
                quantity: '1',
                currency: 'PKR',
                unitCostForeign: '',
                invoiceNumber: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
        setError('');
    }, [purchase, isOpen]);

    const selectedVendor = vendors?.items?.find((v: any) => v._id === formData.vendorId);

    useEffect(() => {
        if (selectedVendor && !purchase) {
            setFormData(prev => ({ ...prev, currency: selectedVendor.defaultCurrency || 'PKR' }));
        }
    }, [selectedVendor, purchase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                vendorId: formData.vendorId,
                serviceId: formData.serviceId,
                quantity: Number(formData.quantity),
                currency: formData.currency,
                unitCostForeign: Number(formData.unitCostForeign),
                invoiceNumber: formData.invoiceNumber || undefined,
                purchaseDate: formData.purchaseDate,
                notes: formData.notes || undefined,
            };

            if (purchase) {
                await purchaseApi.update(purchase._id, payload);
            } else {
                await purchaseApi.create(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={purchase ? 'Edit Purchase' : 'Add Purchase'} size="lg">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select vendor...</option>
                            {vendors?.items?.map((vendor: any) => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.name} ({vendor.defaultCurrency})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.serviceId}
                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select service...</option>
                            {services?.items?.map((service: any) => (
                                <option key={service._id} value={service._id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Invoice Number
                        </label>
                        <input
                            type="text"
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Vendor's invoice number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Currency <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.currency}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            title="Currency is set based on vendor's default currency"
                        />
                        <p className="text-xs text-gray-500 mt-1">Based on vendor's currency</p>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Cost <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={formData.unitCostForeign}
                            onChange={(e) => setFormData({ ...formData, unitCostForeign: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Cost per unit in vendor's currency"
                        />
                        {formData.unitCostForeign && formData.quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                                Total: {formData.currency} {(Number(formData.unitCostForeign) * Number(formData.quantity)).toFixed(2)}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional details about this purchase..."
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : purchase ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
