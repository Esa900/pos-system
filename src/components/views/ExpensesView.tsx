import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { formatBDT, toBanglaNumber, playPOSBeep } from '../../utils/bengaliUtils';
import {
  Wallet,
  Plus,
  Search,
  DollarSign,
  Coffee,
  Zap,
  Building,
  Truck,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  Banknote,
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  soundEnabled: boolean;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const ExpensesView: React.FC<Props> = ({
  expenses,
  onAddExpense,
  soundEnabled,
  isOpenModal,
  onCloseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('সব');
  const [isAddOpenInternal, setIsAddOpenInternal] = useState(false);

  // New Expense form state
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('চা-নাস্তা ও আপ্যায়ন');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState('2026-11-08');
  const [expMethod, setExpMethod] = useState<'নগদ' | 'বিকাশ' | 'ব্যাংক'>('নগদ');
  const [expNote, setExpNote] = useState('');

  const isModalOpen = isOpenModal !== undefined ? isOpenModal : isAddOpenInternal;
  const closeModal = onCloseModal || (() => setIsAddOpenInternal(false));

  const categories: ExpenseCategory[] = [
    'দোকান ভাড়া',
    'বিদ্যুৎ ও ইউটিলিটি',
    'কর্মচারীর বেতন',
    'চা-নাস্তা ও আপ্যায়ন',
    'পরিবহন ও যাতায়াত',
    'দোকানের সাজসজ্জা',
    'অন্যান্য',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCatFilter === 'সব' || e.category === selectedCatFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const todayStr = '2026-11-08';
  const todayExpenseAmount = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  // Category total breakdown
  const categorySummary: { [key: string]: number } = {};
  expenses.forEach((e) => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(amount) || amount <= 0) {
      alert('সঠিক বিবরণ ও টাকার পরিমাণ লিখুন!');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      category: expCategory,
      amount,
      date: expDate,
      paymentMethod: expMethod,
      note: expNote.trim(),
    };

    onAddExpense(newExpense);
    if (soundEnabled) playPOSBeep('success');
    closeModal();
    setExpTitle('');
    setExpAmount('');
    setExpNote('');
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'চা-নাস্তা ও আপ্যায়ন': return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'বিদ্যুৎ ও ইউটিলিটি': return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'দোকান ভাড়া': return <Building className="w-3.5 h-3.5 text-indigo-600" />;
      case 'পরিবহন ও যাতায়াত': return <Truck className="w-3.5 h-3.5 text-teal-600" />;
      default: return <Wallet className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">আজকের মোট দোকান খরচ</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {formatBDT(todayExpenseAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">দৈনিক ক্যাশ থেকে বাদ গেছে</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">চলতি মাসের সর্বমোট খরচ</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatBDT(totalExpenseAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">দোকানের মোট পরিচালন ব্যয়</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">সর্বোচ্চ খরচের খাত</span>
          <div className="text-lg font-bold text-slate-900 mt-1 truncate">
            {Object.entries(categorySummary).sort((a, b) => b[1] - a[1])[0]?.[0] || 'দোকান ভাড়া'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {formatBDT(Object.entries(categorySummary).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="খরচের বিবরণ বা নোট দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition text-slate-800"
            />
          </div>

          <button
            onClick={() => setIsAddOpenInternal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            + নতুন খরচ লিখুন
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCatFilter('সব')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedCatFilter === 'সব'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সব খরচ ({toBanglaNumber(expenses.length)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCatFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedCatFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">খরচের খাত (ক্যাটাগরি)</th>
                <th className="py-3 px-4">বিবরণ ও মন্তব্য</th>
                <th className="py-3 px-4 text-center">পরিশোধের মাধ্যম</th>
                <th className="py-3 px-4 text-right font-bold">টাকার পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-slate-100 shrink-0">
                        {getCategoryIcon(exp.category)}
                      </span>
                      <span className="font-semibold text-slate-800">{exp.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{exp.title}</div>
                    {exp.note && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{exp.note}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                    {formatBDT(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">+ দৈনিক দোকানের খরচ লিখুন</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">খরচের শিরোনাম / বিবরণ *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সেলসম্যান দুপুরের নাস্তা ও চা"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">খরচের খাত (ক্যাটাগরি)</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">টাকার পরিমাণ (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পরিশোধের মাধ্যম</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['নগদ', 'বিকাশ', 'ব্যাংক'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setExpMethod(m)}
                      className={`py-1.5 text-center rounded-lg border font-semibold transition cursor-pointer ${
                        expMethod === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: রসিদ নং / বিস্তারিত"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-sm cursor-pointer"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
