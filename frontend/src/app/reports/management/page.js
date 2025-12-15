// app/reports/management/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../../components/Layout';
import { apiRequest } from '../../../lib/api';
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';

// Importar Pie chart dinámicamente para evitar SSR issues
const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
});

export default function ManagementDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
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
        const [reportData, tasksData] = await Promise.all([
          apiRequest('/reports/management'),
          apiRequest('/tasks')
        ]);
        setDashboard(reportData.data);
        setAllTasks(tasksData.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  // Calcular datos para gráficos
  const getTypeChartData = () => {
    if (!dashboard?.by_type) return [];
    const colors = {
      'Clave': '#f59e0b',
      'Operativa': '#3b82f6',
      'Mejora': '#10b981',
      'Obligatoria': '#ef4444'
    };
    return dashboard.by_type.map(item => ({
      id: item.type,
      label: item.type,
      value: item.count,
      color: colors[item.type] || '#64748b'
    }));
  };

  const getStatusChartData = () => {
    const statusCount = {};
    allTasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });
    const colors = {
      'Completada': '#10b981',
      'En progreso': '#3b82f6',
      'En revision': '#8b5cf6',
      'No iniciada': '#94a3b8',
      'En riesgo': '#ef4444'
    };
    return Object.entries(statusCount).map(([status, count]) => ({
      id: status,
      label: status,
      value: count,
      color: colors[status] || '#64748b'
    }));
  };

  // Calcular KPIs de completitud
  const calculateKPIs = () => {
    const total = dashboard?.general?.total_tasks || 0;
    const completed = dashboard?.general?.completed || 0;
    const inProgress = allTasks.filter(t => t.status === 'En progreso').length;
    const avgProgress = allTasks.length > 0 
      ? Math.round(allTasks.reduce((sum, t) => sum + (t.progress_percent || 0), 0) / allTasks.length)
      : 0;
    
    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgressRate: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      avgProgress,
      onTimeRate: total > 0 ? Math.round(((total - (dashboard?.general?.overdue || 0)) / total) * 100) : 0
    };
  };

  const kpis = calculateKPIs();

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
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard General</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Vision consolidada del estado de todas las tareas</p>
        </div>

        {/* KPIs de Completitud */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.completionRate}%</span>
            </div>
            <p className="text-emerald-100 text-sm font-medium">Tasa de Completitud</p>
            <p className="text-emerald-200 text-xs mt-1">{dashboard?.general?.completed || 0} de {dashboard?.general?.total_tasks || 0} tareas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.avgProgress}%</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Progreso Promedio</p>
            <p className="text-blue-200 text-xs mt-1">Avance general de tareas</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg shadow-violet-200">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.inProgressRate}%</span>
            </div>
            <p className="text-violet-100 text-sm font-medium">En Ejecucion</p>
            <p className="text-violet-200 text-xs mt-1">Tareas activas actualmente</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.onTimeRate}%</span>
            </div>
            <p className="text-amber-100 text-sm font-medium">A Tiempo</p>
            <p className="text-amber-200 text-xs mt-1">Sin retrasos</p>
          </div>
        </div>

        {/* Stats cards secundarios */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.total_tasks || 0}</p>
                <p className="text-xs text-slate-500">Total tareas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.completed || 0}</p>
                <p className="text-xs text-slate-500">Completadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.at_risk || 0}</p>
                <p className="text-xs text-slate-500">En riesgo</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.overdue || 0}</p>
                <p className="text-xs text-slate-500">Vencidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graficos de Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribucion por Tipo */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Distribucion por Tipo</h2>
              <p className="text-xs text-slate-500 mt-0.5">Clasificacion de tareas segun categoria</p>
            </div>
            <div className="p-4" style={{ height: '300px' }}>
              {getTypeChartData().length > 0 ? (
                <ResponsivePie
                  data={getTypeChartData()}
                  margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
                  innerRadius={0.5}
                  padAngle={2}
                  cornerRadius={4}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: 'data.color' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#334155"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                  legends={[
                    {
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 8,
                      itemWidth: 80,
                      itemHeight: 18,
                      itemTextColor: '#64748b',
                      itemDirection: 'left-to-right',
                      symbolSize: 12,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Sin datos disponibles
                </div>
              )}
            </div>
          </div>

          {/* Distribucion por Estado */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Distribucion por Estado</h2>
              <p className="text-xs text-slate-500 mt-0.5">Estado actual de todas las tareas</p>
            </div>
            <div className="p-4" style={{ height: '300px' }}>
              {getStatusChartData().length > 0 ? (
                <ResponsivePie
                  data={getStatusChartData()}
                  margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
                  innerRadius={0.5}
                  padAngle={2}
                  cornerRadius={4}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: 'data.color' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#334155"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                  legends={[
                    {
                      anchor: 'right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 8,
                      itemWidth: 90,
                      itemHeight: 18,
                      itemTextColor: '#64748b',
                      itemDirection: 'left-to-right',
                      symbolSize: 12,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Sin datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completitud por Area */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Completitud por Area</h2>
            <p className="text-xs text-slate-500 mt-0.5">Porcentaje de tareas completadas en cada area</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard?.by_area?.map(area => {
                const completionRate = area.total_tasks > 0 
                  ? Math.round((area.completed / area.total_tasks) * 100) 
                  : 0;
                const progressColor = completionRate >= 80 ? 'bg-emerald-500' : 
                                     completionRate >= 50 ? 'bg-blue-500' : 
                                     completionRate >= 25 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div key={area.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 text-sm">{area.area_name}</h3>
                        <p className="text-xs text-slate-500">{area.total_tasks} tareas</p>
                      </div>
                      <span className={`text-lg font-bold tabular-nums ${
                        completionRate >= 80 ? 'text-emerald-600' : 
                        completionRate >= 50 ? 'text-blue-600' : 
                        completionRate >= 25 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {area.completed} completadas
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {area.at_risk} en riesgo
                      </span>
                    </div>
                  </div>
                );
              }) || (
                <div className="col-span-full text-center py-8 text-slate-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla resumen por area */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Detalle por Area</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Area</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Total</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Completadas</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">En Riesgo</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Vencidas</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">% Completitud</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Progreso Prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard?.by_area?.map(area => {
                  const completionRate = area.total_tasks > 0 
                    ? Math.round((area.completed / area.total_tasks) * 100) 
                    : 0;
                  return (
                    <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-900">{area.area_name}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 text-center tabular-nums">{area.total_tasks}</td>
                      <td className="px-5 py-3 text-sm text-emerald-600 text-center tabular-nums font-medium">{area.completed}</td>
                      <td className="px-5 py-3 text-sm text-rose-600 text-center tabular-nums font-medium">{area.at_risk}</td>
                      <td className="px-5 py-3 text-sm text-amber-600 text-center tabular-nums font-medium">{area.overdue}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          completionRate >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          completionRate >= 50 ? 'bg-blue-100 text-blue-700' : 
                          completionRate >= 25 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {completionRate}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${area.avg_progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600 tabular-nums w-8">{Math.round(area.avg_progress || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
