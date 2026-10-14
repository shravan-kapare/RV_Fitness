import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Printer, CheckCircle2 } from 'lucide-react';
import { useReceipts } from '@/hooks/useReceipts';
import { Button } from '@/components/ui/Button';
import { Table, Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/formatters';
import { Receipt } from '@/types';

export const ReceiptViewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedReceiptId = searchParams.get('id');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const { data: response, isLoading } = useReceipts({
    page,
    limit: 10,
    search: search || undefined,
  });

  const receipts = response?.data || [];
  const totalPages = response?.pagination?.totalPages || 1;

  const handleDownloadPdf = (receiptId: string) => {
    window.open(`/api/v1/receipts/${receiptId}/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<Receipt>[] = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      render: (r: Receipt) => (
        <span className="font-semibold text-white tracking-wide">{r.receiptNumber}</span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment Reference',
      render: (r: Receipt) => (
        <span className="text-gray-300 text-xs">{r.payment?.paymentNumber || 'N/A'}</span>
      ),
    },
    {
      key: 'member',
      header: 'Member Name',
      render: (r: Receipt) => (
        <div>
          <p className="text-white font-medium">{r.member?.user?.fullName || 'N/A'}</p>
          <p className="text-[11px] text-gray-400">{r.member?.memberCode}</p>
        </div>
      ),
    },
    {
      key: 'amountPaisa',
      header: 'Amount Paid',
      render: (r: Receipt) => (
        <span className="font-bold text-emerald-400">{formatCurrency(r.amountPaisa)}</span>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Issued Date',
      render: (r: Receipt) => <span className="text-gray-300 text-xs">{formatDate(r.issuedAt)}</span>,
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
            className="text-xs px-2.5 py-1 h-auto text-gray-300 hover:text-white"
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadPdf(r.id)}
            className="text-xs px-2.5 py-1 h-auto"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Receipts Repository</h2>
          <p className="text-xs text-gray-400">
            Download and print official verified GST payment vouchers
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#111111] p-3 rounded-xl border border-[#262626]">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search receipt # or member..."
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
          title={`Receipt Preview — ${selectedReceipt.receiptNumber}`}
          size="lg"
        >
          <div className="p-6 bg-white text-black rounded-lg space-y-6 select-text print:p-0">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-black">RV FITNESS</h3>
                <p className="text-xs text-gray-600">Narsobawadi, Shirol, Maharashtra 416104</p>
                <p className="text-xs text-gray-600">Phone: +91 98765 43210 • GSTIN: 27AABCR1234F1Z9</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                  PAYMENT RECEIPT
                </span>
                <p className="text-xs font-semibold text-gray-800 mt-1">
                  Receipt No: {selectedReceipt.receiptNumber}
                </p>
                <p className="text-xs text-gray-600">Date: {formatDate(selectedReceipt.issuedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-bold text-gray-500 uppercase block mb-1">Received From</span>
                <p className="font-bold text-gray-900 text-sm">
                  {selectedReceipt.member?.user?.fullName}
                </p>
                <p className="text-gray-600">Member ID: {selectedReceipt.member?.memberCode}</p>
                <p className="text-gray-600">{selectedReceipt.member?.user?.email}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-bold text-gray-500 uppercase block mb-1">Payment Channel</span>
                <p className="text-gray-800">
                  Method: <span className="font-bold">{formatPaymentMethod(selectedReceipt.payment?.method || 'CASH')}</span>
                </p>
                <p className="text-gray-800">
                  UTR / Ref: <span className="font-medium">{selectedReceipt.payment?.referenceNumber || 'Cash Desk'}</span>
                </p>
                <p className="text-gray-800">
                  Invoice Ref: <span className="font-medium">{selectedReceipt.invoice?.invoiceNumber}</span>
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2.5">
                      Gym Membership / Training Services Settlement ({selectedReceipt.invoice?.invoiceNumber})
                    </td>
                    <td className="p-2.5 text-right font-bold">
                      {formatCurrency(selectedReceipt.amountPaisa)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Total Settled & Received</span>
              </div>
              <span className="text-lg font-black text-emerald-800">
                {formatCurrency(selectedReceipt.amountPaisa)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-end text-[10px] text-gray-500">
              <div>
                <p>Authorized Signature: _______________________</p>
                <p className="mt-1">Computer-generated receipt issued at RV Fitness Narsobawadi.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handlePrint}>
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadPdf(selectedReceipt.id)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download Official PDF
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
