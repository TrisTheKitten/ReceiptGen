
import React from 'react';
import { ReceiptData } from '../types';

const FakeBarcode = ({ barWidth = 2, gapWidth = 2, height = 32 }: { barWidth?: number, gapWidth?: number, height?: number }) => {
    const totalWidth = 160;
    const patternWidth = barWidth + gapWidth;
    const count = Math.ceil(totalWidth / patternWidth);
    
    return (
      <div className="flex bg-white overflow-hidden justify-center select-none" style={{ height: `${height}px` }}>
          {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex h-full shrink-0">
                  <div style={{ width: `${Math.random() > 0.5 ? barWidth : barWidth*2}px` }} className="bg-black h-full" />
                  <div style={{ width: `${Math.random() > 0.5 ? gapWidth : gapWidth/2}px` }} className="bg-white h-full" />
              </div>
          ))}
      </div>
    );
};

export const ThermalReceipt = ({ data }: { data: ReceiptData }) => {
    const {
        scannedLook,
        sellerAddress,
        sellerTaxId,
        branchCode,
        posId,
        buyerName,
        invoiceNumber,
        date,
        items,
        subtotal,
        grandTotal,
        savings,
        cashAmount,
        changeAmount,
        memberId,
        memberPointsEarned,
        memberPointsTotal,
        rightsEarned = 0,
        rightsUsed = 0,
        rightsRemaining = 0,
        couponsEarned = 0,
        couponsUsed = 0,
        couponsRemaining = 0
    } = data;

    const formatDateShort = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = (d.getFullYear() + 543).toString().slice(-2); 
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours === '00' ? '17:26' : hours + ':' + mins}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(amount);
    };

    const DashedLine = () => (
        <div className="w-full overflow-hidden whitespace-nowrap text-[10px] leading-none my-1.5 text-black font-mono tracking-widest opacity-80 scale-y-75">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        </div>
    );

    return (
        <div className={`bg-white text-black relative overflow-hidden shrink-0 ${scannedLook ? 'scanned-effect' : ''} w-[380px] min-h-[600px] p-4 pb-12 font-thai text-black select-none`} style={{ fontFamily: 'Sarabun, sans-serif' }}>
            <div className="text-center text-[13px] leading-tight tracking-tight">
                <div className="font-bold mb-0.5">CP ALL, 7-Eleven {sellerAddress.split(' ')[0]} ({branchCode})</div>
                <div className="mb-0.5">TAX#{sellerTaxId} (VAT Included)</div>
                <div className="mb-2">Vat Code {branchCode} POS#{posId}</div>
                <div className="font-bold text-[14px]">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</div>
            </div>

            <div className="mt-4 text-[13px] leading-snug w-full font-medium">
                {items.map((item, idx) => {
                    const flag = (idx % 3 === 0) ? "P" : (idx % 2 === 0 ? "E" : "N");
                    return (
                        <div key={item.id} className="flex relative items-start mb-0.5">
                            <div className="w-5 text-left shrink-0">{item.quantity}</div>
                            <div className="flex-1 pr-14 break-words">{item.description}</div>
                            <div className="absolute right-0 top-0 flex gap-0.5">
                                <span>{formatCurrency(item.total)}</span>
                                <span className="w-2 text-right">{flag}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 text-[13px] font-medium">
                <div className="flex justify-between items-end mb-0.5 pr-2.5">
                    <span className="pl-5">ยอดรวม</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {savings > 0 && (
                <div className="flex justify-between items-end mb-0.5 pr-2.5">
                    <span className="pl-5">AMBส่วนลดรายการ</span>
                    <span>-{formatCurrency(savings)}</span>
                </div>
                )}

                <div className="flex justify-between items-end mt-2 pr-2.5 font-bold text-[15px]">
                    <span className="pl-5">สุทธิ &nbsp;&nbsp;&nbsp;&nbsp; {items.reduce((a,b) => a + b.quantity, 0)} &nbsp;ชิ้น</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex justify-between items-end mt-2 pr-2.5">
                    <span className="pl-5">เงินสด/เงินทอน</span>
                    <span className="flex gap-4">
                        <span>{formatCurrency(cashAmount)}</span>
                        <span>{formatCurrency(changeAmount)}</span>
                    </span>
                </div>
            </div>

            <div className="mt-3 text-[13px] text-center leading-tight">
                <div className="flex justify-between px-0 mb-1 tracking-tight uppercase">
                    <span>R#{invoiceNumber} :{memberId.replace(/-/g, '')}</span>
                    <span>{formatDateShort(date)}</span>
                </div>
                <div className="mb-2 tracking-tight">
                    * คุณลูกค้าสมาชิก All Member {memberId} *
                </div>
            </div>

            {savings > 0 && (
                <div className="text-center my-4">
                    <p className="text-[22px] font-bold tracking-tight">บิลนี้ประหยัด {formatCurrency(savings)}</p>
                </div>
            )}

            <DashedLine />

            <div className="text-[13px] leading-snug">
                <p className="font-bold mb-1">ข้อมูลสมาชิก คุณ{buyerName}</p>
                
                <div className="flex justify-end gap-3 text-[11px] mb-0.5 pr-1">
                    <span className="w-10 text-right">ได้รับ</span>
                    <span className="w-10 text-right">ใช้ไป</span>
                    <span className="w-12 text-right">คงเหลือ</span>
                </div>
                
                <div className="flex justify-between items-start">
                    <span>All Member Point</span>
                    <div className="flex justify-end gap-3 pr-1">
                        <span className="w-10 text-right">+{memberPointsEarned}</span>
                        <span className="w-10 text-right">0</span>
                        <span className="w-12 text-right">{memberPointsTotal}</span>
                    </div>
                </div>
                
                <p className="mt-1 text-[11px]">**คะแนน 1,524 แต้ม จะหมดอายุใน 31/12/69</p>
                <p className="text-[11px]">**ยอดใช้ไปและยอดคงเหลือ ไม่รวมยอดสะสมครั้งนี้**</p>
            </div>

            <DashedLine />

            <div className="text-[13px] leading-snug">
                <div className="flex justify-between items-center px-4">
                    <span>คูปอง</span>
                    <div className="flex gap-4 text-[11px]">
                        <span className="flex flex-col items-center"><span>ได้รับ</span><span>{couponsEarned}</span></span>
                        <span className="flex flex-col items-center"><span>ใช้ไป</span><span>{couponsUsed}</span></span>
                        <span className="flex flex-col items-center"><span>คงเหลือ</span><span>{couponsRemaining}</span></span>
                        <span className="flex flex-col items-center"><span>หมดอายุ</span><span>030169</span></span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center px-4 mt-1">
                    <span>สิทธิ์แลกซื้อสุดคุ้มAMB</span>
                    <div className="flex gap-4 text-[11px]">
                        <span className="flex flex-col items-center"><span>{rightsEarned}</span></span>
                        <span className="flex flex-col items-center"><span>{rightsUsed}</span></span>
                        <span className="flex flex-col items-center"><span>{rightsRemaining}</span></span>
                        <span className="flex flex-col items-center"><span>030169</span></span>
                    </div>
                </div>
            </div>

            <div className="w-full overflow-hidden whitespace-nowrap text-[10px] leading-none my-3 text-black font-mono tracking-widest flex items-center gap-1 opacity-90">
            - - - - - - - - - - - - - - - - - - - - - <span className="text-sm -mt-1">✂</span> - -
            </div>

            <div className="text-center my-2 space-y-4">
                <div>
                    <h3 className="font-bold text-[14px]">2 สิทธิ์แลกซื้อสุดคุ้ม</h3>
                    <p className="text-[12px]">หมดเขต 3 ม.ค. 69</p>
                    <div className="mt-1 flex flex-col items-center">
                    <FakeBarcode barWidth={2} gapWidth={1.5} height={40} />
                    <p className="font-mono text-[11px] tracking-[0.2em] mt-0.5 scale-x-110">091042 680006</p>
                    </div>
                </div>

                <DashedLine />

                <div>
                    <h3 className="font-bold text-[14px]">1 สิทธิ์แลกซื้อพรีเมียม</h3>
                    <p className="text-[12px]">กระบอกน้ำดับเบิล เริ่ม 24/11/68</p>
                    <div className="mt-1 flex flex-col items-center">
                    <FakeBarcode barWidth={2.5} gapWidth={1} height={45} />
                    <p className="font-mono text-[11px] tracking-[0.2em] mt-0.5 scale-x-110">091042 230003</p>
                    </div>
                    <p className="text-[11px] mt-1">หมดเขต 23 ม.ค. 69</p>
                </div>
            </div>

            <div className="text-center mt-6 text-[12px] font-medium">
                <p>ขอบคุณที่ใช้บริการ</p>
                <p>Call Center โทร 1371</p>
            </div>
        </div>
    );
};
