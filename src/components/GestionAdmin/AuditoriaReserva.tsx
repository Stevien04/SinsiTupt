import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  User,
  XCircle
} from 'lucide-react';

let cachedXLSX: Promise<any> | null = null;
let cachedJsPDF: Promise<any> | null = null;
let cachedAutoTable: Promise<any> | null = null;

const loadXLSX = async () => {
  // Usar la dependencia local `xlsx` en lugar de importar desde un CDN externo.
  if (!cachedXLSX) {
    cachedXLSX = import('xlsx').then((mod) => mod.default ?? mod);
  }
  return cachedXLSX;
};

const loadJsPDF = async () => {
  // Usar la dependencia local `jspdf`.
  if (!cachedJsPDF) {
    cachedJsPDF = import('jspdf').then((mod) => mod.default ?? mod);
  }
  return cachedJsPDF;
};

const loadAutoTable = async () => {
  // Usar la dependencia local `jspdf-autotable`.
  if (!cachedAutoTable) {
    cachedAutoTable = import('jspdf-autotable').then((mod) => mod.default ?? mod);
  }
  return cachedAutoTable;
};

interface AuditoriaReserva {
  idAudit: number;
  idReserva: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
  usuarioCambio: number;
  nombreUsuario?: string;
  espacioReserva?: string;
  solicitanteReserva?: string;
}

interface AuditoriaReservaProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

export const AuditoriaReserva: React.FC<AuditoriaReservaProps> = ({ onAuditLog }) => {
  const [auditorias, setAuditorias] = useState<AuditoriaReserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [exportando, setExportando] = useState<'pdf' | 'excel' | null>(null);
  const [mensajeInfo, setMensajeInfo] = useState<string | null>(null);

  const [filtros, setFiltros] = useState({
    idReserva: '',
    usuarioCambio: '',
    estadoAnterior: 'all',
    estadoNuevo: 'all',
    fechaInicio: '',
    fechaFin: ''
  });

  // Cargar datos de auditoría
  const cargarAuditorias = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const response = await fetch(apiUrl('auditoria-reservas'));
      
      if (!response.ok) {
        throw new Error('Error al cargar los registros de auditoría');
      }
      
      const data = await response.json();
      setAuditorias(data);
      setMensajeInfo(null);
      
      onAuditLog('admin', 'Cargar Auditoría Reservas', 'Auditoría Reservas', 'success', 
        `${data.length} registros cargados`);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los registros de auditoría');
      onAuditLog('admin', 'Cargar Auditoría Reservas', 'Auditoría Reservas', 'failed', 
        'Error al cargar registros');
    } finally {
      setCargando(false);
    }
  };

  // Buscar con filtros
  const buscarConFiltros = async () => {
    try {
      setCargando(true);
      setError(null);
      setMensajeInfo(null);
      
      const params = new URLSearchParams();
      
      if (filtros.idReserva) params.append('idReserva', filtros.idReserva);
      if (filtros.usuarioCambio) params.append('usuarioCambio', filtros.usuarioCambio);
      if (filtros.estadoAnterior !== 'all') params.append('estadoAnterior', filtros.estadoAnterior);
      if (filtros.estadoNuevo !== 'all') params.append('estadoNuevo', filtros.estadoNuevo);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio + 'T00:00:00');
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin + 'T23:59:59');
      
      const response = await fetch(`${apiUrl('auditoria-reservas/buscar')}?${params}`);
      
      if (!response.ok) throw new Error('Error en la búsqueda');
      
      const data = await response.json();
      setAuditorias(data);
      
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al aplicar filtros');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAuditorias();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    if (!mostrarFiltros) {
      cargarAuditorias();
    }
  }, [mostrarFiltros]);

  useEffect(() => {
    if (!mensajeInfo) {
      return;
    }

    const timeout = window.setTimeout(() => setMensajeInfo(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [mensajeInfo]);

  const limpiarFiltros = () => {
    setFiltros({
      idReserva: '',
      usuarioCambio: '',
      estadoAnterior: 'all',
      estadoNuevo: 'all',
      fechaInicio: '',
      fechaFin: ''
    });
    setBusqueda('');
    setError(null);
    setMensajeInfo(null);
    cargarAuditorias();
  };

  const aplicarFiltros = () => {
    if (filtros.idReserva) {
      const idReservaNumber = Number(filtros.idReserva);
      if (Number.isNaN(idReservaNumber) || idReservaNumber <= 0) {
        setError('El ID de reserva debe ser un número positivo.');
        return;
      }
    }

    if (filtros.usuarioCambio) {
      const usuarioCambioNumber = Number(filtros.usuarioCambio);
      if (Number.isNaN(usuarioCambioNumber) || usuarioCambioNumber <= 0) {
        setError('El ID del usuario que realizó el cambio debe ser un número positivo.');
        return;
      }
    }

    if (filtros.fechaInicio && filtros.fechaFin && filtros.fechaInicio > filtros.fechaFin) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    setMensajeInfo(null);
    buscarConFiltros();
  };

  // Filtrar localmente por búsqueda
  const auditoriasFiltradas = auditorias.filter((auditoria) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;

    return (
      auditoria.idReserva.toString().includes(termino) ||
      auditoria.nombreUsuario?.toLowerCase().includes(termino) ||
      auditoria.espacioReserva?.toLowerCase().includes(termino) ||
      auditoria.solicitanteReserva?.toLowerCase().includes(termino) ||
      auditoria.estadoAnterior?.toLowerCase().includes(termino) ||
      auditoria.estadoNuevo?.toLowerCase().includes(termino)
    );
  });

  const obtenerNombreUsuario = (auditoria: AuditoriaReserva) =>
    auditoria.nombreUsuario
      ? `${auditoria.nombreUsuario} (${auditoria.usuarioCambio})`
      : `Usuario ${auditoria.usuarioCambio}`;

  const exportarExcel = async (registros: AuditoriaReserva[]) => {
    const XLSX = await loadXLSX();
    const hoja = XLSX.utils.json_to_sheet(
      registros.map((auditoria) => ({
        'ID Auditoría': auditoria.idAudit,
        'ID Reserva': auditoria.idReserva,
        'Estado Anterior': auditoria.estadoAnterior,
        'Estado Nuevo': auditoria.estadoNuevo,
        'Fecha y Hora': formatFecha(auditoria.fechaCambio),
        'Usuario Cambio': obtenerNombreUsuario(auditoria),
        Espacio: auditoria.espacioReserva || 'N/A',
        Solicitante: auditoria.solicitanteReserva || 'N/A'
      }))
    );

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Auditoría');
    const nombreArchivo = `auditoria_reservas_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(libro, nombreArchivo);
  };

  const exportarPdf = async (registros: AuditoriaReserva[]) => {
    const jsPDF = await loadJsPDF();
    const autoTable = await loadAutoTable();
    const doc = new jsPDF({ orientation: 'landscape' });
    const generadoEn = new Date();

    doc.setFontSize(14);
    doc.text('Auditoría de Reservas', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generado: ${generadoEn.toLocaleString('es-PE')}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [[
        'ID Auditoría',
        'ID Reserva',
        'Estado Anterior',
        'Estado Nuevo',
        'Fecha y Hora',
        'Usuario',
        'Espacio',
        'Solicitante'
      ]],
      body: registros.map((auditoria) => [
        auditoria.idAudit,
        auditoria.idReserva,
        auditoria.estadoAnterior,
        auditoria.estadoNuevo,
        formatFecha(auditoria.fechaCambio),
        obtenerNombreUsuario(auditoria),
        auditoria.espacioReserva || 'N/A',
        auditoria.solicitanteReserva || 'N/A'
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [39, 76, 119] },
      alternateRowStyles: { fillColor: [242, 246, 252] }
    });

    const nombreArchivo = `auditoria_reservas_${generadoEn.toISOString().substring(0, 10)}.pdf`;
    doc.save(nombreArchivo);
  };

  const handleExportar = async (formato: 'pdf' | 'excel') => {
    const registros = auditoriasFiltradas.length > 0 ? auditoriasFiltradas : auditorias;

    if (registros.length === 0) {
      setError('No hay registros disponibles para exportar.');
      onAuditLog(
        'admin',
        `Exportar Auditoría Reservas ${formato.toUpperCase()}`,
        'Auditoría Reservas',
        'failed',
        'Sin registros para exportar'
      );
      return;
    }

    try {
      setExportando(formato);
      if (formato === 'excel') {
        await exportarExcel(registros);
      } else {
        await exportarPdf(registros);
      }

      const mensaje = `${formato === 'excel' ? 'Excel' : 'PDF'} generado con ${registros.length} registro${registros.length === 1 ? '' : 's'}.`;
      setMensajeInfo(mensaje);
      setError(null);
      onAuditLog(
        'admin',
        `Exportar Auditoría Reservas ${formato.toUpperCase()}`,
        'Auditoría Reservas',
        'success',
        mensaje
      );
    } catch (errorExport) {
      console.error('Error exportando:', errorExport);
      setError('No se pudo generar el archivo de auditoría. Inténtalo nuevamente.');
      onAuditLog(
        'admin',
        `Exportar Auditoría Reservas ${formato.toUpperCase()}`,
        'Auditoría Reservas',
        'failed',
        'Error al generar archivo'
      );
    } finally {
      setExportando(null);
    }
  };

  const formatFechaFiltro = (fecha: string) => {
    if (!fecha) return '';
    const date = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return fecha;
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filtrosActivos = (
    [
      busqueda.trim() && {
        key: 'busqueda',
        label: `Búsqueda: "${busqueda.trim()}"`,
        icon: <Search size={14} />
      },
      filtros.idReserva && {
        key: 'idReserva',
        label: `Reserva #${filtros.idReserva}`,
        icon: <Filter size={14} />
      },
      filtros.usuarioCambio && {
        key: 'usuarioCambio',
        label: `Usuario ${filtros.usuarioCambio}`,
        icon: <User size={14} />
      },
      filtros.estadoAnterior !== 'all' && {
        key: 'estadoAnterior',
        label: `Estado anterior: ${filtros.estadoAnterior}`,
        icon: <ArrowUpDown size={14} />
      },
      filtros.estadoNuevo !== 'all' && {
        key: 'estadoNuevo',
        label: `Estado nuevo: ${filtros.estadoNuevo}`,
        icon: <ArrowUpDown size={14} />
      },
      filtros.fechaInicio && {
        key: 'fechaInicio',
        label: `Desde ${formatFechaFiltro(filtros.fechaInicio)}`,
        icon: <Calendar size={14} />
      },
      filtros.fechaFin && {
        key: 'fechaFin',
        label: `Hasta ${formatFechaFiltro(filtros.fechaFin)}`,
        icon: <Calendar size={14} />
      }
  ].filter(Boolean) as Array<{ key: string; label: string; icon?: React.ReactNode }>
  );

  const obtenerColorEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada': return 'admin-badge-green';
      case 'pendiente': return 'admin-badge-yellow';
      case 'cancelado': return 'admin-badge-red';
      case 'rechazada': return 'admin-badge-red';
      default: return 'admin-badge-gray';
    }
  };

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Cargando registros de auditoría de reservas...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Auditoría de Reservas</h2>
          <p className="admin-content-subtitle">Registro de cambios de estado en las reservas del sistema</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="admin-primary-btn admin-primary-orange"
          >
            <Filter className="admin-btn-icon" />
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button
            type="button"
            onClick={() => void handleExportar('pdf')}
            className="admin-primary-btn admin-primary-red"
            disabled={exportando !== null}
          >
            <Download className="admin-btn-icon" />
            {exportando === 'pdf' ? 'Generando...' : 'Exportar PDF'}
          </button>
          <button
            type="button"
            onClick={() => void handleExportar('excel')}
            className="admin-primary-btn admin-primary-green"
            disabled={exportando !== null}
          >
            <Download className="admin-btn-icon" />
            {exportando === 'excel' ? 'Generando...' : 'Exportar Excel'}
          </button>
          <button
            type="button"
            onClick={cargarAuditorias}
            className="admin-primary-btn admin-primary-blue"
          >
            <RefreshCw className="admin-btn-icon" />
            Actualizar
          </button>
        </div>
      </div>

      {(error || mensajeInfo) && (
        <div className="admin-feedback-stack">
          {error && (
            <div className="admin-alert admin-alert-error">
              <AlertCircle className="admin-alert-icon" />
              <div>
                <p className="admin-alert-details">{error}</p>
              </div>
            </div>
          )}

          {mensajeInfo && (
            <div className="admin-alert admin-alert-success">
              <CheckCircle className="admin-alert-icon" />
              <div>
                <p className="admin-alert-details">{mensajeInfo}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas */}
      <div className="admin-audit-stats">
        <div className="admin-audit-stat admin-audit-blue">
          <BarChart3 className="admin-audit-stat-icon" />
          <div>
            <p className="admin-audit-stat-label">Total de Cambios</p>
            <p className="admin-audit-stat-value">{auditorias.length}</p>
          </div>
        </div>
        <div className="admin-audit-stat admin-audit-green">
          <CheckCircle className="admin-audit-stat-icon" />
          <div>
            <p className="admin-audit-stat-label">Aprobaciones</p>
            <p className="admin-audit-stat-value">
              {auditorias.filter(a => a.estadoNuevo === 'Aprobada').length}
            </p>
          </div>
        </div>
        <div className="admin-audit-stat admin-audit-red">
          <XCircle className="admin-audit-stat-icon" />
          <div>
            <p className="admin-audit-stat-label">Cancelaciones</p>
            <p className="admin-audit-stat-value">
              {auditorias.filter(a => a.estadoNuevo === 'Cancelado').length}
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="admin-audit-filters">
        <div className="admin-search-wrapper admin-search-expanded">
          <Search className="admin-search-icon" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Buscar en auditoría de reservas..."
            className="admin-search-input"
          />
        </div>

        {mostrarFiltros && (
          <div className="admin-filters-grid">
            <div className="admin-filter-group">
              <label className="admin-filter-label">ID Reserva</label>
              <input
                type="number"
                min={1}
                step={1}
                value={filtros.idReserva}
                onChange={(e) => {
                  setFiltros({ ...filtros, idReserva: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="Ej: 123"
                className="admin-filter-input"
              />
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label">Usuario Cambio</label>
              <input
                type="number"
                min={1}
                step={1}
                value={filtros.usuarioCambio}
                onChange={(e) => {
                  setFiltros({ ...filtros, usuarioCambio: e.target.value });
                  if (error) setError(null);
                }}
                placeholder="ID Usuario"
                className="admin-filter-input"
              />
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label">Estado Anterior</label>
              <select
                value={filtros.estadoAnterior}
                onChange={(e) => {
                  setFiltros({ ...filtros, estadoAnterior: e.target.value });
                  if (error) setError(null);
                }}
                className="admin-filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label">Estado Nuevo</label>
              <select
                value={filtros.estadoNuevo}
                onChange={(e) => {
                  setFiltros({ ...filtros, estadoNuevo: e.target.value });
                  if (error) setError(null);
                }}
                className="admin-filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => {
                  setFiltros({ ...filtros, fechaInicio: e.target.value });
                  if (error) setError(null);
                }}
                className="admin-filter-input"
              />
            </div>

            <div className="admin-filter-group">
              <label className="admin-filter-label">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => {
                  setFiltros({ ...filtros, fechaFin: e.target.value });
                  if (error) setError(null);
                }}
                className="admin-filter-input"
              />
            </div>

            <div className="admin-filter-actions">
              <button
                type="button"
                onClick={aplicarFiltros}
                className="admin-primary-btn admin-primary-blue"
              >
                <Filter className="admin-btn-icon" />
                Aplicar Filtros
              </button>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="admin-secondary-btn"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {filtrosActivos.length > 0 && (
          <div className="admin-active-filters">
            {filtrosActivos.map(({ key, label, icon }) => (
              <span key={key} className="admin-filter-tag">
                {icon && <span className="admin-filter-tag-icon">{icon}</span>}
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="admin-results-count">
        <span className="admin-results-text">
          {auditoriasFiltradas.length} de {auditorias.length} registros encontrados
        </span>
      </div>

      {/* Tabla de Auditoría */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead className="admin-table-header">
            <tr>
              <th className="admin-table-th">ID Auditoría</th>
              <th className="admin-table-th">ID Reserva</th>
              <th className="admin-table-th">Cambio de Estado</th>
              <th className="admin-table-th">Fecha y Hora</th>
              <th className="admin-table-th">Usuario</th>
              <th className="admin-table-th">Espacio</th>
              <th className="admin-table-th">Solicitante</th>
            </tr>
          </thead>
          <tbody className="admin-table-body">
            {auditoriasFiltradas.map((auditoria) => (
              <tr key={auditoria.idAudit} className="admin-table-row">
                <td className="admin-table-td">
                  <span className="admin-audit-id">#{auditoria.idAudit}</span>
                </td>
                <td className="admin-table-td">
                  <span className="admin-reserva-id">Reserva #{auditoria.idReserva}</span>
                </td>
                <td className="admin-table-td">
                  <div className="admin-audit-estado-cambio">
                    <span className={`admin-badge ${obtenerColorEstado(auditoria.estadoAnterior)}`}>
                      {auditoria.estadoAnterior}
                    </span>
                    <ArrowUpDown className="admin-audit-arrow" size={16} />
                    <span className={`admin-badge ${obtenerColorEstado(auditoria.estadoNuevo)}`}>
                      {auditoria.estadoNuevo}
                    </span>
                  </div>
                </td>
                <td className="admin-table-td">
                  <div className="admin-audit-timestamp">
                    <Clock className="admin-audit-time-icon" size={14} />
                    {formatFecha(auditoria.fechaCambio)}
                  </div>
                </td>
                <td className="admin-table-td">
                  <div className="admin-audit-user">
                    <User className="admin-audit-user-icon" size={14} />
                    {auditoria.nombreUsuario || `Usuario ${auditoria.usuarioCambio}`}
                  </div>
                </td>
                <td className="admin-table-td">
                  {auditoria.espacioReserva || 'N/A'}
                </td>
                <td className="admin-table-td">
                  {auditoria.solicitanteReserva || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {auditoriasFiltradas.length === 0 && (
          <div className="admin-empty-state">
            <FileText className="admin-empty-icon" />
            <h3 className="admin-empty-title">No se encontraron registros de auditoría</h3>
            <p className="admin-empty-description">
              {auditorias.length === 0 
                ? 'No hay registros de auditoría de reservas en el sistema.'
                : 'No hay registros que coincidan con los filtros aplicados.'
              }
            </p>
            <button 
              onClick={limpiarFiltros}
              className="admin-primary-btn admin-primary-blue"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
