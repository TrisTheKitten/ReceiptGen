import React from 'react';
import { ReceiptData } from '../types';
import { ThermalReceipt } from './ThermalReceipt';
import { LazadaReceipt } from './LazadaReceipt';
import { InvoiceReceipt } from './InvoiceReceipt';
import { TaxInvoiceReceipt } from './TaxInvoiceReceipt';
import { ScannerEffects } from './ScannerEffects';

interface Props {
  data: ReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  instanceSeed?: number;
}

const TemplateRenderer = ({ data }: { data: ReceiptData }) => {
  switch (data.templateStyle) {
    case 'tax-invoice': return <TaxInvoiceReceipt data={data} />;
    case 'invoice': return <InvoiceReceipt data={data} />;
    case 'lazada': return <LazadaReceipt data={data} />;
    default: return <ThermalReceipt data={data} />;
  }
};

export const ReceiptPreview: React.FC<Props> = ({ data, previewRef, instanceSeed }) => {
  return (
    <div ref={previewRef}>
      <ScannerEffects effects={data.scannerEffects} instanceSeed={instanceSeed}>
        <TemplateRenderer data={data} />
      </ScannerEffects>
    </div>
  );
};
