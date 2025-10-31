import React, { useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Shield,
  GraduationCap,
  IdCard,
  Hash,
} from 'lucide-react';
import './../../styles/PerfilScreen.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

interface PerfilScreenProps {
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
  };
  currentSection?: 'home' | 'servicios' | 'eventos' | 'perfil';
  onSectionChange?: (
    section: 'home' | 'servicios' | 'eventos' | 'perfil',
    servicio?: 'espacios' | 'citas'
  ) => void;
  onBackToDashboard?: () => void;
}

interface UsuarioPerfil {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipoDocumento: string;
  numeroDocumento: string;
  celular: string | null;
  facultadId: number | null;
  facultadNombre: string | null;
  escuelaId: number | null;
  escuelaNombre: string | null;
  rol: string;
  genero: string;
  estado: number | null;
}

interface UsuarioResponse {
  success: boolean;
  message?: string;
  usuario: UsuarioPerfil | null;
}

type PasswordFeedback = {
  type: 'success' | 'error';
  text: string;
};

export const PerfilScreen: React.FC<PerfilScreenProps> = ({
  user,
  currentSection = 'perfil',
  onSectionChange,
  onBackToDashboard,
}) => {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

  useEffect(() => {
    const parsedId = Number(user.id);
    if (!Number.isFinite(parsedId)) {
      setError('No se pudo determinar el identificador del usuario.');
      setUsuario(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadUsuario = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/${parsedId}`, {
          signal: controller.signal,
        });
        const data = (await response.json().catch(() => null)) as UsuarioResponse | null;

        if (!response.ok) {
          const message =
            data?.message ?? 'No se pudo cargar la informacion del usuario.';
          throw new Error(message);
        }

        if (!data?.success || !data.usuario) {
          const message =
            data?.message ?? 'No se encontro informacion del usuario.';
          throw new Error(message);
        }

        setUsuario(data.usuario);
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'Error inesperado al cargar el perfil.';
        setError(message);
        setUsuario(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadUsuario();

    return () => controller.abort();
  }, [user.id]);

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!usuario) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'Completa todos los campos para actualizar la contraseña.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'La nueva contraseña y su confirmacion deben coincidir.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (usuario.facultadId == null || usuario.escuelaId == null) {
      setPasswordFeedback({
        type: 'error',
        text: 'No es posible actualizar la contraseña porque faltan datos academicos.',
      });
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordFeedback(null);

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoOEmail: usuario.codigo || usuario.email,
          password: currentPassword,
        }),
      });
      const loginData = (await loginResponse.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!loginResponse.ok || !loginData?.success) {
        const message =
          loginData?.message ?? 'La contraseña actual no es valida.';
        throw new Error(message);
      }

      const updateResponse = await fetch(`${API_BASE_URL}/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: usuario.codigo,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          tipoDocumento: usuario.tipoDocumento,
          numeroDocumento: usuario.numeroDocumento,
          celular: usuario.celular ?? '',
          facultadId: usuario.facultadId,
          escuelaId: usuario.escuelaId,
          rol: usuario.rol ?? 'ESTUDIANTE',
          genero: usuario.genero ?? 'OTRO',
          password: newPassword,
          estado: usuario.estado ?? 1,
        }),
      });

      const updateData = (await updateResponse.json().catch(() => null)) as UsuarioResponse | null;

      if (!updateResponse.ok || !updateData?.success) {
        const message =
          updateData?.message ?? 'No se pudo actualizar la contraseña.';
        throw new Error(message);
      }

      setPasswordFeedback({
        type: 'success',
        text: 'Contraseña actualizada correctamente.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Error al actualizar la contraseña.';
      setPasswordFeedback({
        type: 'error',
        text: message,
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const nombreCompleto =
    usuario != null
      ? `${usuario.nombres} ${usuario.apellidos}`.trim()
      : user.user_metadata?.name || 'Usuario';
  const descripcionRol =
    usuario?.rol || user.user_metadata?.role || 'Perfil de IntegraUPT';
  const codigoUsuario = usuario?.codigo || user.user_metadata?.codigo || '';

  return (
    <div className="perfil-screen-container">
      <Navigation
        user={user}
        currentSection={currentSection}
        onSectionChange={onSectionChange}
        onBackToDashboard={onBackToDashboard}
      />

      <main className="perfil-screen-main">
        <div className="perfil-screen-card">
          <div className="perfil-screen-header">
            <div className="perfil-screen-header-content">
              <div className="perfil-screen-profile-info">
                <div className="perfil-screen-avatar-container">
                  {user.user_metadata.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Perfil"
                      className="perfil-screen-avatar"
                    />
                  ) : (
                    <div className="perfil-screen-avatar-placeholder">
                      <User className="perfil-screen-avatar-icon" />
                    </div>
                  )}
                  <div className="perfil-screen-online-indicator"></div>
                </div>

                <div className="perfil-screen-user-info">
                  <h1 className="perfil-screen-user-name">{nombreCompleto}</h1>
                  <p className="perfil-screen-career">{descripcionRol}</p>
                  <p className="perfil-screen-semester">
                    {codigoUsuario
                      ? `Codigo: ${codigoUsuario}`
                      : `Correo: ${user.email}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="perfil-screen-content">
            {loading && (
              <div className="perfil-screen-section">
                <p className="perfil-screen-text" style={{ display: 'flex', alignItems: 'center' }}>
                  <Loader2 className="perfil-screen-icon" />
                  Cargando informacion del perfil...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="perfil-screen-section">
                <p
                  className="perfil-screen-text"
                  style={{ color: '#ef4444', fontWeight: 500 }}
                >
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && usuario && (
              <>
                <div className="perfil-screen-section">
                  <h3 className="perfil-screen-section-title">
                    <User className="perfil-screen-section-icon" />
                    Datos personales
                  </h3>
                  <div className="perfil-screen-grid">
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Nombres</label>
                      <p className="perfil-screen-text">{usuario.nombres}</p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Apellidos</label>
                      <p className="perfil-screen-text">{usuario.apellidos}</p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Codigo universitario</label>
                      <p className="perfil-screen-text">
                        <Hash className="perfil-screen-icon" />
                        {usuario.codigo}
                      </p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Tipo de documento</label>
                      <p className="perfil-screen-text">
                        <IdCard className="perfil-screen-icon" />
                        {usuario.tipoDocumento}
                      </p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Numero de documento</label>
                      <p className="perfil-screen-text">{usuario.numeroDocumento}</p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Genero</label>
                      <p className="perfil-screen-text">{usuario.genero}</p>
                    </div>
                  </div>
                </div>

                <div className="perfil-screen-section">
                  <h3 className="perfil-screen-section-title">
                    <GraduationCap className="perfil-screen-section-icon" />
                    Datos academicos
                  </h3>
                  <div className="perfil-screen-grid">
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Facultad</label>
                      <p className="perfil-screen-text">
                        {usuario.facultadNombre ?? 'No registrado'}
                      </p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Escuela</label>
                      <p className="perfil-screen-text">
                        {usuario.escuelaNombre ?? 'No registrado'}
                      </p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Rol</label>
                      <p className="perfil-screen-text">
                        <Shield className="perfil-screen-icon" />
                        {usuario.rol}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="perfil-screen-section">
                  <h3 className="perfil-screen-section-title">
                    <Mail className="perfil-screen-section-icon" />
                    Datos de contacto
                  </h3>
                  <div className="perfil-screen-grid">
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Correo electronico</label>
                      <p className="perfil-screen-text">
                        <Mail className="perfil-screen-icon" />
                        {usuario.email}
                      </p>
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Celular</label>
                      <p className="perfil-screen-text">
                        <Phone className="perfil-screen-icon" />
                        {usuario.celular || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="perfil-screen-section">
                  <h3 className="perfil-screen-section-title">
                    <Lock className="perfil-screen-section-icon" />
                    Credenciales de acceso
                  </h3>

                  <div className="perfil-screen-grid">
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Contraseña actual</label>
                      <p className="perfil-screen-text">********</p>
                    </div>
                  </div>

                  <form className="perfil-screen-grid" onSubmit={handlePasswordSubmit}>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Ingresa tu contraseña actual</label>
                      <input
                        type="password"
                        className="perfil-screen-input"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Contraseña actual"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Nueva contraseña</label>
                      <input
                        type="password"
                        className="perfil-screen-input"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Nueva contraseña"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div className="perfil-screen-field">
                      <label className="perfil-screen-label">Confirma la nueva contraseña</label>
                      <input
                        type="password"
                        className="perfil-screen-input"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirma la nueva contraseña"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    <div className="perfil-screen-field" style={{ alignSelf: 'flex-end' }}>
                      <button
                        type="submit"
                        className="perfil-screen-save-button"
                        disabled={isPasswordSubmitting}
                      >
                        {isPasswordSubmitting ? (
                          <>
                            <Loader2 className="perfil-screen-button-icon" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Lock className="perfil-screen-button-icon" />
                            Actualizar contraseña
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {passwordFeedback && (
                    <p
                      className="perfil-screen-text"
                      style={{
                        color: passwordFeedback.type === 'success' ? '#16a34a' : '#ef4444',
                        fontWeight: 500,
                      }}
                    >
                      {passwordFeedback.text}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
