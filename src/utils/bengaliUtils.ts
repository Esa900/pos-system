/**
 * Bengali numeric, currency, date, and barcode helper utilities
 */

const banglaDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const englishDigits: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function toBanglaNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = typeof num === 'number' ? num.toLocaleString('en-US') : num.toString();
  return str.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

export function fromBanglaNumber(str: string): number {
  if (!str) return 0;
  const engStr = str.replace(/[০-৯]/g, (digit) => englishDigits[digit] || digit).replace(/,/g, '');
  const parsed = parseFloat(engStr);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatBDT(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '৳ ০';
  const formatted = Math.round(amount).toLocaleString('en-US');
  const banglaVal = formatted.replace(/[0-9]/g, (d) => banglaDigits[d] || d);
  return `৳ ${banglaVal}`;
}

export function getTodayBanglaDate(): string {
  const now = new Date();
  const day = toBanglaNumber(now.getDate());
  const year = toBanglaNumber(now.getFullYear());
  
  const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const month = banglaMonths[now.getMonth()];
  return `${day} ${month}, ${year}`;
}

export function getCurrentBanglaTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'বিকাল/রাত' : 'সকাল';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${ampm} ${toBanglaNumber(hours)}:${toBanglaNumber(minStr)}`;
}

/**
 * Play a gentle, crisp POS scanner beep sound using Web Audio API
 */
export function playPOSBeep(type: 'scan' | 'success' | 'alert' = 'scan'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.08);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.25);
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Ignore audio permission or context restrictions
  }
}

/**
 * Generate a reproducible pseudo Code-128 barcode bar widths array from string
 */
export function generateBarcodeBars(code: string): number[] {
  const bars: number[] = [2, 1, 1, 2, 1]; // Start guard
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) % 9973;
    const digitVal = parseInt(code[i], 10);
    const pattern = isNaN(digitVal) ? (code.charCodeAt(i) % 6) : digitVal % 6;
    
    // Convert to realistic alternating bar & space widths
    switch (pattern) {
      case 0: bars.push(1, 2, 1, 3); break;
      case 1: bars.push(2, 1, 2, 1); break;
      case 2: bars.push(1, 3, 1, 2); break;
      case 3: bars.push(3, 1, 1, 2); break;
      case 4: bars.push(1, 1, 3, 2); break;
      default: bars.push(2, 2, 1, 1); break;
    }
  }
  bars.push(2, 1, 2, 2); // Stop guard
  return bars;
}
