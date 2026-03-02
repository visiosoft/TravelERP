import { useAuthStore } from '@/store/authStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">
                    Welcome, {user?.name}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <div className="text-sm">
                        <p className="font-medium text-gray-700">{user?.name}</p>
                        <p className="text-gray-500">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </header>
    );
}
