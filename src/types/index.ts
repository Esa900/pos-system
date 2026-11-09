export type ProductCategory = 
  | 'পাঞ্জাবি'
  | 'শার্ট'
  | 'প্যান্ট'
  | 'থ্রি-পিস'
  | 'শাড়ি'
  | 'টি-শার্ট'
  | 'বাচ্চাদের পোশাক'
  | 'অন্যান্য';

export type ClothingSize = 
  | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' 
  | '38' | '40' | '42' | '44' 
  | '30' | '32' | '34' | '36' 
  | '24' | '26' | '28' 
  | 'Free';

export type PaymentMethod = 'নগদ' | 'বাকি' | 'বিকাশ' | 'নগদ-এমএফএস' | 'কার্ড';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  sizes: ClothingSize[];
  availableColors: string[];
  selectedSize?: ClothingSize;
  selectedColor?: string;
  buyingPrice: number;
  sellingPrice: number;
  stockQty: number;
  minStockLevel: number;
  fabric?: string;
  image?: string;
  createdAt?: string;
}

export interface CartItem {
  id: string; // unique item line id
  productId: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  size: ClothingSize;
  color: string;
  unitPrice: number;
  buyingPrice: number;
  qty: number;
  subtotal: number;
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  type: 'বিক্রি_বাকি' | 'টাকা_জমা' | 'প্রারম্ভিক_বাকি';
  amount: number;
  invoiceId?: string;
  note: string;
  remainingDue: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalSpent: number;
  totalDue: number;
  status: 'বকেয়া আছে' | 'পরিশোধিত';
  lastTransactionDate: string;
  ledger: CustomerLedgerEntry[];
}

export interface SaleInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  discountType: 'flat' | 'percent';
  discountValue: number;
  discountAmount: number;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  totalPurchased: number;
  balanceDue: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  qty: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseInvoice {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
}

export type ExpenseCategory = 
  | 'দোকান ভাড়া'
  | 'বিদ্যুৎ ও ইউটিলিটি'
  | 'কর্মচারীর বেতন'
  | 'চা-নাস্তা ও আপ্যায়ন'
  | 'পরিবহন ও যাতায়াত'
  | 'দোকানের সাজসজ্জা'
  | 'অন্যান্য';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: 'নগদ' | 'বিকাশ' | 'ব্যাংক';
  note?: string;
}

export interface MfsTransaction {
  id: string;
  date: string;
  type: 'buy' | 'sale';
  service: 'bKash' | 'Nagad' | 'Rocket';
  amount: number;
  commission: number;
  cost?: number;
  reference?: string;
}

export interface MfsBalances {
  bkash: number;
  nagad: number;
  rocket: number;
}

export type ActiveTab = 
  | 'dashboard'
  | 'pos'
  | 'mfs'
  | 'products'
  | 'purchases'
  | 'stock'
  | 'expenses'
  | 'reports'
  | 'cash_ledger'
  | 'barcodes'
  | 'online_services';
