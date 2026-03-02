import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { vendorApi } from '@/services/vendorService';

interface VendorFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vendor?: any;
}

export default function VendorForm({ isOpen, onClose, onSuccess, vendor }: VendorFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        defaultCurrency: 'PKR',
        contactPerson: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            country: '',
            postalCode: '',
        },
        paymentTerms: '',
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                country: vendor.country || '',
                defaultCurrency: vendor.defaultCurrency || 'PKR',
                contactPerson: vendor.contactPerson || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                address: {
                    street: vendor.address?.street || '',
                    city: vendor.address?.city || '',
                    country: vendor.address?.country || '',
                    postalCode: vendor.address?.postalCode || '',
                },
                paymentTerms: vendor.paymentTerms || '',
                notes: vendor.notes || '',
            });
        } else {
            setFormData({
                name: '',
                country: '',
                defaultCurrency: 'PKR',
                contactPerson: '',
                phone: '',
                email: '',
                address: {
                    street: '',
                    city: '',
                    country: '',
                    postalCode: '',
                },
                paymentTerms: '',
                notes: '',
            });
        }
        setError('');
    }, [vendor, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (vendor) {
                await vendorApi.update(vendor._id, formData);
            } else {
                await vendorApi.create(formData);
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
        <Modal isOpen={isOpen} onClose={onClose} title={vendor ? 'Edit Vendor' : 'Add Vendor'} size="lg">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor Name <span className="text-red-500">*</span>
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
                            Country <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Pakistan, UAE, Saudi Arabia"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Currency <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.defaultCurrency}
                            onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!!vendor}
                        >
                            <option value="PKR">PKR - Pakistani Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="AED">AED - UAE Dirham</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                            type="text"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
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

                    <div className="col-span-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Address Details</h4>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Country</label>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        <input
                            type="text"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Net 30 days"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional vendor notes..."
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
                        {isLoading ? 'Saving...' : vendor ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
