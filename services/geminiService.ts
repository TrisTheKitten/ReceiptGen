
import { ReceiptData, LanguageMode, DEFAULT_RECEIPT, DEFAULT_INVOICE_RECEIPT, DEFAULT_TAX_INVOICE_RECEIPT } from "../types";
import { calculateItemTotal, calculateTotals } from "../utils/receiptMath";

type GeminiModule = typeof import("@google/genai");
type Schema = import("@google/genai").Schema;

let geminiModulePromise: Promise<GeminiModule> | null = null;

const loadGeminiModule = () => {
  if (!geminiModulePromise) {
    geminiModulePromise = import("@google/genai");
  }
  return geminiModulePromise;
};

let schemaCache: {
  receiptSchema: Schema;
  receiptBatchSchema: Schema;
} | null = null;

const buildSchemas = (Type: GeminiModule["Type"]) => {
  if (schemaCache) return schemaCache;

  const baseReceiptProperties = {
    sellerName: { type: Type.STRING },
    sellerAddress: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
        }
      }
    },
    savings: { type: Type.NUMBER },
    buyerName: { type: Type.STRING },
    buyerAddress: { type: Type.STRING },
  };

  const receiptSchema = {
    type: Type.OBJECT,
    properties: baseReceiptProperties,
    required: ["items", "buyerName"]
  };

  const receiptBatchSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: baseReceiptProperties,
      required: ["items", "buyerName"]
    }
  };

  schemaCache = { receiptSchema, receiptBatchSchema };
  return schemaCache;
};

const HYDRATE_PREFIXES = ["H ", "H FH", "A ", ""];

type GeneratedItemInput = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
};

type GeneratedReceiptInput = {
  sellerName?: string;
  sellerAddress?: string;
  items?: GeneratedItemInput[];
  savings?: number;
  buyerName?: string;
  buyerAddress?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const toOptionalText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeItems = (items: unknown): GeneratedItemInput[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!isRecord(item)) return null;
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const unitPrice = Math.max(0, toNumber(item.unitPrice, 0));
      return {
        description: toOptionalText(item.description),
        quantity,
        unitPrice,
      };
    })
    .filter((item): item is GeneratedItemInput => Boolean(item));
};

const normalizeReceiptInput = (value: unknown): GeneratedReceiptInput | null => {
  if (!isRecord(value)) return null;
  return {
    sellerName: toOptionalText(value.sellerName),
    sellerAddress: toOptionalText(value.sellerAddress),
    items: normalizeItems(value.items),
    savings: Math.max(0, toNumber(value.savings, 0)),
    buyerName: toOptionalText(value.buyerName),
    buyerAddress: toOptionalText(value.buyerAddress),
  };
};

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response JSON.", error);
    return null;
  }
};

const hydrate711Receipt = (data: GeneratedReceiptInput, index: number = 0): Partial<ReceiptData> => {
  const items = (data.items || []).map((item, idx: number) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = item.unitPrice ?? 0;
    const total = calculateItemTotal(quantity, unitPrice);

    let desc = item.description || "Item";
    // Add realistic 7-11 prefixes if not present and not already prefixed
    if (!desc.match(/^[A-Z]/)) {
      const prefix = HYDRATE_PREFIXES[Math.floor(Math.random() * HYDRATE_PREFIXES.length)];
      desc = prefix + desc;
    }

    return {
      id: `gen-711-${Date.now()}-${index}-${idx}`,
      description: desc,
      quantity: quantity,
      unitPrice: unitPrice,
      discount: 0,
      total: total
    };
  });

  const savings = data.savings || 0;
  const vatRate = DEFAULT_RECEIPT.vatRate;
  const { subtotal, grandTotal, vatAmount } = calculateTotals(items, savings, vatRate);
  const cashAmount = Math.ceil(grandTotal / 100) * 100 + 2;
  const changeAmount = cashAmount - grandTotal;

  const branchCode = String(Math.floor(Math.random() * 90000) + 10000);
  const posId = `E0${Math.floor(Math.random() * 999999999999)}`;
  const invoiceNumber = `${Math.floor(Math.random() * 9000000) + 1000000}`; // 7-digit

  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 7));
  const dateStr = d.toISOString().split('T')[0];

  return {
    templateStyle: 'thermal',
    sellerName: "CP ALL, 7-Eleven",
    sellerAddress: data.sellerAddress || "สาขาตัวอย่าง (0000)",
    sellerTaxId: "0107542000011",
    sellerPhone: "02-826-7777",
    sellerLogoType: 'none',
    branchCode,
    posId,
    buyerName: data.buyerName || "ลูกค้าทั่วไป",
    invoiceNumber,
    date: dateStr,
    items,
    subtotal,
    vatAmount,
    grandTotal,
    savings,
    cashAmount,
    changeAmount,
    memberId: `0-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 999)}`,
    memberPointsEarned: Math.floor(grandTotal / 10),
    memberPointsTotal: Math.floor(Math.random() * 20000),
    rightsEarned: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
    rightsUsed: 0,
    rightsRemaining: Math.floor(Math.random() * 5),
    couponsEarned: Math.random() > 0.5 ? 1 : 0,
    couponsUsed: 0,
    couponsRemaining: Math.random() > 0.5 ? 1 : 0,
  };
};

const hydrateLazadaReceipt = (data: GeneratedReceiptInput, index: number = 0): Partial<ReceiptData> => {
  const items = (data.items || []).map((item, idx: number) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = item.unitPrice ?? 0;
    const total = calculateItemTotal(quantity, unitPrice);

    return {
      id: `gen-laz-${Date.now()}-${index}-${idx}`,
      description: item.description || `Shipping fee for Package FP${Math.floor(Math.random() * 100000000000)}`,
      quantity: quantity,
      unitPrice: unitPrice,
      discount: 0,
      total: total
    };
  });

  const vatRate = DEFAULT_RECEIPT.vatRate;
  const { subtotal, grandTotal, vatAmount } = calculateTotals(items, 0, vatRate);

  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 14));
  const dateStr = d.toISOString().split('T')[0];

  return {
    templateStyle: 'lazada',
    sellerName: "Lazada Express Limited",
    sellerAddress: "No. 689, Bhiraj Tower, 29th floor, Soi Sukhumvit 35, Sukhumvit Road, North Klongton, Vadhana, Bangkok 10110 Thailand.",
    sellerTaxId: "0105558080778",
    branchCode: "00000 (Head Office)",
    sellerPhone: "02-018-0200",
    sellerLogoType: 'lazada',

    buyerName: data.buyerName || "Mr. Customer",
    buyerAddress: data.buyerAddress || "123 Condo One, Sukhumvit 50, Klongtoey, Bangkok 10110",

    invoiceNumber: `LM${Math.floor(Math.random() * 10000000000)}`,
    refOrderNumber: `96${Math.floor(Math.random() * 100000000000)}`,
    date: dateStr,

    items,
    subtotal,
    vatAmount,
    grandTotal,
    savings: 0,
    cashAmount: grandTotal,
    changeAmount: 0,

    memberId: '',
    memberPointsEarned: 0,
    memberPointsTotal: 0,
    rightsEarned: 0,
    rightsUsed: 0,
    rightsRemaining: 0,
    couponsEarned: 0,
    couponsUsed: 0,
    couponsRemaining: 0
  };
};

const THAI_FALLBACK_NAMES = [
  'นาย วิทยา สุขสมบูรณ์', 'นางสาว พิมพ์ใจ รัตนวงศ์', 'นาย ธนพล เจริญกิจ',
  'นางสาว กัญญา ศรีสุวรรณ', 'นาย อภิชาติ พงษ์ประเสริฐ', 'นาง ปราณี วิไลลักษณ์',
  'นาย ณัฐพงษ์ จันทร์แก้ว', 'นางสาว สุภาวดี แสงทอง', 'นาย กิตติพงศ์ โชคดี',
  'นางสาว รัชนก ใจเย็น',
];

const ENGLISH_FALLBACK_NAMES = [
  'Mr. Daniel Morrison', 'Ms. Sarah Patel', 'Mr. Kevin Nakamura',
  'Ms. Linda Johansson', 'Mr. Robert Fernandez', 'Ms. Emily Chang',
  'Mr. Marcus Webb', 'Ms. Priya Sharma', 'Mr. Thomas Keller',
  'Ms. Natalie Brooks',
];

const THAI_FALLBACK_COMPANIES = [
  'บริษัท สยามเทค จำกัด', 'บริษัท เอเชีย โซลูชั่นส์ จำกัด',
  'บริษัท พิมานกรุ๊ป จำกัด', 'บริษัท ไทยสร้างโลก จำกัด',
  'บริษัท ทีเอสพี เทรดดิ้ง จำกัด', 'บริษัท วายุกรุ๊ป จำกัด',
];

const ENGLISH_FALLBACK_COMPANIES = [
  'Pinnacle Solutions Co., Ltd.', 'Vertex Digital Co., Ltd.',
  'Horizon Consulting Co., Ltd.', 'Summit Engineering Co., Ltd.',
  'Pacific Trade Co., Ltd.', 'Skyline Holdings Co., Ltd.',
];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const hydrateInvoiceReceipt = (data: GeneratedReceiptInput, index: number = 0, language: LanguageMode = 'th-en'): Partial<ReceiptData> => {
  const isThaiOnly = language === 'th';
  const fallbackDesc = isThaiOnly ? 'บริการ' : 'Service';

  const items = (data.items || []).map((item, idx: number) => {
    const quantity = item.quantity ?? 1;
    const unitPrice = item.unitPrice ?? 0;
    const total = calculateItemTotal(quantity, unitPrice);

    return {
      id: `gen-inv-${Date.now()}-${index}-${idx}`,
      description: item.description || fallbackDesc,
      quantity,
      unitPrice,
      discount: 0,
      total
    };
  });

  const vatRate = DEFAULT_INVOICE_RECEIPT.vatRate;
  const { subtotal, grandTotal, vatAmount } = calculateTotals(items, 0, vatRate);

  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 30));
  const dateStr = d.toISOString().split('T')[0];
  const year = d.getFullYear();
  const seqNum = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');

  const fallbackName = isThaiOnly
    ? pickRandom(THAI_FALLBACK_NAMES)
    : pickRandom(ENGLISH_FALLBACK_NAMES);

  const fallbackCompany = isThaiOnly
    ? pickRandom(THAI_FALLBACK_COMPANIES)
    : pickRandom(ENGLISH_FALLBACK_COMPANIES);

  return {
    templateStyle: 'invoice',
    language,
    sellerName: data.sellerName || fallbackCompany,
    sellerAddress: data.sellerAddress || DEFAULT_INVOICE_RECEIPT.sellerAddress,
    sellerTaxId: `0${Math.floor(Math.random() * 900000000000) + 100000000000}`,
    sellerPhone: DEFAULT_INVOICE_RECEIPT.sellerPhone,
    sellerLogoType: 'none',
    branchCode: '00000',
    posId: '',
    buyerName: data.buyerName || fallbackName,
    buyerAddress: data.buyerAddress || DEFAULT_INVOICE_RECEIPT.buyerAddress,
    buyerTaxId: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
    invoiceNumber: `INV-${year}-${seqNum}`,
    date: dateStr,
    items,
    subtotal,
    vatAmount,
    grandTotal,
    savings: 0,
    cashAmount: grandTotal,
    changeAmount: 0,
    memberId: '',
    memberPointsEarned: 0,
    memberPointsTotal: 0,
  };
};

const THAI_FALLBACK_ADDRESSES = [
  '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
  '89 ซอยลาดพร้าว 15 แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
  '456/78 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
  '33 หมู่ 5 ถนนพหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี 12120',
  '77/3 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
];

const ENGLISH_FALLBACK_ADDRESSES = [
  '123/45 Sukhumvit Road, Klongtoey, Bangkok 10110',
  '89 Soi Ladprao 15, Chatuchak, Bangkok 10900',
  '456/78 Petchburi Road, Ratchathewi, Bangkok 10400',
  '33 Moo 5, Phaholyothin Rd, Klong Luang, Pathum Thani 12120',
  '77/3 Ramkhamhaeng Rd, Bangkapi, Bangkok 10240',
];

const THAI_SIGNATURE_NAMES = [
  'อมรรัตน์', 'สุภาพร', 'วิภาดา', 'ณัฐวุฒิ', 'ปิยะ',
  'กัลยา', 'ชนิดา', 'ธนวัฒน์', 'พรรณี', 'สมศักดิ์',
];

const ENGLISH_SIGNATURE_NAMES = [
  'Amornrat', 'Supaporn', 'Wipada', 'Nattawut', 'Piya',
  'Kanlaya', 'Chanida', 'Thanawat', 'Pannee', 'Somsak',
];

const THAI_PRODUCT_FALLBACKS = [
  'อุปกรณ์ไฟฟ้า', 'วัสดุก่อสร้าง', 'ชิ้นส่วนอิเล็กทรอนิกส์',
  'สติกเกอร์พิมพ์', 'แบตเตอรี่ลิเธียม', 'ชุดเครื่องมือช่าง',
  'หน้ากากอนามัย', 'กระดาษพิมพ์ A4', 'หมึกพิมพ์เลเซอร์',
  'สายไฟอุตสาหกรรม', 'ท่อ PVC', 'น็อตสแตนเลส',
];

const ENGLISH_PRODUCT_FALLBACKS = [
  'Electrical Equipment', 'Construction Materials', 'Electronic Components',
  'Printed Stickers', 'Lithium Battery Pack', 'Tool Kit Set',
  'Face Masks', 'A4 Printing Paper', 'Laser Printer Ink',
  'Industrial Wiring', 'PVC Pipes', 'Stainless Steel Bolts',
];

const numberToThaiText = (amount: number): string => {
  const units = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertIntPart = (n: number): string => {
    if (n === 0) return 'ศูนย์';
    let result = '';
    const str = Math.floor(n).toString();
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - i - 1;
      if (digit === 0) continue;
      if (pos === 1 && digit === 1) { result += 'สิบ'; continue; }
      if (pos === 1 && digit === 2) { result += 'ยี่สิบ'; continue; }
      if (pos === 0 && digit === 1 && len > 1) { result += 'เอ็ด'; continue; }
      result += units[digit] + positions[pos];
    }
    return result;
  };

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  let text = convertIntPart(intPart) + 'บาท';
  if (decPart > 0) {
    text += convertIntPart(decPart) + 'สตางค์';
  } else {
    text += 'ถ้วน';
  }
  return text;
};

const hydrateTaxInvoiceReceipt = (data: GeneratedReceiptInput, index: number = 0, language: LanguageMode = 'th'): Partial<ReceiptData> => {
  const isThaiOnly = language === 'th';
  const fallbackDesc = isThaiOnly ? pickRandom(THAI_PRODUCT_FALLBACKS) : pickRandom(ENGLISH_PRODUCT_FALLBACKS);

  const items = (data.items || []).map((item, idx: number) => {
    const quantity = Math.max(1, item.quantity ?? Math.floor(Math.random() * 200) + 1);
    const unitPrice = Math.max(0.01, item.unitPrice ?? Math.random() * 2000 + 5);
    const total = calculateItemTotal(quantity, unitPrice);

    return {
      id: `gen-taxinv-${Date.now()}-${index}-${idx}`,
      description: item.description || fallbackDesc,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      discount: 0,
      total
    };
  });

  const vatRate = DEFAULT_TAX_INVOICE_RECEIPT.vatRate;
  const { subtotal, grandTotal, vatAmount } = calculateTotals(items, 0, vatRate);

  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 60));
  const dateStr = d.toISOString().split('T')[0];
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seqNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

  const fallbackName = isThaiOnly
    ? pickRandom(THAI_FALLBACK_NAMES)
    : pickRandom(ENGLISH_FALLBACK_NAMES);

  const fallbackCompany = isThaiOnly
    ? pickRandom(THAI_FALLBACK_COMPANIES)
    : pickRandom(ENGLISH_FALLBACK_COMPANIES);

  const fallbackAddress = isThaiOnly
    ? pickRandom(THAI_FALLBACK_ADDRESSES)
    : pickRandom(ENGLISH_FALLBACK_ADDRESSES);

  const sigName = isThaiOnly
    ? pickRandom(THAI_SIGNATURE_NAMES)
    : pickRandom(ENGLISH_SIGNATURE_NAMES);

  return {
    templateStyle: 'tax-invoice',
    language,
    sellerName: data.sellerName || fallbackCompany,
    sellerAddress: data.sellerAddress || fallbackAddress,
    sellerTaxId: `0${Math.floor(Math.random() * 900000000000) + 100000000000}`,
    sellerPhone: DEFAULT_TAX_INVOICE_RECEIPT.sellerPhone,
    sellerLogoType: 'none',
    branchCode: isThaiOnly ? 'สำนักงานใหญ่' : 'Head Office',
    posId: '',
    buyerName: data.buyerName || `${fallbackName} (${isThaiOnly ? 'สำนักงานใหญ่' : 'Head Office'})`,
    buyerAddress: data.buyerAddress || pickRandom(isThaiOnly ? THAI_FALLBACK_ADDRESSES : ENGLISH_FALLBACK_ADDRESSES),
    buyerTaxId: `0${Math.floor(Math.random() * 900000000000) + 100000000000}`,
    invoiceNumber: `IV${yy}${mm}${dd}${seqNum}`,
    date: dateStr,
    items,
    subtotal,
    vatAmount,
    grandTotal,
    grandTotalText: numberToThaiText(grandTotal),
    savings: 0,
    cashAmount: grandTotal,
    changeAmount: 0,
    memberId: '',
    memberPointsEarned: 0,
    memberPointsTotal: 0,
    authorizedSignatureName: sigName,
    hasSignature: true,
  };
};

const buildTaxInvoicePrompt = (language: LanguageMode, count?: number): string => {
  const isThaiOnly = language === 'th';
  const countPrefix = count ? `an array of ${count} unique` : 'a JSON for a';

  if (isThaiOnly) {
    return `Generate ${countPrefix} Thai tax invoice receipt${count ? 's' : ''} for physical products/goods.
      CRITICAL RULES:
      1. sellerName and buyerName MUST be completely different and unrelated Thai company names.
      2. ALL names must be in Thai only — no English.
      3. sellerName: "บริษัท [creative name] จำกัด". Vary widely.
      4. buyerName: "บริษัท [different name] จำกัด (สำนักงานใหญ่)". Vary widely.
      5. DO NOT use "สมชาย". Never repeat names.
      6. Items: 3-8 physical products/goods. Not services. Written in Thai.
      Example items: หน้ากากอนามัย, ชิ้นส่วนอิเล็กทรอนิกส์, สติกเกอร์พิมพ์ลาย, แบตเตอรี่ลิเธียม, ชุดเครื่องมือช่าง, อุปกรณ์ไฟฟ้า, น็อตสแตนเลส.
      Quantities: Varied (1-500 units per item).
      Prices: Realistic (5-5000 baht per unit).
      Address: Realistic Thai addresses for both seller and buyer, different provinces.`;
  }

  return `Generate ${countPrefix} English tax invoice receipt${count ? 's' : ''} for physical products/goods.
    CRITICAL RULES:
    1. sellerName and buyerName MUST be completely different and unrelated English company names.
    2. ALL names must be in English only.
    3. sellerName: "[Name] Co., Ltd." or "[Name] Trading Co., Ltd.". Vary widely.
    4. buyerName: "[Different Name] Co., Ltd. (Head Office)". Vary widely.
    5. Never repeat names.
    6. Items: 3-8 physical products/goods. Not services. Written in English.
    Example items: Face Masks, Electronic Components, Printed Stickers, Lithium Batteries, Tool Kits, Electrical Equipment, Stainless Steel Bolts.
    Quantities: Varied (1-500 units per item).
    Prices: Realistic Thai Baht (5-5000 per unit).
    Address: Realistic Thai addresses in English for both seller and buyer.`;
};

const buildInvoicePrompt = (language: LanguageMode, count?: number): string => {
  const isThaiOnly = language === 'th';
  const countPrefix = count ? `an array of ${count} unique` : 'a JSON for a';

  if (isThaiOnly) {
    return `Generate ${countPrefix} Thai business invoice receipt${count ? 's' : ''}.
      CRITICAL RULES:
      1. The seller company name (sellerName) and buyer name (buyerName) MUST be completely different and unrelated.
      2. ALL names must be in Thai only — no English names whatsoever.
      3. sellerName must be a Thai company name like "บริษัท [name] จำกัด". Use varied, creative company names.
      4. buyerName must be a Thai full name with title (นาย/นาง/นางสาว) + first name + surname.
      5. DO NOT use "สมชาย" (Somchai). Never repeat any name across entries.
      Example seller names: บริษัท สยามเทค จำกัด, บริษัท พิมานกรุ๊ป จำกัด, บริษัท เอเชียโซลูชั่นส์ จำกัด, บริษัท ไทยสร้างโลก จำกัด.
      Example buyer names: นาย ภูวดล สิริมงคล, นางสาว จิราภรณ์ ทองประดิษฐ์, นาย ศุภกิจ พลายงาม, นาง ดวงใจ เลิศวิทยา.
      Items: 1-3 items. Professional services or products written in Thai.
      Example items: บริการออกแบบกราฟิก, งานพัฒนาแอปพลิเคชัน, ค่าที่ปรึกษาด้านการตลาด, ค่าบำรุงรักษาระบบ.
      Prices: Realistic Thai Baht prices (5000-100000).
      Context: Buyer address should be a realistic Thai address. Seller address should be a different Thai company address.`;
  }

  return `Generate ${countPrefix} Thai business invoice receipt${count ? 's' : ''}.
    CRITICAL RULES:
    1. The seller company name (sellerName) and buyer name (buyerName) MUST be completely different and unrelated.
    2. ALL names must be in English only — no Thai names whatsoever.
    3. sellerName must be an English-style company name like "[Name] Co., Ltd." or "[Name] Solutions Co., Ltd.". Use varied, creative company names.
    4. buyerName must be an English full name with title (Mr./Ms./Mrs.) + first name + surname.
    5. DO NOT repeat any name across entries.
    Example seller names: Pinnacle Solutions Co., Ltd., Vertex Digital Co., Ltd., Horizon Consulting Co., Ltd., Summit Engineering Co., Ltd.
    Example buyer names: Mr. Alexander Whitfield, Ms. Priya Nantakarn, Mr. Kenji Watanabe, Mrs. Sofia Lindqvist, Mr. David Okonkwo, Ms. Rachel Thornton.
    Items: 1-3 items. Professional services or products written in English.
    Example items: Website Development, Marketing Consultation, Graphic Design Services, Annual Software License, IT Infrastructure Setup, Content Writing Package.
    Prices: Realistic Thai Baht prices (5000-100000).
    Context: Buyer address should be a realistic Bangkok address written in English. Seller address should be a different Thai company address in English.`;
};

export const generateReceiptData = async (
  category: string,
  currentData: ReceiptData,
  apiKey: string,
  language: LanguageMode = 'th-en'
): Promise<Partial<ReceiptData> | null> => {
  try {
    const { GoogleGenAI, Type } = await loadGeminiModule();
    const { receiptSchema } = buildSchemas(Type);
    const ai = new GoogleGenAI({ apiKey });
    const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview";

    let prompt = "";
    if (category === 'lazada') {
      prompt = `Generate a JSON for a Lazada Thailand Logistics receipt.
        Items: 1-2 items. Usually "Shipping fee for Package [Random ID]". Occasional product name.
        Prices: Realistic shipping fees (25.00, 45.00) or product prices.
        Context: Buyer name should be a realistic Thai name or English name used in Thailand. Buyer Address should be a realistic Thai address.`;
    } else if (category === 'tax-invoice') {
      prompt = buildTaxInvoicePrompt(language);
    } else if (category === 'invoice') {
      prompt = buildInvoicePrompt(language);
    } else {
      prompt = `Generate a JSON for a Thai 7-Eleven receipt.
        Items: 4-8 realistic items sold in Thai 7-Eleven (snacks, drinks, ready meals).
        Prices: Realistic Thai Baht prices.
        Context: Buyer name should be a short Thai nickname.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
        temperature: 1.0,
      },
    });

    const text = response.text;
    if (!text) return null;

    const rawData = safeJsonParse(text);
    const parsed = normalizeReceiptInput(rawData);
    if (!parsed) {
      console.warn("Gemini response did not match expected schema.");
      return null;
    }

    return category === 'lazada'
      ? hydrateLazadaReceipt(parsed)
      : category === 'tax-invoice'
        ? hydrateTaxInvoiceReceipt(parsed, 0, language)
        : category === 'invoice'
          ? hydrateInvoiceReceipt(parsed, 0, language)
          : hydrate711Receipt(parsed);

  } catch (error) {
    console.error("Gemini receipt generation failed.", error);
    return null;
  }
};

export const generateReceiptBatch = async (
  category: string,
  count: number,
  apiKey: string,
  language: LanguageMode = 'th-en'
): Promise<Partial<ReceiptData>[]> => {
  try {
    const { GoogleGenAI, Type } = await loadGeminiModule();
    const { receiptBatchSchema } = buildSchemas(Type);
    const ai = new GoogleGenAI({ apiKey });
    const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-flash-preview";

    let prompt = "";
    if (category === 'lazada') {
      prompt = `Generate an array of ${count} unique Lazada Thailand receipts.
        Items: Mostly "Shipping fee for Package..." but vary the package IDs. Some can be actual products.
        Context: Varied Thai and Expat buyer names and addresses.`;
    } else if (category === 'tax-invoice') {
      prompt = buildTaxInvoicePrompt(language, count);
    } else if (category === 'invoice') {
      prompt = buildInvoicePrompt(language, count);
    } else {
      prompt = `Generate an array of ${count} unique Thai 7-Eleven receipts.
        Items: Varied realistic items for each receipt.
        Context: Varied Thai buyer names.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptBatchSchema,
        temperature: 1.2,
      },
    });

    const text = response.text;
    if (!text) return [];

    const rawData = safeJsonParse(text);
    if (!Array.isArray(rawData)) {
      console.warn("Gemini batch response was not an array.");
      return [];
    }

    const normalizedItems = rawData
      .map(normalizeReceiptInput)
      .filter((item): item is GeneratedReceiptInput => Boolean(item));

    if (normalizedItems.length !== rawData.length) {
      console.warn("Some Gemini batch items did not match expected schema.");
    }

    return normalizedItems.map((item, idx) =>
      category === 'lazada'
        ? hydrateLazadaReceipt(item, idx)
        : category === 'tax-invoice'
          ? hydrateTaxInvoiceReceipt(item, idx, language)
          : category === 'invoice'
            ? hydrateInvoiceReceipt(item, idx, language)
            : hydrate711Receipt(item, idx)
    );

  } catch (error) {
    console.error("Gemini batch generation failed.", error);
    return [];
  }
};
