import React, { useState } from 'react';
import { formatBDT } from '../../utils/bengaliUtils';
import {
  Globe,
  FileCheck,
  Zap,
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Smartphone,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface ServiceApplication {
  id: string;
  serviceType: string;
  applicantName: string;
  phone: string;
  referenceNo: string;
  fee: number;
  cost: number;
  status: 'সম্পন্ন' | 'প্রক্রিয়াধীন' | 'বাতিল';
  date: string;
}

const INITIAL_APPLICATIONS: ServiceApplication[] = [
  {
    id: 'app-1',
    serviceType: 'অনলাইন জন্ম নিবন্ধন সংশোধন',
    applicantName: 'মো: আব্দুল করিম',
    phone: '01712-345678',
    referenceNo: 'BRIS-2026-9812',
    fee: 350,
    cost: 100,
    status: 'সম্পন্ন',
    date: '08-11-2026',
  },
  {
    id: 'app-2',
    serviceType: 'পল্লী বিদ্যুৎ বিল পরিশোধ',
    applicantName: 'হাজী শফিকুজ্জামান',
    phone: '01819-876543',
    referenceNo: 'BREB-450912',
    fee: 1420,
    cost: 1400,
    status: 'সম্পন্ন',
    date: '08-11-2026',
  },
  {
    id: 'app-3',
    serviceType: 'জাতীয় পরিচয়পত্র (NID) রি-ইস্যু',
    applicantName: 'নাসরিন সুলতানা',
    phone: '01911-223344',
    referenceNo: 'NID-992381',
    fee: 400,
    cost: 230,
    status: 'প্রক্রিয়াধীন',
    date: '07-11-2026',
  },
];

export const OnlineServicesView: React.FC = () => {
  const [applications, setApplications] = useState<ServiceApplication[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [serviceType, setServiceType] = useState('পল্লী বিদ্যুৎ বিল পরিশোধ');
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [refNo, setRefNo] = useState('');
  const [fee, setFee] = useState('');
  const [cost, setCost] = useState('');

  const servicesList = [
    'পল্লী বিদ্যুৎ বিল পরিশোধ',
    'ডেসকো / নেসকো বিদ্যুৎ বিল',
    'অনলাইন জন্ম নিবন্ধন আবেদন',
    'জাতীয় পরিচয়পত্র (NID) রি-ইস্যু',
    'সরকারি চাকরির আবেদন ফরম',
    'পাসপোর্ট আবেদন ও ফি প্রদান',
    'টিন (e-TIN) সার্টিফিকেট ও রিটার্ন',
    'অন্যান্য অনলাইন নাগরিক সেবা',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !phone.trim()) {
      alert('আবেদনকারীর নাম ও ফোন নম্বর লিখুন!');
      return;
    }

    const newApp: ServiceApplication = {
      id: `app-${Date.now()}`,
      serviceType,
      applicantName: applicantName.trim(),
      phone: phone.trim(),
      referenceNo: refNo.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      fee: parseFloat(fee) || 0,
      cost: parseFloat(cost) || 0,
      status: 'সম্পন্ন',
      date: '08-11-2026',
    };

    setApplications([newApp, ...applications]);
    setIsAddOpen(false);
    setApplicantName('');
    setPhone('');
    setRefNo('');
    setFee('');
    setCost('');
  };

  const filtered = applications.filter(
    (a) =>
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.referenceNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      
      {/* Top Header Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">অনলাইন আবেদন ও নাগরিক সেবা</h2>
            <p className="text-xs text-slate-500">বিদ্যুৎ বিল, জন্ম নিবন্ধন, এনআইডি ও সরকারি ফরম ফিলাপ</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#00875a] hover:bg-[#00744d] active:scale-95 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 font-bold" />
          + নতুন আবেদন / বিল জমা
        </button>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">আবেদন ও বিলের তালিকা</span>
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">তারিখ</th>
                <th className="py-2.5 px-4">সেবার ধরণ</th>
                <th className="py-2.5 px-4">আবেদনকারীর নাম ও মোবাইল</th>
                <th className="py-2.5 px-4">ট্র্যাকিং / রেফারেন্স নং</th>
                <th className="py-2.5 px-4 text-right">গ্রাহক ফি (৳)</th>
                <th className="py-2.5 px-4 text-right">লাভ (৳)</th>
                <th className="py-2.5 px-4 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-mono text-slate-600">{item.date}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{item.serviceType}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-900">{item.applicantName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{item.referenceNo}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    ৳ {item.fee.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                    ৳ {(item.fee - item.cost).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Application */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
              + নতুন অনলাইন আবেদন বা বিল এন্ট্রি
            </h3>

            <form onSubmit={handleAddSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">সেবার ধরণ</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  {servicesList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মো: রফিকুল ইসলাম"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মিটার নং / ট্র্যাকিং রেফারেন্স</label>
                <input
                  type="text"
                  placeholder="যেমন: বিল নং বা মিটার নম্বর"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোট বিল / ফি (৳)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">দোকানের নিজস্ব খরচ (৳)</label>
                  <input
                    type="number"
                    placeholder="450"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#00875a] hover:bg-[#00744d] text-white font-semibold rounded-lg transition shadow-xs cursor-pointer"
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
