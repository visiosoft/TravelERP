import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { customerApi } from '@/services/customerService';

interface CustomerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: any;
}

export default function CustomerForm({ isOpen, onClose, onSuccess, customer }: CustomerFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        passportNo: '',
        cnicNo: '',
        address: {
            street: '',
            city: '',
            country: '',
            postalCode: '',
        },
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                passportNo: customer.passportNo || '',
                cnicNo: customer.cnicNo || '',
                address: {
                    street: customer.address?.street || '',
                    city: customer.address?.city || '',
                    country: customer.address?.country || '',
                    postalCode: customer.address?.postalCode || '',
                },
                notes: customer.notes || '',
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                email: '',
                passportNo: '',
                cnicNo: '',
                address: {
                    street: '',
                    city: '',
                    country: '',
                    postalCode: '',
                },
                notes: '',
            });
        }
        setError('');
    }, [customer, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (customer) {
                await customerApi.update(customer._id, formData);
            } else {
                await customerApi.create(formData);
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
        <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Edit Customer' : 'Add Customer'} size="lg">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passport No</label>
                        <input
                            type="text"
                            value={formData.passportNo}
                            onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNIC No</label>
                        <input
                            type="text"
                            value={formData.cnicNo}
                            onChange={(e) => setFormData({ ...formData, cnicNo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 12345-1234567-1"
                        />
                    </div>

                    <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 mt-2">Address Details</h4>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                        <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Street address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            value={formData.address.country}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <input
                            type="text"
                            value={formData.address.postalCode}
                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional customer notes..."
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
                        {isLoading ? 'Saving...' : customer ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
