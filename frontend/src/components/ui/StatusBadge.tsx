import React from 'react';
import { Badge } from './Badge';
import {
  formatInvoiceStatus,
  formatPaymentStatus,
  formatRefundStatus,
} from '@/lib/formatters';

interface StatusBadgeProps {
  type: 'invoice' | 'payment' | 'refund' | 'reconciliation' | 'dailyClosing';
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = 'md',
}) => {
  if (type === 'invoice') {
    const { label, variant } = formatInvoiceStatus(status);
    return <Badge variant={variant} size={size}>{label}</Badge>;
  }

  if (type === 'payment') {
    const { label, variant } = formatPaymentStatus(status);
    return <Badge variant={variant} size={size}>{label}</Badge>;
  }

  if (type === 'refund') {
    const { label, variant } = formatRefundStatus(status);
    return <Badge variant={variant} size={size}>{label}</Badge>;
  }

  if (type === 'reconciliation') {
    const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      MATCHED: 'success',
      DISCREPANCY: 'danger',
      RESOLVED: 'info',
      PENDING: 'warning',
    };
    return (
      <Badge variant={variantMap[status] || 'default'} size={size}>
        {status}
      </Badge>
    );
  }

  if (type === 'dailyClosing') {
    const variantMap: Record<string, 'success' | 'warning' | 'info'> = {
      OPEN: 'warning',
      CLOSED: 'info',
      VERIFIED: 'success',
    };
    return (
      <Badge variant={variantMap[status] || 'default'} size={size}>
        {status}
      </Badge>
    );
  }

  return <Badge variant="default" size={size}>{status}</Badge>;
};
