import React, { useState } from 'react';
import { CheckCircle, ShieldCheck, Settings, Hash, Percent, Building2 } from 'lucide-react';
import { useSettings, useUpdateSetting } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GymSetting } from '@/types';

export const BillingSettings: React.FC = () => {
  const { data: settingRes, isLoading, refetch } = useSettings();
  const { mutateAsync: updateSetting } = useUpdateSetting();

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const settings: GymSetting[] = Array.isArray(settingRes)
    ? settingRes
    : (settingRes as any)?.data || [];

  React.useEffect(() => {
    if (settings && settings.length > 0) {
      const initial: Record<string, string> = {};
      settings.forEach((s: GymSetting) => {
        initial[s.key] = s.value;
      });
      setFormState(initial);
    }
  }, [settingRes]);

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const val = formState[key];
    if (val !== undefined) {
      await updateSetting({ key, value: val });
      setSuccessMessage(`Saved: ${key}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
          Billing & Fiscal Configuration
        </h1>
        <p className="text-xs text-[#A5A5A5] mt-0.5">
          Gym legal metadata, document prefix generators, default tax rates, and overdue parameters
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Gym Identification Card */}
      <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#292929]">
          <Building2 className="w-4 h-4 text-[#FFC21A]" />
          <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
            Gym Profile & Tax Identification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label="Legal Facility Name"
              value={formState['GYM_NAME'] || 'RV Fitness'}
              onChange={(e) => handleChange('GYM_NAME', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('GYM_NAME')}
              className="mt-2.5 text-xs"
            >
              Update Name
            </Button>
          </div>

          <div>
            <Input
              label="Goods and Services Tax Number (GSTIN)"
              value={formState['GSTIN'] || '27AABCR1234F1Z9'}
              onChange={(e) => handleChange('GSTIN', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('GSTIN')}
              className="mt-2.5 text-xs"
            >
              Update GSTIN
            </Button>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Official Registered Address (Prints on Invoices & Receipts)"
              value={
                formState['GYM_ADDRESS'] ||
                'Near Datta Mandir, Narsobawadi, Taluka Shirol, Kolhapur, Maharashtra 416104'
              }
              onChange={(e) => handleChange('GYM_ADDRESS', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('GYM_ADDRESS')}
              className="mt-2.5 text-xs"
            >
              Update Address
            </Button>
          </div>
        </div>
      </div>

      {/* Numbering & Prefixes */}
      <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#292929]">
          <Hash className="w-4 h-4 text-[#FFC21A]" />
          <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
            Sequential Document Prefixes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label="Invoice Number Prefix"
              value={formState['INVOICE_PREFIX'] || 'RV-INV'}
              onChange={(e) => handleChange('INVOICE_PREFIX', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('INVOICE_PREFIX')}
              className="mt-2.5 text-xs"
            >
              Update Invoice Prefix
            </Button>
          </div>

          <div>
            <Input
              label="Receipt Voucher Prefix"
              value={formState['RECEIPT_PREFIX'] || 'RV-REC'}
              onChange={(e) => handleChange('RECEIPT_PREFIX', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('RECEIPT_PREFIX')}
              className="mt-2.5 text-xs"
            >
              Update Receipt Prefix
            </Button>
          </div>
        </div>
      </div>

      {/* Tax & Overdue Policies */}
      <div className="p-6 rounded-xl bg-[#111111] border border-[#292929] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#292929]">
          <Percent className="w-4 h-4 text-[#FFC21A]" />
          <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
            Tax Defaults & Aging Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label="Default GST Tax Rate (Basis Points: 1800 = 18%)"
              type="number"
              value={formState['DEFAULT_TAX_RATE_BPS'] || '1800'}
              onChange={(e) => handleChange('DEFAULT_TAX_RATE_BPS', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('DEFAULT_TAX_RATE_BPS')}
              className="mt-2.5 text-xs"
            >
              Update Default Tax
            </Button>
          </div>

          <div>
            <Input
              label="Grace Period (Days Before Flagging Overdue)"
              type="number"
              value={formState['OVERDUE_GRACE_DAYS'] || '0'}
              onChange={(e) => handleChange('OVERDUE_GRACE_DAYS', e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave('OVERDUE_GRACE_DAYS')}
              className="mt-2.5 text-xs"
            >
              Update Grace Period
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
