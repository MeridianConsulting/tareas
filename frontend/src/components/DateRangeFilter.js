// components/DateRangeFilter.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

const PERIOD_OPTIONS = [
  { id: 'today', label: 'Hoy', getValue: () => {
    const today = new Date();
    return { from: formatDate(today), to: formatDate(today) };
  }},
  { id: 'week', label: 'Esta semana', getValue: () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return { from: formatDate(startOfWeek), to: formatDate(today) };
  }},
  { id: 'month', label: 'Este mes', getValue: () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: formatDate(startOfMonth), to: formatDate(today) };
  }},
  { id: 'quarter', label: 'Este trimestre', getValue: () => {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
    return { from: formatDate(startOfQuarter), to: formatDate(today) };
  }},
  { id: 'semester', label: 'Este semestre', getValue: () => {
    const today = new Date();
    const semester = today.getMonth() < 6 ? 0 : 6;
    const startOfSemester = new Date(today.getFullYear(), semester, 1);
    return { from: formatDate(startOfSemester), to: formatDate(today) };
  }},
  { id: 'year', label: 'Este año', getValue: () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    return { from: formatDate(startOfYear), to: formatDate(today) };
  }},
  { id: 'all', label: 'Todo', getValue: () => ({ from: null, to: null }) },
  { id: 'custom', label: 'Personalizado', getValue: () => null },
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DateRangeFilter({ onChange, defaultPeriod = 'today' }) {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const dropdownRef = useRef(null);

  // Inicializar con el período por defecto (solo valores internos del componente)
  useEffect(() => {
    const option = PERIOD_OPTIONS.find(o => o.id === defaultPeriod);
    if (option && option.getValue) {
      const dates = option.getValue();
      if (dates) {
        setDateFrom(dates.from || '');
        setDateTo(dates.to || '');
      }
    }
  }, [defaultPeriod]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePeriodSelect = (option) => {
    setSelectedPeriod(option.id);
    
    if (option.id === 'custom') {
      setShowCustom(true);
      setIsOpen(false);
      return;
    }
    
    setShowCustom(false);
    const dates = option.getValue();
    if (dates) {
      setDateFrom(dates.from || '');
      setDateTo(dates.to || '');
      onChange?.(dates.from, dates.to, option.id);
    }
    setIsOpen(false);
  };

  const handleCustomDateChange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
    if (from && to) {
      onChange?.(from, to, 'custom');
    }
  };

  const getDisplayText = () => {
    const option = PERIOD_OPTIONS.find(o => o.id === selectedPeriod);
    if (selectedPeriod === 'custom' && dateFrom && dateTo) {
      return `${formatDisplayDate(dateFrom)} - ${formatDisplayDate(dateTo)}`;
    }
    if (selectedPeriod === 'all') {
      return 'Todas las fechas';
    }
    return option?.label || 'Seleccionar período';
  };

  const clearFilter = () => {
    setSelectedPeriod('all');
    setDateFrom('');
    setDateTo('');
    setShowCustom(false);
    onChange?.(null, null, 'all');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Botón principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
        >
          <Calendar className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
          <span className="text-slate-700 font-medium">{getDisplayText()}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Botón limpiar filtro */}
        {selectedPeriod !== 'today' && (
          <button
            onClick={clearFilter}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Limpiar filtro"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {PERIOD_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => handlePeriodSelect(option)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                  selectedPeriod === option.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
                {selectedPeriod === option.id && (
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panel de fecha personalizada */}
      {showCustom && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg z-50 p-4 w-80">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Rango personalizado</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleCustomDateChange(e.target.value, dateTo)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleCustomDateChange(dateFrom, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (dateFrom && dateTo) {
                  onChange?.(dateFrom, dateTo, 'custom');
                  setShowCustom(false);
                }
              }}
              disabled={!dateFrom || !dateTo}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

