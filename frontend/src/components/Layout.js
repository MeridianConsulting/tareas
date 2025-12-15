// components/Layout.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
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
        console.error('Bootstrap auth error:', e);
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
    <div className="flex h-screen bg-slate-100">
      <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
