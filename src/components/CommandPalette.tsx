import React, { useState, useEffect } from 'react';
import {
  Search,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Download,
  Trash2,
  Moon,
  Sun,
  Code2,
} from 'lucide-react';
import { ElementType } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ElementType) => void;
  onExport: () => void;
  onReset: () => void;
  onOpenRustViewer: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onExport,
  onReset,
  onOpenRustViewer,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'rect', label: 'Draw Rectangle', shortcut: '2', icon: <Square className="w-4 h-4" />, action: () => onSelectTool('rectangle') },
    { id: 'diamond', label: 'Draw Diamond', shortcut: '3', icon: <Diamond className="w-4 h-4" />, action: () => onSelectTool('diamond') },
    { id: 'ellipse', label: 'Draw Ellipse', shortcut: '4', icon: <Circle className="w-4 h-4" />, action: () => onSelectTool('ellipse') },
    { id: 'arrow', label: 'Draw Arrow', shortcut: '5', icon: <ArrowRight className="w-4 h-4" />, action: () => onSelectTool('arrow') },
    { id: 'line', label: 'Draw Line', shortcut: '6', icon: <Minus className="w-4 h-4" />, action: () => onSelectTool('line') },
    { id: 'pencil', label: 'Pencil / Draw', shortcut: '7', icon: <Pencil className="w-4 h-4" />, action: () => onSelectTool('freedraw') },
    { id: 'text', label: 'Insert Text', shortcut: '8', icon: <Type className="w-4 h-4" />, action: () => onSelectTool('text') },
    { id: 'rust', label: 'View Rust WASM Architecture & Source Code', shortcut: '', icon: <Code2 className="w-4 h-4 text-[#6965db]" />, action: onOpenRustViewer },
    { id: 'export', label: 'Export Image (PNG / SVG / JSON)', shortcut: 'Ctrl+Shift+E', icon: <Download className="w-4 h-4" />, action: onExport },
    { id: 'theme', label: 'Toggle Light / Dark Theme', shortcut: '', icon: <Moon className="w-4 h-4" />, action: onToggleTheme },
    { id: 'reset', label: 'Reset Canvas', shortcut: '', icon: <Trash2 className="w-4 h-4 text-red-400" />, action: onReset },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4 select-none">
      <div
        id="command-palette-modal"
        className="w-full max-w-xl bg-[#232329] border border-[#363544] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-3.5 border-b border-[#31303b] flex items-center gap-3 bg-[#1e1e24]">
          <Search className="w-5 h-5 text-[#8e8d9e]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#787788] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#2b2b33] text-[10px] font-mono text-[#8e8d9e] border border-[#3e3d4c]">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8e8d9e]">No matching commands found</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl text-left text-sm text-[#d4d4df] hover:bg-[#2e2e38] hover:text-white flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#2b2b33] group-hover:bg-[#383745] transition">
                    {cmd.icon}
                  </div>
                  <span>{cmd.label}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className="text-[10px] font-mono text-[#787788] bg-[#1a1a20] px-1.5 py-0.5 rounded border border-[#2f2e3a]">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
