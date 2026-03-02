import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '@/services/expenseService';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import ExpenseForm from '@/components/forms/ExpenseForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function Expenses() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; expense: any }>({ isOpen: false, expense: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['expenses', page],
        queryFn: () => expenseApi.getAll({ page, limit: 10 }),
    });

    const handleEdit = (expense: any) => {
        setSelectedExpense(expense);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedExpense(null);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
    };

    const handleDeleteClick = (expense: any) => {
        setDeleteDialog({ isOpen: true, expense });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.expense) return;

        setIsDeleting(true);
        try {
            await expenseApi.delete(deleteDialog.expense._id);
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setDeleteDialog({ isOpen: false, expense: null });
        } catch (error) {
            console.error('Failed to delete expense:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Expense
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data?.items?.length > 0 ? (
                                    data.items.map((expense: any) => (
                                        <tr key={expense._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.expenseNumber}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(expense.expenseDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{expense.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{expense.description}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(expense.amount)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs ${expense.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {expense.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => handleEdit(expense)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(expense)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
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
                                            No expenses found. Click "Add Expense" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ExpenseForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleFormSuccess}
                expense={selectedExpense}
            />

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, expense: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Expense"
                message={`Are you sure you want to delete this expense (${deleteDialog.expense?.expenseNumber})? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
