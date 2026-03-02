import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import { serviceApi } from '@/services/serviceService';

interface ServiceFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    service?: any;
}

export default function ServiceForm({ isOpen, onClose, onSuccess, service }: ServiceFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'main' as 'main' | 'sub',
        parentService: '',
        description: '',
        defaultPrice: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch all main services for parent selection
    const { data: mainServices } = useQuery({
        queryKey: ['main-services'],
        queryFn: () => serviceApi.getAll({ limit: 1000 }),
        enabled: isOpen,
    });

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || '',
                code: service.code || '',
                type: service.type || 'main',
                parentService: service.parentService?._id || service.parentService || '',
                description: service.description || '',
                defaultPrice: service.defaultPrice || '',
            });
        } else {
            setFormData({
                name: '',
                code: '',
                type: 'main',
                parentService: '',
                description: '',
                defaultPrice: '',
            });
        }
        setError('');
    }, [service, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const payload: any = {
                name: formData.name,
                code: formData.code,
                type: formData.type,
                description: formData.description,
                defaultPrice: formData.defaultPrice ? Number(formData.defaultPrice) : undefined,
            };

            // Only include parentService if type is 'sub'
            if (formData.type === 'sub' && formData.parentService) {
                payload.parentService = formData.parentService;
            }

            if (service) {
                await serviceApi.update(service._id, payload);
            } else {
                await serviceApi.create(payload);
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
        <Modal isOpen={isOpen} onClose={onClose} title={service ? 'Edit Service' : 'Add Service'}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Visa Processing, Hotel Booking"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., VISA-001, HOTEL-002"
                            disabled={!!service}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'main' | 'sub', parentService: '' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="main">Main Service</option>
                            <option value="sub">Sub Service</option>
                        </select>
                    </div>

                    {/* Parent Service Dropdown - Only show for sub-services */}
                    {formData.type === 'sub' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Service <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.parentService}
                                onChange={(e) => setFormData({ ...formData, parentService: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select parent service...</option>
                                {mainServices?.items
                                    ?.filter((s: any) => s.type === 'main')
                                    .map((s: any) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} ({s.code})
                                        </option>
                                    ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Sub-services must belong to a main service
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Price (PKR)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.defaultPrice}
                            onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Service details..."
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
                        {isLoading ? 'Saving...' : service ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
