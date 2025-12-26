// components/Alert.js
'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

/**
 * Componente de alerta unificado y responsive
 * 
 * @param {string} type - Tipo de alerta: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título de la alerta (opcional)
 * @param {string|ReactNode} children - Contenido de la alerta
 * @param {boolean} dismissible - Si es true, muestra botón para cerrar
 * @param {function} onDismiss - Callback cuando se cierra la alerta
 * @param {string} className - Clases CSS adicionales
 * @param {ReactNode} icon - Icono personalizado (opcional)
 */
export default function Alert({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon: CustomIcon
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Configuración de colores y estilos según el tipo
  const typeConfig = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      titleText: 'text-emerald-900',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-100',
      focusRing: 'focus:ring-emerald-500',
      defaultIcon: CheckCircle2
    },
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      titleText: 'text-rose-900',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      hoverBg: 'hover:bg-rose-100',
      focusRing: 'focus:ring-rose-500',
      defaultIcon: AlertCircle
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      titleText: 'text-amber-900',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      hoverBg: 'hover:bg-amber-100',
      focusRing: 'focus:ring-amber-500',
      defaultIcon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      titleText: 'text-blue-900',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-100',
      focusRing: 'focus:ring-blue-500',
      defaultIcon: Info
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = CustomIcon || config.defaultIcon;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 rounded-xl border
        ${config.bg} ${config.border} ${config.text}
        shadow-sm transition-all duration-200
        animate-in fade-in slide-in-from-top-1
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icono */}
      <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`text-sm font-semibold ${config.titleText} mb-1`}>
            {title}
          </h4>
        )}
        <div className={`text-sm ${title ? '' : config.text} leading-relaxed`}>
          {children}
        </div>
      </div>

      {/* Botón de cerrar */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            ${config.iconColor} 
            ${config.hoverBg}
            hover:opacity-75 active:opacity-50
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-offset-transparent ${config.focusRing}
          `}
          aria-label="Cerrar alerta"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

