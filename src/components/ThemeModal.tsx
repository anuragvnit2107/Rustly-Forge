import React from 'react';
import { Palette, X, Moon, Sun, Check } from 'lucide-react';
import { THEME_PALETTES, ThemePalette, applyThemeToRoot } from '../themes';
import { CanvasPreferences } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: CanvasPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<CanvasPreferences>>;
  setDefaultStrokeColor: (color: string) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  preferences,
  setPreferences,
  setDefaultStrokeColor,
}) => {
  if (!isOpen) return null;

  const currentTheme = THEME_PALETTES.find(
    (t) => t.canvasBackground.toLowerCase() === preferences.canvasBackground.toLowerCase()
  ) || THEME_PALETTES[0];

  const handleSelectTheme = (theme: ThemePalette) => {
    setPreferences((prev) => ({
      ...prev,
      theme: theme.category,
      canvasBackground: theme.canvasBackground,
    }));
    setDefaultStrokeColor(theme.strokeColor);
    applyThemeToRoot(theme);
  };

  const darkPalettes = THEME_PALETTES.filter((t) => t.category === 'dark');
  const lightPalettes = THEME_PALETTES.filter((t) => t.category === 'light');

  return (
    <div
      id="theme-palettes-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#18181f]/95 border border-[#2e2d3d] rounded-2xl shadow-2xl p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2d2c3c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6965db]/20 border border-[#6965db]/40 flex items-center justify-center text-[#a5a4f7]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Theme & Color Palettes
              </h2>
              <p className="text-xs text-[#9d9cb3]">
                Choose from 10+ custom themes for canvas, toolbars, and background grid
              </p>
            </div>
          </div>
          <button
            id="btn-close-theme-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8d9e] hover:text-white hover:bg-[#282736] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-6">
          {/* Dark Palettes Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider">
              <Moon className="w-3.5 h-3.5 text-[#818cf8]" />
              <span>Dark Palettes ({darkPalettes.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {darkPalettes.map((theme) => {
                const isActive = currentTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    onClick={() => handleSelectTheme(theme)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-[#232332] border-[#6965db] ring-1 ring-[#6965db] shadow-md shadow-[#6965db]/10'
                        : 'bg-[#1e1e27] border-[#2c2b3a] hover:bg-[#252533] hover:border-[#3d3c4f]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {/* Swatch circle with inner accent dot */}
                      <div
                        className="relative w-8 h-8 rounded-full border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: theme.canvasBackground }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.previewDotColor }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {theme.name}
                        </div>
                        <div className="text-[11px] text-[#9392a8] truncate">
                          {theme.description}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#818cf8] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light Palettes Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#8e8d9e] uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light Palettes ({lightPalettes.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lightPalettes.map((theme) => {
                const isActive = currentTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    onClick={() => handleSelectTheme(theme)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-[#232332] border-[#6965db] ring-1 ring-[#6965db] shadow-md shadow-[#6965db]/10'
                        : 'bg-[#1e1e27] border-[#2c2b3a] hover:bg-[#252533] hover:border-[#3d3c4f]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {/* Swatch circle with inner accent dot */}
                      <div
                        className="relative w-8 h-8 rounded-full border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: theme.canvasBackground }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.previewDotColor }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {theme.name}
                        </div>
                        <div className="text-[11px] text-[#9392a8] truncate">
                          {theme.description}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#818cf8] shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2d2c3c] flex items-center justify-between">
          <span className="text-xs text-[#8a899c]">
            Themes instantly adapt canvas, grid, menus, and drawing defaults
          </span>
          <button
            id="btn-theme-modal-done"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#5955db] hover:bg-[#6965db] text-white text-xs font-semibold shadow-lg shadow-[#6965db]/25 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
