// app/reports/download/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import DateRangeFilter from '../../../components/DateRangeFilter';
import { apiRequest } from '../../../lib/api';
import { 
  FileDown,
  Building2,
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2,
  Target,
  Activity,
  TrendingUp,
  ClipboardList,
  FileText,
  Eye,
  Download
} from 'lucide-react';

export default function ReportsDownload() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [areas, setAreas] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  
  // Filtros
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [currentPeriod, setCurrentPeriod] = useState('today');
  const [reportType, setReportType] = useState('general');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest('/auth/me');
        if (!['admin', 'gerencia', 'lider_area'].includes(data.data.role)) {
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

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const taskParams = new URLSearchParams();
      if (dateFrom) taskParams.append('date_from', dateFrom);
      if (dateTo) taskParams.append('date_to', dateTo);
      
      const reportParams = new URLSearchParams();
      if (dateFrom) reportParams.append('date_from', dateFrom);
      if (dateTo) reportParams.append('date_to', dateTo);
      
      const tasksUrl = `/tasks${taskParams.toString() ? '?' + taskParams.toString() : ''}`;
      const reportUrl = `/reports/management${reportParams.toString() ? '?' + reportParams.toString() : ''}`;
      
      const [areasData, tasksData, usersData, reportData] = await Promise.all([
        apiRequest('/areas'),
        apiRequest(tasksUrl),
        apiRequest('/users'),
        apiRequest(reportUrl)
      ]);
      
      setAreas(areasData.data || []);
      setAllTasks(tasksData.data || []);
      setUsers(usersData.data || []);
      setDashboard(reportData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, dateFrom, dateTo]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateFrom, dateTo, loadData]);

  const handleDateChange = (from, to, period) => {
    setDateFrom(from || '');
    setDateTo(to || '');
    setCurrentPeriod(period);
    setShowPreview(false);
  };

  // Obtener datos de un área específica
  function getAreaData(areaId) {
    const area = areas.find(a => a.id == areaId);
    const areaTasks = allTasks.filter(t => t.area_id == areaId);
    
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

    const typeCount = {};
    areaTasks.forEach(t => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

    const statusData = [
      { status: 'Completada', count: completed },
      { status: 'En progreso', count: inProgress },
      { status: 'No iniciada', count: notStarted },
      { status: 'En riesgo', count: atRisk },
    ].filter(s => s.count > 0);

    return {
      area,
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
      tasks: areaTasks
    };
  }

  // Calcular datos generales
  function getGeneralData() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'Completada').length;
    const inProgress = allTasks.filter(t => t.status === 'En progreso').length;
    const atRisk = allTasks.filter(t => t.status === 'En riesgo').length;
    const notStarted = allTasks.filter(t => t.status === 'No iniciada').length;
    const overdue = allTasks.filter(t => {
      if (!t.due_date || t.status === 'Completada') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    
    const avgProgress = total > 0 
      ? Math.round(allTasks.reduce((sum, t) => sum + (t.progress_percent || 0), 0) / total)
      : 0;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const typeCount = {};
    allTasks.forEach(t => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

    const statusCount = {};
    allTasks.forEach(t => {
      statusCount[t.status] = (statusCount[t.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCount).map(([status, count]) => ({ status, count }));

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
      tasks: allTasks
    };
  }

  const getPeriodLabel = () => {
    const labels = {
      'today': 'Hoy',
      'week': 'Esta semana',
      'month': 'Este mes',
      'quarter': 'Este trimestre',
      'semester': 'Este semestre',
      'year': 'Este año',
      'all': 'Todo el tiempo',
      'custom': `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`
    };
    return labels[currentPeriod] || '';
  };

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Generar PDF usando jsPDF
  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = margin;

      const data = reportType === 'general' ? getGeneralData() : getAreaData(selectedAreaId);
      const title = reportType === 'general' ? 'Reporte General de Tareas' : `Reporte de ${data.area?.name || 'Area'}`;

      // Colores
      const primaryColor = [79, 70, 229]; // Indigo
      const greenColor = [5, 150, 105];
      const blueColor = [37, 99, 235];
      const roseColor = [225, 29, 72];
      const amberColor = [217, 119, 6];
      const slateColor = [100, 116, 139];

      // === ENCABEZADO ===
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, 18);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestion de Tareas', margin, 26);

      doc.setFontSize(9);
      doc.text(`Periodo: ${getPeriodLabel()}`, pageWidth - margin, 18, { align: 'right' });
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin, 26, { align: 'right' });

      y = 45;

      // === KPIs PRINCIPALES ===
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Indicadores Clave de Rendimiento', margin, y);
      y += 8;

      const kpiWidth = (pageWidth - margin * 2 - 15) / 4;
      const kpis = [
        { label: 'Completitud', value: `${data.completionRate}%`, color: greenColor },
        { label: 'Progreso Prom.', value: `${data.avgProgress}%`, color: blueColor },
        { label: 'En Ejecucion', value: `${data.inProgress}`, color: [124, 58, 237] },
        { label: 'Riesgo/Vencidas', value: `${data.atRisk + data.overdue}`, color: roseColor },
      ];

      kpis.forEach((kpi, i) => {
        const x = margin + i * (kpiWidth + 5);
        doc.setFillColor(...kpi.color);
        doc.roundedRect(x, y, kpiWidth, 22, 3, 3, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x + kpiWidth / 2, y + 10, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(kpi.label, x + kpiWidth / 2, y + 17, { align: 'center' });
      });

      y += 32;

      // === ESTADÍSTICAS SECUNDARIAS ===
      const statWidth = (pageWidth - margin * 2 - 20) / 5;
      const stats = [
        { label: 'Total', value: data.total, color: slateColor },
        { label: 'Completadas', value: data.completed, color: greenColor },
        { label: 'En Progreso', value: data.inProgress, color: blueColor },
        { label: 'En Riesgo', value: data.atRisk, color: roseColor },
        { label: 'Vencidas', value: data.overdue, color: amberColor },
      ];

      stats.forEach((stat, i) => {
        const x = margin + i * (statWidth + 5);
        doc.setDrawColor(...stat.color);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, statWidth, 18, 2, 2, 'FD');
        
        doc.setTextColor(...stat.color);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${stat.value}`, x + statWidth / 2, y + 8, { align: 'center' });
        
        doc.setTextColor(...slateColor);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label, x + statWidth / 2, y + 14, { align: 'center' });
      });

      y += 28;

      // === DISTRIBUCIÓN POR TIPO Y ESTADO ===
      const halfWidth = (pageWidth - margin * 2 - 10) / 2;

      // Por Tipo
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribucion por Tipo', margin, y);
      
      let typeY = y + 6;
      const typeColors = {
        'Clave': amberColor,
        'Operativa': blueColor,
        'Mejora': greenColor,
        'Obligatoria': roseColor
      };

      data.typeData.forEach(item => {
        const pct = data.total > 0 ? (item.count / data.total) * 100 : 0;
        
        doc.setTextColor(...slateColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(item.type, margin, typeY);
        
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin + 30, typeY - 3, 40, 4, 1, 1, 'F');
        
        doc.setFillColor(...(typeColors[item.type] || slateColor));
        doc.roundedRect(margin + 30, typeY - 3, 40 * (pct / 100), 4, 1, 1, 'F');
        
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.count}`, margin + 75, typeY);
        
        typeY += 7;
      });

      // Por Estado
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribucion por Estado', margin + halfWidth + 10, y);
      
      let statusY = y + 6;
      const statusColors = {
        'Completada': greenColor,
        'En progreso': blueColor,
        'En riesgo': roseColor,
        'No iniciada': slateColor
      };

      data.statusData.forEach(item => {
        const pct = data.total > 0 ? (item.count / data.total) * 100 : 0;
        
        doc.setTextColor(...slateColor);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(item.status, margin + halfWidth + 10, statusY);
        
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin + halfWidth + 45, statusY - 3, 40, 4, 1, 1, 'F');
        
        doc.setFillColor(...(statusColors[item.status] || slateColor));
        doc.roundedRect(margin + halfWidth + 45, statusY - 3, 40 * (pct / 100), 4, 1, 1, 'F');
        
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.count}`, margin + halfWidth + 90, statusY);
        
        statusY += 7;
      });

      y = Math.max(typeY, statusY) + 10;

      // === RESUMEN POR ÁREA (solo en reporte general) ===
      if (reportType === 'general' && dashboard?.by_area?.filter(a => a.total_tasks > 0).length > 0) {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = margin;
        }

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen por Area', margin, y);
        y += 6;

        // Header de tabla
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        
        doc.setTextColor(...slateColor);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('AREA', margin + 2, y + 5);
        doc.text('TOTAL', margin + 60, y + 5);
        doc.text('COMPLETADAS', margin + 80, y + 5);
        doc.text('RIESGO', margin + 115, y + 5);
        doc.text('% COMPL.', margin + 140, y + 5);
        y += 8;

        dashboard.by_area.filter(a => a.total_tasks > 0).slice(0, 8).forEach((area, i) => {
          const pct = area.total_tasks > 0 ? Math.round((area.completed / area.total_tasks) * 100) : 0;
          
          if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 1, pageWidth - margin * 2, 6, 'F');
          }
          
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(area.area_name.substring(0, 25), margin + 2, y + 3);
          doc.text(`${area.total_tasks}`, margin + 60, y + 3);
          
          doc.setTextColor(...greenColor);
          doc.text(`${area.completed}`, margin + 80, y + 3);
          
          doc.setTextColor(...roseColor);
          doc.text(`${area.at_risk}`, margin + 115, y + 3);
          
          doc.setTextColor(...(pct >= 80 ? greenColor : pct >= 50 ? blueColor : amberColor));
          doc.setFont('helvetica', 'bold');
          doc.text(`${pct}%`, margin + 140, y + 3);
          
          y += 6;
        });

        y += 5;
      }

      // === TABLA DE TAREAS ===
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
      }

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Tareas', margin, y);
      y += 6;

      // Header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
      
      doc.setTextColor(...slateColor);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('TITULO', margin + 2, y + 5);
      doc.text('TIPO', margin + 85, y + 5);
      doc.text('ESTADO', margin + 115, y + 5);
      doc.text('PROGRESO', margin + 150, y + 5);
      y += 8;

      const tasksToShow = data.tasks.slice(0, 15);
      tasksToShow.forEach((task, i) => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = margin;
        }

        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 1, pageWidth - margin * 2, 6, 'F');
        }
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(task.title.substring(0, 40), margin + 2, y + 3);
        
        const typeColor = typeColors[task.type] || slateColor;
        doc.setTextColor(...typeColor);
        doc.text(task.type, margin + 85, y + 3);
        
        const statusColor = statusColors[task.status] || slateColor;
        doc.setTextColor(...statusColor);
        doc.text(task.status, margin + 115, y + 3);
        
        doc.setTextColor(30, 41, 59);
        doc.text(`${task.progress_percent}%`, margin + 150, y + 3);
        
        y += 6;
      });

      if (data.tasks.length > 15) {
        doc.setTextColor(...slateColor);
        doc.setFontSize(7);
        doc.text(`Mostrando 15 de ${data.tasks.length} tareas`, margin, y + 5);
      }

      // === PIE DE PÁGINA ===
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setTextColor(...slateColor);
      doc.setFontSize(8);
      doc.text(`Generado por: ${user?.name || 'Usuario'}`, margin, pageHeight - 10);
      doc.text('Sistema de Gestion de Tareas', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // Guardar
      const fileName = reportType === 'general' 
        ? `Reporte_General_${dateFrom}_${dateTo}.pdf`
        : `Reporte_${data.area?.name || 'Area'}_${dateFrom}_${dateTo}.pdf`;
      
      doc.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  const data = reportType === 'general' ? getGeneralData() : (selectedAreaId ? getAreaData(selectedAreaId) : null);

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
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
            <FileDown className="w-7 h-7 text-indigo-600" strokeWidth={1.75} />
            Generador de Reportes
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">Genera y descarga reportes en PDF con estadisticas detalladas</p>
        </div>

        {/* Panel de configuración */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Configuracion del Reporte
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de reporte */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setSelectedAreaId('');
                  setShowPreview(false);
                }}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="general">Reporte General</option>
                <option value="area">Reporte por Area</option>
              </select>
            </div>

            {/* Selección de área */}
            {reportType === 'area' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
                  Seleccionar Area
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => {
                    setSelectedAreaId(e.target.value);
                    setShowPreview(false);
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Seleccione un area...</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Período */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
                Periodo
              </label>
              <DateRangeFilter 
                onChange={handleDateChange}
                defaultPeriod="today"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowPreview(true)}
                disabled={loading || (reportType === 'area' && !selectedAreaId)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Vista Previa
              </button>
              <button
                onClick={generatePDF}
                disabled={generating || loading || (reportType === 'area' && !selectedAreaId)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {generating ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Vista previa del reporte */}
        {showPreview && data && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-slate-600" />
                Vista Previa del Reporte
              </h2>
            </div>
            
            <div className="p-6">
              {/* Encabezado */}
              <div className="border-b-2 border-indigo-600 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  {reportType === 'general' ? 'Reporte General de Tareas' : `Reporte de ${data.area?.name || 'Area'}`}
                </h1>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-slate-600">Sistema de Gestion de Tareas</p>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Periodo: <span className="font-semibold text-indigo-600">{getPeriodLabel()}</span></p>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-700">{data.completionRate}%</p>
                      <p className="text-xs text-emerald-600">Completitud</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{data.avgProgress}%</p>
                      <p className="text-xs text-blue-600">Progreso Prom.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-violet-600" />
                    <div>
                      <p className="text-2xl font-bold text-violet-700">{data.inProgress}</p>
                      <p className="text-xs text-violet-600">En Ejecucion</p>
                    </div>
                  </div>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 border border-rose-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-rose-600" />
                    <div>
                      <p className="text-2xl font-bold text-rose-700">{data.atRisk + data.overdue}</p>
                      <p className="text-xs text-rose-600">Riesgo/Vencidas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                  <ClipboardList className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-900">{data.total}</p>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-emerald-600">{data.completed}</p>
                  <p className="text-xs text-slate-500">Completadas</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-600">{data.inProgress}</p>
                  <p className="text-xs text-slate-500">En Progreso</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-3 text-center border border-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-rose-600">{data.atRisk}</p>
                  <p className="text-xs text-slate-500">En Riesgo</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-600">{data.overdue}</p>
                  <p className="text-xs text-slate-500">Vencidas</p>
                </div>
              </div>

              {/* Distribución */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Distribucion por Tipo</h3>
                  <div className="space-y-2">
                    {data.typeData.map(item => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.type === 'Clave' ? 'bg-amber-500' :
                                item.type === 'Operativa' ? 'bg-blue-500' :
                                item.type === 'Mejora' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${data.total > 0 ? (item.count / data.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900 w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Distribucion por Estado</h3>
                  <div className="space-y-2">
                    {data.statusData.map(item => (
                      <div key={item.status} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{item.status}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.status === 'Completada' ? 'bg-emerald-500' :
                                item.status === 'En progreso' ? 'bg-blue-500' :
                                item.status === 'En riesgo' ? 'bg-rose-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${data.total > 0 ? (item.count / data.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900 w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen por áreas (solo general) */}
              {reportType === 'general' && dashboard?.by_area && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Resumen por Area
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Area</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Total</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Completadas</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Riesgo</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dashboard.by_area.filter(a => a.total_tasks > 0).map(area => (
                          <tr key={area.id}>
                            <td className="px-3 py-2 font-medium text-slate-900">{area.area_name}</td>
                            <td className="px-3 py-2 text-center text-slate-600">{area.total_tasks}</td>
                            <td className="px-3 py-2 text-center text-emerald-600 font-medium">{area.completed}</td>
                            <td className="px-3 py-2 text-center text-rose-600 font-medium">{area.at_risk}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                area.total_tasks > 0 && (area.completed / area.total_tasks) >= 0.8 ? 'bg-emerald-100 text-emerald-700' :
                                area.total_tasks > 0 && (area.completed / area.total_tasks) >= 0.5 ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {area.total_tasks > 0 ? Math.round((area.completed / area.total_tasks) * 100) : 0}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Lista de tareas */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  Detalle de Tareas (primeras 15)
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Titulo</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Tipo</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Estado</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-slate-600">Progreso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.tasks || []).slice(0, 10).map(task => (
                        <tr key={task.id}>
                          <td className="px-3 py-2 text-slate-900">{task.title}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              task.type === 'Clave' ? 'bg-amber-100 text-amber-700' :
                              task.type === 'Operativa' ? 'bg-blue-100 text-blue-700' :
                              task.type === 'Mejora' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>{task.type}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              task.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' :
                              task.status === 'En progreso' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'En riesgo' ? 'bg-rose-100 text-rose-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>{task.status}</span>
                          </td>
                          <td className="px-3 py-2 text-center text-slate-600">{task.progress_percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pie */}
              <div className="border-t border-slate-200 pt-4 mt-6 text-sm text-slate-500 flex justify-between">
                <span>Generado por: {user?.name}</span>
                <span>{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay vista previa */}
        {!showPreview && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Configura tu reporte</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Selecciona el tipo de reporte, el periodo y haz clic en "Vista Previa" para ver el reporte antes de descargarlo.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
