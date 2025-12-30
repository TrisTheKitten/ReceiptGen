
import React from 'react';
import { ReceiptData } from '../types';

const LazadaLogo = () => (
    <div className="flex items-center gap-2">
        <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M78 28C72 22 62 22 56 28L50 34L44 28C38 22 28 22 22 28C16 34 16 44 22 50L50 78L78 50C84 44 84 34 78 28Z" fill="url(#laz_grad)" />
            <path d="M60 40L50 50L40 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            <defs>
                <linearGradient id="laz_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3D00"/>
                    <stop offset="0.5" stopColor="#FF9100"/>
                    <stop offset="1" stopColor="#F50057"/>
                </linearGradient>
            </defs>
        </svg>
        <div className="flex flex-col justify-center">
            <span className="text-[#0f146d] font-bold text-2xl tracking-tight leading-none">Lazada</span>
            <span className="text-[#00a3e0] font-bold text-sm leading-none mt-0.5 tracking-wide">Logistics</span>
        </div>
    </div>
);

export const LazadaReceipt = ({ data }: { data: ReceiptData }) => {
    const {
        scannedLook,
        sellerName,
        sellerAddress,
        sellerTaxId,
        sellerPhone,
        branchCode,
        buyerName,
        buyerAddress,
        invoiceNumber,
        refOrderNumber,
        date,
        items,
        grandTotal,
    } = data;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(amount);
    };

    return (
        <div className={`bg-white text-black relative shrink-0 overflow-hidden ${scannedLook ? 'scanned-effect' : ''} w-[794px] min-h-[1123px] p-12 font-thai text-black select-none flex flex-col`} style={{ fontFamily: 'Sarabun, sans-serif' }}>
            
            <div className="flex justify-between items-start mb-8">
                <LazadaLogo />
                <div className="text-right pt-2">
                    <div className="text-[11px] font-bold text-gray-900 mb-1">Page 1 of 1</div>
                    <div className="text-lg font-bold tracking-tight">RECEIPT</div>
                </div>
            </div>

            <div className="text-center text-[12px] leading-relaxed mb-6">
                <div className="font-medium text-[13px] mb-0.5">{sellerName}</div>
                <div className="w-[70%] mx-auto">{sellerAddress}</div>
                <div className="mt-0.5">Tel : {sellerPhone}</div>
                <div className="mt-0.5">TAX ID : {sellerTaxId} Branch: {branchCode}</div>
            </div>

            <div className="border border-black flex mb-0.5">
                <div className="flex-1 border-r border-black p-4">
                     <div className="flex text-[12px] mb-1.5">
                        <div className="w-36 font-bold shrink-0">ชื่อลูกค้า / Customer</div>
                        <div>{buyerName}</div>
                     </div>
                     <div className="flex text-[12px]">
                        <div className="w-36 font-bold shrink-0">ที่อยู่ / Address</div>
                        <div className="pr-2 leading-relaxed">{buyerAddress}</div>
                     </div>
                </div>
                <div className="w-[42%] p-4 pl-6">
                     <div className="flex text-[12px] mb-1.5">
                        <div className="w-32 font-bold shrink-0">เลขที่ / No.</div>
                        <div>{invoiceNumber}</div>
                     </div>
                     <div className="flex text-[12px] mb-1.5">
                        <div className="w-32 font-bold shrink-0">วันที่ / Date</div>
                        <div>{formatDate(date)}</div>
                     </div>
                     <div className="flex text-[12px]">
                        <div className="w-32 font-bold shrink-0">Ref. Order No.</div>
                        <div>{refOrderNumber}</div>
                     </div>
                </div>
            </div>

            <div className="border border-black text-[12px]">
                 <div className="flex border-b border-black">
                     <div className="w-24 text-center py-2 border-r border-black font-bold flex flex-col justify-center h-11">
                        <div>ลำดับ</div>
                        <div>Item</div>
                     </div>
                     <div className="flex-1 text-center py-2 border-r border-black font-bold flex flex-col justify-center h-11">
                        <div>รายการ</div>
                        <div>Description</div>
                     </div>
                     <div className="w-36 text-center py-2 font-bold flex flex-col justify-center h-11">
                        <div>จำนวนเงิน</div>
                        <div>Amount</div>
                     </div>
                 </div>
                 
                 <div className="relative min-h-[180px]">
                      <div className="absolute inset-0 flex pointer-events-none">
                          <div className="w-24 border-r border-black h-full"></div>
                          <div className="flex-1 border-r border-black h-full"></div>
                          <div className="w-36 h-full"></div>
                      </div>

                      <div className="relative z-10 pt-1">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex">
                                <div className="w-24 text-center py-1.5">{idx + 1}</div>
                                <div className="flex-1 py-1.5 pl-4">{item.description}</div>
                                <div className="w-36 py-1.5 pr-3 text-right">{formatCurrency(item.total)}</div>
                            </div>
                        ))}
                      </div>
                 </div>

                 <div className="border-t border-black">
                     <div className="flex">
                          <div className="flex-1 border-r border-black py-1.5 px-3 text-right">คูปอง/ส่วนลด Coupon/Discount</div>
                          <div className="w-36 py-1.5 px-3 text-right">0.00</div>
                     </div>
                     <div className="flex border-t border-black">
                          <div className="flex-1 border-r border-black py-1.5 px-3 text-right">คูปองเงินสด Store Credit</div>
                          <div className="w-36 py-1.5 px-3 text-right">0.00</div>
                     </div>
                     <div className="flex border-t border-black">
                          <div className="flex-1 border-r border-black py-1.5 px-3 text-right">ยอดชำระ Net paid</div>
                          <div className="w-36 py-1.5 px-3 text-right">{formatCurrency(grandTotal)}</div>
                     </div>
                 </div>
            </div>

            <div className="mt-8 text-[12px] leading-loose text-black">
                <p>This e-receipt is prepared by Lazada Express Limited and submitted electronically to the Revenue Department.</p>
                <p className="mt-3">เอกสารนี้ได้จัดทำและส่งข้อมูลให้แก่กรมสรรพากรด้วยวิธีการทางอิเล็กทรอนิกส์แล้ว</p>
                <p className="mt-6">Please carefully check the document and any amendment can be requested within 15 days. Otherwise, this e-receipt shall be deemed complete and accurate for submission.</p>
                <p className="mt-6">โปรดตรวจสอบความถูกต้องของรายการในเอกสารฉบับนี้ภายใน 15 วัน มิฉะนั้นบริษัทฯ จะถือว่าเอกสารฉบับนี้ถูกต้องและสมบูรณ์</p>
            </div>

            <div className="mt-auto mb-16 flex justify-end">
                 <div className="text-right text-[12px]">
                     <div className="mb-1">Digitally signed by บริษัท ลาซาด้า เอ็กซ์เพรส จำกัด</div>
                     <div>Date: {formatDate(date)} {new Date().toLocaleTimeString('th-TH', { hour12: false })} (GMT+07:00)</div>
                 </div>
            </div>

        </div>
    );
};
