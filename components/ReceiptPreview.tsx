import React from 'react';
import { ReceiptData } from '../types';
import { ThermalReceipt } from './ThermalReceipt';
import { LazadaReceipt } from './LazadaReceipt';
import { ScannerEffects } from './ScannerEffects';

interface Props {
  data: ReceiptData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  instanceSeed?: number;
}

export const ReceiptPreview: React.FC<Props> = ({ data, previewRef, instanceSeed }) => {
  return (
    <div ref={previewRef}>
      <ScannerEffects effects={data.scannerEffects} instanceSeed={instanceSeed}>
        {data.templateStyle === 'lazada' ? (
            <LazadaReceipt data={data} />
        ) : (
            <ThermalReceipt data={data} />
        )}
      </ScannerEffects>
    </div>
  );
};
