import React, { useState, useRef, useEffect } from 'react';
import {
  Product,
  CartItem,
  SaleInvoice,
  Customer,
  PaymentMethod,
  ClothingSize,
} from '../../types';
import { playPOSBeep } from '../../utils/bengaliUtils';
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';

interface Props {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (invoice: SaleInvoice) => void;
  soundEnabled: boolean;
  onOpenInventory: () => void;
}

export const POSView: React.FC<Props> = ({
  products,
  customers,
  onCompleteSale,
  soundEnabled,
  onOpenInventory,
}) => {
  // Top green box quick scan state
  const [quickCodeOrName, setQuickCodeOrName] = useState('');
  const [quickProductName, setQuickProductName] = useState('');
  const [quickBuyingPrice, setQuickBuyingPrice] = useState<number>(0);

  // Line item selector row state (matching screenshot)
  const [lineCodeSearch, setLineCodeSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [lineQty, setLineQty] = useState<number>(1);
  const [linePrice, setLinePrice] = useState<number>(0);
  const [lineSize, setLineSize] = useState<ClothingSize>('M');
  const [lineColor, setLineColor] = useState<string>('স্ট্যান্ডার্ড');

  // Active cart items list
  const [cart, setCart] = useState<CartItem[]>([]);

  // Bill calculation state
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('নগদ');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected product if available
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const first = products[0];
      setSelectedProductId(first.id);
      setLinePrice(first.sellingPrice);
      setLineCodeSearch(first.barcode);
      setQuickProductName(first.name);
      setQuickBuyingPrice(first.buyingPrice);
    }
  }, [products]);

  // Handle product dropdown change
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setLinePrice(prod.sellingPrice);
      setLineCodeSearch(prod.barcode);
      setQuickProductName(prod.name);
      setQuickBuyingPrice(prod.buyingPrice);
      setLineSize(prod.sizes[0] || 'M');
      setLineColor(prod.availableColors[0] || 'স্ট্যান্ডার্ড');
    }
  };

  // Handle barcode quick search enter
  const handleQuickSearch = (query: string) => {
    setQuickCodeOrName(query);
    const match = products.find(
      (p) =>
        p.barcode.toLowerCase() === query.trim().toLowerCase() ||
        p.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (match) {
      setSelectedProductId(match.id);
      setQuickProductName(match.name);
      setQuickBuyingPrice(match.buyingPrice);
      setLinePrice(match.sellingPrice);
      setLineCodeSearch(match.barcode);
      setLineSize(match.sizes[0] || 'M');
      setLineColor(match.availableColors[0] || 'স্ট্যান্ডার্ড');
    }
  };

  // Add line item to cart ("+ পণ্য যোগ করুন")
  const handleAddToCart = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      alert('অনুগ্রহ করে একটি পণ্য নির্বাচন করুন!');
      return;
    }

    if (lineQty <= 0) {
      alert('সঠিক পরিমাণ (কমপক্ষে ১) দিন!');
      return;
    }

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      barcode: prod.barcode,
      name: prod.name,
      category: prod.category,
      size: lineSize,
      color: lineColor,
      unitPrice: linePrice,
      buyingPrice: prod.buyingPrice,
      qty: lineQty,
      subtotal: lineQty * linePrice,
    };

    setCart((prev) => [newItem, ...prev]);
    if (soundEnabled) playPOSBeep('scan');

    // Reset line quantity for next item
    setLineQty(1);
  };

  // Remove item from cart
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear single selected line
  const handleClearLine = () => {
    setLineQty(1);
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      setLinePrice(prod.sellingPrice);
    }
  };

  // Bill Calculations
  const totalBill = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const payableAmount = Math.max(0, totalBill - discountAmount);

  // Autocomplete customer
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    const existing = customers.find(
      (c) => c.phone.replace(/[^0-9]/g, '') === val.replace(/[^0-9]/g, '') && val.length >= 6
    );
    if (existing) {
      setCustomerName(existing.name);
    }
  };

  // Complete Sale ("✓ বিক্রয় সম্পূর্ণ করুন")
  const handleCompleteSaleSubmit = () => {
    if (cart.length === 0) {
      if (soundEnabled) playPOSBeep('alert');
      alert('কার্ট খালি! প্রথমে "+ পণ্য যোগ করুন" বোতামে ক্লিক করে পণ্য যোগ করুন।');
      return;
    }

    if (paymentMethod === 'বাকি' && !customerName.trim() && !customerPhone.trim()) {
      alert('বাকি বিক্রির জন্য ক্রেতার নাম বা মোবাইল নম্বর আবশ্যক!');
      return;
    }

    const invoiceNo = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const dateStr = '2026-11-08';
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr = `${hours >= 12 ? 'বিকাল' : 'সকাল'} ${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes}`;

    const paidVal =
      paidAmountInput !== ''
        ? parseFloat(paidAmountInput) || 0
        : paymentMethod === 'বাকি'
        ? 0
        : payableAmount;

    const dueAmount = Math.max(0, payableAmount - paidVal);

    const newInvoice: SaleInvoice = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateStr,
      time: timeStr,
      customerName: customerName.trim() || 'খুচরা গ্রাহক',
      customerPhone: customerPhone.trim(),
      items: [...cart],
      totalQty: cart.reduce((acc, i) => acc + i.qty, 0),
      subtotal: totalBill,
      discountType: 'flat',
      discountValue: discountAmount,
      discountAmount,
      netPayable: payableAmount,
      paidAmount: paidVal,
      dueAmount,
      paymentMethod,
    };

    if (soundEnabled) playPOSBeep('success');
    onCompleteSale(newInvoice);

    // Reset Form
    setCart([]);
    setDiscountAmount(0);
    setCustomerName('');
    setCustomerPhone('');
    setPaidAmountInput('');
    setPaymentMethod('নগদ');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 1. TOP GREEN BOX (Exact recreation of Image 1 top green bar) */}
      <div className="bg-[#00875a] text-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-[#00744d]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Left Title: Cart Icon + পণ্য বিক্রয় */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="p-1.5 bg-amber-400 text-slate-900 rounded-lg shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-white">পণ্য বিক্রয়</h2>
          </div>

          {/* Center Field 1: কোড / নাম লিখুন */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold text-white/95 block mb-1">
              কোড / নাম লিখুন
            </label>
            <input
              type="text"
              placeholder="পণ্যের কোড বা নাম"
              value={quickCodeOrName}
              onChange={(e) => handleQuickSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-medium focus:outline-hidden shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* Center Field 2: পণ্যের নাম */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-white/95 block mb-1">
              পণ্যের নাম
            </label>
            <input
              type="text"
              readOnly
              value={quickProductName}
              placeholder="পণ্যের নাম"
              className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-medium focus:outline-hidden shadow-2xs truncate"
            />
          </div>

          {/* Right Field 3: ক্রয়মূল্য Display Box */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-white/95 block mb-1">
              ক্রয়মূল্য
            </label>
            <div className="w-full px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold font-mono shadow-2xs text-center">
              ৳ {quickBuyingPrice.toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* 2. MIDDLE LINE ITEM ROW (Exact recreation of Image 1 middle card) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end">
          
          {/* Column 1: পণ্যের কোড / খোঁজ */}
          <div className="col-span-12 sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              পণ্যের কোড / খোঁজ
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="কোড বা নাম"
                value={lineCodeSearch}
                onChange={(e) => handleQuickSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Column 2: পণ্যের নাম Dropdown */}
          <div className="col-span-12 sm:col-span-4">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              পণ্যের নাম
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-[#00875a] focus:outline-hidden text-slate-800 truncate"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (মজুদ: {p.stockQty})
                </option>
              ))}
            </select>
          </div>

          {/* Column 3: পরিমাণ */}
          <div className="col-span-4 sm:col-span-1">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              পরিমাণ
            </label>
            <input
              type="number"
              min="1"
              value={lineQty}
              onChange={(e) => setLineQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-2 py-1.5 text-xs text-center font-mono font-bold bg-white border border-slate-200 rounded-lg focus:border-[#00875a] focus:outline-hidden"
            />
          </div>

          {/* Column 4: দাম */}
          <div className="col-span-4 sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              দাম
            </label>
            <input
              type="number"
              value={linePrice}
              onChange={(e) => setLinePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-slate-200 rounded-lg focus:border-[#00875a] focus:outline-hidden text-right"
            />
          </div>

          {/* Column 5: মোট (Display Box with light blue tint) */}
          <div className="col-span-3 sm:col-span-1.5">
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              মোট
            </label>
            <div className="w-full py-1.5 px-2 bg-[#e8f1fc] border border-blue-200/60 text-slate-800 rounded-lg text-xs font-bold font-mono text-center">
              ৳ {(lineQty * linePrice).toFixed(2)}
            </div>
          </div>

          {/* Column 6: বাদ (Red cross button) */}
          <div className="col-span-1 sm:col-span-0.5 flex justify-center">
            <button
              type="button"
              onClick={handleClearLine}
              className="w-8 h-8 flex items-center justify-center bg-[#ffebeb] text-rose-600 hover:bg-rose-200 rounded-lg transition cursor-pointer"
              title="বাদ দিন"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. ACTIVE CART ITEMS TABLE (Shown when items are added) */}
      {cart.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden animate-in fade-in">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              কার্টে যুক্ত আইটেম ({cart.length} টি)
            </span>
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-rose-600 hover:underline font-medium cursor-pointer"
            >
              সব খালি করুন
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2 px-4">পণ্যের নাম</th>
                  <th className="py-2 px-3 text-center">পরিমাণ</th>
                  <th className="py-2 px-3 text-right">দর</th>
                  <th className="py-2 px-3 text-right">মোট</th>
                  <th className="py-2 px-3 text-center">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {item.name}
                      <span className="text-[10px] text-slate-400 block font-mono">{item.barcode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                      {item.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      ৳ {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ৳ {item.subtotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TWO COLUMNS: "বিলের হিসাব" & "বিক্রয়ের কাজ" (Exact recreation of Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Column: বিলের হিসাব */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 pb-1">বিলের হিসাব</h3>

          {/* মোট বিল */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              মোট বিল
            </label>
            <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono text-slate-900">
              ৳ {totalBill.toFixed(2)}
            </div>
          </div>

          {/* ডিসকাউন্ট (টাকা) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              ডিসকাউন্ট (টাকা)
            </label>
            <input
              type="number"
              min="0"
              value={discountAmount || ''}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:border-[#00875a] focus:outline-hidden"
            />
          </div>

          {/* পরিশোধযোগ্য টাকা (Exact light green highlighted box from screenshot) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              পরিশোধযোগ্য টাকা
            </label>
            <div className="w-full px-3 py-2.5 bg-[#dcfce7] border border-emerald-300 rounded-lg text-base font-bold font-mono text-emerald-950">
              ৳ {payableAmount.toFixed(2)}
            </div>
          </div>

          {/* Customer info & payment selector for completeness */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">ক্রেতার নাম</label>
                <input
                  type="text"
                  placeholder="নাম লিখুন"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">মোবাইল নম্বর</label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500">পেমেন্ট:</span>
              {(['নগদ', 'বিকাশ', 'বাকি'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                    paymentMethod === m
                      ? m === 'বাকি'
                        ? 'bg-rose-600 text-white'
                        : 'bg-[#00875a] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: বিক্রয়ের কাজ (Exact Blue & Green Buttons from Image 1) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-3">বিক্রয়ের কাজ</h3>

            <div className="space-y-3 mt-1">
              {/* Blue Button: + পণ্য যোগ করুন */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3 px-4 bg-[#1e6cd9] hover:bg-[#1a5ec2] active:scale-98 text-white text-sm font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 font-bold" />
                <span>+ পণ্য যোগ করুন</span>
              </button>

              {/* Green Button: ✓ বিক্রয় সম্পূর্ণ করুন */}
              <button
                type="button"
                onClick={handleCompleteSaleSubmit}
                className="w-full py-3 px-4 bg-[#16a34a] hover:bg-[#15803d] active:scale-98 text-white text-sm font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 font-bold" />
                <span>✓ বিক্রয় সম্পূর্ণ করুন</span>
              </button>
            </div>
          </div>

          {/* Quick instructions / count badge */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600">
            <div className="flex justify-between items-center mb-1">
              <span>বর্তমানে কার্টে মোট পণ্য:</span>
              <span className="font-mono font-bold text-slate-900">{cart.length} টি</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-bold">
              <span>মোট টাকা:</span>
              <span className="font-mono">৳ {payableAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM NOTICE (Exact caption from Image 1) */}
      <div className="text-center py-1">
        <p className="text-xs text-slate-500 font-medium">
          বিক্রয় সংরক্ষণের আগে পণ্য, পরিমাণ ও স্টক যাচাই করুন।
        </p>
      </div>

    </div>
  );
};
