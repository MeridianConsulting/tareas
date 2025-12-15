// components/NotificationBell.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../lib/api';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  X,
  ChevronRight,
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(null);
  const dropdownRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await apiRequest('/assignments/unread-count');
      setUnreadCount(data.data?.count || 0);
    } catch (e) {
      console.error('Error loading unread count:', e);
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/assignments/my?limit=10');
      setAssignments(data.data || []);
    } catch (e) {
      console.error('Error loading assignments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
    }
  }, [isOpen, loadAssignments]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    setMarkingRead(id);
    try {
      await apiRequest(`/assignments/${id}/read`, { method: 'PUT' });
      setAssignments(prev => prev.map(a => 
        a.id === id ? { ...a, is_read: 1 } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking as read:', e);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/assignments/mark-all-read', { method: 'PUT' });
      setAssignments(prev => prev.map(a => ({ ...a, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'text-rose-600 bg-rose-50';
      case 'Media': return 'text-amber-600 bg-amber-50';
      case 'Baja': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Tareas asignadas"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-900">Tareas Asignadas</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de asignaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : assignments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {assignments.map(assignment => (
                  <div
                    key={assignment.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      !assignment.is_read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar de quien asignó */}
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {assignment.assigned_by_name?.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Info de quién asignó */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {assignment.assigned_by_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            te asignó una tarea
                          </span>
                        </div>
                        
                        {/* Título de la tarea */}
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-800 font-medium truncate">
                            {assignment.task_title}
                          </span>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${getPriorityColor(assignment.task_priority)}`}>
                            {assignment.task_priority || 'Media'}
                          </span>
                          {assignment.task_due_date && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              {new Date(assignment.task_due_date).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: 'short' 
                              })}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {formatDate(assignment.created_at)}
                          </span>
                        </div>

                        {/* Mensaje opcional */}
                        {assignment.message && (
                          <p className="mt-2 text-xs text-slate-600 bg-slate-100 rounded p-2 italic">
                            "{assignment.message}"
                          </p>
                        )}
                      </div>

                      {/* Botón marcar como leída */}
                      {!assignment.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(assignment.id)}
                          disabled={markingRead === assignment.id}
                          className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
                          title="Marcar como leída"
                        >
                          {markingRead === assignment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900 mb-1">No hay asignaciones</p>
                <p className="text-xs text-slate-500">Las tareas que te asignen aparecerán aquí</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {assignments.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <a
                href="/assignments"
                className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Ver todas las asignaciones
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

