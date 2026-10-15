import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Trainer, Benefit } from '@/types';
import toast from 'react-hot-toast';

export const useTrainers = (params?: { published?: boolean }) => {
  return useQuery({
    queryKey: ['trainers', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Trainer[]>>('/trainers', { params });
      return data.data;
    },
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      email: string;
      phone?: string;
      password?: string;
      specialization: string;
      bio?: string;
      experienceYears?: number;
      certifications?: string;
      photoUrl?: string;
    }) => {
      const { data } = await api.post<ApiResponse<Trainer>>('/trainers', input);
      return data.data;
    },
    onSuccess: (trainer) => {
      toast.success(`Coach '${trainer.user?.fullName}' onboarded successfully`);
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      fullName?: string;
      phone?: string;
      specialization?: string;
      bio?: string;
      experienceYears?: number;
      certifications?: string;
      photoUrl?: string;
      rating?: number;
      isAvailable?: boolean;
      isPublished?: boolean;
    }) => {
      const { data } = await api.patch<ApiResponse<Trainer>>(`/trainers/${id}`, input);
      return data.data;
    },
    onSuccess: (trainer) => {
      toast.success(`Coach '${trainer.user?.fullName}' profile updated`);
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
  });
};

export const useDeleteTrainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<{ success: boolean; archived?: boolean; message: string }>(
        `/trainers/${id}`
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Staff roster updated');
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
  });
};

export const useToggleTrainerPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiResponse<Trainer>>(`/trainers/${id}/toggle-publish`);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(data.isPublished ? 'Coach profile published' : 'Coach profile hidden from public');
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
  });
};

export const useToggleTrainerAvailable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ApiResponse<Trainer>>(`/trainers/${id}/toggle-available`);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(data.isAvailable ? 'Coach marked available' : 'Coach marked unavailable');
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
  });
};

export const useBenefits = () => {
  return useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Benefit[]>>('/benefits');
      return data.data;
    },
  });
};

export const useCreateBenefit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; category?: string; icon?: string }) => {
      const { data } = await api.post<ApiResponse<Benefit>>('/benefits', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Benefit created');
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
  });
};
