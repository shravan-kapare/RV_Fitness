import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useSettings = () => {
  return useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Record<string, string> }>('/settings');
      return data.data || {};
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const { data } = await api.patch<{ success: boolean; data: Record<string, string> }>('/settings', settings);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data } = await api.patch<{ success: boolean; data: Record<string, string> }>('/settings', {
        [key]: value,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-home'] });
    },
  });
};
