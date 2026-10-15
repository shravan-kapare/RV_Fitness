import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PublicHomeData, MembershipPlan, Trainer, GymEvent, GalleryPost, OfferCoupon, ContactInquiry } from '@/types';
import toast from 'react-hot-toast';

export const usePublicHome = () => {
  return useQuery({
    queryKey: ['public-home'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicHomeData>>('/public/home');
      return data.data;
    },
  });
};

export const usePublicPlans = () => {
  return useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MembershipPlan[]>>('/public/plans');
      return data.data;
    },
  });
};

export const usePublicTrainers = () => {
  return useQuery({
    queryKey: ['public-trainers'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Trainer[]>>('/public/trainers');
      return data.data;
    },
  });
};

export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GymEvent[]>>('/public/events');
      return data.data;
    },
  });
};

export const usePublicGallery = (category?: string) => {
  return useQuery({
    queryKey: ['public-gallery', category],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<GalleryPost[]>>('/public/gallery', {
        params: { category },
      });
      return data.data;
    },
  });
};

export const usePublicOffers = () => {
  return useQuery({
    queryKey: ['public-offers'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OfferCoupon[]>>('/public/offers');
      return data.data;
    },
  });
};

export const useSubmitInquiry = () => {
  return useMutation({
    mutationFn: async (input: {
      fullName: string;
      email: string;
      phone: string;
      subject: string;
      message: string;
    }) => {
      const { data } = await api.post<ApiResponse<ContactInquiry>>('/public/inquiry', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inquiry submitted! We will contact you shortly.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit inquiry');
    },
  });
};
