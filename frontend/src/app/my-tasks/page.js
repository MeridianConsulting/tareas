// app/my-tasks/page.js
'use client';

import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import TasksSpreadsheet from '../../components/TasksSpreadsheet';
import { apiRequest } from '../../lib/api';
import { 
  Table2,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function MyTasksPage() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, atRisk: 0 });
  const [currentUser, setCurrentUser] = useState(null);

  async function loadStats() {
    try {
      const meData = await apiRequest('/auth/me');
      const user = meData.data;
      setCurrentUser(user);

      const data = await apiRequest('/tasks');
      const allTasks = data.data || [];
      // Filtrar solo las tareas del usuario actual
      const myTasks = allTasks.filter(t => t.responsible_id == user.id);
      
      setStats({
        total: myTasks.length,
        completed: myTasks.filter(t => t.status === 'Completada').length,
        pending: myTasks.filter(t => t.status === 'En progreso').length,
        atRisk: myTasks.filter(t => t.status === 'En riesgo').length,
      });
    } catch (e) {
      // Si falla auth/me, el Layout ya maneja la redirección a login
      // No hacer nada aquí para evitar loops
      console.error('Error loading stats:', e);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Layout>
      <div className="p-4 sm:p-6 w-full overflow-hidden">
        {/* Header compacto con stats inline */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Table2 className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Mis Tareas</h1>
              <p className="text-slate-500 text-xs">Registro rapido tipo hoja de calculo</p>
            </div>
          </div>
          
          {/* Stats compactos en linea */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-lg font-semibold text-slate-700 tabular-nums">{stats.total}</span>
              <span className="text-xs text-slate-500">total</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              <span className="text-lg font-semibold text-emerald-700 tabular-nums">{stats.completed}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" strokeWidth={2} />
              <span className="text-lg font-semibold text-blue-700 tabular-nums">{stats.pending}</span>
            </div>
            {stats.atRisk > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-rose-600" strokeWidth={2} />
                <span className="text-lg font-semibold text-rose-700 tabular-nums">{stats.atRisk}</span>
              </div>
            )}
          </div>
        </div>

        {/* Spreadsheet component - solo renderizar cuando tengamos userId */}
        {currentUser?.id ? (
          <TasksSpreadsheet userId={currentUser.id} onTasksChange={loadStats} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500">Cargando usuario...</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
