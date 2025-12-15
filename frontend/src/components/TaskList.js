// components/TaskList.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskModal from './TaskModal';

export default function TaskList({ tasks, onRefresh }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getPriorityConfig = (priority) => {
    const config = {
      'Alta': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
      'Media': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
      'Baja': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    };
    return config[priority] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  };

  const getStatusConfig = (status) => {
    const config = {
      'Completada': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
      'En progreso': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '▶' },
      'En revisión': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '◎' },
      'En riesgo': { bg: 'bg-red-100', text: 'text-red-700', icon: '!' },
      'No iniciada': { bg: 'bg-gray-100', text: 'text-gray-600', icon: '○' },
    };
    return config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: '○' };
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Clave': '🔑',
      'Operativa': '⚙️',
      'Mejora': '📈',
      'Obligatoria': '📋',
    };
    return icons[type] || '📄';
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay tareas</h3>
        <p className="text-gray-500">Crea tu primera tarea para comenzar</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Vista de tabla para escritorio */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tarea
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map(t => {
                const priorityConfig = getPriorityConfig(t.priority);
                const statusConfig = getStatusConfig(t.status);
                const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completada';
                
                return (
                  <tr 
                    key={t.id} 
                    className="hover:bg-gray-50/80 cursor-pointer transition group"
                    onClick={() => handleEditTask(t)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg" title={t.type}>{getTypeIcon(t.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition">
                            {t.title}
                          </p>
                          <p className="text-sm text-gray-500">{t.area_name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {t.responsible_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-700">{t.responsible_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></span>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className="text-xs">{statusConfig.icon}</span>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                t.progress_percent >= 100 ? 'bg-emerald-500' :
                                t.progress_percent >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${t.progress_percent || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8">{t.progress_percent || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.due_date ? (
                        <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {isOverdue && '⚠️ '}
                          {new Date(t.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin fecha</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleEditTask(t, e)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista de tarjetas para móvil */}
        <div className="md:hidden divide-y divide-gray-100">
          {tasks.map(t => {
            const priorityConfig = getPriorityConfig(t.priority);
            const statusConfig = getStatusConfig(t.status);
            const isOverdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completada';
            
            return (
              <div 
                key={t.id}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition"
                onClick={() => handleEditTask(t)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getTypeIcon(t.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{t.title}</p>
                      <p className="text-sm text-gray-500">{t.area_name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                    {t.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                      {t.responsible_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600">{t.responsible_name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusConfig.bg} ${statusConfig.text}`}>
                    {t.status}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${t.progress_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{t.progress_percent || 0}%</span>
                  {t.due_date && (
                    <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {new Date(t.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de edición */}
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
