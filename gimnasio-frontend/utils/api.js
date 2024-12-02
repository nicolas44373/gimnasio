import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',  // Asegúrate de que este es el puerto correcto
    timeout: 5000,  // Timeout predeterminado
    headers: {
        'Content-Type': 'application/json',
    },
});

const handleApiError = (error) => {
    if (error.response) {
        // Error respuesta (del servidor)
        console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
        console.error('Detalles:', error.response.data);
    } else if (error.request) {
        // Error en la solicitud (no respuesta del servidor)
        console.error('No se recibió respuesta del servidor:', error.request);
    } else {
        // Error al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
    }
    throw error; // Propaga el error
};

// Función genérica para GET
const fetchData = async (endpoint) => {
    try {
        const response = await api.get(endpoint);
        console.log('Respuesta GET:', response.data); // Ver la respuesta
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// Función genérica para POST
const postData = async (endpoint, data) => {
    try {
        const response = await api.post(endpoint, data);
        console.log('Respuesta POST:', response.data); // Ver la respuesta
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// Función genérica para PUT
const updateData = async (endpoint, data) => {
    try {
        const response = await api.put(endpoint, data);
        console.log('Respuesta PUT:', response.data); // Ver la respuesta
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

// Función genérica para DELETE
const deleteData = async (endpoint) => {
    try {
        const response = await api.delete(endpoint);
        console.log('Respuesta DELETE:', response.data);  // Ver la respuesta
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


export const fetchAsistencias = async () => {
  try {
    const response = await fetch(`${API_URL}/asistencia`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener asistencias');
    }
    return data.data;
  } catch (error) {
    console.error('Error en fetchAsistencias:', error);
    throw error;
  }
};




// Funciones específicas para cada entidad
export const obtenerAsistencias = () => fetchData('/asistencias');

// Registrar asistencia
export const registrarAsistencia = (dni) => postData('/asistencias', { dni });

export const buscarAsistencia = async (dni) => {
    try {
        const response = await api.post('/asistencias/buscar', { dni });
        console.log('Asistencia encontrada:', response.data);
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};
// Actualizar cliente
// Actualizar cliente
export const actualizarCliente = async (cliente, actualizarClientes) => {
    try {
        // Realiza la solicitud PUT con los datos del cliente
        const response = await updateData(`/clientes/${cliente.id}`, cliente);

        // Verifica si la respuesta contiene la propiedad 'success' y 'data'
        if (response && response.success && response.data) {
            console.log('Cliente actualizado con éxito:', response.data);

            // Actualiza la lista de clientes llamando a la función 'actualizarClientes' pasada como parámetro
            if (actualizarClientes && typeof actualizarClientes === 'function') {
                actualizarClientes();  // Esto actualizará la lista de clientes automáticamente
            }
            return response.data;  // Retorna el cliente actualizado
        }

        // Si la respuesta no contiene los datos esperados, arroja un error
        throw new Error('No se recibieron datos actualizados');
    } catch (error) {
        console.error('Error en la actualización del cliente:', error);
        throw error;  // Propaga el error para que el manejador de errores lo procese
    }
};


// Obtener todos los clientes
export const obtenerClientes = () => fetchData('/clientes');

// Obtener todas las clases
export const obtenerClases = () => fetchData('/clases');

// Obtener todos los entrenadores
export const obtenerEntrenadores = () => fetchData('/entrenadores');

// Crear nuevo cliente
export const crearCliente = (cliente) => postData('/clientes', cliente);


// Crear nueva clase
export const crearClase = (clase) => postData('/clases', clase);

// Crear nuevo entrenador
export const crearEntrenador = (entrenador) => postData('/entrenadores', entrenador);
// actualizar entrenador

export const actualizarEntrenador = (id, entrenador) => updateData(`/entrenadores/${id}`, entrenador);

// Eliminar clase
export const eliminarClase = (id) => deleteData(`/clases/${id}`);

// Actualizar clase
export const actualizarClase = async (id, data) => {
    try {
      const response = await api.put(`/clases/${id}`, data);
      console.log('Respuesta de actualización:', response.data); // Verificar que la respuesta contenga la clase actualizada
      return response.data;  // Retorna los datos de la respuesta
    } catch (error) {
      console.error('Error al actualizar la clase:', error.response || error);
      throw error;  // Propaga el error para manejarlo en el frontend
    }
  };
  
// Eliminar cliente
export const eliminarCliente = (id) => deleteData(`/clientes/${id}`);

// Eliminar membresía
export const eliminarMembresia = (id) => deleteData(`/membresias/${id}`);

// Eliminar entrenador
export const eliminarEntrenador = (id) => deleteData(`/entrenadores/${id}`);

export const obtenerMembresias = () => fetchData('/membresias');

// Crear nueva membresía
export const crearMembresia = (membresia) => postData('/membresias', membresia);

// Actualizar membresía
export const actualizarMembresia = (id, membresia) => updateData(`/membresias/${id}`, membresia);


