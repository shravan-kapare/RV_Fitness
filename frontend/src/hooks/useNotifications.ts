import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, NotificationItem } from '@/types';
import toast from 'react-hot-toast';

export const useMyNotifications = () => {
  return useQuery({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<NotificationItem[]>>('/notifications/my-notifications');
      return data.data;
    },
    refetchInterval: 30000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useBroadcastNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      message: string;
      type?: string;
      targetType?: string;
    }) => {
      const { data } = await api.post<ApiResponse<NotificationItem>>('/notifications/broadcast', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Notification broadcast dispatched');
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to broadcast notification');
    },
  });
};
