import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import { paymentApi } from '@/services/paymentService';
import { customerApi } from '@/services/customerService';
import { saleApi } from '@/services/saleService';

interface CustomerPaymentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    payment?: any;
}

export default function CustomerPaymentForm({ isOpen, onClose, onSuccess, payment }: CustomerPaymentFormProps) {
    const [formData, setFormData] = useState({
        customerId: '',
        saleId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash' as 'cash' | 'bank',
        referenceNumber: '',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: customers } = useQuery({
        queryKey: ['customers-all'],
        queryFn: () => customerApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    const { data: sales } = useQuery({
        queryKey: ['sales-all'],
        queryFn: () => saleApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                customerId: payment.customer?._id || '',
                saleId: payment.sale?._id || '',
                amount: payment.amount || '',
                paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                paymentMethod: payment.paymentMethod || 'cash',
                referenceNumber: payment.referenceNumber || '',
                notes: payment.notes || '',
            });
        } else {
            setFormData({
                customerId: '',
                saleId: '',
                amount: '',
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash',
                referenceNumber: '',
                notes: '',
            });
        }
        setError('');
    }, [payment, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                customerId: formData.customerId,
                saleId: formData.saleId || undefined,
                amount: Number(formData.amount),
                paymentDate: formData.paymentDate,
                paymentMethod: formData.paymentMethod,
                referenceNumber: formData.referenceNumber || undefined,
                notes: formData.notes || undefined,
            };

            if (payment) {
                await paymentApi.updateCustomerPayment(payment._id, payload);
            } else {
                await paymentApi.createCustomerPayment(payload);
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
        <Modal isOpen={isOpen} onClose={onClose} title={payment ? 'Edit Payment Receipt' : 'Add Payment Receipt'}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!!payment}
                        >
                            <option value="">Select customer...</option>
                            {customers?.items?.map((customer: any) => (
                                <option key={customer._id} value={customer._id}>
                                    {customer.name} (Balance: PKR {customer.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Linked Sale (Optional)
                        </label>
                        <select
                            value={formData.saleId}
                            onChange={(e) => setFormData({ ...formData, saleId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">None - General payment</option>
                            {sales?.items
                                ?.filter((sale: any) => sale.customer?._id === formData.customerId)
                                ?.map((sale: any) => (
                                    <option key={sale._id} value={sale._id}>
                                        {sale.saleNumber} - {sale.service?.name} (PKR {sale.totalAmount?.toLocaleString()})
                                    </option>
                                ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Link payment to a specific sale</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (PKR) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.paymentDate}
                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'bank' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                        <input
                            type="text"
                            value={formData.referenceNumber}
                            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Cheque/Transaction ID"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional notes..."
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
                        {isLoading ? 'Saving...' : payment ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
