import { apiRequest } from './api';

// Get supplier's own order (restock) history
export const getSupplierOrderHistoryAPI = async () => {
    return apiRequest('/restock/supplier', { method: 'GET' });
};
