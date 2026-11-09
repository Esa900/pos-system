import React, { useState } from 'react';
import {
  Product,
  SaleInvoice,
  Customer,
  ClothingSize,
  ProductCategory,
} from '../../types';
import { playPOSBeep } from '../../utils/bengaliUtils';
import {
  ShoppingCart,
  Plus,
  Check,
  X,
  PackagePlus,
  Receipt,
  CheckCircle,
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
  // 1. FAST CONFIRM SELL MODAL STATE
  const [isConfirmSellModalOpen, setIsConfirmSellModalOpen] = useState(false);
  const [modalProductId, setModalProductId] = useState<string>('');
  const [modalCustomProductName, setModalCustomProductName] = useState('');
  const [modalQty, setModalQty] = useState<number>(1);
  const [modalTotalTaka, setModalTotalTaka] = useState<number>(0);
  const [modalDiscount, setModalDiscount] = useState<number>(0);
  const [modalCustomerName, setModalCustomerName] = useState('খুচরা গ্রাহক');
  const [modalCustomerPhone, setModalCustomerPhone] = useState('');

  // 2. QUICK ADD PRODUCT MODAL STATE
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('ক্লথিং');
  const [newProductUnit, setNewProductUnit] = useState<string>('পিস (Pcs)');
  const [newProductSize, setNewProductSize] = useState<ClothingSize>('Free');
  const [newProductColor, setNewProductColor] = useState('স্ট্যান্ডার্ড');
  const [newProductBuyingPrice, setNewProductBuyingPrice] = useState<string>('');
  const [newProductSellingPrice, setNewProductSellingPrice] = useState<string>('');
  const [newProductStock, setNewProductStock] = useState<string>('10');
  const [newProductBarcode, setNewProductBarcode] = useState('');

  // Open the requested Confirm Sell popup
  const handleOpenConfirmSellModal = () => {
    const activeProd = products[0];
    const initialProdId = activeProd ? activeProd.id : '';
    setModalProductId(initialProdId);
    setModalCustomProductName('');
    setModalQty(1);
    setModalTotalTaka(activeProd ? activeProd.sellingPrice : 0);
    setModalDiscount(0);
    setModalCustomerName('খুচরা গ্রাহক');
    setModalCustomerPhone('');
    setIsConfirmSellModalOpen(true);
  };

  // When product changes in the Confirm Sell modal
  const handleModalProductChange = (prodId: string) => {
    setModalProductId(prodId);
    if (prodId === 'custom') {
      setModalTotalTaka(0);
      return;
    }
    const p = products.find((item) => item.id === prodId);
    if (p) {
      setModalTotalTaka(p.sellingPrice * modalQty);
    }
  };

  // When quantity changes in the Confirm Sell modal
  const handleModalQtyChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    setModalQty(validQty);
    if (modalProductId !== 'custom') {
      const p = products.find((item) => item.id === modalProductId);
      if (p) {
        setModalTotalTaka(p.sellingPrice * validQty);
      }
    }
  };

  // Submit Confirm Sell from the modal (Generates direct paid invoice, prints, updates dashboard & stock)
  const handleConfirmSellModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let resolvedProductName = '';
    let resolvedBuyingPrice = 0;
    let resolvedBarcode = '8901245000';
    let resolvedCategory: ProductCategory = 'অন্যান্য';
    let resolvedProductId = modalProductId;

    if (modalProductId === 'custom' || !modalProductId) {
      if (!modalCustomProductName.trim()) {
        alert('অনুগ্রহ করে পণ্যের নাম লিখুন!');
        return;
      }
      resolvedProductName = modalCustomProductName.trim();
      resolvedProductId = `custom-${Date.now()}`;
    } else {
      const matchedProd = products.find((p) => p.id === modalProductId);
      if (matchedProd) {
        resolvedProductName = matchedProd.name;
        resolvedBuyingPrice = matchedProd.buyingPrice;
        resolvedBarcode = matchedProd.barcode;
        resolvedCategory = matchedProd.category;
      } else if (modalCustomProductName.trim()) {
        resolvedProductName = modalCustomProductName.trim();
      } else {
        alert('অনুগ্রহ করে পণ্যের ধরন নির্বাচন করুন বা নাম লিখুন!');
        return;
      }
    }

    if (modalQty <= 0) {
      alert('সঠিক পরিমাণ দিন!');
      return;
    }

    if (modalTotalTaka < 0) {
      alert('সঠিক টাকার পরিমাণ দিন!');
      return;
    }

    // Invoice generator: INV-YYYYMMDD-XXXX
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const seq = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNo = `INV-${dateCode}-${seq}`;
    const dateFormatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeFormatted = `${pad(hours > 12 ? hours - 12 : hours || 12)}:${pad(minutes)} ${hours >= 12 ? 'PM' : 'AM'}`;

    const finalPayable = Math.max(0, modalTotalTaka - modalDiscount);
    const totalCost = resolvedBuyingPrice * modalQty;
    const calculatedProfit = finalPayable - totalCost;

    const soldItem = {
      id: `cart-${Date.now()}`,
      productId: resolvedProductId || `prod-${Date.now()}`,
      barcode: resolvedBarcode,
      name: resolvedProductName,
      category: resolvedCategory,
      size: 'Free' as ClothingSize,
      color: 'স্ট্যান্ডার্ড',
      unitPrice: modalQty > 0 ? modalTotalTaka / modalQty : modalTotalTaka,
      buyingPrice: resolvedBuyingPrice,
      qty: modalQty,
      subtotal: modalTotalTaka,
    };

    // 100% Direct Paid Sale - No Baki, No Due
    const newInvoice: SaleInvoice = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateFormatted,
      time: timeFormatted,
      customerName: modalCustomerName.trim() || 'খুচরা গ্রাহক',
      customerPhone: modalCustomerPhone.trim(),
      items: [soldItem],
      totalQty: modalQty,
      subtotal: modalTotalTaka,
      discountType: 'flat',
      discountValue: modalDiscount,
      discountAmount: modalDiscount,
      netPayable: finalPayable,
      paidAmount: finalPayable, // 100% Direct Paid
      dueAmount: 0,            // Zero Due
      paymentMethod: 'নগদ',
      totalCost,
      profit: Math.max(0, calculatedProfit),
    };

    if (soundEnabled) playPOSBeep('success');
    
    // Complete the sale in App.tsx (decrements stock, updates dashboard, opens thermal receipt)
    onCompleteSale(newInvoice);

    // Reset Form
    setIsConfirmSellModalOpen(false);
  };

  // Open Quick Add Product Modal with generated barcode
  const handleOpenAddProductModal = () => {
    const autoBarcode = `890124${Math.floor(1000 + Math.random() * 9000)}`;
    setNewProductBarcode(autoBarcode);
    setNewProductName('');
    setNewProductCategory('ক্লথিং');
    setNewProductUnit('পিস (Pcs)');
    setNewProductBuyingPrice('');
    setNewProductSellingPrice('');
    setNewProductStock('10');
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
      unit: newProductUnit,
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

    if (soundEnabled) playPOSBeep('success');
    setIsAddProductOpen(false);
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-14 px-4 space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          পণ্য বিক্রয়
        </h2>
      </div>

      {/* Main 2 Options Card (The 2 exact requested buttons from screenshot) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-4">
        
        {/* 1. Blue Button: + পণ্য যোগ করুন */}
        <button
          type="button"
          onClick={handleOpenAddProductModal}
          className="w-full py-4 px-6 bg-[#1e6cd9] hover:bg-[#1a5ec2] active:scale-98 text-white text-base sm:text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5 font-black stroke-[3]" />
          <span>+ পণ্য যোগ করুন</span>
        </button>

        {/* 2. Green Button: ✓ Confirm Sell (মেমো ও বিক্রি কনফার্ম) */}
        <button
          type="button"
          onClick={handleOpenConfirmSellModal}
          className="w-full py-4 px-6 bg-[#16a34a] hover:bg-[#15803d] active:scale-98 text-white text-base sm:text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5 font-black stroke-[3]" />
          <span>✓ Confirm Sell (মেমো ও বিক্রি কনফার্ম)</span>
        </button>

      </div>

      {/* CONFIRM SELL MODAL (User's Exact Requested Flow: কোন টাইপ এর প্রোডাক্ট, কত পিস, কত টাকা, কাস্টমার নাম, ফোন নাম্বার) */}
      {isConfirmSellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#00875a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Confirm Sell ও মেমো কনফার্ম</h3>
              </div>
              <button
                onClick={() => setIsConfirmSellModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmSellModalSubmit} className="p-5 space-y-3.5">
              
              {/* Field 1: কোন টাইপ এর প্রোডাক্ট (পণ্য নির্বাচন) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  কোন টাইপ এর প্রোডাক্ট (পণ্য নির্বাচন) <span className="text-rose-500">*</span>
                </label>
                {products.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={modalProductId}
                      onChange={(e) => handleModalProductChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:border-[#00875a] focus:bg-white focus:outline-hidden font-medium text-slate-900"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (মজুদ: {p.stockQty} {p.unit || 'পিস'} | দর: ৳{p.sellingPrice})
                        </option>
                      ))}
                      <option value="custom">✍️ + কাস্টম / নতুন পণ্যের নাম লিখুন</option>
                    </select>
                    {modalProductId === 'custom' && (
                      <input
                        type="text"
                        required
                        placeholder="পণ্যের নাম লিখুন (যেমন: সুতি থ্রি-পিস / পার্টি বোরকা)"
                        value={modalCustomProductName}
                        onChange={(e) => setModalCustomProductName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#00875a] rounded-lg focus:outline-hidden font-medium text-slate-900 shadow-2xs"
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="পণ্যের নাম লিখুন (যেমন: সুতি থ্রি-পিস / পার্টি বোরকা)"
                    value={modalCustomProductName}
                    onChange={(e) => setModalCustomProductName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:border-[#00875a] focus:bg-white focus:outline-hidden font-medium text-slate-900"
                  />
                )}
              </div>

              {/* Field 2 & 3: কত পিস (পরিমাণ) & কত টাকা (মোট বিল) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    কত পিস (পরিমাণ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={modalQty}
                    onChange={(e) => handleModalQtyChange(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-center border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    কত টাকা (মোট বিল) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={modalTotalTaka}
                      onChange={(e) => setModalTotalTaka(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-right border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden text-slate-900 bg-slate-50/60"
                    />
                  </div>
                </div>
              </div>

              {/* Field: ডিসকাউন্ট (টাকা) ও পরিশোধযোগ্য টাকা */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/90">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ডিসকাউন্ট (টাকা)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={modalDiscount || ''}
                      onChange={(e) => setModalDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold text-right border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden bg-white text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-900 block mb-1">
                    পরিশোধযোগ্য টাকা
                  </label>
                  <div className="w-full py-2 px-3 bg-white border border-emerald-300 rounded-lg text-xs font-bold font-mono text-emerald-900 text-right shadow-2xs flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-sans font-medium">নিট বিল:</span>
                    <span className="text-sm">৳ {Math.max(0, modalTotalTaka - modalDiscount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Field 4: কাস্টমার এর নাম */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  কাস্টমার এর নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: রহিম আহমেদ / খুচরা গ্রাহক"
                  value={modalCustomerName}
                  onChange={(e) => setModalCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Field 5: কাস্টমার এর ফোন নাম্বার */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  কাস্টমার এর ফোন নাম্বার
                </label>
                <input
                  type="text"
                  placeholder="017xxxxxxxx"
                  value={modalCustomerPhone}
                  onChange={(e) => setModalCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono text-slate-900"
                />
              </div>

              {/* পেমেন্ট স্ট্যাটাস: সরাসরি পরিশোধিত (DIRECT PAID) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  পেমেন্ট স্ট্যাটাস
                </label>
                <div className="w-full py-2.5 px-3.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-800 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="text-xs font-bold">সরাসরি পরিশোধিত (DIRECT PAID)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded border border-emerald-300">
                    ৳ {Math.max(0, modalTotalTaka - modalDiscount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions: Cancel & Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmSellModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] active:scale-98 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 font-bold" />
                  <span>Confirm Sell ও মেমো প্রিন্ট</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* QUICK ADD PRODUCT MODAL (User's Exact Requested Product Add Form) */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#00875a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">নতুন প্রোডাক্ট যোগ করুন (Add Product)</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 hover:bg-white/20 rounded-md text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuickProduct} className="p-6 space-y-4 text-xs">
              
              {/* ১. প্রোডাক্টের নাম (Product Name) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  প্রোডাক্টের নাম (Product Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="পণ্যের পরিষ্কার ও নির্দিষ্ট নাম (যেমন: সুতি থ্রি-পিস / পার্টি বোরকা / গ্রোসারী আইটেম)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#00875a] focus:outline-hidden text-slate-900 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">পণ্যের পরিষ্কার ও নির্দিষ্ট নাম।</p>
              </div>

              {/* ২. ক্যাটাগরি (Category) ও ৩. ইউনিট/পরিমাপ (Unit) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    ক্যাটাগরি (Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#00875a] focus:outline-hidden font-medium text-slate-900"
                  >
                    <option value="ক্লথিং">ক্লথিং (পোশাক)</option>
                    <option value="লেডিস আইটেম">লেডিস আইটেম</option>
                    <option value="থ্রি-পিস">থ্রি-পিস</option>
                    <option value="শাড়ি">শাড়ি</option>
                    <option value="বোরকা ও হিজাব">বোরকা ও হিজাব</option>
                    <option value="গ্রোসারী">গ্রোসারী</option>
                    <option value="ইলেকট্রনিক্স">ইলেকট্রনিক্স</option>
                    <option value="কসমেটিকস">কসমেটিকস</option>
                    <option value="বাচ্চাদের পোশাক">বাচ্চাদের পোশাক</option>
                    <option value="পাঞ্জাবি">পাঞ্জাবি</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-0.5">পণ্যটি কোন ক্যাটাগরির (যেমন: গ্রোসারী, ইলেকট্রনিক্স, ক্লথিং ইত্যাদি)।</p>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    ইউনিট/পরিমাপ (Unit) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#00875a] focus:outline-hidden font-medium text-slate-900"
                  >
                    <option value="পিস (Pcs)">পিস (Pcs)</option>
                    <option value="সেট (Set)">সেট (Set)</option>
                    <option value="ডজন (Dozen)">ডজন (Dozen)</option>
                    <option value="গজ (Goj)">গজ (Goj)</option>
                    <option value="মিটার (Meter)">মিটার (Meter)</option>
                    <option value="কেজি (Kg)">কেজি (Kg)</option>
                    <option value="প্যাকেট (Pkt)">প্যাকেট (Pkt)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-0.5">পণ্যটি কি পিস (Pcs), সেট বা অন্যান্য পরিমাপে হিসাব হবে।</p>
                </div>
              </div>

              {/* ৪. মূল্য নির্ধারণ (Pricing) */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                  <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span>💰 মূল্য নির্ধারণ (Pricing)</span>
                  </h4>
                  {newProductBuyingPrice && newProductSellingPrice && (
                    <span className="text-[11px] font-bold text-emerald-800 font-mono">
                      লাভ: ৳ {((parseFloat(newProductSellingPrice) || 0) - (parseFloat(newProductBuyingPrice) || 0)).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      ক্রয়মূল্য (Cost / Purchase Price) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0.00"
                        value={newProductBuyingPrice}
                        onChange={(e) => setNewProductBuyingPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono font-bold text-slate-900 text-right"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">পণ্যটি কত টাকায় কেনা হয়েছে।</p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      বিক্রয়মূল্য (Selling Price) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0.00"
                        value={newProductSellingPrice}
                        onChange={(e) => setNewProductSellingPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:border-[#00875a] focus:outline-hidden font-mono font-bold text-emerald-800 text-right"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">খুচরা বা পাইকারি মূল্যে কত টাকায় বিক্রি হবে।</p>
                  </div>
                </div>
              </div>

              {/* ৫. প্রাথমিক স্টক ও বারকোড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    প্রাথমিক স্টক (Stock Qty) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#00875a] focus:outline-hidden font-mono text-center font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">বর্তমানে মজুদ সংখ্যা</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    বারকোড নম্বর
                  </label>
                  <input
                    type="text"
                    value={newProductBarcode}
                    onChange={(e) => setNewProductBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-[#00875a] focus:outline-hidden font-mono text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">অটো তৈরি বারকোড বা স্ক্যান কোড</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00875a] hover:bg-[#00744d] active:scale-98 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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
