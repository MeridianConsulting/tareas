// components/TaskModal.js
'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export default function TaskModal({ isOpen, onClose, task, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Operativa',
    priority: 'Media',
    status: 'No iniciada',
    progress_percent: 0,
    area_id: '',
    responsible_id: '',
    start_date: '',
    due_date: '',
  });
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'Operativa',
        priority: task.priority || 'Media',
        status: task.status || 'No iniciada',
        progress_percent: task.progress_percent || 0,
        area_id: task.area_id || '',
        responsible_id: task.responsible_id || '',
        start_date: task.start_date || '',
        due_date: task.due_date || '',
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        type: 'Operativa',
        priority: 'Media',
        status: 'No iniciada',
        progress_percent: 0,
        area_id: '',
        responsible_id: '',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
      });
    }
  }, [task, isOpen]);

  useEffect(() => {
    async function loadData() {
      if (!isOpen) return;
      setLoadingData(true);
      try {
        const [areasData, usersData] = await Promise.all([
          apiRequest('/areas'),
          apiRequest('/users'),
        ]);
        setAreas(areasData.data || []);
        setUsers(usersData.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = task ? `/tasks/${task.id}` : '/tasks';
      const method = task ? 'PUT' : 'POST';
      
      await apiRequest(url, {
        method,
        body: JSON.stringify(formData),
      });
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (e) {
      alert('Error al guardar tarea: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const typeIcons = {
    'Clave': { icon: '🔑', color: 'bg-amber-500', desc: 'Tarea estratégica de alto impacto' },
    'Operativa': { icon: '⚙️', color: 'bg-blue-500', desc: 'Tarea del día a día' },
    'Mejora': { icon: '📈', color: 'bg-emerald-500', desc: 'Iniciativa de mejora continua' },
    'Obligatoria': { icon: '📋', color: 'bg-red-500', desc: 'Requerimiento o normativa' },
  };

  const priorityConfig = {
    'Alta': { color: 'bg-red-500 hover:bg-red-600', ring: 'ring-red-300' },
    'Media': { color: 'bg-amber-500 hover:bg-amber-600', ring: 'ring-amber-300' },
    'Baja': { color: 'bg-emerald-500 hover:bg-emerald-600', ring: 'ring-emerald-300' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-5">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {task ? 'Editar Tarea' : 'Nueva Tarea'}
                </h2>
                <p className="mt-1 text-sm text-indigo-200">
                  {task ? 'Modifica los detalles de la tarea' : 'Crea una nueva tarea para tu equipo'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="relative mt-4 flex space-x-1 rounded-lg bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  activeTab === 'basic' 
                    ? 'bg-white text-indigo-700 shadow' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Información básica
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  activeTab === 'details' 
                    ? 'bg-white text-indigo-700 shadow' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Detalles y fechas
              </button>
            </div>
          </div>

          {/* Content */}
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5">
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título de la tarea *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Ej: Revisar documentación del proyecto"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder:text-gray-400"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Describe los detalles de la tarea..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition resize-none placeholder:text-gray-400"
                      />
                    </div>

                    {/* Tipo de tarea */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tipo de tarea *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(typeIcons).map(([type, config]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type })}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                              formData.type === type
                                ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-lg`}>
                              {config.icon}
                            </span>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{type}</p>
                              <p className="text-xs text-gray-500">{config.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Prioridad *
                      </label>
                      <div className="flex gap-3">
                        {Object.entries(priorityConfig).map(([priority, config]) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority })}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium text-white transition ${config.color} ${
                              formData.priority === priority ? `ring-4 ${config.ring} scale-105` : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-5">
                    {/* Área y Responsable */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Área *
                        </label>
                        <select
                          value={formData.area_id}
                          onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition bg-white"
                        >
                          <option value="">Seleccionar área</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Responsable *
                        </label>
                        <select
                          value={formData.responsible_id}
                          onChange={e => setFormData({ ...formData, responsible_id: e.target.value })}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition bg-white"
                        >
                          <option value="">Seleccionar responsable</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Estado y Progreso */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition bg-white"
                        >
                          <option value="No iniciada">No iniciada</option>
                          <option value="En progreso">En progreso</option>
                          <option value="En revisión">En revisión</option>
                          <option value="Completada">Completada</option>
                          <option value="En riesgo">En riesgo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Progreso: {formData.progress_percent}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.progress_percent}
                          onChange={e => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de inicio
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de vencimiento
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>

                    {/* Resumen visual */}
                    {(formData.start_date || formData.due_date) && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-indigo-700">Período: </span>
                          {formData.start_date ? new Date(formData.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin definir'}
                          {' → '}
                          {formData.due_date ? new Date(formData.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin definir'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <div className="flex gap-3">
                  {activeTab === 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
                    >
                      Siguiente →
                    </button>
                  )}
                  {activeTab === 'details' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
                      >
                        ← Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Guardando...
                          </span>
                        ) : (
                          task ? 'Actualizar tarea' : 'Crear tarea'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

