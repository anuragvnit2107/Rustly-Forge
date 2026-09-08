import React, { useState } from 'react';
import { X, Users, Shield, Copy, Check, Radio, Lock, Globe } from 'lucide-react';

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollabModal: React.FC<CollabModalProps> = ({ isOpen, onClose }) => {
  const [roomId] = useState(() => `rustly-${Math.random().toString(36).substring(2, 9)}`);
  const [encryptionKey] = useState(() => `aes256-${Math.random().toString(36).substring(2, 12)}`);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLive, setIsLive] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = `${window.location.origin}#room=${roomId}&key=${encryptionKey}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div
        id="collab-modal"
        className="w-full max-w-lg bg-[#232329] border border-[#31303b] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#d4d4df]"
      >
        <div className="px-6 py-4 border-b border-[#31303b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#6965db]" />
            <h2 className="text-base font-bold text-white">
              Live Collaboration (E2EE)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#2e2e38] text-[#8e8d9e] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="p-3.5 bg-[#1b1b20] rounded-xl border border-[#2f2e3a] flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-white block mb-0.5">
                End-to-End Encrypted (AES-GCM in Rust)
              </span>
              <p className="text-[#8e8d9e] leading-relaxed">
                Drawings and cursor coordinates are encrypted client-side using Rust WebAssembly (aes-gcm crate). The relay server cannot read drawing contents.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider block mb-1.5">
              Room Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-[#1b1b20] border border-[#31303b] rounded-xl px-3 py-2 text-xs font-mono text-white/90 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2e2e38] hover:bg-[#383844] text-white transition flex items-center gap-1.5 border border-[#3f3e4e]"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#1b1b20] rounded-xl border border-[#2f2e3a]">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isLive ? 'text-green-400 animate-pulse' : 'text-[#8e8d9e]'}`} />
              <span className="text-xs font-medium text-white">
                Status: {isLive ? 'Session Active (Ready for peers)' : 'Idle'}
              </span>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isLive
                  ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-800'
                  : 'bg-[#6965db] hover:bg-[#5b57d1] text-white shadow'
              }`}
            >
              {isLive ? 'Stop Session' : 'Start Session'}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#31303b] bg-[#1d1d23] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-white hover:bg-[#2b2b33] transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
