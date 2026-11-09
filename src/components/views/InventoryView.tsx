import React, { useState } from 'react';
import { Product, ProductCategory, ClothingSize } from '../../types';
import { formatBDT, toBanglaNumber, playPOSBeep } from '../../utils/bengaliUtils';
import {
  Shirt,
  Search,
  Plus,
  AlertTriangle,
  Barcode,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  PackagePlus,
  SlidersHorizontal,
  Printer,
  Sparkles,
} from 'lucide-react';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onGoToBarcode: (product: Product) => void;
  soundEnabled: boolean;
}

export const InventoryView: React.FC<Props> = ({
  products,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onGoToBarcode,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pBarcode, setPBarcode] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('পাঞ্জাবি');
  const [pSelectedSizes, setPSelectedSizes] = useState<ClothingSize[]>(['M', 'L', 'XL']);
  const [pColors, setPColors] = useState('সাদা, কালো, নেভি ব্লু');
  const [pBuyPrice, setPBuyPrice] = useState('');
  const [pSellPrice, setPSellPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pMinStock, setPMinStock] = useState('5');
  const [pFabric, setPFabric] = useState('');

  // Quick Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('নতুন স্টক ইন');

  const categories: (ProductCategory | 'সব')[] = [
    'সব',
    'পাঞ্জাবি',
    'শার্ট',
    'প্যান্ট',
    'থ্রি-পিস',
    'শাড়ি',
    'টি-শার্ট',
    'বাচ্চাদের পোশাক',
  ];

  const availableSizesList: ClothingSize[] = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '30', '32', '34', '36', 'Free'
  ];

  // Auto-generate barcode helper
  const handleGenerateBarcode = () => {
    const code = `890124${Math.floor(1000 + Math.random() * 9000)}`;
    setPBarcode(code);
  };

  // Toggle size selection
  const toggleSize = (sz: ClothingSize) => {
    if (pSelectedSizes.includes(sz)) {
      if (pSelectedSizes.length > 1) {
        setPSelectedSizes(pSelectedSizes.filter((s) => s !== sz));
      }
    } else {
      setPSelectedSizes([...pSelectedSizes, sz]);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'সব' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      (p.fabric && p.fabric.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLowStock = onlyLowStock ? p.stockQty <= p.minStockLevel : true;

    return matchesCat && matchesSearch && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stockQty <= p.minStockLevel).length;
  const totalStockItems = products.reduce((acc, p) => acc + p.stockQty, 0);
  const totalStockBuyValue = products.reduce((acc, p) => acc + (p.buyingPrice * p.stockQty), 0);

  // Submit Add Product
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      alert('পণ্যের নাম লিখুন!');
      return;
    }

    const buy = parseFloat(pBuyPrice) || 0;
    const sell = parseFloat(pSellPrice) || 0;
    const stock = parseInt(pStock, 10) || 0;
    const minStock = parseInt(pMinStock, 10) || 5;

    const colorsArr = pColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      barcode: pBarcode.trim() || `890124${Math.floor(1000 + Math.random() * 9000)}`,
      name: pName.trim(),
      category: pCategory,
      sizes: pSelectedSizes.length > 0 ? pSelectedSizes : ['M'],
      availableColors: colorsArr.length > 0 ? colorsArr : ['স্ট্যান্ডার্ড'],
      buyingPrice: buy,
      sellingPrice: sell,
      stockQty: stock,
      minStockLevel: minStock,
      fabric: pFabric.trim(),
      createdAt: '2026-11-08',
    };

    onAddProduct(newProd);
    if (soundEnabled) playPOSBeep('success');
    setIsAddModalOpen(false);

    // Reset Form
    setPName('');
    setPBarcode('');
    setPBuyPrice('');
    setPSellPrice('');
    setPStock('');
    setPFabric('');
  };

  // Submit Stock Adjustment
  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const newStock = Math.max(0, adjustingProduct.stockQty + adjustDelta);
    onUpdateStock(adjustingProduct.id, newStock);
    if (soundEnabled) playPOSBeep('success');
    setAdjustingProduct(null);
    setAdjustDelta(0);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Inventory Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium mb-1">মোট পণ্য ভেরিয়েন্ট</div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {toBanglaNumber(products.length)} টি আইটেম
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            মোট তৈরি পোশাক সংখ্যা: <span className="font-mono font-bold text-slate-800">{toBanglaNumber(totalStockItems)}</span> পিস
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium mb-1">মোট কেনা মূল্য (স্টক ভ্যালু)</div>
          <div className="text-2xl font-bold font-mono text-indigo-700">
            {formatBDT(totalStockBuyValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">দোকানের বর্তমান ইনভেন্টরি সম্পদ</p>
        </div>

        <div 
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            onlyLowStock
              ? 'bg-amber-100 border-amber-300'
              : 'bg-white border-slate-200/80 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-amber-800 mb-1">
            <span>স্বল্প স্টক সতর্কবার্তা</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {toBanglaNumber(lowStockCount)} টি পণ্য
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">
            {onlyLowStock ? '✓ ফিল্টার সক্রিয় (ক্লিক করে সব দেখুন)' : 'রি-অর্ডার করতে ক্লিক করুন'}
          </p>
        </div>
      </div>

      {/* Control Strip: Search, Category Filters, and Add Product button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পণ্যের নাম, বারকোড বা ফেব্রিক দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition text-slate-800"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => {
              handleGenerateBarcode();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            + নতুন পোশাক যুক্ত করুন
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">বারকোড</th>
                <th className="py-3 px-4">পোশাকের নাম ও বিবরণ</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4">সাইজ ও রং</th>
                <th className="py-3 px-4 text-right">ক্রয় মূল্য</th>
                <th className="py-3 px-4 text-right">বিক্রয় মূল্য</th>
                <th className="py-3 px-4 text-right">লাভ (Margin)</th>
                <th className="py-3 px-4 text-center">মজুদ স্টক</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    কোনো পণ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQty <= p.minStockLevel;
                  const marginPercent = Math.round(((p.sellingPrice - p.buyingPrice) / p.buyingPrice) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.barcode}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {p.name}
                        </div>
                        {p.fabric && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            কাপড়: {p.fabric}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.sizes.map((s) => (
                            <span key={s} className="px-1 py-0.2 bg-slate-100 text-slate-700 font-mono text-[10px] rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                          {p.availableColors.join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatBDT(p.buyingPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatBDT(p.sellingPrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                        +{toBanglaNumber(marginPercent)}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                            isLow
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {toBanglaNumber(p.stockQty)} পিস
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Stock adjustment */}
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustDelta(0);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                            title="স্টক সমন্বয় করুন"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Print barcode sticker */}
                          <button
                            onClick={() => onGoToBarcode(p)}
                            className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                            title="বারকোড ট্যাগ প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি "${p.name}" পণ্যটি মুছে ফেলতে চান?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">+ নতুন পোশাক ইনভেন্টরিতে যুক্ত করুন</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পোশাকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রিমিয়াম সেমি-লং পাঞ্জাবি"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Barcode & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">বারকোড কোড</label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                    >
                      অটো জেনারেট
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pBarcode}
                    onChange={(e) => setPBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                    placeholder="890124xxxx"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    {categories.filter((c) => c !== 'সব').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sizes Multi-Select */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  উপলব্ধ সাইজ নির্বাচন করুন (ক্লিক করে নির্বাচন/বাতিল করুন)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableSizesList.map((sz) => {
                    const isSelected = pSelectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors & Fabric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">রং সমুহ (কমা দিয়ে লিখুন)</label>
                  <input
                    type="text"
                    value={pColors}
                    onChange={(e) => setPColors(e.target.value)}
                    placeholder="সাদা, কালো, নেভি ব্লু"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কাপড়ের বিবরণ / ফেব্রিক</label>
                  <input
                    type="text"
                    value={pFabric}
                    onChange={(e) => setPFabric(e.target.value)}
                    placeholder="যেমন: ১০০% সুতি কটন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কেনা দাম (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="850"
                    value={pBuyPrice}
                    onChange={(e) => setPBuyPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1350"
                    value={pSellPrice}
                    onChange={(e) => setPSellPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রাথমিক স্টক *</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সতর্কবার্তা লেভেল</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={pMinStock}
                    onChange={(e) => setPMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  ইনভেন্টরিতে সংরক্ষণ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stock Adjustment ("স্টক সমন্বয়") */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">স্টক সমন্বয় (ইন / আউট)</h3>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800 text-sm">{adjustingProduct.name}</p>
                <p className="text-slate-500 font-mono">বারকোড: {adjustingProduct.barcode}</p>
                <p className="text-slate-600 font-medium">
                  বর্তমান মজুদ: <span className="font-mono font-bold text-indigo-700">{toBanglaNumber(adjustingProduct.stockQty)}</span> পিস
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  স্টক পরিবর্তন সংখ্যা (+ যোগ করতে ধনাত্মক, - কমাতে ঋণাত্মক লিখুন)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    value={adjustDelta || ''}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                    placeholder="যেমন: +10 বা -2"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm focus:border-indigo-500 focus:outline-hidden"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAdjustDelta((prev) => prev + 5)}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded font-mono text-xs cursor-pointer"
                    >
                      +৫
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustDelta((prev) => prev - 1)}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded font-mono text-xs cursor-pointer"
                    >
                      -১
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">সমন্বয়ের কারণ</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="নতুন স্টক ইন">নতুন স্টক ইন (আমদানি)</option>
                  <option value="নষ্ট / ক্ষতিগ্রস্ত কাপড়">নষ্ট / ক্ষতিগ্রস্ত কাপড়</option>
                  <option value="গ্রাহক ফেরত">গ্রাহকের কাছ থেকে ফেরত</option>
                  <option value="বার্ষিক গণনা সমন্বয়">বার্ষিক গণনা সমন্বয়</option>
                </select>
              </div>

              <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-700">আপডেটেড মোট স্টক হবে:</span>
                <span className="font-mono font-bold text-sm text-indigo-900">
                  {toBanglaNumber(Math.max(0, adjustingProduct.stockQty + adjustDelta))} পিস
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  আপডেট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
