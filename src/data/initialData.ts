import {
  Product,
  Customer,
  SaleInvoice,
  Expense,
  Supplier,
  PurchaseInvoice,
  MfsBalances,
  MfsTransaction,
} from '../types';

export const SHOP_INFO = {
  name: 'হিযবুল্লাহ লেডিস কর্নার',
  englishName: 'Hizbullah Ladies Corner',
  slogan: 'একদর • ন্যায্য মূল্য • সবার প্রতি ইনসাফ',
  proprietor: 'আবু হায়াত মজুমদার (MBA. LLB)',
  phone: '01971667547',
  phoneBangla: '০১৯৭১৬৬৭৫৪৭',
  email: 'abuhayat651@gmail.com',
  website: 'Abuhayatbd.com',
  facebook: 'HLC2021',
  address: '৩৯/ বি, তিন নং গেইট, হাসান মার্কেট, বন্দর বাজার, সিলেট - ৩১০০',
  city: 'সিলেট',
  returnPolicy: 'বিক্রিত মাল ৩ দিনের মধ্যে ফেরত নেওয়া হয়',
  offerText: 'ফেসবুকে আমাদের পেজটি ফলো করুন এবং ১০টি পোস্ট শেয়ার করুন, তাতেই আপনি পেয়ে যাবেন ১০০০ টাকার পণ্যের উপর ৫০ টাকা মূল্য ছাড়।',
  logoUrl: '/assets/aistudio/WhatsApp_Image_2026-11-09_at_12.56.37_PM_b00dfe61.jpeg',
};

// All demo products, sales, customers, expenses, purchases cleared as requested
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_SALES: SaleInvoice[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_PURCHASES: PurchaseInvoice[] = [];

export const INITIAL_MFS_BALANCES: MfsBalances = {
  bkash: 0,
  nagad: 0,
  rocket: 0,
};

export const INITIAL_MFS_TRANSACTIONS: MfsTransaction[] = [];
