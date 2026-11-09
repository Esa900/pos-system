import React, { useState } from 'react';
import { MfsBalances, MfsTransaction } from '../../types';
import { playPOSBeep } from '../../utils/bengaliUtils';

interface Props {
  balances: MfsBalances;
  onUpdateBalances: (newBalances: MfsBalances) => void;
  transactions: MfsTransaction[];
  onAddTransaction: (trx: MfsTransaction) => void;
  soundEnabled: boolean;
  cashInHand: number;
}

export const MFSView: React.FC<Props> = ({
  balances,
  onUpdateBalances,
  transactions,
  onAddTransaction,
  soundEnabled,
  cashInHand,
}) => {
  // Buy Form State
  const [buyAmount, setBuyAmount] = useState('');
  const [buyCommission, setBuyCommission] = useState('0');
  const [buyReference, setBuyReference] = useState('');

  // Sale Form State
  const [saleAmount, setSaleAmount] = useState('');
  const [saleCommission, setSaleCommission] = useState('0');
  const [saleCost, setSaleCost] = useState('0');
  const [saleReference, setSaleReference] = useState('');

  // Calculate totals
  const totalMfsBalance = balances.bkash + balances.nagad + balances.rocket;

  // Filter last 5 buys and sales
  const last5Buys = transactions
    .filter((t) => t.type === 'buy')
    .slice(0, 5);

  const last5Sales = transactions
    .filter((t) => t.type === 'sale')
    .slice(0, 5);

  // Today's stats calculation
  const todayDate = '05-11-2026';
  const todayTransactions = transactions.filter((t) => t.date === todayDate);
  const todayVolume = todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  const todayProfit = todayTransactions.reduce((acc, t) => acc + t.commission, 0);

  // Execute Buy Transaction (Increases MFS balance)
  const handleBuy = (service: 'bKash' | 'Nagad' | 'Rocket') => {
    const amt = parseFloat(buyAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }
    const comm = parseFloat(buyCommission) || 0;

    const newTrx: MfsTransaction = {
      id: `mfs-${Date.now()}`,
      date: '05-11-2026',
      type: 'buy',
      service,
      amount: amt,
      commission: comm,
      reference: buyReference.trim() || '—',
    };

    onAddTransaction(newTrx);

    // Update balance
    const updated = { ...balances };
    if (service === 'bKash') updated.bkash += amt;
    else if (service === 'Nagad') updated.nagad += amt;
    else if (service === 'Rocket') updated.rocket += amt;

    onUpdateBalances(updated);
    if (soundEnabled) playPOSBeep('success');

    // Reset Form
    setBuyAmount('');
    setBuyCommission('0');
    setBuyReference('');
  };

  // Execute Sale Transaction (Decreases MFS balance)
  const handleSale = (service: 'bKash' | 'Nagad' | 'Rocket') => {
    const amt = parseFloat(saleAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }

    // Check balance
    const currentBal = service === 'bKash' ? balances.bkash : service === 'Nagad' ? balances.nagad : balances.rocket;
    if (amt > currentBal) {
      alert(`পর্যাপ্ত ${service} ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${currentBal.toLocaleString()}`);
      return;
    }

    const comm = parseFloat(saleCommission) || 0;
    const cost = parseFloat(saleCost) || 0;

    const newTrx: MfsTransaction = {
      id: `mfs-${Date.now()}`,
      date: '05-11-2026',
      type: 'sale',
      service,
      amount: amt,
      commission: comm,
      cost,
      reference: saleReference.trim() || '—',
    };

    onAddTransaction(newTrx);

    // Deduct from balance
    const updated = { ...balances };
    if (service === 'bKash') updated.bkash -= amt;
    else if (service === 'Nagad') updated.nagad -= amt;
    else if (service === 'Rocket') updated.rocket -= amt;

    onUpdateBalances(updated);
    if (soundEnabled) playPOSBeep('success');

    // Reset Form
    setSaleAmount('');
    setSaleCommission('0');
    setSaleCost('0');
    setSaleReference('');
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Title */}
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
        MFS Management
      </h2>

      {/* TOP ROW: 4 PASTEL CARDS (Exact match to Image 2 row 1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* বিকাশ ব্যালেন্স (Pink pastel) */}
        <div className="bg-[#fce7f3] rounded-xl p-4 sm:p-5 border border-pink-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            বিকাশ ব্যালেন্স
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {balances.bkash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* নগদ ব্যালেন্স (Mint green pastel) */}
        <div className="bg-[#dcfce7] rounded-xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            নগদ ব্যালেন্স
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {balances.nagad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* রকেট ব্যালেন্স (Lavender/Purple pastel) */}
        <div className="bg-[#ede9fe] rounded-xl p-4 sm:p-5 border border-purple-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            রকেট ব্যালেন্স
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {balances.rocket.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* মোট MFS ব্যালেন্স (Soft Blue pastel) */}
        <div className="bg-[#e0f2fe] rounded-xl p-4 sm:p-5 border border-sky-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            মোট MFS ব্যালেন্স
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {totalMfsBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

      </div>

      {/* SECOND ROW: 4 PASTEL CARDS (Exact match to Image 2 row 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* আজকের মোট লেনদেন (Cyan/Blue pastel) */}
        <div className="bg-[#e0f2fe] rounded-xl p-4 sm:p-5 border border-sky-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            আজকের মোট লেনদেন
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* আজকের লাভ (Peach/Orange pastel) */}
        <div className="bg-[#ffedd5] rounded-xl p-4 sm:p-5 border border-orange-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            আজকের লাভ
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {todayProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* গতকালের লাভ (Lavender pastel) */}
        <div className="bg-[#ede9fe] rounded-xl p-4 sm:p-5 border border-purple-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            গতকালের লাভ
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            0.00
          </div>
        </div>

        {/* ক্যাশ টাকা (Mint Green pastel) */}
        <div className="bg-[#dcfce7] rounded-xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 mb-1">
            ক্যাশ টাকা
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {cashInHand > 0
              ? cashInHand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '73,735.00'}
          </div>
        </div>

      </div>

      {/* TWO COLUMNS: MFS Buy & MFS Sale (Exact recreation of Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
        
        {/* LEFT COLUMN: MFS Buy */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800">MFS Buy</h3>

          {/* Row 1: Amount & Commission */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-8">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Amount
              </label>
              <input
                type="number"
                placeholder="টাকার পরিমাণ"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden font-mono"
              />
            </div>
            <div className="col-span-4">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Commission
              </label>
              <input
                type="number"
                value={buyCommission}
                onChange={(e) => setBuyCommission(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Row 2: Reference / Last Number */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Reference / Last Number
            </label>
            <input
              type="text"
              placeholder="রেফারেন্স বা শেষ নম্বর"
              value={buyReference}
              onChange={(e) => setBuyReference(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Row 3: Action Buttons (বিকাশ Buy, নগদ Buy, রকেট Buy) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleBuy('bKash')}
              className="py-2 px-2 bg-[#00875a] hover:bg-[#00744d] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              বিকাশ Buy
            </button>
            <button
              type="button"
              onClick={() => handleBuy('Nagad')}
              className="py-2 px-2 bg-[#059669] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              নগদ Buy
            </button>
            <button
              type="button"
              onClick={() => handleBuy('Rocket')}
              className="py-2 px-2 bg-[#0f766e] hover:bg-[#115e59] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              রকেট Buy
            </button>
          </div>

          {/* Table: সর্বশেষ ৫টি Buy */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              সর্বশেষ ৫টি Buy
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">সার্ভিস</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {last5Buys.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-600">{trx.date}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{trx.service}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                        {trx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MFS Sale */}
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-3.5">
          <h3 className="text-sm font-bold text-slate-800">MFS Sale</h3>

          {/* Row 1: Amount & Commission */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-8">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Amount
              </label>
              <input
                type="number"
                placeholder="টাকার পরিমাণ"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-hidden font-mono"
              />
            </div>
            <div className="col-span-4">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Commission
              </label>
              <input
                type="number"
                value={saleCommission}
                onChange={(e) => setSaleCommission(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Row 2: Cost & Reference / Last Number */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-4">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Cost
              </label>
              <input
                type="number"
                value={saleCost}
                onChange={(e) => setSaleCost(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-hidden font-mono"
              />
            </div>
            <div className="col-span-8">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Reference / Last Number
              </label>
              <input
                type="text"
                placeholder="রেফারেন্স বা শেষ নম্বর"
                value={saleReference}
                onChange={(e) => setSaleReference(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 3: Action Buttons (বিকাশ Sale, নগদ Sale, রকেট Sale - all Blue) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSale('bKash')}
              className="py-2 px-2 bg-[#1e6cd9] hover:bg-[#1a5ec2] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              বিকাশ Sale
            </button>
            <button
              type="button"
              onClick={() => handleSale('Nagad')}
              className="py-2 px-2 bg-[#1e6cd9] hover:bg-[#1a5ec2] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              নগদ Sale
            </button>
            <button
              type="button"
              onClick={() => handleSale('Rocket')}
              className="py-2 px-2 bg-[#1e6cd9] hover:bg-[#1a5ec2] active:scale-95 text-white text-xs font-bold rounded-lg shadow-2xs transition text-center cursor-pointer"
            >
              রকেট Sale
            </button>
          </div>

          {/* Table: সর্বশেষ ৫টি Sale */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              সর্বশেষ ৫টি Sale
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">তারিখ</th>
                    <th className="py-2 px-3">সার্ভিস</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-center">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {last5Sales.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-slate-600">{trx.date}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{trx.service}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                        {trx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">
                        {trx.commission}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
