import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Receipt, PaginatedResponse, ApiResponse } from '@/types';

export interface ReceiptFilters {
  page?: number;
  limit?: number;
  memberId?: string;
  invoiceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const useReceipts = (filters: ReceiptFilters = {}) => {
  return useQuery({
    queryKey: ['receipts', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Receipt>>('/receipts', {
        params: filters,
      });
      return data;
    },
  });
};

export const useReceipt = (id: string | undefined) => {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: async () => {
      if (!id) throw new Error('Receipt ID required');
      const { data } = await api.get<ApiResponse<Receipt>>(`/receipts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const downloadReceiptPdf = async (id: string, receiptNumber: string) => {
  const response = await api.get(`/receipts/${id}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Receipt-${receiptNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export const previewReceiptPdf = async (id: string) => {
  const response = await api.get(`/receipts/${id}/pdf?inline=true`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
};
