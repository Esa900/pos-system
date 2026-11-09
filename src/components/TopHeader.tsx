import React, { useState } from 'react';
import { Menu, Volume2, VolumeX, Download, CheckCircle, Loader2, Phone, Trash2, MapPin } from 'lucide-react';
import { downloadProjectZip } from '../utils/projectDownloader';
import { SHOP_INFO } from '../data/initialData';

interface Props {
  onToggleMobileMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  shopName?: string;
  subTitle?: string;
  onClearAllData?: () => void;
}

export const TopHeader: React.FC<Props> = ({
  onToggleMobileMenu,
  soundEnabled,
  onToggleSound,
  shopName = SHOP_INFO.name,
  subTitle = `${SHOP_INFO.slogan} • ${SHOP_INFO.city}`,
  onClearAllData,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed', err);
      alert('কোড ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল প্রোডাক্ট এবং ট্রানজেকশন ডাটা মুছে ফ্রেশ শুরু করতে চান?')) {
      if (onClearAllData) {
        onClearAllData();
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#004e38] text-white shadow-md border-b border-[#003c2b] py-2 px-3 sm:px-6">
      <div className="relative flex items-center justify-between gap-3">
        
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-[#003c2b] rounded-lg transition cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Shop Logo Badge */}
          <div className="flex items-center gap-2.5">
            <img 
              src={SHOP_INFO.logoUrl} 
              alt={SHOP_INFO.name} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-400 shadow-sm shrink-0" 
            />
            <div className="hidden sm:block">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
                প্রো: {SHOP_INFO.proprietor}
              </span>
              <span className="text-[11px] text-emerald-200 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-amber-300" />
                {SHOP_INFO.phoneBangla}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Shop Title, Slogan & Address */}
        <div className="text-center flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-normal leading-tight text-white drop-shadow-xs truncate">
            {shopName}
          </h1>
          <p className="text-[11px] sm:text-xs text-emerald-100 font-medium truncate">
            {subTitle}
          </p>
          <p className="hidden md:flex items-center justify-center gap-1 text-[10px] text-emerald-200/90 font-sans mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-amber-300" />
            {SHOP_INFO.address}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Clear / Reset Data */}
          {onClearAllData && (
            <button
              onClick={handleResetData}
              title="সকল ডেমো ডাটা ক্লিয়ার করুন / নতুন শুরু"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-[#003c2b] hover:bg-rose-900/80 text-rose-200 hover:text-white text-xs font-semibold rounded-lg transition border border-emerald-400/20 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ডাটা ক্লিয়ার</span>
            </button>
          )}

          {/* Download Full Source Code ZIP Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            title="সম্পূর্ণ প্রজেক্ট সোর্স কোড জিপ (ZIP) ফাইল হিসেবে ডাউনলোড করুন"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#00875a] hover:bg-[#00724b] active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer border border-emerald-400/30 whitespace-nowrap"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">তৈরি হচ্ছে...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">ডাউনলোড সম্পন্ন!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">কোড ডাউনলোড (ZIP)</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'সাউন্ড চালু আছে' : 'সাউন্ড বন্ধ'}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-[#003c2b] rounded-lg transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-emerald-300/60" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
