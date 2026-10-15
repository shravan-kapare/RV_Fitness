import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, FitnessAssessment, WorkoutPlan, DietPlan, FitnessGoal } from '@/types';
import toast from 'react-hot-toast';

// Member self hooks
export const useMyAssessments = () => {
  return useQuery({
    queryKey: ['my-assessments'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FitnessAssessment[]>>('/fitness/my-assessments');
      return data.data;
    },
  });
};

export const useMyWorkout = () => {
  return useQuery({
    queryKey: ['my-workout'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WorkoutPlan>>('/fitness/my-workout');
      return data.data;
    },
  });
};

export const useMyDiet = () => {
  return useQuery({
    queryKey: ['my-diet'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DietPlan>>('/fitness/my-diet');
      return data.data;
    },
  });
};

export const useMyGoals = () => {
  return useQuery({
    queryKey: ['my-goals'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FitnessGoal[]>>('/fitness/my-goals');
      return data.data;
    },
  });
};

// Trainer / Admin hooks
export const useMemberAssessments = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['member-assessments', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data } = await api.get<ApiResponse<FitnessAssessment[]>>(`/fitness/member/${memberId}/assessments`);
      return data.data;
    },
    enabled: !!memberId,
  });
};

export const useMemberWorkout = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['member-workout', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data } = await api.get<ApiResponse<WorkoutPlan>>(`/fitness/member/${memberId}/workout`);
      return data.data;
    },
    enabled: !!memberId,
  });
};

export const useMemberDiet = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['member-diet', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data } = await api.get<ApiResponse<DietPlan>>(`/fitness/member/${memberId}/diet`);
      return data.data;
    },
    enabled: !!memberId,
  });
};

export const useRecordAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      memberId: string;
      assessmentDate: string;
      weightKg: number;
      heightCm: number;
      bodyFatPct?: number;
      chestCm?: number;
      waistCm?: number;
      armsCm?: number;
      thighsCm?: number;
      notes?: string;
    }) => {
      const { data } = await api.post<ApiResponse<FitnessAssessment>>('/fitness/assessments', input);
      return data.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Fitness assessment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['member-assessments', vars.memberId] });
      queryClient.invalidateQueries({ queryKey: ['my-assessments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to record assessment');
    },
  });
};

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post<ApiResponse<WorkoutPlan>>('/fitness/workouts', input);
      return data.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Workout plan assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['member-workout', vars.memberId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to assign workout');
    },
  });
};

export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post<ApiResponse<DietPlan>>('/fitness/diets', input);
      return data.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Diet plan assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['member-diet', vars.memberId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to assign diet');
    },
  });
};

export const useTodayWorkout = () => {
  return useQuery({
    queryKey: ['today-workout'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>('/fitness/today-workout');
      return data.data;
    },
  });
};

export const useEquipmentList = () => {
  return useQuery({
    queryKey: ['equipment-list'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/fitness/equipment');
      return data.data;
    },
  });
};

export const useGenerateWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<ApiResponse<any>>('/fitness/generate-plan', payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Personalized workout protocol generated!');
      queryClient.invalidateQueries({ queryKey: ['my-workout'] });
      queryClient.invalidateQueries({ queryKey: ['today-workout'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate workout protocol');
    },
  });
};

export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>('/members/onboarding-status');
      return data.data;
    },
  });
};

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['my-member-profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>('/members/me');
      return data.data;
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<ApiResponse<any>>('/members/onboarding', payload);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Onboarding completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-member-profile'] });
      queryClient.invalidateQueries({ queryKey: ['today-workout'] });
      queryClient.invalidateQueries({ queryKey: ['my-workout'] });
      queryClient.invalidateQueries({ queryKey: ['my-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['my-goals'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to complete onboarding');
    },
  });
};

