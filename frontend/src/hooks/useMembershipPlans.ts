import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { MembershipPlan, ApiResponse } from '@/types';

export const useMembershipPlans = (params?: { published?: boolean }) => {
  return useQuery({
    queryKey: ['membership-plans', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MembershipPlan[]> | { success: boolean; data: MembershipPlan[] }>(
        '/membership-plans',
        { params }
      );
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
