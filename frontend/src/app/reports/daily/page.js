// app/reports/daily/page.js
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
  BarChart3,
  Loader2,
  Calendar
} from 'lucide-react';

export default function DailyReports() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    async function loadReport() {
      try {
        const data = await apiRequest(`/reports/daily?date=${selectedDate}`);
        setReport(data.data);
      } catch (e) {
        // Error loading data
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [selectedDate, user]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reporte diario de actividades</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Seguimiento de tareas por fecha</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" strokeWidth={1.75} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow"
            />
          </div>
        </div>

        {report?.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total tareas"
              value={report.stats.total}
              icon={ClipboardList}
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={report.stats.completed}
              icon={CheckCircle2}
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={report.stats.at_risk}
              icon={AlertTriangle}
              color="red"
            />
            <StatsCard
              title="Progreso promedio"
              value={`${Math.round(report.stats.avg_progress || 0)}%`}
              icon={BarChart3}
              color="purple"
            />
          </div>
        )}

        {/* Tabla de actividades */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">
              Actividades del {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Titulo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prioridad</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progreso</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.tasks?.length > 0 ? (
                  report.tasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{task.title}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{task.type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'Alta' ? 'bg-rose-50 text-rose-700' :
                          task.priority === 'Media' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          task.status === 'Completada' ? 'bg-emerald-50 text-emerald-700' :
                          task.status === 'En progreso' ? 'bg-blue-50 text-blue-700' :
                          task.status === 'En riesgo' ? 'bg-rose-50 text-rose-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.progress_percent >= 100 ? 'bg-emerald-500' :
                                task.progress_percent >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${task.progress_percent}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-500 tabular-nums">{task.progress_percent}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{task.responsible_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <ClipboardList className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-slate-900 mb-1">No hay tareas para esta fecha</p>
                        <p className="text-sm text-slate-500">Selecciona otra fecha para ver las actividades</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
