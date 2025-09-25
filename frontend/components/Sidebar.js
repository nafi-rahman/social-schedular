// frontend/components/Sidebar.js

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Scheduling Agent', href: '/' },
    { name: 'Product Customizer', href: '/customizer' },
    { name: 'Analytics Dashboard', href: '/dashboard' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="h-screen w-64 bg-gray-900 text-white p-6 flex flex-col shadow-2xl fixed">
            <div className="text-2xl font-extrabold text-blue-400 mb-8 tracking-wider">
                Social Agent
            </div>
            <nav className="space-y-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} legacyBehavior>
                            <a
                                className={`
                                    flex items-center p-3 rounded-lg transition-colors duration-200
                                    ${isActive 
                                        ? 'bg-blue-600 text-white font-bold shadow-md' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                                `}
                            >
                                {item.name}
                            </a>
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-700 text-sm text-gray-500">
                <p>&copy; 2025 AI Agent</p>
            </div>
        </aside>
    );
}