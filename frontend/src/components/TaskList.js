// components/TaskList.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskModal from './TaskModal';
import { 
  Key, 
  Settings, 
  TrendingUp, 
  FileText, 
  File,
  CheckCircle2,
  PlayCircle,
  Eye,
  AlertTriangle,
  Circle,
  AlertCircle,
  Pencil,
  Calendar
} from 'lucide-react';

export default function TaskList({ tasks, onRefresh }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getPriorityConfig = (priority) => {
    const config = {
      'Alta': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
      'Media': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
      'Baja': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    };
    return config[priority] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
  };

  const getStatusConfig = (status) => {
    const config = {
      'Completada': { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: CheckCircle2 
      },
      'En progreso': { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: PlayCircle 
      },
      'En revision': { 
        bg: 'bg-violet-50', 
        text: 'text-violet-700', 
        border: 'border-violet-200',
        icon: Eye 
      },
      'En riesgo': { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        icon: AlertTriangle 
      },
      'No iniciada': { 
        bg: 'bg-slate-50', 
        text: 'text-slate-600', 
        border: 'border-slate-200',
        icon: Circle 
      },
    };
    return config[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: Circle };
  };

  const getTypeConfig = (type) => {
    const config = {
      'Clave': { icon: Key, color: 'text-amber-600', bg: 'bg-amber-50' },
      'Operativa': { icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50' },
      'Mejora': { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      'Obligatoria': { icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
    };
    return config[type] || { icon: File, color: 'text-slate-600', bg: 'bg-slate-50' };
  };

  function handleEditTask(task, e) {
    e?.stopPropagation();
    setSelectedTask(task);
    setShowEditModal(true);
  }

  function handleTaskSaved() {
    setShowEditModal(false);
    setSelectedTask(null);
    if (onRefresh) onRefresh();
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No hay tareas</h3>
        <p className="text-sm text-slate-500">Crea tu primera tarea para comenzar a gestionar tu trabajo</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Vista de tabla para escritorio */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tarea
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map(t => {
                const priorityConfig = getPriorityConfig(t.priority);
                const statusConfig = getStatusConfig(t.status);
                const typeConfig = getTypeConfig(t.type);
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;
                const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completada';
                
                return (
                  <tr 
                    key={t.id} 
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150 group"
                    onClick={() => handleEditTask(t)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`} title={t.type}>
                          <TypeIcon className={`w-4.5 h-4.5 ${typeConfig.color}`} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {t.title}
                          </p>
                          <p className="text-sm text-slate-500 truncate">{t.area_name || 'Sin area'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {t.responsible_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-slate-700 truncate">{t.responsible_name || 'Sin asignar'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></span>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-28">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                t.progress_percent >= 100 ? 'bg-emerald-500' :
                                t.progress_percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${t.progress_percent || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-8 text-right tabular-nums">{t.progress_percent || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.due_date ? (
                        <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
                          {isOverdue && <AlertCircle className="w-4 h-4" strokeWidth={2} />}
                          <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} strokeWidth={1.75} />
                          {new Date(t.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleEditTask(t, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.75} />
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para tablet y movil */}
        <div className="lg:hidden divide-y divide-slate-100">
          {tasks.map(t => {
            const priorityConfig = getPriorityConfig(t.priority);
            const statusConfig = getStatusConfig(t.status);
            const typeConfig = getTypeConfig(t.type);
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;
            const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completada';
            
            return (
              <div 
                key={t.id}
                className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => handleEditTask(t)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className={`w-4.5 h-4.5 ${typeConfig.color}`} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{t.title}</p>
                      <p className="text-sm text-slate-500 truncate">{t.area_name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border}`}>
                    {t.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {t.responsible_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-600 truncate">{t.responsible_name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    <StatusIcon className="w-3 h-3" strokeWidth={2} />
                    {t.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.progress_percent >= 100 ? 'bg-emerald-500' :
                          t.progress_percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${t.progress_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 tabular-nums">{t.progress_percent || 0}%</span>
                  {t.due_date && (
                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                      {isOverdue && <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />}
                      {new Date(t.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de edicion */}
      <TaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleTaskSaved}
      />
    </>
  );
}
