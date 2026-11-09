import React from 'react';
import { SaleInvoice, Product, Customer, Expense } from '../../types';
import { formatBDT, toBanglaNumber } from '../../utils/bengaliUtils';
import {
  TrendingUp,
  DollarSign,
  Package,
  BookOpen,
  Wallet,
  ArrowUpRight,
  Printer,
  Shirt,
  AlertTriangle,
  ShoppingBag,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface Props {
  sales: SaleInvoice[];
  products: Product[];
  customers: Customer[];
  expenses: Expense[];
  onOpenPOS: () => void;
  onOpenInventory: () => void;
  onOpenBakiKhata: () => void;
  onSelectInvoice: (invoice: SaleInvoice) => void;
}

export const DashboardView: React.FC<Props> = ({
  sales,
  products,
  customers,
  expenses,
  onOpenPOS,
  onOpenInventory,
  onOpenBakiKhata,
  onSelectInvoice,
}) => {
  // Calculations
  const todayStr = '2026-11-08';
  const todaySales = sales.filter((s) => s.date === todayStr);

  const todaySaleTotal = todaySales.reduce((acc, s) => acc + s.netPayable, 0);

  // Today's Profit: Sales revenue - cost of goods sold - today expenses
  const todayCOGS = todaySales.reduce((acc, s) => {
    const itemCost = s.items.reduce((sum, item) => sum + (item.buyingPrice * item.qty), 0);
    return acc + itemCost;
  }, 0);

  const todayExpenseTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  const todayGrossProfit = todaySaleTotal - todayCOGS;
  const todayNetProfit = todayGrossProfit - todayExpenseTotal;

  // Total stock value (buying price * available qty)
  const totalStockValue = products.reduce((acc, p) => acc + (p.buyingPrice * p.stockQty), 0);
  const totalSellingStockValue = products.reduce((acc, p) => acc + (p.sellingPrice * p.stockQty), 0);

  // Total Dues from all customers
  const totalDues = customers.reduce((acc, c) => acc + c.totalDue, 0);

  // Cash in hand estimation (total cash sales - cash expenses)
  const cashSalesTotal = todaySales
    .filter((s) => s.paymentMethod === 'নগদ')
    .reduce((acc, s) => acc + s.paidAmount, 0);
  const cashExpensesTotal = expenses
    .filter((e) => e.date === todayStr && e.paymentMethod === 'নগদ')
    .reduce((acc, e) => acc + e.amount, 0);
  const cashInHand = Math.max(0, 15400 + cashSalesTotal - cashExpensesTotal);

  // Low stock products count
  const lowStockProducts = products.filter((p) => p.stockQty <= p.minStockLevel);

  // Category sales breakdown
  const categorySalesMap: { [cat: string]: { qty: number; total: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!categorySalesMap[item.category]) {
        categorySalesMap[item.category] = { qty: 0, total: 0 };
      }
      categorySalesMap[item.category].qty += item.qty;
      categorySalesMap[item.category].total += item.subtotal;
    });
  });

  const categoryList = Object.entries(categorySalesMap)
    .map(([cat, val]) => ({ category: cat, ...val }))
    .sort((a, b) => b.total - a.total);

  const maxCategoryTotal = Math.max(...categoryList.map((c) => c.total), 1);

  // Weekly sales trend mock for visual chart
  const weeklyTrend = [
    { day: 'সোম', date: '০২ নব.', amount: 14200, profit: 4600 },
    { day: 'মঙ্গল', date: '০৩ নব.', amount: 18500, profit: 5900 },
    { day: 'বুধ', date: '০৪ নব.', amount: 12900, profit: 4100 },
    { day: 'বৃহঃ', date: '০৫ নব.', amount: 21400, profit: 7100 },
    { day: 'শুক্র', date: '০৬ নব.', amount: 32600, profit: 10800 },
    { day: 'শনি', date: '০৭ নব.', amount: 26800, profit: 8900 },
    { day: 'রবি (আজ)', date: '০৮ নব.', amount: todaySaleTotal > 0 ? todaySaleTotal : 15800, profit: todayNetProfit > 0 ? todayNetProfit : 5200 },
  ];
  const maxTrend = Math.max(...weeklyTrend.map((t) => t.amount));

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-teal-900 rounded-xl p-5 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">KHAN MANAGEMENT ড্যাশবোর্ড</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
              লাইভ শপ কাউন্টার
            </span>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            আজকের দিনলিপি, স্টক তথ্য, MFS ও বাকি খাতার হিসাব
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPOS}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg transition shadow-md active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            কাউন্টারে নতুন বিক্রি
          </button>
        </div>
      </div>

      {/* 5 Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Today's Sale */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">আজকের বিক্রি</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatBDT(todaySaleTotal)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{toBanglaNumber(todaySales.length)} টি মেমো কাটা হয়েছে</span>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">আজকের নিট লাভ</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatBDT(todayNetProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            খরচ বাদ দিয়ে আনুমানিক মুনাফা
          </div>
        </div>

        {/* Card 3: Total Stock Value */}
        <div 
          onClick={onOpenInventory}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-teal-300 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">মোট স্টক মূল্য</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatBDT(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>বিক্রয় মূল্য: {formatBDT(totalSellingStockValue)}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
          </div>
        </div>

        {/* Card 4: Total Dues */}
        <div 
          onClick={onOpenBakiKhata}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-rose-300 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">মোট বকেয়া বাকি</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-rose-600">
            {formatBDT(totalDues)}
          </div>
          <div className="text-[11px] text-rose-600/80 font-medium mt-2 flex items-center justify-between">
            <span>{toBanglaNumber(customers.filter(c => c.totalDue > 0).length)} জন বাকি গ্রাহক</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
          </div>
        </div>

        {/* Card 5: Cash in Hand */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">ক্যাশ টাকা (ড্রয়ার)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatBDT(cashInHand)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            ড্রয়ারে নগদ জমা বর্তমান ব্যালেন্স
          </div>
        </div>

      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">
                সতর্কতা: {toBanglaNumber(lowStockProducts.length)}টি পোশাকের স্টক ফুরিয়ে আসছে!
              </p>
              <p className="text-[11px] text-amber-700">
                {lowStockProducts.map(p => `${p.name} (${toBanglaNumber(p.stockQty)} পিস)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInventory}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition self-start sm:self-auto cursor-pointer shrink-0"
          >
            স্টক রি-অর্ডার দেখুন
          </button>
        </div>
      )}

      {/* Visual Charts Grid: 7-day Sales Trend & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Sales & Profit Visual Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">সাপ্তাহিক বিক্রি ও লাভের ট্রেন্ড</h3>
              <p className="text-[11px] text-slate-500">গত ৭ দিনের দৈনিক মোট বিক্রি ও প্রাক্কলিত নিট লাভ</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600" />
                <span className="text-slate-600">মোট বিক্রি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-teal-500" />
                <span className="text-slate-600">নিট লাভ</span>
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {weeklyTrend.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxTrend) * 100);
              const profitHeight = Math.round((item.profit / maxTrend) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none mb-1 text-center">
                    <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono block">
                      {formatBDT(item.amount)}
                    </span>
                  </div>

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 h-full max-w-[42px]">
                    <div
                      className="w-1/2 bg-indigo-600 rounded-t-sm transition-all duration-300 hover:bg-indigo-700"
                      style={{ height: `${heightPercent}%` }}
                      title={`বিক্রি: ${formatBDT(item.amount)}`}
                    />
                    <div
                      className="w-1/2 bg-teal-500 rounded-t-sm transition-all duration-300 hover:bg-teal-600"
                      style={{ height: `${profitHeight}%` }}
                      title={`লাভ: ${formatBDT(item.profit)}`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="text-center mt-2">
                    <div className="text-xs font-semibold text-slate-800">{item.day}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Categories */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm">জনপ্রিয় পোশাক ক্যাটাগরি</h3>
            <p className="text-[11px] text-slate-500">চলতি বিক্রির হার অনুসারে সাজানো</p>
          </div>

          <div className="space-y-3.5 flex-1 justify-center">
            {categoryList.slice(0, 5).map((cat, idx) => {
              const percent = Math.round((cat.total / maxCategoryTotal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-indigo-600" />
                      {cat.category}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatBDT(cat.total)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-indigo-600'
                          : idx === 1
                          ? 'bg-teal-500'
                          : idx === 2
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{toBanglaNumber(cat.qty)} পিস বিক্রিত</span>
                    <span>{toBanglaNumber(percent)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:px-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">সাম্প্রতিক বিক্রির তালিকা</h3>
            <p className="text-[11px] text-slate-500">কাউন্টারের সর্বশেষ মেমোর তথ্য</p>
          </div>
          <button
            onClick={onOpenPOS}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>নতুন মেমো কাটুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-4">ইনভয়েস নং</th>
                <th className="py-2.5 px-4">তারিখ ও সময়</th>
                <th className="py-2.5 px-4">গ্রাহকের নাম ও ফোন</th>
                <th className="py-2.5 px-4">পোশাক ও পরিমাণ</th>
                <th className="py-2.5 px-4 text-right">মোট টাকা</th>
                <th className="py-2.5 px-4 text-center">পরিশোধের ধরণ</th>
                <th className="py-2.5 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {sale.invoiceNo}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{sale.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{sale.date}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{sale.customerName || 'খুচরা গ্রাহক'}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{sale.customerPhone || '—'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {sale.items.map((i) => i.name).join(', ')}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      মোট {toBanglaNumber(sale.totalQty)} পিস
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatBDT(sale.netPayable)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        sale.paymentMethod === 'নগদ'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sale.paymentMethod === 'বাকি'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectInvoice(sale)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                      title="রসিদ দেখুন ও প্রিন্ট করুন"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
