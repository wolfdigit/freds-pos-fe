import { useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { CheckoutReceipt } from '@/types/checkout';
import {
  RECEIPT_PRINT_ROOT_ID,
  applyReceiptPageSize,
  armReceiptPrintEscapeGuard,
  clearReceiptPageSize,
  isReceiptPrintEscapeSuppressed,
  printReceiptSheet,
  RECEIPT_PRINT_SHEET_ID,
} from '../printReceipt';
import { ReceiptDocument } from './ReceiptDocument';

interface ReceiptModalProps {
  receipt: CheckoutReceipt | null;
  onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isReceiptPrintEscapeSuppressed()) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, []);

  useLayoutEffect(() => {
    if (!receipt) return;
    const sheet = document.getElementById(RECEIPT_PRINT_SHEET_ID);
    if (!(sheet instanceof HTMLElement)) return;

    const updatePageSize = () => applyReceiptPageSize(sheet);
    updatePageSize();
    const observer = new ResizeObserver(updatePageSize);
    observer.observe(sheet);

    const onBeforePrint = () => {
      armReceiptPrintEscapeGuard();
      updatePageSize();
    };
    const onAfterPrint = () => {
      armReceiptPrintEscapeGuard();
    };
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      observer.disconnect();
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      clearReceiptPageSize();
    };
  }, [receipt]);

  if (!receipt) return null;

  return (
    <>
      <Modal
        open={!!receipt}
        onClose={onClose}
        title="結帳明細"
        widthClassName="max-w-md"
        footer={
          <div className="receipt-no-print flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={printReceiptSheet}>
              列印
            </Button>
            <Button type="button" variant="primary" onClick={onClose}>
              完成，返回結帳櫃檯
            </Button>
          </div>
        }
      >
        <ReceiptDocument order={receipt.order} variant="screen" />
      </Modal>
      {createPortal(
        <div id={RECEIPT_PRINT_ROOT_ID} aria-hidden="true">
          <ReceiptDocument order={receipt.order} variant="print" />
        </div>,
        document.body
      )}
    </>
  );
}
