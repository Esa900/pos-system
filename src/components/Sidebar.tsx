import React from 'react';
import { ActiveTab } from '../types';
import {
  BarChart2,
  ShoppingCart,
  Smartphone,
  ClipboardList,
  Truck,
  Box,
  FileText,
  Megaphone,
  Banknote,
  Barcode,
  Globe,
  X,
  Download,
} from 'lucide-react';
import { downloadProjectZip } from '../utils/projectDownloader';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  // 11 exact menus from the screenshot
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'ড্যাশবোর্ড',
      icon: BarChart2,
      iconColor: 'text-sky-300',
    },
    {
      id: 'pos' as ActiveTab,
      label: 'পণ্য বিক্রয়',
      icon: ShoppingCart,
      iconColor: 'text-amber-400',
    },
    {
      id: 'mfs' as ActiveTab,
      label: 'MFS',
      icon: Smartphone,
      iconColor: 'text-teal-300',
    },
    {
      id: 'products' as ActiveTab,
      label: 'পণ্য ব্যবস্থাপনা',
      icon: ClipboardList,
      iconColor: 'text-amber-200',
    },
    {
      id: 'purchases' as ActiveTab,
      label: 'পণ্য ক্রয়',
      icon: Truck,
      iconColor: 'text-emerald-300',
    },
    {
      id: 'stock' as ActiveTab,
      label: 'স্টক',
      icon: Box,
      iconColor: 'text-amber-500',
    },
    {
      id: 'expenses' as ActiveTab,
      label: 'খরচ',
      icon: FileText,
      iconColor: 'text-cyan-200',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'রিপোর্ট',
      icon: Megaphone,
      iconColor: 'text-rose-400',
    },
    {
      id: 'cash_ledger' as ActiveTab,
      label: 'ক্যাশ হিসাব',
      icon: Banknote,
      iconColor: 'text-emerald-400',
    },
    {
      id: 'barcodes' as ActiveTab,
      label: 'বারকোড স্টিকার',
      icon: Barcode,
      iconColor: 'text-slate-300',
    },
    {
      id: 'online_services' as ActiveTab,
      label: 'অনলাইন আবেদন',
      icon: Globe,
      iconColor: 'text-sky-400',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-56 bg-[#003c2f] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden p-3 border-b border-[#005140] flex justify-between items-center text-white">
          <span className="font-bold text-sm">মেনু তালিকা</span>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 hover:bg-[#005140] rounded text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-teal-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#007452] text-white shadow-sm'
                    : 'text-white/90 hover:bg-[#004e3d] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with 1-click Download Code */}
        <div className="p-3 border-t border-[#005140] bg-[#003126]/60">
          <button
            onClick={() => downloadProjectZip()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#007452] hover:bg-[#00875a] active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            title="সম্পূর্ণ প্রজেক্ট ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ফুল কোড ডাউনলোড (ZIP)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
