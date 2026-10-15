import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Attendance, AttendanceQrToken } from '@/types';
import toast from 'react-hot-toast';

export const useMemberQrToken = () => {
  return useQuery({
    queryKey: ['my-qr-token'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AttendanceQrToken>>('/attendance/my-qr');
      return data.data;
    },
    refetchInterval: 50000, // Refresh slightly before expiration
  });
};

export const useMyAttendanceHistory = () => {
  return useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>('/attendance/my-history');
      return data.data;
    },
  });
};

export const useDailyAttendance = (date?: string) => {
  return useQuery({
    queryKey: ['daily-attendance', date],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          date: string;
          totalCheckIns: number;
          activeInGymCount: number;
          qrCheckIns: number;
          manualCheckIns: number;
          records: Attendance[];
        }>
      >('/attendance/daily', { params: { date } });
      return data.data;
    },
  });
};

export const useScanQrAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post<{ success: boolean; data: any; message: string }>('/attendance/scan', { token });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Check-in verified successfully!');
      queryClient.invalidateQueries({ queryKey: ['daily-attendance'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Invalid or expired QR pass');
    },
  });
};

export const useManualCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { memberCode?: string; memberId?: string; notes?: string }) => {
      const { data } = await api.post<{ success: boolean; data: any; message: string }>('/attendance/manual', input);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Check-in recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['daily-attendance'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to record check-in');
    },
  });
};
