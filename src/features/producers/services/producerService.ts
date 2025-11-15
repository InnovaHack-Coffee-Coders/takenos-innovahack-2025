// Servicio para gestionar productores

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Producer, ProducerFormData, ProducerFilters } from '../types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const producerService = {
  async getAll(filters?: ProducerFilters): Promise<PaginatedResponse<Producer>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.inspectorId) params.append('inspectorId', filters.inspectorId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<PaginatedResponse<Producer>>(
      `${API_ENDPOINTS.PRODUCERS}${query}`
    );
    return response.data || { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  },

  async getById(id: string): Promise<Producer> {
    const response = await apiClient.get<Producer>(`${API_ENDPOINTS.PRODUCERS}/${id}`);
    if (!response.data) throw new Error('Productor no encontrado');
    return response.data;
  },

  async create(data: ProducerFormData): Promise<Producer> {
    const response = await apiClient.post<Producer>(API_ENDPOINTS.PRODUCERS, data);
    if (!response.data) throw new Error('Error al crear productor');
    return response.data;
  },

  async update(id: string, data: Partial<ProducerFormData>): Promise<Producer> {
    const response = await apiClient.put<Producer>(`${API_ENDPOINTS.PRODUCERS}/${id}`, data);
    if (!response.data) throw new Error('Error al actualizar productor');
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PRODUCERS}/${id}`);
  },
};

