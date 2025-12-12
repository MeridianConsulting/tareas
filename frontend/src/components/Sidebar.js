// components/Sidebar.js
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../lib/auth';

export default function Sidebar({ user, isOpen, onToggle }) {
  const router = useRouter();
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  if (user?.role === 'admin' || user?.role === 'gerencia' || user?.role === 'lider_area') {
    menuItems.push({ href: '/reports/daily', label: 'Reportes diarios', icon: '📅' });
  }

  if (user?.role === 'admin' || user?.role === 'gerencia') {
    menuItems.push({ href: '/reports/management', label: 'Dashboard gerencial', icon: '📈' });
  }

  if (user?.role === 'admin') {
    menuItems.push(
      { href: '/admin/areas', label: 'Áreas', icon: '🏢' },
      { href: '/admin/users', label: 'Usuarios', icon: '👥' }
    );
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
    } finally {
      logout();
    }
  }

  return (
    <aside className={`bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="p-4 flex justify-between items-center">
        {isOpen && <h2 className="text-xl font-bold">Gestión Tareas</h2>}
        <button onClick={onToggle} className="text-white hover:text-gray-300">
          {isOpen ? '←' : '→'}
        </button>
      </div>
      <nav className="mt-4 flex-1">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 hover:bg-gray-700 transition ${
              pathname === item.href ? 'bg-gray-700 border-l-4 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      {isOpen && user && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-300">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left text-sm text-gray-400 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}

