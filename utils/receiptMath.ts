import { LineItem } from '../types';

const VAT_BASE_PERCENT = 100;

export const calculateItemTotal = (quantity: number, unitPrice: number) => quantity * unitPrice;

export const calculateSubtotal = (items: LineItem[]) =>
  items.reduce((acc, item) => acc + calculateItemTotal(item.quantity, item.unitPrice), 0);

export const calculateGrandTotal = (subtotal: number, savings: number) =>
  Math.max(0, subtotal - savings);

export const calculateVatAmount = (grandTotal: number, vatRate: number) =>
  (grandTotal * vatRate) / (VAT_BASE_PERCENT + vatRate);

export const calculateTotals = (items: LineItem[], savings: number, vatRate: number) => {
  const subtotal = calculateSubtotal(items);
  const grandTotal = calculateGrandTotal(subtotal, savings);
  const vatAmount = calculateVatAmount(grandTotal, vatRate);
  return { subtotal, grandTotal, vatAmount };
};
