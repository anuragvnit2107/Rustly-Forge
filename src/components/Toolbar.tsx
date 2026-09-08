import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  Triangle,
  Hexagon,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
  Code2,
  Zap,
  Compass,
  Ruler,
  GitCommit,
  Layout,
  Presentation,
  ChevronDown,
} from 'lucide-react';
import { ElementType, CanvasPreferences } from '../types';

interface ToolbarProps {
  activeTool: ElementType;
  setActiveTool: (tool: ElementType) => void;
  toolLock: boolean;
  setToolLock: (locked: boolean | ((prev: boolean) => boolean)) => void;
  preferences: CanvasPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<CanvasPreferences>>;
  onImageUpload: () => void;
  onOpenRustViewer: () => void;
  onOpenCollab: () => void;
  onOpenFontShowcase: () => void;
  onToggleEngineering: () => void;
  isEngineeringOpen: boolean;
  onStartPresentation: () => void;
  frameCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  toolLock,
  setToolLock,
  preferences,
  setPreferences,
  onImageUpload,
  onOpenRustViewer,
  onOpenCollab,
  onOpenFontShowcase,
  onToggleEngineering,
  isEngineeringOpen,
  onStartPresentation,
  frameCount,
}) => {
  const [showTriangleVariants, setShowTriangleVariants] = useState(false);

  const tools: {
    type: ElementType;
    label: string;
    shortcut: string;
    icon: React.ReactNode;
  }[] = [
    { type: 'hand', label: 'Hand (panning tool)', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
    { type: 'selection', label: 'Selection', shortcut: '1', icon: <MousePointer2 className="w-4 h-4" /> },
    { type: 'rectangle', label: 'Rectangle', shortcut: '2', icon: <Square className="w-4 h-4" /> },
    { type: 'diamond', label: 'Diamond', shortcut: '3', icon: <Diamond className="w-4 h-4" /> },
    { type: 'ellipse', label: 'Ellipse', shortcut: '4', icon: <Circle className="w-4 h-4" /> },
    { type: 'triangle', label: 'Triangle (Equilateral/Right/Isosceles)', shortcut: 'T', icon: <Triangle className="w-4 h-4" /> },
    { type: 'polygon', label: 'Regular Polygon (Hexagon/Custom)', shortcut: 'P', icon: <Hexagon className="w-4 h-4" /> },
    { type: 'arrow', label: 'Arrow (Protractor Snapping)', shortcut: '5', icon: <ArrowRight className="w-4 h-4" /> },
    { type: 'line', label: 'Line (Protractor Snapping)', shortcut: '6', icon: <Minus className="w-4 h-4" /> },
    { type: 'freedraw', label: 'Draw / Pencil (Auto-Shape Recognition)', shortcut: '7', icon: <Pencil className="w-4 h-4" /> },
    { type: 'text', label: 'Text Tool', shortcut: '8', icon: <Type className="w-4 h-4" /> },
    { type: 'frame', label: 'Presentation Frame', shortcut: 'F', icon: <Layout className="w-4 h-4" /> },
    { type: 'image', label: 'Insert Image', shortcut: '9', icon: <ImageIcon className="w-4 h-4" /> },
    { type: 'eraser', label: 'Eraser', shortcut: '0', icon: <Eraser className="w-4 h-4" /> },
  ];

  const isTriangleActive =
    activeTool === 'triangle' ||
    activeTool === 'triangle_right' ||
    activeTool === 'triangle_isosceles';

  return (
    <div className="flex items-center gap-1.5 p-1.5 liquid-glass-panel shadow-2xl">
      {/* Lock Tool Toggle */}
      <button
        id="toolbar-tool-lock"
        onClick={() => setToolLock((prev) => !prev)}
        className={`p-2 rounded-xl transition text-xs font-semibold ${
          toolLock
            ? 'liquid-glass-button-active'
            : 'liquid-glass-button text-[#d0cfe0]'
        }`}
        title={`Keep selected tool active after drawing (${toolLock ? 'Locked' : 'Unlocked'}) [Q]`}
      >
        {toolLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 opacity-75" />}
      </button>

      <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

      {/* Main Drawing Tools */}
      {tools.map((tool) => {
        const isSelected =
          tool.type === 'triangle' ? isTriangleActive : activeTool === tool.type;

        return (
          <div key={tool.type} className="relative">
            <button
              id={`toolbar-tool-${tool.type}`}
              onClick={() => {
                if (tool.type === 'image') {
                  onImageUpload();
                } else if (tool.type === 'triangle') {
                  setActiveTool('triangle');
                } else {
                  setActiveTool(tool.type);
                }
              }}
              className={`relative p-2 rounded-xl text-xs font-medium transition flex items-center justify-center ${
                isSelected
                  ? 'liquid-glass-button-active'
                  : 'liquid-glass-button text-[#e2e8f0]'
              }`}
              title={`${tool.label} [${tool.shortcut}]`}
            >
              {tool.icon}
              <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white/60 leading-none select-none">
                {tool.shortcut}
              </span>
            </button>

            {/* Sub-variant indicator for triangles */}
            {tool.type === 'triangle' && isTriangleActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTriangleVariants(!showTriangleVariants);
                }}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6965db] text-white flex items-center justify-center text-[8px] hover:scale-110 transition shadow-sm border border-white/50"
                title="Choose Triangle Type (Equilateral, Right, Isosceles)"
              >
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            )}

            {/* Triangle Variants Popover */}
            {tool.type === 'triangle' && showTriangleVariants && (
              <div
                className="absolute top-12 left-0 z-50 p-1.5 liquid-glass-panel flex flex-col gap-1 w-36 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setActiveTool('triangle');
                    setShowTriangleVariants(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs text-left transition ${
                    activeTool === 'triangle'
                      ? 'liquid-glass-button-active'
                      : 'text-white/90 hover:bg-white/15'
                  }`}
                >
                  Equilateral △
                </button>
                <button
                  onClick={() => {
                    setActiveTool('triangle_right');
                    setShowTriangleVariants(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs text-left transition ${
                    activeTool === 'triangle_right'
                      ? 'liquid-glass-button-active'
                      : 'text-white/90 hover:bg-white/15'
                  }`}
                >
                  Right Angle ⊿
                </button>
                <button
                  onClick={() => {
                    setActiveTool('triangle_isosceles');
                    setShowTriangleVariants(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs text-left transition ${
                    activeTool === 'triangle_isosceles'
                      ? 'liquid-glass-button-active'
                      : 'text-white/90 hover:bg-white/15'
                  }`}
                >
                  Isosceles ▵
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

      {/* Dynamic Angle Snapping (Protractor Mode) Toggle */}
      <button
        id="toolbar-angle-snapping"
        onClick={() => setPreferences((p) => ({ ...p, angleSnapping: !p.angleSnapping }))}
        className={`p-2 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
          preferences.angleSnapping
            ? 'liquid-glass-button-active'
            : 'liquid-glass-button text-[#d0cfe0]'
        }`}
        title={`Dynamic Angle Snapping & Protractor Mode (${preferences.angleSnapping ? 'Enabled' : 'Disabled'})`}
      >
        <Compass className="w-4 h-4" />
        <span className="hidden xl:inline text-[11px] font-mono">15°</span>
      </button>

      {/* Smart Parallel & Perpendicular Geometric Snapping Toggle */}
      <button
        id="toolbar-geometric-snapping"
        onClick={() => setPreferences((p) => ({ ...p, geometricSnapping: !p.geometricSnapping }))}
        className={`p-2 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
          preferences.geometricSnapping
            ? 'liquid-glass-button-active'
            : 'liquid-glass-button text-[#d0cfe0]'
        }`}
        title={`Smart Parallel & Perpendicular Snapping (${preferences.geometricSnapping ? 'Enabled' : 'Disabled'})`}
      >
        <GitCommit className="w-4 h-4" />
        <span className="hidden xl:inline text-[11px]">∥ ⊥</span>
      </button>

      {/* Coordinate & Dimensions Callouts Toggle */}
      <button
        id="toolbar-dimensions"
        onClick={() => setPreferences((p) => ({ ...p, showDimensions: !p.showDimensions }))}
        className={`p-2 rounded-xl text-xs font-medium transition flex items-center gap-1 ${
          preferences.showDimensions
            ? 'liquid-glass-button-active'
            : 'liquid-glass-button text-[#d0cfe0]'
        }`}
        title={`Real-Time Dimension Callouts (${preferences.showDimensions ? 'Active' : 'Hidden'}) [D]`}
      >
        <Ruler className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

      {/* Engineering Component Library Button */}
      <button
        id="toolbar-engineering-library"
        onClick={onToggleEngineering}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
          isEngineeringOpen
            ? 'liquid-glass-button-active'
            : 'liquid-glass-button text-white'
        }`}
        title="Open Engineering Schematics & Logic Gates Library"
      >
        <Zap className={`w-3.5 h-3.5 ${isEngineeringOpen ? 'text-white' : 'text-[#f59f00]'}`} />
        <span className="font-semibold hidden lg:inline">Schematic</span>
      </button>

      {/* Slide Presentation Mode Button */}
      <button
        id="toolbar-presentation-mode"
        onClick={onStartPresentation}
        className="px-2.5 py-1.5 rounded-xl text-xs font-medium liquid-glass-button text-[#e2e8f0] transition flex items-center gap-1.5"
        title={`Start Step-by-Step Presentation (${frameCount} Slides) [F5]`}
      >
        <Presentation className="w-3.5 h-3.5 text-[#a5a4f7]" />
        <span className="hidden lg:inline">Present ({frameCount})</span>
      </button>

      <div className="w-[1px] h-5 bg-white/20 mx-0.5" />

      {/* Font Showcase & Rust WASM inspector */}
      <button
        id="toolbar-font-showcase"
        onClick={onOpenFontShowcase}
        className="px-2 py-1.5 rounded-xl text-xs font-medium liquid-glass-button text-[#e2e8f0] transition flex items-center gap-1"
        title="View 4-Font Typography Comparison"
      >
        <span className="font-excalifont text-sm font-bold">Aa</span>
      </button>

      <button
        id="toolbar-rust-wasm"
        onClick={onOpenRustViewer}
        className="px-2.5 py-1.5 rounded-xl text-xs font-medium liquid-glass-pill-purple transition flex items-center gap-1.5"
        title="View 100% Rust WASM Source Code & Architecture"
      >
        <Code2 className="w-3.5 h-3.5" />
        <span className="font-mono text-[11px] font-semibold hidden md:inline">Rust WASM</span>
      </button>
    </div>
  );
};
