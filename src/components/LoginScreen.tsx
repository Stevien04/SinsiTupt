import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield
} from 'lucide-react';
import '../styles/LoginScreen.css';
import { API_BASE_URL } from '../utils/apiConfig';
type LoginType = 'academic' | 'administrative';

interface BackendPerfil {
  id: string;
  codigo?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: string;
  tipoLogin?: string;
  avatarUrl?: string;
  estado?: string;
  celular?: string;
  escuela?: string;
  facultad?: string;
  genero?: string;
  numeroDocumento?: string;
}

interface BackendLoginResponse {
  success: boolean;
  message: string;
  perfil: BackendPerfil | null;
  token?: string | null;
}

interface BackendSessionPayload {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url: string;
      role?: string;
      login_type?: string;
      codigo?: string;
    };
    token?: string | null;
  };
  token?: string | null;
  perfil: BackendPerfil | null;
}



const generateCaptcha = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const length = 5;
  let result = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    result += alphabet[index];
  }
  return result;
};

export const LoginScreen: FC = () => {
  const [selectedType, setSelectedType] = useState<LoginType | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState<string>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const subtitleText = useMemo(() => {
    if (!selectedType) {
      return 'Accede a la plataforma integral de la Universidad Privada de Tacna';
    }

    return selectedType === 'academic'
      ? 'Portal Académico IntegraUPT'
      : 'Portal Administrativo IntegraUPT';
  }, [selectedType]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  const handleSelectType = (type: LoginType) => {
    setSelectedType(type);
    setIdentifier('');
    setPassword('');
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setError(null);
    setInfoMessage(null);
  };

  const handleBack = () => {
    setSelectedType(null);
    setIdentifier('');
    setPassword('');
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!selectedType) {
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setError('El código de seguridad es incorrecto. Intenta nuevamente.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigoOEmail: identifier,
          password,
          tipoLogin: selectedType
        })
      });

      let data: BackendLoginResponse | null = null;
      try {
        data = (await response.json()) as BackendLoginResponse;
      } catch (parseError) {
        // Ignorar error de parseo y manejar más abajo
      }

      if (!response.ok || !data?.success) {
        const message = data?.message ?? 'No fue posible iniciar sesión con las credenciales proporcionadas.';
        throw new Error(message);
      }

      if (!data.perfil) {
        throw new Error('La respuesta del servidor no contiene información del perfil.');
      }

      const fullName = `${data.perfil.nombres ?? ''} ${data.perfil.apellidos ?? ''}`.trim();
      const userPayload = {
        id: data.perfil.id,
        email: data.perfil.email ?? identifier,
        user_metadata: {
          name: fullName || data.perfil.email || identifier,
          avatar_url: data.perfil.avatarUrl ?? '',
          role: data.perfil.rol ?? undefined,
          login_type: data.perfil.tipoLogin ?? selectedType,
          codigo: data.perfil.codigo ?? undefined
        },
        token: data.token ?? undefined
      };

      const sessionPayload: BackendSessionPayload = {
        user: userPayload,
        token: data.token ?? null,
        perfil: data.perfil
      };

      localStorage.setItem('backend_session', JSON.stringify(sessionPayload));
      window.dispatchEvent(new CustomEvent<BackendSessionPayload>('backend-login', { detail: sessionPayload }));
      setInfoMessage(data.message ?? 'Inicio de sesión exitoso. Redirigiendo...');
    } catch (loginError) {
      const message = loginError instanceof Error
        ? loginError.message
        : 'Ocurrió un error inesperado durante el inicio de sesión.';
      setError(message);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div
            className={`login-logo ${selectedType === 'administrative' ? 'login-logo-gray' : 'login-logo-blue'}`}
          >
            {selectedType === 'administrative' ? (
              <Shield className="login-logo-icon" />
            ) : (
              <GraduationCap className="login-logo-icon" />
            )}
          </div>
          <h1 className={`login-title ${selectedType === 'administrative' ? 'login-title-gray' : ''}`}>
            IntegraUPT
          </h1>
          <p className={`login-subtitle ${selectedType === 'administrative' ? 'login-subtitle-gray' : ''}`}>
            {subtitleText}
          </p>
          <p className="login-description">Utiliza tus credenciales institucionales para ingresar.</p>
        </div>

        <div className="login-card space-y-6">
          {!selectedType && (
            <div className="space-y-4">
              <div className="space-y-2">
                <button
                  type="button"
                  className="login-btn login-btn-academic"
                  onClick={() => handleSelectType('academic')}
                >
                  <GraduationCap className="login-btn-icon" />
                  <span>Acceso Académico</span>
                  <ArrowRight className="login-btn-arrow" />
                </button>
                <button
                  type="button"
                  className="login-btn login-btn-admin"
                  onClick={() => handleSelectType('administrative')}
                >
                  <Shield className="login-btn-icon" />
                  <span>Acceso Administrativo</span>
                  <ArrowRight className="login-btn-arrow" />
                </button>
              </div>
              <div className="login-test-credentials">
                <p className="space-y-1">
                  <strong>¿Necesitas ayuda?</strong>
                  <br />
                  Selecciona el tipo de acceso para continuar con tu autenticación.
                </p>
              </div>
            </div>
          )}

          {selectedType && (
            <div className="space-y-6">
              <button type="button" className="login-back-btn" onClick={handleBack}>
                <ArrowLeft className="login-back-icon" />
                Volver a seleccionar tipo de acceso
              </button>

              <form className="login-form space-y-4" onSubmit={handleSubmit}>
                <div className="login-form-group space-y-2">
                  <label className="login-label" htmlFor="identifier">
                    Código universitario o correo electrónico
                  </label>
                  <div className="login-input-wrapper">
                    <Mail className="login-input-icon" />
                    <input
                      id="identifier"
                      className="login-input"
                      placeholder="Ej. UPT2024001 o usuario@upt.edu.pe"
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group space-y-2">
                  <label className="login-label" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="login-input-wrapper">
                    <Lock className="login-input-icon" />
                    <input
                      id="password"
                      type="password"
                      className="login-input"
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group space-y-2">
                  <label className="login-label" htmlFor="captcha">
                    Código de seguridad
                  </label>
                  <div className="login-captcha-container space-x-2">
                    <div className="login-captcha-display">{captcha}</div>
                    <button
                      type="button"
                      className="login-captcha-refresh"
                      onClick={refreshCaptcha}
                      aria-label="Actualizar código de seguridad"
                    >
                      <RefreshCw className="login-captcha-icon" />
                    </button>
                  </div>
                  <input
                    id="captcha"
                    className="login-input"
                    placeholder="Ingresa el código mostrado"
                    value={captchaInput}
                    onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
                    required
                  />
                </div>

                {error && <div className="login-error">{error}</div>}
                {infoMessage && !error && <div className="login-test-credentials login-test-admin">{infoMessage}</div>}

                <button
                  type="submit"
                  className={`login-submit-btn ${selectedType === 'academic' ? 'login-submit-academic' : 'login-submit-admin'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="login-loading space-x-2">
                      <Loader2 className="login-spinner" />
                      Procesando...
                    </span>
                  ) : (
                    <span>Iniciar sesión</span>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="login-footer space-y-1">
            <p>IntegraUPT © {new Date().getFullYear()} Universidad Privada de Tacna</p>
            <p className="login-footer-sub">Soporte: soporte@upt.edu.pe</p>
          </div>
        </div>
      </div>
    </div>
  );
};