import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Users, Calendar, Server, TrendingUp } from 'lucide-react';

interface EstadisticasGenerales {
  totalEstudiantes: number;
  totalDocentes: number;
  reservasActivas: number;
  tasaUso: number;
  reservasEsteMes: number;
  reservasMesAnterior: number;
  variacionReservas: string;
}

interface UsoEspacio {
  nombreEspacio: string;
  codigoEspacio: string;
  tipoEspacio: string;
  totalReservas: number;
  porcentajeUso: number;
}

interface ReservasMes {
  mes: string;
  anio: number;
  totalReservas: number;
}

interface ReportesEstadisticasProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

export const ReportesEstadisticas: React.FC<ReportesEstadisticasProps> = ({ onAuditLog }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalEstudiantes: 0,
    totalDocentes: 0,
    reservasActivas: 0,
    tasaUso: 0,
    reservasEsteMes: 0,
    reservasMesAnterior: 0,
    variacionReservas: '→ 0%'
  });
  
  const [usoEspacios, setUsoEspacios] = useState<UsoEspacio[]>([]);
  const [reservasPorMes, setReservasPorMes] = useState<ReservasMes[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const urlBase = 'http://localhost:8080/api/reportes';

  const cargarDatosReportes = async () => {
    try {
      setCargando(true);
      setError(null);

      const [estadisticasRes, usoEspaciosRes, reservasMesRes] = await Promise.all([
        fetch(`${urlBase}/estadisticas-generales`),
        fetch(`${urlBase}/uso-espacios`),
        fetch(`${urlBase}/reservas-mes`)
      ]);

      if (!estadisticasRes.ok || !usoEspaciosRes.ok || !reservasMesRes.ok) {
        throw new Error('Error al cargar los datos de reportes');
      }

      const [estadisticasData, usoEspaciosData, reservasMesData] = await Promise.all([
        estadisticasRes.json(),
        usoEspaciosRes.json(),
        reservasMesRes.json()
      ]);

      setEstadisticas(estadisticasData);
      setUsoEspacios(usoEspaciosData);
      setReservasPorMes(reservasMesData);

      onAuditLog('admin', 'Cargar Reportes', 'Reportes', 'success', 'Datos de reportes cargados correctamente');
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('No se pudieron cargar los datos de reportes');
      onAuditLog('admin', 'Cargar Reportes', 'Reportes', 'failed', 'Error al cargar datos de reportes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosReportes();
  }, []);

  const handleGenerarReporte = () => {
    const seleccionarFormato = () => {
      const formato = prompt(
        'Selecciona el formato de descarga:\n\n1 - PDF\n2 - Excel\n\nIngresa 1 o 2:'
      );

      if (formato === '1') {
        descargarReportePDF();
      } else if (formato === '2') {
        descargarReporteExcel();
      } else if (formato) {
        alert('Formato no válido. Por favor ingresa 1 para PDF o 2 para Excel.');
      }
    };

    seleccionarFormato();
  };

  const descargarReportePDF = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/exportacion/pdf');
      if (!response.ok) throw new Error('Error al generar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Obtener el nombre del archivo del header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'reporte_estadisticas.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onAuditLog('admin', 'Descargar Reporte PDF', 'Reportes', 'success', 'Reporte PDF descargado correctamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      onAuditLog('admin', 'Descargar Reporte PDF', 'Reportes', 'failed', 'Error al descargar reporte PDF');
      alert('Error al descargar el reporte PDF. Por favor intenta nuevamente.');
    }
  };

  const descargarReporteExcel = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/exportacion/excel');
      if (!response.ok) throw new Error('Error al generar Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Obtener el nombre del archivo del header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'reporte_estadisticas.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onAuditLog('admin', 'Descargar Reporte Excel', 'Reportes', 'success', 'Reporte Excel descargado correctamente');
    } catch (error) {
      console.error('Error descargando Excel:', error);
      onAuditLog('admin', 'Descargar Reporte Excel', 'Reportes', 'failed', 'Error al descargar reporte Excel');
      alert('Error al descargar el reporte Excel. Por favor intenta nuevamente.');
    }
  };

  const obtenerColorVariacion = (variacion: string) => {
    if (variacion.includes('↑')) return 'admin-report-green';
    if (variacion.includes('↓')) return 'admin-report-red';
    return 'admin-report-gray';
  };

  if (cargando) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Cargando reportes y estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-alert admin-alert-error">
        <BarChart3 className="admin-alert-icon" />
        <div>
          <p>Error al cargar los reportes</p>
          <p className="admin-alert-details">{error}</p>
          <button 
            onClick={cargarDatosReportes}
            className="admin-primary-btn admin-primary-blue"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Reportes y Estadísticas</h2>
          <p className="admin-content-subtitle">Análisis y métricas del sistema</p>
        </div>
        <button 
          onClick={handleGenerarReporte}
          className="admin-primary-btn admin-primary-red"
        >
          <Download className="admin-btn-icon" />
          Generar Reporte
        </button>
      </div>

      {/* Estadísticas Principales */}
      <div className="admin-reports-stats">
        <div className="admin-report-stat">
          <div className="admin-report-stat-icon admin-report-blue">
            <Users className="admin-report-stat-icon-svg" />
          </div>
          <div className="admin-report-stat-content">
            <p className="admin-report-stat-label">Total Estudiantes</p>
            <p className="admin-report-stat-value">{estadisticas.totalEstudiantes.toLocaleString()}</p>
            <p className="admin-report-stat-change admin-report-blue">
              Registrados en el sistema
            </p>
          </div>
        </div>

        <div className="admin-report-stat">
          <div className="admin-report-stat-icon admin-report-green">
            <Users className="admin-report-stat-icon-svg" />
          </div>
          <div className="admin-report-stat-content">
            <p className="admin-report-stat-label">Total Docentes</p>
            <p className="admin-report-stat-value">{estadisticas.totalDocentes.toLocaleString()}</p>
            <p className="admin-report-stat-change admin-report-green">
              Docentes activos
            </p>
          </div>
        </div>

        <div className="admin-report-stat">
          <div className="admin-report-stat-icon admin-report-purple">
            <Calendar className="admin-report-stat-icon-svg" />
          </div>
          <div className="admin-report-stat-content">
            <p className="admin-report-stat-label">Reservas Activas</p>
            <p className="admin-report-stat-value">{estadisticas.reservasActivas.toLocaleString()}</p>
            <p className="admin-report-stat-change admin-report-purple">
              Reservas vigentes
            </p>
          </div>
        </div>

        <div className="admin-report-stat">
          <div className="admin-report-stat-icon admin-report-orange">
            <TrendingUp className="admin-report-stat-icon-svg" />
          </div>
          <div className="admin-report-stat-content">
            <p className="admin-report-stat-label">Tasa de Uso</p>
            <p className="admin-report-stat-value">{estadisticas.tasaUso.toFixed(1)}%</p>
            <p className={`admin-report-stat-change ${obtenerColorVariacion(estadisticas.variacionReservas)}`}>
              {estadisticas.variacionReservas} vs período anterior
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de Tipos de Espacio */}
      <div className="admin-reports-summary">
        <h3 className="admin-reports-summary-title">Resumen por Tipo de Espacio</h3>
        <div className="admin-reports-summary-grid">
          <div className="admin-summary-card admin-summary-blue">
            <Server className="admin-summary-icon" />
            <div className="admin-summary-content">
              <h4 className="admin-summary-title">Laboratorios</h4>
              <p className="admin-summary-value">
                {usoEspacios.filter(e => e.tipoEspacio === 'Laboratorio').length} espacios
              </p>
              <p className="admin-summary-description">
                {usoEspacios.filter(e => e.tipoEspacio === 'Laboratorio')
                 .reduce((sum, e) => sum + e.totalReservas, 0)} reservas totales
              </p>
            </div>
          </div>

          <div className="admin-summary-card admin-summary-purple">
            <Calendar className="admin-summary-icon" />
            <div className="admin-summary-content">
              <h4 className="admin-summary-title">Aulas</h4>
              <p className="admin-summary-value">
                {usoEspacios.filter(e => e.tipoEspacio === 'Salon').length} espacios
              </p>
              <p className="admin-summary-description">
                {usoEspacios.filter(e => e.tipoEspacio === 'Salon')
                 .reduce((sum, e) => sum + e.totalReservas, 0)} reservas totales
              </p>
            </div>
          </div>

          <div className="admin-summary-card admin-summary-green">
            <TrendingUp className="admin-summary-icon" />
            <div className="admin-summary-content">
              <h4 className="admin-summary-title">Espacio Más Solicitado</h4>
              <p className="admin-summary-value">
                {usoEspacios.length > 0 ? usoEspacios[0].codigoEspacio : 'N/A'}
              </p>
              <p className="admin-summary-description">
                {usoEspacios.length > 0 ? usoEspacios[0].totalReservas : 0} reservas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y Métricas Detalladas */}
      <div className="admin-reports-charts">
        {/* Uso de Laboratorios */}
        <div className="admin-report-chart">
          <div className="admin-report-chart-header">
            <h3 className="admin-report-chart-title">
              <Server className="admin-report-chart-icon" />
              Uso de Espacios
            </h3>
            <span className="admin-report-chart-subtitle">
              Distribución de reservas por espacio
            </span>
          </div>
          
          <div className="admin-usage-bars">
            {usoEspacios.slice(0, 6).map((espacio, idx) => (
              <div key={idx} className="admin-usage-bar">
                <div className="admin-usage-info">
                  <span className="admin-usage-name">
                    {espacio.codigoEspacio} - {espacio.nombreEspacio}
                  </span>
                  <span className="admin-usage-percent">
                    {espacio.porcentajeUso.toFixed(1)}%
                  </span>
                </div>
                <div className="admin-usage-track">
                  <div
                    className={`admin-usage-progress ${
                      espacio.porcentajeUso > 75 ? 'admin-usage-green' :
                      espacio.porcentajeUso > 50 ? 'admin-usage-blue' :
                      espacio.porcentajeUso > 25 ? 'admin-usage-yellow' : 'admin-usage-gray'
                    }`}
                    style={{ width: `${Math.min(espacio.porcentajeUso, 100)}%` }}
                  ></div>
                </div>
                <div className="admin-usage-details">
                  <span className="admin-usage-type">{espacio.tipoEspacio}</span>
                  <span className="admin-usage-count">{espacio.totalReservas} reservas</span>
                </div>
              </div>
            ))}
          </div>

          {usoEspacios.length === 0 && (
            <div className="admin-empty-state admin-empty-state-sm">
              <BarChart3 className="admin-empty-icon" />
              <h3 className="admin-empty-title">No hay datos de uso</h3>
              <p className="admin-empty-description">
                No se encontraron reservas para generar estadísticas de uso
              </p>
            </div>
          )}
        </div>

        {/* Reservas por Mes */}
        <div className="admin-report-chart">
          <div className="admin-report-chart-header">
            <h3 className="admin-report-chart-title">
              <Calendar className="admin-report-chart-icon" />
              Reservas por Mes
            </h3>
            <span className="admin-report-chart-subtitle">
              Tendencia de reservas en los últimos meses
            </span>
          </div>
          
          <div className="admin-monthly-reservas">
            {reservasPorMes.map((mes, idx) => (
              <div key={idx} className="admin-monthly-item">
                <div className="admin-monthly-header">
                  <span className="admin-monthly-name">{mes.mes} {mes.anio}</span>
                  <span className="admin-monthly-count">{mes.totalReservas} reservas</span>
                </div>
                <div className="admin-monthly-bar-container">
                  <div 
                    className="admin-monthly-bar"
                    style={{ 
                      width: `${(mes.totalReservas / Math.max(...reservasPorMes.map(m => m.totalReservas))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {reservasPorMes.length === 0 && (
            <div className="admin-empty-state admin-empty-state-sm">
              <Calendar className="admin-empty-icon" />
              <h3 className="admin-empty-title">No hay reservas mensuales</h3>
              <p className="admin-empty-description">
                No se encontraron reservas para el análisis temporal
              </p>
            </div>
          )}
        </div>
      </div>      
    </div>
  );
};