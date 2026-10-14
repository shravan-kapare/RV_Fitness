import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MembershipPlan, ApiResponse } from '@/types';

export const useMembershipPlans = () => {
  return useQuery({
    queryKey: ['membership-plans'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MembershipPlan[]> | { success: boolean; data: MembershipPlan[] }>('/membership-plans', {
        params: { isActive: true },
      });
      return data.data;
    },
  });
};

export const useMembershipPlan = (id: string | undefined) => {
  return useQuery({
    queryKey: ['membership-plan', id],
    queryFn: async () => {
      if (!id) throw new Error('Plan ID required');
      const { data } = await api.get<ApiResponse<MembershipPlan>>(`/membership-plans/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
