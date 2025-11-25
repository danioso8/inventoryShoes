import api from './api';

const invoiceService = {
  // Obtener todas las facturas
  getAll: async () => {
    const response = await api.get('/invoices');
    return response.data;
  },

  // Obtener una factura específica
  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Crear nueva factura
  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  // Cancelar factura
  cancel: async (id) => {
    const response = await api.patch(`/invoices/${id}/cancel`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async (fechaInicio = null, fechaFin = null) => {
    let url = '/invoices/stats';
    if (fechaInicio && fechaFin) {
      url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }
    const response = await api.get(url);
    return response.data;
  }
};

export default invoiceService;
