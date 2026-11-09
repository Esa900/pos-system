import React, { useEffect } from 'react';
import { SaleInvoice } from '../types';
import { formatBDT, toBanglaNumber, generateBarcodeBars } from '../utils/bengaliUtils';
import { Printer, X, CheckCircle, ShoppingBag } from 'lucide-react';

interface Props {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<Props> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  useEffect(() => {
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
            <span className="font-semibold text-sm">মেমো তৈরি সম্পন্ন!</span>
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

        {/* Clean Printable Thermal Receipt Container */}
        <div 
          id="printable-receipt" 
          className="p-6 bg-white text-slate-800 font-sans text-xs leading-relaxed max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">KHAN MANAGEMENT</h2>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Point of Sale & Inventory Management System</p>
            <p className="text-[10px] text-slate-500 mt-0.5">মেইন রোড, বাজার পয়েন্ট, ঢাকা</p>
            <p className="text-[10px] text-slate-500 font-mono">মোবাইল: ০১৭০০-১১২২৩৩, ০১৮০০-৪৪৫৫৬৬</p>
          </div>

          {/* Invoice Meta */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-2.5 mb-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">ইনভয়েস নং:</span>
              <span className="font-mono font-semibold text-slate-900">{invoice.invoiceNo}</span>
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
            <div className="flex justify-between">
              <span className="text-slate-500">পেমেন্ট মোড:</span>
              <span className="font-medium text-emerald-800 font-mono text-[10px]">
                {invoice.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Table - Clean 3 columns (বিবরণ | পরিমাণ | মোট) - NO "দর" column, NO "সাইজ" column as requested */}
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

          {/* Clean Total Bill - NO "পরিশোধিত টাকা: ৳ ১০ / বকেয়া বাকি: ৳ ০" lines as requested in screenshot 3 */}
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

            {/* Only show baki alert if there is actual positive remaining due */}
            {invoice.dueAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-1.5 rounded border border-rose-200 mt-1">
                <span>বকেয়া বাকি:</span>
                <span className="font-mono">৳ {invoice.dueAmount.toFixed(2)}</span>
              </div>
            )}
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

          {/* Clean Footer - NO "★ বিক্রিত পণ্য ৭ দিনের মধ্যে মেমোসহ পরিবর্তনের সুযোগ রয়েছে ★" as requested in screenshot 2 */}
          <div className="mt-3 text-center text-[10px] text-slate-500 border-t border-dashed border-slate-200 pt-2">
            <p className="font-bold text-emerald-800 text-xs">ধন্যবাদ! আবার আসবেন।</p>
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
