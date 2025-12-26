// components/TaskModal.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../lib/api';
import { 
  X, 
  Key, 
  Settings, 
  TrendingUp, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import Alert from './Alert';

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
  const titleInputRef = useRef(null);
  const [showMultiTaskPrompt, setShowMultiTaskPrompt] = useState(false);
  const [pastedTasks, setPastedTasks] = useState([]);

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
        // Error loading data
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [isOpen]);

  // Auto-focus en el campo de título cuando se abre el modal
  useEffect(() => {
    if (isOpen && !task && titleInputRef.current && !loadingData) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, task, loadingData]);

  // Atajos de teclado globales
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      // Ctrl+Enter o Cmd+Enter: Guardar (solo en la pestaña de detalles)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (activeTab === 'details' && !loading) {
          e.preventDefault();
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }
      }
      
      // Esc: Cerrar modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, loading, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Si hay tareas múltiples pendientes, crear todas
    if (pastedTasks.length > 0) {
      await createMultipleTasks();
      return;
    }
    
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
      setAlert({ type: 'success', message: 'Tarea guardada exitosamente', dismissible: true });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al guardar tarea: ' + e.message, dismissible: true });
    } finally {
      setLoading(false);
    }
  }

  async function createMultipleTasks() {
    if (pastedTasks.length === 0) return;
    
    setLoading(true);
    try {
      const tasksToCreate = pastedTasks.map(taskTitle => ({
        ...formData,
        title: taskTitle.trim(),
      }));

      // Crear todas las tareas en paralelo
      await Promise.all(
        tasksToCreate.map(taskData => 
          apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
          })
        )
      );
      
      if (onSave) {
        onSave();
      }
      
      setShowMultiTaskPrompt(false);
      setPastedTasks([]);
      setAlert({ type: 'success', message: `${tasksToCreate.length} tareas creadas exitosamente`, dismissible: true });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al crear tareas: ' + e.message, dismissible: true });
    } finally {
      setLoading(false);
    }
  }

  function handleTitlePaste(e) {
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Si hay más de una línea, ofrecer crear múltiples tareas
    if (lines.length > 1 && !task) {
      e.preventDefault();
      setPastedTasks(lines);
      setShowMultiTaskPrompt(true);
      // Mantener solo la primera línea en el campo
      setFormData({ ...formData, title: lines[0].trim() });
    }
  }

  if (!isOpen) return null;

  const typeConfig = {
    'Clave': { 
      icon: Key, 
      color: 'bg-amber-500', 
      lightBg: 'bg-amber-50',
      lightColor: 'text-amber-600',
      desc: 'Tarea estrategica de alto impacto' 
    },
    'Operativa': { 
      icon: Settings, 
      color: 'bg-blue-500', 
      lightBg: 'bg-blue-50',
      lightColor: 'text-blue-600',
      desc: 'Tarea del dia a dia' 
    },
    'Mejora': { 
      icon: TrendingUp, 
      color: 'bg-emerald-500', 
      lightBg: 'bg-emerald-50',
      lightColor: 'text-emerald-600',
      desc: 'Iniciativa de mejora continua' 
    },
    'Obligatoria': { 
      icon: FileText, 
      color: 'bg-rose-500', 
      lightBg: 'bg-rose-50',
      lightColor: 'text-rose-600',
      desc: 'Requerimiento o normativa' 
    },
  };

  const priorityConfig = {
    'Alta': { 
      color: 'bg-rose-500 hover:bg-rose-600', 
      ring: 'ring-rose-200',
      selected: 'ring-4 ring-rose-200 scale-[1.02]'
    },
    'Media': { 
      color: 'bg-amber-500 hover:bg-amber-600', 
      ring: 'ring-amber-200',
      selected: 'ring-4 ring-amber-200 scale-[1.02]'
    },
    'Baja': { 
      color: 'bg-emerald-500 hover:bg-emerald-600', 
      ring: 'ring-emerald-200',
      selected: 'ring-4 ring-emerald-200 scale-[1.02]'
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {task ? 'Editar Tarea' : 'Nueva Tarea'}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {task ? 'Modifica los detalles de la tarea' : 'Crea una nueva tarea para tu equipo'}
                </p>
                {!task && (
                  <p className="mt-2 text-xs text-slate-400">
                    💡 Pega múltiples líneas en el título para crear varias tareas • <kbd className="px-1.5 py-0.5 bg-slate-800/50 rounded text-xs">Esc</kbd> para cerrar
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="relative mt-5 flex rounded-lg bg-slate-900/40 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  activeTab === 'basic' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Informacion basica
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  activeTab === 'details' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Detalles y fechas
              </button>
            </div>
          </div>

          {/* Content */}
          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin" strokeWidth={1.75} />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    {/* Titulo */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Titulo de la tarea <span className="text-rose-500">*</span>
                        {!task && (
                          <span className="ml-2 text-xs text-slate-500 font-normal">
                            (Pega múltiples líneas para crear varias tareas)
                          </span>
                        )}
                      </label>
                      <input
                        ref={titleInputRef}
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        onPaste={handleTitlePaste}
                        required
                        placeholder="Ej: Revisar documentacion del proyecto"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder:text-slate-400"
                      />
                      {showMultiTaskPrompt && (
                        <div className="mt-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-sm font-medium text-indigo-900 mb-2">
                            Se detectaron {pastedTasks.length} tareas para crear
                          </p>
                          <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
                            {pastedTasks.slice(0, 5).map((taskTitle, idx) => (
                              <p key={idx} className="text-xs text-indigo-700">• {taskTitle.trim()}</p>
                            ))}
                            {pastedTasks.length > 5 && (
                              <p className="text-xs text-indigo-600">... y {pastedTasks.length - 5} más</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={createMultipleTasks}
                              disabled={loading}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                              {loading ? 'Creando...' : `Crear ${pastedTasks.length} tareas`}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowMultiTaskPrompt(false);
                                setPastedTasks([]);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Descripcion */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descripcion
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        onKeyDown={(e) => {
                          // Ctrl+Enter o Cmd+Enter en textarea: guardar (si estamos en detalles)
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            if (activeTab === 'details') {
                              e.preventDefault();
                              const form = e.target.closest('form');
                              if (form) {
                                form.requestSubmit();
                              }
                            }
                          }
                        }}
                        rows={3}
                        placeholder="Describe los detalles de la tarea..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* Tipo de tarea */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Tipo de tarea <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(typeConfig).map(([type, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({ ...formData, type })}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                formData.type === type
                                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-10 h-10 ${config.lightBg} rounded-lg flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 ${config.lightColor}`} strokeWidth={1.75} />
                              </span>
                              <div className="text-left">
                                <p className="font-medium text-slate-900 text-sm">{type}</p>
                                <p className="text-xs text-slate-500 leading-tight">{config.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Prioridad <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        {Object.entries(priorityConfig).map(([priority, config]) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority })}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all ${config.color} ${
                              formData.priority === priority 
                                ? config.selected 
                                : 'opacity-60 hover:opacity-90'
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
                  <div className="space-y-6">
                    {/* Area y Responsable */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Area <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.area_id}
                          onChange={e => setFormData({ ...formData, area_id: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
                        >
                          <option value="">Seleccionar area</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Responsable <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.responsible_id}
                          onChange={e => setFormData({ ...formData, responsible_id: e.target.value })}
                          required
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
                        >
                          <option value="No iniciada">No iniciada</option>
                          <option value="En progreso">En progreso</option>
                          <option value="En revision">En revision</option>
                          <option value="Completada">Completada</option>
                          <option value="En riesgo">En riesgo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Progreso: <span className="font-semibold text-indigo-600">{formData.progress_percent}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.progress_percent}
                          onChange={e => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fecha de inicio
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Fecha de vencimiento
                        </label>
                        <input
                          type="date"
                          value={formData.due_date}
                          onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                        />
                      </div>
                    </div>

                    {/* Resumen visual */}
                    {(formData.start_date || formData.due_date) && (
                      <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Periodo: </span>
                          {formData.start_date ? new Date(formData.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin definir'}
                          <span className="mx-2 text-slate-400">→</span>
                          {formData.due_date ? new Date(formData.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin definir'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Cancelar
                  </button>
                  {activeTab === 'details' && (
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono">Enter</kbd> para guardar
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {activeTab === 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                  )}
                  {activeTab === 'details' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                        Atras
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                            Guardando...
                          </>
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

      {/* Alertas */}
      {alert && (
        <div className="fixed top-4 right-4 z-[60] max-w-md animate-in slide-in-from-right">
          <Alert
            type={alert.type}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        </div>
      )}
    </div>
  );
}
