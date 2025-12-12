// app/reports/management/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import StatsCard from '../../../components/StatsCard';
import { apiRequest } from '../../../lib/api';

export default function ManagementDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (!['admin', 'gerencia'].includes(data.data.role)) {
          router.push('/dashboard');
          return;
        }
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function loadDashboard() {
      try {
        const data = await apiRequest('/reports/management');
        setDashboard(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Gerencial</h1>

        {dashboard?.general && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total tareas"
              value={dashboard.general.total_tasks}
              icon="📋"
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={dashboard.general.completed}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={dashboard.general.at_risk}
              icon="⚠️"
              color="red"
            />
            <StatsCard
              title="Vencidas"
              value={dashboard.general.overdue}
              icon="🔴"
              color="orange"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen por área</h2>
            <div className="space-y-4">
              {dashboard?.by_area?.map(area => (
                <div key={area.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{area.area_name}</h3>
                    <span className="text-sm text-gray-500">{area.total_tasks} tareas</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-green-600">✓ {area.completed}</span>
                    </div>
                    <div>
                      <span className="text-red-600">⚠ {area.at_risk}</span>
                    </div>
                    <div>
                      <span className="text-orange-600">🔴 {area.overdue}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${area.avg_progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(area.avg_progress || 0)}% promedio</span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center">No hay datos disponibles</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Distribución por tipo</h2>
            <div className="space-y-2">
              {dashboard?.by_type?.map(item => (
                <div key={item.type} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.type}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

