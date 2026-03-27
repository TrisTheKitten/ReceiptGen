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
  zoom: number;
  shadowIntensity: number;
  paperTexture: number;
  randomize: boolean;
  extremeMode: boolean;
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
  zoom: 1.0,
  shadowIntensity: 20,
  paperTexture: 12,
  randomize: true,
  extremeMode: false,
  background: 'dark-floor'
};

export const randomizeScannerEffects = (extremeMode: boolean = false): Partial<ScannerEffectOptions> => {
  const random = (min: number, max: number) => Math.random() * (max - min) + min;
  const randomSign = () => Math.random() > 0.5 ? 1 : -1;

  if (extremeMode) {
    return {
      rotation: random(8, 15) * randomSign(),
      perspectiveX: random(10, 15) * randomSign(),
      perspectiveY: random(8, 12) * randomSign(),
      noiseIntensity: random(60, 85),
      vignetteIntensity: random(65, 85),
      warmth: random(-10, 20),
      brightness: random(70, 85),
      contrast: random(140, 160),
      blur: random(0.8, 1.5),
      zoom: random(0.7, 0.9),
      shadowIntensity: random(40, 60),
      paperTexture: random(30, 45)
    };
  }

  return {
    rotation: random(0.5, 4.0) * randomSign(),
    perspectiveX: random(0, 5) * randomSign(),
    perspectiveY: random(0, 4) * randomSign(),
    noiseIntensity: random(12, 35),
    vignetteIntensity: random(30, 65),
    warmth: random(-5, 15),
    brightness: random(92, 100),
    contrast: random(105, 125),
    blur: random(0.2, 0.8),
    zoom: random(0.95, 1.12),
    shadowIntensity: random(15, 45),
    paperTexture: random(10, 25)
  };
};

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export type TemplateStyle = 'thermal' | 'lazada' | 'invoice' | 'tax-invoice';
export type LanguageMode = 'th' | 'th-en';

export interface ReceiptData {
  // Metadata
  templateStyle: TemplateStyle;
  language: LanguageMode;
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
    { id: '1', description: 'H FHรสส้ม12เกรน', quantity: 1, unitPrice: 44.00, discount: 0, total: 44.00 },
    { id: '2', description: 'H FHขนมปังชนิดแผ่น', quantity: 1, unitPrice: 20.00, discount: 0, total: 20.00 },
    { id: '3', description: 'มาม่าออเรียนทัลคิต', quantity: 1, unitPrice: 15.00, discount: 0, total: 15.00 },
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

export const DEFAULT_INVOICE_RECEIPT: ReceiptData = {
  templateStyle: 'invoice',
  language: 'th-en',
  scannedLook: true,
  scannerEffects: { ...DEFAULT_SCANNER_EFFECTS },
  sellerName: 'บริษัท ตัวอย่าง จำกัด',
  sellerAddress: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
  sellerTaxId: '0105500000001',
  sellerPhone: '02-000-0000',
  sellerLogoType: 'none',
  branchCode: '00000',
  posId: '',
  buyerName: 'นาย ทดสอบ ระบบ',
  buyerAddress: '456 ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
  buyerTaxId: '1234567890123',
  billType: BillType.RECEIPT,
  invoiceNumber: 'INV-2026-0001',
  date: new Date().toISOString().split('T')[0],
  items: [
    { id: '1', description: 'บริการออกแบบเว็บไซต์', quantity: 1, unitPrice: 15000.00, discount: 0, total: 15000.00 },
    { id: '2', description: 'บริการพัฒนาระบบ', quantity: 1, unitPrice: 25000.00, discount: 0, total: 25000.00 },
  ],
  subtotal: 40000.00,
  vatRate: 7,
  vatAmount: 2616.82,
  grandTotal: 40000.00,
  savings: 0,
  cashAmount: 40000.00,
  changeAmount: 0,
  memberId: '',
  memberPointsEarned: 0,
  memberPointsTotal: 0,
};

export const DEFAULT_TAX_INVOICE_RECEIPT: ReceiptData = {
  templateStyle: 'tax-invoice',
  language: 'th',
  scannedLook: true,
  scannerEffects: { ...DEFAULT_SCANNER_EFFECTS },
  sellerName: 'บริษัท สองแปดศูนย์สอง จำกัด',
  sellerAddress: '175/5 ตลาดเอเอ็มาร์เก็ตไชน์ ซี 67-68,95-96 ม.3 ต.ดิลมสราย อ.บางบัวทอง จ.นนทบุรี 11110',
  sellerTaxId: '0105546150009',
  sellerPhone: '02-000-0000',
  sellerLogoType: 'none',
  branchCode: 'สำนักงานใหญ่',
  posId: '',
  buyerName: 'บริษัท เจ.ซี.อิสเทิร์น จำกัด (สำนักงานใหญ่)',
  buyerAddress: '23/4 หมู่ 2 ต.ขนงพระ อ.ปากช่อง จ.นครราชสีมา 30450',
  buyerTaxId: '0155350078494',
  billType: BillType.FULL_TAX_INVOICE,
  invoiceNumber: 'IV231225003',
  date: new Date().toISOString().split('T')[0],
  items: [
    { id: '1', description: 'หน้ากากสวัสดิไง', quantity: 200, unitPrice: 10.45, discount: 0, total: 2090.00 },
    { id: '2', description: 'ชิ้นส่วนอิเลคทรอนิคลูรีไนท์คอนโทรล', quantity: 50, unitPrice: 100.64, discount: 0, total: 5032.00 },
    { id: '3', description: 'สติกเกอร์สกู๊ตเตอร์', quantity: 48, unitPrice: 69.97, discount: 0, total: 3358.56 },
    { id: '4', description: 'สติกเกอร์รถคาร์บอนไฟเบอร์', quantity: 50, unitPrice: 66.72, discount: 0, total: 3336.00 },
    { id: '5', description: 'แบตเตอรี่ลิเธียม', quantity: 14, unitPrice: 1019.35, discount: 0, total: 14270.90 },
    { id: '6', description: 'ชุดถังตะปูและลูกตะปู', quantity: 6, unitPrice: 1247.43, discount: 0, total: 7484.58 },
  ],
  subtotal: 35572.04,
  vatRate: 7,
  vatAmount: 2490.04,
  grandTotal: 38062.08,
  grandTotalText: 'สามหมื่นแปดพันหกสิบสองบาทแปดสตางค์',
  savings: 0,
  cashAmount: 38062.08,
  changeAmount: 0,
  memberId: '',
  memberPointsEarned: 0,
  memberPointsTotal: 0,
  authorizedSignatureName: 'อมรรัตน์',
  hasSignature: true,
};
