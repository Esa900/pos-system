import React, { useState } from 'react';
import { Product } from '../../types';
import { formatBDT, toBanglaNumber, generateBarcodeBars } from '../../utils/bengaliUtils';
import { Barcode, Printer, Tag, Sparkles, Sliders, CheckSquare, Square } from 'lucide-react';

interface Props {
  products: Product[];
  initialSelectedProduct?: Product | null;
}

export const BarcodeGeneratorView: React.FC<Props> = ({ products, initialSelectedProduct }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialSelectedProduct?.id || products[0]?.id || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedColor, setSelectedColor] = useState<string>('স্ট্যান্ডার্ড');
  const [labelFormat, setLabelFormat] = useState<'50x30' | '38x25' | 'a4_sheet'>('50x30');
  const [printCopies, setPrintCopies] = useState<number>(6);
  const [customPrice, setCustomPrice] = useState<string>('');

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  // Sync size/color when product changes
  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setSelectedSize(p.sizes[0] || 'M');
      setSelectedColor(p.availableColors[0] || 'স্ট্যান্ডার্ড');
      setCustomPrice(p.sellingPrice.toString());
    }
  };

  const barcodeBars = generateBarcodeBars(product?.barcode || '8901245001');
  const activePrice = customPrice !== '' ? parseFloat(customPrice) || product.sellingPrice : product.sellingPrice;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner (hidden in print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">বারকোড স্টিকার ও প্রাইস ট্যাগ জেনারেটর</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              কাপড়ের দোকানে ঝুলানোর জন্য স্ট্যান্ডার্ড প্রাইস ট্যাগ ও বারকোড লেবেল তৈরি ও প্রিন্ট করুন
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            স্টিকার প্রিন্ট করুন (Ctrl + P)
          </button>
        </div>
      </div>

      {/* Configuration Grid (hidden in print) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:hidden">
        
        {/* Left Form: Product & Label Config (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-500" />
            ট্যাগ কনফিগারেশন
          </h3>

          {/* Select Product */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              পোশাক পণ্য নির্বাচন করুন:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.category} ({formatBDT(p.sellingPrice)})
                </option>
              ))}
            </select>
          </div>

          {/* Select Size & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">সাইজ:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">রং:</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
              >
                {product.availableColors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Selling Price */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              ট্যাগে প্রদর্শিত বিক্রয় মূল্য (৳):
            </label>
            <input
              type="number"
              value={customPrice || product.sellingPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Label Sheet Size */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              লেবেল ও ট্যাগের মাপ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLabelFormat('50x30')}
                className={`p-2 text-center rounded-lg border text-xs font-medium cursor-pointer transition ${
                  labelFormat === '50x30'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                ৫০×৩০ মিমি (স্ট্যান্ডার্ড)
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('38x25')}
                className={`p-2 text-center rounded-lg border text-xs font-medium cursor-pointer transition ${
                  labelFormat === '38x25'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                ৩৮×২৫ মিমি (ছোট)
              </button>
              <button
                type="button"
                onClick={() => setLabelFormat('a4_sheet')}
                className={`p-2 text-center rounded-lg border text-xs font-medium cursor-pointer transition ${
                  labelFormat === 'a4_sheet'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                A4 শিট (৩ কলাম)
              </button>
            </div>
          </div>

          {/* Copies count */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">কপি সংখ্যা (কতটি ট্যাগ প্রিন্ট হবে):</label>
              <button
                type="button"
                onClick={() => setPrintCopies(product.stockQty)}
                className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
              >
                স্টক সংখ্যা অনুযায়ী ({toBanglaNumber(product.stockQty)})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={printCopies}
                onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-hidden"
              />
              <span className="text-xs text-slate-500">টি প্রাইস ট্যাগ</span>
            </div>
          </div>

        </div>

        {/* Right: Live Preview Box (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              লাইভ ট্যাগ প্রিভিউ (স্টিকার লুক)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ফর্ম্যাট: {labelFormat === '50x30' ? '50mm × 30mm' : labelFormat === '38x25' ? '38mm × 25mm' : 'A4 Sheet'}
            </span>
          </div>

          {/* Single Tag Card Display */}
          <div className="flex items-center justify-center p-6 bg-slate-100 rounded-xl border border-dashed border-slate-300">
            <div
              className={`bg-white rounded-lg border-2 border-slate-800 p-3 shadow-md text-center text-slate-900 transition-all ${
                labelFormat === '38x25' ? 'w-56 p-2 text-[10px]' : 'w-72 p-3 text-xs'
              }`}
            >
              {/* Header */}
              <div className="border-b border-slate-800 pb-1 mb-1.5">
                <p className="font-bold text-xs tracking-tight text-slate-900">KHAN MANAGEMENT</p>
                <p className="text-[9px] text-slate-500">Point of Sale System</p>
              </div>

              {/* Title & Size */}
              <div className="font-semibold text-slate-900 leading-tight mb-1 truncate">
                {product.name}
              </div>
              <div className="flex justify-center items-center gap-2 text-[11px] text-slate-600 mb-2">
                <span>সাইজ: <strong className="font-mono text-slate-900">{selectedSize}</strong></span>
                <span>•</span>
                <span>রং: <strong className="text-slate-900">{selectedColor}</strong></span>
              </div>

              {/* Barcode Render */}
              <div className="flex justify-center items-end h-8 gap-[1.5px] my-1">
                {barcodeBars.map((width, idx) => (
                  <div
                    key={idx}
                    className="bg-black"
                    style={{
                      width: `${width * 1.5}px`,
                      height: idx % 3 === 0 ? '100%' : '80%',
                    }}
                  />
                ))}
              </div>
              <p className="font-mono text-[9px] tracking-widest text-slate-700">{product.barcode}</p>

              {/* Price Banner */}
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-between items-center px-1 font-bold">
                <span className="text-[10px] text-slate-500">এম.আর.পি (MRP):</span>
                <span className="text-sm font-mono text-slate-950 font-extrabold">
                  {formatBDT(activePrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200/80 text-[11px] text-teal-900 leading-relaxed">
            💡 <strong>টিপস:</strong> আপনি যেকোনো সাধারণ লেজার প্রিন্টার বা থার্মাল বারকোড প্রিন্টার (যেমন: Xprinter, TSC, Zebra) দিয়ে এই ট্যাগ সরাসরি প্রিন্ট করতে পারবেন।
          </div>
        </div>

      </div>

      {/* Printable Sheet Area (Visible during printing or preview) */}
      <div id="printable-barcode-sheet" className="p-4 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: printCopies }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-md border-2 border-slate-800 p-2.5 text-center text-slate-900 page-break-inside-avoid shadow-2xs"
            >
              <div className="border-b border-slate-800 pb-0.5 mb-1">
                <p className="font-bold text-[11px] text-slate-900">KHAN MANAGEMENT</p>
                <p className="text-[8px] text-slate-500">Point of Sale System</p>
              </div>

              <div className="font-semibold text-[11px] text-slate-900 leading-tight truncate">
                {product.name}
              </div>
              <div className="flex justify-center items-center gap-1.5 text-[9px] text-slate-600 my-0.5">
                <span>সাইজ: <strong className="font-mono text-slate-900">{selectedSize}</strong></span>
                <span>•</span>
                <span>রং: <strong className="text-slate-900">{selectedColor}</strong></span>
              </div>

              <div className="flex justify-center items-end h-7 gap-[1.2px] my-1">
                {barcodeBars.map((width, idx) => (
                  <div
                    key={idx}
                    className="bg-black"
                    style={{
                      width: `${width * 1.3}px`,
                      height: idx % 3 === 0 ? '100%' : '80%',
                    }}
                  />
                ))}
              </div>
              <p className="font-mono text-[8px] tracking-widest text-slate-700">{product.barcode}</p>

              <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between items-center px-1 font-bold">
                <span className="text-[9px] text-slate-500">MRP:</span>
                <span className="text-xs font-mono font-extrabold text-slate-950">
                  {formatBDT(activePrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
