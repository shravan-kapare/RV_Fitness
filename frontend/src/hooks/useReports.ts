import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ReportSummary,
  CollectionReport,
  OutstandingReport,
  Invoice,
  ApiResponse,
} from '@/types';

export const useSummaryReport = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['report-summary', dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ReportSummary>>('/reports/summary', {
        params: { dateFrom, dateTo },
      });
      return data.data;
    },
  });
};

export const useCollectionsReport = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['report-collections', dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CollectionReport>>('/reports/collections', {
        params: { dateFrom, dateTo },
      });
      return data.data;
    },
  });
};

export const useOutstandingReport = () => {
  return useQuery({
    queryKey: ['report-outstanding'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OutstandingReport>>('/reports/outstanding');
      return data.data;
    },
  });
};

export const useOverdueReport = () => {
  return useQuery({
    queryKey: ['report-overdue'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Invoice[]>>('/reports/overdue');
      return data.data;
    },
  });
};

export const useRevenueReport = (period?: string) => {
  return useQuery({
    queryKey: ['report-revenue', period],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>('/reports/revenue', {
        params: { period },
      });
      return data.data;
    },
  });
};
