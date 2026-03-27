
import React from 'react';
import { ReceiptData } from '../types';
import { sanitizeText } from '../utils/sanitize';

const LABEL = {
    'th-en': {
        title: 'Invoice',
        titleThai: 'ต้นฉบับใบเสร็จรับเงิน',
        invoiceNumber: 'Invoice number',
        invoiceNumberThai: 'หมายเลขใบแจ้งหนี้',
        date: 'Date',
        dateThai: 'วัน เดือน ปี',
        companyName: 'Company name:',
        companyNameThai: 'ชื่อบริษัท',
        addressLabel: 'Address (Head Office):',
        addressThai: 'ที่อยู่ (สำนักงานใหญ่)',
        taxId: 'Tax ID:',
        taxIdThai: 'เลขประจำตัวผู้เสียภาษี',
        clientName: 'Client name:',
        clientNameThai: 'ชื่อของผู้ชำระ',
        clientAddress: 'Address:',
        clientAddressThai: 'ที่อยู่',
        clientTaxId: 'Tax ID:',
        clientTaxIdThai: 'เลขประจำตัวผู้เสียภาษี',
        colNo: 'N°',
        colNoThai: 'อันดับ',
        colDesc: 'DESCRIPTION',
        colDescThai: 'รายการ',
        colPrice: 'PRICE/ UNIT',
        colPriceThai: 'ราคา/หน่วย',
        colQty: 'QUANTITY',
        colQtyThai: 'ปริมาณ',
        colTotal: 'TOTAL (THB)',
        colTotalThai: 'รวม (บาท)',
        withholdingNote: 'Note: withholding tax can be deducted 3% of the price before VAT.',
        withholdingNoteThai: 'หักภาษี ณ ที่จ่าย 3% ของจำนวนเงินเต็ม ก่อนบวกภาษีมูลค่าเพิ่ม',
        total: 'TOTAL',
        totalThai: 'รวม',
        vat: 'VAT 7%',
        vatThai: 'ภาษีมูลค่าเพิ่ม7%',
        grandTotal: 'GRAND TOTAL',
        grandTotalThai: 'ยอดรวม',
        thb: 'THB',
        thbThai: 'บาท',
    },
    'th': {
        title: 'ใบแจ้งหนี้',
        titleThai: 'ต้นฉบับใบเสร็จรับเงิน',
        invoiceNumber: 'หมายเลขใบแจ้งหนี้',
        invoiceNumberThai: '',
        date: 'วัน เดือน ปี',
        dateThai: '',
        companyName: 'ชื่อบริษัท:',
        companyNameThai: '',
        addressLabel: 'ที่อยู่ (สำนักงานใหญ่):',
        addressThai: '',
        taxId: 'เลขประจำตัวผู้เสียภาษี:',
        taxIdThai: '',
        clientName: 'ชื่อของผู้ชำระ:',
        clientNameThai: '',
        clientAddress: 'ที่อยู่:',
        clientAddressThai: '',
        clientTaxId: 'เลขประจำตัวผู้เสียภาษี:',
        clientTaxIdThai: '',
        colNo: 'อันดับ',
        colNoThai: '',
        colDesc: 'รายการ',
        colDescThai: '',
        colPrice: 'ราคา/หน่วย',
        colPriceThai: '',
        colQty: 'ปริมาณ',
        colQtyThai: '',
        colTotal: 'รวม (บาท)',
        colTotalThai: '',
        withholdingNote: 'หักภาษี ณ ที่จ่าย 3% ของจำนวนเงินเต็ม ก่อนบวกภาษีมูลค่าเพิ่ม',
        withholdingNoteThai: '',
        total: 'รวม',
        totalThai: '',
        vat: 'ภาษีมูลค่าเพิ่ม 7%',
        vatThai: '',
        grandTotal: 'ยอดรวม',
        grandTotalThai: '',
        thb: 'บาท',
        thbThai: '',
    }
} as const;

const FONT_FAMILY = "'Sarabun', 'Noto Serif Thai', serif";

export const InvoiceReceipt = ({ data }: { data: ReceiptData }) => {
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
        language,
    } = data;

    const l = LABEL[language] || LABEL['th-en'];

    const safeSellerName = sanitizeText(sellerName);
    const safeSellerAddress = sanitizeText(sellerAddress);
    const safeSellerTaxId = sanitizeText(sellerTaxId);
    const safeBuyerName = sanitizeText(buyerName);
    const safeBuyerAddress = sanitizeText(buyerAddress || '');
    const safeBuyerTaxId = sanitizeText(buyerTaxId || '');
    const safeInvoiceNumber = sanitizeText(invoiceNumber);
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
        new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(amount);

    const LabelPair = ({ primary, secondary }: { primary: string; secondary?: string }) => (
        <>
            <span style={{ display: 'block', fontWeight: 600 }}>{primary}</span>
            {secondary && <span style={{ display: 'block' }}>{secondary}</span>}
        </>
    );

    return (
        <div
            style={{
                fontFamily: FONT_FAMILY,
                width: '794px',
                minHeight: '600px',
                background: '#fff',
                color: '#000',
                padding: '48px 56px',
                boxSizing: 'border-box',
                fontSize: '13px',
                lineHeight: 1.5,
                position: 'relative',
                userSelect: 'none',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.1 }}>{l.title}</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>{l.titleThai}</div>
                </div>
                <table style={{ borderCollapse: 'collapse', border: '1.5px solid #000', minWidth: '200px' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1.5px solid #000', padding: '6px 14px', textAlign: 'center', lineHeight: 1.4 }}>
                                <LabelPair primary={l.invoiceNumber} secondary={l.invoiceNumberThai} />
                            </td>
                            <td style={{ border: '1.5px solid #000', padding: '6px 14px', textAlign: 'center', fontWeight: 500 }}>
                                {safeInvoiceNumber}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1.5px solid #000', padding: '6px 14px', textAlign: 'center', lineHeight: 1.4 }}>
                                <LabelPair primary={l.date} secondary={l.dateThai} />
                            </td>
                            <td style={{ border: '1.5px solid #000', padding: '6px 14px', textAlign: 'center', fontWeight: 500 }}>
                                {formatDate(date)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Company & Client Info */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '28px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <LabelPair primary={l.companyName} secondary={l.companyNameThai} />
                        <span style={{ fontWeight: 500 }}>{safeSellerName}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <LabelPair primary={l.addressLabel} secondary={l.addressThai} />
                        <span>{safeSellerAddress}</span>
                    </div>
                    <div>
                        <LabelPair primary={l.taxId} secondary={l.taxIdThai} />
                        <span>{safeSellerTaxId}</span>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                        <LabelPair primary={l.clientName} secondary={l.clientNameThai} />
                        <span style={{ fontWeight: 500 }}>{safeBuyerName}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                        <LabelPair primary={l.clientAddress} secondary={l.clientAddressThai} />
                        <span>{safeBuyerAddress}</span>
                    </div>
                    <div>
                        <LabelPair primary={l.clientTaxId} secondary={l.clientTaxIdThai} />
                        <span>{safeBuyerTaxId}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '0' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1.5px solid #000', padding: '8px 6px', textAlign: 'center', width: '60px', verticalAlign: 'middle' }}>
                            <LabelPair primary={l.colNo} secondary={l.colNoThai} />
                        </th>
                        <th style={{ border: '1.5px solid #000', padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <LabelPair primary={l.colDesc} secondary={l.colDescThai} />
                        </th>
                        <th style={{ border: '1.5px solid #000', padding: '8px 10px', textAlign: 'center', width: '120px', verticalAlign: 'middle' }}>
                            <LabelPair primary={l.colPrice} secondary={l.colPriceThai} />
                        </th>
                        <th style={{ border: '1.5px solid #000', padding: '8px 10px', textAlign: 'center', width: '110px', verticalAlign: 'middle' }}>
                            <LabelPair primary={l.colQty} secondary={l.colQtyThai} />
                        </th>
                        <th style={{ border: '1.5px solid #000', padding: '8px 10px', textAlign: 'center', width: '130px', verticalAlign: 'middle' }}>
                            <LabelPair primary={l.colTotal} secondary={l.colTotalThai} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {safeItems.map((item, idx) => (
                        <tr key={item.id}>
                            <td style={{ borderLeft: '1.5px solid #000', borderRight: '1.5px solid #000', padding: '6px', textAlign: 'center' }}>
                                {idx + 1}
                            </td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px' }}>
                                {item.description}
                            </td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}>
                                {formatCurrency(item.unitPrice)}
                            </td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}>
                                {item.quantity}
                            </td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}>
                                {formatCurrency(item.total)}
                            </td>
                        </tr>
                    ))}
                    {safeItems.length < 3 && Array.from({ length: 3 - safeItems.length }).map((_, idx) => (
                        <tr key={`empty-${idx}`}>
                            <td style={{ borderLeft: '1.5px solid #000', borderRight: '1.5px solid #000', padding: '6px', height: '28px' }}>&nbsp;</td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px' }}>&nbsp;</td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px' }}>&nbsp;</td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px' }}>&nbsp;</td>
                            <td style={{ borderRight: '1.5px solid #000', padding: '6px 10px' }}>&nbsp;</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary Area */}
            <div style={{ display: 'flex', borderLeft: '1.5px solid #000', borderRight: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
                {/* Withholding Note */}
                <div style={{ flex: 1, padding: '10px 12px', fontSize: '11.5px', lineHeight: 1.5, borderRight: '1.5px solid #000' }}>
                    <div>{l.withholdingNote}</div>
                    {l.withholdingNoteThai && <div>{l.withholdingNoteThai}</div>}
                </div>

                {/* Totals */}
                <div style={{ width: '290px' }}>
                    {/* TOTAL */}
                    <div style={{ display: 'flex', borderBottom: '1.5px solid #000' }}>
                        <div style={{ flex: 1, padding: '6px 10px', textAlign: 'right', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.total}</span>
                            {l.totalThai && <><br /><span>{l.totalThai}</span></>}
                        </div>
                        <div style={{ width: '50px', padding: '6px 6px', textAlign: 'center', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.thb}</span>
                            {l.thbThai && <><br /><span>{l.thbThai}</span></>}
                        </div>
                        <div style={{ width: '80px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(subtotal)}
                        </div>
                    </div>

                    {/* VAT 7% */}
                    <div style={{ display: 'flex', borderBottom: '1.5px solid #000' }}>
                        <div style={{ flex: 1, padding: '6px 10px', textAlign: 'right', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.vat}</span>
                            {l.vatThai && <><br /><span>{l.vatThai}</span></>}
                        </div>
                        <div style={{ width: '50px', padding: '6px 6px', textAlign: 'center', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.thb}</span>
                            {l.thbThai && <><br /><span>{l.thbThai}</span></>}
                        </div>
                        <div style={{ width: '80px', padding: '6px 10px', textAlign: 'right', fontWeight: 700 }}>
                            {formatCurrency(vatAmount)}
                        </div>
                    </div>

                    {/* GRAND TOTAL */}
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1, padding: '6px 10px', textAlign: 'right', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.grandTotal}</span>
                            {l.grandTotalThai && <><br /><span>{l.grandTotalThai}</span></>}
                        </div>
                        <div style={{ width: '50px', padding: '6px 6px', textAlign: 'center', borderRight: '1.5px solid #000' }}>
                            <span style={{ fontWeight: 700 }}>{l.thb}</span>
                            {l.thbThai && <><br /><span>{l.thbThai}</span></>}
                        </div>
                        <div style={{ width: '80px', padding: '6px 10px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                            {formatCurrency(grandTotal)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
