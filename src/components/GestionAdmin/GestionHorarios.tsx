import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Check, Clock, Calendar, Users, BookOpen } from 'lucide-react';
import { horariosService, type BloqueHorarioCatalogoMap } from '../IntegraUPT/services/horariosService';
import { espaciosService } from '../IntegraUPT/services/espaciosService';
import { usuariosService } from '../IntegraUPT/services/usuariosService';
import type { CursoHorario, CursoHorarioFormData } from '../IntegraUPT/types';

interface GestionHorariosProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

export const GestionHorarios: React.FC<GestionHorariosProps> = ({ onAuditLog }) => {
  const [cursosHorarios, setCursosHorarios] = useState<CursoHorario[]>([]);
  const [espacios, setEspacios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoHorario | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [docentes, setDocentes] = useState<any[]>([]);
  const [bloquesDisponibles, setBloquesDisponibles] = useState<BloqueHorarioCatalogoMap>(horariosService.getBloquesHorarios());

  const [formData, setFormData] = useState<CursoHorarioFormData>({
    curso: '',
    docenteId: 0,
    espacioId: 0,
    bloqueId: 0,
    diaSemana: 'Lunes',
    fechaInicio: '',
    fechaFin: '',
    estado: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cursosData, espaciosData, docentesData] = await Promise.all([
        horariosService.getAllCursosHorarios(),
        espaciosService.getAllEspacios(),
        usuariosService.getDocentes()
      ]);
      
      setCursosHorarios(cursosData);
      setEspacios(espaciosData);
      setDocentes(docentesData);
      
      onAuditLog('admin', 'Cargar Horarios Cursos', 'Horarios', 'success', 'Datos cargados desde BD');
    } catch (error) {
      console.error('Error cargando datos:', error);
      onAuditLog('admin', 'Cargar Horarios Cursos', 'Horarios', 'failed', 'Error al cargar datos desde BD');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

useEffect(() => {
    const cargarBloques = async () => {
      try {
        const bloques = await horariosService.fetchBloquesHorarios();
        setBloquesDisponibles({ ...bloques });
      } catch (error) {
        console.error('Error cargando bloques horarios:', error);
      }
    };

    cargarBloques();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return;

    if (!formData.curso || !formData.docenteId || !formData.espacioId || 
        !formData.bloqueId || !formData.fechaInicio || !formData.fechaFin) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setSaving(true);
      
      if (editingCurso) {
        await horariosService.updateCursoHorario(editingCurso.id, formData);
        onAuditLog('admin', 'Actualizar Curso Horario', 'Horarios', 'success', `Curso ${formData.curso} actualizado`);
      } else {
        await horariosService.createCursoHorario(formData);
        onAuditLog('admin', 'Crear Curso Horario', 'Horarios', 'success', `Curso ${formData.curso} creado`);
      }
      
      await loadData();
      resetForm();
      alert(`Curso ${editingCurso ? 'actualizado' : 'creado'} exitosamente!`);
    } catch (error) {
      console.error('Error al guardar curso:', error);
      const action = editingCurso ? 'Actualizar Curso Horario' : 'Crear Curso Horario';
      onAuditLog('admin', action, 'Horarios', 'failed', `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      alert(`Error al ${editingCurso ? 'actualizar' : 'crear'} curso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso del horario?')) return;

    try {
      await horariosService.deleteCursoHorario(id);
      onAuditLog('admin', 'Eliminar Curso Horario', 'Horarios', 'success', 'Curso eliminado del horario');
      await loadData();
      alert('Curso eliminado del horario exitosamente!');
    } catch (error) {
      console.error('Error al eliminar:', error);
      onAuditLog('admin', 'Eliminar Curso Horario', 'Horarios', 'failed', `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      alert(`Error al eliminar curso: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEdit = (curso: CursoHorario) => {
    setEditingCurso(curso);
    
    const espacioEncontrado = espacios.find(esp => 
        curso.ubicacion.includes(esp.codigo) || 
        curso.ubicacion.includes(esp.nombre)
    );
    
    const bloqueEncontrado = Object.entries(bloquesDisponibles).find(([id, bloque]) => 
        curso.horario.includes(bloque.horaInicio)
    );

    const docenteEncontrado = docentes.find(doc => 
        curso.docente === `${doc.nombres} ${doc.apellidos}`
    );

    setFormData({
        curso: curso.curso,
        docenteId: docenteEncontrado ? docenteEncontrado.id : 0,
        espacioId: espacioEncontrado ? espacioEncontrado.id : 0,
        bloqueId: bloqueEncontrado ? parseInt(bloqueEncontrado[0]) : 0,
        diaSemana: mapearDiasFormato(curso.dias),
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: curso.estado
    });
    setShowModal(true);
  };
  
  const mapearDiasFormato = (dias: string): any => {
      if (dias.includes('Lun')) return 'Lunes';
      if (dias.includes('Mar')) return 'Martes';
      if (dias.includes('Mié')) return 'Miercoles';
      if (dias.includes('Jue')) return 'Jueves';
      if (dias.includes('Vie')) return 'Viernes';
      if (dias.includes('Sáb')) return 'Sabado';
      return 'Lunes';
  };

  const handleNew = () => {
    setEditingCurso(null);
    setFormData({
      curso: '',
      docenteId: 0,
      espacioId: 0,
      bloqueId: 0,
      diaSemana: 'Lunes',
      fechaInicio: '',
      fechaFin: '',
      estado: true
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      curso: '',
      docenteId: 0,
      espacioId: 0,
      bloqueId: 0,
      diaSemana: 'Lunes',
      fechaInicio: '',
      fechaFin: '',
      estado: true
    });
    setEditingCurso(null);
    setShowModal(false);
    setSaving(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (searchTerm.trim()) {
        const resultados = await horariosService.searchCursosHorarios(searchTerm);
        setCursosHorarios(resultados);
      } else {
        await loadData();
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const cursosFiltrados = cursosHorarios.filter(curso =>
    curso.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curso.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curso.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const diasSemana = horariosService.getDiasSemana();

  return (
    <div>
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Gestión de Horarios de Cursos</h2>
          <p className="admin-content-subtitle">Administra los horarios académicos registrados</p>
        </div>
        <button 
          onClick={handleNew}
          className="admin-primary-btn admin-primary-green"
        >
          <Plus className="admin-btn-icon" />
          Nuevo Curso
        </button>
      </div>

      <div className="admin-users-filters">
        <form onSubmit={handleSearch} className="admin-search-wrapper">
          <Search className="admin-search-icon" />
          <input
            type="text"
            placeholder="Buscar horarios por curso, docente o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="admin-search-btn">
            Buscar
          </button>
        </form>
      </div>

      <div className="admin-schedule-list">
        <h3 className="admin-schedule-list-title">
          <BookOpen className="admin-schedule-icon" />
          Lista de Horarios Registrados
        </h3>
        
        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Cargando horarios de cursos...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead className="admin-table-header">
                <tr>
                  <th className="admin-table-th">CURSO</th>
                  <th className="admin-table-th">DOCENTE</th>
                  <th className="admin-table-th">DIAS</th>
                  <th className="admin-table-th">HORARIO</th>
                  <th className="admin-table-th">UBICACIÓN</th>
                  <th className="admin-table-th">ESTUDIANTES</th>
                  <th className="admin-table-th">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="admin-table-body">
                {cursosFiltrados.map((curso) => (
                  <tr key={curso.id} className="admin-table-row">
                    <td className="admin-table-td">
                      <div className="admin-curso-info">
                        <div className="admin-curso-name">{curso.curso}</div>
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-docente-info">
                        <Users className="admin-docente-icon" size={14} />
                        {curso.docente}
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <span className="admin-badge admin-badge-blue">
                        {curso.dias}
                      </span>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-horario-time">
                        <Clock className="admin-horario-icon" size={14} />
                        {curso.horario}
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-ubicacion-info">
                        <Calendar className="admin-ubicacion-icon" size={14} />
                        {curso.ubicacion}
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-estudiantes-info">
                        <Users className="admin-estudiantes-icon" size={14} />
                        {curso.estudiantes} estudiantes
                      </div>
                    </td>
                    <td className="admin-table-td">
                      <div className="admin-actions">
                        <button 
                          onClick={() => handleEdit(curso)}
                          className="admin-action-btn admin-action-edit"
                          title="Editar"
                        >
                          <Edit className="admin-action-icon" />
                        </button>
                        <button 
                          onClick={() => handleDelete(curso.id)}
                          className="admin-action-btn admin-action-delete"
                          title="Eliminar"
                        >
                          <Trash2 className="admin-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cursosFiltrados.length === 0 && (
              <div className="admin-empty-state">
                <BookOpen className="admin-empty-icon" size={48} />
                <h3>No se encontraron horarios de cursos</h3>
                <p>No hay cursos registrados en el horario o no coinciden con tu búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCurso ? 'Editar Curso en Horario' : 'Nuevo Curso en Horario'}
              </h3>
              <button onClick={resetForm} className="admin-modal-close">
                <X className="admin-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="admin-modal-form">
              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Información del Curso</h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nombre del Curso</label>
                    <input
                      type="text"
                      value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                      className="admin-form-input"
                      placeholder="Ej: Matemáticas III"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Docente</label>
                    <select
                      value={formData.docenteId}
                      onChange={(e) => setFormData({ ...formData, docenteId: Number(e.target.value) })}
                      className="admin-form-select"
                      required
                    >
                      <option value="">Seleccionar docente</option>
                      {docentes.map(docente => (
                        <option key={docente.id} value={docente.id}>
                          {docente.nombres} {docente.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Espacio</label>
                    <select
                      value={formData.espacioId}
                      onChange={(e) => setFormData({ ...formData, espacioId: Number(e.target.value) })}
                      className="admin-form-select"
                      required
                    >
                      <option value="">Seleccionar espacio</option>
                      {espacios.map(espacio => (
                        <option key={espacio.id} value={espacio.id}>
                          {espacio.codigo} - {espacio.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Bloque Horario</label>
                    <select
                      value={formData.bloqueId}
                      onChange={(e) => setFormData({ ...formData, bloqueId: Number(e.target.value) })}
                      className="admin-form-select"
                      required
                    >
                      <option value="">Seleccionar bloque</option>
                      {Object.entries(bloquesDisponibles).map(([id, bloque]) => (
                        <option key={id} value={id}>
                          {bloque.nombre} ({bloque.horaInicio} - {bloque.horaFinal})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Día de la Semana</label>
                    <select
                      value={formData.diaSemana}
                      onChange={(e) => setFormData({ ...formData, diaSemana: e.target.value as any })}
                      className="admin-form-select"
                      required
                    >
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="admin-form-input"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="admin-form-input"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estado</label>
                    <div className="admin-form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        className="admin-checkbox"
                        id="estado"
                      />
                      <label htmlFor="estado" className="admin-checkbox-label">
                        Curso activo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="submit"
                  className="admin-modal-btn admin-modal-primary"
                  disabled={saving}
                >
                  <Check className="admin-modal-btn-icon" />
                  {saving ? 'Guardando...' : (editingCurso ? 'Guardar Cambios' : 'Crear Curso')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-modal-btn admin-modal-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};