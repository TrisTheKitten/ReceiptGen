
import React from 'react';
import { ReceiptData } from '../types';
import { sanitizeText } from '../utils/sanitize';

const LABEL = {
    'th': {
        pageTitle: 'ใบกำกับภาษี/ใบเสร็จรับเงิน',
        pageTitleSub: 'Tax Invoice/Receipt.',
        documentType: 'เอกสารออกเป็นชุด',
        headOffice: 'สำนักงานใหญ่',
        taxIdLabel: 'เลขประจำตัวผู้เสียภาษี',
        buyerInfoLabel: 'ข้อมูลลูกค้า:',
        buyerTaxIdLabel: 'เลขประจำตัวผู้เสียภาษี',
        refDoc: 'เอกสารอ้างอิง',
        dateLabel: 'วันที่',
        docNumberLabel: 'เลขที่เอกสาร',
        colDescription: 'รายละเอียด',
        colDescriptionSub: 'Description',
        colQuantity: 'จำนวน',
        colQuantitySub: 'Quantity',
        colUnitPrice: 'ราคาต่อหน่วย',
        colUnitPriceSub: 'Unit Price (VAT ex.)',
        colDiscount: 'ส่วนลด',
        colDiscountSub: 'Discount',
        colValue: 'มูลค่า',
        colValueSub: 'Value',
        unit: 'ชิ้น',
        discountTotal: 'ส่วนลด',
        subtotalBeforeVat: 'ยอดรวมก่อนภาษี',
        vat: 'ภาษีมูลค่าเพิ่ม 7%',
        netTotal: 'ยอดเงินสุทธิ',
        taxNote: 'ใบกำกับภาษีนี้จะสมบูรณ์ก็ต่อเมื่อได้รับการชำระเงินเรียบร้อยแล้ว ใน ใบกำกับภาษี',
        receivedBy: 'ผู้รับ / Received by',
        issuedBy: 'ผู้ออกเอกสาร / Issued by',
        companyLabel: 'บริษัท',
    },
    'en': {
        pageTitle: 'Tax Invoice/Receipt',
        pageTitleSub: '',
        documentType: 'Original Document',
        headOffice: 'Head Office',
        taxIdLabel: 'Tax ID',
        buyerInfoLabel: 'Customer Information:',
        buyerTaxIdLabel: 'Tax ID',
        refDoc: 'Reference',
        dateLabel: 'Date',
        docNumberLabel: 'Document No.',
        colDescription: 'Description',
        colDescriptionSub: '',
        colQuantity: 'Quantity',
        colQuantitySub: '',
        colUnitPrice: 'Unit Price (VAT ex.)',
        colUnitPriceSub: '',
        colDiscount: 'Discount',
        colDiscountSub: '',
        colValue: 'Value',
        colValueSub: '',
        unit: 'pcs',
        discountTotal: 'Discount',
        subtotalBeforeVat: 'Subtotal before VAT',
        vat: 'VAT 7%',
        netTotal: 'Net Total',
        taxNote: 'This tax invoice is valid only when payment has been received in full.',
        receivedBy: 'Received by',
        issuedBy: 'Issued by',
        companyLabel: '',
    },
} as const;

type LangKey = keyof typeof LABEL;

const FONT_FAMILY = "'Sarabun', 'Noto Sans Thai', sans-serif";

const BORDER = '1px solid #000';
const BORDER_THICK = '1.5px solid #000';

export const TaxInvoiceReceipt = ({ data }: { data: ReceiptData }) => {
    const {
        sellerName,
        sellerAddress,
        sellerTaxId,
        buyerName,
        buyerAddress,
        buyerTaxId,
        invoiceNumber,
        date,
        items,
        subtotal,
        vatAmount,
        grandTotal,
        grandTotalText,
        savings,
        language,
        branchCode,
        authorizedSignatureName,
    } = data;

    const lang: LangKey = language === 'th' ? 'th' : 'en';
    const l = LABEL[lang];

    const safeSellerName = sanitizeText(sellerName);
    const safeSellerAddress = sanitizeText(sellerAddress);
    const safeSellerTaxId = sanitizeText(sellerTaxId);
    const safeBuyerName = sanitizeText(buyerName);
    const safeBuyerAddress = sanitizeText(buyerAddress || '');
    const safeBuyerTaxId = sanitizeText(buyerTaxId || '');
    const safeInvoiceNumber = sanitizeText(invoiceNumber);
    const safeBranchCode = sanitizeText(branchCode || '');
    const safeItems = items.map((item) => ({
        ...item,
        description: sanitizeText(item.description),
    }));

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '';
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

    const totalDiscount = safeItems.reduce((sum, item) => sum + (item.discount || 0), 0);

    return (
        <div
            style={{
                fontFamily: FONT_FAMILY,
                width: '794px',
                minHeight: '1050px',
                background: '#fff',
                color: '#000',
                padding: '40px 50px',
                boxSizing: 'border-box',
                fontSize: '12.5px',
                lineHeight: 1.5,
                position: 'relative',
                userSelect: 'none',
            }}
        >
            {/* ===== HEADER ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                {/* Seller Info - Top Left */}
                <div style={{ maxWidth: '55%' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{safeSellerName}</div>
                    <div style={{ fontSize: '11px', lineHeight: 1.4, marginTop: '2px' }}>{safeSellerAddress}</div>
                </div>

                {/* Branch + Tax ID - Top Right */}
                <div style={{ textAlign: 'right', fontSize: '11px' }}>
                    <div>
                        <span>{l.headOffice}</span>
                    </div>
                    <div>
                        <span>{l.taxIdLabel}</span>
                        <span style={{ marginLeft: '6px', fontWeight: 600, letterSpacing: '0.5px' }}>{safeSellerTaxId}</span>
                    </div>
                </div>
            </div>

            {/* ===== TITLE ===== */}
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{l.pageTitle}</div>
                {l.pageTitleSub && <div style={{ fontSize: '14px', fontWeight: 600, fontStyle: 'italic' }}>{l.pageTitleSub}</div>}
                <div style={{ fontSize: '11px', marginTop: '2px' }}>{l.documentType}</div>
            </div>

            {/* ===== BUYER INFO ===== */}
            <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{l.buyerInfoLabel}</div>
                <div style={{ marginLeft: '12px' }}>
                    <div>{safeBuyerName}</div>
                    {safeBuyerAddress && <div>{safeBuyerAddress}</div>}
                    {safeBuyerTaxId && (
                        <div>
                            {l.buyerTaxIdLabel}
                            <span style={{ marginLeft: '8px', fontWeight: 500 }}>{safeBuyerTaxId}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== REFERENCE / DATE / DOC NUMBER ROW ===== */}
            <div style={{ display: 'flex', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{l.refDoc}</span>
                </div>
                <div style={{ width: '160px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{l.dateLabel}</span>
                    <div>{formatDate(date)}</div>
                </div>
                <div style={{ width: '180px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{l.docNumberLabel}</span>
                    <div>{safeInvoiceNumber}</div>
                </div>
            </div>

            {/* ===== ITEMS TABLE ===== */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
                <thead>
                    <tr>
                        <th style={{ border: BORDER_THICK, padding: '6px 4px', textAlign: 'center', width: '220px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700 }}>{l.colDescription}</div>
                            {l.colDescriptionSub && <div style={{ fontWeight: 400, fontSize: '11px' }}>{l.colDescriptionSub}</div>}
                        </th>
                        <th style={{ border: BORDER_THICK, padding: '6px 4px', textAlign: 'center', width: '90px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700 }}>{l.colQuantity}</div>
                            {l.colQuantitySub && <div style={{ fontWeight: 400, fontSize: '11px' }}>{l.colQuantitySub}</div>}
                        </th>
                        <th style={{ border: BORDER_THICK, padding: '6px 4px', textAlign: 'center', width: '140px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700 }}>{l.colUnitPrice}</div>
                            {l.colUnitPriceSub && <div style={{ fontWeight: 400, fontSize: '11px' }}>{l.colUnitPriceSub}</div>}
                        </th>
                        <th style={{ border: BORDER_THICK, padding: '6px 4px', textAlign: 'center', width: '80px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700 }}>{l.colDiscount}</div>
                            {l.colDiscountSub && <div style={{ fontWeight: 400, fontSize: '11px' }}>{l.colDiscountSub}</div>}
                        </th>
                        <th style={{ border: BORDER_THICK, padding: '6px 4px', textAlign: 'center', width: '110px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700 }}>{l.colValue}</div>
                            {l.colValueSub && <div style={{ fontWeight: 400, fontSize: '11px' }}>{l.colValueSub}</div>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {safeItems.map((item, idx) => (
                        <tr key={item.id}>
                            <td style={{ borderLeft: BORDER, borderRight: BORDER, padding: '5px 8px' }}>
                                <span style={{ marginRight: '16px' }}>{idx + 1})</span>
                                {item.description}
                            </td>
                            <td style={{ borderRight: BORDER, padding: '5px 8px', textAlign: 'right' }}>
                                {item.quantity} {l.unit}
                            </td>
                            <td style={{ borderRight: BORDER, padding: '5px 8px', textAlign: 'right' }}>
                                {formatCurrency(item.unitPrice)}
                            </td>
                            <td style={{ borderRight: BORDER, padding: '5px 8px', textAlign: 'right' }}>
                                {formatCurrency(item.discount || 0)}
                            </td>
                            <td style={{ borderRight: BORDER, padding: '5px 8px', textAlign: 'right' }}>
                                {formatCurrency(item.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ===== BOTTOM LINE ===== */}
            <div style={{ borderTop: BORDER_THICK, marginBottom: '20px' }} />

            {/* ===== TOTALS SECTION ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                {/* Total in words */}
                <div style={{ flex: 1, fontSize: '12px', paddingTop: '4px' }}>
                    {grandTotalText && (
                        <div style={{ fontWeight: 500, textDecoration: 'underline' }}>{grandTotalText}</div>
                    )}
                </div>

                {/* Numeric totals */}
                <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>{l.discountTotal}</span>
                        <span>{formatCurrency(totalDiscount + (savings || 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>{l.subtotalBeforeVat}</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                        <span>{l.vat}</span>
                        <span>{formatCurrency(vatAmount)}</span>
                    </div>
                </div>
            </div>

            {/* ===== NET TOTAL + TAX NOTE ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: BORDER, paddingTop: '6px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', maxWidth: '55%' }}>{l.taxNote}</div>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{l.netTotal}</span>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            {/* ===== SIGNATURES ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', marginTop: '32px' }}>
                <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '36px' }}>{l.receivedBy}</div>
                    {data.hasSignature && (
                        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '20px', color: '#1a3a5c', marginBottom: '4px' }}>
                            {sanitizeText(data.buyerName?.split(' ').slice(0, 2).join(' ') || '')}
                        </div>
                    )}
                    <div style={{ borderBottom: BORDER, width: '200px', margin: '0 auto', marginBottom: '4px' }} />
                    <div style={{ fontSize: '11px' }}>( {''.padEnd(20, '\u00A0')} )</div>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        ____ / ____ / ____
                    </div>
                </div>
                <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '36px' }}>{l.issuedBy}</div>
                    {data.hasSignature && authorizedSignatureName && (
                        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '20px', color: '#1a3a5c', marginBottom: '4px' }}>
                            {sanitizeText(authorizedSignatureName)}
                        </div>
                    )}
                    <div style={{ borderBottom: BORDER, width: '200px', margin: '0 auto', marginBottom: '4px' }} />
                    <div style={{ fontSize: '11px' }}>( {''.padEnd(20, '\u00A0')} )</div>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        {formatDate(date)}
                    </div>
                </div>
            </div>

            {/* ===== COMPANY STAMP / LOGO ===== */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '16px' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    border: '3px solid #1a4a8a',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '8px',
                    color: '#1a4a8a',
                }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1.2 }}>{safeSellerName}</div>
                    {lang === 'en' && (
                        <div style={{ fontSize: '9px', marginTop: '2px' }}>Co., Ltd.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
