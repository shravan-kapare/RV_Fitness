import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AuditLog, PaginatedResponse } from '@/types';

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', {
        params: filters,
      });
      return data;
    },
  });
};
