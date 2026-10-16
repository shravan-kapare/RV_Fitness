import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer, CheckCircle2, FileText, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import { useReceipts, downloadReceiptPdf, previewReceiptPdf } from '@/hooks/useReceipts';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import { Receipt } from '@/types';
import toast from 'react-hot-toast';

export const ReceiptViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedReceiptId = searchParams.get('id');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: settings = {} } = useSettings();

  const { data: response, isLoading } = useReceipts({
    page,
    limit: 10,
    search: search || undefined,
  });

  const receipts = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const handleDownloadPdf = async (receiptId: string, receiptNumber: string) => {
    try {
      setDownloadingId(receiptId);
      await downloadReceiptPdf(receiptId, receiptNumber);
      toast.success(`Receipt ${receiptNumber} downloaded successfully`);
    } catch (error: any) {
      console.error('Failed to download receipt PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to download receipt PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewPdf = async (receiptId: string) => {
    try {
      await previewReceiptPdf(receiptId);
    } catch (error: any) {
      console.error('Failed to preview receipt PDF:', error);
      toast.error('Failed to open PDF preview');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const gymName = settings['gym_name'] || 'RV FITNESS';
  const gymAddress =
    settings['gym_address'] || 'Near Datta Mandir, Main Road, Narsobawadi, Shirol, Kolhapur, Maharashtra 416104';
  const gymGstin = settings['gym_gstin']?.trim();
  const isGstConfigured =
    gymGstin &&
    gymGstin.length >= 10 &&
    gymGstin.toUpperCase() !== 'N/A' &&
    gymGstin !== '27AAAAA0000A1Z5';

  const columns: Column<Receipt>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (r: Receipt) => (
        <span className="font-mono font-bold text-[#F5F5F5] tracking-wide text-xs">
          {r.receiptNumber}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Associated Invoice',
      render: (r: Receipt) => (
        <div>
          <span className="font-mono text-xs text-[#FFC21A] font-semibold">
            {r.invoice?.invoiceNumber || 'Direct Payment'}
          </span>
          {r.payment?.referenceNumber && (
            <p className="text-[10px] font-mono text-[#737373] truncate max-w-[120px]">
              Ref: {r.payment.referenceNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (r: Receipt) => (
        <div>
          <p className="text-[#F5F5F5] font-semibold text-xs">{r.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[10px] font-mono text-[#A5A5A5]">{r.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'amountPaisa',
      header: 'Amount Received',
      align: 'right',
      render: (r: Receipt) => (
        <span className="font-mono font-bold tabular-nums text-emerald-400 text-xs">
          {formatCurrency(r.amountPaisa)}
        </span>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Issue Date',
      render: (r: Receipt) => <span className="text-[#A5A5A5] text-xs">{formatDate(r.issuedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r: Receipt) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedReceipt(r)}
            className="text-xs px-2.5 py-1 h-auto text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#1E1E1E]"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            <span>Details</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePreviewPdf(r.id)}
            className="text-xs px-2.5 py-1 h-auto"
            title="Preview A4 PDF in browser"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
            <span>PDF</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadPdf(r.id, r.receiptNumber)}
            isLoading={downloadingId === r.id}
            className="text-xs px-2.5 py-1 h-auto"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-[#F5F5F5] tracking-tight uppercase">
            Receipts & Invoices Repository
          </h1>
          <p className="text-xs text-[#A5A5A5] mt-0.5">
            Verified payment proofs, financial ledger breakdown, and official A4 PDF generation for RV Fitness
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#292929]">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search receipt #, invoice #, member code, or name..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={receipts}
        isLoading={isLoading}
        emptyMessage="No issued receipts found."
      />

      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={`Payment Receipt — ${selectedReceipt.receiptNumber}`}
          size="lg"
        >
          <div className="p-6 bg-[#171717] text-[#F5F5F5] rounded-lg space-y-6 border border-[#292929]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#292929] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded bg-[#FFC21A] flex items-center justify-center font-black text-[#080808] text-sm">
                    RV
                  </div>
                  <h3 className="text-lg font-black tracking-wider text-[#F5F5F5] uppercase">
                    {gymName}
                  </h3>
                </div>
                <p className="text-xs text-[#A5A5A5]">{gymAddress}</p>
                {isGstConfigured ? (
                  <p className="text-[11px] font-mono text-amber-400 mt-0.5">GSTIN: {gymGstin}</p>
                ) : (
                  <p className="text-[11px] font-mono text-[#737373] mt-0.5">
                    Official Payment Voucher (Exempt / Unregistered)
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PAYMENT RECEIPT
                </span>
                <p className="font-mono font-bold text-sm text-[#F5F5F5] mt-1.5">
                  {selectedReceipt.receiptNumber}
                </p>
                <p className="text-xs text-[#A5A5A5]">Issued: {formatDate(selectedReceipt.issuedAt)}</p>
              </div>
            </div>

            {/* Member & Payment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#111111] rounded-lg border border-[#292929] space-y-1">
                <span className="font-bold text-[10px] text-[#FFC21A] uppercase tracking-wider block mb-1">
                  Received From
                </span>
                <p className="font-bold text-sm text-[#F5F5F5]">
                  {selectedReceipt.member?.user?.fullName}
                </p>
                <p className="font-mono text-[#A5A5A5]">Member Code: {selectedReceipt.member?.memberCode}</p>
                {selectedReceipt.member?.user?.phone && (
                  <p className="text-[#737373]">Phone: {selectedReceipt.member?.user?.phone}</p>
                )}
                {selectedReceipt.member?.user?.email && (
                  <p className="text-[#737373]">Email: {selectedReceipt.member?.user?.email}</p>
                )}
              </div>

              <div className="p-3.5 bg-[#111111] rounded-lg border border-[#292929] space-y-1">
                <span className="font-bold text-[10px] text-[#A5A5A5] uppercase tracking-wider block mb-1">
                  Settlement Details
                </span>
                <p className="text-[#D4D4D4]">
                  Channel:{' '}
                  <span className="font-bold text-[#F5F5F5]">
                    {formatPaymentMethod(selectedReceipt.payment?.method || 'CASH')}
                  </span>
                </p>
                {selectedReceipt.payment?.referenceNumber && (
                  <p className="text-[#D4D4D4]">
                    Txn / UTR Ref:{' '}
                    <span className="font-mono text-[#F5F5F5]">
                      {selectedReceipt.payment.referenceNumber}
                    </span>
                  </p>
                )}
                <p className="text-[#D4D4D4]">
                  Associated Invoice:{' '}
                  <span className="font-mono text-[#FFC21A]">
                    {selectedReceipt.invoice?.invoiceNumber || 'Direct Allocation'}
                  </span>
                </p>
                {selectedReceipt.membership?.planName && (
                  <p className="text-[#D4D4D4]">
                    Plan: <span className="text-white">{selectedReceipt.membership.planName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-4 bg-[#111111] rounded-lg border border-[#292929] space-y-2 text-xs">
              <span className="font-bold text-[10px] text-[#888] uppercase tracking-wider block mb-1">
                Financial Ledger Breakdown
              </span>
              <div className="flex justify-between text-[#A5A5A5]">
                <span>Total Invoice Amount:</span>
                <span className="font-mono text-white">
                  {selectedReceipt.formattedInvoiceTotal || formatCurrency(selectedReceipt.invoice?.totalPaisa || selectedReceipt.amountPaisa)}
                </span>
              </div>
              <div className="flex justify-between text-[#A5A5A5]">
                <span>Previous Payments Recorded:</span>
                <span className="font-mono text-white">
                  {selectedReceipt.formattedPreviousPayments || '₹0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 rounded bg-[#1c1c1c] border border-amber-500/30">
                <span className="font-bold text-amber-400">Current Payment Received:</span>
                <span className="font-mono font-black text-base text-amber-400">
                  {formatCurrency(selectedReceipt.amountPaisa)}
                </span>
              </div>
              <div className="flex justify-between text-[#A5A5A5] pt-1">
                <span>Remaining Balance Due:</span>
                <span
                  className={`font-mono font-bold ${
                    (selectedReceipt.remainingBalancePaisa || 0) > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedReceipt.formattedRemainingBalance || '₹0.00'}
                </span>
              </div>
            </div>

            {/* Amount in words */}
            {selectedReceipt.amountWords && (
              <div className="p-3 bg-[#111111] rounded-lg border border-[#292929] text-xs">
                <span className="text-[#737373] uppercase font-bold text-[10px] block mb-0.5">
                  Amount in Words
                </span>
                <p className="text-amber-200 font-medium italic">{selectedReceipt.amountWords}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#292929] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#A5A5A5]">
              <p>Official computer-generated receipt issued at RV Fitness Narsobawadi.</p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="sm" onClick={handlePrint} className="flex-1 sm:flex-initial">
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePreviewPdf(selectedReceipt.id)}
                  className="flex-1 sm:flex-initial"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#FFC21A]" />
                  Preview PDF
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadPdf(selectedReceipt.id, selectedReceipt.receiptNumber)}
                  isLoading={downloadingId === selectedReceipt.id}
                  className="flex-1 sm:flex-initial"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
