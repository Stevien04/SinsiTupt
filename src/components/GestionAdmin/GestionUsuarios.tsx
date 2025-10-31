// components/GestionUsuarios.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit, Trash2, Search, X, Check, Filter } from 'lucide-react';
import { obtenerFacultades, obtenerEscuelas, type CatalogoItem } from '../IntegraUPT/services/catalogosService';

interface Usuario {
  id: string;
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipoDocumento: string;
  numeroDocumento: string;
  celular: string;
  facultad: string;
  escuela: string;
  facultadId?: number;
  escuelaId?: number;
  rol: string;
  genero: string;
  estado: number;
  fechaCreacion?: string;
}

interface UsuarioFormState {
  codigo: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipoDocumento: string;
  numeroDocumento: string;
  celular: string;
  facultadId: string;
  escuelaId: string;
  rol: string;
  genero: string;
  password: string;
  estado: number;
}

const initialUsuarioFormState: UsuarioFormState = {
  codigo: '',
  nombres: '',
  apellidos: '',
  email: '',
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  celular: '',
  facultadId: '',
  escuelaId: '',
  rol: 'ESTUDIANTE',
  genero: 'MASCULINO',
  password: '',
  estado: 1
};

interface GestionUsuariosProps {
  onAuditLog: (user: string, action: string, module: string, status: 'success' | 'failed', motivo: string) => void;
}

export const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ onAuditLog }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('all');
  const [filterEstado, setFilterEstado] = useState('all');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [facultades, setFacultades] = useState<CatalogoItem[]>([]);
  const [escuelasDisponibles, setEscuelasDisponibles] = useState<CatalogoItem[]>([]);
  
  const [formData, setFormData] = useState<UsuarioFormState>({ ...initialUsuarioFormState });

  const limpiarErrorCampo = (campo: string) => {
    setFormErrors((prev) => {
      if (!prev[campo]) {
        return prev;
      }
      const { [campo]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const actualizarCampo = <K extends keyof UsuarioFormState>(campo: K, valor: UsuarioFormState[K]) => {
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
        console.error('Error cargando facultades (usuarios):', error);
        setFeedback({
          tipo: 'error',
          texto: 'No se pudieron cargar las facultades. Intenta nuevamente.'
        });
      }
    };

    cargarFacultades();
  }, []);

  useEffect(() => {
    if (formData.tipoDocumento === 'DNI') {
      const soloNumeros = formData.numeroDocumento.replace(/\D/g, '').slice(0, 8);
      if (soloNumeros !== formData.numeroDocumento) {
        actualizarCampo('numeroDocumento', soloNumeros);
      }
    } else if (formData.tipoDocumento === 'CARNET_EXTRANJERIA') {
      const soloNumeros = formData.numeroDocumento.replace(/\D/g, '').slice(0, 12);
      if (soloNumeros !== formData.numeroDocumento) {
        actualizarCampo('numeroDocumento', soloNumeros);
      }
    } else if (formData.tipoDocumento === 'PASAPORTE') {
      if (formData.numeroDocumento.length > 0) {
        const primeraLetra = formData.numeroDocumento.charAt(0).toUpperCase();
        const restoNumeros = formData.numeroDocumento.slice(1).replace(/\D/g, '').slice(0, 8);
        const nuevoValor = primeraLetra + restoNumeros;
        if (nuevoValor !== formData.numeroDocumento) {
          actualizarCampo('numeroDocumento', nuevoValor);
        }
      }
    }
  }, [formData.tipoDocumento]);

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
        console.error('Error cargando escuelas (usuarios):', error);
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

  const validarFormulario = (datos: UsuarioFormState, esEdicion: boolean): Record<string, string> => {
    const errores: Record<string, string> = {};
    const codigo = datos.codigo.trim();
    const nombres = datos.nombres.trim();
    const apellidos = datos.apellidos.trim();
    const email = datos.email.trim();
    const numeroDocumento = datos.numeroDocumento.trim();
    const celular = datos.celular.trim();
    const password = datos.password.trim();

    if (!nombres) {
      errores.nombres = 'Los nombres son obligatorios.';
    } else if (nombres.length > 30) {
      errores.nombres = 'Los nombres no pueden exceder los 30 caracteres.';
    } else if (/[0-9]/.test(nombres)) {
      errores.nombres = 'Los nombres no pueden contener números.';
    } else if (nombres.length < 2) {
      errores.nombres = 'Ingresa al menos 2 caracteres.';
    }

    if (!apellidos) {
      errores.apellidos = 'Los apellidos son obligatorios.';
    } else if (apellidos.length > 30) {
      errores.apellidos = 'Los apellidos no pueden exceder los 30 caracteres.';
    } else if (/[0-9]/.test(apellidos)) {
      errores.apellidos = 'Los apellidos no pueden contener números.';
    } else if (apellidos.length < 2) {
      errores.apellidos = 'Ingresa apellidos válidos.';
    }

    if (!email) {
      errores.email = 'El correo es obligatorio.';
    } else if (!/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(email)) {
      errores.email = 'Ingresa un correo electrónico válido.';
    }

    if (!datos.tipoDocumento) {
      errores.tipoDocumento = 'Selecciona un tipo de documento.';
    }

    if (!numeroDocumento) {
      errores.numeroDocumento = 'El número de documento es obligatorio.';
    } else {
      switch (datos.tipoDocumento) {
        case 'DNI':
          if (!/^\d{8}$/.test(numeroDocumento)) {
            errores.numeroDocumento = 'El DNI debe tener exactamente 8 dígitos numéricos.';
          }
          break;
        case 'CARNET_EXTRANJERIA':
          if (!/^\d{12}$/.test(numeroDocumento)) {
            errores.numeroDocumento = 'El Carnet de Extranjería debe tener exactamente 12 dígitos numéricos.';
          }
          break;
        case 'PASAPORTE':
          if (!/^[A-Za-z]\d{8}$/.test(numeroDocumento)) {
            errores.numeroDocumento = 'El pasaporte debe comenzar con una letra seguida de 8 números. Ej: A12345678';
          }
          break;
        default:
          if (!/^\d{8,12}$/.test(numeroDocumento)) {
            errores.numeroDocumento = 'Ingresa un número de documento válido.';
          }
      }
    }

    if (!celular) {
      errores.celular = 'El celular es obligatorio.';
    } else if (!/^\d{9}$/.test(celular)) {
      errores.celular = 'El celular debe tener exactamente 9 dígitos numéricos.';
    }

    if (!datos.facultadId) {
      errores.facultadId = 'Selecciona una facultad.';
    }

    if (!datos.escuelaId) {
      errores.escuelaId = 'Selecciona una escuela.';
    }

    if (!datos.rol) {
      errores.rol = 'Selecciona un rol.';
    }

    if (!datos.genero) {
      errores.genero = 'Selecciona un género.';
    }

    if (!codigo) {
      errores.codigo = 'El código es obligatorio.';
    } else if (!/^\d{10}$/.test(codigo)) {
      errores.codigo = 'El código debe tener exactamente 10 dígitos numéricos.';
    }

    if (!esEdicion) {
      if (!password) {
        errores.password = 'La contraseña inicial es obligatoria.';
      } else if (password.length < 6) {
        errores.password = 'La contraseña debe tener al menos 6 caracteres.';
      }
    }

    if (![0, 1].includes(datos.estado)) {
      errores.estado = 'Selecciona un estado válido.';
    }

    return errores;
  };

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/usuarios');
      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const data = await response.json();
      const usuariosMapeados = Array.isArray(data) ? data.map((usuario: any) => ({
        id: String(usuario.id),
        codigo: usuario.codigo || '',
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        email: usuario.email || '',
        tipoDocumento: usuario.tipoDocumento || 'DNI',
        numeroDocumento: usuario.numeroDocumento || '',
        celular: usuario.celular || '',
        facultad: usuario.facultadNombre || 'FAING',
        escuela: usuario.escuelaNombre || 'Ing. de Sistemas',
        facultadId: typeof usuario.facultadId === 'number' ? usuario.facultadId : undefined,
        escuelaId: typeof usuario.escuelaId === 'number' ? usuario.escuelaId : undefined,
        rol: (usuario.rol || 'ESTUDIANTE').toUpperCase(),
        genero: (usuario.genero || 'OTRO').toUpperCase(),
        estado: typeof usuario.estado === 'number' ? usuario.estado : 0,
        fechaCreacion: usuario.fechaCreacion || ''
      })) : [];
      
      setUsuarios(usuariosMapeados);
    } catch (error) {
      console.error('Error:', error);
      onAuditLog('admin', 'Cargar Usuarios', 'Usuarios', 'failed', 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleCreate = async () => {
    const errores = validarFormulario(formData, Boolean(editingUsuario));
    if (Object.keys(errores).length > 0) {
      setFormErrors(errores);
      setFeedback({ tipo: 'error', texto: 'Corrige los campos marcados antes de guardar.' });
      return;
    }

    const passwordValue = formData.password.trim();
    const facultadId = Number(formData.facultadId);
    const escuelaId = Number(formData.escuelaId);

    if (!Number.isInteger(facultadId) || !Number.isInteger(escuelaId)) {
      setFeedback({
        tipo: 'error',
        texto: 'Selecciona una facultad y escuela válidas.'
      });
      return;
    }

    const usuarioData: Record<string, unknown> = {
      codigo: formData.codigo.trim(),
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      email: formData.email.trim(),
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento.trim(),
      celular: formData.celular.trim(),
      facultadId,
      escuelaId,
      rol: formData.rol,
      genero: formData.genero,
      estado: formData.estado
    };

    if (!editingUsuario || passwordValue) {
      usuarioData.password = passwordValue;
    }

    try {
      setFormErrors({});
      const url = editingUsuario 
        ? `http://localhost:8080/api/usuarios/${editingUsuario.id}`
        : 'http://localhost:8080/api/usuarios';
      
      const method = editingUsuario ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'Error al guardar usuario');
        } catch {
          throw new Error(errorText || 'Error al guardar usuario');
        }
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Error al guardar usuario');
      }

      const accion = editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario';
      const nombreCompleto = `${formData.nombres.trim()} ${formData.apellidos.trim()}`.trim();

      onAuditLog('admin', accion, 'Usuarios', 'success', `${accion} de ${nombreCompleto}`);
      await loadUsuarios();
      resetForm();
      setFeedback({
        tipo: 'success',
        texto: `${accion} exitosa para ${nombreCompleto}.`
      });
    } catch (error) {
      console.error('Error:', error);
      const accion = editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario';
      const mensajeError = error instanceof Error ? error.message : 'Error al guardar usuario';
      onAuditLog('admin', accion, 'Usuarios', 'failed', mensajeError);
      setFeedback({
        tipo: 'error',
        texto: mensajeError
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'Error al eliminar usuario');
        } catch {
          throw new Error(errorText || 'Error al eliminar usuario');
        }
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Error al eliminar usuario');
      }

      onAuditLog('admin', 'Eliminar Usuario', 'Usuarios', 'success', 'Usuario eliminado');
      await loadUsuarios();
      setFeedback({ tipo: 'success', texto: 'Usuario eliminado correctamente.' });
    } catch (error) {
      console.error('Error:', error);
      const mensajeError = error instanceof Error ? error.message : 'Error al eliminar usuario';
      onAuditLog('admin', 'Eliminar Usuario', 'Usuarios', 'failed', mensajeError);
      setFeedback({ tipo: 'error', texto: mensajeError });
    }
  };

  const handleEdit = async (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormErrors({});

    let catalogoFacultades = facultades;
    if (catalogoFacultades.length === 0) {
      try {
        catalogoFacultades = await obtenerFacultades();
        setFacultades(catalogoFacultades);
      } catch (error) {
        console.error('Error recargando facultades (usuarios):', error);
      }
    }

    const facultadIdSeleccionada =
      typeof usuario.facultadId === 'number'
        ? usuario.facultadId
        : catalogoFacultades.find(
            (facultad) => facultad.nombre.toLowerCase() === (usuario.facultad || '').toLowerCase()
          )?.id;

    let escuelas = escuelasDisponibles;
    if (facultadIdSeleccionada) {
      try {
        escuelas = await obtenerEscuelas(facultadIdSeleccionada);
        setEscuelasDisponibles(escuelas);
      } catch (error) {
        console.error('Error cargando escuelas para edición de usuario:', error);
        escuelas = [];
      }
    } else {
      escuelas = [];
      setEscuelasDisponibles([]);
    }

    const escuelaIdSeleccionada =
      typeof usuario.escuelaId === 'number'
        ? usuario.escuelaId
        : escuelas.find(
            (escuela) => escuela.nombre.toLowerCase() === (usuario.escuela || '').toLowerCase()
          )?.id;

    setFormData({
      codigo: usuario.codigo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      tipoDocumento: usuario.tipoDocumento,
      numeroDocumento: usuario.numeroDocumento,
      celular: usuario.celular,
      facultadId: facultadIdSeleccionada ? String(facultadIdSeleccionada) : '',
      escuelaId: escuelaIdSeleccionada ? String(escuelaIdSeleccionada) : '',
      rol: usuario.rol,
      genero: usuario.genero,
      password: '',
      estado: usuario.estado
    });
    setShowModal(true);
  };

  const resetForm = () => {
    const facultadPorDefecto = facultades.length > 0 ? String(facultades[0].id) : '';
    setEscuelasDisponibles([]);
    setFormData({ ...initialUsuarioFormState, facultadId: facultadPorDefecto });
    setEditingUsuario(null);
    setShowModal(false);
    setFormErrors({});
  };

  const handleNewUser = () => {
    setEditingUsuario(null);
    const facultadPorDefecto = facultades.length > 0 ? String(facultades[0].id) : '';
    setFormData({ ...initialUsuarioFormState, facultadId: facultadPorDefecto });
    setEscuelasDisponibles([]);
    setFormErrors({});
    setShowModal(true);
  };

  const filteredUsers = usuarios.filter(usuario => {
    const criterio = searchTerm.toLowerCase();
    const matchSearch =
      (usuario.nombres || '').toLowerCase().includes(criterio) ||
      (usuario.apellidos || '').toLowerCase().includes(criterio) ||
      (usuario.email || '').toLowerCase().includes(criterio) ||
      (usuario.codigo || '').toLowerCase().includes(criterio);
    const matchRol = filterRol === 'all' || (usuario.rol || '').toUpperCase() === filterRol;
    const matchEstado = filterEstado === 'all' || usuario.estado.toString() === filterEstado;
    return matchSearch && matchRol && matchEstado;
  });

  const getRolDisplay = (rol: string) => {
    const roles: { [key: string]: string } = {
      'ESTUDIANTE': 'Estudiante',
      'DOCENTE': 'Docente',
      'ADMINISTRATIVO': 'Administrativo',
      'ADMIN': 'Administrador'
    };
    return roles[rol] || rol;
  };

  const getGeneroDisplay = (genero: string) => {
    const generos: { [key: string]: string } = {
      'MASCULINO': 'Masculino',
      'FEMENINO': 'Femenino',
      'OTRO': 'Otro'
    };
    return generos[genero] || genero;
  };

  return (
    <div>
      <div className="admin-content-header">
        <div>
          <h2 className="admin-content-title">Gestión de Usuarios</h2>
          <p className="admin-content-subtitle">Administra estudiantes, docentes y personal</p>
        </div>
        <button 
          onClick={handleNewUser}
          className="admin-primary-btn admin-primary-purple"
        >
          <Plus className="admin-btn-icon" />
          Nuevo Usuario
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

      <div className="admin-filters-section">
        <div className="admin-filters-header">
          <Filter className="admin-search-icon" />
          <span className="admin-filters-title">Filtros y Búsqueda</span>
        </div>
        
        <div className="admin-filters-grid">
        <div className="admin-filter-group admin-filter-search">
            <label className="admin-filter-label">Buscar usuarios</label>
            <div className="admin-search-wrapper admin-search-expanded">
            <Search className="admin-search-icon" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, apellido, email o código..."
                className="admin-search-input"
            />
            </div>
        </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Filtrar por rol</label>
            <select 
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Todos los roles</option>
              <option value="ESTUDIANTE">Estudiantes</option>
              <option value="DOCENTE">Docentes</option>
              <option value="ADMINISTRATIVO">Administrativos</option>
            </select>
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Filtrar por estado</label>
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="admin-results-count">
          <span className="admin-results-text">
            {filteredUsers.length} de {usuarios.length} usuarios encontrados
          </span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">Código</th>
                <th className="admin-table-th">Nombres</th>
                <th className="admin-table-th">Apellidos</th>
                <th className="admin-table-th">Email</th>
                <th className="admin-table-th">Rol</th>
                <th className="admin-table-th">Facultad</th>
                <th className="admin-table-th">Estado</th>
                <th className="admin-table-th">Acciones</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {filteredUsers.map((usuario) => (
                <tr key={usuario.id} className="admin-table-row">
                  <td className="admin-table-td">{usuario.codigo}</td>
                  <td className="admin-table-td">{usuario.nombres}</td>
                  <td className="admin-table-td">{usuario.apellidos}</td>
                  <td className="admin-table-td">{usuario.email}</td>
                  <td className="admin-table-td">
                    <span className={`admin-badge ${
                      usuario.rol === 'ESTUDIANTE' ? 'admin-badge-blue' :
                      usuario.rol === 'DOCENTE' ? 'admin-badge-green' :
                      usuario.rol === 'ADMINISTRATIVO' ? 'admin-badge-purple' :
                      'admin-badge-red'
                    }`}>
                      {getRolDisplay(usuario.rol)}
                    </span>
                  </td>
                  <td className="admin-table-td">{usuario.facultad}</td>
                  <td className="admin-table-td">
                    <span className={`admin-badge ${usuario.estado === 1 ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                      {usuario.estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="admin-table-td">
                    <div className="admin-actions">
                      <button 
                        onClick={() => void handleEdit(usuario)}
                        className="admin-action-btn admin-action-edit"
                        title="Editar"
                      >
                        <Edit className="admin-action-icon" />
                      </button>
                      <button 
                        onClick={() => handleDelete(usuario.id)}
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
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={resetForm} className="admin-modal-close">
                <X className="admin-modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="admin-modal-form">
              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Información Personal</h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nombres *</label>
                    <input
                      type="text"
                      value={formData.nombres}
                      onChange={(e) => actualizarCampo('nombres', e.target.value)}
                      placeholder="Ej: Juan Carlos"
                      className={`admin-form-input ${formErrors.nombres ? 'admin-field-error' : ''}`}
                      maxLength={30}
                      required
                    />
                    {formErrors.nombres && <span className="admin-form-error">{formErrors.nombres}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Apellidos *</label>
                    <input
                      type="text"
                      value={formData.apellidos}
                      onChange={(e) => actualizarCampo('apellidos', e.target.value)}
                      placeholder="Ej: Pérez González"
                      className={`admin-form-input ${formErrors.apellidos ? 'admin-field-error' : ''}`}
                      maxLength={30}
                      required
                    />
                    {formErrors.apellidos && <span className="admin-form-error">{formErrors.apellidos}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Género *</label>
                    <select
                      value={formData.genero}
                      onChange={(e) => actualizarCampo('genero', e.target.value)}
                      className={`admin-form-select ${formErrors.genero ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    {formErrors.genero && <span className="admin-form-error">{formErrors.genero}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Tipo de Documento *</label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => actualizarCampo('tipoDocumento', e.target.value)}
                      className={`admin-form-select ${formErrors.tipoDocumento ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="DNI">DNI</option>
                      <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                    {formErrors.tipoDocumento && <span className="admin-form-error">{formErrors.tipoDocumento}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Número de Documento *</label>
                    <input
                      type="text"
                      value={formData.numeroDocumento}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (formData.tipoDocumento === 'DNI') {
                          value = value.replace(/\D/g, '').slice(0, 8);
                        } else if (formData.tipoDocumento === 'CARNET_EXTRANJERIA') {
                          value = value.replace(/\D/g, '').slice(0, 12);
                        } else if (formData.tipoDocumento === 'PASAPORTE') {
                          if (value.length > 0) {
                            const primeraLetra = value.charAt(0).toUpperCase();
                            const restoNumeros = value.slice(1).replace(/\D/g, '').slice(0, 8);
                            value = primeraLetra + restoNumeros;
                          }
                        }
                        actualizarCampo('numeroDocumento', value);
                      }}
                      placeholder={
                        formData.tipoDocumento === 'DNI' ? 'Ej: 74589632' :
                        formData.tipoDocumento === 'CARNET_EXTRANJERIA' ? 'Ej: 123456789012' :
                        'Ej: A12345678'
                      }
                      className={`admin-form-input ${formErrors.numeroDocumento ? 'admin-field-error' : ''}`}
                      maxLength={
                        formData.tipoDocumento === 'DNI' ? 8 :
                        formData.tipoDocumento === 'CARNET_EXTRANJERIA' ? 12 :
                        9
                      }
                      required
                    />
                    {formErrors.numeroDocumento && <span className="admin-form-error">{formErrors.numeroDocumento}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Celular *</label>
                    <input
                      type="tel"
                      value={formData.celular}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        actualizarCampo('celular', value);
                      }}
                      placeholder="Ej: 987654321"
                      className={`admin-form-input ${formErrors.celular ? 'admin-field-error' : ''}`}
                      maxLength={9}
                      inputMode="numeric"
                      required
                    />
                    {formErrors.celular && <span className="admin-form-error">{formErrors.celular}</span>}
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4 className="admin-form-section-title">Información Académica</h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Código/ID *</label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        actualizarCampo('codigo', value);
                      }}
                      placeholder="Ej: 2023077284"
                      className={`admin-form-input ${formErrors.codigo ? 'admin-field-error' : ''}`}
                      maxLength={10}
                      inputMode="numeric"
                      required
                    />
                    {formErrors.codigo && <span className="admin-form-error">{formErrors.codigo}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => actualizarCampo('email', e.target.value)}
                      placeholder="Ej: carlos.ramirez@upt.edu.pe"
                      className={`admin-form-input ${formErrors.email ? 'admin-field-error' : ''}`}
                      maxLength={120}
                      required
                    />
                    {formErrors.email && <span className="admin-form-error">{formErrors.email}</span>}
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

                  <div className="admin-form-group">
                    <label className="admin-form-label">Rol *</label>
                    <select
                      value={formData.rol}
                      onChange={(e) => actualizarCampo('rol', e.target.value)}
                      className={`admin-form-select ${formErrors.rol ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="DOCENTE">Docente</option>
                      <option value="ADMINISTRATIVO">Administrativo</option>
                    </select>
                    {formErrors.rol && <span className="admin-form-error">{formErrors.rol}</span>}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Estado *</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => actualizarCampo('estado', Number(e.target.value))}
                      className={`admin-form-select ${formErrors.estado ? 'admin-field-error' : ''}`}
                      required
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                    {formErrors.estado && <span className="admin-form-error">{formErrors.estado}</span>}
                  </div>
                </div>
              </div>

              {!editingUsuario && (
                <div className="admin-form-section">
                  <h4 className="admin-form-section-title">Credenciales de Acceso</h4>
                  <div className="admin-form-stack">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Contraseña *</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => actualizarCampo('password', e.target.value)}
                        placeholder="Contraseña inicial"
                        className={`admin-form-input ${formErrors.password ? 'admin-field-error' : ''}`}
                        required={!editingUsuario}
                        minLength={6}
                      />
                      <p className="admin-form-help">La contraseña debe tener al menos 6 caracteres</p>
                      {formErrors.password && <span className="admin-form-error">{formErrors.password}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="submit"
                  className="admin-modal-btn admin-modal-primary"
                >
                  <Check className="admin-modal-btn-icon" />
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-modal-btn admin-modal-secondary"
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