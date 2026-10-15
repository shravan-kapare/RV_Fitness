import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, GymEvent, GalleryPost, OfferCoupon, ContactInquiry } from '@/types';
import toast from 'react-hot-toast';

// Admin CMS queries & mutations
export const useAdminEvents = () => {
  return useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GymEvent[]>>('/cms/events', { params: { all: true } });
      return data.data;
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<GymEvent>) => {
      const { data } = await api.post<ApiResponse<GymEvent>>('/cms/events', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Event published');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create event');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/events/${id}`);
    },
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
};

export const useAdminGallery = () => {
  return useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GalleryPost[]>>('/cms/gallery', { params: { all: true } });
      return data.data;
    },
  });
};

export const useCreateGalleryPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<GalleryPost>) => {
      const { data } = await api.post<ApiResponse<GalleryPost>>('/cms/gallery', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Gallery item added');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    },
  });
};

export const useDeleteGalleryPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/gallery/${id}`);
    },
    onSuccess: () => {
      toast.success('Gallery item removed');
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
    },
  });
};

export const useAdminOffers = () => {
  return useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OfferCoupon[]>>('/cms/offers', { params: { all: true } });
      return data.data;
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const { data } = await api.post<ApiResponse<OfferCoupon>>('/cms/offers', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Offer created');
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cms/offers/${id}`);
    },
    onSuccess: () => {
      toast.success('Offer removed');
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
    },
  });
};

export const useAdminInquiries = (status?: string) => {
  return useQuery({
    queryKey: ['admin-inquiries', status],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ContactInquiry[]>>('/cms/inquiries', {
        params: { status },
      });
      return data.data;
    },
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch<ApiResponse<ContactInquiry>>(`/cms/inquiries/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inquiry status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
    },
  });
};
