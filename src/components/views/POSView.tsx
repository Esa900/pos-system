import React, { useState, useRef, useEffect } from 'react';
import {
  Product,
  CartItem,
  SaleInvoice,
  Customer,
  PaymentMethod,
  ClothingSize,
  ProductCategory,
} from '../../types';
import { playPOSBeep, toBanglaNumber } from '../../utils/bengaliUtils';
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  PackagePlus,
  Printer,
  Sparkles,
} from 'lucide-react';

interface Props {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (invoice: SaleInvoice) => void;
  soundEnabled: boolean;
  onOpenInventory: () => void;
  onAddProduct?: (product: Product) => void;
}

export const POSView: React.FC<Props> = ({
  products,
  customers,
  onCompleteSale,
  soundEnabled,
  onOpenInventory,
  onAddProduct,
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

  // Quick Add Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('পাঞ্জাবি');
  const [newProductSize, setNewProductSize] = useState<ClothingSize>('L');
  const [newProductColor, setNewProductColor] = useState('কালো');
  const [newProductBuyingPrice, setNewProductBuyingPrice] = useState<string>('500');
  const [newProductSellingPrice, setNewProductSellingPrice] = useState<string>('850');
  const [newProductStock, setNewProductStock] = useState<string>('20');
  const [newProductBarcode, setNewProductBarcode] = useState('');

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
  }, [products, selectedProductId]);

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
    setLineCodeSearch(query);
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
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  // Active items calculation (either cart items, or if cart is empty, current line item preview)
  const currentLineSubtotal = lineQty * linePrice;
  const cartTotalBill = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalBill = cart.length > 0 ? cartTotalBill : currentLineSubtotal;
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

  // 1-Click Fast Confirm Sell (এক ক্লিকে মেমো ও সেল কনফার্ম)
  const handleCompleteSaleSubmit = () => {
    // If cart has items, use cart. If cart is empty, use the current active line item!
    let itemsToSell: CartItem[] = [];

    if (cart.length > 0) {
      itemsToSell = [...cart];
    } else {
      const prod = products.find((p) => p.id === selectedProductId);
      if (!prod) {
        if (soundEnabled) playPOSBeep('alert');
        alert('অনুগ্রহ করে বিক্রির জন্য একটি পণ্য নির্বাচন করুন!');
        return;
      }
      if (lineQty <= 0) {
        alert('সঠিক পরিমাণ দিন!');
        return;
      }
      itemsToSell = [
        {
          id: `cart-${Date.now()}`,
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
        },
      ];
    }

    if (paymentMethod === 'বাকি' && !customerName.trim() && !customerPhone.trim()) {
      alert('বাকি বিক্রির জন্য ক্রেতার নাম বা মোবাইল নম্বর আবশ্যক!');
      return;
    }

    const calculatedTotal = itemsToSell.reduce((acc, i) => acc + i.subtotal, 0);
    const calculatedPayable = Math.max(0, calculatedTotal - discountAmount);
    const totalCost = itemsToSell.reduce((acc, i) => acc + (i.buyingPrice * i.qty), 0);
    const calculatedProfit = calculatedPayable - totalCost;

    // Generate Invoice ID matching exact user image screenshot INV-YYYYMMDD-XXXX
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const seq = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNo = `INV-${dateCode}-${seq}`;
    const dateFormatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeFormatted = `${pad(hours > 12 ? hours - 12 : hours || 12)}:${pad(minutes)} ${hours >= 12 ? 'PM' : 'AM'}`;

    const paidVal =
      paidAmountInput !== ''
        ? parseFloat(paidAmountInput) || 0
        : paymentMethod === 'বাকি'
        ? 0
        : calculatedPayable;

    const dueAmount = Math.max(0, calculatedPayable - paidVal);

    const newInvoice: SaleInvoice = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateFormatted,
      time: timeFormatted,
      customerName: customerName.trim() || 'খুচরা গ্রাহক',
      customerPhone: customerPhone.trim(),
      items: itemsToSell,
      totalQty: itemsToSell.reduce((acc, i) => acc + i.qty, 0),
      subtotal: calculatedTotal,
      discountType: 'flat',
      discountValue: discountAmount,
      discountAmount,
      netPayable: calculatedPayable,
      paidAmount: paidVal,
      dueAmount,
      paymentMethod,
      totalCost,
      profit: calculatedProfit,
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
    setLineQty(1);
  };

  // Open Quick Add Product Modal with generated barcode
  const handleOpenAddProductModal = () => {
    const autoBarcode = `890124${Math.floor(1000 + Math.random() * 9000)}`;
    setNewProductBarcode(autoBarcode);
    setNewProductName('');
    setNewProductBuyingPrice('500');
    setNewProductSellingPrice('850');
    setNewProductStock('20');
    setIsAddProductOpen(true);
  };

  // Save new product instant stock add
  const handleSaveQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      alert('পণ্যের নাম লিখুন!');
      return;
    }

    const bPrice = parseFloat(newProductBuyingPrice) || 0;
    const sPrice = parseFloat(newProductSellingPrice) || 0;
    const stock = parseInt(newProductStock, 10) || 0;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      barcode: newProductBarcode.trim() || `890124${Date.now().toString().slice(-4)}`,
      name: newProductName.trim(),
      category: newProductCategory,
      sizes: [newProductSize],
      availableColors: [newProductColor.trim() || 'স্ট্যান্ডার্ড'],
      buyingPrice: bPrice,
      sellingPrice: sPrice,
      stockQty: stock,
      minStockLevel: 5,
      createdAt: '2026-11-08',
    };

    if (onAddProduct) {
      onAddProduct(newProd);
    }

    // Instantly select this newly added product in POS
    setSelectedProductId(newProd.id);
    setQuickProductName(newProd.name);
    setQuickBuyingPrice(newProd.buyingPrice);
    setLinePrice(newProd.sellingPrice);
    setLineCodeSearch(newProd.barcode);
    setLineSize(newProductSize);
    setLineColor(newProductColor.trim() || 'স্ট্যান্ডার্ড');

    if (soundEnabled) playPOSBeep('success');
    setIsAddProductOpen(false);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* 1. TOP GREEN BOX (Exact recreation of Image 1 top green bar + Quick Add Button) */}
      <div className="bg-[#00875a] text-white rounded-xl p-3.5 sm:p-4 shadow-sm border border-[#00744d]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Left Title: Cart Icon + পণ্য বিক্রয় + Quick Add Button */}
          <div className="md:col-span-3 flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400 text-slate-900 rounded-lg shadow-xs">
                <ShoppingCart className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-white">পণ্য বিক্রয়</h2>
            </div>
            
            <button
              type="button"
              onClick={handleOpenAddProductModal}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="দ্রুত নতুন পণ্য ও স্টক অ্যাড করুন"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>+ Add</span>
            </button>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600">
                পণ্যের নাম
              </label>
              <button
                type="button"
                onClick={handleOpenAddProductModal}
                className="text-[10px] text-teal-700 hover:underline font-semibold cursor-pointer"
              >
                + নতুন পণ্য
              </button>
            </div>
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

          {/* Column 5: মোট (Display Box with light blue tint matching Image 1) */}
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

      {/* 3. ACTIVE CART ITEMS TABLE (Shown when multiple items are added) */}
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

        {/* Right Column: বিক্রয়ের কাজ (Blue & Green Buttons) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-slate-800">বিক্রয়ের কাজ</h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                1-Click Fast POS
              </span>
            </div>

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

              {/* Green Button: ✓ Confirm Sell (মেমো ও বিক্রি কনফার্ম) */}
              <button
                type="button"
                onClick={handleCompleteSaleSubmit}
                className="w-full py-3.5 px-4 bg-[#16a34a] hover:bg-[#15803d] active:scale-98 text-white text-sm font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 font-bold" />
                <span>✓ Confirm Sell (মেমো ও বিক্রি কনফার্ম)</span>
              </button>
            </div>
          </div>

          {/* Quick instructions / count badge */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>কার্টে মোট পণ্য:</span>
              <span className="font-mono font-bold text-slate-900">
                {cart.length > 0 ? `${cart.length} টি` : `১ টি (সরাসরি নির্বাচন)`}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 font-bold">
              <span>মোট পরিশোধযোগ্য:</span>
              <span className="font-mono text-sm">৳ {payableAmount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
              * Confirm Sell চাপলেই অটোমেটিক মেমো প্রিন্ট ও ড্যাশবোর্ডে লাইভ আপডেট হবে
            </p>
          </div>
        </div>

      </div>

      {/* 5. BOTTOM NOTICE (Exact caption from Image 1) */}
      <div className="text-center py-1">
        <p className="text-xs text-slate-500 font-medium">
          বিক্রয় সংরক্ষণের আগে পণ্য, পরিমাণ ও স্টক যাচাই করুন।
        </p>
      </div>

      {/* 6. QUICK ADD PRODUCT MODAL (দ্রুত স্টক অ্যাড করার অপশন) */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#00875a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">নতুন পণ্য / দ্রুত স্টক অ্যাড</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuickProduct} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  পণ্যের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এক্সক্লুসিভ সেমি-লং সুতি পাঞ্জাবি / পোলো টি-শার্ট"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden"
                />
              </div>

              {/* Category & Size Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden bg-white"
                  >
                    <option value="পাঞ্জাবি">পাঞ্জাবি</option>
                    <option value="শার্ট">শার্ট</option>
                    <option value="প্যান্ট">প্যান্ট</option>
                    <option value="থ্রি-পিস">থ্রি-পিস</option>
                    <option value="টি-শার্ট">টি-শার্ট</option>
                    <option value="শাড়ি">শাড়ি</option>
                    <option value="বাচ্চাদের পোশাক">বাচ্চাদের পোশাক</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    সাইজ (Size)
                  </label>
                  <select
                    value={newProductSize}
                    onChange={(e) => setNewProductSize(e.target.value as ClothingSize)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden bg-white font-mono"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="38">38</option>
                    <option value="40">40</option>
                    <option value="42">42</option>
                    <option value="30">30</option>
                    <option value="32">32</option>
                    <option value="34">34</option>
                    <option value="Free">Free Size</option>
                  </select>
                </div>
              </div>

              {/* Color & Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    কালার / রঙ
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: নেভি ব্লু / মেরুন / কালো"
                    value={newProductColor}
                    onChange={(e) => setNewProductColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    বারকোড নম্বর
                  </label>
                  <input
                    type="text"
                    value={newProductBarcode}
                    onChange={(e) => setNewProductBarcode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Buying Price, Selling Price & Stock Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ক্রয়মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProductBuyingPrice}
                    onChange={(e) => setNewProductBuyingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    বিক্রয়মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProductSellingPrice}
                    onChange={(e) => setNewProductSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono text-right font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    প্রাথমিক স্টক (পিস)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono text-center font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Profit calculation note */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <span>প্রতি পিসে প্রাক্কলিত লাভ:</span>
                <span className="font-bold font-mono">
                  ৳ {((parseFloat(newProductSellingPrice) || 0) - (parseFloat(newProductBuyingPrice) || 0)).toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00875a] hover:bg-[#00744d] active:scale-98 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 font-bold" />
                  <span>স্টকে যোগ করুন ও বিক্রি শুরু করুন</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
