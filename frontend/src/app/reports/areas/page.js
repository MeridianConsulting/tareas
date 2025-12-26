// app/reports/areas/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../../components/Layout';
import DateRangeFilter from '../../../components/DateRangeFilter';
import { apiRequest } from '../../../lib/api';
import { 
  Building2,
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2,
  Target,
  Activity,
  TrendingUp,
  Users,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

// Importar Pie chart dinámicamente
const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
});

export default function AreasDashboard() {
  const router = useRouter();
  const [areas, setAreas] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [expandedAreas, setExpandedAreas] = useState({});
  // Inicializar con la fecha de hoy
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [currentPeriod, setCurrentPeriod] = useState('today');

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (!['admin', 'lider_area'].includes(data.data.role)) {
          router.push('/dashboard');
          return;
        }
        setUser(data.data);
      } catch (e) {
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  const loadData = useCallback(async (from, to, isRefresh = false) => {
    if (!user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const taskParams = new URLSearchParams();
      if (from) taskParams.append('date_from', from);
      if (to) taskParams.append('date_to', to);
      
      const tasksUrl = `/tasks${taskParams.toString() ? '?' + taskParams.toString() : ''}`;
      
      const [areasData, tasksData, usersData] = await Promise.all([
        apiRequest('/areas'),
        apiRequest(tasksUrl),
        apiRequest('/users')
      ]);
      setAreas(areasData.data || []);
      setAllTasks(tasksData.data || []);
      setUsers(usersData.data || []);
    } catch (e) {
      // Error loading data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData(dateFrom, dateTo);
    }
  }, [user, dateFrom, dateTo, loadData]);

  const handleDateChange = (from, to, period) => {
    setDateFrom(from || '');
    setDateTo(to || '');
    setCurrentPeriod(period);
  };

  const handleRefresh = () => {
    loadData(dateFrom, dateTo, true);
  };

  // Obtener datos de un área específica
  function getAreaData(areaId) {
    const areaTasks = allTasks.filter(t => t.area_id == areaId);
    const areaUsers = users.filter(u => u.area_id == areaId);
    
    const total = areaTasks.length;
    const completed = areaTasks.filter(t => t.status === 'Completada').length;
    const inProgress = areaTasks.filter(t => t.status === 'En progreso').length;
    const atRisk = areaTasks.filter(t => t.status === 'En riesgo').length;
    const notStarted = areaTasks.filter(t => t.status === 'No iniciada').length;
    const overdue = areaTasks.filter(t => {
      if (!t.due_date || t.status === 'Completada') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    
    const avgProgress = total > 0 
      ? Math.round(areaTasks.reduce((sum, t) => sum + (t.progress_percent || 0), 0) / total)
      : 0;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Datos para gráfico de tipos
    const typeCount = {};
    areaTasks.forEach(t => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    const typeColors = {
      'Clave': '#f59e0b',
      'Operativa': '#3b82f6',
      'Mejora': '#10b981',
      'Obligatoria': '#ef4444'
    };
    const typeData = Object.entries(typeCount).map(([type, count]) => ({
      id: type,
      label: type,
      value: count,
      color: typeColors[type] || '#64748b'
    }));

    // Datos para gráfico de estados
    const statusColors = {
      'Completada': '#10b981',
      'En progreso': '#3b82f6',
      'En revision': '#8b5cf6',
      'No iniciada': '#94a3b8',
      'En riesgo': '#ef4444'
    };
    const statusData = [
      { id: 'Completada', label: 'Completada', value: completed, color: statusColors['Completada'] },
      { id: 'En progreso', label: 'En progreso', value: inProgress, color: statusColors['En progreso'] },
      { id: 'No iniciada', label: 'No iniciada', value: notStarted, color: statusColors['No iniciada'] },
      { id: 'En riesgo', label: 'En riesgo', value: atRisk, color: statusColors['En riesgo'] },
    ].filter(s => s.value > 0);

    return {
      total,
      completed,
      inProgress,
      atRisk,
      notStarted,
      overdue,
      avgProgress,
      completionRate,
      typeData,
      statusData,
      users: areaUsers,
      tasks: areaTasks
    };
  }

  function toggleArea(areaId) {
    setExpandedAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" strokeWidth={1.75} />
        </div>
      </Layout>
    );
  }

  const getPeriodLabel = () => {
    const labels = {
      'today': 'de hoy',
      'week': 'de esta semana',
      'month': 'de este mes',
      'quarter': 'de este trimestre',
      'semester': 'de este semestre',
      'year': 'de este año',
      'all': '',
      'custom': 'del rango seleccionado'
    };
    return labels[currentPeriod] || '';
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-hidden">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard por Area</h1>
            <p className="text-slate-500 mt-0.5 text-sm">KPIs y graficos {getPeriodLabel()} para cada area</p>
          </div>
          
          {/* Filtros de fecha */}
          <div className="flex items-center gap-3">
            <DateRangeFilter 
              onChange={handleDateChange}
              defaultPeriod="today"
            />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Grid de áreas */}
        <div className="space-y-4">
          {areas.map(area => {
            const data = getAreaData(area.id);
            const isExpanded = expandedAreas[area.id];
            
            if (data.total === 0) return null; // Ocultar áreas sin tareas

            return (
              <div key={area.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Header del área - Siempre visible */}
                <button
                  onClick={() => toggleArea(area.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-indigo-600" strokeWidth={1.75} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-slate-900">{area.name}</h2>
                      <p className="text-sm text-slate-500">{data.total} tareas · {data.users.length} miembros</p>
                    </div>
                  </div>
                  
                  {/* KPIs resumidos */}
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-xl font-bold tabular-nums ${
                          data.completionRate >= 80 ? 'text-emerald-600' : 
                          data.completionRate >= 50 ? 'text-blue-600' : 
                          data.completionRate >= 25 ? 'text-amber-600' : 'text-rose-600'
                        }`}>{data.completionRate}%</p>
                        <p className="text-xs text-slate-500">Completitud</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-indigo-600 tabular-nums">{data.avgProgress}%</p>
                        <p className="text-xs text-slate-500">Progreso</p>
                      </div>
                      {data.atRisk > 0 && (
                        <div className="text-center">
                          <p className="text-xl font-bold text-rose-600 tabular-nums">{data.atRisk}</p>
                          <p className="text-xs text-slate-500">En riesgo</p>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="border-t border-slate-200">
                    {/* KPIs del área */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50">
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{data.completionRate}%</p>
                            <p className="text-xs text-slate-500">Tasa Completitud</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{data.avgProgress}%</p>
                            <p className="text-xs text-slate-500">Progreso Prom.</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-violet-600" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{data.inProgress}</p>
                            <p className="text-xs text-slate-500">En Ejecucion</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{data.atRisk + data.overdue}</p>
                            <p className="text-xs text-slate-500">Riesgo/Vencidas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
                      {/* Gráfico por Tipo */}
                      <div className="p-5 border-r border-b lg:border-b-0 border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Por Tipo de Tarea</h3>
                        <div style={{ height: '200px' }}>
                          {data.typeData.length > 0 ? (
                            <ResponsivePie
                              data={data.typeData}
                              margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
                              innerRadius={0.5}
                              padAngle={2}
                              cornerRadius={3}
                              activeOuterRadiusOffset={5}
                              colors={{ datum: 'data.color' }}
                              borderWidth={1}
                              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                              enableArcLinkLabels={false}
                              arcLabelsSkipAngle={10}
                              arcLabelsTextColor="#ffffff"
                              legends={[
                                {
                                  anchor: 'right',
                                  direction: 'column',
                                  translateX: 90,
                                  translateY: 0,
                                  itemsSpacing: 4,
                                  itemWidth: 80,
                                  itemHeight: 18,
                                  itemTextColor: '#64748b',
                                  itemDirection: 'left-to-right',
                                  symbolSize: 10,
                                  symbolShape: 'circle'
                                }
                              ]}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                              Sin datos
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gráfico por Estado */}
                      <div className="p-5 border-b lg:border-b-0 border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Por Estado</h3>
                        <div style={{ height: '200px' }}>
                          {data.statusData.length > 0 ? (
                            <ResponsivePie
                              data={data.statusData}
                              margin={{ top: 10, right: 100, bottom: 10, left: 10 }}
                              innerRadius={0.5}
                              padAngle={2}
                              cornerRadius={3}
                              activeOuterRadiusOffset={5}
                              colors={{ datum: 'data.color' }}
                              borderWidth={1}
                              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                              enableArcLinkLabels={false}
                              arcLabelsSkipAngle={10}
                              arcLabelsTextColor="#ffffff"
                              legends={[
                                {
                                  anchor: 'right',
                                  direction: 'column',
                                  translateX: 90,
                                  translateY: 0,
                                  itemsSpacing: 4,
                                  itemWidth: 80,
                                  itemHeight: 18,
                                  itemTextColor: '#64748b',
                                  itemDirection: 'left-to-right',
                                  symbolSize: 10,
                                  symbolShape: 'circle'
                                }
                              ]}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                              Sin datos
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas detalladas */}
                    <div className="p-5 border-t border-slate-200 bg-slate-50">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-slate-900 tabular-nums">{data.total}</p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-600 tabular-nums">{data.completed}</p>
                          <p className="text-xs text-slate-500">Completadas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600 tabular-nums">{data.inProgress}</p>
                          <p className="text-xs text-slate-500">En Progreso</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-500 tabular-nums">{data.notStarted}</p>
                          <p className="text-xs text-slate-500">No Iniciadas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amber-600 tabular-nums">{data.overdue}</p>
                          <p className="text-xs text-slate-500">Vencidas</p>
                        </div>
                      </div>
                    </div>

                    {/* Miembros del equipo */}
                    {data.users.length > 0 && (
                      <div className="p-5 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Equipo ({data.users.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.users.map(u => {
                            const userTasks = data.tasks.filter(t => t.responsible_id == u.id);
                            const userCompleted = userTasks.filter(t => t.status === 'Completada').length;
                            return (
                              <div key={u.id} className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
                                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-slate-700">{u.name}</span>
                                <span className="text-xs text-slate-500">
                                  {userCompleted}/{userTasks.length}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mensaje si no hay áreas con tareas */}
          {areas.filter(a => getAreaData(a.id).total > 0).length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Sin datos por area</h3>
              <p className="text-slate-500">No hay tareas asignadas a ninguna area</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

