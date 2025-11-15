// Tipos relacionados con productores

import { BaseEntity, Status } from './common.types';

export interface Producer extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: Status;
  inspectorId?: string;
  inspectorName?: string;
}

export interface ProducerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  inspectorId?: string;
}

export interface ProducerFilters {
  search?: string;
  status?: Status;
  inspectorId?: string;
}

