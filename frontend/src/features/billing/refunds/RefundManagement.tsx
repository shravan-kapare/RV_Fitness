import React, { useState } from 'react';
import { Plus, RotateCcw, AlertCircle, ArrowUpRight, Check, X, ShieldAlert } from 'lucide-react';
import {
  useRefunds,
  useRequestRefund,
  useApproveRefund,
  useProcessRefund,
  useRejectRefund,
} from '@/hooks/useRefunds';
import { usePayments } from '@/hooks/usePayments';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, rupeesToPaisa, formatDate } from '@/lib/formatters';
import { Refund, RefundMethod, Payment } from '@/types';

export const RefundManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [amountRupees, setAmountRupees] = useState<number>(0);
  const [method, setMethod] = useState<RefundMethod>('CASH');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: refundRes, isLoading, refetch } = useRefunds();
  const { data: paymentRes } = usePayments({ limit: 100 });
  const { mutateAsync: requestRefund, isPending: isRequesting } = useRequestRefund();
  const { mutateAsync: approveRefund } = useApproveRefund();
  const { mutateAsync: processRefund } = useProcessRefund();
  const { mutateAsync: rejectRefund } = useRejectRefund();

  const refunds: Refund[] = refundRes?.data || [];
  const payments: Payment[] = paymentRes?.data || [];

  const confirmedPayments = payments.filter((p: Payment) => p.status === 'CONFIRMED');
  const selectedPayment = confirmedPayments.find((p: Payment) => p.id === paymentId);

  const handleOpenModal = () => {
    setError(null);
    setPaymentId('');
    setAmountRupees(0);
    setReason('');
    setIsModalOpen(true);
  };

  const handlePaymentSelect = (id: string) => {
    setPaymentId(id);
    const pmt = confirmedPayments.find((p: Payment) => p.id === id);
    if (pmt) {
      setAmountRupees(Number(pmt.amountPaisa) / 100);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!paymentId) {
      setError('Please select a payment to refund');
      return;
    }
    if (amountRupees <= 0) {
      setError('Refund amount must be greater than zero');
      return;
    }
    if (!reason) {
      setError('Please specify an audit reason for the refund');
      return;
    }

    try {
      await requestRefund({
        paymentId,
        amountPaisa: Number(rupeesToPaisa(amountRupees)),
        reason,
        method,
      });
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to request refund');
    }
  };

  const handleApprove = async (id: string) => {
    await approveRefund(id);
    refetch();
  };

  const handleProcess = async (id: string) => {
    await processRefund(id);
    refetch();
  };

  const handleReject = async (id: string) => {
    const rejectionReason = prompt('Enter rejection reason:') || 'Administrative decision';
    await rejectRefund(id);
    refetch();
  };

  const columns: Column<Refund>[] = [
    {
      key: 'refundNumber',
      header: 'Refund #',
      render: (r: Refund) => (
        <span className="font-mono font-bold text-[#F5F5F5] tracking-wide text-xs">
          {r.refundNumber}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Original Payment',
      render: (r: Refund) => (
        <div>
          <span className="font-mono text-xs text-[#F5F5F5]">{r.payment?.paymentNumber}</span>
          <p className="text-[10px] font-mono tabular-nums text-[#A5A5A5]">
            Orig: {formatCurrency(r.payment?.amountPaisa || 0)}
          </p>
        </div>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (r: Refund) => (
        <div>
          <p className="text-[#F5F5F5] font-semibold text-xs">{r.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[10px] font-mono text-[#A5A5A5]">{r.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'amountPaisa',
      header: 'Refund Amount',
      align: 'right',
      render: (r: Refund) => (
        <span className="font-mono font-bold tabular-nums text-rose-400 text-xs">
          {formatCurrency(r.amountPaisa)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Refund) => <StatusBadge status={r.status} type="refund" />,
    },
    {
      key: 'reason',
      header: 'Audit Reason',
      render: (r: Refund) => (
        <span className="text-[#A5A5A5] text-xs max-w-xs truncate block" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r: Refund) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status === 'REQUESTED' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleApprove(r.id)}
                className="text-xs px-2.5 py-1 h-auto text-emerald-400 hover:text-white"
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(r.id)}
                className="text-xs px-2.5 py-1 h-auto"
              >
                Reject
              </Button>
            </>
          )}

          {r.status === 'APPROVED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleProcess(r.id)}
              className="text-xs px-2.5 py-1 h-auto"
            >
              Disburse Funds
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Refund & Reversal Management
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Two-step approval workflow for membership reversals and audited payment rollbacks
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Request Refund</span>
        </Button>
      </div>

      <Table
        columns={columns}
        data={refunds}
        isLoading={isLoading}
        emptyMessage="No refund records or reversals logged."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Member Refund / Reversal"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
              Select Confirmed Payment <span className="text-red-400">*</span>
            </label>
            <select
              value={paymentId}
              onChange={(e) => handlePaymentSelect(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#171717] border border-[#292929] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
              required
            >
              <option value="">-- Choose Transaction to Refund --</option>
              {confirmedPayments.map((p: Payment) => (
                <option key={p.id} value={p.id}>
                  {p.paymentNumber} — {p.member?.user?.fullName} ({formatCurrency(p.amountPaisa)})
                </option>
              ))}
            </select>
          </div>

          {selectedPayment && (
            <div className="p-3.5 rounded-lg bg-[#171717] border border-[#292929] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Original Amount:</span>
                <span className="font-mono font-bold text-[#F5F5F5]">
                  {formatCurrency(selectedPayment.amountPaisa)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5A5A5]">Invoice Number:</span>
                <span className="font-mono text-[#FFC21A]">{selectedPayment.invoice?.invoiceNumber}</span>
              </div>
            </div>
          )}

          <div>
            <Input
              label="Refund Amount (₹) *"
              type="number"
              step="0.01"
              min="1"
              value={amountRupees || ''}
              onChange={(e) => setAmountRupees(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-1.5">
              Refund Disbursement Method <span className="text-red-400">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as RefundMethod)}
              className="w-full h-10 px-3 rounded-lg bg-[#171717] border border-[#292929] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FFC21A]"
            >
              <option value="CASH">Cash Counter Disbursal</option>
              <option value="UPI">UPI Reversal</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
              <option value="ORIGINAL_METHOD">Original Payment Method</option>
            </select>
          </div>

          <div>
            <Input
              label="Reason for Refund / Adjustment *"
              placeholder="e.g. Member medical cancellation, relocation, plan downgrade"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isRequesting}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
