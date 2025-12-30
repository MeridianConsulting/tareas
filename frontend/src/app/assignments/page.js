// app/assignments/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import AssignTaskModal from '../../components/AssignTaskModal';
import { apiRequest } from '../../lib/api';
import { 
  Bell, 
  Send,
  Inbox,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  Clock,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received'); // 'received' or 'sent'
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.data);
      } catch (e) {
        router.push('/login/');
      }
    }
    loadUser();
  }, [router]);

  const loadAssignments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const endpoint = tab === 'received' ? '/assignments/my' : '/assignments/sent';
      const data = await apiRequest(endpoint);
      setAssignments(data.data || []);
    } catch (e) {
      // Error loading assignments
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user, loadAssignments]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiRequest(`/assignments/${id}/read`, { method: 'PUT' });
      setAssignments(prev => prev.map(a => 
        a.id === id ? { ...a, is_read: 1 } : a
      ));
    } catch (e) {
      // Error marking as read
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/assignments/mark-all-read', { method: 'PUT' });
      setAssignments(prev => prev.map(a => ({ ...a, is_read: 1 })));
    } catch (e) {
      // Error marking all as read
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await apiRequest(`/assignments/${id}`, { method: 'DELETE' });
      setAssignments(prev => prev.filter(a => a.id !== id));
      setShowDeleteConfirm(null);
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = 
      a.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assigned_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterRead === 'all' ? true :
      filterRead === 'unread' ? !a.is_read :
      a.is_read;

    return matchesSearch && matchesFilter;
  });

  const unreadCount = assignments.filter(a => !a.is_read).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Media': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Baja': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada': return 'bg-emerald-50 text-emerald-700';
      case 'En progreso': return 'bg-blue-50 text-blue-700';
      case 'En riesgo': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  if (loading && !user) {
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
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
              <Bell className="w-7 h-7 text-indigo-600" strokeWidth={1.75} />
              Asignaciones de Tareas
            </h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              Gestiona las tareas que te han asignado y las que has enviado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAssignments(true)}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Asignar Tarea
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setTab('received')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'received' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Recibidas
            {unreadCount > 0 && tab === 'received' && (
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'sent' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviadas
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tarea o usuario..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {tab === 'received' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterRead}
                onChange={e => setFilterRead(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">Todas</option>
                <option value="unread">No leídas</option>
                <option value="read">Leídas</option>
              </select>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como leídas
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lista de asignaciones */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className={`p-5 hover:bg-slate-50 transition-colors ${
                    !assignment.is_read && tab === 'received' ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {(tab === 'received' ? assignment.assigned_by_name : assignment.assigned_to_name)?.charAt(0).toUpperCase()}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">
                          {tab === 'received' ? assignment.assigned_by_name : assignment.assigned_to_name}
                        </span>
                        <span className="text-sm text-slate-500">
                          {tab === 'received' ? 'te asignó' : 'recibió'}
                        </span>
                        {!assignment.is_read && tab === 'received' && (
                          <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                            Nueva
                          </span>
                        )}
                      </div>

                      {/* Tarea */}
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">{assignment.task_title}</span>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded border ${getPriorityColor(assignment.task_priority)}`}>
                          {assignment.task_priority || 'Media'}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${getStatusColor(assignment.task_status)}`}>
                          {assignment.task_status}
                        </span>
                        {assignment.task_due_date && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            Vence: {new Date(assignment.task_due_date).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        {assignment.area_name && (
                          <span className="text-slate-500">
                            • {assignment.area_name}
                          </span>
                        )}
                      </div>

                      {/* Mensaje */}
                      {assignment.message && (
                        <div className="mt-3 p-3 bg-slate-100 rounded-lg">
                          <p className="text-sm text-slate-600 italic">"{assignment.message}"</p>
                        </div>
                      )}

                      {/* Fecha */}
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(assignment.created_at)}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!assignment.is_read && tab === 'received' && (
                        <button
                          onClick={() => handleMarkAsRead(assignment.id)}
                          className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(assignment.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              {tab === 'received' ? (
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              ) : (
                <Send className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              )}
              <p className="text-sm font-medium text-slate-900 mb-1">
                {searchTerm || filterRead !== 'all' 
                  ? 'No se encontraron asignaciones' 
                  : tab === 'received' 
                    ? 'No tienes tareas asignadas' 
                    : 'No has asignado tareas'}
              </p>
              <p className="text-sm text-slate-500">
                {tab === 'received' 
                  ? 'Las tareas que te asignen aparecerán aquí'
                  : 'Usa el botón "Asignar Tarea" para asignar tareas a otros usuarios'}
              </p>
            </div>
          )}
        </div>

        {/* Contador */}
        {assignments.length > 0 && (
          <p className="mt-4 text-sm text-slate-500">
            Mostrando {filteredAssignments.length} de {assignments.length} asignaciones
          </p>
        )}
      </div>

      {/* Modal de asignar tarea */}
      <AssignTaskModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => {
          loadAssignments();
          setTab('sent');
        }}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Eliminar Asignación</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta asignación?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

