/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Product,
  Customer,
  SaleInvoice,
  Expense,
  Supplier,
  PurchaseInvoice,
  CustomerLedgerEntry,
  MfsBalances,
  MfsTransaction,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASES,
  INITIAL_MFS_BALANCES,
  INITIAL_MFS_TRANSACTIONS,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/views/DashboardView';
import { POSView } from './components/views/POSView';
import { MFSView } from './components/views/MFSView';
import { InventoryView } from './components/views/InventoryView';
import { StockView } from './components/views/StockView';
import { PurchasesView } from './components/views/PurchasesView';
import { ExpensesView } from './components/views/ExpensesView';
import { ReportsView } from './components/views/ReportsView';
import { BakiKhataView } from './components/views/BakiKhataView';
import { BarcodeGeneratorView } from './components/views/BarcodeGeneratorView';
import { OnlineServicesView } from './components/views/OnlineServicesView';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos'); // Default to POS or MFS as per screenshot
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Application Data with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [sales, setSales] = useState<SaleInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_suppliers');
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  // MFS Data
  const [mfsBalances, setMfsBalances] = useState<MfsBalances>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_mfs_balances');
      return saved ? JSON.parse(saved) : INITIAL_MFS_BALANCES;
    } catch {
      return INITIAL_MFS_BALANCES;
    }
  });

  const [mfsTransactions, setMfsTransactions] = useState<MfsTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('mahim_pos_mfs_trx');
      return saved ? JSON.parse(saved) : INITIAL_MFS_TRANSACTIONS;
    } catch {
      return INITIAL_MFS_TRANSACTIONS;
    }
  });

  // Modals & temporary views
  const [receiptInvoice, setReceiptInvoice] = useState<SaleInvoice | null>(null);
  const [barcodeSelectedProduct, setBarcodeSelectedProduct] = useState<Product | null>(null);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('mahim_pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_mfs_balances', JSON.stringify(mfsBalances));
  }, [mfsBalances]);

  useEffect(() => {
    localStorage.setItem('mahim_pos_mfs_trx', JSON.stringify(mfsTransactions));
  }, [mfsTransactions]);

  // SALE COMPLETION HANDLER
  const handleCompleteSale = (invoice: SaleInvoice) => {
    setSales((prev) => [invoice, ...prev]);

    // Decrement stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = invoice.items.find((i) => i.productId === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty - cartItem.qty),
          };
        }
        return prod;
      })
    );

    // Update customer ledger if there was a due (বাকি)
    if (invoice.dueAmount > 0) {
      const targetCustomerIndex = customers.findIndex(
        (c) =>
          c.id === invoice.customerId ||
          (invoice.customerPhone && c.phone.replace(/[^0-9]/g, '') === invoice.customerPhone.replace(/[^0-9]/g, '')) ||
          (invoice.customerName && c.name.toLowerCase() === invoice.customerName.toLowerCase())
      );

      const newLedgerEntry: CustomerLedgerEntry = {
        id: `led-${Date.now()}`,
        date: invoice.date,
        type: 'বিক্রি_বাকি',
        amount: invoice.dueAmount,
        invoiceId: invoice.invoiceNo,
        note: `${invoice.items.map((i) => i.name).join(', ')} বাকিতে ক্রয়`,
        remainingDue: invoice.dueAmount,
      };

      if (targetCustomerIndex > -1) {
        const updatedCusts = [...customers];
        const cust = updatedCusts[targetCustomerIndex];
        const newTotalDue = cust.totalDue + invoice.dueAmount;
        newLedgerEntry.remainingDue = newTotalDue;

        updatedCusts[targetCustomerIndex] = {
          ...cust,
          totalSpent: cust.totalSpent + invoice.netPayable,
          totalDue: newTotalDue,
          status: 'বকেয়া আছে',
          lastTransactionDate: invoice.date,
          ledger: [newLedgerEntry, ...cust.ledger],
        };
        setCustomers(updatedCusts);
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: invoice.customerName || 'নতুন বাকি ক্রেতা',
          phone: invoice.customerPhone || '—',
          address: 'নিউ মার্কেট, ঢাকা',
          totalSpent: invoice.netPayable,
          totalDue: invoice.dueAmount,
          status: 'বকেয়া আছে',
          lastTransactionDate: invoice.date,
          ledger: [newLedgerEntry],
        };
        setCustomers((prev) => [newCustomer, ...prev]);
      }
    }

    setReceiptInvoice(invoice);
  };

  // DUE COLLECTION HANDLER
  const handleAddPayment = (customerId: string, amount: number, method: string, note: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDue = Math.max(0, c.totalDue - amount);
          const newLedgerEntry: CustomerLedgerEntry = {
            id: `led-${Date.now()}`,
            date: '2026-11-08',
            type: 'টাকা_জমা',
            amount,
            note: `${note} (${method})`,
            remainingDue: newDue,
          };

          return {
            ...c,
            totalDue: newDue,
            status: newDue === 0 ? 'পরিশোধিত' : 'বকেয়া আছে',
            lastTransactionDate: '2026-11-08',
            ledger: [newLedgerEntry, ...c.ledger],
          };
        }
        return c;
      })
    );
  };

  // ADD NEW CUSTOMER HANDLER
  const handleAddNewCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
  };

  // ADD PRODUCT HANDLER
  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  // UPDATE STOCK HANDLER
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQty: newStock } : p))
    );
  };

  // DELETE PRODUCT HANDLER
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // ADD PURCHASE HANDLER
  const handleAddPurchase = (
    purchase: PurchaseInvoice,
    stockUpdates: { productId: string; qty: number }[]
  ) => {
    setPurchases((prev) => [purchase, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const matched = stockUpdates.find((u) => u.productId === p.id);
        if (matched) {
          return {
            ...p,
            stockQty: p.stockQty + matched.qty,
          };
        }
        return p;
      })
    );

    if (purchase.dueAmount > 0) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === purchase.supplierId) {
            return {
              ...s,
              totalPurchased: s.totalPurchased + purchase.totalAmount,
              balanceDue: s.balanceDue + purchase.dueAmount,
            };
          }
          return s;
        })
      );
    }
  };

  // ADD SUPPLIER HANDLER
  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [supplier, ...prev]);
  };

  // ADD EXPENSE HANDLER
  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // JUMP TO BARCODE GENERATOR HANDLER
  const handleGoToBarcode = (product: Product) => {
    setBarcodeSelectedProduct(product);
    setActiveTab('barcodes');
  };

  // MFS Transactions
  const handleAddMfsTransaction = (trx: MfsTransaction) => {
    setMfsTransactions((prev) => [trx, ...prev]);
  };

  // Cash in Hand calculation
  const todayCashSales = sales
    .filter((s) => s.paymentMethod === 'নগদ')
    .reduce((acc, s) => acc + s.paidAmount, 0);

  const todayCashExpenses = expenses
    .filter((e) => e.paymentMethod === 'নগদ')
    .reduce((acc, e) => acc + e.amount, 0);

  const cashInHand = Math.max(0, 73735 + todayCashSales - todayCashExpenses);

  return (
    <div className="min-h-screen bg-[#ecf3f4] flex flex-col antialiased selection:bg-[#00875a] selection:text-white">
      
      {/* Top Header Banner ("KHAN MANAGEMENT") */}
      <TopHeader
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        shopName="KHAN MANAGEMENT"
        subTitle="Point of Sale Management System"
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 min-w-0">
        
        {/* Left Dark Forest Green Sidebar with 11 exact menus */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileMenuOpen}
          setIsOpenMobile={setIsMobileMenuOpen}
        />

        {/* Viewport Content Area */}
        <main className="lg:pl-56 flex-1 p-3 sm:p-5 lg:p-6 w-full min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              sales={sales}
              products={products}
              customers={customers}
              expenses={expenses}
              onOpenPOS={() => setActiveTab('pos')}
              onOpenInventory={() => setActiveTab('products')}
              onOpenBakiKhata={() => setActiveTab('cash_ledger')}
              onSelectInvoice={(inv) => setReceiptInvoice(inv)}
            />
          )}

          {activeTab === 'pos' && (
            <POSView
              products={products}
              customers={customers}
              onCompleteSale={handleCompleteSale}
              soundEnabled={soundEnabled}
              onOpenInventory={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'mfs' && (
            <MFSView
              balances={mfsBalances}
              onUpdateBalances={setMfsBalances}
              transactions={mfsTransactions}
              onAddTransaction={handleAddMfsTransaction}
              soundEnabled={soundEnabled}
              cashInHand={cashInHand}
            />
          )}

          {activeTab === 'products' && (
            <InventoryView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleUpdateStock}
              onDeleteProduct={handleDeleteProduct}
              onGoToBarcode={handleGoToBarcode}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchasesView
              suppliers={suppliers}
              purchases={purchases}
              products={products}
              onAddPurchase={handleAddPurchase}
              onAddSupplier={handleAddSupplier}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'stock' && (
            <StockView
              products={products}
              onUpdateStock={handleUpdateStock}
              onGoToBarcode={handleGoToBarcode}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onAddExpense={handleAddExpense}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={sales}
              expenses={expenses}
              products={products}
              customers={customers}
            />
          )}

          {activeTab === 'cash_ledger' && (
            <BakiKhataView
              customers={customers}
              onAddPayment={handleAddPayment}
              onAddNewCustomer={handleAddNewCustomer}
              soundEnabled={soundEnabled}
            />
          )}

          {activeTab === 'barcodes' && (
            <BarcodeGeneratorView
              products={products}
              initialSelectedProduct={barcodeSelectedProduct}
            />
          )}

          {activeTab === 'online_services' && (
            <OnlineServicesView />
          )}
        </main>
      </div>

      {/* Printable Thermal Receipt Modal */}
      <ThermalReceiptModal
        invoice={receiptInvoice}
        onClose={() => setReceiptInvoice(null)}
      />

    </div>
  );
}
