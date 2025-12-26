// components/ConfirmDialog.js
'use client';

import { AlertTriangle, X } from 'lucide-react';
import Alert from './Alert';

/**
 * Componente de diálogo de confirmación usando el estilo Alert
 * 
 * @param {boolean} isOpen - Si el diálogo está abierto
 * @param {string} title - Título del diálogo
 * @param {string|ReactNode} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelar (default: "Cancelar")
 * @param {string} type - Tipo de alerta: 'warning', 'error', 'info' (default: 'warning')
 * @param {function} onConfirm - Callback cuando se confirma
 * @param {function} onCancel - Callback cuando se cancela
 * @param {boolean} loading - Si está en proceso de carga
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header con Alert integrado */}
        <div className="p-6 pb-4">
          <Alert type={type} title={title} className="mb-0">
            {message}
          </Alert>
        </div>

        {/* Botones de acción */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${type === 'error' ? 'bg-rose-600 hover:bg-rose-700' : ''}
              ${type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              ${type === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

