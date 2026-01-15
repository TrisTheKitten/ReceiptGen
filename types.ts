export enum BillType {
  TAX_INVOICE = 'Tax Invoice (ใบกำกับภาษี)',
  RECEIPT = 'Receipt (ใบเสร็จรับเงิน)',
  FULL_TAX_INVOICE = 'Tax Invoice / Receipt (ใบกำกับภาษี/ใบเสร็จรับเงิน)',
  CASH_RECEIPT = 'Cash Receipt (บิลเงินสด)'
}

export type BackgroundStyle = 'none' | 'dark-floor' | 'wood' | 'marble' | 'concrete';

export interface ScannerEffectOptions {
  enabled: boolean;
  rotation: number;
  perspectiveX: number;
  perspectiveY: number;
  noiseIntensity: number;
  vignetteIntensity: number;
  warmth: number;
  brightness: number;
  contrast: number;
  blur: number;
  shadowIntensity: number;
  paperTexture: number;
  randomize: boolean;
  background: BackgroundStyle;
}

export const DEFAULT_SCANNER_EFFECTS: ScannerEffectOptions = {
  enabled: true,
  rotation: 0,
  perspectiveX: 0,
  perspectiveY: 0,
  noiseIntensity: 15,
  vignetteIntensity: 40,
  warmth: 5,
  brightness: 96,
  contrast: 110,
  blur: 0.3,
  shadowIntensity: 20,
  paperTexture: 12,
  randomize: true,
  background: 'dark-floor'
};

export const randomizeScannerEffects = (): Partial<ScannerEffectOptions> => {
  const random = (min: number, max: number) => Math.random() * (max - min) + min;
  const randomSign = () => Math.random() > 0.5 ? 1 : -1;
  
  return {
    rotation: random(0.3, 2.5) * randomSign(),
    perspectiveX: random(0, 3) * randomSign(),
    perspectiveY: random(0, 2) * randomSign(),
    noiseIntensity: random(8, 25),
    vignetteIntensity: random(25, 55),
    warmth: random(-5, 15),
    brightness: random(92, 100),
    contrast: random(105, 125),
    blur: random(0.1, 0.5),
    shadowIntensity: random(10, 35),
    paperTexture: random(8, 20)
  };
};

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  // Metadata
  templateStyle: 'thermal' | 'lazada'; 
  language: 'th';
  scannedLook: boolean;
  scannerEffects: ScannerEffectOptions;
  
  // Header / Seller
  sellerName: string; 
  sellerAddress: string;
  sellerTaxId: string;
  sellerPhone: string;
  sellerLogoType: 'none' | 'cpall' | 'lazada';
  branchCode: string; 
  posId: string; 

  // Buyer / Member
  buyerName: string;
  buyerAddress?: string;
  buyerTaxId?: string;
  
  // Invoice Details
  billType: BillType;
  invoiceNumber: string;
  refOrderNumber?: string; 
  date: string; // YYYY-MM-DD
  
  // Content
  items: LineItem[];
  
  // Totals
  subtotal: number;
  vatRate: number; 
  vatAmount: number;
  grandTotal: number;
  grandTotalText?: string;
  savings: number; 
  
  // Payment Details
  cashAmount: number;
  changeAmount: number;

  // Footer / Signature
  authorizedSignatureName?: string;
  hasSignature?: boolean;
  
  // Membership & Rights 
  memberId: string;
  memberPointsEarned: number;
  memberPointsTotal: number;
  
  rightsEarned?: number;
  rightsUsed?: number;
  rightsRemaining?: number;
  
  couponsEarned?: number;
  couponsUsed?: number;
  couponsRemaining?: number;
}

export const DEFAULT_RECEIPT: ReceiptData = {
  templateStyle: 'thermal',
  language: 'th',
  scannedLook: true,
  scannerEffects: { ...DEFAULT_SCANNER_EFFECTS },
  sellerName: 'CP ALL, 7-Eleven',
  sellerAddress: 'นวมินทร์ ซ.3(เลขจบ 2066)',
  sellerTaxId: '0107542000011',
  sellerPhone: '02-123-4567',
  sellerLogoType: 'none',
  branchCode: '10893',
  posId: 'E05112000204317',
  buyerName: 'คุณนิศา',
  billType: BillType.TAX_INVOICE,
  invoiceNumber: '7895351',
  date: new Date().toISOString().split('T')[0],
  items: [
    { id: '1', description: 'H FHรสส้ม12เกรน', quantity: 1, unitPrice: 44.00, total: 44.00 },
    { id: '2', description: 'H FHขนมปังชนิดแผ่น', quantity: 1, unitPrice: 20.00, total: 20.00 },
    { id: '3', description: 'มาม่าออเรียนทัลคิต', quantity: 1, unitPrice: 15.00, total: 15.00 },
  ],
  subtotal: 79.00,
  vatRate: 7,
  vatAmount: 5.17,
  grandTotal: 79.00,
  savings: 0.00,
  cashAmount: 100.00,
  changeAmount: 21.00,
  memberId: '0-2826-777',
  memberPointsEarned: 60,
  memberPointsTotal: 16129,
  rightsEarned: 0,
  rightsUsed: 0,
  rightsRemaining: 0,
  couponsEarned: 0,
  couponsUsed: 0,
  couponsRemaining: 0
};
