import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    ShoppingCart,
    DollarSign,
    Receipt,
    TrendingUp,
    FileText,
} from 'lucide-react';

interface NavigationItem {
    name: string;
    to: string;
    icon: React.ElementType;
}

interface NavigationGroup {
    title?: string;
    items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
    {
        items: [
            { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Sales Operations',
        items: [
            { name: 'Customers', to: '/customers', icon: Users },
            { name: 'Sales', to: '/sales', icon: DollarSign },
            { name: 'Customer Payments', to: '/payments/customer', icon: Receipt },
        ],
    },
    {
        title: 'Purchase Operations',
        items: [
            { name: 'Vendors', to: '/vendors', icon: Building2 },
            { name: 'Purchases', to: '/purchases', icon: ShoppingCart },
            { name: 'Vendor Payments', to: '/payments/vendor', icon: Receipt },
        ],
    },
    {
        title: 'General',
        items: [
            { name: 'Services', to: '/services', icon: Briefcase },
            { name: 'Expenses', to: '/expenses', icon: TrendingUp },
            { name: 'Reports', to: '/reports', icon: FileText },
        ],
    },
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="h-16 flex items-center justify-center border-b border-gray-200">
                <h1 className="text-xl font-bold text-blue-600">Travel ERP</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                {navigationGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {group.title && (
                            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
}
