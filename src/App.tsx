/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Activity, 
  Users, 
  ChevronRight, 
  FileText, 
  RefreshCcw,
  CheckCircle2,
  Lock,
  Download,
  Radio,
  Zap,
  Navigation,
  MessageSquare,
  Building2,
  BadgeCheck,
  UserCheck,
  Award,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { scenarios, Scenario, TriageTag } from './data/scenarios';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StudentSplashScreen, StudentInfo } from './components/StudentSplashScreen';

type AppPhase = 'SPLASH' | 'LOBBY' | 'TEAM_SETUP' | 'TERMINAL' | 'RESULT';

interface TeamRoles {
  triageOfficer: string;
  interventionSpecialist: string;
  timekeeper: string;
  sceneController: string;
}

export default function App() {
  // Student Credential State
  const [student, setStudent] = useState<StudentInfo | null>(() => {
    try {
      const saved = localStorage.getItem('ksia_student_credentials');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // App Phase State
  const [phase, setPhase] = useState<AppPhase>(() => {
    try {
      const saved = localStorage.getItem('ksia_student_credentials');
      return saved ? 'LOBBY' : 'SPLASH';
    } catch {
      return 'SPLASH';
    }
  });

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [roles, setRoles] = useState<TeamRoles>({
    triageOfficer: '',
    interventionSpecialist: '',
    timekeeper: '',
    sceneController: ''
  });

  // Simulation State
  const [timeLeft, setTimeLeft] = useState(90);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userTags, setUserTags] = useState<Record<string, TriageTag>>({});
  const [selectedIntervention, setSelectedIntervention] = useState<number | null>(null);
  const [justification, setJustification] = useState('');
  const [firstClickId, setFirstClickId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Scoring
  const [score, setScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    precision: 0,
    distressBias: 0,
    intervention: 0,
    time: 0,
    justification: 0
  });

  // Teacher Injects / Distractions
  const [isFrozen, setIsFrozen] = useState(false);
  const [distressSurge, setDistressSurge] = useState(false);
  const [decompensation, setDecompensation] = useState(false);

  // --- Handlers ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'TERMINAL') return;
      
      switch(e.key) {
        case 'F1':
          e.preventDefault();
          setDistressSurge(prev => !prev);
          break;
        case 'F2':
          e.preventDefault();
          setDecompensation(prev => !prev);
          break;
        case 'F3':
          e.preventDefault();
          setIsFrozen(prev => !prev);
          setIsTimerActive(prev => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isTimerActive]);

  const handleStudentAuthenticated = (info: StudentInfo) => {
    setStudent(info);
    setRoles(prev => ({
      ...prev,
      triageOfficer: prev.triageOfficer || `${info.name} (Badge: #${info.badgeNumber})`
    }));
    setPhase('LOBBY');
  };

  const handleSelectGroup = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    if (student && !roles.triageOfficer) {
      setRoles(prev => ({
        ...prev,
        triageOfficer: `${student.name} (Badge: #${student.badgeNumber})`
      }));
    }
    setPhase('TEAM_SETUP');
  };

  const handleStartDrill = () => {
    setPhase('TERMINAL');
    setIsTimerActive(true);
    setTimeLeft(90);
    setUserTags({});
    setSelectedIntervention(null);
    setJustification('');
    setFirstClickId(null);
    setIsLocked(false);
  };

  const handleTagCasualty = (casualtyId: string, tag: TriageTag) => {
    if (isLocked) return;
    if (!firstClickId) setFirstClickId(casualtyId);
    setUserTags(prev => ({ ...prev, [casualtyId]: tag }));
  };

  const calculateScore = useCallback(() => {
    if (!selectedScenario) return;

    let precision = 0;
    selectedScenario.casualties.forEach(c => {
      if (userTags[c.id] === c.correctTag) precision += (35 / selectedScenario.casualties.length);
    });

    let distressBias = 25;
    // Penalty if first click was on a loud screaming person while a quiet dying person exists
    const redCasualties = selectedScenario.casualties.filter(c => c.correctTag === 'RED');
    const firstClickedCasualty = selectedScenario.casualties.find(c => c.id === firstClickId);
    if (redCasualties.length > 0 && firstClickedCasualty && firstClickedCasualty.isVocal) {
      distressBias = 10; // -15 points penalty for getting distracted by screams
    }

    let interventionScore = 0;
    if (selectedIntervention !== null && selectedScenario.interventions[selectedIntervention].isCorrect) {
      interventionScore = 20;
    }

    const timeScore = timeLeft > 0 ? 10 : 0;
    const justificationScore = justification.trim().length > 10 ? 10 : 0;

    const total = Math.round(precision + distressBias + interventionScore + timeScore + justificationScore);
    setScore(total);
    setScoreBreakdown({
      precision: Math.round(precision),
      distressBias,
      intervention: interventionScore,
      time: timeScore,
      justification: justificationScore
    });

    if (total >= 75) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#38bdf8']
      });
    }
  }, [selectedScenario, userTags, firstClickId, selectedIntervention, timeLeft, justification]);

  const handleLockSubmission = () => {
    setIsLocked(true);
    setIsTimerActive(false);
    calculateScore();
    setPhase('RESULT');
  };

  const handleExportPDF = () => {
    if (!selectedScenario) return;
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Clean top banner
    doc.setFillColor(10, 15, 26);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AIRPORT OFFICE EMERGENCY DRILL', 12, 16);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Student Practice Report & Certificate of Completion', 12, 24);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('King Salman International Airport - Office Safety Training', 12, 30);

    // Student Information
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFORMATION', 12, 46);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${student?.name || 'Unassigned'}`, 12, 53);
    doc.text(`Badge Number: ${student?.badgeNumber || 'N/A'}`, 12, 59);
    doc.text(`Office Department: ${selectedScenario.facilitySector}`, 12, 65);
    doc.text(`Practice Drill: ${selectedScenario.group} - ${selectedScenario.title}`, 12, 71);
    doc.text(`Exact Location: ${selectedScenario.location}`, 12, 77);
    doc.text(`Date & Time: ${timestamp}`, 12, 83);

    // Team Roles
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TEAM ROLES IN THE OFFICE', 12, 95);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Team Leader (First to Check Victims): ${roles.triageOfficer || student?.name || 'Assigned'}`, 16, 102);
    doc.text(`First-Aid Specialist: ${roles.interventionSpecialist || 'Team member'}`, 16, 108);
    doc.text(`Timekeeper: ${roles.timekeeper || 'Team member'}`, 16, 114);
    doc.text(`Office Helper (Crowd Control): ${roles.sceneController || 'Team member'}`, 16, 120);

    // Score Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR SCORE RESULTS', 12, 133);
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Score: ${score} out of 100 points`, 16, 141);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.text(`Time taken: ${90 - timeLeft} seconds (Limit was 90 seconds)`, 16, 148);

    doc.setFontSize(8.5);
    doc.text(`• Correct Color Choices: ${scoreBreakdown.precision} / 35 points`, 20, 156);
    doc.text(`• Helped Silent Critical Person First (Ignored screaming): ${scoreBreakdown.distressBias} / 25 points`, 20, 162);
    doc.text(`• Best First-Aid Action: ${scoreBreakdown.intervention} / 20 points`, 20, 168);
    doc.text(`• Finished on Time (under 90s): ${scoreBreakdown.time} / 10 points`, 20, 174);
    doc.text(`• Explained Your Decisions Clearly: ${scoreBreakdown.justification} / 10 points`, 20, 180);

    // Victims Review
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PEOPLE HELPED IN THIS DRILL', 12, 193);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    let yPos = 201;
    selectedScenario.casualties.forEach((c) => {
      const tag = userTags[c.id] || 'NOT CHOSEN';
      const isCorrect = tag === c.correctTag;
      doc.text(`${c.name}: Your choice was [${tag}] | Correct choice was [${c.correctTag}] -> ${isCorrect ? 'CORRECT' : 'INCORRECT'}`, 16, yPos);
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Why: ${c.justification}`, 20, yPos + 4.5);
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      yPos += 12;
    });

    // Student Explanation
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR WRITTEN EXPLANATION', 12, yPos + 4);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(justification || 'No explanation written.', 180);
    doc.text(splitText, 16, yPos + 11);

    const safeName = (student?.name || 'Student').replace(/\s+/g, '_');
    const safeBadge = (student?.badgeNumber || 'CADET').replace(/[^a-zA-Z0-9_-]/g, '');
    doc.save(`Airport_Office_Drill_${safeBadge}_${safeName}.pdf`);
  };

  const handleSendToWhatsApp = () => {
    if (!selectedScenario) return;
    
    const message = `*Airport Office Emergency Drill Report*%0A` +
      `*Student:* ${student?.name || 'Student'} (Badge: ${student?.badgeNumber || 'N/A'})%0A` +
      `*Office Area:* ${selectedScenario.facilitySector}%0A` +
      `*Situation:* ${selectedScenario.title}%0A` +
      `*Score:* ${score} out of 100%0A` +
      `*Time:* ${90 - timeLeft} seconds (under 90s)%0A%0A` +
      `*Leader:* ${roles.triageOfficer || student?.name}%0A` +
      `*My Explanation:* ${encodeURIComponent(justification.substring(0, 100))}${justification.length > 100 ? '...' : ''}`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const resetSimulation = () => {
    setPhase('LOBBY');
    setSelectedScenario(null);
    setRoles({
      triageOfficer: student ? `${student.name} (Badge: #${student.badgeNumber})` : '',
      interventionSpecialist: '',
      timekeeper: '',
      sceneController: ''
    });
    setTimeLeft(90);
    setIsTimerActive(false);
    setUserTags({});
    setSelectedIntervention(null);
    setJustification('');
    setFirstClickId(null);
    setIsLocked(false);
  };

  // --- Timer Effect ---
  useEffect(() => {
    let interval: number;
    if (isTimerActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleLockSubmission();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 font-sans selection:bg-emerald-500/30 flex flex-col justify-between">
      <OfflineIndicator />
      
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0a0f1a]/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (phase !== 'TERMINAL' || confirm('Go back to the practice list? The timer will restart.')) {
                  resetSimulation();
                }
              }}
              className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 hover:border-emerald-500/50 transition-colors shrink-0 cursor-pointer"
              title="Return to drill menu"
            >
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">Airport Office Safety Drill</h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  OFFICES ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Simple 90-second training for office staff & assistants
              </p>
            </div>
          </div>

          {/* Student Status Chip */}
          {student && phase !== 'SPLASH' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-200">{student.name}</span>
                <span className="text-slate-500 mx-1.5">|</span>
                <span className="text-emerald-400 font-mono font-bold">#{student.badgeNumber}</span>
              </div>
              <button
                onClick={() => setPhase('SPLASH')}
                className="text-[11px] text-slate-400 hover:text-white underline ml-2 transition-colors cursor-pointer"
                title="Change your name or badge number"
              >
                Change
              </button>
            </div>
          )}
          
          {phase === 'TERMINAL' && (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex gap-1.5">
                {distressSurge && (
                  <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-bold text-amber-400 animate-pulse">
                    LOUD SCREAMING NOISE
                  </div>
                )}
                {decompensation && (
                  <div className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded text-[10px] font-bold text-rose-400 animate-pulse">
                    PATIENT GETTING WORSE
                  </div>
                )}
                {isFrozen && (
                  <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-bold text-blue-400">
                    TIMER PAUSED
                  </div>
                )}
              </div>

              {/* 90-Second Countdown */}
              <div className={`px-3 sm:px-4 py-1.5 rounded-xl border font-mono text-base sm:text-lg font-bold tabular-nums flex items-center gap-2 ${
                timeLeft < 20 
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 animate-pulse' 
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* 1. STUDENT SPLASH / SIGN IN */}
          {phase === 'SPLASH' && (
            <StudentSplashScreen
              key="splash"
              initialInfo={student}
              onAuthenticate={handleStudentAuthenticated}
            />
          )}

          {/* 2. LOBBY - PICK AN OFFICE DRILL */}
          {phase === 'LOBBY' && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-7 py-3 sm:py-6"
            >
              {/* Student Welcome Banner */}
              {student && (
                <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a0f1a] to-black border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{student.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          BADGE #{student.badgeNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{student.department}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => setPhase('SPLASH')}
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors cursor-pointer"
                    >
                      Change Name / Badge
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Instructions */}
              <div className="text-center space-y-2 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Airport Office Workspaces (Non-Terminal)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Choose an Office Situation to Practice
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  These 5 drills simulate real, everyday accidents inside airport offices. You will have <strong>90 seconds</strong> to check 3 hurt people and decide who needs help first.
                </p>
              </div>

              {/* Simple Guide: The 4 Color Tags */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> RED (Immediate)
                  </div>
                  <p className="text-[11px] text-slate-300">Help right now! Cannot breathe, heavy bleeding, or heart stopped.</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> YELLOW (Delayed)
                  </div>
                  <p className="text-[11px] text-slate-300">Serious (broken bone or cut), but awake and breathing okay. Can wait a little.</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> GREEN (Minor)
                  </div>
                  <p className="text-[11px] text-slate-300">Walking wounded. Small scrapes, can stand, walk, and talk easily.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> BLACK (Deceased)
                  </div>
                  <p className="text-[11px] text-slate-400">No breathing and no heartbeat at all. Cannot be saved in this drill.</p>
                </div>
              </div>

              {/* 5 Everyday Office Situations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectGroup(s)}
                    className="group p-5 bg-[#0a0f1a] border border-white/10 rounded-2xl hover:border-emerald-500/50 hover:bg-[#0c1424] transition-all text-left flex flex-col justify-between shadow-lg cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">{s.group}</span>
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {s.facilitySector}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {s.title}
                      </h3>
                      
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {s.summary}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{s.location}</span>
                      </span>
                      <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                        Start Drill <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pro Tip for Students */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Tip for Non-Native English Speakers:</strong>
                  <span className="ml-1 text-slate-300">
                    If someone is screaming loudly, their throat and lungs are open! Do not get distracted by loud shouting. Look for the quiet person who is bleeding heavily or choking first.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. TEAM SETUP */}
          {phase === 'TEAM_SETUP' && selectedScenario && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto space-y-5 py-4"
            >
              <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase">{selectedScenario.group} • {selectedScenario.facilitySector}</span>
                    <h2 className="text-xl font-bold text-white">{selectedScenario.title}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedScenario.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setPhase('LOBBY')}
                    className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded bg-white/5 border border-white/10 cursor-pointer"
                  >
                    Back to List
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Who is helping in the office?</span>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { 
                        id: 'triageOfficer', 
                        label: 'Team Leader (First Person to Check Victims)', 
                        icon: ShieldAlert,
                        placeholder: student ? `${student.name} (Badge: #${student.badgeNumber})` : 'Your Name'
                      },
                      { 
                        id: 'interventionSpecialist', 
                        label: 'First-Aid Helper (Applies Bandages & CPR)', 
                        icon: Zap,
                        placeholder: 'Coworker Name (e.g. Officer Ahmed)'
                      },
                      { 
                        id: 'timekeeper', 
                        label: 'Timekeeper (Watches the 90s clock)', 
                        icon: Clock,
                        placeholder: 'Coworker Name (e.g. Sara)'
                      },
                      { 
                        id: 'sceneController', 
                        label: 'Office Helper (Keeps other workers back)', 
                        icon: Radio,
                        placeholder: 'Coworker Name (e.g. Khaled)'
                      }
                    ].map((role) => (
                      <div key={role.id} className="space-y-1">
                        <label className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                          <role.icon className="w-3.5 h-3.5 text-emerald-400" /> {role.label}
                        </label>
                        <input
                          type="text"
                          value={roles[role.id as keyof TeamRoles]}
                          onChange={(e) => setRoles(prev => ({ ...prev, [role.id]: e.target.value }))}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors text-white text-sm placeholder:text-slate-600"
                          placeholder={role.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartDrill}
                    disabled={!roles.triageOfficer}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <span>Start 90-Second Drill Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-2">
                    The 90-second countdown will start immediately on the next screen.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. TACTICAL TERMINAL */}
          {phase === 'TERMINAL' && selectedScenario && (
            <motion.div 
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5 pb-20"
            >
              {/* Situation Header */}
              <div className="bg-[#0a0f1a] border border-white/10 border-l-4 border-l-emerald-500 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {selectedScenario.group} • {selectedScenario.facilitySector}
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedScenario.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedScenario.location}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedScenario.summary}</p>
              </div>

              {/* 3 People to Check */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {selectedScenario.casualties.map((c) => (
                  <div 
                    key={c.id} 
                    className={`bg-[#0a0f1a] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      userTags[c.id] 
                        ? 'border-emerald-500/50 shadow-lg' 
                        : 'border-white/10 hover:border-white/20'
                    } ${
                      distressSurge && c.isVocal 
                        ? 'ring-2 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]' 
                        : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="bg-black/50 px-4 py-3 flex justify-between items-center border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase">{c.name}</span>
                      </div>
                      {c.isVocal && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                          SCREAMING LOUDLY
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3.5 flex-1">
                      {/* What You See & Physical State */}
                      <div className="space-y-2 text-xs">
                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-slate-400 font-medium">Breathing:</div>
                          <div className="font-semibold text-slate-100 text-xs mt-0.5">{c.telemetry.resp}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{c.telemetry.airway}</div>
                        </div>

                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-slate-400 font-medium">Bleeding & Body Check:</div>
                          <div className="font-semibold text-slate-100 text-xs mt-0.5">{c.telemetry.circ}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{c.telemetry.visual}</div>
                        </div>

                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-slate-400 font-medium">Alertness / Can they answer?</div>
                          <div className={`font-semibold text-xs mt-0.5 ${
                            c.telemetry.vitals.avpu.includes('Not responding') || c.telemetry.vitals.avpu.includes('pain')
                              ? 'text-rose-400' 
                              : c.telemetry.vitals.avpu.includes('awake') 
                              ? 'text-emerald-400' 
                              : 'text-amber-400'
                          }`}>
                            {c.telemetry.vitals.avpu} ({c.telemetry.neuro})
                          </div>
                        </div>

                        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
                          <div className="text-[10px] text-slate-400 font-medium">What you hear:</div>
                          <div className="font-medium text-slate-200 text-xs mt-0.5 italic">"{c.telemetry.audio}"</div>
                        </div>
                      </div>

                      {/* Tag Buttons with Plain Language Help */}
                      <div className="pt-1 space-y-1.5">
                        <div className="text-[11px] text-slate-300 text-center font-semibold">
                          Choose Priority Color:
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['RED', 'YEL', 'GRN', 'BLK'] as TriageTag[]).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagCasualty(c.id, tag)}
                              className={`py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                userTags[c.id] === tag
                                  ? tag === 'RED' ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                                    : tag === 'YEL' ? 'bg-amber-500 border-amber-400 text-black font-extrabold shadow-lg'
                                    : tag === 'GRN' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                                    : 'bg-slate-800 border-slate-700 text-white'
                                  : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-400 text-center">
                          {userTags[c.id] === 'RED' && '🔴 Urgent emergency (Cannot wait)'}
                          {userTags[c.id] === 'YEL' && '🟡 Serious injury (Can wait a little)'}
                          {userTags[c.id] === 'GRN' && '🟢 Minor cut (Walking wounded)'}
                          {userTags[c.id] === 'BLK' && '⚫ No heartbeat or breathing'}
                          {!userTags[c.id] && 'Tap RED, YEL, GRN, or BLK'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Selection & Simple Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                {/* Immediate Action */}
                <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">What is the #1 first-aid action to do right now?</h4>
                      <p className="text-xs text-slate-400">Choose the single most important action before ambulance arrives</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedScenario.interventions.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIntervention(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          selectedIntervention === idx 
                            ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300' 
                            : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-medium leading-snug">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selectedIntervention === idx ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/20'
                        }`}>
                          {selectedIntervention === idx && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Why did you make these choices?</h4>
                        <p className="text-xs text-slate-400">Explain in simple everyday words (1-2 sentences)</p>
                      </div>
                    </div>

                    <textarea
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Example: Person A was bleeding fast so I helped them first. Person B was screaming, which means they could breathe fine..."
                      className="w-full h-24 bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    onClick={handleLockSubmission}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-[0.99]"
                  >
                    <Lock className="w-4 h-4" /> 
                    <span>Submit & Finish My Drill</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. RESULTS & SCORES */}
          {phase === 'RESULT' && selectedScenario && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto py-4 space-y-5"
            >
              <div className="bg-[#0a0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Result Header */}
                <div className="bg-gradient-to-b from-emerald-500/15 via-[#0a0f1a] to-[#0a0f1a] border-b border-emerald-500/20 p-6 sm:p-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-1">
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Drill Completed!
                    </h2>
                    <p className="text-sm text-slate-300">
                      Great job, <strong className="text-white">{student?.name}</strong> (Badge: #{student?.badgeNumber})!
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-8 sm:gap-14 pt-3">
                    <div className="text-center">
                      <div className="text-5xl font-black text-white tabular-nums">{score}</div>
                      <div className="text-xs text-emerald-400 font-semibold mt-1">Total Score (out of 100)</div>
                    </div>
                    <div className="h-14 w-px bg-white/10" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-300 tabular-nums">{90 - timeLeft}s</div>
                      <div className="text-xs text-slate-400 mt-1">Time Taken (under 90s)</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 space-y-7">
                  {/* Score Breakdown in Plain English */}
                  <div className="space-y-3">
                    <h3 className="text-xs text-slate-400 uppercase tracking-wider text-center font-bold">
                      How Your Score Was Calculated
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { label: 'Correct Colors', val: scoreBreakdown.precision, max: 35 },
                        { label: 'Ignored Screaming', val: scoreBreakdown.distressBias, max: 25 },
                        { label: 'Best First-Aid', val: scoreBreakdown.intervention, max: 20 },
                        { label: 'Good Speed', val: scoreBreakdown.time, max: 10 },
                        { label: 'Clear Explanation', val: scoreBreakdown.justification, max: 10 }
                      ].map((item) => (
                        <div key={item.label} className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                          <div className="text-base font-bold text-white">
                            {item.val}<span className="text-xs text-slate-500">/{item.max}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Answers Review */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                        Answers Review (Who was right?)
                      </h3>
                      <span className="text-xs text-slate-400">
                        {selectedScenario.facilitySector}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedScenario.casualties.map((c) => {
                        const tag = userTags[c.id];
                        const isCorrect = tag === c.correctTag;
                        return (
                          <div key={c.id} className="flex gap-3 items-start bg-black/40 p-3.5 rounded-xl border border-white/5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {c.id}
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{c.name}</span>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-slate-400">You chose:</span>
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }`}>
                                    {tag || 'None'}
                                  </span>
                                  <span className="text-slate-500">• Correct:</span>
                                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                                    {c.correctTag}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-300">
                                {c.justification}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={resetSimulation}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 transition-all rounded-xl font-bold text-white text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCcw className="w-4 h-4" /> Practice Another Drill
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 transition-all rounded-xl font-bold text-white text-xs border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" /> Save Certificate (PDF)
                    </button>
                    <button
                      onClick={handleSendToWhatsApp}
                      className="flex-1 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition-all rounded-xl font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Share on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simple Footer */}
      <footer className="bg-black/90 border-t border-white/10 px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-400">Airport Offices Safety Drill</span>
          <span className="text-slate-600">|</span>
          <span>Everyday Situations for Staff & Students</span>
        </div>
        <div className="text-slate-500">
          Student ID: {student?.badgeNumber || 'Guest'}
        </div>
      </footer>
    </div>
  );
}
