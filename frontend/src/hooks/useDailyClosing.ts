import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  DailyClosing,
  CreateDailyClosingData,
  ApiResponse,
} from '@/types';

export interface TodayClosingSummary {
  date: string;
  totalCollectionsPaisa: number;
  cashCollectionsPaisa: number;
  digitalCollectionsPaisa: number;
  invoicesIssued: number;
  invoicesPaid: number;
  refundsProcessedPaisa: number;
}

export const useDailyClosings = () => {
  return useQuery({
    queryKey: ['daily-closings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DailyClosing[]> | { success: boolean; data: DailyClosing[] }>('/daily-closings');
      return data.data;
    },
  });
};

export const useTodayClosingSummary = (date?: string) => {
  return useQuery({
    queryKey: ['daily-closing-summary', date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TodayClosingSummary>>('/daily-closings/summary', {
        params: { date },
      });
      return data.data;
    },
  });
};

export const useCloseDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDailyClosingData) => {
      const { data } = await api.post<ApiResponse<DailyClosing>>('/daily-closings/close', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-closings'] });
      queryClient.invalidateQueries({ queryKey: ['daily-closing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
