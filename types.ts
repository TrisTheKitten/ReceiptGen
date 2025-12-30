
export enum BillType {
  TAX_INVOICE = 'Tax Invoice (ใบกำกับภาษี)',
  RECEIPT = 'Receipt (ใบเสร็จรับเงิน)',
  FULL_TAX_INVOICE = 'Tax Invoice / Receipt (ใบกำกับภาษี/ใบเสร็จรับเงิน)',
  CASH_RECEIPT = 'Cash Receipt (บิลเงินสด)'
}

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
