'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';
import { Loader2, Mail, ShieldCheck, KeyRound, Lock, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const OTP_LEN = 6;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordPolicy(pw) {
  const rules = {
    length: pw.length >= 10,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  return rules;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LEN).fill(''));
  const [resetToken, setResetToken] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  // Timer para reenviar
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const otpValue = otp.join('');
  const rules = useMemo(() => passwordPolicy(password), [password]);
  const rulesOk = Object.values(rules).every(Boolean);

  function handleOtpChange(i, v) {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);

    // autofocus al siguiente
    if (v && i < OTP_LEN - 1) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) el.focus();
    }
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const el = document.getElementById(`otp-${i - 1}`);
      if (el) el.focus();
    }
  }

  async function requestOtp() {
    setError('');
    setInfo('');
    if (!isValidEmail(email)) {
      setError('Ingresa un correo válido.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      // Siempre mostramos el mismo mensaje para evitar enumeración
      setInfo('Si el correo existe, enviamos un código. Revisa tu bandeja de entrada y spam.');
      setStep(2);
      setCooldown(60);
    } catch (e) {
      setError(e.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setError('');
    setInfo('');

    if (!isValidEmail(email)) {
      setError('Correo inválido.');
      return;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/auth/password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpValue }),
      });

      setResetToken(data.data.reset_token);
      setStep(3);
      setInfo('Código verificado. Ahora define tu nueva contraseña.');
    } catch (e) {
      setError(e.message || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError('');
    setInfo('');

    if (!resetToken) {
      setError('Sesión de restablecimiento inválida. Solicita el código nuevamente.');
      setStep(1);
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!rulesOk) {
      setError('La contraseña no cumple los requisitos mínimos.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({
          reset_token: resetToken,
          password,
          confirm_password: confirm,
        }),
      });

      setInfo('Contraseña actualizada. Redirigiendo al login...');
      setTimeout(() => router.push('/login'), 800);
    } catch (e) {
      setError(e.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </button>

        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Recuperar contraseña</h1>
            <p className="text-sm text-slate-600">
              Te enviaremos un código para verificar tu identidad.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {info && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <p className="text-sm text-emerald-800">{info}</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
            <p className="text-sm text-rose-800">{error}</p>
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      requestOtp();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                  placeholder="correo@empresa.com"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Por seguridad, siempre mostraremos el mismo mensaje aunque el correo no exista.
              </p>
            </div>

            <button
              onClick={requestOtp}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
              Enviar código
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-slate-700 mb-3">
                Ingresa el código de 6 dígitos enviado a <span className="font-semibold">{email}</span>.
              </p>

              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(Array(OTP_LEN).fill('')); }}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cambiar correo
                </button>

                <button
                  type="button"
                  onClick={() => { if (cooldown <= 0) requestOtp(); }}
                  disabled={cooldown > 0 || loading}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
                </button>
              </div>
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || otpValue.length !== 6}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && otpValue.length === 6) {
                  verifyOtp();
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Verificar código
            </button>
          </div>
        )}

        {/* Step 3: New password */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nueva contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                  placeholder="Mínimo 10 caracteres"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && rulesOk && password === confirm) {
                    resetPassword();
                  }
                }}
                className="w-full px-4 py-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                placeholder="Repite tu contraseña"
              />
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700 mb-1">Requisitos</p>
              <p className={rules.length ? 'text-emerald-700' : ''}>• Mínimo 10 caracteres</p>
              <p className={rules.upper ? 'text-emerald-700' : ''}>• Al menos 1 mayúscula</p>
              <p className={rules.lower ? 'text-emerald-700' : ''}>• Al menos 1 minúscula</p>
              <p className={rules.digit ? 'text-emerald-700' : ''}>• Al menos 1 número</p>
              <p className={rules.symbol ? 'text-emerald-700' : ''}>• Al menos 1 símbolo</p>
            </div>

            <button
              onClick={resetPassword}
              disabled={loading || !rulesOk || password !== confirm}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
              Cambiar contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

