import React from 'react';
import {
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from 'lucide-react';
import { ExcalidrawElement, FillStyle, FontFamily, StrokeStyle } from '../types';

interface PropertiesPanelProps {
  selectedElements: ExcalidrawElement[];
  onUpdateSelected: (updates: Partial<ExcalidrawElement>) => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  defaultStrokeColor: string;
  setDefaultStrokeColor: (color: string) => void;
  defaultBackgroundColor: string;
  setDefaultBackgroundColor: (color: string) => void;
  defaultFillStyle: FillStyle;
  setDefaultFillStyle: (style: FillStyle) => void;
  defaultStrokeWidth: number;
  setDefaultStrokeWidth: (w: number) => void;
  defaultStrokeStyle: StrokeStyle;
  setDefaultStrokeStyle: (s: StrokeStyle) => void;
  defaultRoughness: number;
  setDefaultRoughness: (r: number) => void;
  defaultOpacity: number;
  setDefaultOpacity: (op: number) => void;
  defaultFontFamily: FontFamily;
  setDefaultFontFamily: (f: FontFamily) => void;
  defaultFontSize: number;
  setDefaultFontSize: (size: number) => void;
  defaultTextAlign: 'left' | 'center' | 'right';
  setDefaultTextAlign: (align: 'left' | 'center' | 'right') => void;
}

const STROKE_COLORS = [
  '#e0e0e0', // White/Light
  '#e03131', // Red
  '#2f9e44', // Green
  '#1971c2', // Blue
  '#f08c00', // Orange
  '#9c36b5', // Purple
  '#f06595', // Pink
];

const BG_COLORS = [
  'transparent',
  '#491b1d', // Dark red
  '#1b4928', // Dark green
  '#1b2f49', // Dark blue
  '#493a1b', // Dark amber
  '#2a2a2a', // Dark gray
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onUpdateSelected,
  onDuplicateSelected,
  onDeleteSelected,
  onBringToFront,
  onSendToBack,
  defaultStrokeColor,
  setDefaultStrokeColor,
  defaultBackgroundColor,
  setDefaultBackgroundColor,
  defaultFillStyle,
  setDefaultFillStyle,
  defaultStrokeWidth,
  setDefaultStrokeWidth,
  defaultStrokeStyle,
  setDefaultStrokeStyle,
  defaultRoughness,
  setDefaultRoughness,
  defaultOpacity,
  setDefaultOpacity,
  defaultFontFamily,
  setDefaultFontFamily,
  defaultFontSize,
  setDefaultFontSize,
  defaultTextAlign,
  setDefaultTextAlign,
}) => {
  const hasSelection = selectedElements.length > 0;
  const firstElem = selectedElements[0];
  const hasText = hasSelection && selectedElements.some((e) => e.type === 'text');

  // Values are either from selected element or default
  const curStrokeColor = hasSelection ? firstElem.strokeColor : defaultStrokeColor;
  const curBgColor = hasSelection ? firstElem.backgroundColor : defaultBackgroundColor;
  const curFillStyle = hasSelection ? firstElem.fillStyle : defaultFillStyle;
  const curStrokeWidth = hasSelection ? firstElem.strokeWidth : defaultStrokeWidth;
  const curStrokeStyle = hasSelection ? firstElem.strokeStyle : defaultStrokeStyle;
  const curRoughness = hasSelection ? firstElem.roughness : defaultRoughness;
  const curOpacity = hasSelection ? Math.round(firstElem.opacity * 100) : Math.round(defaultOpacity * 100);
  const curFontFamily = hasSelection && firstElem.fontFamily ? firstElem.fontFamily : defaultFontFamily;
  const curFontSize = hasSelection && firstElem.fontSize ? firstElem.fontSize : defaultFontSize;
  const curTextAlign = hasSelection && firstElem.textAlign ? firstElem.textAlign : defaultTextAlign;

  const handleStrokeColor = (color: string) => {
    setDefaultStrokeColor(color);
    if (hasSelection) onUpdateSelected({ strokeColor: color });
  };

  const handleBgColor = (color: string) => {
    setDefaultBackgroundColor(color);
    if (hasSelection) onUpdateSelected({ backgroundColor: color });
  };

  const handleFillStyle = (style: FillStyle) => {
    setDefaultFillStyle(style);
    if (hasSelection) onUpdateSelected({ fillStyle: style });
  };

  const handleStrokeWidth = (w: number) => {
    setDefaultStrokeWidth(w);
    if (hasSelection) onUpdateSelected({ strokeWidth: w });
  };

  const handleStrokeStyle = (s: StrokeStyle) => {
    setDefaultStrokeStyle(s);
    if (hasSelection) onUpdateSelected({ strokeStyle: s });
  };

  const handleRoughness = (r: number) => {
    setDefaultRoughness(r);
    if (hasSelection) onUpdateSelected({ roughness: r });
  };

  const handleOpacity = (opPercent: number) => {
    const op = opPercent / 100;
    setDefaultOpacity(op);
    if (hasSelection) onUpdateSelected({ opacity: op });
  };

  const handleFontFamily = (font: FontFamily) => {
    setDefaultFontFamily(font);
    if (hasSelection) onUpdateSelected({ fontFamily: font });
  };

  const handleFontSize = (size: number) => {
    setDefaultFontSize(size);
    if (hasSelection) onUpdateSelected({ fontSize: size });
  };

  const handleTextAlign = (align: 'left' | 'center' | 'right') => {
    setDefaultTextAlign(align);
    if (hasSelection) onUpdateSelected({ textAlign: align });
  };

  const isSelectedTriangle =
    hasSelection &&
    (firstElem.type === 'triangle' ||
      firstElem.type === 'triangle_right' ||
      firstElem.type === 'triangle_isosceles');

  const isSelectedPolygon = hasSelection && firstElem.type === 'polygon';

  return (
    <aside
      id="properties-panel"
      className="absolute top-16 left-4 z-20 w-60 p-3.5 liquid-glass-panel shadow-2xl flex flex-col gap-3.5 max-h-[calc(100vh-5.5rem)] overflow-y-auto"
    >
      {/* Triangle Variant Configurator */}
      {isSelectedTriangle && (
        <div id="section-triangle-type" className="pb-1 border-b border-white/15">
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block mb-1.5">
            Triangle Geometry
          </span>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onUpdateSelected({ type: 'triangle' })}
              className={`px-1.5 py-1 rounded-lg text-[11px] font-medium transition ${
                firstElem.type === 'triangle'
                  ? 'liquid-glass-button-active'
                  : 'liquid-glass-button text-[#d0cfe0]'
              }`}
            >
              Equilateral
            </button>
            <button
              onClick={() => onUpdateSelected({ type: 'triangle_right' })}
              className={`px-1.5 py-1 rounded-lg text-[11px] font-medium transition ${
                firstElem.type === 'triangle_right'
                  ? 'liquid-glass-button-active'
                  : 'liquid-glass-button text-[#d0cfe0]'
              }`}
            >
              Right ⊿
            </button>
            <button
              onClick={() => onUpdateSelected({ type: 'triangle_isosceles' })}
              className={`px-1.5 py-1 rounded-lg text-[11px] font-medium transition ${
                firstElem.type === 'triangle_isosceles'
                  ? 'liquid-glass-button-active'
                  : 'liquid-glass-button text-[#d0cfe0]'
              }`}
            >
              Isosceles
            </button>
          </div>
        </div>
      )}

      {/* Polygon Sides Configurator */}
      {isSelectedPolygon && (
        <div id="section-polygon-sides" className="pb-1 border-b border-white/15">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              Polygon Sides
            </span>
            <span className="text-[11px] font-mono text-purple-200">
              {firstElem.polygonSides || 6} sides
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[3, 5, 6, 8, 10, 12].map((sides) => (
              <button
                key={sides}
                onClick={() => onUpdateSelected({ polygonSides: sides })}
                className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-medium transition ${
                  (firstElem.polygonSides || 6) === sides
                    ? 'liquid-glass-button-active'
                    : 'liquid-glass-button text-[#d0cfe0]'
                }`}
              >
                {sides}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Color */}
      <div id="section-stroke">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider">
            Stroke
          </span>
          <span className="text-[10px] font-mono text-[#6c6b7e]">{curStrokeColor}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleStrokeColor(c)}
              className={`w-6 h-6 rounded-md transition transform hover:scale-110 flex items-center justify-center border ${
                curStrokeColor.toLowerCase() === c.toLowerCase()
                  ? 'border-white ring-2 ring-[#6965db]'
                  : 'border-white/15'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <label className="relative w-6 h-6 rounded-md bg-[#2b2b33] border border-white/20 flex items-center justify-center cursor-pointer hover:border-white transition overflow-hidden">
            <input
              type="color"
              value={curStrokeColor.startsWith('#') ? curStrokeColor : '#ffffff'}
              onChange={(e) => handleStrokeColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-[10px] text-white/70 font-mono">+</span>
          </label>
        </div>
      </div>

      {/* Background Color */}
      <div id="section-background">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider">
            Background
          </span>
          <span className="text-[10px] font-mono text-[#6c6b7e]">
            {curBgColor === 'transparent' ? 'none' : curBgColor}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {BG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => handleBgColor(c)}
              className={`w-6 h-6 rounded-md transition transform hover:scale-110 flex items-center justify-center border ${
                curBgColor.toLowerCase() === c.toLowerCase()
                  ? 'border-white ring-2 ring-[#6965db]'
                  : 'border-white/15'
              } ${c === 'transparent' ? 'bg-[#1b1b20]' : ''}`}
              style={{ backgroundColor: c !== 'transparent' ? c : undefined }}
              title={c === 'transparent' ? 'Transparent' : c}
            >
              {c === 'transparent' && (
                <div className="w-full h-full border-t border-red-500/80 transform rotate-45" />
              )}
            </button>
          ))}
          <label className="relative w-6 h-6 rounded-md bg-[#2b2b33] border border-white/20 flex items-center justify-center cursor-pointer hover:border-white transition overflow-hidden">
            <input
              type="color"
              value={curBgColor !== 'transparent' ? curBgColor : '#1b2f49'}
              onChange={(e) => handleBgColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-[10px] text-white/70 font-mono">+</span>
          </label>
        </div>
      </div>

      {/* Fill Style */}
      {curBgColor !== 'transparent' && (
        <div id="section-fill-style">
          <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider block mb-1.5">
            Fill
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
            {(['solid', 'hachure', 'cross-hatch'] as FillStyle[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFillStyle(f)}
                className={`py-1 text-[11px] font-medium rounded transition capitalize ${
                  curFillStyle === f
                    ? 'bg-[#4a47b1] text-white shadow-sm'
                    : 'text-[#8e8d9e] hover:text-white'
                }`}
              >
                {f === 'cross-hatch' ? 'Cross' : f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width */}
      <div id="section-stroke-width">
        <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider block mb-1.5">
          Stroke width
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
          {[
            { w: 1, label: 'Thin', h: 'h-[1.5px]' },
            { w: 2, label: 'Medium', h: 'h-[3px]' },
            { w: 4, label: 'Bold', h: 'h-[5px]' },
          ].map((item) => (
            <button
              key={item.w}
              onClick={() => handleStrokeWidth(item.w)}
              className={`py-1.5 flex items-center justify-center rounded transition ${
                curStrokeWidth === item.w
                  ? 'bg-[#4a47b1] text-white'
                  : 'text-[#8e8d9e] hover:bg-[#282830] hover:text-white'
              }`}
              title={`${item.label} (${item.w}px)`}
            >
              <div className={`w-6 bg-current rounded-full ${item.h}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Sloppiness / Roughness (Screenshot 1: Architect, Artist, Cartoonist) */}
      <div id="section-roughness">
        <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider block mb-1.5">
          Sloppiness
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
          {[
            { r: 0, title: 'Architect', path: 'M2 8 L22 8' },
            { r: 1, title: 'Artist', path: 'M2 8 Q8 4, 12 8 T22 8' },
            { r: 2.5, title: 'Cartoonist', path: 'M2 7 Q6 2, 10 9 T16 4 T22 9' },
          ].map((item) => (
            <button
              key={item.r}
              onClick={() => handleRoughness(item.r)}
              className={`py-1.5 flex items-center justify-center rounded transition ${
                curRoughness === item.r
                  ? 'bg-[#4a47b1] text-white'
                  : 'text-[#8e8d9e] hover:bg-[#282830] hover:text-white'
              }`}
              title={`${item.title} (roughness ${item.r})`}
            >
              <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                <path
                  d={item.path}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style */}
      <div id="section-stroke-style">
        <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider block mb-1.5">
          Stroke style
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
          {[
            { s: 'solid' as StrokeStyle, label: 'Solid', border: 'border-t-2 border-solid' },
            { s: 'dashed' as StrokeStyle, label: 'Dashed', border: 'border-t-2 border-dashed' },
            { s: 'dotted' as StrokeStyle, label: 'Dotted', border: 'border-t-2 border-dotted' },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => handleStrokeStyle(item.s)}
              className={`py-2 flex items-center justify-center rounded transition ${
                curStrokeStyle === item.s
                  ? 'bg-[#4a47b1] text-white'
                  : 'text-[#8e8d9e] hover:bg-[#282830] hover:text-white'
              }`}
              title={item.label}
            >
              <div className={`w-6 border-current ${item.border}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Font Family & Typography */}
      {(hasText || !hasSelection) && (
        <div id="section-font-family" className="pt-1 border-t border-[#31303b]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider">
              Font Family
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
            {[
              { id: 'excalifont' as FontFamily, label: 'Scribble', fontClass: 'font-excalifont text-xs' },
              { id: 'comic-shanns' as FontFamily, label: 'Casual', fontClass: 'font-comic-shanns text-[11px]' },
              { id: 'lilita-one' as FontFamily, label: 'Heavy', fontClass: 'font-lilita-one text-[11px]' },
              { id: 'nunito' as FontFamily, label: 'CleanSans', fontClass: 'font-nunito text-xs' },
            ].map((font) => (
              <button
                key={font.id}
                onClick={() => handleFontFamily(font.id)}
                className={`py-1.5 px-2 text-center rounded transition truncate ${font.fontClass} ${
                  curFontFamily === font.id
                    ? 'bg-[#4a47b1] text-white font-bold'
                    : 'text-[#9c9ba8] hover:text-white hover:bg-[#282830]'
                }`}
                title={font.label}
              >
                {font.label}
              </button>
            ))}
          </div>

          {/* Font Size & Align */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 flex items-center gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
              {[
                { s: 16, label: 'S' },
                { s: 22, label: 'M' },
                { s: 32, label: 'L' },
                { s: 44, label: 'XL' },
              ].map((size) => (
                <button
                  key={size.s}
                  onClick={() => handleFontSize(size.s)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded transition ${
                    curFontSize === size.s
                      ? 'bg-[#4a47b1] text-white'
                      : 'text-[#8e8d9e] hover:text-white'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
              {[
                { a: 'left' as const, icon: <AlignLeft className="w-3.5 h-3.5" /> },
                { a: 'center' as const, icon: <AlignCenter className="w-3.5 h-3.5" /> },
                { a: 'right' as const, icon: <AlignRight className="w-3.5 h-3.5" /> },
              ].map((align) => (
                <button
                  key={align.a}
                  onClick={() => handleTextAlign(align.a)}
                  className={`p-1 rounded transition ${
                    curTextAlign === align.a
                      ? 'bg-[#4a47b1] text-white'
                      : 'text-[#8e8d9e] hover:text-white'
                  }`}
                >
                  {align.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Opacity Slider */}
      <div id="section-opacity">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider">
            Opacity
          </span>
          <span className="text-[11px] font-mono text-[#b3b3c3]">{curOpacity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={curOpacity}
          onChange={(e) => handleOpacity(Number(e.target.value))}
          className="w-full accent-[#6965db] h-1.5 bg-[#2f2e3a] rounded-lg cursor-pointer"
        />
      </div>

      {/* Selection Operations */}
      {hasSelection && (
        <div id="section-actions" className="pt-2 border-t border-[#31303b] flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-[#a5a5b5] uppercase tracking-wider">
            Actions ({selectedElements.length})
          </span>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={onDuplicateSelected}
              className="p-2 rounded-lg bg-[#2b2b33] hover:bg-[#34343d] text-[#b3b3c3] hover:text-white transition flex items-center justify-center border border-[#3c3b47]"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onBringToFront}
              className="p-2 rounded-lg bg-[#2b2b33] hover:bg-[#34343d] text-[#b3b3c3] hover:text-white transition flex items-center justify-center border border-[#3c3b47]"
              title="Bring to Front"
            >
              <BringToFront className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSendToBack}
              className="p-2 rounded-lg bg-[#2b2b33] hover:bg-[#34343d] text-[#b3b3c3] hover:text-white transition flex items-center justify-center border border-[#3c3b47]"
              title="Send to Back"
            >
              <SendToBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDeleteSelected}
              className="p-2 rounded-lg bg-[#441a1c] hover:bg-[#592326] text-red-300 transition flex items-center justify-center border border-red-900/50"
              title="Delete (Del / Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
