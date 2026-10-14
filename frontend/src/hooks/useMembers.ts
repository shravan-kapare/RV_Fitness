import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Member, PaginatedResponse, ApiResponse } from '@/types';

export interface MemberFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export const useMembers = (filters: MemberFilters = { limit: 100 }) => {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Member>>('/members', {
        params: filters,
      });
      return data;
    },
  });
};

export const useMember = (id: string | undefined) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      if (!id) throw new Error('Member ID required');
      const { data } = await api.get<ApiResponse<Member>>(`/members/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
