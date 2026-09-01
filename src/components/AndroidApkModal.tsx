import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Github, 
  Phone, 
  MessageSquare, 
  Mail, 
  ShieldCheck, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Zap, 
  Radio, 
  Share2,
  Cpu,
  FileCode
} from 'lucide-react';
import { 
  triggerAutonomousCall, 
  triggerAutonomousSms, 
  triggerAutonomousEmail, 
  sharePacketNatively,
  isNativeAndroidApp,
  buildDtmfDialString
} from '../utils/nativePhoneBridge';
import confetti from 'canvas-confetti';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'phone_test' | 'permissions'>('apk');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState('1-877-501-2233');
  const [testIvrSteps, setTestIvrSteps] = useState('Press 1 for English, Press 3 for Expedited SNAP, Press 0 for Intake Worker');
  const [testSmsRecipient, setTestSmsRecipient] = useState('211');
  const [testSmsBody, setTestSmsBody] = useState('EMERGENCY: Requesting expedited SNAP food assistance and emergency pet-friendly shelter intake. - Daisy App');

  if (!isOpen) return null;

  const isNative = isNativeAndroidApp();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestCall = () => {
    const steps = testIvrSteps.split(',').map(s => s.trim()).filter(Boolean);
    const result = triggerAutonomousCall({
      phoneNumber: testPhone,
      ivrSteps: steps
    });
    if (result.success) {
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  const handleTestSms = () => {
    const result = triggerAutonomousSms({
      recipient: testSmsRecipient,
      message: testSmsBody
    });
    if (result.success) {
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  const handleTestShare = () => {
    sharePacketNatively(
      "Daisy's Helping Paws - Benefit Package",
      "Emergency application submitted via Daisy AI Caseworker with zero-income affidavit.",
      window.location.href
    );
  };

  const dtmfPreview = buildDtmfDialString(testPhone, testIvrSteps.split(',').map(s => s.trim()).filter(Boolean));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-white shadow-2xs">
              <Smartphone className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm font-heading">Android APK & Autonomous Telephony</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono font-bold">
                  GitHub CI/CD Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Direct phone calling, DTMF keypad auto-navigation, SMS texting, and APK build workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'apk'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub APK Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('phone_test')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'phone_test'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Autonomous Telephony Console</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'permissions'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Android Manifest & Permissions</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: GITHUB APK BUILDER & INSTALLATION */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Automated GitHub Actions Android APK Pipeline</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Your repository includes a complete GitHub Actions workflow (`.github/workflows/build-apk.yml`) and Capacitor Android configuration. When pushed to GitHub, GitHub automatically compiles a native Android APK (`app-debug.apk`) for immediate download.
                  </p>
                </div>
              </div>

              {/* 3 Step Installation Flow */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
                  How to Build & Install Your APK:
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                        1
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">Push to GitHub</span>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Push the codebase or trigger the "Build Android APK" workflow under GitHub Actions.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                        2
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">Download APK</span>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Download the generated `app-debug.apk` directly from the workflow artifacts or Releases tab.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mb-1.5">
                        3
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">Install on Phone</span>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Tap the downloaded APK on your Android device to install with full autonomous telephony permissions!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Build Commands */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase text-slate-400">Local Build / Android Studio Terminal Command:</span>
                  <button
                    onClick={() => handleCopy('npm run build:apk', 'cmd')}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'cmd' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'cmd' ? 'Copied Command!' : 'Copy Command'}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl overflow-x-auto">
                  npm run build:apk
                </div>
              </div>

              {/* Workflow File Reference */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono text-[11px] text-slate-700">.github/workflows/build-apk.yml</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Configured ✓
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AUTONOMOUS TELEPHONY & SMS CONSOLE */}
          {activeTab === 'phone_test' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Autonomous Telephony & IVR Keypad Auto-Dialer</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Daisy can automatically dial agency hotlines and transmit dual-tone multi-frequency (DTMF) keypad commands with timed pauses (RFC 3601), navigating complex phone menus directly into caseworker queues.
                </p>
              </div>

              {/* Live Test Dialing Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h5 className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Test Autonomous IVR Auto-Dialing:</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Phone Number:</label>
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">IVR Steps (Menu Options):</label>
                    <input
                      type="text"
                      value={testIvrSteps}
                      onChange={(e) => setTestIvrSteps(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] flex justify-between items-center">
                  <span>Generated DTMF URI: <strong className="text-amber-300">{dtmfPreview}</strong></span>
                </div>

                <button
                  onClick={handleTestCall}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Execute Autonomous Call on This Device</span>
                </button>
              </div>

              {/* Live Test SMS Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h5 className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Autonomous SMS Text Dispatch:</span>
                </h5>

                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">SMS Recipient / Hotline:</label>
                    <input
                      type="text"
                      value={testSmsRecipient}
                      onChange={(e) => setTestSmsRecipient(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Pre-Filled SMS Message:</label>
                    <textarea
                      rows={2}
                      value={testSmsBody}
                      onChange={(e) => setTestSmsBody(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleTestSms}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Launch SMS Messenger</span>
                  </button>

                  <button
                    onClick={handleTestShare}
                    className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Native Share Intent</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID MANIFEST & PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-900 text-xs mb-1">Configured Android Telephony Permissions</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The AndroidManifest is configured to grant Daisy permission to interface with your mobile device's communication stack:
                </p>
              </div>

              <div className="space-y-1.5">
                {[
                  { perm: 'android.permission.CALL_PHONE', desc: 'Direct dialing and automated agency hotline IVR navigation' },
                  { perm: 'android.permission.SEND_SMS', desc: 'Autonomous dispatch of 211 text alerts and caseworker messages' },
                  { perm: 'android.permission.ACCESS_FINE_LOCATION', desc: 'Real-time GPS proximity to open shelters, food pantries, and pet clinics' },
                  { perm: 'android.permission.READ_PHONE_STATE', desc: 'Detect call connection state for intake teleprompter synchronization' },
                  { perm: 'android.permission.POST_NOTIFICATIONS', desc: 'Status updates for filed SNAP, voucher, and legal appeal documents' },
                  { perm: 'android.permission.INTERNET', desc: 'Online synchronization and real-time shelter bed counts' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[10px] text-indigo-700 block">{item.perm}</span>
                      <span className="text-[10px] text-slate-600">{item.desc}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                      Granted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Environment: {isNative ? 'Android Native APK Mode' : 'Mobile Web / Intent Bridge Mode'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
