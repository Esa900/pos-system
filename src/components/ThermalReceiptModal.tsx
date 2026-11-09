import React, { useEffect } from 'react';
import { SaleInvoice } from '../types';
import { generateBarcodeBars } from '../utils/bengaliUtils';
import { Printer, X, CheckCircle, Phone, MapPin, Mail, Globe } from 'lucide-react';
import { SHOP_INFO } from '../data/initialData';

interface Props {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<Props> = ({ invoice, onClose }) => {
  useEffect(() => {
    if (!invoice) return;
    // 1-Click memo auto-print dialog
    const timer = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.error('Print trigger:', e);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [invoice?.id]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const barcodeBars = generateBarcodeBars(invoice.invoiceNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Action Bar (hidden in print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">ক্যাশ মেমো তৈরি সম্পন্ন!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-md transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট রসিদ
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean Printable Thermal Receipt Container (80mm standard) */}
        <div 
          id="printable-receipt" 
          className="p-6 bg-white text-slate-800 font-sans text-xs leading-relaxed max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
            {/* Logo / Shop Emblem */}
            <div className="flex justify-center mb-1.5">
              <img 
                src={SHOP_INFO.logoUrl} 
                alt={SHOP_INFO.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-600/60 shadow-xs"
              />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              {SHOP_INFO.name}
            </h2>
            <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
              {SHOP_INFO.slogan}
            </p>
            <p className="text-[10px] text-slate-700 font-medium mt-0.5">
              প্রোপ্রাইটর: {SHOP_INFO.proprietor}
            </p>
            
            {/* Address */}
            <div className="text-[10px] text-slate-600 mt-1 flex items-center justify-center gap-1 leading-normal">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0 inline" />
              <span>{SHOP_INFO.address}</span>
            </div>

            {/* Contact details */}
            <div className="text-[10px] text-slate-700 font-mono mt-1 space-y-0.5">
              <div className="flex items-center justify-center gap-1 font-bold">
                <Phone className="w-3 h-3 text-emerald-700 shrink-0 inline" />
                <span>মোবাইল: {SHOP_INFO.phoneBangla} ({SHOP_INFO.phone})</span>
              </div>
              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-1 font-sans">
                <Mail className="w-2.5 h-2.5 text-slate-400 inline" />
                <span>{SHOP_INFO.email}</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5 text-slate-400 inline" />
                <span>{SHOP_INFO.website}</span>
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2.5 mb-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">মেমো / ইনভয়েস নং:</span>
              <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">তারিখ ও সময়:</span>
              <span className="font-mono">{invoice.date} | {invoice.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ক্রেতার নাম:</span>
              <span className="font-semibold text-slate-800">{invoice.customerName || 'খুচরা গ্রাহক'}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল:</span>
                <span className="font-mono text-slate-700">{invoice.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                ✓ পরিশোধিত (DIRECT PAID)
              </span>
            </div>
          </div>

          {/* Items Table - Clean 3 columns (বিবরণ | পরিমাণ | মোট) */}
          <div className="mb-3">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 pb-1 font-bold">
                  <th className="py-1">বিবরণ / পণ্য</th>
                  <th className="py-1 text-center">পরিমাণ</th>
                  <th className="py-1 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-1.5 text-center font-mono font-bold text-slate-800">
                      {item.qty}
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                      ৳ {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Bill Section */}
          <div className="border-t border-slate-300 pt-2 space-y-1.5 text-[11px]">
            {invoice.discountAmount > 0 && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>মোট বিল:</span>
                  <span className="font-mono font-medium">৳ {invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>ছাড় / ডিসকাউন্ট:</span>
                  <span className="font-mono">- ৳ {invoice.discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-dashed border-slate-300 pt-1.5">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="font-mono text-base text-emerald-800">৳ {invoice.netPayable.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-emerald-900 bg-emerald-50/90 p-2 rounded-lg border border-emerald-300 mt-1">
              <span>পরিশোধিত টাকা (DIRECT PAID):</span>
              <span className="font-mono text-sm font-extrabold text-emerald-800">৳ {invoice.netPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
            <div className="flex justify-center items-end h-8 gap-[1.5px] mb-1">
              {barcodeBars.map((width, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900"
                  style={{
                    width: `${width * 1.4}px`,
                    height: idx % 3 === 0 ? '100%' : '80%',
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">{invoice.invoiceNo}</p>
          </div>

          {/* Footer with return policy under "ধন্যবাদ! আবার আসবেন।" */}
          <div className="mt-3 text-center text-slate-600 border-t border-dashed border-slate-300 pt-2.5 space-y-1">
            <p className="font-bold text-emerald-800 text-xs">
              ধন্যবাদ! আবার আসবেন।
            </p>
            <p className="text-[10px] font-semibold text-slate-800 bg-slate-100 py-1 px-2 rounded border border-slate-200 inline-block">
              ★ {SHOP_INFO.returnPolicy} ★
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              ফেসবুক পেজ: {SHOP_INFO.facebook}
            </p>
          </div>
        </div>

        {/* Bottom Actions (hidden in print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">প্রিন্টার নির্বাচন করতে Ctrl+P চাপুন</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-md transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              রসিদ প্রিন্ট করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
