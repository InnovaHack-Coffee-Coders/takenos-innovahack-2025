// Servicio para gestionar inspectores

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Inspector, InspectorFormData, InspectorFilters } from '../types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const inspectorService = {
  async getAll(filters?: InspectorFilters): Promise<PaginatedResponse<Inspector>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<PaginatedResponse<Inspector>>(
      `${API_ENDPOINTS.INSPECTORS}${query}`
    );
    return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  },

  async getById(id: string): Promise<Inspector> {
    const response = await apiClient.get<Inspector>(`${API_ENDPOINTS.INSPECTORS}/${id}`);
    if (!response.data) throw new Error('Inspector no encontrado');
    return response.data;
  },

  async create(data: InspectorFormData): Promise<Inspector> {
    const response = await apiClient.post<Inspector>(API_ENDPOINTS.INSPECTORS, data);
    if (!response.data) throw new Error('Error al crear inspector');
    return response.data;
  },

  async update(id: string, data: Partial<InspectorFormData>): Promise<Inspector> {
    const response = await apiClient.put<Inspector>(`${API_ENDPOINTS.INSPECTORS}/${id}`, data);
    if (!response.data) throw new Error('Error al actualizar inspector');
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.INSPECTORS}/${id}`);
  },
};

