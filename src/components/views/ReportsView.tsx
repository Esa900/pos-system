import React, { useState } from 'react';
import { SaleInvoice, Expense, Product, Customer } from '../../types';
import { formatBDT, toBanglaNumber } from '../../utils/bengaliUtils';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Shirt,
  Receipt,
  Wallet,
} from 'lucide-react';

interface Props {
  sales: SaleInvoice[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
}

export const ReportsView: React.FC<Props> = ({
  sales,
  expenses,
  products,
  customers,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter sales & expenses based on dateFilter
  const todayStr = '2026-11-08';
  
  const filteredSales = sales.filter((s) => {
    if (dateFilter === 'today') return s.date === todayStr;
    if (dateFilter === 'week') return s.date >= '2026-11-02';
    if (dateFilter === 'month') return s.date >= '2026-11-01';
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (dateFilter === 'today') return e.date === todayStr;
    if (dateFilter === 'week') return e.date >= '2026-11-02';
    if (dateFilter === 'month') return e.date >= '2026-11-01';
    return true;
  });

  // Financial calculations
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.netPayable, 0);
  const totalUnitsSold = filteredSales.reduce((acc, s) => acc + s.totalQty, 0);

  const costOfGoodsSold = filteredSales.reduce((acc, s) => {
    const itemCost = s.items.reduce((sum, item) => sum + item.buyingPrice * item.qty, 0);
    return acc + itemCost;
  }, 0);

  const grossProfit = totalSalesRevenue - costOfGoodsSold;
  const grossProfitMargin = totalSalesRevenue > 0 ? Math.round((grossProfit / totalSalesRevenue) * 100) : 0;

  const totalOperatingExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const netProfitMargin = totalSalesRevenue > 0 ? Math.round((netProfit / totalSalesRevenue) * 100) : 0;

  // Payment Breakdown
  const paymentBreakdown = {
    নগদ: filteredSales.filter((s) => s.paymentMethod === 'নগদ').reduce((acc, s) => acc + s.paidAmount, 0),
    বিকাশ: filteredSales.filter((s) => s.paymentMethod === 'বিকাশ').reduce((acc, s) => acc + s.paidAmount, 0),
    বাকি: filteredSales.reduce((acc, s) => acc + s.dueAmount, 0),
  };

  // Top Selling Products in this period
  const productSalesMap: { [prodId: string]: { name: string; qty: number; revenue: number; category: string } } = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.name,
          qty: 0,
          revenue: 0,
          category: item.category,
        };
      }
      productSalesMap[item.productId].qty += item.qty;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Category breakdown
  const categorySalesMap: { [cat: string]: number } = {};
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      categorySalesMap[item.category] = (categorySalesMap[item.category] || 0) + item.subtotal;
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'ইনভয়েস নং,তারিখ,গ্রাহক,মোট টাকা,পরিশোধিত,বাকি,পেমেন্ট টাইপ\n';
    const rows = filteredSales.map((s) => 
      `${s.invoiceNo},${s.date},${s.customerName || 'খুচরা'},${s.netPayable},${s.paidAmount},${s.dueAmount},${s.paymentMethod}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Report_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Date Filter strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">দোকানের আর্থিক ও লাভ-ক্ষতি রিপোর্ট</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট বিক্রি, ক্রয় খরচ ও দোকান খরচের সমন্বয়ে প্রকৃত নিট মুনাফার হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Filter Tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer ${
                dateFilter === 'today' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              আজকে
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer ${
                dateFilter === 'week' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              এই সপ্তাহ
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer ${
                dateFilter === 'month' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              এই মাস (নভেম্বর)
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer ${
                dateFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
              }`}
            >
              সব সময়
            </button>
          </div>

          {/* Export & Print */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV এক্সপোর্ট
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            প্রিন্ট
          </button>
        </div>
      </div>

      {/* Profit & Loss Comprehensive Statement Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">লাভ-ক্ষতি বিবরণী (Income Statement)</h3>
            <p className="text-xs text-slate-500">KHAN MANAGEMENT - নির্বাচিত সময়কাল</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
            মোট বিক্রি চালান: {toBanglaNumber(filteredSales.length)} টি
          </span>
        </div>

        {/* Statement Step-by-Step Waterfall */}
        <div className="space-y-3 font-sans">
          
          {/* Row 1: Total Sales Revenue */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">১. মোট পণ্য বিক্রয় (Gross Sales Revenue)</div>
              <div className="text-[11px] text-slate-500">মোট বিক্রিত পোশাক {toBanglaNumber(totalUnitsSold)} পিস</div>
            </div>
            <div className="text-base font-bold font-mono text-slate-900">
              (+) {formatBDT(totalSalesRevenue)}
            </div>
          </div>

          {/* Row 2: COGS */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">২. বিক্রিত কাপড়ের পাইকারি ক্রয়মূল্য (COGS)</div>
              <div className="text-[11px] text-slate-500">মহাজনদের কাছ থেকে কেনা দাম হিসাব</div>
            </div>
            <div className="text-base font-bold font-mono text-rose-600">
              (-) {formatBDT(costOfGoodsSold)}
            </div>
          </div>

          {/* Row 3: Gross Profit */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-teal-50/70 border border-teal-200">
            <div>
              <div className="text-xs font-bold text-teal-950">৩. গ্রস প্রফিট / মোট লাভ (Gross Profit)</div>
              <div className="text-[11px] text-teal-700">বিক্রি থেকে কাপড় কেনা দাম বাদ</div>
            </div>
            <div className="text-lg font-bold font-mono text-teal-800">
              = {formatBDT(grossProfit)}
              <span className="text-xs font-normal text-teal-600 ml-1.5">({toBanglaNumber(grossProfitMargin)}%)</span>
            </div>
          </div>

          {/* Row 4: Total Shop Expenses */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">৪. দোকানের মোট পরিচালন ব্যয় (Operating Expenses)</div>
              <div className="text-[11px] text-slate-500">ভাড়া, বিদ্যুৎ, নাস্তা, পরিবহন ও অন্যান্য খরচ</div>
            </div>
            <div className="text-base font-bold font-mono text-rose-600">
              (-) {formatBDT(totalOperatingExpenses)}
            </div>
          </div>

          {/* Row 5: Real Net Profit */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-md">
            <div>
              <div className="text-sm font-bold">৫. আসল নিট মুনাফা (Net Profit)</div>
              <div className="text-xs text-indigo-200">সমস্ত খরচ বাদে দোকানের খাঁটি লাভ</div>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300">
              = {formatBDT(netProfit)}
              <span className="text-xs font-medium text-emerald-200 ml-2">({toBanglaNumber(netProfitMargin)}% মার্জিন)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Payment Method Breakdown & Top Selling Clothes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Payment Methods */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-600" />
            পরিশোধের ধরণ অনুযায়ী প্রাপ্তি
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-medium text-slate-700">নগদ ক্যাশ প্রাপ্তি:</span>
              <span className="font-mono font-bold text-slate-900">{formatBDT(paymentBreakdown.নগদ)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-medium text-slate-700">বিকাশ / এমএফএস প্রাপ্তি:</span>
              <span className="font-mono font-bold text-slate-900">{formatBDT(paymentBreakdown.বিকাশ)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200/80">
              <span className="text-xs font-medium text-rose-800">নতুন সৃষ্ট বকেয়া বাকি:</span>
              <span className="font-mono font-bold text-rose-700">{formatBDT(paymentBreakdown.বাকি)}</span>
            </div>
          </div>
        </div>

        {/* Top Selling Clothes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-teal-600" />
            সেরা বিক্রীত পোশাক তালিকা
          </h3>

          <div className="space-y-2.5">
            {topProducts.slice(0, 5).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-mono font-bold text-[10px] text-slate-600">
                    {toBanglaNumber(idx + 1)}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 truncate max-w-[180px]">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">{formatBDT(p.revenue)}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{toBanglaNumber(p.qty)} পিস</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
