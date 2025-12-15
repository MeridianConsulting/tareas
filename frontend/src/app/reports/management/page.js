// app/reports/management/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../../components/Layout';
import DateRangeFilter from '../../../components/DateRangeFilter';
import { apiRequest } from '../../../lib/api';
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2,
  TrendingUp,
  Target,
  Activity,
  RefreshCw,
  BarChart3,
  LineChart,
  Trophy,
  Calendar,
  Flag
} from 'lucide-react';

// Importar gráficos dinámicamente para evitar SSR issues
const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
});

const ResponsiveLine = dynamic(() => import('@nivo/line').then(m => m.ResponsiveLine), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
});

const ResponsiveBar = dynamic(() => import('@nivo/bar').then(m => m.ResponsiveBar), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
});

export default function ManagementDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  // Inicializar con la fecha de hoy
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [currentPeriod, setCurrentPeriod] = useState('today');

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (!['admin', 'gerencia'].includes(data.data.role)) {
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

  const loadDashboard = useCallback(async (from, to, isRefresh = false) => {
    if (!user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Construir query params
      const reportParams = new URLSearchParams();
      const taskParams = new URLSearchParams();
      
      if (from) {
        reportParams.append('date_from', from);
        taskParams.append('date_from', from);
      }
      if (to) {
        reportParams.append('date_to', to);
        taskParams.append('date_to', to);
      }

      const reportUrl = `/reports/management${reportParams.toString() ? '?' + reportParams.toString() : ''}`;
      const tasksUrl = `/tasks${taskParams.toString() ? '?' + taskParams.toString() : ''}`;
      
      // Cargar datos principales y datos avanzados en paralelo
      const [reportData, tasksData, weeklyRes, quarterlyRes, advancedRes] = await Promise.all([
        apiRequest(reportUrl),
        apiRequest(tasksUrl),
        apiRequest('/reports/weekly-evolution'),
        apiRequest('/reports/quarterly'),
        apiRequest('/reports/advanced-stats')
      ]);
      
      setDashboard(reportData.data);
      setAllTasks(tasksData.data || []);
      setWeeklyData(weeklyRes.data || []);
      setQuarterlyData(quarterlyRes.data || []);
      setAdvancedStats(advancedRes.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboard(dateFrom, dateTo);
    }
  }, [user, dateFrom, dateTo, loadDashboard]);

  const handleDateChange = (from, to, period) => {
    setDateFrom(from || '');
    setDateTo(to || '');
    setCurrentPeriod(period);
  };

  const handleRefresh = () => {
    loadDashboard(dateFrom, dateTo, true);
  };

  // Calcular datos para gráficos
  const getTypeChartData = () => {
    if (!dashboard?.by_type) return [];
    const colors = {
      'Clave': '#f59e0b',
      'Operativa': '#3b82f6',
      'Mejora': '#10b981',
      'Obligatoria': '#ef4444'
    };
    return dashboard.by_type.map(item => ({
      id: item.type,
      label: item.type,
      value: item.count,
      color: colors[item.type] || '#64748b'
    }));
  };

  const getStatusChartData = () => {
    const statusCount = {};
    allTasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
    });
    const colors = {
      'Completada': '#10b981',
      'En progreso': '#3b82f6',
      'En revision': '#8b5cf6',
      'No iniciada': '#94a3b8',
      'En riesgo': '#ef4444'
    };
    return Object.entries(statusCount).map(([status, count]) => ({
      id: status,
      label: status,
      value: count,
      color: colors[status] || '#64748b'
    }));
  };

  // Preparar datos para gráfico de líneas (evolución semanal)
  const getLineChartData = () => {
    if (!weeklyData || weeklyData.length === 0) return [];
    
    return [
      {
        id: 'Creadas',
        color: '#3b82f6',
        data: weeklyData.map(w => ({ x: w.week, y: w.created }))
      },
      {
        id: 'Completadas',
        color: '#10b981',
        data: weeklyData.map(w => ({ x: w.week, y: w.completed }))
      },
      {
        id: 'Vencidas',
        color: '#ef4444',
        data: weeklyData.map(w => ({ x: w.week, y: w.overdue }))
      }
    ];
  };

  // Preparar datos para gráfico de barras (trimestral)
  const getBarChartData = () => {
    if (!quarterlyData || quarterlyData.length === 0) return [];
    
    return quarterlyData.map(q => ({
      quarter: q.label,
      'Completadas': q.completed,
      'Total': q.total - q.completed,
      'Cumplimiento': q.compliance_rate
    }));
  };

  // Preparar datos para gráfico de prioridades
  const getPriorityChartData = () => {
    if (!advancedStats?.by_priority) return [];
    const colors = {
      'Alta': '#ef4444',
      'Media': '#f59e0b',
      'Baja': '#10b981'
    };
    return advancedStats.by_priority.map(item => ({
      id: item.priority,
      label: item.priority,
      value: item.count,
      color: colors[item.priority] || '#64748b'
    }));
  };

  // Calcular KPIs de completitud
  const calculateKPIs = () => {
    const total = dashboard?.general?.total_tasks || 0;
    const completed = dashboard?.general?.completed || 0;
    const inProgress = allTasks.filter(t => t.status === 'En progreso').length;
    const avgProgress = allTasks.length > 0 
      ? Math.round(allTasks.reduce((sum, t) => sum + (t.progress_percent || 0), 0) / allTasks.length)
      : 0;
    
    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgressRate: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      avgProgress,
      onTimeRate: total > 0 ? Math.round(((total - (dashboard?.general?.overdue || 0)) / total) * 100) : 0
    };
  };

  const kpis = calculateKPIs();

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
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard General</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              Vision consolidada del estado de las tareas {getPeriodLabel()}
            </p>
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

        {/* KPIs de Completitud */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.completionRate}%</span>
            </div>
            <p className="text-emerald-100 text-sm font-medium">Tasa de Completitud</p>
            <p className="text-emerald-200 text-xs mt-1">{dashboard?.general?.completed || 0} de {dashboard?.general?.total_tasks || 0} tareas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.avgProgress}%</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Progreso Promedio</p>
            <p className="text-blue-200 text-xs mt-1">Avance general de tareas</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg shadow-violet-200">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.inProgressRate}%</span>
            </div>
            <p className="text-violet-100 text-sm font-medium">En Ejecucion</p>
            <p className="text-violet-200 text-xs mt-1">Tareas activas actualmente</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 opacity-80" strokeWidth={1.5} />
              <span className="text-3xl font-bold tabular-nums">{kpis.onTimeRate}%</span>
            </div>
            <p className="text-amber-100 text-sm font-medium">A Tiempo</p>
            <p className="text-amber-200 text-xs mt-1">Sin retrasos</p>
          </div>
        </div>

        {/* Stats cards secundarios */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.total_tasks || 0}</p>
                <p className="text-xs text-slate-500">Total tareas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.completed || 0}</p>
                <p className="text-xs text-slate-500">Completadas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.at_risk || 0}</p>
                <p className="text-xs text-slate-500">En riesgo</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{dashboard?.general?.overdue || 0}</p>
                <p className="text-xs text-slate-500">Vencidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECCIÓN UNIFICADA DE GRÁFICAS */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">Analisis Grafico</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visualizacion de metricas y tendencias</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 space-y-6">
            {/* Gráfico de Evolución Semanal - Ancho completo */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LineChart className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-800">Evolucion Semanal</h3>
                <span className="text-xs text-slate-500">Ultimas 12 semanas</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4" style={{ height: '280px' }}>
                {getLineChartData().length > 0 && getLineChartData()[0].data.length > 0 ? (
                  <ResponsiveLine
                    data={getLineChartData()}
                    margin={{ top: 20, right: 110, bottom: 40, left: 50 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5
                    }}
                    colors={['#3b82f6', '#10b981', '#ef4444']}
                    pointSize={6}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    useMesh={true}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 6,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 18,
                        symbolSize: 10,
                        symbolShape: 'circle'
                      }
                    ]}
                    enableArea={true}
                    areaOpacity={0.1}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Sin datos de evolucion disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2x2 de gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Distribución por Tipo */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Por Tipo</h3>
                <div className="bg-slate-50 rounded-lg p-3" style={{ height: '220px' }}>
                  {getTypeChartData().length > 0 ? (
                    <ResponsivePie
                      data={getTypeChartData()}
                      margin={{ top: 15, right: 80, bottom: 15, left: 15 }}
                      innerRadius={0.5}
                      padAngle={2}
                      cornerRadius={3}
                      activeOuterRadiusOffset={6}
                      colors={{ datum: 'data.color' }}
                      borderWidth={1}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                      arcLinkLabelsSkipAngle={15}
                      arcLinkLabelsTextColor="#334155"
                      arcLinkLabelsThickness={1.5}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={15}
                      arcLabelsTextColor="#ffffff"
                      legends={[
                        {
                          anchor: 'right',
                          direction: 'column',
                          translateX: 70,
                          translateY: 0,
                          itemsSpacing: 4,
                          itemWidth: 60,
                          itemHeight: 16,
                          itemTextColor: '#64748b',
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

              {/* Distribución por Estado */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Por Estado</h3>
                <div className="bg-slate-50 rounded-lg p-3" style={{ height: '220px' }}>
                  {getStatusChartData().length > 0 ? (
                    <ResponsivePie
                      data={getStatusChartData()}
                      margin={{ top: 15, right: 80, bottom: 15, left: 15 }}
                      innerRadius={0.5}
                      padAngle={2}
                      cornerRadius={3}
                      activeOuterRadiusOffset={6}
                      colors={{ datum: 'data.color' }}
                      borderWidth={1}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                      arcLinkLabelsSkipAngle={15}
                      arcLinkLabelsTextColor="#334155"
                      arcLinkLabelsThickness={1.5}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={15}
                      arcLabelsTextColor="#ffffff"
                      legends={[
                        {
                          anchor: 'right',
                          direction: 'column',
                          translateX: 70,
                          translateY: 0,
                          itemsSpacing: 4,
                          itemWidth: 70,
                          itemHeight: 16,
                          itemTextColor: '#64748b',
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

              {/* Distribución por Prioridad */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Por Prioridad</h3>
                <div className="bg-slate-50 rounded-lg p-3" style={{ height: '220px' }}>
                  {getPriorityChartData().length > 0 ? (
                    <ResponsivePie
                      data={getPriorityChartData()}
                      margin={{ top: 15, right: 80, bottom: 15, left: 15 }}
                      innerRadius={0.5}
                      padAngle={2}
                      cornerRadius={3}
                      activeOuterRadiusOffset={6}
                      colors={{ datum: 'data.color' }}
                      borderWidth={1}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                      arcLinkLabelsSkipAngle={15}
                      arcLinkLabelsTextColor="#334155"
                      arcLinkLabelsThickness={1.5}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={15}
                      arcLabelsTextColor="#ffffff"
                      legends={[
                        {
                          anchor: 'right',
                          direction: 'column',
                          translateX: 70,
                          translateY: 0,
                          itemsSpacing: 4,
                          itemWidth: 60,
                          itemHeight: 16,
                          itemTextColor: '#64748b',
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

              {/* Cumplimiento Trimestral */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Cumplimiento Trimestral</h3>
                <div className="bg-slate-50 rounded-lg p-3" style={{ height: '220px' }}>
                  {getBarChartData().length > 0 ? (
                    <ResponsiveBar
                      data={getBarChartData()}
                      keys={['Completadas', 'Total']}
                      indexBy="quarter"
                      margin={{ top: 15, right: 15, bottom: 35, left: 45 }}
                      padding={0.3}
                      groupMode="stacked"
                      colors={['#10b981', '#e2e8f0']}
                      borderRadius={3}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      Sin datos
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicadores complementarios */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {quarterlyData.map(q => (
                <div key={q.quarter} className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{q.label}</p>
                  <p className={`text-xl font-bold ${
                    q.compliance_rate >= 80 ? 'text-emerald-600' :
                    q.compliance_rate >= 50 ? 'text-blue-600' :
                    q.compliance_rate >= 25 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {q.compliance_rate}%
                  </p>
                  <p className="text-xs text-slate-400">{q.completed}/{q.total}</p>
                </div>
              ))}
            </div>

            {/* KPI de próximas a vencer */}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800">Tareas proximas a vencer (7 dias)</span>
              </div>
              <span className="text-xl font-bold text-amber-700">{advancedStats?.upcoming_due || 0}</span>
            </div>
          </div>
        </div>

        {/* Completitud por Area */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Completitud por Area</h2>
            <p className="text-xs text-slate-500 mt-0.5">Porcentaje de tareas completadas en cada area</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard?.by_area?.map(area => {
                const completionRate = area.total_tasks > 0 
                  ? Math.round((area.completed / area.total_tasks) * 100) 
                  : 0;
                const progressColor = completionRate >= 80 ? 'bg-emerald-500' : 
                                     completionRate >= 50 ? 'bg-blue-500' : 
                                     completionRate >= 25 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div key={area.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 text-sm">{area.area_name}</h3>
                        <p className="text-xs text-slate-500">{area.total_tasks} tareas</p>
                      </div>
                      <span className={`text-lg font-bold tabular-nums ${
                        completionRate >= 80 ? 'text-emerald-600' : 
                        completionRate >= 50 ? 'text-blue-600' : 
                        completionRate >= 25 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {area.completed} completadas
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {area.at_risk} en riesgo
                      </span>
                    </div>
                  </div>
                );
              }) || (
                <div className="col-span-full text-center py-8 text-slate-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla resumen por area */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Detalle por Area</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Area</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Total</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Completadas</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">En Riesgo</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Vencidas</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">% Completitud</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Progreso Prom.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard?.by_area?.map(area => {
                  const completionRate = area.total_tasks > 0 
                    ? Math.round((area.completed / area.total_tasks) * 100) 
                    : 0;
                  return (
                    <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-slate-900">{area.area_name}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 text-center tabular-nums">{area.total_tasks}</td>
                      <td className="px-5 py-3 text-sm text-emerald-600 text-center tabular-nums font-medium">{area.completed}</td>
                      <td className="px-5 py-3 text-sm text-rose-600 text-center tabular-nums font-medium">{area.at_risk}</td>
                      <td className="px-5 py-3 text-sm text-amber-600 text-center tabular-nums font-medium">{area.overdue}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          completionRate >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          completionRate >= 50 ? 'bg-blue-100 text-blue-700' : 
                          completionRate >= 25 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {completionRate}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${area.avg_progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600 tabular-nums w-8">{Math.round(area.avg_progress || 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Usuarios por Productividad */}
        {advancedStats?.top_users && advancedStats.top_users.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Top Usuarios por Productividad</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ranking basado en tareas completadas</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {advancedStats.top_users.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-amber-500' :
                      index === 1 ? 'bg-slate-400' :
                      index === 2 ? 'bg-amber-700' : 'bg-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.completed} de {user.total_tasks} tareas completadas</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Cumplimiento</p>
                        <p className={`text-lg font-bold ${
                          user.completion_rate >= 80 ? 'text-emerald-600' :
                          user.completion_rate >= 50 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {user.completion_rate}%
                        </p>
                      </div>
                      <div className="w-20">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              user.completion_rate >= 80 ? 'bg-emerald-500' :
                              user.completion_rate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${user.completion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
