import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ReconciliationRecord,
  CreateReconciliationData,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export interface ReconciliationFilters {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useReconciliations = (filters: ReconciliationFilters = {}) => {
  return useQuery({
    queryKey: ['reconciliations', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ReconciliationRecord>>('/reconciliation', {
        params: filters,
      });
      return data;
    },
  });
};

export const useReconciliation = (id: string | undefined) => {
  return useQuery({
    queryKey: ['reconciliation', id],
    queryFn: async () => {
      if (!id) throw new Error('Reconciliation ID required');
      const { data } = await api.get<ApiResponse<ReconciliationRecord>>(`/reconciliation/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReconciliationData) => {
      const { data } = await api.post<ApiResponse<ReconciliationRecord>>('/reconciliation', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
    },
  });
};

export const useResolveReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data } = await api.post<ApiResponse<ReconciliationRecord>>(`/reconciliation/${id}/resolve`, {
        notes,
      });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation', id] });
    },
  });
};
