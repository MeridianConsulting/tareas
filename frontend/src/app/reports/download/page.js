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
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportsDownload() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
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
      // Error loading data
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
      doc.text('Meridian Control', margin, 26);

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

      // === GRÁFICAS DE PIE ===
      const typeColors = {
        'Clave': amberColor,
        'Operativa': blueColor,
        'Mejora': greenColor,
        'Obligatoria': roseColor
      };
      const statusColors = {
        'Completada': greenColor,
        'En progreso': blueColor,
        'En riesgo': roseColor,
        'No iniciada': slateColor,
        'En revision': [139, 92, 246]
      };

      // Función para crear gráfico de pie en canvas
      const createPieChart = (chartData, colors, size = 200) => {
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');
        
        const centerX = size;
        const centerY = size;
        const radius = size * 0.7;
        const innerRadius = radius * 0.5;
        
        const total = chartData.reduce((sum, item) => sum + item.count, 0);
        if (total === 0) return null;
        
        let startAngle = -Math.PI / 2;
        
        chartData.forEach(item => {
          const sliceAngle = (item.count / total) * 2 * Math.PI;
          const endAngle = startAngle + sliceAngle;
          
          const color = colors[item.type || item.status] || [100, 116, 139];
          ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          
          ctx.beginPath();
          ctx.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
          ctx.closePath();
          ctx.fill();
          
          // Borde blanco entre segmentos
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          startAngle = endAngle;
        });
        
        // Círculo central blanco con sombra
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius - 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Texto central
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), centerX, centerY - 10);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Total', centerX, centerY + 15);
        
        return canvas.toDataURL('image/png');
      };

      // Crear gráficos
      const typeChartData = data.typeData.map(item => ({ ...item, type: item.type }));
      const statusChartData = data.statusData.map(item => ({ ...item, status: item.status }));
      
      const typeChartImg = createPieChart(typeChartData, typeColors);
      const statusChartImg = createPieChart(statusChartData, statusColors);
      
      const halfWidth = (pageWidth - margin * 2 - 10) / 2;
      const chartSize = 35;

      // === DISTRIBUCIÓN POR TIPO ===
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribucion por Tipo', margin, y);
      
      // Agregar gráfico de pie para tipos
      if (typeChartImg) {
        doc.addImage(typeChartImg, 'PNG', margin, y + 3, chartSize, chartSize);
      }
      
      // Leyenda de tipos
      let typeY = y + 8;
      data.typeData.forEach(item => {
        const pct = data.total > 0 ? Math.round((item.count / data.total) * 100) : 0;
        const color = typeColors[item.type] || slateColor;
        
        // Cuadrado de color
        doc.setFillColor(...color);
        doc.rect(margin + chartSize + 5, typeY - 2, 3, 3, 'F');
        
        // Texto
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.type}`, margin + chartSize + 10, typeY);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.count} (${pct}%)`, margin + chartSize + 38, typeY);
        
        typeY += 6;
      });

      // === DISTRIBUCIÓN POR ESTADO ===
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribucion por Estado', margin + halfWidth + 10, y);
      
      // Agregar gráfico de pie para estados
      if (statusChartImg) {
        doc.addImage(statusChartImg, 'PNG', margin + halfWidth + 10, y + 3, chartSize, chartSize);
      }
      
      // Leyenda de estados
      let statusY = y + 8;
      data.statusData.forEach(item => {
        const pct = data.total > 0 ? Math.round((item.count / data.total) * 100) : 0;
        const color = statusColors[item.status] || slateColor;
        
        // Cuadrado de color
        doc.setFillColor(...color);
        doc.rect(margin + halfWidth + chartSize + 15, statusY - 2, 3, 3, 'F');
        
        // Texto
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.status}`, margin + halfWidth + chartSize + 20, statusY);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.count} (${pct}%)`, margin + halfWidth + chartSize + 55, statusY);
        
        statusY += 6;
      });

      y = Math.max(y + chartSize + 8, Math.max(typeY, statusY)) + 5;

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
      doc.text('Meridian Control', pageWidth - margin, pageHeight - 10, { align: 'right' });

      // Guardar
      const fileName = reportType === 'general' 
        ? `Reporte_General_${dateFrom}_${dateTo}.pdf`
        : `Reporte_${data.area?.name || 'Area'}_${dateFrom}_${dateTo}.pdf`;
      
      doc.save(fileName);
    } catch (error) {
      alert('Error al generar el PDF. Por favor intente de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  // Generar Excel usando ExcelJS
  const generateExcel = async () => {
    setGeneratingExcel(true);
    
    try {
      const ExcelJS = (await import('exceljs')).default;
      const { saveAs } = await import('file-saver');
      
      const data = reportType === 'general' ? getGeneralData() : getAreaData(selectedAreaId);
      const title = reportType === 'general' ? 'Reporte General de Tareas' : `Reporte de ${data.area?.name || 'Area'}`;
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = user?.name || 'Sistema';
      workbook.created = new Date();
      
      // Colores
      const primaryColor = '4F46E5';
      const greenColor = '059669';
      const blueColor = '2563EB';
      const roseColor = 'E11D48';
      const amberColor = 'D97706';
      const slateColor = '64748B';
      const lightGray = 'F8FAFC';
      const headerGray = 'F1F5F9';

      // ==========================================
      // HOJA 1: RESUMEN
      // ==========================================
      const summarySheet = workbook.addWorksheet('Resumen', {
        properties: { tabColor: { argb: primaryColor } }
      });
      
      // Configurar anchos de columna
      summarySheet.columns = [
        { width: 25 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }
      ];

      // Título principal
      summarySheet.mergeCells('A1:F1');
      const titleCell = summarySheet.getCell('A1');
      titleCell.value = title;
      titleCell.font = { size: 20, bold: true, color: { argb: 'FFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 35;

      // Subtítulo
      summarySheet.mergeCells('A2:F2');
      const subtitleCell = summarySheet.getCell('A2');
      subtitleCell.value = `Meridian Control | Período: ${getPeriodLabel()} | Generado: ${new Date().toLocaleDateString('es-ES')}`;
      subtitleCell.font = { size: 10, color: { argb: slateColor } };
      subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerGray } };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(2).height = 25;

      // Espacio
      summarySheet.getRow(3).height = 10;

      // KPIs principales
      summarySheet.mergeCells('A4:F4');
      const kpiTitleCell = summarySheet.getCell('A4');
      kpiTitleCell.value = '📊 INDICADORES CLAVE DE RENDIMIENTO';
      kpiTitleCell.font = { size: 12, bold: true, color: { argb: '1E293B' } };
      summarySheet.getRow(4).height = 25;

      // Fila de KPIs
      const kpiLabels = ['Tasa Completitud', 'Progreso Promedio', 'En Ejecución', 'En Riesgo', 'Vencidas'];
      const kpiValues = [`${data.completionRate}%`, `${data.avgProgress}%`, data.inProgress, data.atRisk, data.overdue];
      const kpiColors = [greenColor, blueColor, '7C3AED', roseColor, amberColor];

      summarySheet.getRow(5).values = ['', ...kpiLabels];
      summarySheet.getRow(5).font = { bold: true, size: 10, color: { argb: 'FFFFFF' } };
      summarySheet.getRow(5).alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(5).height = 22;
      
      for (let i = 2; i <= 6; i++) {
        const cell = summarySheet.getCell(5, i);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: kpiColors[i - 2] } };
        cell.border = {
          top: { style: 'thin', color: { argb: kpiColors[i - 2] } },
          left: { style: 'thin', color: { argb: kpiColors[i - 2] } },
          bottom: { style: 'thin', color: { argb: kpiColors[i - 2] } },
          right: { style: 'thin', color: { argb: kpiColors[i - 2] } }
        };
      }

      summarySheet.getRow(6).values = ['', ...kpiValues];
      summarySheet.getRow(6).font = { bold: true, size: 16 };
      summarySheet.getRow(6).alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(6).height = 30;
      
      for (let i = 2; i <= 6; i++) {
        const cell = summarySheet.getCell(6, i);
        cell.font = { bold: true, size: 16, color: { argb: kpiColors[i - 2] } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
      }

      // Espacio
      summarySheet.getRow(7).height = 15;

      // Estadísticas detalladas
      summarySheet.mergeCells('A8:F8');
      const statsTitleCell = summarySheet.getCell('A8');
      statsTitleCell.value = '📈 ESTADÍSTICAS DETALLADAS';
      statsTitleCell.font = { size: 12, bold: true, color: { argb: '1E293B' } };
      summarySheet.getRow(8).height = 25;

      const statsData = [
        ['Total de Tareas', data.total, '', 'Completadas', data.completed, `${data.completionRate}%`],
        ['En Progreso', data.inProgress, `${data.total > 0 ? Math.round((data.inProgress / data.total) * 100) : 0}%`, 'No Iniciadas', data.notStarted, `${data.total > 0 ? Math.round((data.notStarted / data.total) * 100) : 0}%`],
        ['En Riesgo', data.atRisk, `${data.total > 0 ? Math.round((data.atRisk / data.total) * 100) : 0}%`, 'Vencidas', data.overdue, `${data.total > 0 ? Math.round((data.overdue / data.total) * 100) : 0}%`],
      ];

      statsData.forEach((row, i) => {
        const rowNum = 9 + i;
        summarySheet.getRow(rowNum).values = ['', ...row];
        summarySheet.getRow(rowNum).height = 22;
        
        // Estilo para celdas
        for (let j = 2; j <= 7; j++) {
          const cell = summarySheet.getCell(rowNum, j);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? lightGray : 'FFFFFF' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } }
          };
          if (j === 2 || j === 5) cell.font = { bold: true, color: { argb: '1E293B' } };
          if (j === 3 || j === 6) cell.font = { bold: true, color: { argb: greenColor } };
          if (j === 4 || j === 7) cell.font = { color: { argb: slateColor } };
        }
      });

      // Espacio
      summarySheet.getRow(12).height = 15;

      // Distribución por Tipo
      summarySheet.mergeCells('A13:C13');
      const typeTitleCell = summarySheet.getCell('A13');
      typeTitleCell.value = '🏷️ DISTRIBUCIÓN POR TIPO';
      typeTitleCell.font = { size: 11, bold: true, color: { argb: '1E293B' } };

      summarySheet.getRow(14).values = ['', 'Tipo', 'Cantidad', '%'];
      summarySheet.getRow(14).font = { bold: true, color: { argb: 'FFFFFF' } };
      for (let j = 2; j <= 4; j++) {
        const cell = summarySheet.getCell(14, j);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
        cell.alignment = { horizontal: 'center' };
      }

      const typeColorMap = { 'Clave': amberColor, 'Operativa': blueColor, 'Mejora': greenColor, 'Obligatoria': roseColor };
      data.typeData.forEach((item, i) => {
        const rowNum = 15 + i;
        const pct = data.total > 0 ? Math.round((item.count / data.total) * 100) : 0;
        summarySheet.getRow(rowNum).values = ['', item.type, item.count, `${pct}%`];
        
        const typeCell = summarySheet.getCell(rowNum, 2);
        typeCell.font = { bold: true, color: { argb: typeColorMap[item.type] || slateColor } };
        
        for (let j = 2; j <= 4; j++) {
          const cell = summarySheet.getCell(rowNum, j);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? lightGray : 'FFFFFF' } };
          cell.border = { bottom: { style: 'thin', color: { argb: 'E2E8F0' } } };
          if (j > 2) cell.alignment = { horizontal: 'center' };
        }
      });

      // Distribución por Estado (columna derecha)
      summarySheet.mergeCells('D13:F13');
      const statusTitleCell = summarySheet.getCell('D13');
      statusTitleCell.value = '📋 DISTRIBUCIÓN POR ESTADO';
      statusTitleCell.font = { size: 11, bold: true, color: { argb: '1E293B' } };

      for (let j = 5; j <= 7; j++) {
        const cell = summarySheet.getCell(14, j);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center' };
      }
      summarySheet.getCell(14, 5).value = 'Estado';
      summarySheet.getCell(14, 6).value = 'Cantidad';
      summarySheet.getCell(14, 7).value = '%';

      const statusColorMap = { 'Completada': greenColor, 'En progreso': blueColor, 'En riesgo': roseColor, 'No iniciada': slateColor };
      data.statusData.forEach((item, i) => {
        const rowNum = 15 + i;
        const pct = data.total > 0 ? Math.round((item.count / data.total) * 100) : 0;
        
        summarySheet.getCell(rowNum, 5).value = item.status;
        summarySheet.getCell(rowNum, 6).value = item.count;
        summarySheet.getCell(rowNum, 7).value = `${pct}%`;
        
        const statusCell = summarySheet.getCell(rowNum, 5);
        statusCell.font = { bold: true, color: { argb: statusColorMap[item.status] || slateColor } };
        
        for (let j = 5; j <= 7; j++) {
          const cell = summarySheet.getCell(rowNum, j);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? lightGray : 'FFFFFF' } };
          cell.border = { bottom: { style: 'thin', color: { argb: 'E2E8F0' } } };
          if (j > 5) cell.alignment = { horizontal: 'center' };
        }
      });

      // ==========================================
      // HOJA 2: RESUMEN POR ÁREAS (solo general)
      // ==========================================
      if (reportType === 'general' && dashboard?.by_area) {
        const areasSheet = workbook.addWorksheet('Por Áreas', {
          properties: { tabColor: { argb: greenColor } }
        });
        
        areasSheet.columns = [
          { width: 30 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 12 }, { width: 14 }, { width: 14 }
        ];

        // Título
        areasSheet.mergeCells('A1:G1');
        const areasTitleCell = areasSheet.getCell('A1');
        areasTitleCell.value = '📊 RESUMEN POR ÁREAS';
        areasTitleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } };
        areasTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: greenColor } };
        areasTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        areasSheet.getRow(1).height = 35;

        // Headers
        areasSheet.getRow(3).values = ['Área', 'Total', 'Completadas', 'En Progreso', 'En Riesgo', 'Vencidas', '% Completitud'];
        areasSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFF' } };
        areasSheet.getRow(3).height = 25;
        
        for (let j = 1; j <= 7; j++) {
          const cell = areasSheet.getCell(3, j);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: primaryColor } },
            left: { style: 'thin', color: { argb: primaryColor } },
            bottom: { style: 'thin', color: { argb: primaryColor } },
            right: { style: 'thin', color: { argb: primaryColor } }
          };
        }

        dashboard.by_area.filter(a => a.total_tasks > 0).forEach((area, i) => {
          const rowNum = 4 + i;
          const pct = area.total_tasks > 0 ? Math.round((area.completed / area.total_tasks) * 100) : 0;
          const inProgress = area.total_tasks - area.completed - area.at_risk;
          
          areasSheet.getRow(rowNum).values = [
            area.area_name,
            area.total_tasks,
            area.completed,
            Math.max(0, inProgress),
            area.at_risk,
            area.overdue,
            `${pct}%`
          ];
          
          areasSheet.getRow(rowNum).height = 22;
          
          for (let j = 1; j <= 7; j++) {
            const cell = areasSheet.getCell(rowNum, j);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? lightGray : 'FFFFFF' } };
            cell.border = {
              top: { style: 'thin', color: { argb: 'E2E8F0' } },
              left: { style: 'thin', color: { argb: 'E2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
              right: { style: 'thin', color: { argb: 'E2E8F0' } }
            };
            if (j > 1) cell.alignment = { horizontal: 'center' };
          }
          
          // Colores especiales
          areasSheet.getCell(rowNum, 3).font = { color: { argb: greenColor }, bold: true };
          areasSheet.getCell(rowNum, 5).font = { color: { argb: roseColor }, bold: true };
          areasSheet.getCell(rowNum, 6).font = { color: { argb: amberColor }, bold: true };
          
          const pctCell = areasSheet.getCell(rowNum, 7);
          pctCell.font = { 
            bold: true, 
            color: { argb: pct >= 80 ? greenColor : pct >= 50 ? blueColor : amberColor } 
          };
        });
      }

      // ==========================================
      // HOJA 3: DETALLE DE TAREAS
      // ==========================================
      const tasksSheet = workbook.addWorksheet('Detalle Tareas', {
        properties: { tabColor: { argb: blueColor } }
      });
      
      tasksSheet.columns = [
        { width: 8 },
        { width: 40 },
        { width: 20 },
        { width: 14 },
        { width: 12 },
        { width: 14 },
        { width: 12 },
        { width: 14 },
        { width: 14 }
      ];

      // Título
      tasksSheet.mergeCells('A1:I1');
      const tasksTitleCell = tasksSheet.getCell('A1');
      tasksTitleCell.value = '📋 DETALLE DE TAREAS';
      tasksTitleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } };
      tasksTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: blueColor } };
      tasksTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      tasksSheet.getRow(1).height = 35;

      // Info
      tasksSheet.mergeCells('A2:I2');
      const tasksInfoCell = tasksSheet.getCell('A2');
      tasksInfoCell.value = `Total: ${data.tasks.length} tareas | Período: ${getPeriodLabel()}`;
      tasksInfoCell.font = { size: 10, color: { argb: slateColor } };
      tasksInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerGray } };
      tasksInfoCell.alignment = { horizontal: 'center' };

      // Headers
      tasksSheet.getRow(4).values = ['#', 'Título', 'Área', 'Tipo', 'Prioridad', 'Estado', 'Progreso', 'F. Inicio', 'F. Vence'];
      tasksSheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFF' } };
      tasksSheet.getRow(4).height = 25;
      
      for (let j = 1; j <= 9; j++) {
        const cell = tasksSheet.getCell(4, j);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryColor } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: primaryColor } },
          left: { style: 'thin', color: { argb: primaryColor } },
          bottom: { style: 'thin', color: { argb: primaryColor } },
          right: { style: 'thin', color: { argb: primaryColor } }
        };
      }

      // Datos de tareas
      data.tasks.forEach((task, i) => {
        const rowNum = 5 + i;
        
        tasksSheet.getRow(rowNum).values = [
          i + 1,
          task.title,
          task.area_name || '-',
          task.type,
          task.priority || 'Media',
          task.status,
          `${task.progress_percent}%`,
          task.start_date ? new Date(task.start_date).toLocaleDateString('es-ES') : '-',
          task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : '-'
        ];
        
        tasksSheet.getRow(rowNum).height = 20;
        
        for (let j = 1; j <= 9; j++) {
          const cell = tasksSheet.getCell(rowNum, j);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? lightGray : 'FFFFFF' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'E2E8F0' } },
            left: { style: 'thin', color: { argb: 'E2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
            right: { style: 'thin', color: { argb: 'E2E8F0' } }
          };
          if (j !== 2 && j !== 3) cell.alignment = { horizontal: 'center' };
        }
        
        // Colores por tipo
        const typeCell = tasksSheet.getCell(rowNum, 4);
        typeCell.font = { bold: true, color: { argb: typeColorMap[task.type] || slateColor } };
        
        // Colores por estado
        const statusCell = tasksSheet.getCell(rowNum, 6);
        statusCell.font = { bold: true, color: { argb: statusColorMap[task.status] || slateColor } };
        
        // Color de progreso
        const progressCell = tasksSheet.getCell(rowNum, 7);
        const prog = task.progress_percent;
        progressCell.font = { 
          bold: true, 
          color: { argb: prog >= 80 ? greenColor : prog >= 50 ? blueColor : prog > 0 ? amberColor : slateColor } 
        };
      });

      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = reportType === 'general' 
        ? `Reporte_General_${dateFrom}_${dateTo}.xlsx`
        : `Reporte_${data.area?.name || 'Area'}_${dateFrom}_${dateTo}.xlsx`;
      
      saveAs(blob, fileName);
    } catch (error) {
      alert('Error al generar el Excel. Por favor intente de nuevo.');
    } finally {
      setGeneratingExcel(false);
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
            <div className="flex items-end gap-2 flex-wrap">
              <button
                onClick={() => setShowPreview(true)}
                disabled={loading || (reportType === 'area' && !selectedAreaId)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Vista Previa
              </button>
              <button
                onClick={generatePDF}
                disabled={generating || loading || (reportType === 'area' && !selectedAreaId)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {generating ? 'Generando...' : 'PDF'}
              </button>
              <button
                onClick={generateExcel}
                disabled={generatingExcel || loading || (reportType === 'area' && !selectedAreaId)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingExcel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                {generatingExcel ? 'Generando...' : 'Excel'}
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
                  <p className="text-slate-600">Meridian Control</p>
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
