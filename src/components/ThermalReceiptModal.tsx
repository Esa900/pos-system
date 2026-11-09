import React from 'react';
import { SaleInvoice } from '../types';
import { formatBDT, toBanglaNumber, generateBarcodeBars } from '../utils/bengaliUtils';
import { Printer, X, CheckCircle, ShoppingBag } from 'lucide-react';

interface Props {
  invoice: SaleInvoice | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<Props> = ({ invoice, onClose }) => {
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
            <span className="font-semibold text-sm">বিক্রি সফল হয়েছে!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-semibold rounded-md transition shadow-sm cursor-pointer"
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

        {/* Printable Thermal Receipt Container */}
        <div 
          id="printable-receipt" 
          className="p-6 bg-white text-slate-800 font-sans text-xs leading-relaxed max-h-[80vh] overflow-y-auto"
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
              <span>{invoice.date} | {invoice.time}</span>
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
              <span className="text-slate-500">পরিশোধের ধরণ:</span>
              <span className="font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded text-[10px] border border-teal-200">
                {invoice.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-3">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 pb-1 font-semibold">
                  <th className="py-1">বিবরণ</th>
                  <th className="py-1 text-center">সাইজ</th>
                  <th className="py-1 text-center">পরিমাণ</th>
                  <th className="py-1 text-right">দর</th>
                  <th className="py-1 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1 font-medium text-slate-900 max-w-[140px] truncate">
                      {item.name}
                      <span className="block text-[9px] text-slate-500">{item.color}</span>
                    </td>
                    <td className="py-1 text-center font-mono text-slate-600 text-[10px]">{item.size}</td>
                    <td className="py-1 text-center font-mono">{toBanglaNumber(item.qty)}</td>
                    <td className="py-1 text-right font-mono text-slate-600">{toBanglaNumber(item.unitPrice)}</td>
                    <td className="py-1 text-right font-mono font-semibold text-slate-900">{toBanglaNumber(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations */}
          <div className="border-t border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>মোট আইটেম / পিস:</span>
              <span className="font-mono">{toBanglaNumber(invoice.totalQty)} টি</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>মোট মূল্য:</span>
              <span className="font-mono font-medium">{formatBDT(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>ছাড় / ডিসকাউন্ট:</span>
                <span className="font-mono font-medium">- {formatBDT(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-dashed border-slate-300 pt-1.5 my-1">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="font-mono text-teal-800">{formatBDT(invoice.netPayable)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>পরিশোধিত টাকা:</span>
              <span className="font-mono text-emerald-700">{formatBDT(invoice.paidAmount)}</span>
            </div>
            {invoice.dueAmount > 0 ? (
              <div className="flex justify-between text-red-600 font-bold bg-red-50 p-1 rounded border border-red-200">
                <span>বকেয়া বাকি:</span>
                <span className="font-mono">{formatBDT(invoice.dueAmount)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>বকেয়া বাকি:</span>
                <span className="font-mono">৳ ০ (পরিশোধিত)</span>
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

          {/* Shop Policy & Footer */}
          <div className="mt-3 text-center text-[10px] text-slate-500 space-y-0.5 border-t border-dashed border-slate-200 pt-2">
            <p className="font-medium text-slate-700">★ বিক্রিত পণ্য ৭ দিনের মধ্যে মেমোসহ পরিবর্তনের সুযোগ রয়েছে ★</p>
            <p>অনুগ্রহ করে ব্যবহৃত বা ধোয়া পণ্য ফেরত নিয়ে আসবেন না</p>
            <p className="font-bold text-teal-800 text-xs mt-1">ধন্যবাদ! আবার আসবেন।</p>
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
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-md transition shadow-xs cursor-pointer"
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
