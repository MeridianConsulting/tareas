// components/TaskForm.js
'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export default function TaskForm({ task, onSave, onCancel }) {
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
    }
  }, [task]);

  useEffect(() => {
    async function loadData() {
      try {
        const [areasData, usersData] = await Promise.all([
          apiRequest('/areas'),
          apiRequest('/users'),
        ]);
        setAreas(areasData.data || []);
        setUsers(usersData.data || []);
      } catch (e) {
        // Error saving task
      }
    }
    loadData();
  }, []);

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
    } catch (e) {
      alert('Error al guardar tarea: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Clave">Clave</option>
            <option value="Operativa">Operativa</option>
            <option value="Mejora">Mejora</option>
            <option value="Obligatoria">Obligatoria</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
          <select
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="No iniciada">No iniciada</option>
            <option value="En progreso">En progreso</option>
            <option value="En revisión">En revisión</option>
            <option value="Completada">Completada</option>
            <option value="En riesgo">En riesgo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progreso (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.progress_percent}
            onChange={e => setFormData({ ...formData, progress_percent: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
          <select
            value={formData.area_id}
            onChange={e => setFormData({ ...formData, area_id: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar área</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
          <select
            value={formData.responsible_id}
            onChange={e => setFormData({ ...formData, responsible_id: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar responsable</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
        >
          {loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

