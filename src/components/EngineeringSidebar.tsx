import React, { useState } from 'react';
import {
  X,
  Search,
  Zap,
  Cpu,
  Layers,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { EngineeringComponentType } from '../types';
import {
  ENGINEERING_COMPONENTS,
  EngineeringComponentDef,
} from '../engineeringComponents';

interface EngineeringSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (type: EngineeringComponentType) => void;
}

export const EngineeringSidebar: React.FC<EngineeringSidebarProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Passives', 'Sources', 'Semiconductors', 'Logic Gates', 'ICs'];

  const filteredComponents = ENGINEERING_COMPONENTS.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.defaultLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderMiniPreview = (type: EngineeringComponentType) => {
    switch (type) {
      case 'resistor':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M5 15 H15 L18 8 L24 22 L30 8 L36 22 L42 8 L45 15 H55" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'capacitor':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M5 15 H25 M35 15 H55 M25 5 V25 M35 5 V25" strokeLinecap="round" />
          </svg>
        );
      case 'inductor':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M5 18 H12 C12 8 20 8 20 18 C20 8 28 8 28 18 C28 8 36 8 36 18 C36 8 44 8 44 18 C44 8 52 8 52 18 H58" strokeLinecap="round" />
          </svg>
        );
      case 'diode':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M5 15 H20 M36 15 H55 M20 7 V23 L36 15 Z M36 7 V23" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'ground':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M30 4 V14 M18 14 H42 M22 19 H38 M26 24 H34" strokeLinecap="round" />
          </svg>
        );
      case 'dc_source':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M30 3 V10 M30 20 V27 M16 10 H44 M22 20 H38" strokeLinecap="round" />
            <text x="46" y="11" fill="currentColor" fontSize="8" fontFamily="sans-serif">+</text>
            <text x="41" y="21" fill="currentColor" fontSize="8" fontFamily="sans-serif">−</text>
          </svg>
        );
      case 'ac_source':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <circle cx="30" cy="15" r="10" />
            <path d="M30 3 V5 M30 25 V27 M25 15 Q27.5 11 30 15 T35 15" strokeLinecap="round" />
          </svg>
        );
      case 'and_gate':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M6 10 H18 M6 20 H18 M46 15 H56 M18 5 V25 H32 A10 10 0 0 0 32 5 Z" strokeLinecap="round" />
          </svg>
        );
      case 'or_gate':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M6 10 H18 M6 20 H18 M46 15 H56 M16 5 Q24 15 16 25 Q36 25 46 15 Q36 5 16 5" strokeLinecap="round" />
          </svg>
        );
      case 'not_gate':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M6 15 H18 M42 15 H56 M18 7 V23 L36 15 Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="39" cy="15" r="3" />
          </svg>
        );
      case 'nand_gate':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M6 10 H16 M6 20 H16 M48 15 H56 M16 5 V25 H30 A10 10 0 0 0 30 5 Z" strokeLinecap="round" />
            <circle cx="43" cy="15" r="3" />
          </svg>
        );
      case 'xor_gate':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M5 10 H15 M5 20 H15 M46 15 H56 M13 5 Q20 15 13 25 M18 5 Q25 15 18 25 Q36 25 46 15 Q36 5 18 5" strokeLinecap="round" />
          </svg>
        );
      case 'op_amp':
        return (
          <svg className="w-16 h-8 stroke-current" viewBox="0 0 60 30" fill="none" strokeWidth="2">
            <path d="M6 10 H16 M6 20 H16 M46 15 H56 M16 5 V25 L46 15 Z" strokeLinecap="round" strokeLinejoin="round" />
            <text x="18" y="12" fill="currentColor" fontSize="8" fontFamily="sans-serif">−</text>
            <text x="18" y="22" fill="currentColor" fontSize="8" fontFamily="sans-serif">+</text>
          </svg>
        );
    }
  };

  return (
    <div className="absolute top-16 right-4 z-40 w-84 max-h-[85vh] flex flex-col bg-[#1e1e24] border border-[#31303b] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2c38] bg-[#23232a]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#6965db]/20 text-[#a5a4f7]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Engineering Library</h3>
            <p className="text-[11px] text-[#8e8d9d]">Schematic Components & Logic Gates</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#8e8d9d] hover:text-white hover:bg-[#2e2e38] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#2d2c38]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767584]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resistors, gates, op-amps..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#16161a] text-[#e0e0e0] border border-[#31303b] rounded-lg focus:outline-none focus:border-[#6965db]"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#6965db] text-white'
                  : 'text-[#8e8d9d] bg-[#23232a] hover:bg-[#2c2b36] hover:text-[#d0cfe0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#767584]">
            No components match your search.
          </div>
        ) : (
          filteredComponents.map((comp) => (
            <div
              key={comp.type}
              onClick={() => onSelectComponent(comp.type)}
              className="group p-2.5 rounded-xl bg-[#25252d] hover:bg-[#2d2c38] border border-[#333240] hover:border-[#6965db]/50 cursor-pointer transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg bg-[#1a1a20] border border-[#363544] flex items-center justify-center text-[#a5a4f7] group-hover:text-white group-hover:scale-105 transition">
                  {renderMiniPreview(comp.type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white group-hover:text-[#a5a4f7] transition">
                      {comp.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181e] text-[#8e8d9d] font-mono">
                      {comp.defaultLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8e8d9d] line-clamp-1 mt-0.5">
                    {comp.description}
                  </p>
                </div>
              </div>

              <button
                className="p-1.5 rounded-lg bg-[#31303e] text-[#b3b2c2] group-hover:bg-[#6965db] group-hover:text-white transition"
                title="Place onto canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Educational Notice */}
      <div className="p-3 bg-[#18181e] border-t border-[#2d2c38] flex items-center justify-between text-[11px] text-[#8e8d9d]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Auto-Snapping Nodes Active</span>
        </div>
        <span className="text-[10px] font-mono text-[#6965db]">Click to Stamp</span>
      </div>
    </div>
  );
};
