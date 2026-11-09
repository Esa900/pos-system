import React, { useState } from 'react';
import { Menu, Volume2, VolumeX, Download, CheckCircle, Loader2 } from 'lucide-react';
import { downloadProjectZip } from '../utils/projectDownloader';

interface Props {
  onToggleMobileMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  shopName?: string;
  subTitle?: string;
}

export const TopHeader: React.FC<Props> = ({
  onToggleMobileMenu,
  soundEnabled,
  onToggleSound,
  shopName = 'KHAN MANAGEMENT',
  subTitle = 'Point of Sale Management System',
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

  return (
    <header className="sticky top-0 z-30 bg-[#004e38] text-white shadow-sm border-b border-[#003c2b] py-2.5 px-4 sm:px-6">
      <div className="relative flex items-center justify-between">
        
        {/* Left: Mobile hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-[#003c2b] rounded-lg transition cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Shop Title & Subtitle */}
        <div className="text-center flex-1">
          <h1 className="text-base sm:text-lg font-bold tracking-normal leading-tight text-white drop-shadow-xs">
            {shopName}
          </h1>
          <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
            {subTitle}
          </p>
        </div>

        {/* Right: Download Code & Sound */}
        <div className="flex items-center gap-2">
          {/* Download Full Source Code ZIP Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            title="সম্পূর্ণ প্রজেক্ট সোর্স কোড জিপ (ZIP) ফাইল হিসেবে ডাউনলোড করুন"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00875a] hover:bg-[#00724b] active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer border border-emerald-400/30 whitespace-nowrap"
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
                <span>কোড ডাউনলোড (ZIP)</span>
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

