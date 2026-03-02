import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import { saleApi } from '@/services/saleService';
import { customerApi } from '@/services/customerService';
import { serviceApi } from '@/services/serviceService';
import { purchaseApi } from '@/services/purchaseService';

interface SaleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sale?: any;
}

export default function SaleForm({ isOpen, onClose, onSuccess, sale }: SaleFormProps) {
    const [formData, setFormData] = useState({
        customerId: '',
        serviceId: '',
        linkedPurchaseId: '',
        quantity: '1',
        sellingPricePKR: '',
        invoiceNumber: '',
        saleDate: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: customers } = useQuery({
        queryKey: ['customers-all'],
        queryFn: () => customerApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    const { data: services } = useQuery({
        queryKey: ['services-all'],
        queryFn: () => serviceApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    const { data: purchases } = useQuery({
        queryKey: ['purchases-all'],
        queryFn: () => purchaseApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    useEffect(() => {
        if (sale) {
            setFormData({
                customerId: sale.customer?._id || '',
                serviceId: sale.service?._id || '',
                linkedPurchaseId: sale.linkedPurchase?._id || '',
                quantity: sale.quantity?.toString() || '1',
                sellingPricePKR: sale.sellingPricePKR?.toString() || '',
                invoiceNumber: sale.invoiceNumber || '',
                saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                notes: sale.notes || '',
            });
        } else {
            setFormData({
                customerId: '',
                serviceId: '',
                linkedPurchaseId: '',
                quantity: '1',
                sellingPricePKR: '',
                invoiceNumber: '',
                saleDate: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
        setError('');
    }, [sale, isOpen]);

    const selectedPurchase = purchases?.items?.find((p: any) => p._id === formData.linkedPurchaseId);

    useEffect(() => {
        if (selectedPurchase && !sale) {
            setFormData(prev => ({
                ...prev,
                serviceId: selectedPurchase.service?._id || '',
            }));
        }
    }, [selectedPurchase, sale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                customerId: formData.customerId,
                serviceId: formData.serviceId,
                linkedPurchaseId: formData.linkedPurchaseId || undefined,
                quantity: Number(formData.quantity),
                sellingPricePKR: Number(formData.sellingPricePKR),
                invoiceNumber: formData.invoiceNumber || undefined,
                saleDate: formData.saleDate,
                notes: formData.notes || undefined,
            };

            if (sale) {
                await saleApi.update(sale._id, payload);
            } else {
                await saleApi.create(payload);
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
        <Modal isOpen={isOpen} onClose={onClose} title={sale ? 'Edit Sale' : 'Add Sale'} size="lg">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select customer...</option>
                            {customers?.items?.map((customer: any) => (
                                <option key={customer._id} value={customer._id}>
                                    {customer.name} {customer.phone ? `(${customer.phone})` : ''}
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
                            Sale Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.saleDate}
                            onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
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
                            placeholder="Your invoice number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Linked Purchase (Optional)
                        </label>
                        <select
                            value={formData.linkedPurchaseId}
                            onChange={(e) => setFormData({ ...formData, linkedPurchaseId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">None - Direct sale</option>
                            {purchases?.items?.map((purchase: any) => (
                                <option key={purchase._id} value={purchase._id}>
                                    {purchase.purchaseNumber} - {purchase.service?.name} (PKR {purchase.totalCostPKR?.toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Link to a purchase for profit calculation</p>
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

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Selling Price per Unit (PKR) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={formData.sellingPricePKR}
                            onChange={(e) => setFormData({ ...formData, sellingPricePKR: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Price per unit in PKR"
                        />
                        {formData.sellingPricePKR && formData.quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                                Total Amount: PKR {(Number(formData.sellingPricePKR) * Number(formData.quantity)).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {selectedPurchase && selectedPurchase.totalCostPKR && (
                                    <span className="ml-2 text-green-600">
                                        | Profit: PKR {((Number(formData.sellingPricePKR) * Number(formData.quantity)) - selectedPurchase.totalCostPKR).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                )}
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
                            placeholder="Additional details about this sale..."
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
                        {isLoading ? 'Saving...' : sale ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
