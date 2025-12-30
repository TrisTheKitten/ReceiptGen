
import React from 'react';
import { ReceiptData } from '../types';
import { ThermalReceipt } from './ThermalReceipt';
import { LazadaReceipt } from './LazadaReceipt';

interface Props {
  data: ReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export const ReceiptPreview: React.FC<Props> = ({ data, previewRef }) => {
  return (
    <div ref={previewRef}>
        {data.templateStyle === 'lazada' ? (
            <LazadaReceipt data={data} />
        ) : (
            <ThermalReceipt data={data} />
        )}
    </div>
  );
};
