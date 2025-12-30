// app/admin/areas/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { apiRequest } from '../../../lib/api';
import { 
  Plus, 
  X, 
  Building2, 
  Loader2, 
  Pencil, 
  Trash2, 
  Check,
  AlertTriangle,
  Search
} from 'lucide-react';

export default function AreasPage() {
  const router = useRouter();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', type: 'AREA' });

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (data.data.role !== 'admin') {
          router.push('/dashboard/');
          return;
        }
        setUser(data.data);
      } catch (e) {
        router.push('/login/');
      }
    }
    loadUser();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadAreas();
  }, [user]);

  async function loadAreas() {
    try {
      const data = await apiRequest('/areas');
      setAreas(data.data || []);
    } catch (e) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ name: '', code: '', type: 'AREA' });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(area) {
    setFormData({
      name: area.name,
      code: area.code,
      type: area.type || 'AREA'
    });
    setEditingId(area.id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingId) {
        await apiRequest(`/areas/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiRequest('/areas', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      resetForm();
      await loadAreas();
    } catch (e) {
      alert('Error al guardar área: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await apiRequest(`/areas/${id}`, {
        method: 'DELETE',
      });
      setShowDeleteConfirm(null);
      await loadAreas();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    } finally {
      setDeleting(null);
    }
  }

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestión de Áreas</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Administra las áreas y proyectos de la organización</p>
          </div>
          <button
            onClick={() => {
              if (showForm && !editingId) {
                resetForm();
              } else {
                resetForm();
                setShowForm(true);
              }
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              showForm && !editingId
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
            }`}
          >
            {showForm && !editingId ? (
              <>
                <X className="w-5 h-5" strokeWidth={2} />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" strokeWidth={2} />
                Nueva Área
              </>
            )}
          </button>
        </div>

        {/* Formulario de crear/editar */}
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              {editingId ? 'Editar Área' : 'Crear Nueva Área'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Recursos Humanos"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
                    Código <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="Ej: RRHH"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white"
                  >
                    <option value="AREA">Área</option>
                    <option value="PROYECTO">Proyecto</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    <Check className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  )}
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Área'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar áreas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tabla de áreas */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Código</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAreas.length > 0 ? (
                  filteredAreas.map(area => (
                    <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums">{area.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{area.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                          {area.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                          area.type === 'AREA' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-violet-50 text-violet-700'
                        }`}>
                          {area.type === 'AREA' ? 'Área' : 'Proyecto'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(area)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(area.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Building2 className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          {searchTerm ? 'No se encontraron áreas' : 'No hay áreas registradas'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primera área para comenzar'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contador */}
        {areas.length > 0 && (
          <p className="mt-4 text-sm text-slate-500">
            Mostrando {filteredAreas.length} de {areas.length} áreas
          </p>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Eliminar Área</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta área? Si tiene usuarios o tareas asociadas, no podrá ser eliminada.
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
