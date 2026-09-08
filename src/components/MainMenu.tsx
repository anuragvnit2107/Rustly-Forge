import React, { useState } from 'react';
import {
  FolderOpen,
  Save,
  Download,
  Users,
  Terminal,
  Search,
  HelpCircle,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
  Code,
  Palette,
} from 'lucide-react';
import { CanvasPreferences } from '../types';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onCollab: () => void;
  onCommandPalette: () => void;
  onHelp: () => void;
  onReset: () => void;
  onOpenRustViewer: () => void;
  onOpenThemeModal?: () => void;
  preferences: CanvasPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<CanvasPreferences>>;
}

const CANVAS_BG_OPTIONS = [
  '#121212',
  '#1e1e1e',
  '#25262b',
  '#18231c',
  '#1b2533',
  '#fdfbf7',
];

export const MainMenu: React.FC<MainMenuProps> = ({
  isOpen,
  onClose,
  onOpen,
  onSave,
  onExport,
  onCollab,
  onCommandPalette,
  onHelp,
  onReset,
  onOpenRustViewer,
  onOpenThemeModal,
  preferences,
  setPreferences,
}) => {
  const [showPreferencesSubmenu, setShowPreferencesSubmenu] = useState(false);

  if (!isOpen) return null;

  const updatePref = <K extends keyof CanvasPreferences>(
    key: K,
    value: CanvasPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Main Drawer Menu (Screenshot 2) */}
      <div
        id="main-menu-drawer"
        className="fixed top-14 left-4 z-40 w-64 bg-[#232329] border border-[#31303b] rounded-2xl shadow-2xl overflow-hidden flex flex-col py-2 select-none"
      >
        {/* App Title & Branding */}
        <div className="px-4 py-2.5 mb-1 border-b border-[#31303b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 shadow-sm" />
            <span className="font-bold text-sm tracking-wide text-white">Rustly Forge</span>
          </div>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#31303b] text-[#a5a4f7]">WASM</span>
        </div>

        {/* Core Actions */}
        <button
          id="menu-item-open"
          onClick={() => {
            onClose();
            onOpen();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-4 h-4 text-[#9c9ba8]" />
            <span>Open</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#767584]">Ctrl+O</kbd>
        </button>

        <button
          id="menu-item-save"
          onClick={() => {
            onClose();
            onSave();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Save className="w-4 h-4 text-[#9c9ba8]" />
            <span>Save to...</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#767584]">Ctrl+S</kbd>
        </button>

        <button
          id="menu-item-export"
          onClick={() => {
            onClose();
            onExport();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-[#9c9ba8]" />
            <span>Export image...</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#767584]">Ctrl+Shift+E</kbd>
        </button>

        <button
          id="menu-item-collab"
          onClick={() => {
            onClose();
            onCollab();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#6965db]" />
            <span className="text-[#a5a4f7]">Live collaboration...</span>
          </div>
        </button>

        <div className="w-full h-[1px] bg-[#31303b] my-1" />

        <button
          id="menu-item-palette"
          onClick={() => {
            onClose();
            onCommandPalette();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#9c9ba8]" />
            <span>Command palette</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#767584]">Ctrl+/</kbd>
        </button>

        <button
          id="menu-item-rust-wasm"
          onClick={() => {
            onClose();
            onOpenRustViewer();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Code className="w-4 h-4 text-[#6965db]" />
            <span>Rust WASM Files</span>
          </div>
          <span className="text-[10px] font-mono text-[#6965db] bg-[#6965db]/20 px-1 rounded">100% Rust</span>
        </button>

        <button
          id="menu-item-help"
          onClick={() => {
            onClose();
            onHelp();
          }}
          className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#9c9ba8]" />
            <span>Help</span>
          </div>
          <kbd className="text-[10px] font-mono text-[#767584]">?</kbd>
        </button>

        <button
          id="menu-item-reset"
          onClick={() => {
            if (confirm('Clear the entire canvas? This cannot be undone.')) {
              onReset();
              onClose();
            }
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#3d1a1d] flex items-center gap-2.5 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset the canvas</span>
        </button>

        <div className="w-full h-[1px] bg-[#31303b] my-1" />

        {/* Preferences Expandable Link (Screenshot 2 & 3) */}
        <div className="relative">
          <button
            id="menu-item-preferences"
            onClick={() => setShowPreferencesSubmenu(!showPreferencesSubmenu)}
            className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
          >
            <span className="text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider">
              Preferences
            </span>
            <ChevronRight
              className={`w-4 h-4 text-[#8e8d9e] transition transform ${
                showPreferencesSubmenu ? 'rotate-90' : ''
              }`}
            />
          </button>

          {/* Preferences Submenu (Screenshot 3) */}
          {showPreferencesSubmenu && (
            <div
              id="preferences-flyout"
              className="px-3 py-2 bg-[#1b1b20] border-y border-[#2f2e3a] flex flex-col gap-2.5 text-xs text-[#cfcfe0]"
            >
              {/* Select on: Wrap / Overlap */}
              <div className="flex items-center justify-between">
                <span>Select on</span>
                <div className="flex items-center bg-[#282832] rounded-lg p-0.5 border border-[#393946]">
                  <button
                    onClick={() => updatePref('selectMode', 'wrap')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      preferences.selectMode === 'wrap'
                        ? 'bg-[#6965db] text-white'
                        : 'text-[#9c9ba8]'
                    }`}
                  >
                    Wrap
                  </button>
                  <button
                    onClick={() => updatePref('selectMode', 'overlap')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      preferences.selectMode === 'overlap'
                        ? 'bg-[#6965db] text-white'
                        : 'text-[#9c9ba8]'
                    }`}
                  >
                    Overlap
                  </button>
                </div>
              </div>

              {/* Tool Lock */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Tool lock</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#767584]">Q</span>
                  <input
                    type="checkbox"
                    checked={preferences.toolLock}
                    onChange={(e) => updatePref('toolLock', e.target.checked)}
                    className="accent-[#6965db] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Snap to objects */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Snap to objects</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#767584]">Alt+S</span>
                  <input
                    type="checkbox"
                    checked={preferences.snapToObjects}
                    onChange={(e) => updatePref('snapToObjects', e.target.checked)}
                    className="accent-[#6965db] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Toggle grid */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Toggle grid</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#767584]">Ctrl+'</span>
                  <input
                    type="checkbox"
                    checked={preferences.toggleGrid}
                    onChange={(e) => updatePref('toggleGrid', e.target.checked)}
                    className="accent-[#6965db] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Zen mode */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Zen mode</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#767584]">Alt+Z</span>
                  <input
                    type="checkbox"
                    checked={preferences.zenMode}
                    onChange={(e) => updatePref('zenMode', e.target.checked)}
                    className="accent-[#6965db] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* View mode */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>View mode</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#767584]">Alt+R</span>
                  <input
                    type="checkbox"
                    checked={preferences.viewMode}
                    onChange={(e) => updatePref('viewMode', e.target.checked)}
                    className="accent-[#6965db] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Arrow binding */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Arrow binding</span>
                <input
                  type="checkbox"
                  checked={preferences.arrowBinding}
                  onChange={(e) => updatePref('arrowBinding', e.target.checked)}
                  className="accent-[#6965db] rounded cursor-pointer"
                />
              </label>

              {/* Snap to midpoints */}
              <label className="flex items-center justify-between cursor-pointer">
                <span>Snap to midpoints</span>
                <input
                  type="checkbox"
                  checked={preferences.snapToMidpoints}
                  onChange={(e) => updatePref('snapToMidpoints', e.target.checked)}
                  className="accent-[#6965db] rounded cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Theme Palette Modal Trigger (Feature 2.3) */}
        {onOpenThemeModal && (
          <button
            id="menu-item-theme-palette"
            onClick={() => {
              onClose();
              onOpenThemeModal();
            }}
            className="w-full px-4 py-2 text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-[#a5a4f7]" />
              <span>Canvas Themes</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6965db]/25 text-[#a5a4f7] font-semibold">
              16 Palettes
            </span>
          </button>
        )}

        <div className="w-full h-[1px] bg-[#31303b] my-1" />

        {/* Theme Selector (Screenshot 2: Sun, Moon, Monitor) */}
        <div className="px-4 py-1.5 flex items-center justify-between">
          <span className="text-xs text-[#a5a5b5]">Theme</span>
          <div className="flex items-center bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
            {[
              { id: 'light' as const, icon: <Sun className="w-3.5 h-3.5" />, title: 'Light' },
              { id: 'dark' as const, icon: <Moon className="w-3.5 h-3.5" />, title: 'Dark' },
              { id: 'system' as const, icon: <Monitor className="w-3.5 h-3.5" />, title: 'System' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => updatePref('theme', t.id)}
                className={`p-1 rounded transition ${
                  preferences.theme === t.id
                    ? 'bg-[#4a47b1] text-white'
                    : 'text-[#8e8d9e] hover:text-white'
                }`}
                title={t.title}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas background color swatches (Screenshot 2) */}
        <div className="px-4 py-2">
          <span className="text-[11px] font-semibold text-[#8e8d9e] uppercase tracking-wider block mb-1.5">
            Canvas background
          </span>
          <div className="flex items-center gap-1.5">
            {CANVAS_BG_OPTIONS.map((bg) => (
              <button
                key={bg}
                onClick={() => updatePref('canvasBackground', bg)}
                className={`w-6 h-6 rounded-md border transition ${
                  preferences.canvasBackground === bg
                    ? 'border-white ring-2 ring-[#6965db]'
                    : 'border-white/20'
                }`}
                style={{ backgroundColor: bg }}
                title={bg}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
