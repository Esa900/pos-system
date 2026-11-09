import React, { useState } from 'react';
import { Customer, CustomerLedgerEntry } from '../../types';
import { formatBDT, toBanglaNumber, playPOSBeep } from '../../utils/bengaliUtils';
import {
  BookOpen,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  X,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  DollarSign,
  Copy,
} from 'lucide-react';

interface Props {
  customers: Customer[];
  onAddPayment: (customerId: string, amount: number, method: string, note: string) => void;
  onAddNewCustomer: (customer: Customer) => void;
  soundEnabled: boolean;
}

export const BakiKhataView: React.FC<Props> = ({
  customers,
  onAddPayment,
  onAddNewCustomer,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'paid'>('all');

  // Modals state
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'নগদ' | 'বিকাশ'>('নগদ');
  const [paymentNote, setPaymentNote] = useState<string>('');

  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<Customer | null>(null);
  const [smsCustomer, setSmsCustomer] = useState<Customer | null>(null);
  const [smsCopied, setSmsCopied] = useState(false);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustInitialDue, setNewCustInitialDue] = useState('');

  // Total summary calculations
  const totalDues = customers.reduce((acc, c) => acc + c.totalDue, 0);
  const totalCustomersWithDue = customers.filter((c) => c.totalDue > 0).length;
  const totalClearedCustomers = customers.filter((c) => c.totalDue === 0).length;

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'due'
        ? c.totalDue > 0
        : c.totalDue === 0;

    return matchesSearch && matchesStatus;
  });

  // Handle Record Payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }

    if (amount > selectedCustomerForPayment.totalDue) {
      if (!confirm(`জমা টাকার পরিমাণ (৳${amount}) মোট বকেয়ার (৳${selectedCustomerForPayment.totalDue}) চেয়ে বেশি। আপনি কি চালিয়ে যেতে চান?`)) {
        return;
      }
    }

    onAddPayment(
      selectedCustomerForPayment.id,
      amount,
      paymentMethod,
      paymentNote.trim() || 'বকেয়া টাকা জমা গ্রহণ'
    );

    if (soundEnabled) playPOSBeep('success');
    setSelectedCustomerForPayment(null);
    setPaymentAmount('');
    setPaymentNote('');
  };

  // Handle Create New Customer
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('গ্রাহকের নাম ও ফোন নম্বর আবশ্যক!');
      return;
    }

    const initialDue = parseFloat(newCustInitialDue) || 0;
    const initialLedger: CustomerLedgerEntry[] = initialDue > 0 ? [
      {
        id: `led-${Date.now()}`,
        date: '2026-11-08',
        type: 'প্রারম্ভিক_বাকি',
        amount: initialDue,
        note: 'হিসাব খোলার সময় প্রারম্ভিক বকেয়া',
        remainingDue: initialDue,
      }
    ] : [];

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'ঢাকা',
      totalSpent: initialDue,
      totalDue: initialDue,
      status: initialDue > 0 ? 'বকেয়া আছে' : 'পরিশোধিত',
      lastTransactionDate: '2026-11-08',
      ledger: initialLedger,
    };

    onAddNewCustomer(newCust);
    if (soundEnabled) playPOSBeep('success');
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustInitialDue('');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Due Banner */}
        <div className="bg-gradient-to-r from-rose-900 to-rose-700 p-5 rounded-xl text-white shadow-xs">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-medium">মোট বকেয়া বাকি (মার্কেট দেনা)</span>
            <BookOpen className="w-5 h-5 text-rose-300" />
          </div>
          <div className="text-2xl font-bold font-mono">
            {formatBDT(totalDues)}
          </div>
          <p className="text-[11px] text-rose-200 mt-1">
            {toBanglaNumber(totalCustomersWithDue)} জন গ্রাহকের কাছে পাওনা রয়েছে
          </p>
        </div>

        {/* Due Customers Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">বকেয়া খাতা গ্রাহক</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {toBanglaNumber(totalCustomersWithDue)} জন
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            মোট খাতাভুক্ত গ্রাহক {toBanglaNumber(customers.length)} জন
          </p>
        </div>

        {/* Cleared Customers Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">পরিশোধিত হিসাব</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {toBanglaNumber(totalClearedCustomers)} জন
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            বকেয়া শূন্য ও পরিশোধ সম্পন্ন
          </p>
        </div>

      </div>

      {/* Control Bar: Search, Filters & Add Customer */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="গ্রাহকের নাম, মোবাইল বা ঠিকানা দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition text-slate-800"
          />
        </div>

        {/* Filter Buttons & Add Customer */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 font-medium rounded-md transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              সব গ্রাহক
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-3 py-1 font-medium rounded-md transition cursor-pointer ${
                statusFilter === 'due' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-600'
              }`}
            >
              বকেয়া বাকি আছে
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 font-medium rounded-md transition cursor-pointer ${
                statusFilter === 'paid' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              পরিশোধিত
            </button>
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            + নতুন বাকি গ্রাহক
          </button>
        </div>

      </div>

      {/* Customer Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">গ্রাহকের নাম ও বিবরণ</th>
                <th className="py-3 px-4">মোবাইল নম্বর</th>
                <th className="py-3 px-4">ঠিকানা</th>
                <th className="py-3 px-4 text-right">সর্বমোট কেনাকাটা</th>
                <th className="py-3 px-4 text-right font-bold">বর্তমান বকেয়া বাকি</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">দ্রুত অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো গ্রাহকের হিসাব পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const hasDue = customer.totalDue > 0;
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {customer.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>সর্বশেষ লেনদেন: {customer.lastTransactionDate}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatBDT(customer.totalSpent)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            hasDue ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {formatBDT(customer.totalDue)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            hasDue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Record Payment Button */}
                          {hasDue && (
                            <button
                              onClick={() => {
                                setSelectedCustomerForPayment(customer);
                                setPaymentAmount(customer.totalDue.toString());
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
                            >
                              <DollarSign className="w-3 h-3" />
                              টাকা জমা নিন
                            </button>
                          )}

                          {/* Full Ledger Statement Button */}
                          <button
                            onClick={() => setSelectedCustomerForLedger(customer)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                            title="সম্পূর্ণ লেজার খাতা দেখুন"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>

                          {/* Send SMS Reminder */}
                          {hasDue && (
                            <button
                              onClick={() => setSmsCustomer(customer)}
                              className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                              title="তাগাদা এসএমএস পাঠান"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Modal 1: Record Due Collection ("টাকা জমা নিন") */}
      {selectedCustomerForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">বাকি টাকা জমা নিন</h3>
              </div>
              <button
                onClick={() => setSelectedCustomerForPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-800">{selectedCustomerForPayment.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span className="font-mono">{selectedCustomerForPayment.phone}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200/60 pt-1">
                  <span>মোট বকেয়া বাকি:</span>
                  <span className="font-mono">{formatBDT(selectedCustomerForPayment.totalDue)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  জমা টাকার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-hidden"
                  placeholder="টাকার পরিমাণ লিখুন"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  জমার মাধ্যম
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['নগদ', 'বিকাশ'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  মন্তব্য বা নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="যেমন: ক্যাশ টাকা বুঝে পাওয়া গেল"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForPayment(null)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Customer Full Ledger Drawer */}
      {selectedCustomerForLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedCustomerForLedger.name} এর হিসাব খাতা
                </h3>
                <p className="text-xs text-slate-500">
                  মোবাইল: {selectedCustomerForLedger.phone} | ঠিকানা: {selectedCustomerForLedger.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForLedger(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Bar */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-600">বর্তমান বকেয়া বাকি:</span>
              <span className={`text-base font-mono font-bold ${selectedCustomerForLedger.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatBDT(selectedCustomerForLedger.totalDue)}
              </span>
            </div>

            {/* Ledger Transactions Table */}
            <div className="mt-4 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">বিবরণ / নোট</th>
                    <th className="py-2 px-3 text-right">বাকি বৃদ্ধি (ডেবিট)</th>
                    <th className="py-2 px-3 text-right">টাকা জমা (ক্রেডিট)</th>
                    <th className="py-2 px-3 text-right">অবশিষ্ট বাকি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedCustomerForLedger.ledger.map((entry) => {
                    const isDebit = entry.type === 'বিক্রি_বাকি' || entry.type === 'প্রারম্ভিক_বাকি';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-600">{entry.date}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium">
                          {entry.note}
                          {entry.invoiceId && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              মেমো: {entry.invoiceId}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-600">
                          {isDebit ? formatBDT(entry.amount) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-600">
                          {!isDebit ? formatBDT(entry.amount) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatBDT(entry.remainingDue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between shrink-0">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                স্টেটমেন্ট প্রিন্ট করুন
              </button>
              <button
                onClick={() => setSelectedCustomerForLedger(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: SMS Reminder simulation */}
      {smsCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">তাগাদা এসএমএস পাঠান</h3>
              </div>
              <button
                onClick={() => {
                  setSmsCustomer(null);
                  setSmsCopied(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <p className="text-xs text-slate-600">
                গ্রাহক: <strong className="text-slate-900">{smsCustomer.name}</strong> ({smsCustomer.phone})
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 font-sans">
                {`সম্মানিত গ্রাহক ${smsCustomer.name}, মেসার্স রূপরং বস্ত্রালয়-এ আপনার বকেয়া বাকি রয়েছে ৳ ${smsCustomer.totalDue.toLocaleString('en-US')} টাকা। অনুগ্রহ করে বকেয়া পরিশোধ করার জন্য অনুরোধ করা হলো। যোগাযোগের নম্বর: ০১৭০০-১১২২৩৩। ধন্যবাদ।`}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `সম্মানিত গ্রাহক ${smsCustomer.name}, মেসার্স রূপরং বস্ত্রালয়-এ আপনার বকেয়া বাকি রয়েছে ৳ ${smsCustomer.totalDue.toLocaleString('en-US')} টাকা। অনুগ্রহ করে বকেয়া পরিশোধ করার জন্য অনুরোধ করা হলো। যোগাযোগের নম্বর: ০১৭০০-১১২২৩৩। ধন্যবাদ।`;
                    navigator.clipboard.writeText(text);
                    setSmsCopied(true);
                    setTimeout(() => setSmsCopied(false), 2000);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {smsCopied ? 'কপি হয়েছে!' : 'টেক্সট কপি করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`এসএমএস সফলভাবে পাঠানো হয়েছে (${smsCustomer.phone})!`);
                    setSmsCustomer(null);
                  }}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  এসএমএস পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Add New Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">+ নতুন বাকি খাতা গ্রাহক যুক্ত করুন</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">গ্রাহকের পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: হাজী আব্দুল মালেক"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ঠিকানা / পরিচিতি</label>
                <input
                  type="text"
                  placeholder="যেমন: দোকান # ১০, ইসলামপুর, ঢাকা"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  প্রারম্ভিক বকেয়া বাকি (যদি পূর্বে থেকে থাকে)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newCustInitialDue}
                  onChange={(e) => setNewCustInitialDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
