// components/Sidebar.js
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../lib/auth';
import TaskModal from './TaskModal';
import NotificationBell from './NotificationBell';
import { 
  ListTodo, 
  Calendar, 
  BarChart3, 
  Building2, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  ClipboardList,
  Table2,
  PieChart,
  Layers,
  FileDown,
  Bell,
  Send
} from 'lucide-react';

export default function Sidebar({ user, isOpen, onToggle }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/tareas/backend/public/api/v1';

  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'Todas las Tareas', 
      icon: ListTodo
    },
    { 
      href: '/my-tasks', 
      label: 'Mis Tareas', 
      icon: Table2
    },
    { 
      href: '/assignments', 
      label: 'Asignaciones', 
      icon: Send
    },
  ];

  if (user?.role === 'admin' || user?.role === 'gerencia' || user?.role === 'lider_area') {
    menuItems.push({ 
      href: '/reports/daily', 
      label: 'Reportes Diarios', 
      icon: Calendar
    });
    menuItems.push({ 
      href: '/reports/areas', 
      label: 'Dashboard por Area', 
      icon: Layers
    });
    menuItems.push({ 
      href: '/reports/download', 
      label: 'Descargar Reportes', 
      icon: FileDown
    });
  }

  if (user?.role === 'admin' || user?.role === 'gerencia') {
    menuItems.push({ 
      href: '/reports/management', 
      label: 'Dashboard General', 
      icon: PieChart
    });
  }

  if (user?.role === 'admin') {
    menuItems.push(
      { 
        href: '/admin/areas', 
        label: 'Areas', 
        icon: Building2
      },
      { 
        href: '/admin/users', 
        label: 'Usuarios', 
        icon: Users
      }
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

  function handleTaskSaved() {
    setShowTaskModal(false);
    router.refresh();
    window.location.reload();
  }

  return (
    <>
      <aside className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-[72px]'} flex flex-col`}>
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-slate-800 ${isOpen ? 'px-4 justify-between' : 'justify-center'}`}>
          {isOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <span className="font-semibold text-base tracking-tight">Meridian Control</span>
            </div>
          )}
          <button 
            onClick={onToggle} 
            className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 ${!isOpen ? 'mx-auto' : ''}`}
            aria-label={isOpen ? 'Colapsar menu' : 'Expandir menu'}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Boton Nueva Tarea */}
        <div className={`${isOpen ? 'p-4' : 'p-3'}`}>
          <button
            onClick={() => setShowTaskModal(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${!isOpen ? 'px-2' : 'px-4'}`}
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            {isOpen && <span>Nueva tarea</span>}
          </button>
        </div>

        {/* Navegacion */}
        <nav className={`flex-1 ${isOpen ? 'px-3' : 'px-2'} pb-4 overflow-y-auto sidebar-scroll`}>
          {isOpen && (
            <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </p>
          )}
          <ul className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
            <Link
              href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-indigo-600/20 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
              } ${!isOpen ? 'justify-center' : ''}`}
              title={!isOpen ? item.label : ''}
            >
                    <Icon 
                      className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} 
                      strokeWidth={isActive ? 2 : 1.75} 
                    />
                    {isOpen && (
                      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                        {item.label}
              </span>
                    )}
            </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuario */}
        {user && (
          <div className={`border-t border-slate-800 ${isOpen ? 'p-4' : 'p-3'}`}>
            {isOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-medium text-sm text-slate-200">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-medium text-sm text-slate-200">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
                  title="Cerrar sesion"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Modal de nueva tarea */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSaved}
      />
    </>
  );
}
