import React, { useState } from 'react';
import { Product } from '../../types';
import { formatBDT, toBanglaNumber } from '../../utils/bengaliUtils';
import {
  Box,
  AlertTriangle,
  Search,
  ArrowUpRight,
  PackageCheck,
  TrendingDown,
  Printer,
  Barcode,
} from 'lucide-react';

interface Props {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onGoToBarcode: (product: Product) => void;
}

export const StockView: React.FC<Props> = ({
  products,
  onUpdateStock,
  onGoToBarcode,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'adequate'>('all');

  const lowStockItems = products.filter((p) => p.stockQty <= p.minStockLevel);
  const totalQuantity = products.reduce((acc, p) => acc + p.stockQty, 0);
  const totalStockCost = products.reduce((acc, p) => acc + p.buyingPrice * p.stockQty, 0);
  const totalStockSaleValue = products.reduce((acc, p) => acc + p.sellingPrice * p.stockQty, 0);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'low'
        ? p.stockQty <= p.minStockLevel
        : p.stockQty > p.minStockLevel;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট মজুত পণ্য (পিস)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {toBanglaNumber(totalQuantity)} পিস
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">মোট আইটেম ভেরিয়েন্ট: {toBanglaNumber(products.length)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট ক্রয়মূল্য (ইনভেন্টরি সম্পদ)</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatBDT(totalStockCost)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">সম্ভাব্য বিক্রয়মূল্য: {formatBDT(totalStockSaleValue)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">স্বল্প স্টক সতর্কবার্তা</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {toBanglaNumber(lowStockItems.length)} টি পণ্য
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">দ্রুত রি-অর্ডার ও ক্রয় প্রয়োজন</p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="পণ্যের নাম, বারকোড বা ক্যাটাগরি দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-[#00875a]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            সব স্টক
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
              filterType === 'low'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            স্বল্প স্টক ({toBanglaNumber(lowStockItems.length)})
          </button>
          <button
            onClick={() => setFilterType('adequate')}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
              filterType === 'adequate'
                ? 'bg-[#00875a] text-white border-[#00875a]'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            পর্যাপ্ত স্টক
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">বারকোড</th>
                <th className="py-2.5 px-4">পণ্যের নাম</th>
                <th className="py-2.5 px-4">ক্যাটাগরি</th>
                <th className="py-2.5 px-4 text-right">ক্রয়মূল্য</th>
                <th className="py-2.5 px-4 text-right">বিক্রয়মূল্য</th>
                <th className="py-2.5 px-4 text-center">বর্তমান স্টক</th>
                <th className="py-2.5 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-2.5 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isLow = p.stockQty <= p.minStockLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{p.barcode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatBDT(p.buyingPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatBDT(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span className={isLow ? 'text-amber-600' : 'text-slate-800'}>
                        {toBanglaNumber(p.stockQty)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isLow ? 'স্বল্প স্টক' : 'উপলব্ধ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onGoToBarcode(p)}
                        className="p-1.5 text-slate-500 hover:text-[#00875a] hover:bg-emerald-50 rounded cursor-pointer"
                        title="বারকোড প্রিন্ট"
                      >
                        <Barcode className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
