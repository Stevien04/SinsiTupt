import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Search,
  User,
  X
} from 'lucide-react';

interface Reserva {
  id: number;
  estado: string;
  fechaReserva?: string;
  fechaSolicitud?: string;
  descripcion?: string;
  motivo?: string;
  solicitante?: string;
  codigoSolicitante?: string;
  correoSolicitante?: string;
  espacio?: string;
  codigoEspacio?: string;
  tipoEspacio?: string;
  bloque?: string;
  horaInicio?: string;
  horaFin?: string;
}

interface GestionReservasProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

const ESTADOS = [
  { value: 'Pendiente', label: 'Pendientes', description: 'Solicitudes que requieren revisión' },
  { value: 'Aprobada', label: 'Aprobadas', description: 'Reservas aceptadas' },
  { value: 'Rechazada', label: 'Rechazadas', description: 'Solicitudes denegadas' }
];

export const GestionReservas: React.FC<GestionReservasProps> = ({ onAuditLog }) => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [estadoActivo, setEstadoActivo] = useState<string>(ESTADOS[0].value);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [filtroTipoEspacio, setFiltroTipoEspacio] = useState<'todos' | 'laboratorio' | 'salon'>('todos');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const urlBase = useMemo(() => 'http://localhost:8080/api/reservas', []);

  const limpiarMensaje = useCallback(() => {
    setTimeout(() => setMensaje(null), 4000);
  }, []);

  const cargarReservas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${urlBase}?estado=${encodeURIComponent(estadoActivo)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error('No se pudo obtener la lista de reservas');
      const data = await response.json();
      const reservasMapeadas: Reserva[] = Array.isArray(data)
        ? data.map((reserva: any) => ({
            id: Number(reserva.id),
            estado: reserva.estado,
            fechaReserva: reserva.fechaReserva,
            fechaSolicitud: reserva.fechaSolicitud,
            descripcion: reserva.descripcion,
            motivo: reserva.motivo,
            solicitante: reserva.solicitante,
            codigoSolicitante: reserva.codigoSolicitante,
            correoSolicitante: reserva.correoSolicitante,
            espacio: reserva.espacio,
            codigoEspacio: reserva.codigoEspacio,
            tipoEspacio: reserva.tipoEspacio,
            bloque: reserva.bloque,
            horaInicio: reserva.horaInicio,
            horaFin: reserva.horaFin
          }))
        : [];
      setReservas(reservasMapeadas);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setReservas([]);
    } finally {
      setCargando(false);
    }
  }, [estadoActivo, urlBase]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const normalizarTexto = useCallback((valor?: string) => {
    return (valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }, []);

  const normalizarFecha = useCallback((fecha?: string) => {
    if (!fecha) return null;
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return fecha.slice(0, 10);
    }
    const ajustada = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return ajustada.toISOString().split('T')[0];
  }, []);

  const reservasFiltradas = useMemo(() => {
    const termino = normalizarTexto(terminoBusqueda);
    return reservas.filter((reserva) => {
      const tipoEspacio = normalizarTexto(reserva.tipoEspacio);
      const coincideTipo =
        filtroTipoEspacio === 'todos' ||
        (filtroTipoEspacio === 'laboratorio' && tipoEspacio.includes('laboratorio')) ||
        (filtroTipoEspacio === 'salon' && tipoEspacio.includes('salon'));

      if (!coincideTipo) return false;

      if (filtroFecha) {
              const fechaReservaNormalizada = normalizarFecha(reserva.fechaReserva);
              if (fechaReservaNormalizada !== filtroFecha) return false;
            }

      if (!termino) return true;

      const espacio = normalizarTexto(reserva.espacio);
      const solicitante = normalizarTexto(reserva.solicitante);
      return espacio.includes(termino) || solicitante.includes(termino);
    });
  }, [filtroFecha, filtroTipoEspacio, normalizarFecha, normalizarTexto, reservas, terminoBusqueda]);

  const sinReservas = !cargando && reservas.length === 0;
  const sinCoincidencias = !cargando && reservas.length > 0 && reservasFiltradas.length === 0;

  const manejarAprobacion = async (reserva: Reserva) => {
    setProcesandoAccion(true);
    try {
      const response = await fetch(`${urlBase}/${reserva.id}/aprobar`, { method: 'PUT' });
      if (!response.ok) throw new Error('No se pudo aprobar la reserva');
      onAuditLog('admin', 'Aprobar Reserva', 'Reservas', 'success', `Reserva #${reserva.id} aprobada`);
      setMensaje({ tipo: 'success', texto: 'La reserva ha sido aprobada correctamente.' });
      limpiarMensaje();
      await cargarReservas();
    } catch (err) {
      console.error('Error al aprobar reserva:', err);
      onAuditLog('admin', 'Aprobar Reserva', 'Reservas', 'failed', `Error al aprobar la reserva #${reserva.id}`);
    } finally {
      setProcesandoAccion(false);
    }
  };

  const abrirModalRechazo = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setMotivoRechazo('');
  };

  const cerrarModalRechazo = () => {
    setReservaSeleccionada(null);
    setMotivoRechazo('');
  };

  const confirmarRechazo = async () => {
    if (!reservaSeleccionada) return;
    if (!motivoRechazo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Debes ingresar un motivo para rechazar la reserva.' });
      limpiarMensaje();
      return;
    }
    setProcesandoAccion(true);
    try {
      const response = await fetch(`${urlBase}/${reservaSeleccionada.id}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: motivoRechazo })
      });
      if (!response.ok) throw new Error('No se pudo rechazar la reserva');
      onAuditLog('admin', 'Rechazar Reserva', 'Reservas', 'success', `Reserva #${reservaSeleccionada.id} rechazada`);
      setMensaje({ tipo: 'success', texto: 'La reserva ha sido rechazada.' });
      limpiarMensaje();
      cerrarModalRechazo();
      await cargarReservas();
    } catch (err) {
      console.error('Error al rechazar reserva:', err);
      onAuditLog('admin', 'Rechazar Reserva', 'Reservas', 'failed', `Error al rechazar la reserva #${reservaSeleccionada.id}`);
    } finally {
      setProcesandoAccion(false);
    }
  };

  const obtenerEtiquetaEstado = (estado: string) => {
    switch ((estado || '').toLowerCase()) {
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div>
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Gestión de Reservas</h2>
          <p className="admin-content-subtitle">Aprueba o rechaza las solicitudes de reserva de espacios</p>
        </div>
      </div>

      <div className="admin-tabs">
        {ESTADOS.map((estado) => (
          <button
            key={estado.value}
            className={`admin-tab ${estadoActivo === estado.value ? 'admin-tab-active' : ''}`}
            onClick={() => setEstadoActivo(estado.value)}
          >
            <div className="admin-tab-header">
              <ClipboardList className="admin-tab-icon" />
              <span className="admin-tab-label">{estado.label}</span>
            </div>
            <span className="admin-tab-description">{estado.description}</span>
          </button>
        ))}
      </div>

      {mensaje && (
        <div className={`admin-alert ${mensaje.tipo === 'success' ? 'admin-alert-success' : 'admin-alert-error'}`}>
          <AlertCircle className="admin-alert-icon" />
          <span>{mensaje.texto}</span>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle className="admin-alert-icon" />
          <div>
            <p>Hubo un problema al cargar las reservas.</p>
            <p className="admin-alert-details">{error}</p>
          </div>
        </div>
      )}

      <div className="admin-filters-section">
        <div className="admin-filters-header">
          <Filter className="admin-filters-icon" />
          <span className="admin-filters-title">Filtros y búsqueda</span>
        </div>

        <div className="admin-filters-grid">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Tipo de espacio</label>
            <select
              value={filtroTipoEspacio}
              onChange={(event) => setFiltroTipoEspacio(event.target.value as 'todos' | 'laboratorio' | 'salon')}
              className="admin-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="salon">Salón</option>
            </select>
          </div>

          <div className="admin-filter-group">
                     <label className="admin-filter-label">Fecha de reserva</label>
                     <div className="admin-search-wrapper">
                       <Calendar className="admin-search-icon" />
                       <input
                         type="date"
                         value={filtroFecha}
                         onChange={(event) => setFiltroFecha(event.target.value)}
                         className="admin-search-input"
                       />
                     </div>
                   </div>

                   <div className="admin-filter-group admin-filter-search">
                     <label className="admin-filter-label">Buscar</label>
                     <div className="admin-search-wrapper">
                       <Search className="admin-search-icon" />
                       <input
                         type="text"
                         value={terminoBusqueda}
                         onChange={(event) => setTerminoBusqueda(event.target.value)}
                         placeholder="Buscar por espacio o solicitante"
                         className="admin-search-input"
                       />
                     </div>
                   </div>
        </div>

        <div className="admin-results-count">
          <span className="admin-results-text">
            {reservasFiltradas.length} de {reservas.length} reservas encontradas
          </span>
        </div>
      </div>

      {cargando ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      ) : sinReservas ? (
        <div className="admin-empty-state">
          <ClipboardList className="admin-empty-icon" />
          <h3 className="admin-empty-title">No hay reservas en este estado</h3>
          <p className="admin-empty-description">
            {estadoActivo === 'Pendiente'
              ? 'Cuando existan solicitudes nuevas aparecerán aquí para que puedas evaluarlas.'
              : 'Actualmente no existen reservas con este estado.'}
          </p>
        </div>
      ) : sinCoincidencias ? (
        <div className="admin-empty-state">
          <Search className="admin-empty-icon" />
          <h3 className="admin-empty-title">Sin coincidencias</h3>
          <p className="admin-empty-description">
            Ajusta los filtros o la búsqueda para encontrar la reserva que necesitas.
          </p>
        </div>
      ) : (
        <div className="admin-reservas-grid">
          {reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="admin-reserva-card">
              <div className="admin-reserva-header">
                <div>
                  <span className={`admin-reserva-badge admin-reserva-${obtenerEtiquetaEstado(reserva.estado).toLowerCase()}`}>
                    {obtenerEtiquetaEstado(reserva.estado)}
                  </span>
                  <h3 className="admin-reserva-title">Reserva #{reserva.id}</h3>
                  <p className="admin-reserva-description">{reserva.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="admin-reserva-fecha">
                  <Calendar className="admin-reserva-fecha-icon" />
                  <div>
                    <span className="admin-reserva-fecha-label">Fecha reservada</span>
                    <span className="admin-reserva-fecha-valor">
                      {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString('es-PE') : 'Sin fecha'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-reserva-meta">
                <div className="admin-reserva-meta-item">
                  <User className="admin-reserva-meta-icon" />
                  <div>
                    <span className="admin-reserva-meta-label">Solicitante</span>
                    <span className="admin-reserva-meta-value">{reserva.solicitante || 'Desconocido'}</span>
                    <span className="admin-reserva-meta-detail">{reserva.codigoSolicitante}</span>
                    <span className="admin-reserva-meta-detail">{reserva.correoSolicitante}</span>
                  </div>
                </div>
                <div className="admin-reserva-meta-item">
                  <MapPin className="admin-reserva-meta-icon" />
                  <div>
                    <span className="admin-reserva-meta-label">Espacio</span>
                    <span className="admin-reserva-meta-value">{reserva.espacio || 'Sin asignar'}</span>
                    <span className="admin-reserva-meta-detail">{reserva.codigoEspacio}</span>
                    <span className="admin-reserva-meta-detail">{reserva.tipoEspacio}</span>
                  </div>
                </div>
                <div className="admin-reserva-meta-item">
                  <Clock className="admin-reserva-meta-icon" />
                  <div>
                    <span className="admin-reserva-meta-label">Bloque</span>
                    <span className="admin-reserva-meta-value">{reserva.bloque || 'Sin bloque'}</span>
                    <span className="admin-reserva-meta-detail">
                      {reserva.horaInicio && reserva.horaFin
                        ? `${reserva.horaInicio} - ${reserva.horaFin}`
                        : 'Horario no definido'}
                    </span>
                  </div>
                </div>
              </div>

              {reserva.motivo && estadoActivo === 'Rechazada' && (
                <div className="admin-reserva-motivo">
                  <strong>Motivo del rechazo:</strong>
                  <p>{reserva.motivo}</p>
                </div>
              )}

              {estadoActivo === 'Pendiente' && (
                <div className="admin-reserva-actions">
                  <button
                    onClick={() => manejarAprobacion(reserva)}
                    className="admin-reserva-btn admin-reserva-approve"
                    disabled={procesandoAccion}
                  >
                    {procesandoAccion ? <Loader2 className="admin-reserva-btn-icon spinning" /> : <Check className="admin-reserva-btn-icon" />}
                    Aprobar
                  </button>
                  <button
                    onClick={() => abrirModalRechazo(reserva)}
                    className="admin-reserva-btn admin-reserva-reject"
                    disabled={procesandoAccion}
                  >
                    <X className="admin-reserva-btn-icon" />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reservaSeleccionada && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-sm">
            <div className="admin-modal-header admin-modal-header-danger">
              <h3 className="admin-modal-title">
                <X className="admin-modal-title-icon" /> Rechazar reserva #{reservaSeleccionada.id}
              </h3>
              <button onClick={cerrarModalRechazo} className="admin-modal-close">
                <X className="admin-modal-close-icon" />
              </button>
            </div>
            <div className="admin-modal-form">
              <p className="admin-modal-text">
                Indica el motivo del rechazo para que el solicitante pueda ser notificado.
              </p>
              <textarea
                value={motivoRechazo}
                onChange={(event) => setMotivoRechazo(event.target.value)}
                className="admin-textarea"
                placeholder="Describe el motivo del rechazo"
                rows={4}
              />
            </div>
            <div className="admin-modal-actions">
              <button
                onClick={confirmarRechazo}
                className="admin-modal-btn admin-modal-danger"
                disabled={procesandoAccion}
              >
                {procesandoAccion ? <Loader2 className="admin-modal-btn-icon spinning" /> : <X className="admin-modal-btn-icon" />}
                Confirmar rechazo
              </button>
              <button onClick={cerrarModalRechazo} className="admin-modal-btn admin-modal-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
