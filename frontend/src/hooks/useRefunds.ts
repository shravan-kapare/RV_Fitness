import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Refund,
  CreateRefundData,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export interface RefundFilters {
  page?: number;
  limit?: number;
  status?: string;
  memberId?: string;
  paymentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useRefunds = (filters: RefundFilters = {}) => {
  return useQuery({
    queryKey: ['refunds', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Refund>>('/refunds', {
        params: filters,
      });
      return data;
    },
  });
};

export const useRefund = (id: string | undefined) => {
  return useQuery({
    queryKey: ['refund', id],
    queryFn: async () => {
      if (!id) throw new Error('Refund ID required');
      const { data } = await api.get<ApiResponse<Refund>>(`/refunds/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (refundData: CreateRefundData) => {
      const { data } = await api.post<ApiResponse<Refund>>('/refunds', refundData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Refund>>(`/refunds/${id}/approve`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refund', id] });
    },
  });
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Refund>>(`/refunds/${id}/process`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refund', id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Refund>>(`/refunds/${id}/reject`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['refund', id] });
    },
  });
};
