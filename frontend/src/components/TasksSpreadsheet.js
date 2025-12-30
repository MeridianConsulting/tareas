// components/TasksSpreadsheet.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../lib/api';
import { 
  Plus, 
  Save, 
  Trash2, 
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import Alert from './Alert';
import ConfirmDialog from './ConfirmDialog';

export default function TasksSpreadsheet({ userId, onTasksChange }) {
  const [tasks, setTasks] = useState([]);
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [newRows, setNewRows] = useState([]);
  const inputRef = useRef(null);
  const [showPastePrompt, setShowPastePrompt] = useState(false);
  const [pastedLines, setPastedLines] = useState([]);
  const isNavigatingRef = useRef(false);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const tipos = ['Clave', 'Operativa', 'Mejora', 'Obligatoria'];
  const prioridades = ['Alta', 'Media', 'Baja'];
  const estados = ['No iniciada', 'En progreso', 'En revision', 'Completada', 'En riesgo'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingCell) {
      // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
      requestAnimationFrame(() => {
        // Buscar el input específico por su ID único
        const inputId = `cell-${editingCell.id}-${editingCell.field}`;
        const input = document.getElementById(inputId);
        if (input) {
          input.focus();
          if (input.select) {
            input.select();
          }
        } else if (inputRef.current) {
          // Fallback al ref si no se encuentra por ID
          inputRef.current.focus();
          if (inputRef.current.select) {
            inputRef.current.select();
          }
        }
      });
    }
  }, [editingCell]);

  async function loadData() {
    try {
      // Obtener usuario actual
      const meData = await apiRequest('/auth/me');
      const user = meData.data;
      setCurrentUser(user);

      const [tasksData, areasData, usersData] = await Promise.all([
        apiRequest('/tasks'),
        apiRequest('/areas'),
        apiRequest('/users'),
      ]);
      
      // Filtrar solo las tareas del usuario actual (donde es responsable)
      const allTasks = tasksData.data || [];
      const myTasks = allTasks.filter(t => t.responsible_id == user.id);
      
      setTasks(myTasks);
      setAreas(areasData.data || []);
      setUsers(usersData.data || []);
    } catch (e) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  }

  function addNewRow() {
    const newRow = {
      _tempId: Date.now(),
      _isNew: true,
      title: '',
      description: '',
      type: 'Operativa',
      priority: 'Media',
      status: 'No iniciada',
      progress_percent: 0,
      area_id: currentUser?.area_id || areas[0]?.id || '',
      responsible_id: currentUser?.id || '',
      start_date: new Date().toISOString().split('T')[0],
      due_date: '',
    };
    setNewRows([...newRows, newRow]);
  }

  function updateCell(taskId, field, value, isNew = false) {
    if (isNew) {
      setNewRows(newRows.map(row => 
        row._tempId === taskId ? { ...row, [field]: value } : row
      ));
    } else {
      setPendingChanges(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [field]: value
        }
      }));
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, [field]: value } : t
      ));
    }
  }

  function removeNewRow(tempId) {
    setNewRows(newRows.filter(row => row._tempId !== tempId));
  }

  // Normalizar fechas: convertir vacías a null
  function normalizeDates(data) {
    const normalized = { ...data };
    if (!normalized.start_date || normalized.start_date === '') {
      normalized.start_date = null;
    }
    if (!normalized.due_date || normalized.due_date === '') {
      normalized.due_date = null;
    }
    return normalized;
  }

  async function saveNewRow(row) {
    if (!row.title.trim()) {
      setAlert({ type: 'warning', message: 'El título es obligatorio', dismissible: true });
      return;
    }
    if (!row.area_id) {
      setAlert({ type: 'warning', message: 'El área es obligatoria', dismissible: true });
      return;
    }

    setSaving(true);
    try {
      const { _tempId, _isNew, ...taskData } = row;
      // Asegurar que el responsable sea el usuario actual
      taskData.responsible_id = currentUser?.id;
      
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(normalizeDates(taskData)),
      });
      setNewRows(newRows.filter(r => r._tempId !== row._tempId));
      await loadData();
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: 'Tarea guardada exitosamente', dismissible: true });
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al guardar: ' + e.message, dismissible: true });
    } finally {
      setSaving(false);
    }
  }

  async function saveChanges(taskId) {
    if (!pendingChanges[taskId]) return;
    
    setSaving(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(normalizeDates({
          ...task,
          ...pendingChanges[taskId]
        })),
      });
      setPendingChanges(prev => {
        const { [taskId]: _, ...rest } = prev;
        return rest;
      });
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: 'Cambios guardados exitosamente', dismissible: true });
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al guardar: ' + e.message, dismissible: true });
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteClick(taskId) {
    setDeleteConfirm(taskId);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    
    setDeleting(true);
    try {
      await apiRequest(`/tasks/${deleteConfirm}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== deleteConfirm));
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteConfirm.toString());
        return newSet;
      });
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: 'Tarea eliminada exitosamente', dismissible: true });
      setDeleteConfirm(null);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al eliminar: ' + e.message, dismissible: true });
    } finally {
      setDeleting(false);
    }
  }

  function toggleTaskSelection(taskId) {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId.toString())) {
        newSet.delete(taskId.toString());
      } else {
        newSet.add(taskId.toString());
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id.toString())));
    }
  }

  async function deleteSelectedTasks() {
    if (selectedTasks.size === 0) {
      setAlert({ type: 'warning', message: 'No hay tareas seleccionadas', dismissible: true });
      return;
    }

    setDeleteConfirm('multiple');
  }

  async function confirmDeleteMultiple() {
    if (selectedTasks.size === 0) return;
    
    setDeleting(true);
    try {
      const taskIds = Array.from(selectedTasks).map(id => parseInt(id));
      await Promise.all(
        taskIds.map(id => apiRequest(`/tasks/${id}`, { method: 'DELETE' }))
      );
      setTasks(tasks.filter(t => !taskIds.includes(t.id)));
      setSelectedTasks(new Set());
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: `${taskIds.length} tarea(s) eliminada(s) exitosamente`, dismissible: true });
      setDeleteConfirm(null);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al eliminar: ' + e.message, dismissible: true });
    } finally {
      setDeleting(false);
    }
  }

  async function saveSelectedTasks() {
    const selectedTaskIds = Array.from(selectedTasks).map(id => parseInt(id));
    const tasksToSave = selectedTaskIds.filter(id => pendingChanges[id] && Object.keys(pendingChanges[id]).length > 0);
    
    if (tasksToSave.length === 0) {
      setAlert({ type: 'warning', message: 'No hay cambios pendientes en las tareas seleccionadas', dismissible: true });
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        tasksToSave.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          return apiRequest(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify({
              ...task,
              ...pendingChanges[taskId]
            }),
          });
        })
      );
      
      // Limpiar cambios guardados
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        tasksToSave.forEach(id => {
          delete newChanges[id];
        });
        return newChanges;
      });
      
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: `${tasksToSave.length} tarea(s) guardada(s) exitosamente`, dismissible: true });
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al guardar: ' + e.message, dismissible: true });
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e, taskId, field, isNew) {
    // Tab: mover a la siguiente celda
    if (e.key === 'Tab') {
      e.preventDefault();
      isNavigatingRef.current = true;
      
      // Encontrar la siguiente celda editable
      const allRows = [...newRows, ...tasks];
      const currentRowIndex = allRows.findIndex(r => (isNew ? r._tempId : r.id) === taskId);
      const fields = ['title', 'type', 'priority', 'status', 'area_id', 'progress_percent', 'start_date', 'due_date'];
      const currentFieldIndex = fields.indexOf(field);
      
      let nextCell = null;
      
      if (e.shiftKey) {
        // Shift+Tab: mover a la celda anterior
        if (currentFieldIndex > 0) {
          // Campo anterior en la misma fila
          nextCell = { id: taskId, field: fields[currentFieldIndex - 1], isNew };
        } else if (currentRowIndex > 0) {
          // Última celda de la fila anterior
          const prevRow = allRows[currentRowIndex - 1];
          const prevRowId = prevRow._tempId || prevRow.id;
          const prevRowIsNew = !!prevRow._tempId;
          nextCell = { id: prevRowId, field: fields[fields.length - 1], isNew: prevRowIsNew };
        }
      } else {
        // Tab normal: mover a la siguiente celda
        if (currentFieldIndex < fields.length - 1) {
          // Siguiente campo en la misma fila
          nextCell = { id: taskId, field: fields[currentFieldIndex + 1], isNew };
        } else if (currentRowIndex < allRows.length - 1) {
          // Primera celda de la siguiente fila
          const nextRow = allRows[currentRowIndex + 1];
          const nextRowId = nextRow._tempId || nextRow.id;
          const nextRowIsNew = !!nextRow._tempId;
          nextCell = { id: nextRowId, field: 'title', isNew: nextRowIsNew };
        }
      }
      
      // Actualizar directamente a la siguiente celda sin cerrar primero
      if (nextCell) {
        setEditingCell({ id: nextCell.id, field: nextCell.field });
        // Resetear el flag después de un breve delay
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      } else {
        setEditingCell(null);
        isNavigatingRef.current = false;
      }
      return;
    }
    
    // Enter: confirmar y mover a la siguiente fila (solo en título)
    if (e.key === 'Enter' && field === 'title') {
      e.preventDefault();
      setEditingCell(null);
      if (isNew) {
        // Si hay cambios, guardar y crear nueva fila
        if (taskId && newRows.find(r => r._tempId === taskId)?.title?.trim()) {
          const row = newRows.find(r => r._tempId === taskId);
          if (row) {
            saveNewRow(row).then(() => {
              // Crear nueva fila y enfocar en título
              addNewRow();
              setTimeout(() => {
                const newRow = newRows[newRows.length - 1];
                if (newRow) {
                  setEditingCell({ id: newRow._tempId, field: 'title' });
                }
              }, 100);
            });
          }
        } else {
          // Solo crear nueva fila
          addNewRow();
        }
      } else if (pendingChanges[taskId]) {
        saveChanges(taskId);
      }
      return;
    }
    
    // Enter normal: confirmar edición
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditingCell(null);
      if (isNew) {
        // Mover al siguiente campo
        const fields = ['title', 'type', 'priority', 'status', 'area_id', 'progress_percent', 'start_date', 'due_date'];
        const currentFieldIndex = fields.indexOf(field);
        if (currentFieldIndex < fields.length - 1) {
          setEditingCell({ id: taskId, field: fields[currentFieldIndex + 1] });
        }
      } else if (pendingChanges[taskId]) {
        saveChanges(taskId);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }

  function handlePaste(e, taskId, field, isNew) {
    // Solo procesar pegado múltiple en el campo de título
    if (field !== 'title') return;
    
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // Si hay más de una línea, crear múltiples tareas
    if (lines.length > 1) {
      e.preventDefault();
      setPastedLines(lines);
      setShowPastePrompt(true);
      
      // Actualizar la primera fila con el primer título
      if (isNew) {
        updateCell(taskId, 'title', lines[0].trim(), true);
      } else {
        // Si no es nueva, actualizar el título actual y crear filas nuevas para el resto
        updateCell(taskId, 'title', lines[0].trim(), false);
        // Crear filas nuevas para las líneas restantes
        const remainingLines = lines.slice(1);
        const newRowsToAdd = remainingLines.map(title => ({
          _tempId: Date.now() + Math.random(),
          _isNew: true,
          title: title.trim(),
          description: '',
          type: 'Operativa',
          priority: 'Media',
          status: 'No iniciada',
          progress_percent: 0,
          area_id: currentUser?.area_id || areas[0]?.id || '',
          responsible_id: currentUser?.id || '',
          start_date: new Date().toISOString().split('T')[0],
          due_date: '',
        }));
        setNewRows([...newRows, ...newRowsToAdd]);
      }
    }
  }

  async function createMultipleTasksFromPaste() {
    if (pastedLines.length === 0) return;
    
    setSaving(true);
    try {
      // Si hay una celda editándose, guardar su cambio primero
      if (editingCell) {
        const editingTask = tasks.find(t => t.id === editingCell.id);
        if (editingTask && pendingChanges[editingCell.id]) {
          await saveChanges(editingCell.id);
        }
      }

      const tasksToCreate = pastedLines.map(title => ({
        title: title.trim(),
        description: '',
        type: 'Operativa',
        priority: 'Media',
        status: 'No iniciada',
        progress_percent: 0,
        area_id: currentUser?.area_id || areas[0]?.id || '',
        responsible_id: currentUser?.id || '',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
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
      
      // Limpiar filas nuevas temporales que se crearon
      setNewRows([]);
      setShowPastePrompt(false);
      setPastedLines([]);
      setEditingCell(null);
      await loadData();
      if (onTasksChange) onTasksChange();
      setAlert({ type: 'success', message: `${pastedLines.length} tareas creadas exitosamente`, dismissible: true });
    } catch (e) {
      setAlert({ type: 'error', message: 'Error al crear tareas: ' + e.message, dismissible: true });
    } finally {
      setSaving(false);
    }
  }

  function renderCell(task, field, isNew = false) {
    const taskId = isNew ? task._tempId : task.id;
    const isEditing = editingCell?.id === taskId && editingCell?.field === field;
    const value = task[field];
    const hasChanges = !isNew && pendingChanges[taskId]?.[field] !== undefined;

    const cellClass = `px-3 py-2 border-r border-slate-200 text-sm ${
      hasChanges ? 'bg-amber-50' : isNew ? 'bg-emerald-50/30' : 'bg-white'
    } ${isEditing ? 'ring-2 ring-inset ring-indigo-500' : ''} hover:bg-slate-50`;

    // Campos de seleccion
    if (['type', 'priority', 'status', 'area_id'].includes(field)) {
      let options = [];

      if (field === 'type') options = tipos.map(t => ({ value: t, label: t }));
      else if (field === 'priority') options = prioridades.map(p => ({ value: p, label: p }));
      else if (field === 'status') options = estados.map(s => ({ value: s, label: s }));
      else if (field === 'area_id') {
        options = areas.map(a => ({ value: a.id, label: a.name }));
      }

      return (
        <td className={cellClass}>
          <select
            value={value || ''}
            onChange={(e) => updateCell(taskId, field, e.target.value, isNew)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 p-0 cursor-pointer"
          >
            {field === 'area_id' && <option value="">Seleccionar</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </td>
      );
    }

    // Campo de progreso
    if (field === 'progress_percent') {
      return (
        <td className={cellClass}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={value || 0}
              onChange={(e) => updateCell(taskId, field, parseInt(e.target.value), isNew)}
              className="flex-1 h-1.5 accent-indigo-600"
            />
            <span className="text-xs font-semibold text-slate-700 w-10 text-right tabular-nums">{value || 0}%</span>
          </div>
        </td>
      );
    }

    // Campos de fecha
    if (['start_date', 'due_date'].includes(field)) {
      return (
        <td className={cellClass}>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateCell(taskId, field, e.target.value, isNew)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 p-0"
          />
        </td>
      );
    }

    // Campos de texto (titulo, descripcion)
    if (isEditing) {
      const inputId = `cell-${taskId}-${field}`;
      return (
        <td className={cellClass}>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={value || ''}
            onChange={(e) => updateCell(taskId, field, e.target.value, isNew)}
            onBlur={() => {
              // No cerrar si estamos navegando con Tab
              if (!isNavigatingRef.current) {
                setEditingCell(null);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, taskId, field, isNew)}
            onPaste={(e) => handlePaste(e, taskId, field, isNew)}
            className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 p-0"
          />
        </td>
      );
    }

    return (
      <td 
        className={`${cellClass} cursor-text`}
        onClick={() => setEditingCell({ id: taskId, field })}
      >
        <span className={`block truncate ${!value ? 'text-slate-400 italic text-xs' : ''}`}>
          {value || (field === 'title' ? 'Clic para escribir...' : '-')}
        </span>
      </td>
    );
  }

  function renderRow(task, isNew = false) {
    const taskId = isNew ? task._tempId : task.id;
    const hasChanges = !isNew && Object.keys(pendingChanges[taskId] || {}).length > 0;
    const isSelected = !isNew && selectedTasks.has(taskId.toString());

    return (
      <tr key={taskId} className={`group border-b border-slate-100 last:border-b-0 ${isSelected ? 'bg-indigo-50/50' : ''}`}>
        {/* Casilla de selección */}
        {!isNew && (
          <td className="px-4 py-2 text-center bg-slate-50/50 border-r border-slate-200">
            <div className="flex items-center justify-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTaskSelection(taskId)}
                  className="sr-only peer"
                />
                <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200' 
                    : 'bg-white border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50'
                }`}>
                  {isSelected && (
                    <svg 
                      className="absolute inset-0 w-full h-full text-white p-0.5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </div>
              </label>
            </div>
          </td>
        )}
        {isNew && <td className="px-4 py-2 bg-slate-50/50 border-r border-slate-200"></td>}
        {renderCell(task, 'title', isNew)}
        {renderCell(task, 'type', isNew)}
        {renderCell(task, 'priority', isNew)}
        {renderCell(task, 'status', isNew)}
        {renderCell(task, 'area_id', isNew)}
        {renderCell(task, 'progress_percent', isNew)}
        {renderCell(task, 'start_date', isNew)}
        {renderCell(task, 'due_date', isNew)}
        <td className="px-2 py-2 text-center bg-slate-50/50">
          <div className="flex items-center justify-center gap-1">
            {isNew ? (
              <>
                <button
                  onClick={() => saveNewRow(task)}
                  disabled={saving || !task.title}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md disabled:opacity-50 transition-colors"
                  title="Guardar"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => removeNewRow(task._tempId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                {hasChanges && (
                  <button
                    onClick={() => saveChanges(taskId)}
                    disabled={saving}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md disabled:opacity-50 transition-colors"
                    title="Guardar cambios"
                  >
                    <Save className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(taskId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-slate-200">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" strokeWidth={1.75} />
      </div>
    );
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Toolbar compacto */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">{tasks.length} tareas</span>
          {selectedTasks.size > 0 && (
            <span className="text-sm font-medium text-indigo-600">
              {selectedTasks.size} seleccionada(s)
            </span>
          )}
          {hasPendingChanges && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Sin guardar
            </span>
          )}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={saveSelectedTasks}
                disabled={saving || !Array.from(selectedTasks).some(id => pendingChanges[parseInt(id)] && Object.keys(pendingChanges[parseInt(id)]).length > 0)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                Guardar seleccionadas
              </button>
              <button
                onClick={deleteSelectedTasks}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
                Eliminar seleccionadas
              </button>
            </div>
          )}
          {showPastePrompt && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
              <span className="text-xs font-medium text-indigo-700">
                {pastedLines.length} tareas detectadas
              </span>
              <button
                onClick={createMultipleTasksFromPaste}
                disabled={saving}
                className="px-2 py-0.5 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creando...' : 'Crear todas'}
              </button>
              <button
                onClick={() => {
                  setShowPastePrompt(false);
                  setPastedLines([]);
                }}
                className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        <button
          onClick={addNewRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nueva tarea
        </button>
      </div>

      {/* Tabla tipo Excel */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '60px' }}>
                <div className="flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={tasks.length > 0 && selectedTasks.size === tasks.length}
                      onChange={toggleSelectAll}
                      className="sr-only peer"
                      title="Seleccionar todas"
                    />
                    <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
                      tasks.length > 0 && selectedTasks.size === tasks.length
                        ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200' 
                        : 'bg-white/20 border-slate-400 group-hover:border-indigo-300 group-hover:bg-white/30'
                    }`}>
                      {tasks.length > 0 && selectedTasks.size === tasks.length && (
                        <svg 
                          className="absolute inset-0 w-full h-full text-white p-0.5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '25%' }}>
                Titulo
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '10%' }}>
                Tipo
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '8%' }}>
                Prioridad
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '12%' }}>
                Estado
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '15%' }}>
                Area
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '12%' }}>
                Progreso
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '9%' }}>
                Inicio
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-600" style={{ width: '9%' }}>
                Vence
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ width: '70px' }}>
                
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Filas nuevas primero */}
            {newRows.map(row => renderRow(row, true))}
            
            {/* Tareas existentes */}
            {tasks.map(task => renderRow(task, false))}
            
            {/* Fila para agregar si no hay nada */}
            {tasks.length === 0 && newRows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center bg-slate-50">
                  <p className="text-sm text-slate-500 mb-2">No tienes tareas asignadas</p>
                  <button
                    onClick={addNewRow}
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Crear tu primera tarea
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer minimalista */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
        Clic en celda para editar · <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Tab</kbd> siguiente celda · <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Enter</kbd> confirmar · <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Esc</kbd> cancelar · Pega múltiples líneas en título para crear varias tareas
      </div>

      {/* Alertas */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
          <Alert
            type={alert.type}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title={deleteConfirm === 'multiple' ? 'Eliminar Tareas Seleccionadas' : 'Eliminar Tarea'}
        message={deleteConfirm === 'multiple' 
          ? `¿Estás seguro de que deseas eliminar ${selectedTasks.size} tarea(s) seleccionada(s)? Esta acción no se puede deshacer.`
          : '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.'}
        type="warning"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={deleteConfirm === 'multiple' ? confirmDeleteMultiple : confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
