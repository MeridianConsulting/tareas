// components/Layout.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { apiRequest, bootstrapAuth, getAccessToken } from '../lib/api';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (pathname === '/login') {
      setIsBootstrapping(false);
      return;
    }
    
    async function bootstrap() {
      try {
        // 1. Si no hay token en memoria, intentar obtener desde refresh cookie
        if (!getAccessToken()) {
          await bootstrapAuth();
        }
        
        // 2. Obtener informacion del usuario
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      } finally {
        setIsBootstrapping(false);
      }
    }
    
    bootstrap();
  }, [pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isBootstrapping) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" strokeWidth={1.75} />
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header con campana de notificaciones */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <NotificationBell />
            
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
              </div>
            )}
          </div>
        </header>
        
        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
        </main>
        
        {/* Footer discreto */}
        <footer className="hidden lg:block h-8 bg-white border-t border-slate-200 flex items-center justify-center flex-shrink-0">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Meridian Consulting · 
            <span className="ml-1 text-slate-500">Desarrollado por <span className="font-medium">José Mateo López Cifuentes</span></span>
          </p>
        </footer>
      </div>
    </div>
  );
}
