import React, { useState } from 'react';
import { Supplier, PurchaseInvoice, Product, ProductCategory } from '../../types';
import { formatBDT, toBanglaNumber, playPOSBeep } from '../../utils/bengaliUtils';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  PackageCheck,
  X,
  CreditCard,
} from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  products: Product[];
  onAddPurchase: (purchase: PurchaseInvoice, updatedStockProductIds: { productId: string; qty: number }[]) => void;
  onAddSupplier: (supplier: Supplier) => void;
  soundEnabled: boolean;
}

export const PurchasesView: React.FC<Props> = ({
  suppliers,
  purchases,
  products,
  onAddPurchase,
  onAddSupplier,
  soundEnabled,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'purchases' | 'suppliers'>('purchases');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-11-08');
  
  // Purchase items
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState<string>('20');
  const [purchaseUnitCost, setPurchaseUnitCost] = useState<string>('750');
  const [paidAmount, setPaidAmount] = useState<string>('10000');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Add Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supOpeningDue, setSupOpeningDue] = useState('');

  const totalSupplierDues = suppliers.reduce((acc, s) => acc + s.balanceDue, 0);
  const totalPurchaseValue = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

  // Submit New Purchase Invoice
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(purchaseQty, 10) || 1;
    const unitCost = parseFloat(purchaseUnitCost) || 0;
    const total = qty * unitCost;
    const paid = parseFloat(paidAmount) || 0;
    const due = Math.max(0, total - paid);

    const targetProduct = products.find((p) => p.id === selectedProductId) || products[0];
    const targetSupplier = suppliers.find((s) => s.id === selectedSupplierId);

    const purchaseInvoice: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      purchaseNo: `PUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: selectedSupplierId || 'sup-new',
      supplierName: targetSupplier?.company || targetSupplier?.name || newSupplierName || 'পাইকারি মহাজন',
      date: purchaseDate,
      items: [
        {
          productId: targetProduct.id,
          productName: targetProduct.name,
          category: targetProduct.category,
          qty,
          unitCost,
          totalCost: total,
        },
      ],
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      notes: purchaseNotes.trim(),
    };

    onAddPurchase(purchaseInvoice, [{ productId: targetProduct.id, qty }]);
    if (soundEnabled) playPOSBeep('success');
    setIsPurchaseModalOpen(false);
  };

  // Submit New Supplier
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) {
      alert('মহাজনের নাম আবশ্যক!');
      return;
    }

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName.trim(),
      company: supCompany.trim() || supName.trim(),
      phone: supPhone.trim() || '—',
      address: supAddress.trim() || 'ইসলামপুর, ঢাকা',
      totalPurchased: 0,
      balanceDue: parseFloat(supOpeningDue) || 0,
    };

    onAddSupplier(newSup);
    if (soundEnabled) playPOSBeep('success');
    setIsSupplierModalOpen(false);
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupAddress('');
    setSupOpeningDue('');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">মহাজনদের পাওনা (আমাদের দেনা)</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {formatBDT(totalSupplierDues)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">মোট পাইকারি বকেয়া</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">মোট পাইকারি ক্রয় চালান</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {toBanglaNumber(purchases.length)} টি চালান
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            মোট ক্রয়: {formatBDT(totalPurchaseValue)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">নিবন্ধিত পাইকারি মহাজন</span>
          <div className="text-2xl font-bold font-mono text-teal-700 mt-1">
            {toBanglaNumber(suppliers.length)} টি প্রতিষ্ঠান
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ইসলামপুর, বাবুরহাট ও নারায়ণগঞ্জ</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSub('purchases')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTabSub === 'purchases'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ক্রয় চালানসমূহ
          </button>
          <button
            onClick={() => setActiveTabSub('suppliers')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTabSub === 'suppliers'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            মহাজন ও সরবরাহকারী তালিকা
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTabSub === 'suppliers' ? (
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + নতুন মহাজন যুক্ত করুন
            </button>
          ) : (
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + নতুন পাইকারি ক্রয় চালান
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Purchases or Suppliers List */}
      {activeTabSub === 'purchases' ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">চালান নং</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">মহাজন / সাপ্লায়ার</th>
                  <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                  <th className="py-3 px-4 text-right">মোট টাকা</th>
                  <th className="py-3 px-4 text-right">নগদ পরিশোধ</th>
                  <th className="py-3 px-4 text-right">বাকি টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {pur.purchaseNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{pur.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{pur.supplierName}</td>
                    <td className="py-3 px-4">
                      {pur.items.map((i, idx) => (
                        <div key={idx} className="text-slate-700">
                          {i.productName} ({toBanglaNumber(i.qty)} পিস @ {formatBDT(i.unitCost)})
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatBDT(pur.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                      {formatBDT(pur.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-bold ${pur.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatBDT(pur.dueAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">মহাজন ও প্রতিষ্ঠানের নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">ঠিকানা</th>
                  <th className="py-3 px-4 text-right">মোট সরবরাহ মূল্য</th>
                  <th className="py-3 px-4 text-right font-bold">আমাদের কাছে বকেয়া পাওনা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{sup.company}</div>
                      <div className="text-[11px] text-slate-500">প্রোপাইটর: {sup.name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sup.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{sup.address}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {formatBDT(sup.totalPurchased)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatBDT(sup.balanceDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Purchase Invoice */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">+ নতুন পাইকারি পণ্য চালান লিখুন</h3>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">মহাজন / সরবরাহকারী নির্বাচন করুন</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company} ({s.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">কোন পোশাক পণ্য কিনছেন?</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setPurchaseUnitCost(p.buyingPrice.toString());
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (বর্তমান স্টক: {p.stockQty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পরিমাণ (পিস) *</label>
                  <input
                    type="number"
                    required
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাইকারি দর (৳ প্রতি পিস) *</label>
                  <input
                    type="number"
                    required
                    value={purchaseUnitCost}
                    onChange={(e) => setPurchaseUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700">মোট চালানের মূল্য:</span>
                <span className="font-mono font-bold text-sm text-indigo-900">
                  {formatBDT((parseInt(purchaseQty, 10) || 0) * (parseFloat(purchaseUnitCost) || 0))}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মহাজনকে নগদ প্রদান (৳)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  চালান ও স্টক যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Supplier */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">+ নতুন পাইকারি মহাজন যোগ করুন</h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSupplierSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">মহাজনের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাজী মো: রিদওয়ান"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: রিদওয়ান টেক্সটাইল"
                  value={supCompany}
                  onChange={(e) => setSupCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">মার্কেট বা মোকামের ঠিকানা</label>
                <input
                  type="text"
                  placeholder="যেমন: ইসলামপুর পাইকারি মার্কেট, ঢাকা"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্রারম্ভিক বকেয়া পাওনা (যদি থাকে)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={supOpeningDue}
                  onChange={(e) => setSupOpeningDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
