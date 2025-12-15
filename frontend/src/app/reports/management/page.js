// app/reports/management/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import StatsCard from '../../../components/StatsCard';
import { apiRequest } from '../../../lib/api';
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2
} from 'lucide-react';

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
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" strokeWidth={1.75} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard Gerencial</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Vision general del estado de las tareas por area</p>
        </div>

        {dashboard?.general && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total tareas"
              value={dashboard.general.total_tasks}
              icon={ClipboardList}
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={dashboard.general.completed}
              icon={CheckCircle2}
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={dashboard.general.at_risk}
              icon={AlertTriangle}
              color="red"
            />
            <StatsCard
              title="Vencidas"
              value={dashboard.general.overdue}
              icon={Clock}
              color="orange"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Resumen por area */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Resumen por area</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {dashboard?.by_area?.map(area => (
                <div key={area.id} className="px-5 py-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-slate-900">{area.area_name}</h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {area.total_tasks} tareas
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                      <span className="text-slate-600">{area.completed}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" strokeWidth={2} />
                      <span className="text-slate-600">{area.at_risk}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500" strokeWidth={2} />
                      <span className="text-slate-600">{area.overdue}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${area.avg_progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 tabular-nums w-10 text-right">
                        {Math.round(area.avg_progress || 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-slate-500">No hay datos disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribucion por tipo */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Distribucion por tipo</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {dashboard?.by_type?.map(item => (
                <div key={item.type} className="px-5 py-3.5 flex justify-between items-center">
                  <span className="text-sm text-slate-700">{item.type}</span>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">{item.count}</span>
                </div>
              )) || (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-slate-500">No hay datos disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
