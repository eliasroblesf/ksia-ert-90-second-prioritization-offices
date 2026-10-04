/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Building2, 
  ChevronRight, 
  AlertTriangle,
  QrCode,
  Sparkles,
  LockKeyhole
} from 'lucide-react';
import { motion } from 'motion/react';

export interface StudentInfo {
  name: string;
  badgeNumber: string;
  department: string;
  authenticatedAt: string;
}

interface StudentSplashScreenProps {
  onAuthenticate: (info: StudentInfo) => void;
  initialInfo?: StudentInfo | null;
}

export const StudentSplashScreen: React.FC<StudentSplashScreenProps> = ({ 
  onAuthenticate, 
  initialInfo 
}) => {
  const [name, setName] = useState(initialInfo?.name || '');
  const [badgeNumber, setBadgeNumber] = useState(initialInfo?.badgeNumber || '');
  const [department, setDepartment] = useState(
    initialInfo?.department || 'Main Administration Offices'
  );
  const [touched, setTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const officeDepartments = [
    'Main Administration Offices',
    'IT & Computer Support Offices',
    'Staff ID & Badging Center',
    'Flight Planning & Dispatch Office',
    'Human Resources & Office Records'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name to continue.');
      return;
    }
    if (!badgeNumber.trim()) {
      setErrorMsg('Please enter your badge number or employee ID.');
      return;
    }

    setErrorMsg('');
    const studentData: StudentInfo = {
      name: name.trim(),
      badgeNumber: badgeNumber.trim().toUpperCase(),
      department,
      authenticatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('ksia_student_credentials', JSON.stringify(studentData));
    } catch {
      // ignore
    }

    onAuthenticate(studentData);
  };

  const generateAutoBadge = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setBadgeNumber(`KSIA-${randomNum}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Easy Sign-In Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Airport Office Safety Training</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student Sign-In
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to the <strong>Airport Office Emergency Drill</strong>. 
              In this training, you will practice helping people in everyday office emergencies (like meeting rooms, staff kitchens, and desk areas).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#0a0f1a]/95 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-xs"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Your Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched) setErrorMsg('');
                }}
                placeholder="e.g. Mohammed Al-Salem"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all text-sm"
              />
              <p className="text-[11px] text-slate-500">This name will be printed on your completion certificate.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Your Badge Number or Employee ID <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateAutoBadge}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Create sample ID
                </button>
              </div>
              <input
                type="text"
                required
                value={badgeNumber}
                onChange={(e) => {
                  setBadgeNumber(e.target.value);
                  if (touched) setErrorMsg('');
                }}
                placeholder="e.g. KSIA-4820"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all text-sm uppercase font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Your Office Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition-all text-sm cursor-pointer"
              >
                {officeDepartments.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#0a0f1a] text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all rounded-xl font-bold text-white tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-[0.99]"
              >
                <span>Start Practice Drill</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1 text-emerald-400">
                <LockKeyhole className="w-3 h-3" /> Easy 90-second training
              </span>
              <span>Airport Offices Emergency Drill</span>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Visual Student Badge Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-[#0f172a] to-[#070b14] border-2 border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Lanyard punch hole */}
            <div className="w-12 h-2.5 bg-black/80 border border-white/20 rounded-full mx-auto mb-5 shadow-inner" />

            {/* Badge Top Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-wide text-white">KSIA AIRPORT</div>
                  <div className="text-[9px] text-emerald-400">OFFICE SAFETY BADGE</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                TRAINEE
              </span>
            </div>

            {/* Photo & Name */}
            <div className="flex gap-4 items-center mb-4">
              <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-slate-800 to-black border border-white/15 flex flex-col items-center justify-center shrink-0">
                <User className="w-10 h-10 text-slate-400" />
                <div className="text-[9px] text-center text-emerald-400 mt-1 font-semibold">
                  STUDENT
                </div>
              </div>

              <div className="space-y-1 overflow-hidden">
                <div className="text-[10px] text-slate-400">Student Name</div>
                <div className="text-base font-bold text-white truncate">
                  {name.trim() || 'Type your name'}
                </div>
                <div className="text-[10px] text-slate-400 mt-2">Badge ID</div>
                <div className="text-xs font-mono font-bold text-emerald-400 truncate">
                  {badgeNumber.trim().toUpperCase() || 'NO BADGE YET'}
                </div>
              </div>
            </div>

            {/* Location Area */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-3 mb-4 space-y-1">
              <div className="text-[9px] text-slate-400">Assigned Office Location</div>
              <div className="text-xs font-medium text-slate-200 truncate">
                {department}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready to practice
              </div>
            </div>

            {/* Simple Barcode */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <div className="h-3.5 flex items-center gap-0.5 opacity-60">
                  {[4, 2, 6, 1, 5, 2, 4, 3, 2, 5, 1, 4, 2, 6].map((w, i) => (
                    <div 
                      key={i} 
                      className="h-full bg-white rounded-xs" 
                      style={{ width: `${w * 1.5}px` }} 
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">ID: {badgeNumber ? badgeNumber.slice(-4) : '0000'}</span>
              </div>
              <QrCode className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Easy 90-second practice for airport staff
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
