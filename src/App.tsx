import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Share2,
  BookOpen,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Palette,
} from 'lucide-react';
import {
  ExcalidrawElement,
  ElementType,
  ViewportTransform,
  CanvasPreferences,
  FillStyle,
  StrokeStyle,
  FontFamily,
  EngineeringComponentType,
} from './types';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MainMenu } from './components/MainMenu';
import { ExportModal } from './components/ExportModal';
import { FontShowcaseModal } from './components/FontShowcaseModal';
import { RustCodeViewerModal } from './components/RustCodeViewerModal';
import { CommandPalette } from './components/CommandPalette';
import { CollabModal } from './components/CollabModal';
import { Canvas } from './components/Canvas';
import { EngineeringSidebar } from './components/EngineeringSidebar';
import { PresentationController } from './components/PresentationController';
import { ThemeModal } from './components/ThemeModal';
import { THEME_PALETTES, applyThemeToRoot } from './themes';
import { createEngineeringElement } from './engineeringComponents';
import { getBoundingBox } from './sketchEngine';

const STORAGE_KEY = 'rustly_forge_elements_v1';
const LEGACY_STORAGE_KEY = 'excalidraw_rust_elements_v1';
const PREFS_KEY = 'rustly_forge_prefs_v1';
const LEGACY_PREFS_KEY = 'excalidraw_rust_prefs_v1';

export default function App() {
  // Elements State
  const [elements, setElements] = useState<ExcalidrawElement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the saved elements are the circuit preset, clear them so canvas starts empty
          const isCircuitPreset = parsed.some(
            (el) => el.text === 'R1 (Resistor)' || el.text === 'L1 (Inductor)' || el.text === 'C1 (Capacitor)'
          );
          if (!isCircuitPreset) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ElementType>('selection');
  const [toolLock, setToolLock] = useState<boolean>(false);

  // Undo / Redo History
  const [history, setHistory] = useState<ExcalidrawElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Viewport Transform
  const [transform, setTransform] = useState<ViewportTransform>({
    panX: 0,
    panY: 0,
    zoom: 1.0,
  });

  // Canvas Preferences
  const [preferences, setPreferences] = useState<CanvasPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY) || localStorage.getItem(LEGACY_PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      selectMode: 'wrap',
      toolLock: false,
      snapToObjects: false,
      toggleGrid: true,
      zenMode: false,
      viewMode: false,
      arrowBinding: true,
      snapToMidpoints: false,
      theme: 'dark',
      canvasBackground: '#121212',
      angleSnapping: true,
      geometricSnapping: true,
      showDimensions: true,
    };
  });

  // Engineering Schematic & Presentation States
  const [isEngineeringOpen, setIsEngineeringOpen] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Default drawing properties (matching Screenshot 1)
  const [defaultStrokeColor, setDefaultStrokeColor] = useState<string>('#e0e0e0');
  const [defaultBackgroundColor, setDefaultBackgroundColor] = useState<string>('transparent');
  const [defaultFillStyle, setDefaultFillStyle] = useState<FillStyle>('hachure');
  const [defaultStrokeWidth, setDefaultStrokeWidth] = useState<number>(2);
  const [defaultStrokeStyle, setDefaultStrokeStyle] = useState<StrokeStyle>('solid');
  const [defaultRoughness, setDefaultRoughness] = useState<number>(1.0);
  const [defaultOpacity, setDefaultOpacity] = useState<number>(1.0);
  const [defaultFontFamily, setDefaultFontFamily] = useState<FontFamily>('excalifont');
  const [defaultFontSize, setDefaultFontSize] = useState<number>(22);
  const [defaultTextAlign, setDefaultTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Modals
  const [showMainMenu, setShowMainMenu] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showFontModal, setShowFontModal] = useState<boolean>(false);
  const [showRustModal, setShowRustModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showCollabModal, setShowCollabModal] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
    } catch {}
  }, [elements]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  // Synchronize dynamic Canvas Theme & Palette variables to root document
  useEffect(() => {
    const matching =
      THEME_PALETTES.find(
        (t) => t.canvasBackground.toLowerCase() === preferences.canvasBackground.toLowerCase()
      ) ||
      THEME_PALETTES.find((t) => t.category === preferences.theme) ||
      THEME_PALETTES[0];
    applyThemeToRoot(matching);
  }, [preferences.canvasBackground, preferences.theme]);

  // Push new state to history
  const pushHistory = useCallback((newElements: ExcalidrawElement[]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      const next = [...upToCurrent, newElements];
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setElements(history[targetIndex]);
    }
  }, [historyIndex, history]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setElements(history[targetIndex]);
    }
  }, [historyIndex, history]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is currently typing in input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save / Open / Export
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowExportModal(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExportModal(true);
        return;
      }

      // Command palette: Ctrl + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Toggle grid: Ctrl + '
      if ((e.ctrlKey || e.metaKey) && e.key === "'") {
        e.preventDefault();
        setPreferences((p) => ({ ...p, toggleGrid: !p.toggleGrid }));
        return;
      }

      // Zen mode: Alt + Z
      if (e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setPreferences((p) => ({ ...p, zenMode: !p.zenMode }));
        return;
      }

      // Select All: Ctrl + A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(elements.filter((el) => !el.isDeleted).map((el) => el.id));
        return;
      }

      // Tool lock: Q
      if (e.key.toLowerCase() === 'q') {
        setToolLock((prev) => !prev);
        return;
      }

      // F5 to start Presentation Mode
      if (e.key === 'F5') {
        e.preventDefault();
        handleStartPresentation();
        return;
      }

      // F to select frame tool
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        setActiveTool('frame');
        return;
      }

      // Numeric tool shortcuts
      switch (e.key) {
        case 'h':
        case 'H':
          setActiveTool('hand');
          break;
        case '1':
        case 'v':
        case 'V':
          setActiveTool('selection');
          break;
        case '2':
        case 'r':
        case 'R':
          setActiveTool('rectangle');
          break;
        case '3':
        case 'd':
        case 'D':
          setActiveTool('diamond');
          break;
        case '4':
        case 'o':
        case 'O':
          setActiveTool('ellipse');
          break;
        case '5':
        case 'a':
        case 'A':
          setActiveTool('arrow');
          break;
        case '6':
        case 'l':
        case 'L':
          setActiveTool('line');
          break;
        case '7':
        case 'p':
        case 'P':
          setActiveTool('freedraw');
          break;
        case '8':
        case 't':
        case 'T':
          setActiveTool('text');
          break;
        case '9':
          imageInputRef.current?.click();
          break;
        case '0':
        case 'e':
        case 'E':
          setActiveTool('eraser');
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            e.preventDefault();
            deleteSelected();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, selectedIds, handleUndo, handleRedo]);

  // Selected Elements Operations
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id) && !el.isDeleted);

  const updateSelected = (updates: Partial<ExcalidrawElement>) => {
    const next = elements.map((el) =>
      selectedIds.includes(el.id) ? { ...el, ...updates } : el
    );
    setElements(next);
    pushHistory(next);
  };

  const duplicateSelected = () => {
    const duplicated: ExcalidrawElement[] = [];
    const newIds: string[] = [];

    for (const id of selectedIds) {
      const orig = elements.find((el) => el.id === id);
      if (orig) {
        const newId = `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        newIds.push(newId);
        duplicated.push({
          ...orig,
          id: newId,
          x: orig.x + 20,
          y: orig.y + 20,
          seed: Math.floor(Math.random() * 100000),
        });
      }
    }

    const next = [...elements, ...duplicated];
    setElements(next);
    pushHistory(next);
    setSelectedIds(newIds);
  };

  const deleteSelected = () => {
    const next = elements.map((el) =>
      selectedIds.includes(el.id) ? { ...el, isDeleted: true } : el
    );
    setElements(next);
    pushHistory(next);
    setSelectedIds([]);
  };

  const bringToFront = () => {
    const nonSelected = elements.filter((el) => !selectedIds.includes(el.id));
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const next = [...nonSelected, ...selected];
    setElements(next);
    pushHistory(next);
  };

  const sendToBack = () => {
    const nonSelected = elements.filter((el) => !selectedIds.includes(el.id));
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const next = [...selected, ...nonSelected];
    setElements(next);
    pushHistory(next);
  };

  // Image Upload handler
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const newId = `img_${Date.now()}`;
        const newEl: ExcalidrawElement = {
          id: newId,
          type: 'image',
          x: 200,
          y: 150,
          width: Math.min(img.width, 400),
          height: (img.height / img.width) * Math.min(img.width, 400),
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          fillStyle: 'transparent',
          strokeWidth: 1,
          strokeStyle: 'solid',
          roughness: 0,
          opacity: 1,
          points: [],
          imageDataUrl: dataUrl,
          seed: Math.floor(Math.random() * 10000),
        };
        const next = [...elements, newEl];
        setElements(next);
        pushHistory(next);
        setSelectedIds([newId]);
        setActiveTool('selection');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // JSON Import handler
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (Array.isArray(parsed)) {
          setElements(parsed);
          pushHistory(parsed);
          setSelectedIds([]);
        }
      } catch {
        alert('Invalid Rustly Forge JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Presentation Frames & Slide Handlers
  const frames = elements
    .filter((el) => el.type === 'frame' && !el.isDeleted)
    .sort((a, b) => (a.frameIndex || 0) - (b.frameIndex || 0));

  const handleFitFrame = (frame: ExcalidrawElement) => {
    const margin = 100;
    const viewW = window.innerWidth - margin * 2;
    const viewH = window.innerHeight - margin * 2;
    const zoomX = viewW / Math.max(100, Math.abs(frame.width));
    const zoomY = viewH / Math.max(100, Math.abs(frame.height));
    const targetZoom = Math.min(Math.max(0.2, Math.min(zoomX, zoomY)), 2.0);

    const fx = Math.min(frame.x, frame.x + frame.width);
    const fy = Math.min(frame.y, frame.y + frame.height);
    const fw = Math.abs(frame.width);
    const fh = Math.abs(frame.height);

    const targetPanX = window.innerWidth / 2 - (fx + fw / 2) * targetZoom;
    const targetPanY = window.innerHeight / 2 - (fy + fh / 2) * targetZoom;

    setTransform({
      panX: targetPanX,
      panY: targetPanY,
      zoom: targetZoom,
    });
  };

  const handleStartPresentation = () => {
    if (frames.length === 0) {
      let minX = 100, minY = 100, maxX = 800, maxY = 500;
      const visible = elements.filter((e) => !e.isDeleted);
      if (visible.length > 0) {
        minX = Math.min(...visible.map((e) => getBoundingBox(e).minX)) - 40;
        minY = Math.min(...visible.map((e) => getBoundingBox(e).minY)) - 40;
        maxX = Math.max(...visible.map((e) => getBoundingBox(e).maxX)) + 40;
        maxY = Math.max(...visible.map((e) => getBoundingBox(e).maxY)) + 40;
      }
      const autoFrame: ExcalidrawElement = {
        id: `frame_${Date.now()}`,
        type: 'frame',
        x: minX,
        y: minY,
        width: Math.max(400, maxX - minX),
        height: Math.max(300, maxY - minY),
        angle: 0,
        strokeColor: '#6965db',
        backgroundColor: 'transparent',
        fillStyle: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        roughness: 0,
        opacity: 1,
        points: [],
        seed: Math.floor(Math.random() * 100000),
        frameTitle: 'Slide 1: Overview',
        frameIndex: 1,
      };
      const next = [...elements, autoFrame];
      setElements(next);
      pushHistory(next);
      setCurrentSlideIndex(0);
      setIsPresentationMode(true);
      setTimeout(() => handleFitFrame(autoFrame), 50);
      return;
    }
    setCurrentSlideIndex(0);
    setIsPresentationMode(true);
    handleFitFrame(frames[0]);
  };

  const handleAddFrameFromSelection = () => {
    const selected = elements.filter((e) => selectedIds.includes(e.id) && !e.isDeleted);
    let fx = 120, fy = 100, fw = 600, fh = 400;
    if (selected.length > 0) {
      const minX = Math.min(...selected.map((e) => getBoundingBox(e).minX)) - 30;
      const minY = Math.min(...selected.map((e) => getBoundingBox(e).minY)) - 30;
      const maxX = Math.max(...selected.map((e) => getBoundingBox(e).maxX)) + 30;
      const maxY = Math.max(...selected.map((e) => getBoundingBox(e).maxY)) + 30;
      fx = minX;
      fy = minY;
      fw = maxX - minX;
      fh = maxY - minY;
    } else {
      fx = (window.innerWidth / 2 - transform.panX) / transform.zoom - 300;
      fy = (window.innerHeight / 2 - transform.panY) / transform.zoom - 200;
    }

    const nextIdx = frames.length + 1;
    const newFrame: ExcalidrawElement = {
      id: `frame_${Date.now()}`,
      type: 'frame',
      x: fx,
      y: fy,
      width: fw,
      height: fh,
      angle: 0,
      strokeColor: '#6965db',
      backgroundColor: 'transparent',
      fillStyle: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'dashed',
      roughness: 0,
      opacity: 1,
      points: [],
      seed: Math.floor(Math.random() * 100000),
      frameTitle: `Slide ${nextIdx}: Analysis`,
      frameIndex: nextIdx,
    };

    const next = [...elements, newFrame];
    setElements(next);
    pushHistory(next);
    setSelectedIds([newFrame.id]);
    setCurrentSlideIndex(nextIdx - 1);
  };

  const handleDeleteFrame = (frameId: string) => {
    const next = elements.map((e) => (e.id === frameId ? { ...e, isDeleted: true } : e));
    setElements(next);
    pushHistory(next);
    if (currentSlideIndex >= frames.length - 1) {
      setCurrentSlideIndex(Math.max(0, frames.length - 2));
    }
  };

  const handleUpdateFrameTitle = (frameId: string, newTitle: string) => {
    const next = elements.map((e) => (e.id === frameId ? { ...e, frameTitle: newTitle } : e));
    setElements(next);
    pushHistory(next);
  };

  const handleStampComponent = (compType: EngineeringComponentType) => {
    const cx = (window.innerWidth / 2 - transform.panX) / transform.zoom - 50;
    const cy = (window.innerHeight / 2 - transform.panY) / transform.zoom - 25;
    const newComp = createEngineeringElement(compType, cx, cy, {
      strokeColor: defaultStrokeColor,
    });
    const next = [...elements, newComp];
    setElements(next);
    pushHistory(next);
    setSelectedIds([newComp.id]);
    setActiveTool('selection');
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(5.0, Number((prev.zoom + 0.1).toFixed(2))),
    }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Number((prev.zoom - 0.1).toFixed(2))),
    }));
  };

  const handleResetZoom = () => {
    setTransform((prev) => ({ ...prev, zoom: 1.0, panX: 0, panY: 0 }));
  };

  return (
    <div
      id="rustly-forge-app"
      className="relative w-screen h-screen overflow-hidden select-none font-sans"
      style={{ backgroundColor: preferences.canvasBackground }}
    >
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFile}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.rustlyforge,.excalidraw"
        onChange={handleJsonImport}
        className="hidden"
      />

      {/* Top Floating App Bar */}
      {!preferences.zenMode && (
        <header className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Top Left Menu & Brand & Presets */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              id="btn-main-menu"
              onClick={() => setShowMainMenu(!showMainMenu)}
              className="p-2.5 rounded-xl bg-[#232329] hover:bg-[#2e2e38] text-[#d4d4df] hover:text-white border border-[#31303b] shadow-xl transition"
              title="Main Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Application Branding Badge */}
            <div
              id="app-branding-badge"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#232329] border border-[#31303b] shadow-xl text-white select-none"
              title="Rustly Forge - Open-Source Rust-Powered Engineering Canvas"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 shadow-sm" />
              <span className="text-xs font-bold tracking-wide">Rustly Forge</span>
            </div>
          </div>

          {/* Top Center Floating Toolbar (Screenshot 1) */}
          <div className="pointer-events-auto">
            <Toolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              toolLock={toolLock}
              setToolLock={setToolLock}
              preferences={preferences}
              setPreferences={setPreferences}
              onImageUpload={() => imageInputRef.current?.click()}
              onOpenRustViewer={() => setShowRustModal(true)}
              onOpenCollab={() => setShowCollabModal(true)}
              onOpenFontShowcase={() => setShowFontModal(true)}
              onToggleEngineering={() => setIsEngineeringOpen((prev) => !prev)}
              isEngineeringOpen={isEngineeringOpen}
              onStartPresentation={handleStartPresentation}
              frameCount={frames.length}
            />
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              id="btn-themes"
              onClick={() => setShowThemeModal(true)}
              className="px-3 py-2 rounded-xl liquid-glass-button text-[#e2e8f0] text-xs font-semibold transition flex items-center gap-1.5"
              title="Canvas Theme & 16 Color Palettes"
            >
              <Palette className="w-3.5 h-3.5 text-[#a5a4f7]" />
              <span className="hidden lg:inline">Theme</span>
            </button>

            <button
              id="btn-collab"
              onClick={() => setShowCollabModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#6965db] hover:bg-[#5b57d1] text-white text-xs font-semibold shadow-lg shadow-[#6965db]/20 transition flex items-center gap-2"
              title="Share and Live Collaborate (E2EE)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </header>
      )}

      {/* Left Properties Panel (Screenshot 1) */}
      {!preferences.zenMode && !preferences.viewMode && (
        <PropertiesPanel
          selectedElements={selectedElements}
          onUpdateSelected={updateSelected}
          onDuplicateSelected={duplicateSelected}
          onDeleteSelected={deleteSelected}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          defaultStrokeColor={defaultStrokeColor}
          setDefaultStrokeColor={setDefaultStrokeColor}
          defaultBackgroundColor={defaultBackgroundColor}
          setDefaultBackgroundColor={setDefaultBackgroundColor}
          defaultFillStyle={defaultFillStyle}
          setDefaultFillStyle={setDefaultFillStyle}
          defaultStrokeWidth={defaultStrokeWidth}
          setDefaultStrokeWidth={setDefaultStrokeWidth}
          defaultStrokeStyle={defaultStrokeStyle}
          setDefaultStrokeStyle={setDefaultStrokeStyle}
          defaultRoughness={defaultRoughness}
          setDefaultRoughness={setDefaultRoughness}
          defaultOpacity={defaultOpacity}
          setDefaultOpacity={setDefaultOpacity}
          defaultFontFamily={defaultFontFamily}
          setDefaultFontFamily={setDefaultFontFamily}
          defaultFontSize={defaultFontSize}
          setDefaultFontSize={setDefaultFontSize}
          defaultTextAlign={defaultTextAlign}
          setDefaultTextAlign={setDefaultTextAlign}
        />
      )}

      {/* Main Interactive HTML5 Canvas */}
      <Canvas
        elements={elements}
        setElements={setElements}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        toolLock={toolLock}
        preferences={preferences}
        transform={transform}
        setTransform={setTransform}
        defaultStrokeColor={defaultStrokeColor}
        defaultBackgroundColor={defaultBackgroundColor}
        defaultFillStyle={defaultFillStyle}
        defaultStrokeWidth={defaultStrokeWidth}
        defaultStrokeStyle={defaultStrokeStyle}
        defaultRoughness={defaultRoughness}
        defaultOpacity={defaultOpacity}
        defaultFontFamily={defaultFontFamily}
        defaultFontSize={defaultFontSize}
        defaultTextAlign={defaultTextAlign}
        canvasRef={canvasRef}
        pushHistory={pushHistory}
        onShapeRecognized={(shapeLabel) => {
          setToastMessage(`Auto-detected: ${shapeLabel}`);
          setTimeout(() => setToastMessage(null), 2500);
        }}
      />

      {/* Bottom Left Controls (Zoom, Undo, Redo) */}
      {!preferences.zenMode && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          {/* Zoom Widget */}
          <div className="flex items-center bg-[#232329] border border-[#31303b] rounded-xl p-1 shadow-xl text-xs text-[#d4d4df]">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-[#2e2e38] text-[#9c9ba8] hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 font-mono text-[11px] hover:bg-[#2e2e38] rounded-md transition"
              title="Reset Zoom to 100%"
            >
              {Math.round(transform.zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-[#2e2e38] text-[#9c9ba8] hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-[#232329] border border-[#31303b] rounded-xl p-1 shadow-xl text-xs text-[#d4d4df]">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-lg transition ${
                historyIndex <= 0
                  ? 'opacity-40 cursor-not-allowed text-[#6c6b7e]'
                  : 'hover:bg-[#2e2e38] text-[#9c9ba8] hover:text-white'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-lg transition ${
                historyIndex >= history.length - 1
                  ? 'opacity-40 cursor-not-allowed text-[#6c6b7e]'
                  : 'hover:bg-[#2e2e38] text-[#9c9ba8] hover:text-white'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Zen Mode Exit Button */}
      {preferences.zenMode && (
        <button
          onClick={() => setPreferences((p) => ({ ...p, zenMode: false }))}
          className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-[#232329] border border-[#31303b] rounded-xl text-xs text-white hover:bg-[#2e2e38] shadow-2xl flex items-center gap-2 transition"
        >
          <EyeOff className="w-4 h-4" />
          <span>Exit Zen Mode (Alt+Z)</span>
        </button>
      )}

      {/* Main Hamburger Menu (Screenshots 2 & 3) */}
      <MainMenu
        isOpen={showMainMenu}
        onClose={() => setShowMainMenu(false)}
        onOpen={() => fileInputRef.current?.click()}
        onSave={() => setShowExportModal(true)}
        onExport={() => setShowExportModal(true)}
        onCollab={() => setShowCollabModal(true)}
        onCommandPalette={() => setShowCommandPalette(true)}
        onHelp={() => setShowRustModal(true)}
        onReset={() => {
          setElements([]);
          pushHistory([]);
          setSelectedIds([]);
        }}
        onOpenRustViewer={() => setShowRustModal(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
        preferences={preferences}
        setPreferences={setPreferences}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvasRef={canvasRef}
        elements={elements}
        canvasBackground={preferences.canvasBackground}
      />

      {/* 4-Font Typography Showcase (Screenshot 4) */}
      <FontShowcaseModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
        onInsertTextWithFont={(text, font) => {
          const newId = `elem_${Date.now()}`;
          const newEl: ExcalidrawElement = {
            id: newId,
            type: 'text',
            x: 250,
            y: 200,
            width: 160,
            height: 60,
            angle: 0,
            strokeColor: defaultStrokeColor,
            backgroundColor: 'transparent',
            fillStyle: 'transparent',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 0,
            opacity: 1,
            points: [],
            text: text,
            fontSize: 26,
            fontFamily: font,
            seed: Math.floor(Math.random() * 100000),
          };
          const next = [...elements, newEl];
          setElements(next);
          pushHistory(next);
          setSelectedIds([newId]);
          setActiveTool('selection');
        }}
      />

      {/* Rust WASM Architecture & Code Inspector */}
      <RustCodeViewerModal
        isOpen={showRustModal}
        onClose={() => setShowRustModal(false)}
      />

      {/* Command Palette (Ctrl+/) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTool={setActiveTool}
        onExport={() => setShowExportModal(true)}
        onReset={() => {
          setElements([]);
          pushHistory([]);
          setSelectedIds([]);
        }}
        onOpenRustViewer={() => setShowRustModal(true)}
        onToggleTheme={() =>
          setPreferences((p) => ({
            ...p,
            theme: p.theme === 'dark' ? 'light' : 'dark',
            canvasBackground: p.theme === 'dark' ? '#fdfbf7' : '#121212',
          }))
        }
      />

      {/* Live Collaboration Modal (E2EE) */}
      <CollabModal
        isOpen={showCollabModal}
        onClose={() => setShowCollabModal(false)}
      />

      {/* Engineering Component & Symbol Library Sidebar */}
      <EngineeringSidebar
        isOpen={isEngineeringOpen}
        onClose={() => setIsEngineeringOpen(false)}
        onSelectComponent={handleStampComponent}
      />

      {/* Step-by-Step Presentation Mode Controller */}
      <PresentationController
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={setIsPresentationMode}
        frames={frames}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        onAddFrameFromSelection={handleAddFrameFromSelection}
        onDeleteFrame={handleDeleteFrame}
        onUpdateFrameTitle={handleUpdateFrameTitle}
        onFitFrame={handleFitFrame}
      />

      {/* 16 Canvas Theme & Color Palettes Modal (Feature 2.3) */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        preferences={preferences}
        setPreferences={setPreferences}
        setDefaultStrokeColor={setDefaultStrokeColor}
      />

      {/* Floating Toast Notification (Shape Recognition Feedback) */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl liquid-glass-panel text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
