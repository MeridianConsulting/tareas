// components/Layout.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { apiRequest, bootstrapAuth } from '../lib/api';

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
        // 1. Intentar obtener access token desde refresh cookie
        await bootstrapAuth();
        
        // 2. Obtener información del usuario
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

