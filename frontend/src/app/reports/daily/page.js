// app/reports/daily/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import StatsCard from '../../../components/StatsCard';
import { apiRequest } from '../../../lib/api';

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
        console.error(e);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reporte diario de actividades</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {report?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total tareas"
              value={report.stats.total}
              icon="📋"
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={report.stats.completed}
              icon="✅"
              color="green"
            />
            <StatsCard
              title="En riesgo"
              value={report.stats.at_risk}
              icon="⚠️"
              color="red"
            />
            <StatsCard
              title="Progreso promedio"
              value={`${Math.round(report.stats.avg_progress || 0)}%`}
              icon="📊"
              color="purple"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Actividades del {new Date(selectedDate).toLocaleDateString('es-ES')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report?.tasks?.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.priority}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.progress_percent}%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.responsible_name}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No hay tareas para esta fecha
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

