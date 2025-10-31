import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit, Trash2, Search, X, Check, Filter } from 'lucide-react';
import { obtenerFacultades, obtenerEscuelas, type CatalogoItem } from '../IntegraUPT/services/catalogosService';

interface Espacio {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'Laboratorio' | 'Salon' | 'Aula';
  facultad: string;
  escuela: string;
  ubicacion: string;
  capacidad: number;
  equipamiento: string;
  estado: number;
}

interface EspacioFormState {
  codigo: string;
  nombre: string;
  tipo: 'Laboratorio' | 'Salon' | 'Aula';
  facultadId: string;
  escuelaId: string;
  ubicacion: string;
  capacidad: string;
  equipamiento: string;
  estado: string;
}

interface GestionEspaciosProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

export const GestionEspacios: React.FC<GestionEspaciosProps> = ({ onAuditLog }) => {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEspacio, setEditingEspacio] = useState<Espacio | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  
  // Estados para filtros - AGREGAR ESTOS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [filterFacultad, setFilterFacultad] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [facultades, setFacultades] = useState<CatalogoItem[]>([]);
  const [escuelasDisponibles, setEscuelasDisponibles] = useState<CatalogoItem[]>([]);
  
  const [formData, setFormData] = useState<EspacioFormState>({
    codigo: '',
    nombre: '',
    tipo: 'Laboratorio',
    facultadId: '',
    escuelaId: '',
    ubicacion: '',
    capacidad: '',
    equipamiento: '',
    estado: '1'
  });

  const limpiarErrorCampo = (campo: string) => {
    setFormErrors((prev) => {
      if (!prev[campo]) {
        return prev;
      }
      const { [campo]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const actualizarCampo = <K extends keyof EspacioFormState>(campo: K, valor: EspacioFormState[K]) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    limpiarErrorCampo(campo as string);
  };

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    const cargarFacultades = async () => {
      try {
        const data = await obtenerFacultades();
        setFacultades(data);
        if (data.length > 0) {
          setFormData((prev) => {
            if (prev.facultadId) {
              return prev;
            }
            return { ...prev, facultadId: String(data[0].id) };
          });
        }
      } catch (error) {
        console.error('Error cargando facultades:', error);
        setFeedback({
          tipo: 'error',
          texto: 'No se pudieron cargar las facultades. Verifica la conexión con el servidor.'
        });
      }
    };

    cargarFacultades();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let activo = true;
    const cargarEscuelas = async () => {
      if (!formData.facultadId) {
        if (activo) {
          setEscuelasDisponibles([]);
          setFormData((prev) => (prev.escuelaId ? { ...prev, escuelaId: '' } : prev));
        }
        return;
      }

      const facultadIdNum = Number(formData.facultadId);
      if (Number.isNaN(facultadIdNum)) {
        if (activo) {
          setEscuelasDisponibles([]);
        }
        return;
      }

      try {
        const data = await obtenerEscuelas(facultadIdNum);
        if (!activo) return;
        setEscuelasDisponibles(data);

        setFormData((prev) => {
          const existe = data.some((escuela) => String(escuela.id) === prev.escuelaId);
          if (existe) {
            return prev;
          }
          const nuevoId = data.length > 0 ? String(data[0].id) : '';
          if (nuevoId !== prev.escuelaId) {
            if (nuevoId) {
              limpiarErrorCampo('escuelaId');
            }
            return { ...prev, escuelaId: nuevoId };
          }
          return prev;
        });
      } catch (error) {
        console.error('Error cargando escuelas:', error);
        if (activo) {
          setEscuelasDisponibles([]);
          setFeedback({
            tipo: 'error',
            texto: 'No se pudieron cargar las escuelas para la facultad seleccionada.'
          });
        }
      }

    };

    cargarEscuelas();

    return () => {
      activo = false;
    };
  }, [formData.facultadId]);

  const validarFormulario = (): Record<string, string> => {
    const errores: Record<string, string> = {};
    const codigo = formData.codigo.trim();
    const nombre = formData.nombre.trim();
    const ubicacion = formData.ubicacion.trim();
    const capacidadNumero = Number(formData.capacidad);
    const equipamiento = formData.equipamiento.trim();

    if (!codigo) {
      errores.codigo = 'El código es obligatorio.';
    } else if (codigo.length > 20) {
      errores.codigo = 'El código no puede exceder los 20 caracteres.';
    } else if (!/^[A-Za-z0-9-]+$/.test(codigo)) {
      errores.codigo = 'El código solo puede contener letras, números y guiones.';
    }

    if (!nombre) {
      errores.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 50) {
      errores.nombre = 'El nombre no puede exceder los 20 caracteres.';
    } else if (nombre.length < 3) {
      errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.tipo) {
      errores.tipo = 'Selecciona un tipo de espacio.';
    }

    if (!formData.facultadId) {
      errores.facultadId = 'Selecciona una facultad.';
    }

    if (!formData.escuelaId) {
      errores.escuelaId = 'Selecciona una escuela.';
    }

    if (!ubicacion) {
      errores.ubicacion = 'La ubicación es obligatoria.';
    } else if (ubicacion.length < 3) {
      errores.ubicacion = 'La ubicación debe tener al menos 3 caracteres.';
    } else if (ubicacion.length > 120) {
      errores.ubicacion = 'La ubicación no debe superar los 120 caracteres.';
    }

    if (!formData.capacidad.trim()) {
      errores.capacidad = 'La capacidad es obligatoria.';
    } else if (!Number.isFinite(capacidadNumero) || Number.isNaN(capacidadNumero)) {
      errores.capacidad = 'Ingresa un número válido.';
    } else if (!Number.isInteger(capacidadNumero) || capacidadNumero <= 0) {
      errores.capacidad = 'La capacidad debe ser un entero mayor a 0.';
    } else if (capacidadNumero > 99) {
      errores.capacidad = 'La capacidad no puede superar 99 personas.';
    }

    if (equipamiento.length > 250) {
      errores.equipamiento = 'El equipamiento no debe superar 250 caracteres.';
    }

    if (!['0', '1'].includes(formData.estado)) {
      errores.estado = 'Selecciona un estado válido.';
    }

    return errores;
  };

  // Cargar espacios
  const loadEspacios = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/espacios');
      if (!response.ok) throw new Error('Error al cargar espacios');
      
      const data = await response.json();
      console.log('📦 Datos de la API:', data);
      
      const espaciosMapeados = data.map((espacio: any) => ({
        id: espacio.id.toString(),
        codigo: espacio.codigo,
        nombre: espacio.nombre,
        tipo: espacio.tipo,
        facultad: espacio.facultadNombre || espacio.facultad || 'FAING',
        escuela: espacio.escuelaNombre || espacio.escuela || 'Ing. de Sistemas',
        ubicacion: espacio.ubicacion,
        capacidad: espacio.capacidad,
        equipamiento: espacio.equipamiento || '',
        estado: espacio.estado
      }));
      
      setEspacios(espaciosMapeados);
    } catch (error) {
      console.error('❌ Error:', error);
      onAuditLog('admin', 'Cargar Espacios', 'Espacios', 'failed', 'Error al cargar espacios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEspacios();
  }, []);

  // Función para filtrar espacios - AGREGAR ESTA FUNCIÓN
  const filteredEspacios = espacios.filter(espacio => {
    const matchSearch = espacio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       espacio.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       espacio.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = filterTipo === 'all' || espacio.tipo.toLowerCase() === filterTipo.toLowerCase();
    
    const facultadFiltro = facultades.find((f) => String(f.id) === filterFacultad);
    const matchFacultad =
      filterFacultad === 'all' ||
      (facultadFiltro ? espacio.facultad === facultadFiltro.nombre : true);
    
    const matchEstado = filterEstado === 'all' || 
                       (filterEstado === 'disponible' && espacio.estado === 1) ||
                       (filterEstado === 'mantenimiento' && espacio.estado === 0);
    
    return matchSearch && matchTipo && matchFacultad && matchEstado;
  });

  const mapTipoToBackend = (tipo: string): 'Laboratorio' | 'Salon' => {
    console.log('🔄 Mapeando tipo:', tipo);
    
    // Convertir "Aula" a "Salon" para el backend
    if (tipo === 'Aula') {
      return 'Salon';
    }
    
    // Asegurar que solo se envíen los valores que el backend acepta
    if (tipo === 'Laboratorio' || tipo === 'Salon') {
      return tipo as 'Laboratorio' | 'Salon';
    }
    
    // Valor por defecto
    console.warn('⚠️ Tipo no reconocido, usando valor por defecto:', tipo);
    return 'Laboratorio';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) {
      return;
    }

    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setFormErrors(errores);
      setFeedback({ tipo: 'error', texto: 'Corrige los campos marcados antes de guardar.' });
      return;
    }

    try {
      setSaving(true);
      setFormErrors({});

      const facultadId = Number(formData.facultadId);
      const escuelaId = Number(formData.escuelaId);

      // Preparar datos para el backend
      if (!Number.isInteger(facultadId) || !Number.isInteger(escuelaId)) {
        throw new Error('Selecciona una facultad y escuela válidas.');
      }

      const espacioData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        ubicacion: formData.ubicacion.trim(),
        tipo: mapTipoToBackend(formData.tipo), // ← USA LA FUNCIÓN DE MAPEO
        capacidad: Number(formData.capacidad),
        equipamiento: formData.equipamiento.trim(),
        facultadId,
        escuelaId,
        estado: Number(formData.estado)
      };

      console.log('📤 Datos procesados para enviar:', espacioData);

      let url = 'http://localhost:8080/api/espacios';
      let method = 'POST';

      if (editingEspacio) {
        url = `http://localhost:8080/api/espacios/${editingEspacio.id}`;
        method = 'PUT';
        console.log(`🔄 Modo EDICIÓN - URL: ${url}, ID: ${editingEspacio.id}`);
      }

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(espacioData)
      });

      console.log('📥 Respuesta HTTP:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `Error ${response.status}`);
        } catch {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('✅ Respuesta del servidor:', result);
      
      if (result.success) {
        const action = editingEspacio ? 'Actualizar Espacio' : 'Crear Espacio';
        const motivo = `${editingEspacio ? 'Actualización' : 'Creación'} de ${formData.nombre}`;
        
        console.log(`✅ ${action} exitoso:`, motivo);
        
        onAuditLog('admin', action, 'Espacios', 'success', motivo);
        await loadEspacios();
        resetForm();
        setFeedback({ tipo: 'success', texto: `${action} exitoso para ${espacioData.nombre}` });
      } else {
        throw new Error(result.message || 'Error desconocido del servidor');
      }
    } catch (error) {
      console.error('❌ Error al guardar espacio:', error);
      const action = editingEspacio ? 'Actualizar Espacio' : 'Crear Espacio';
      onAuditLog('admin', action, 'Espacios', 'failed', 
        `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setFeedback({
        tipo: 'error',
        texto: `Error al ${editingEspacio ? 'actualizar' : 'crear'} espacio: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este espacio?')) return;

    try {
      console.log(`🗑️ Eliminando espacio ID: ${id}`);

      const response = await fetch(`http://localhost:8080/api/espacios/${id}`, {
        method: 'DELETE',
      });

      console.log('📥 Respuesta de eliminación:', response.status);

      if (response.ok) {
        // Si la respuesta es exitosa pero no tiene contenido
        onAuditLog('admin', 'Eliminar Espacio', 'Espacios', 'success', 'Espacio eliminado');
        await loadEspacios();
        setFeedback({ tipo: 'success', texto: 'Espacio eliminado exitosamente.' });
        return;
      }

      // Si hay error, leer el mensaje
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al eliminar espacio');
      }

    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      
      let errorMessage = 'Error al eliminar espacio: ';
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage += 'No se puede eliminar el espacio porque tiene reservas asociadas o está en uso.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Error interno del servidor';
      }
      
      onAuditLog('admin', 'Eliminar Espacio', 'Espacios', 'failed', errorMessage);
      setFeedback({ tipo: 'error', texto: errorMessage });
    }
  };

  const handleEdit = async (espacio: Espacio) => {
    console.log('✏️ Editando espacio:', espacio);

    const tipoParaFormulario = espacio.tipo === 'Aula' ? 'Salon' : espacio.tipo;

    setEditingEspacio(espacio);
    setFormErrors({});

    let catalogoFacultades = facultades;
    if (catalogoFacultades.length === 0) {
      try {
        catalogoFacultades = await obtenerFacultades();
        setFacultades(catalogoFacultades);
      } catch (error) {
        console.error('Error recargando facultades:', error);
      }
    }

    const facultadIdSeleccionada = catalogoFacultades.find(
      (facultad) => facultad.nombre.toLowerCase() === (espacio.facultad || '').toLowerCase()
    )?.id;

    let escuelas = escuelasDisponibles;
    if (facultadIdSeleccionada) {
      try {
        escuelas = await obtenerEscuelas(facultadIdSeleccionada);
        setEscuelasDisponibles(escuelas);
      } catch (error) {
        console.error('Error cargando escuelas para edición:', error);
        escuelas = [];
      }
    } else {
      escuelas = [];
      setEscuelasDisponibles([]);
    }

    const escuelaIdSeleccionada = escuelas.find(
      (escuela) => escuela.nombre.toLowerCase() === (espacio.escuela || '').toLowerCase()
    )?.id;

    setFormData({
      codigo: espacio.codigo || '',
      nombre: espacio.nombre || '',
      tipo: tipoParaFormulario as 'Laboratorio' | 'Salon',
      facultadId: facultadIdSeleccionada ? String(facultadIdSeleccionada) : '',
      escuelaId: escuelaIdSeleccionada ? String(escuelaIdSeleccionada) : '',
      ubicacion: espacio.ubicacion || '',
      capacidad: espacio.capacidad?.toString() || '',
      equipamiento: espacio.equipamiento || '',
      estado: espacio.estado?.toString() || '1'
    });
    setShowModal(true);
  };

  const handleNew = () => {
    console.log('🆕 Creando nuevo espacio...');
    setEditingEspacio(null);
    setFormErrors({});
    const facultadPorDefecto = facultades.length > 0 ? String(facultades[0].id) : '';
    setEscuelasDisponibles([]);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'Laboratorio',
      facultadId: facultadPorDefecto,
      escuelaId: '',
      ubicacion: '',
      capacidad: '',
      equipamiento: '',
      estado: '1'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    console.log('🗑️ Reseteando formulario...');
    const facultadPorDefecto = facultades.length > 0 ? String(facultades[0].id) : '';
    setEscuelasDisponibles([]);
    setFormData({
      codigo: '',
      nombre: '',
      tipo: 'Laboratorio',
      facultadId: facultadPorDefecto,
      escuelaId: '',
      ubicacion: '',
      capacidad: '',
      equipamiento: '',
      estado: '1'
    });
    setEditingEspacio(null);
    setShowModal(false);
    setSaving(false);
    setFormErrors({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Formulario enviado - Ejecutando handleSave...');
    handleSave(e);
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Gestión de Espacios</h2>
          <p className="admin-content-subtitle">Administra aulas y laboratorios del sistema</p>
        </div>
        <button 
          onClick={handleNew}
          className="admin-primary-btn admin-primary-blue"
        >
          <Plus className="admin-btn-icon" />
          Nuevo Espacio
        </button>
      </div>

      {feedback && (
        <div className={`admin-alert ${feedback.tipo === 'success' ? 'admin-alert-success' : 'admin-alert-error'}`}>
          {feedback.tipo === 'success' ? (
            <Check className="admin-alert-icon" />
          ) : (
            <AlertCircle className="admin-alert-icon" />
          )}
          <div>
            <p className="admin-alert-details">{feedback.texto}</p>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda - NUEVO DISEÑO MEJORADO */}
      <div className="admin-filters-section">
        <div className="admin-filters-header">
          <Filter className="admin-search-icon" />
          <span className="admin-filters-title">Filtros y Búsqueda</span>
        </div>
        
        <div className="admin-filters-grid">
          {/* Búsqueda */}
          <div className="admin-filter-group admin-filter-search">
            <label className="admin-filter-label">Buscar espacios</label>
            <div className="admin-search-wrapper admin-search-expanded">
              <Search className="admin-search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, código o ubicación..."
                className="admin-search-input"
              />
            </div>
          </div>

          {/* Filtro por Tipo */}
          <div className="admin-filter-group">
            <label className="admin-filter-label">Filtrar por tipo</label>
            <select 
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Todos los tipos</option>
              <option value="laboratorio">Laboratorios</option>
              <option value="salon">Aulas</option>
            </select>
          </div>

          {/* Filtro por Facultad */}
          <div className="admin-filter-group">
            <label className="admin-filter-label">Filtrar por facultad</label>
            <select 
              value={filterFacultad}
              onChange={(e) => setFilterFacultad(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Todas las facultades</option>
              {facultades.map((facultad) => (
                <option key={facultad.id} value={String(facultad.id)}>
                  {facultad.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="admin-filter-group">
            <label className="admin-filter-label">Filtrar por estado</label>
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="mantenimiento">En Mantenimiento</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="admin-results-count">
          <span className="admin-results-text">
            Mostrando {filteredEspacios.length} de {espacios.length} espacios
          </span>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Cargando espacios...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">Código</th>
                <th className="admin-table-th">Nombre</th>
                <th className="admin-table-th">Tipo</th>
                <th className="admin-table-th">Facultad</th>
                <th className="admin-table-th">Escuela</th>
                <th className="admin-table-th">Ubicación</th>
                <th className="admin-table-th">Capacidad</th>
                <th className="admin-table-th">Estado</th>
                <th className="admin-table-th">Acciones</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {filteredEspacios.map((espacio) => (
                <tr key={espacio.id} className="admin-table-row">
                  <td className="admin-table-td">{espacio.codigo || 'N/A'}</td>
                  <td className="admin-table-td">{espacio.nombre}</td>
                  <td className="admin-table-td">
                    <span className={`admin-badge ${espacio.tipo === 'Laboratorio' ? 'admin-badge-blue' : 'admin-badge-purple'}`}>
                      {espacio.tipo === 'Salon' ? 'Aula' : espacio.tipo}
                    </span>
                  </td>
                  <td className="admin-table-td">{espacio.facultad}</td>
                  <td className="admin-table-td">{espacio.escuela}</td>
                  <td className="admin-table-td">{espacio.ubicacion || 'No especificada'}</td>
                  <td className="admin-table-td">{espacio.capacidad}</td>
                  <td className="admin-table-td">
                    <span className={`admin-badge ${espacio.estado === 1 ? 'admin-badge-green' : 'admin-badge-yellow'}`}>
                      {espacio.estado === 1 ? 'Disponible' : 'En Mantenimiento'}
                    </span>
                  </td>
                  <td className="admin-table-td">
                    <div className="admin-actions">
                      <button 
                        onClick={() => void handleEdit(espacio)}
                        className="admin-action-btn admin-action-edit"
                        title="Editar"
                      >
                        <Edit className="admin-action-icon" />
                      </button>
                      <button 
                        onClick={() => handleDelete(espacio.id)}
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

          {/* Mensaje cuando no hay resultados */}
          {filteredEspacios.length === 0 && (
            <div className="admin-empty-state">
              <Search className="admin-empty-icon" />
              <h3 className="admin-empty-title">No se encontraron espacios</h3>
              <p className="admin-empty-description">
                No hay espacios que coincidan con los filtros aplicados. 
                Intenta ajustar los criterios de búsqueda.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal - Mantener igual que antes */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingEspacio ? `Editando: ${editingEspacio.nombre}` : 'Nuevo Espacio'}
              </h3>
              <button onClick={resetForm} className="admin-modal-close">
                <X className="admin-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              {/* Información Básica */}
              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Información Básica</h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Código *</label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => actualizarCampo('codigo', e.target.value)}
                      placeholder="Ej: ESP-001"
                      className={`admin-form-input ${formErrors.codigo ? 'admin-field-error' : ''}`}
                      maxLength={20}
                      required
                    />
                    {formErrors.codigo && <span className="admin-form-error">{formErrors.codigo}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => actualizarCampo('nombre', e.target.value)}
                      placeholder="Ej: LAB-04 o Aula C-201"
                      className={`admin-form-input ${formErrors.nombre ? 'admin-field-error' : ''}`}
                      maxLength={50}
                      required
                    />
                    {formErrors.nombre && <span className="admin-form-error">{formErrors.nombre}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Tipo *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => actualizarCampo('tipo', e.target.value as EspacioFormState['tipo'])}
                      className={`admin-form-select ${formErrors.tipo ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Salon">Salón</option>
                    </select>
                    {formErrors.tipo && <span className="admin-form-error">{formErrors.tipo}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Facultad *</label>
                    <select
                      value={formData.facultadId}
                      onChange={(e) => actualizarCampo('facultadId', e.target.value)}
                      className={`admin-form-select ${formErrors.facultadId ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="">Seleccionar facultad</option>
                      {facultades.map((facultad) => (
                        <option key={facultad.id} value={String(facultad.id)}>
                          {facultad.nombre}
                        </option>
                      ))}
                    </select>
                    {formErrors.facultadId && <span className="admin-form-error">{formErrors.facultadId}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Escuela *</label>
                    <select
                      value={formData.escuelaId}
                      onChange={(e) => actualizarCampo('escuelaId', e.target.value)}
                      className={`admin-form-select ${formErrors.escuelaId ? 'admin-field-error' : ''}`}
                      required
                      disabled={escuelasDisponibles.length === 0}
                    >
                      <option value="">Seleccionar escuela</option>
                      {escuelasDisponibles.map((escuela) => (
                        <option key={escuela.id} value={String(escuela.id)}>
                          {escuela.nombre}
                        </option>
                      ))}
                    </select>
                    {formErrors.escuelaId && <span className="admin-form-error">{formErrors.escuelaId}</span>}
                  </div>
                </div>
              </div>

              {/* Ubicación y Capacidad */}
              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Ubicación y Capacidad</h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Ubicación *</label>
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => actualizarCampo('ubicacion', e.target.value)}
                      placeholder="Ej: Edificio A - Piso 2"
                      className={`admin-form-input ${formErrors.ubicacion ? 'admin-field-error' : ''}`}
                      maxLength={120}
                      required
                    />
                    {formErrors.ubicacion && <span className="admin-form-error">{formErrors.ubicacion}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Capacidad *</label>
                    <input
                      type="number"
                      value={formData.capacidad}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                        actualizarCampo('capacidad', value);
                      }}
                      placeholder="Ej: 30"
                      className={`admin-form-input ${formErrors.capacidad ? 'admin-field-error' : ''}`}
                      required
                      min="1"
                      max="99"
                      inputMode="numeric"
                    />
                    {formErrors.capacidad && <span className="admin-form-error">{formErrors.capacidad}</span>}
                  </div>
                </div>
              </div>

              {/* Equipamiento y Estado */}
              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Equipamiento y Estado</h4>
                <div className="admin-form-stack">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Equipamiento</label>
                    <textarea
                      value={formData.equipamiento}
                      onChange={(e) => actualizarCampo('equipamiento', e.target.value)}
                      placeholder="Ej: Proyector, Pizarra Digital, Audio, Computadoras"
                      rows={3}
                      className={`admin-form-textarea ${formErrors.equipamiento ? 'admin-field-error' : ''}`}
                      maxLength={250}
                    />
                    {formErrors.equipamiento && <span className="admin-form-error">{formErrors.equipamiento}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estado *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => actualizarCampo('estado', e.target.value)}
                      className={`admin-form-select ${formErrors.estado ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="1">Disponible</option>
                      <option value="0">En Mantenimiento</option>
                    </select>
                    <p className="admin-form-help">Estado actual: {formData.estado === '1' ? 'Disponible' : 'En Mantenimiento'}</p>
                    {formErrors.estado && <span className="admin-form-error">{formErrors.estado}</span>}
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
                  {saving ? 'Guardando...' : (editingEspacio ? 'Guardar Cambios' : 'Crear Espacio')}
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
