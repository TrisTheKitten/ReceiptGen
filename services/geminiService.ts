
import { ReceiptData } from "../types";

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

const hydrate711Receipt = (data: any, index: number = 0): Partial<ReceiptData> => {
  let subtotal = 0;
  const items = (data.items || []).map((item: any, idx: number) => {
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const total = quantity * unitPrice;
    subtotal += total;
    
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
      total: total
    };
  });

  const savings = data.savings || 0;
  const grandTotalBeforeVat = subtotal - savings;
  const grandTotal = grandTotalBeforeVat > 0 ? grandTotalBeforeVat : 0;
  const vatAmount = (grandTotal * 7) / 107; 
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
    memberId: `0-${Math.floor(Math.random()*9999)}-${Math.floor(Math.random()*999)}`,
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

const hydrateLazadaReceipt = (data: any, index: number = 0): Partial<ReceiptData> => {
  let subtotal = 0;
  const items = (data.items || []).map((item: any, idx: number) => {
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const total = quantity * unitPrice;
    subtotal += total;

    return {
      id: `gen-laz-${Date.now()}-${index}-${idx}`,
      description: item.description || `Shipping fee for Package FP${Math.floor(Math.random() * 100000000000)}`,
      quantity: quantity,
      unitPrice: unitPrice,
      total: total
    };
  });

  const grandTotal = subtotal;
  const vatAmount = (grandTotal * 7) / 107; 
  
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

export const generateReceiptData = async (
  category: string,
  currentData: ReceiptData,
  apiKey: string
): Promise<Partial<ReceiptData> | null> => {
  try {
    const { GoogleGenAI, Type } = await loadGeminiModule();
    const { receiptSchema } = buildSchemas(Type);
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    if (category === 'lazada') {
        prompt = `Generate a JSON for a Lazada Thailand Logistics receipt.
        Items: 1-2 items. Usually "Shipping fee for Package [Random ID]". Occasional product name.
        Prices: Realistic shipping fees (25.00, 45.00) or product prices.
        Context: Buyer name should be a realistic Thai name or English name used in Thailand. Buyer Address should be a realistic Thai address.`;
    } else {
        prompt = `Generate a JSON for a Thai 7-Eleven receipt.
        Items: 4-8 realistic items sold in Thai 7-Eleven (snacks, drinks, ready meals).
        Prices: Realistic Thai Baht prices.
        Context: Buyer name should be a short Thai nickname.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
        temperature: 1.0,
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const rawData = JSON.parse(text);
    return category === 'lazada' ? hydrateLazadaReceipt(rawData) : hydrate711Receipt(rawData);

  } catch (error) {
    return null;
  }
};

export const generateReceiptBatch = async (
  category: string,
  count: number,
  apiKey: string
): Promise<Partial<ReceiptData>[]> => {
  try {
    const { GoogleGenAI, Type } = await loadGeminiModule();
    const { receiptBatchSchema } = buildSchemas(Type);
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    if (category === 'lazada') {
        prompt = `Generate an array of ${count} unique Lazada Thailand receipts.
        Items: Mostly "Shipping fee for Package..." but vary the package IDs. Some can be actual products.
        Context: Varied Thai and Expat buyer names and addresses.`;
    } else {
        prompt = `Generate an array of ${count} unique Thai 7-Eleven receipts.
        Items: Varied realistic items for each receipt.
        Context: Varied Thai buyer names.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptBatchSchema,
        temperature: 1.2,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const rawData = JSON.parse(text);
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item, idx) => category === 'lazada' ? hydrateLazadaReceipt(item, idx) : hydrate711Receipt(item, idx));

  } catch (error) {
    return [];
  }
};
