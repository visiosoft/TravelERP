import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import { paymentApi } from '@/services/paymentService';
import { vendorApi } from '@/services/vendorService';

interface VendorPaymentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    payment?: any;
}

export default function VendorPaymentForm({ isOpen, onClose, onSuccess, payment }: VendorPaymentFormProps) {
    const [formData, setFormData] = useState({
        vendor: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash' as 'cash' | 'bank',
        referenceNumber: '',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { data: vendors } = useQuery({
        queryKey: ['vendors-all'],
        queryFn: () => vendorApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                vendor: payment.vendor?._id || '',
                amount: payment.amountForeign || '',
                paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                paymentMethod: payment.paymentMethod || 'cash',
                referenceNumber: payment.referenceNumber || '',
                notes: payment.notes || '',
            });
        } else {
            setFormData({
                vendor: '',
                amount: '',
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash',
                referenceNumber: '',
                notes: '',
            });
        }
        setError('');
    }, [payment, isOpen]);

    const selectedVendor = vendors?.items?.find((v: any) => v._id === formData.vendor);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload = {
                vendorId: formData.vendor,
                amountForeign: Number(formData.amount),
                currency: selectedVendor?.defaultCurrency || 'PKR',
                paymentMethod: formData.paymentMethod,
                referenceNumber: formData.referenceNumber,
                paymentDate: formData.paymentDate,
                notes: formData.notes,
            };

            if (payment) {
                await paymentApi.updateVendorPayment(payment._id, payload);
            } else {
                await paymentApi.createVendorPayment(payload);
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
        <Modal isOpen={isOpen} onClose={onClose} title={payment ? 'Edit Payment Voucher' : 'Add Payment Voucher'}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.vendor}
                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!!payment}
                        >
                            <option value="">Select vendor...</option>
                            {vendors?.items?.map((vendor: any) => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.name} ({vendor.defaultCurrency}) - Payable: {vendor.defaultCurrency} {vendor.totalPayable?.toLocaleString() || '0'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount {selectedVendor && `(${selectedVendor.defaultCurrency})`} <span className="text-red-500">*</span>
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
                        {selectedVendor && selectedVendor.defaultCurrency !== 'PKR' && (
                            <p className="text-xs text-gray-500 mt-1">
                                Amount will be converted to PKR using current exchange rate
                            </p>
                        )}
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
