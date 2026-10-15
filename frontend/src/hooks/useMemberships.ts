import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Membership } from '@/types';
import toast from 'react-hot-toast';

export const useMemberships = (filters?: { status?: string; memberId?: string }) => {
  return useQuery({
    queryKey: ['memberships', filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Membership[]>>('/memberships', {
        params: filters,
      });
      return data.data;
    },
  });
};

export const useExpiringMemberships = (days = 7) => {
  return useQuery({
    queryKey: ['memberships-expiring', days],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Membership[]>>('/memberships/expiring', {
        params: { days },
      });
      return data.data;
    },
  });
};

export const useRenewMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newPlanId }: { id: string; newPlanId?: string }) => {
      const { data } = await api.post<ApiResponse<Membership>>(`/memberships/${id}/renew`, { newPlanId });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Membership renewed successfully');
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to renew membership');
    },
  });
};

export const useFreezeMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, freezeDays }: { id: string; reason: string; freezeDays: number }) => {
      const { data } = await api.post<ApiResponse<Membership>>(`/memberships/${id}/freeze`, { reason, freezeDays });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Membership frozen');
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to freeze membership');
    },
  });
};

export const useUnfreezeMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Membership>>(`/memberships/${id}/unfreeze`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Membership reactivated');
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to unfreeze membership');
    },
  });
};

export const useCancelMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiResponse<Membership>>(`/memberships/${id}/cancel`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Membership cancelled');
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel membership');
    },
  });
};
