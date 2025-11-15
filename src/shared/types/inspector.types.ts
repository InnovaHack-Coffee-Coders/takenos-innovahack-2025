// Tipos relacionados con inspectores

import { BaseEntity, Status } from './common.types';

export interface Inspector extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: Status;
}

export interface InspectorFormData {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface InspectorFilters {
  search?: string;
  status?: Status;
  role?: string;
}

