import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardStats } from '@/types';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // First attempt dedicated dashboard endpoint if available
      try {
        const directRes = await api.get('/reports/dashboard');
        if (directRes.data?.data) {
          return directRes.data.data;
        }
      } catch {
        // Fallback to composing from standard endpoints
      }

      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [summaryRes, collectionsRes, outstandingRes, invoicesRes, paymentsRes] = await Promise.allSettled([
        api.get('/reports/summary', { params: { dateFrom: startOfMonth, dateTo: today } }),
        api.get('/reports/collections', { params: { dateFrom: today, dateTo: today } }),
        api.get('/reports/outstanding'),
        api.get('/invoices', { params: { limit: 5, sort: 'createdAt', order: 'desc' } }),
        api.get('/payments', { params: { limit: 5, sort: 'createdAt', order: 'desc' } }),
      ]);

      const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value.data.data : null;
      const collectionsData = collectionsRes.status === 'fulfilled' ? collectionsRes.value.data.data : null;
      const outstandingData = outstandingRes.status === 'fulfilled' ? outstandingRes.value.data.data : null;
      const invoicesData = invoicesRes.status === 'fulfilled' ? invoicesRes.value.data.data : [];
      const paymentsData = paymentsRes.status === 'fulfilled' ? paymentsRes.value.data.data : [];

      const collectionsByMethod = (collectionsData?.methods || []).map((m: any) => ({
        method: m.method,
        amountPaisa: m.amountPaisa || 0,
        count: m.count || 0,
      }));

      return {
        totalRevenuePaisa: summaryData?.netRevenuePaisa || summaryData?.totalCollectedPaisa || 0,
        outstandingPaisa: outstandingData?.totalOutstandingPaisa || summaryData?.totalOutstandingPaisa || 0,
        overdueInvoicesCount: outstandingData?.overdueCount || 0,
        todayCollectionsPaisa: collectionsData?.totalCollectionsPaisa || 0,
        totalInvoicesCount: summaryData?.invoicesCount || 0,
        paidInvoicesCount: summaryData?.invoicesPaid || 0,
        collectionsByMethod,
        recentInvoices: Array.isArray(invoicesData) ? invoicesData : invoicesData?.data || [],
        recentPayments: Array.isArray(paymentsData) ? paymentsData : paymentsData?.data || [],
      };
    },
    refetchInterval: 60000,
  });
};
