import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Invoice,
  CreateInvoiceData,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const useInvoices = (filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Invoice>>('/invoices', {
        params: filters,
      });
      return data;
    },
  });
};

export const useInvoice = (id: string | undefined) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) throw new Error('Invoice ID required');
      const { data } = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceData: CreateInvoiceData) => {
      const { data } = await api.post<ApiResponse<Invoice>>('/invoices', invoiceData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useIssueInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/issue`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/cancel`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useVoidInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Invoice>>(`/invoices/${id}/void`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
