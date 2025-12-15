// app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import TaskList from '../../components/TaskList';
import TaskModal from '../../components/TaskModal';
import { apiRequest } from '../../lib/api';
import { 
  Plus, 
  ClipboardList, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle,
  Filter,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
  });

  async function loadTasks() {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.type) queryParams.append('type', filters.type);
      
      const queryString = queryParams.toString();
      const url = `/tasks${queryString ? `?${queryString}` : ''}`;
      const data = await apiRequest(url);
      setTasks(data.data || []);
    } catch (e) {
      console.error('Error loading tasks:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filters]);

  function handleTaskSaved() {
    loadTasks();
    setShowTaskModal(false);
  }

  // Estadisticas rapidas
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completada').length,
    inProgress: tasks.filter(t => t.status === 'En progreso').length,
    atRisk: tasks.filter(t => t.status === 'En riesgo').length,
  };

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
        {/* Header con boton de nueva tarea */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mis tareas</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Gestiona y da seguimiento a tus actividades</p>
          </div>
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            Nueva tarea
          </button>
        </div>

        {/* Estadisticas rapidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.inProgress}</p>
                <p className="text-sm text-slate-500">En progreso</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.completed}</p>
                <p className="text-sm text-slate-500">Completadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{stats.atRisk}</p>
                <p className="text-sm text-slate-500">En riesgo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-500" strokeWidth={2} />
            <span className="text-sm font-medium text-slate-700">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow"
              >
                <option value="">Todos los estados</option>
                <option value="No iniciada">No iniciada</option>
                <option value="En progreso">En progreso</option>
                <option value="En revision">En revision</option>
                <option value="Completada">Completada</option>
                <option value="En riesgo">En riesgo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow"
              >
                <option value="">Todas las prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-shadow"
              >
                <option value="">Todos los tipos</option>
                <option value="Clave">Clave</option>
                <option value="Operativa">Operativa</option>
                <option value="Mejora">Mejora</option>
                <option value="Obligatoria">Obligatoria</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de tareas */}
        <TaskList tasks={tasks} onRefresh={loadTasks} />

        {/* Modal de nueva tarea */}
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSaved}
        />
      </div>
    </Layout>
  );
}
