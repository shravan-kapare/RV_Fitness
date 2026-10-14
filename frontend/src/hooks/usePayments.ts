import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Payment,
  CreatePaymentData,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  invoiceId?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const usePayments = (filters: PaymentFilters = {}) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Payment>>('/payments', {
        params: filters,
      });
      return data;
    },
  });
};

export const usePayment = (id: string | undefined) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      if (!id) throw new Error('Payment ID required');
      const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentData: CreatePaymentData) => {
      const { data } = await api.post<ApiResponse<Payment>>('/payments', paymentData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Payment>>(`/payments/${id}/confirm`);
      return data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      }
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useReversePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Payment>>(`/payments/${id}/reverse`);
      return data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (data.invoiceId) {
        queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
