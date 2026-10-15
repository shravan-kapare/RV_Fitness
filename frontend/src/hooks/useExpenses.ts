import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Expense, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

export const useExpenses = (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Expense>>('/expenses', { params });
      return data;
    },
  });
};

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: ['expense-summary'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{
        totalExpensePaisa: number;
        categoryBreakdown: { category: string; amountPaisa: number }[];
      }>>('/expenses/summary');
      return data.data;
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      category: string;
      title: string;
      description?: string;
      amountRupees: number;
      expenseDate?: string;
      paymentMethod?: string;
      referenceNumber?: string;
    }) => {
      const { data } = await api.post<ApiResponse<Expense>>('/expenses', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Expense recorded');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to record expense');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      toast.success('Expense deleted');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete expense');
    },
  });
};
