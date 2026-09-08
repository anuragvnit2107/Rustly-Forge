import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ExcalidrawElement,
  ElementType,
  ViewportTransform,
  CanvasPreferences,
  TransformHandle,
  Point,
  FontFamily,
  Terminal,
} from '../types';
import {
  drawSketchyRect,
  drawSketchyDiamond,
  drawSketchyEllipse,
  drawSketchyArrow,
  drawSketchyLine,
  drawHatching,
  drawElementHatching,
  drawSketchyTriangle,
  drawSketchyPolygon,
  getBoundingBox,
  hitTestElement,
  getFontFamilyCss,
} from '../sketchEngine';
import {
  drawEngineeringComponent,
  findNearestTerminal,
  updateBoundLines,
  getComponentWorldTerminals,
} from '../engineeringComponents';
import { recognizeShapeFromPoints } from '../shapeRecognition';

interface CanvasProps {
  elements: ExcalidrawElement[];
  setElements: React.Dispatch<React.SetStateAction<ExcalidrawElement[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeTool: ElementType;
  setActiveTool: (tool: ElementType) => void;
  toolLock: boolean;
  preferences: CanvasPreferences;
  transform: ViewportTransform;
  setTransform: React.Dispatch<React.SetStateAction<ViewportTransform>>;
  defaultStrokeColor: string;
  defaultBackgroundColor: string;
  defaultFillStyle: any;
  defaultStrokeWidth: number;
  defaultStrokeStyle: any;
  defaultRoughness: number;
  defaultOpacity: number;
  defaultFontFamily: FontFamily;
  defaultFontSize: number;
  defaultTextAlign: 'left' | 'center' | 'right';
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pushHistory: (newElements: ExcalidrawElement[]) => void;
  isPresentationMode?: boolean;
  onShapeRecognized?: (shapeName: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  setElements,
  selectedIds,
  setSelectedIds,
  activeTool,
  setActiveTool,
  toolLock,
  preferences,
  transform,
  setTransform,
  defaultStrokeColor,
  defaultBackgroundColor,
  defaultFillStyle,
  defaultStrokeWidth,
  defaultStrokeStyle,
  defaultRoughness,
  defaultOpacity,
  defaultFontFamily,
  defaultFontSize,
  defaultTextAlign,
  canvasRef,
  pushHistory,
  isPresentationMode = false,
  onShapeRecognized,
}) => {
  // Interaction states
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragMode, setDragMode] = useState<
    'none' | 'drawing' | 'moving' | 'resizing' | 'panning' | 'box_selecting'
  >('none');
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [boxSelectCurrent, setBoxSelectCurrent] = useState<Point | null>(null);
  const [activeHandle, setActiveHandle] = useState<TransformHandle | null>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);

  // Dynamic Snapping States (for live canvas rendering)
  const [activeAngleSnap, setActiveAngleSnap] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    angleDeg: number;
    isSnapped: boolean;
  } | null>(null);

  const [activeGeometricSnap, setActiveGeometricSnap] = useState<{
    type: 'parallel' | 'perpendicular';
    refP1: Point;
    refP2: Point;
    curP1: Point;
    curP2: Point;
  } | null>(null);

  const [activeTerminalSnap, setActiveTerminalSnap] = useState<{
    terminalName: string;
    componentName: string;
    worldX: number;
    worldY: number;
    elementId: string;
    terminalId: string;
  } | null>(null);

  // Smooth Inline Text Editing State
  const [textEditing, setTextEditing] = useState<{
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: FontFamily;
    color: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Screen to world helper
  const screenToWorld = useCallback(
    (sx: number, sy: number): Point => ({
      x: (sx - transform.panX) / transform.zoom,
      y: (sy - transform.panY) / transform.zoom,
    }),
    [transform.panX, transform.panY, transform.zoom]
  );

  // World to screen helper
  const worldToScreen = useCallback(
    (wx: number, wy: number): Point => ({
      x: wx * transform.zoom + transform.panX,
      y: wy * transform.zoom + transform.panY,
    }),
    [transform.panX, transform.panY, transform.zoom]
  );

  // Auto-focus and auto-select textarea on mount or when editing starts
  useEffect(() => {
    if (textEditing && textareaRef.current) {
      const el = textareaRef.current;
      setTimeout(() => {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }, 10);
    }
  }, [textEditing?.id]);

  // Track spacebar and shift keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && !textEditing) {
        setSpacePressed(true);
      }
      if (e.key === 'Shift') {
        setShiftPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
      if (e.key === 'Shift') {
        setShiftPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [textEditing]);

  // Finish text editing handler
  const finishTextEditing = useCallback(() => {
    if (!textEditing) return;

    const trimmed = textEditing.text.trim();
    if (trimmed) {
      // Accurately measure multi-line text dimensions
      const lines = textEditing.text.split('\n');
      let maxLineLen = 1;
      for (const line of lines) {
        if (line.length > maxLineLen) maxLineLen = line.length;
      }
      const measuredW = Math.max(60, Math.ceil(maxLineLen * textEditing.fontSize * 0.65 + 16));
      const measuredH = Math.max(30, Math.ceil(lines.length * textEditing.fontSize * 1.35 + 8));

      const existing = elements.find((e) => e.id === textEditing.id);
      if (existing) {
        const next = elements.map((e) =>
          e.id === textEditing.id
            ? {
                ...e,
                text: textEditing.text,
                width: measuredW,
                height: measuredH,
                fontSize: textEditing.fontSize,
                fontFamily: textEditing.fontFamily,
                strokeColor: textEditing.color,
              }
            : e
        );
        setElements(next);
        pushHistory(next);
      } else {
        const newEl: ExcalidrawElement = {
          id: textEditing.id,
          type: 'text',
          x: textEditing.x,
          y: textEditing.y,
          width: measuredW,
          height: measuredH,
          angle: 0,
          strokeColor: textEditing.color,
          backgroundColor: 'transparent',
          fillStyle: 'transparent',
          strokeWidth: 1,
          strokeStyle: 'solid',
          roughness: 0,
          opacity: 1,
          points: [],
          text: textEditing.text,
          fontSize: textEditing.fontSize,
          fontFamily: textEditing.fontFamily,
          seed: Math.floor(Math.random() * 100000),
        };
        const next = [...elements, newEl];
        setElements(next);
        pushHistory(next);
        setSelectedIds([textEditing.id]);
      }
    } else {
      // Discard empty text element
      setElements((prev) => prev.filter((e) => e.id !== textEditing.id));
    }

    setTextEditing(null);
    if (!toolLock) setActiveTool('selection');
  }, [textEditing, elements, setElements, pushHistory, setSelectedIds, toolLock, setActiveTool]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const isDark =
        preferences.canvasBackground.startsWith('#1') ||
        preferences.canvasBackground.startsWith('#2') ||
        preferences.canvasBackground === '#000000';

      // Background clear
      ctx.fillStyle = preferences.canvasBackground;
      ctx.fillRect(0, 0, width, height);

      // Camera pan & zoom
      ctx.translate(transform.panX, transform.panY);
      ctx.scale(transform.zoom, transform.zoom);

      // Subtle Grid
      if (preferences.toggleGrid) {
        const step = 20;
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1 / transform.zoom;

        const topLeft = screenToWorld(0, 0);
        const bottomRight = screenToWorld(width, height);

        const startX = Math.floor(topLeft.x / step) * step;
        const endX = Math.ceil(bottomRight.x / step) * step;
        const startY = Math.floor(topLeft.y / step) * step;
        const endY = Math.ceil(bottomRight.y / step) * step;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += step) {
          ctx.moveTo(x, topLeft.y);
          ctx.lineTo(x, bottomRight.y);
        }
        for (let y = startY; y <= endY; y += step) {
          ctx.moveTo(topLeft.x, y);
          ctx.lineTo(bottomRight.x, y);
        }
        ctx.stroke();
      }

      // Render Elements
      for (const el of elements) {
        if (el.isDeleted) continue;
        if (textEditing && textEditing.id === el.id) continue; // Hide text currently being edited

        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;

        // Apply background fill using exact vector geometry clipping (Fix 1.1)
        if (el.backgroundColor !== 'transparent' && el.type !== 'engineering' && el.type !== 'frame') {
          drawElementHatching(ctx, el);
        }

        // Apply Stroke Style dashes
        if (el.strokeStyle === 'dashed') {
          ctx.setLineDash([8, 6]);
        } else if (el.strokeStyle === 'dotted') {
          ctx.setLineDash([2, 4]);
        } else {
          ctx.setLineDash([]);
        }

        switch (el.type) {
          case 'rectangle':
            drawSketchyRect(ctx, el.x, el.y, el.width, el.height, el.roughness, el.seed, el.strokeStyle);
            break;
          case 'diamond':
            drawSketchyDiamond(ctx, el.x, el.y, el.width, el.height, el.roughness, el.seed, el.strokeStyle);
            break;
          case 'ellipse':
            drawSketchyEllipse(ctx, el.x, el.y, el.width, el.height, el.roughness, el.seed);
            break;
          case 'triangle':
            drawSketchyTriangle(ctx, el.x, el.y, el.width, el.height, 'equilateral', el.roughness, el.seed, el.strokeStyle);
            break;
          case 'triangle_right':
            drawSketchyTriangle(ctx, el.x, el.y, el.width, el.height, 'right', el.roughness, el.seed, el.strokeStyle);
            break;
          case 'triangle_isosceles':
            drawSketchyTriangle(ctx, el.x, el.y, el.width, el.height, 'isosceles', el.roughness, el.seed, el.strokeStyle);
            break;
          case 'polygon':
            drawSketchyPolygon(ctx, el.x, el.y, el.width, el.height, el.polygonSides || 6, el.roughness, el.seed, el.strokeStyle);
            break;
          case 'arrow':
            if (el.points.length >= 2) {
              drawSketchyArrow(
                ctx,
                el.x + el.points[0].x,
                el.y + el.points[0].y,
                el.x + el.points[1].x,
                el.y + el.points[1].y,
                el.roughness,
                el.seed
              );
            } else {
              drawSketchyArrow(ctx, el.x, el.y, el.x + el.width, el.y + el.height, el.roughness, el.seed);
            }
            break;
          case 'line':
            if (el.points.length >= 2) {
              drawSketchyLine(
                ctx,
                el.x + el.points[0].x,
                el.y + el.points[0].y,
                el.x + el.points[1].x,
                el.y + el.points[1].y,
                el.roughness,
                el.seed,
                el.strokeStyle
              );
            } else {
              drawSketchyLine(ctx, el.x, el.y, el.x + el.width, el.y + el.height, el.roughness, el.seed, el.strokeStyle);
            }
            break;
          case 'freedraw':
            if (el.points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(el.x + el.points[0].x, el.y + el.points[0].y);
              for (let i = 1; i < el.points.length; i++) {
                ctx.lineTo(el.x + el.points[i].x, el.y + el.points[i].y);
              }
              ctx.stroke();
            }
            break;
          case 'text':
            if (el.text) {
              const fontSize = el.fontSize || 20;
              const fontCss = getFontFamilyCss(el.fontFamily);
              ctx.font = `${fontSize}px ${fontCss}`;
              ctx.fillStyle = el.strokeColor;
              ctx.textBaseline = 'top';

              const lines = el.text.split('\n');
              const lineHeight = fontSize * 1.35;
              lines.forEach((line, idx) => {
                ctx.fillText(line, el.x, el.y + idx * lineHeight);
              });
            }
            break;
          case 'engineering':
            drawEngineeringComponent(ctx, el, isDark);
            break;
          case 'frame': {
            // Presentation Frame Container
            const fx = Math.min(el.x, el.x + el.width);
            const fy = Math.min(el.y, el.y + el.height);
            const fw = Math.abs(el.width);
            const fh = Math.abs(el.height);

            // Frame background tint
            ctx.fillStyle = isDark ? 'rgba(105, 101, 219, 0.04)' : 'rgba(105, 101, 219, 0.05)';
            ctx.fillRect(fx, fy, fw, fh);

            // Frame border
            ctx.strokeStyle = '#6965db';
            ctx.lineWidth = 1.5 / transform.zoom;
            ctx.setLineDash([8 / transform.zoom, 6 / transform.zoom]);
            ctx.strokeRect(fx, fy, fw, fh);
            ctx.setLineDash([]);

            // Frame Title Tab Badge
            const tabTitle = el.frameTitle || `Slide ${el.frameIndex || 1}`;
            ctx.font = `bold ${Math.max(11, 13 / transform.zoom)}px sans-serif`;
            const textMetrics = ctx.measureText(tabTitle);
            const badgeW = textMetrics.width + 18 / transform.zoom;
            const badgeH = 22 / transform.zoom;

            ctx.fillStyle = '#6965db';
            ctx.fillRect(fx, fy - badgeH, badgeW, badgeH);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(tabTitle, fx + 8 / transform.zoom, fy - badgeH / 2);
            break;
          }
          case 'image':
            if (el.imageDataUrl) {
              const img = new Image();
              img.src = el.imageDataUrl;
              ctx.drawImage(img, el.x, el.y, el.width, el.height);
            }
            break;
        }

        // Real-Time Dimension Callouts on Canvas Elements (Fix 1.2 & 1.3)
        if (preferences.showDimensions && (selectedIds.includes(el.id) || el.type === 'line' || el.type === 'arrow')) {
          ctx.save();
          ctx.font = '11px monospace';
          ctx.fillStyle = '#a5a4f7';
          ctx.strokeStyle = 'rgba(165, 164, 247, 0.4)';
          ctx.lineWidth = 1 / transform.zoom;

          if (el.type === 'line' || el.type === 'arrow') {
            const p1x = el.points[0] ? el.x + el.points[0].x : el.x;
            const p1y = el.points[0] ? el.y + el.points[0].y : el.y;
            const p2x = el.points[1] ? el.x + el.points[1].x : el.x + el.width;
            const p2y = el.points[1] ? el.y + el.points[1].y : el.y + el.height;
            const len = Math.hypot(p2x - p1x, p2y - p1y);
            // Calculate acute angle counter-clockwise relative to horizontal baseline (Fix 1.2)
            const ccwAng = ((Math.atan2(-(p2y - p1y), p2x - p1x) * 180 / Math.PI) + 360) % 360;
            const acuteAng = ccwAng > 180 ? 360 - ccwAng : ccwAng;
            // Convert to integer grid units (Fix 1.3)
            const gridUnits = Math.max(1, Math.round(len / 20));

            const midX = (p1x + p2x) / 2;
            const midY = (p1y + p2y) / 2;

            // Pill box
            const calloutText = `L: ${gridUnits}  ∠${acuteAng.toFixed(1)}°`;
            const m = ctx.measureText(calloutText);
            ctx.fillStyle = 'rgba(26, 26, 34, 0.85)';
            ctx.fillRect(midX - m.width / 2 - 4, midY - 18, m.width + 8, 16);
            ctx.strokeRect(midX - m.width / 2 - 4, midY - 18, m.width + 8, 16);

            ctx.fillStyle = '#a5a4f7';
            ctx.fillText(calloutText, midX - m.width / 2, midY - 6);
          } else if (Math.abs(el.width) > 20 && Math.abs(el.height) > 20) {
            const bx = Math.min(el.x, el.x + el.width);
            const by = Math.min(el.y, el.y + el.height);
            const bw = Math.abs(el.width);
            const bh = Math.abs(el.height);

            // Convert measurements into natural numbers rounded to nearest integer grid unit (Fix 1.3)
            const wUnits = Math.max(1, Math.round(bw / 20));
            const hUnits = Math.max(1, Math.round(bh / 20));

            const dimText = `${wUnits} × ${hUnits}`;
            const m = ctx.measureText(dimText);
            ctx.fillStyle = 'rgba(26, 26, 34, 0.85)';
            ctx.fillRect(bx + bw / 2 - m.width / 2 - 4, by + bh + 6, m.width + 8, 16);
            ctx.strokeRect(bx + bw / 2 - m.width / 2 - 4, by + bh + 6, m.width + 8, 16);

            ctx.fillStyle = '#a5a4f7';
            ctx.fillText(dimText, bx + bw / 2 - m.width / 2, by + bh + 18);
          }
          ctx.restore();
        }

        ctx.restore();
      }

      // Feature 1: Dynamic Angle Detection & Snapping Engine Visual Protractor Feedback (Fix 1.2)
      if (activeAngleSnap) {
        const { startX, startY, currentX, currentY, angleDeg, isSnapped } = activeAngleSnap;
        const rad = ((angleDeg * Math.PI) / 180);
        const arcRadius = 40 / transform.zoom;

        ctx.save();
        // Dashed horizontal baseline (0° axis)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1 / transform.zoom;
        ctx.setLineDash([4 / transform.zoom, 4 / transform.zoom]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + arcRadius * 1.6, startY);
        ctx.stroke();

        // Protractor Arc drawn CCW from horizontal baseline
        ctx.beginPath();
        ctx.arc(startX, startY, arcRadius, 0, -rad, true);
        ctx.strokeStyle = isSnapped ? '#22c55e' : '#6965db';
        ctx.lineWidth = 2 / transform.zoom;
        ctx.setLineDash([]);
        ctx.stroke();

        // Subtle arc fill
        ctx.fillStyle = isSnapped ? 'rgba(34, 197, 94, 0.18)' : 'rgba(105, 101, 219, 0.14)';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.arc(startX, startY, arcRadius, 0, -rad, true);
        ctx.closePath();
        ctx.fill();

        // Floating Angle Text Label Badge in center of arc
        const badgeAngle = -rad / 2;
        const badgeX = startX + (arcRadius + 20 / transform.zoom) * Math.cos(badgeAngle);
        const badgeY = startY + (arcRadius + 20 / transform.zoom) * Math.sin(badgeAngle);

        const angleText = `${angleDeg.toFixed(1)}°${isSnapped ? ' (Snapped)' : ''}`;
        ctx.font = `bold ${Math.max(11, 12 / transform.zoom)}px monospace`;
        const textMetrics = ctx.measureText(angleText);

        ctx.fillStyle = isSnapped ? '#14532d' : '#232238';
        ctx.strokeStyle = isSnapped ? '#22c55e' : '#6965db';
        ctx.lineWidth = 1 / transform.zoom;
        ctx.fillRect(
          badgeX - textMetrics.width / 2 - 4 / transform.zoom,
          badgeY - 8 / transform.zoom,
          textMetrics.width + 8 / transform.zoom,
          16 / transform.zoom
        );
        ctx.strokeRect(
          badgeX - textMetrics.width / 2 - 4 / transform.zoom,
          badgeY - 8 / transform.zoom,
          textMetrics.width + 8 / transform.zoom,
          16 / transform.zoom
        );

        ctx.fillStyle = isSnapped ? '#4ade80' : '#d0cfe0';
        ctx.textBaseline = 'middle';
        ctx.fillText(angleText, badgeX - textMetrics.width / 2, badgeY);

        ctx.restore();
      }

      // Feature 2: Smart Geometric Snapping & Alignment Visual Guides
      if (activeGeometricSnap) {
        const { type, refP1, refP2, curP1, curP2 } = activeGeometricSnap;
        ctx.save();
        ctx.strokeStyle = type === 'parallel' ? '#06b6d4' : '#f59e0b';
        ctx.lineWidth = 1.5 / transform.zoom;
        ctx.setLineDash([5 / transform.zoom, 5 / transform.zoom]);

        // Extended guideline along reference line
        const refAngle = Math.atan2(refP2.y - refP1.y, refP2.x - refP1.x);
        const ext = 300 / transform.zoom;
        ctx.beginPath();
        ctx.moveTo(refP1.x - Math.cos(refAngle) * ext, refP1.y - Math.sin(refAngle) * ext);
        ctx.lineTo(refP2.x + Math.cos(refAngle) * ext, refP2.y + Math.sin(refAngle) * ext);
        ctx.stroke();

        // Guide Badge
        const badgeLabel = type === 'parallel' ? '∥ Parallel Snap' : '⊥ Perpendicular Snap';
        const midX = (curP1.x + curP2.x) / 2;
        const midY = (curP1.y + curP2.y) / 2;

        ctx.font = `bold ${Math.max(10, 11 / transform.zoom)}px monospace`;
        const m = ctx.measureText(badgeLabel);
        ctx.fillStyle = 'rgba(20, 20, 26, 0.9)';
        ctx.fillRect(midX - m.width / 2 - 4, midY - 20, m.width + 8, 16);
        ctx.strokeRect(midX - m.width / 2 - 4, midY - 20, m.width + 8, 16);
        ctx.fillStyle = type === 'parallel' ? '#22d3ee' : '#fbbf24';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeLabel, midX - m.width / 2, midY - 12);

        ctx.restore();
      }

      // Feature 4: Electronic Node Auto-Connection (Snapping Terminals) Visual Rings
      if (activeTerminalSnap) {
        const { worldX, worldY, terminalName, componentName } = activeTerminalSnap;
        ctx.save();
        // Pulsing glowing ring
        ctx.beginPath();
        ctx.arc(worldX, worldY, 8 / transform.zoom, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2 / transform.zoom;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(worldX, worldY, 4 / transform.zoom, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();

        // Terminal Badge
        const tag = `Node: ${componentName} [${terminalName}]`;
        ctx.font = `bold ${Math.max(10, 11 / transform.zoom)}px sans-serif`;
        const m = ctx.measureText(tag);
        ctx.fillStyle = 'rgba(15, 30, 20, 0.92)';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1 / transform.zoom;
        ctx.fillRect(worldX + 12 / transform.zoom, worldY - 10 / transform.zoom, m.width + 8, 18 / transform.zoom);
        ctx.strokeRect(worldX + 12 / transform.zoom, worldY - 10 / transform.zoom, m.width + 8, 18 / transform.zoom);

        ctx.fillStyle = '#4ade80';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, worldX + 16 / transform.zoom, worldY - 1 / transform.zoom);

        ctx.restore();
      }

      // Selection bounding box & 8 transform handles
      const selectedElements = elements.filter((e) => selectedIds.includes(e.id) && !e.isDeleted);
      if (selectedElements.length > 0 && !textEditing) {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const el of selectedElements) {
          const b = getBoundingBox(el);
          if (b.minX < minX) minX = b.minX;
          if (b.minY < minY) minY = b.minY;
          if (b.maxX > maxX) maxX = b.maxX;
          if (b.maxY > maxY) maxY = b.maxY;
        }

        const pad = 6;
        const boxX = minX - pad;
        const boxY = minY - pad;
        const boxW = maxX - minX + pad * 2;
        const boxH = maxY - minY + pad * 2;

        ctx.save();
        ctx.strokeStyle = '#6965db';
        ctx.lineWidth = 1.5 / transform.zoom;
        ctx.setLineDash([4 / transform.zoom, 4 / transform.zoom]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Draw 8 handles
        const handleSize = 8 / transform.zoom;
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6965db';
        ctx.lineWidth = 1.5 / transform.zoom;

        const handles = [
          { type: 'nw', x: boxX, y: boxY },
          { type: 'n', x: boxX + boxW / 2, y: boxY },
          { type: 'ne', x: boxX + boxW, y: boxY },
          { type: 'e', x: boxX + boxW, y: boxY + boxH / 2 },
          { type: 'se', x: boxX + boxW, y: boxY + boxH },
          { type: 's', x: boxX + boxW / 2, y: boxY + boxH },
          { type: 'sw', x: boxX, y: boxY + boxH },
          { type: 'w', x: boxX, y: boxY + boxH / 2 },
        ];

        for (const h of handles) {
          ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        }

        ctx.restore();
      }

      // Marquee box selection rectangle
      if (dragMode === 'box_selecting' && boxSelectCurrent) {
        const minX = Math.min(dragStart.x, boxSelectCurrent.x);
        const maxX = Math.max(dragStart.x, boxSelectCurrent.x);
        const minY = Math.min(dragStart.y, boxSelectCurrent.y);
        const maxY = Math.max(dragStart.y, boxSelectCurrent.y);

        ctx.save();
        ctx.fillStyle = 'rgba(105, 101, 219, 0.1)';
        ctx.strokeStyle = '#6965db';
        ctx.lineWidth = 1 / transform.zoom;
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      }

      ctx.restore();
    };

    render();
    return () => cancelAnimationFrame(animFrameId);
  }, [
    elements,
    selectedIds,
    transform,
    preferences,
    textEditing,
    dragMode,
    boxSelectCurrent,
    dragStart,
    activeAngleSnap,
    activeGeometricSnap,
    activeTerminalSnap,
    screenToWorld,
  ]);

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Finish ongoing text editing if clicked outside
    if (textEditing) {
      finishTextEditing();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const worldPt = screenToWorld(clientX, clientY);

    setDragStart(worldPt);
    setIsInteracting(true);

    // Pan with middle click or spacebar
    if (e.button === 1 || spacePressed || activeTool === 'hand') {
      setDragMode('panning');
      return;
    }

    // Eraser Tool
    if (activeTool === 'eraser') {
      const hit = elements.find((el) => !el.isDeleted && hitTestElement(el, worldPt.x, worldPt.y));
      if (hit) {
        const next = elements.map((el) => (el.id === hit.id ? { ...el, isDeleted: true } : el));
        setElements(next);
        pushHistory(next);
      }
      setDragMode('none');
      return;
    }

    // Text Tool -> smoothly create new text element at click point
    if (activeTool === 'text') {
      const newId = `elem_${Date.now()}`;
      setTextEditing({
        id: newId,
        x: worldPt.x,
        y: worldPt.y,
        text: '',
        fontSize: defaultFontSize,
        fontFamily: defaultFontFamily,
        color: defaultStrokeColor,
      });
      return;
    }

    // Selection tool -> check resize handles first, then hit-test elements
    if (activeTool === 'selection') {
      const selected = elements.filter((el) => selectedIds.includes(el.id) && !el.isDeleted);
      if (selected.length > 0) {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const el of selected) {
          const b = getBoundingBox(el);
          if (b.minX < minX) minX = b.minX;
          if (b.minY < minY) minY = b.minY;
          if (b.maxX > maxX) maxX = b.maxX;
          if (b.maxY > maxY) maxY = b.maxY;
        }
        const pad = 6;
        const boxX = minX - pad;
        const boxY = minY - pad;
        const boxW = maxX - minX + pad * 2;
        const boxH = maxY - minY + pad * 2;
        const tol = 12 / transform.zoom;

        const handlePositions: { type: TransformHandle; x: number; y: number }[] = [
          { type: 'nw', x: boxX, y: boxY },
          { type: 'n', x: boxX + boxW / 2, y: boxY },
          { type: 'ne', x: boxX + boxW, y: boxY },
          { type: 'e', x: boxX + boxW, y: boxY + boxH / 2 },
          { type: 'se', x: boxX + boxW, y: boxY + boxH },
          { type: 's', x: boxX + boxW / 2, y: boxY + boxH },
          { type: 'sw', x: boxX, y: boxY + boxH },
          { type: 'w', x: boxX, y: boxY + boxH / 2 },
        ];

        for (const h of handlePositions) {
          if (Math.abs(worldPt.x - h.x) <= tol && Math.abs(worldPt.y - h.y) <= tol) {
            setActiveHandle(h.type);
            setDragMode('resizing');
            return;
          }
        }
      }

      // Hit-test elements (reverse order: top-most first)
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (!el.isDeleted && hitTestElement(el, worldPt.x, worldPt.y)) {
          if (e.shiftKey) {
            setSelectedIds((prev) =>
              prev.includes(el.id) ? prev.filter((id) => id !== el.id) : [...prev, el.id]
            );
          } else if (!selectedIds.includes(el.id)) {
            setSelectedIds([el.id]);
          }
          setDragMode('moving');
          return;
        }
      }

      // Clicked on empty canvas -> Marquee box selection
      if (!e.shiftKey) {
        setSelectedIds([]);
      }
      setDragMode('box_selecting');
      setBoxSelectCurrent(worldPt);
      return;
    }

    // New shape creation (rectangle, diamond, ellipse, arrow, line, freedraw, frame)
    let initialStartX = worldPt.x;
    let initialStartY = worldPt.y;
    let startBinding: any = undefined;

    // Feature 4: Check if starting line/arrow on an electronic terminal
    if (activeTool === 'line' || activeTool === 'arrow') {
      const nearTerm = findNearestTerminal(elements, worldPt.x, worldPt.y, 16);
      if (nearTerm) {
        initialStartX = nearTerm.worldX;
        initialStartY = nearTerm.worldY;
        startBinding = {
          elementId: nearTerm.element.id,
          terminalId: nearTerm.terminal.id,
        };
      }
    }

    const newId = `elem_${Date.now()}`;
    const newElement: ExcalidrawElement = {
      id: newId,
      type: activeTool,
      x: initialStartX,
      y: initialStartY,
      width: 0,
      height: 0,
      angle: 0,
      strokeColor: defaultStrokeColor,
      backgroundColor: defaultBackgroundColor,
      fillStyle: defaultFillStyle,
      strokeWidth: defaultStrokeWidth,
      strokeStyle: defaultStrokeStyle,
      roughness: defaultRoughness,
      opacity: defaultOpacity,
      points: activeTool === 'freedraw' ? [{ x: 0, y: 0 }] : [{ x: 0, y: 0 }, { x: 0, y: 0 }],
      fontFamily: defaultFontFamily,
      fontSize: defaultFontSize,
      textAlign: defaultTextAlign,
      seed: Math.floor(Math.random() * 100000),
      startBinding,
      frameTitle: activeTool === 'frame' ? `Slide ${elements.filter((e) => e.type === 'frame').length + 1}` : undefined,
      frameIndex: activeTool === 'frame' ? elements.filter((e) => e.type === 'frame').length + 1 : undefined,
    };

    setDragStart({ x: initialStartX, y: initialStartY });
    setElements((prev) => [...prev, newElement]);
    setActiveElementId(newId);
    setDragMode('drawing');
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    let worldPt = screenToWorld(clientX, clientY);

    // Pan viewport
    if (dragMode === 'panning') {
      setTransform((prev) => ({
        ...prev,
        panX: prev.panX + e.movementX,
        panY: prev.panY + e.movementY,
      }));
      return;
    }

    // Eraser on hover/drag
    if (activeTool === 'eraser' && isInteracting) {
      const hit = elements.find((el) => !el.isDeleted && hitTestElement(el, worldPt.x, worldPt.y));
      if (hit) {
        setElements((prev) =>
          prev.map((el) => (el.id === hit.id ? { ...el, isDeleted: true } : el))
        );
      }
      return;
    }

    // Marquee box selection
    if (dragMode === 'box_selecting') {
      setBoxSelectCurrent(worldPt);
      const minX = Math.min(dragStart.x, worldPt.x);
      const maxX = Math.max(dragStart.x, worldPt.x);
      const minY = Math.min(dragStart.y, worldPt.y);
      const maxY = Math.max(dragStart.y, worldPt.y);

      const insideIds = elements
        .filter((el) => {
          if (el.isDeleted) return false;
          const b = getBoundingBox(el);
          if (preferences.selectMode === 'wrap') {
            return b.minX >= minX && b.maxX <= maxX && b.minY >= minY && b.maxY <= maxY;
          } else {
            return b.maxX >= minX && b.minX <= maxX && b.maxY >= minY && b.minY <= maxY;
          }
        })
        .map((el) => el.id);

      setSelectedIds(insideIds);
      return;
    }

    // Move selected elements (with auto wire/terminal binding updates)
    if (dragMode === 'moving') {
      const dx = worldPt.x - dragStart.x;
      const dy = worldPt.y - dragStart.y;

      setElements((prev) => {
        let updated = prev.map((el) => {
          if (selectedIds.includes(el.id)) {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
            };
          }
          return el;
        });

        // Feature 4: Update bound lines when engineering components are moved
        for (const sid of selectedIds) {
          const el = prev.find((e) => e.id === sid);
          if (el && el.type === 'engineering') {
            updated = updateBoundLines(updated, sid, dx, dy);
          }
        }
        return updated;
      });

      setDragStart(worldPt);
      return;
    }

    // Drawing new elements
    if (dragMode === 'drawing' && activeElementId) {
      let finalPt = { ...worldPt };
      let angleFeedback: any = null;
      let geometricFeedback: any = null;
      let terminalFeedback: any = null;

      // Lines & Arrows Advanced Geometry & Snapping
      if (activeTool === 'line' || activeTool === 'arrow') {
        const dx = finalPt.x - dragStart.x;
        const dy = finalPt.y - dragStart.y;
        const dist = Math.hypot(dx, dy);

        // Feature 4: Check node/terminal snap at cursor
        const nearTerm = findNearestTerminal(elements, finalPt.x, finalPt.y, 16);
        if (nearTerm) {
          finalPt.x = nearTerm.worldX;
          finalPt.y = nearTerm.worldY;
          terminalFeedback = {
            terminalName: nearTerm.terminal.name,
            componentName: nearTerm.element.componentLabel || nearTerm.element.engineeringType || 'Component',
            worldX: nearTerm.worldX,
            worldY: nearTerm.worldY,
            elementId: nearTerm.element.id,
            terminalId: nearTerm.terminal.id,
          };
        } else if (dist > 8) {
          // Feature 1: Dynamic Angle Detection & Snapping Engine (Fix 1.2)
          // Calculate CCW angle relative to horizontal baseline
          const ccwRad = Math.atan2(-dy, dx);
          let ccwDeg = ((ccwRad * 180 / Math.PI) + 360) % 360;
          let isSnapped = false;
          let finalDeg = ccwDeg;

          // Check 15° snapping increments (0°, 15°, 30°, 45°, 60°, 90°, etc.)
          if (preferences.angleSnapping || shiftPressed) {
            const snapInterval = 15;
            const nearestMultiple = Math.round(ccwDeg / snapInterval) * snapInterval;
            const diff = Math.abs(ccwDeg - nearestMultiple);
            const tolerance = 3.2; // 3° snapping tolerance

            if (diff <= tolerance || Math.abs(diff - 360) <= tolerance) {
              finalDeg = (nearestMultiple + 360) % 360;
              const snappedRad = (finalDeg * Math.PI) / 180;
              finalPt.x = dragStart.x + dist * Math.cos(snappedRad);
              finalPt.y = dragStart.y - dist * Math.sin(snappedRad);
              isSnapped = true;
            }
          }

          // Acute angle relative to horizontal baseline (Fix 1.2, e.g. convert 326.4° to 33.6°)
          const acuteDeg = finalDeg > 180 ? 360 - finalDeg : finalDeg;

          angleFeedback = {
            startX: dragStart.x,
            startY: dragStart.y,
            currentX: finalPt.x,
            currentY: finalPt.y,
            angleDeg: acuteDeg,
            isSnapped,
          };

          // Feature 2: Smart Geometric Snapping & Alignment (Parallel & Perpendicular)
          if (preferences.geometricSnapping && !isSnapped) {
            for (const refEl of elements) {
              if (refEl.isDeleted || (refEl.type !== 'line' && refEl.type !== 'arrow') || refEl.id === activeElementId) {
                continue;
              }
              const rp1 = refEl.points[0] ? { x: refEl.x + refEl.points[0].x, y: refEl.y + refEl.points[0].y } : { x: refEl.x, y: refEl.y };
              const rp2 = refEl.points[1] ? { x: refEl.x + refEl.points[1].x, y: refEl.y + refEl.points[1].y } : { x: refEl.x + refEl.width, y: refEl.y + refEl.height };

              const refAngleRad = Math.atan2(-(rp2.y - rp1.y), rp2.x - rp1.x);
              const refDeg = ((refAngleRad * 180) / Math.PI + 360) % 360;

              // Test parallel (0° or 180°)
              const parDiff1 = Math.abs(ccwDeg - refDeg);
              const parDiff2 = Math.abs(ccwDeg - ((refDeg + 180) % 360));
              if (parDiff1 <= 3.5 || parDiff2 <= 3.5) {
                const targetDeg = parDiff1 <= 3.5 ? refDeg : (refDeg + 180) % 360;
                const snapRad = (targetDeg * Math.PI) / 180;
                finalPt.x = dragStart.x + dist * Math.cos(snapRad);
                finalPt.y = dragStart.y - dist * Math.sin(snapRad);
                geometricFeedback = {
                  type: 'parallel',
                  refP1: rp1,
                  refP2: rp2,
                  curP1: dragStart,
                  curP2: finalPt,
                };
                if (angleFeedback) {
                  const acuteTarget = targetDeg > 180 ? 360 - targetDeg : targetDeg;
                  angleFeedback.angleDeg = acuteTarget;
                  angleFeedback.isSnapped = true;
                }
                break;
              }

              // Test perpendicular (90° or 270°)
              const perpDiff1 = Math.abs(ccwDeg - ((refDeg + 90) % 360));
              const perpDiff2 = Math.abs(ccwDeg - ((refDeg + 270) % 360));
              if (perpDiff1 <= 3.5 || perpDiff2 <= 3.5) {
                const targetDeg = perpDiff1 <= 3.5 ? (refDeg + 90) % 360 : (refDeg + 270) % 360;
                const snapRad = (targetDeg * Math.PI) / 180;
                finalPt.x = dragStart.x + dist * Math.cos(snapRad);
                finalPt.y = dragStart.y - dist * Math.sin(snapRad);
                geometricFeedback = {
                  type: 'perpendicular',
                  refP1: rp1,
                  refP2: rp2,
                  curP1: dragStart,
                  curP2: finalPt,
                };
                if (angleFeedback) {
                  const acuteTarget = targetDeg > 180 ? 360 - targetDeg : targetDeg;
                  angleFeedback.angleDeg = acuteTarget;
                  angleFeedback.isSnapped = true;
                }
                break;
              }
            }
          }
        }
      }

      setActiveAngleSnap(angleFeedback);
      setActiveGeometricSnap(geometricFeedback);
      setActiveTerminalSnap(terminalFeedback);

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== activeElementId) return el;
          if (el.type === 'freedraw') {
            return {
              ...el,
              points: [...el.points, { x: finalPt.x - el.x, y: finalPt.y - el.y }],
            };
          }
          if (el.type === 'line' || el.type === 'arrow') {
            return {
              ...el,
              width: finalPt.x - el.x,
              height: finalPt.y - el.y,
              points: [
                { x: 0, y: 0 },
                { x: finalPt.x - el.x, y: finalPt.y - el.y },
              ],
              endBinding: terminalFeedback
                ? { elementId: terminalFeedback.elementId, terminalId: terminalFeedback.terminalId }
                : undefined,
            };
          }
          return {
            ...el,
            width: finalPt.x - el.x,
            height: finalPt.y - el.y,
          };
        })
      );
      return;
    }

    // Resizing selected elements via handles
    if (dragMode === 'resizing' && activeHandle && selectedIds.length > 0) {
      const dx = worldPt.x - dragStart.x;
      const dy = worldPt.y - dragStart.y;

      setElements((prev) =>
        prev.map((el) => {
          if (!selectedIds.includes(el.id)) return el;
          let { x, y, width, height } = el;

          switch (activeHandle) {
            case 'se':
              width += dx;
              height += dy;
              break;
            case 's':
              height += dy;
              break;
            case 'e':
              width += dx;
              break;
            case 'nw':
              x += dx;
              y += dy;
              width -= dx;
              height -= dy;
              break;
            case 'n':
              y += dy;
              height -= dy;
              break;
            case 'w':
              x += dx;
              width -= dx;
              break;
            case 'ne':
              y += dy;
              width += dx;
              height -= dy;
              break;
            case 'sw':
              x += dx;
              width -= dx;
              height += dy;
              break;
          }

          return { ...el, x, y, width, height };
        })
      );
      setDragStart(worldPt);
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    setActiveAngleSnap(null);
    setActiveGeometricSnap(null);
    setActiveTerminalSnap(null);

    if (dragMode === 'drawing' && activeElementId) {
      const drawnElem = elements.find((e) => e.id === activeElementId);
      if (drawnElem) {
        // If it was just a tiny click without drag, remove it
        if (
          Math.abs(drawnElem.width) < 4 &&
          Math.abs(drawnElem.height) < 4 &&
          drawnElem.points.length <= 2 &&
          drawnElem.type !== 'text'
        ) {
          setElements((prev) => prev.filter((e) => e.id !== activeElementId));
        } else {
          // Feature 2.2: Freehand Gesture & Shape Recognition on mouseup / touchend
          let currentElements = elements;
          if (drawnElem.type === 'freedraw' && drawnElem.points && drawnElem.points.length >= 7) {
            const recognized = recognizeShapeFromPoints(drawnElem.points, drawnElem.x, drawnElem.y);
            if (recognized) {
              const convertedElem: ExcalidrawElement = {
                ...drawnElem,
                type: recognized.type,
                x: recognized.x,
                y: recognized.y,
                width: recognized.width,
                height: recognized.height,
                points:
                  recognized.points ||
                  (recognized.type === 'line'
                    ? [
                        { x: 0, y: 0 },
                        { x: recognized.width, y: recognized.height },
                      ]
                    : []),
              };
              currentElements = elements.map((el) =>
                el.id === activeElementId ? convertedElem : el
              );
              setElements(currentElements);
              if (onShapeRecognized) {
                onShapeRecognized(recognized.label);
              }
            }
          }

          setSelectedIds([activeElementId]);
          pushHistory(currentElements);
          if (!toolLock) {
            setActiveTool('selection');
          }
        }
      }
    } else if (dragMode === 'moving' || dragMode === 'resizing') {
      pushHistory(elements);
    }

    setDragMode('none');
    setIsInteracting(false);
    setActiveHandle(null);
    setBoxSelectCurrent(null);
  };

  // Wheel Zoom & Pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(0.1, transform.zoom * zoomFactor), 5.0);

      const newPanX = mouseX - (mouseX - transform.panX) * (newZoom / transform.zoom);
      const newPanY = mouseY - (mouseY - transform.panY) * (newZoom / transform.zoom);

      setTransform({
        panX: newPanX,
        panY: newPanY,
        zoom: newZoom,
      });
    } else {
      setTransform((prev) => ({
        ...prev,
        panX: prev.panX - e.deltaX,
        panY: prev.panY - e.deltaY,
      }));
    }
  };

  // Double click on element to edit text smoothly
  const handleDoubleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldPt = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

    const hit = elements.find((el) => !el.isDeleted && hitTestElement(el, worldPt.x, worldPt.y));
    if (hit) {
      if (hit.type === 'text') {
        setTextEditing({
          id: hit.id,
          x: hit.x,
          y: hit.y,
          text: hit.text || '',
          fontSize: hit.fontSize || 20,
          fontFamily: hit.fontFamily || 'excalifont',
          color: hit.strokeColor,
        });
      } else if (hit.type === 'frame') {
        const nextTitle = prompt('Rename Slide Frame:', hit.frameTitle || '');
        if (nextTitle !== null) {
          setElements((prev) =>
            prev.map((el) => (el.id === hit.id ? { ...el, frameTitle: nextTitle.trim() || el.frameTitle } : el))
          );
        }
      }
    }
  };

  // Dynamic Cursor
  const getCursor = () => {
    if (spacePressed || activeTool === 'hand' || dragMode === 'panning') return 'grab';
    if (activeTool === 'eraser') return 'crosshair';
    if (activeTool === 'text') return 'text';
    if (activeTool === 'selection') return dragMode === 'moving' ? 'move' : 'default';
    return 'crosshair';
  };

  // Compute live auto-expanding width and height for inline text editing
  const textLines = textEditing ? textEditing.text.split('\n') : [''];
  const maxLineLen = Math.max(...textLines.map((l) => l.length), 1);
  const dynTextWidth = Math.max(160, Math.ceil(maxLineLen * (textEditing?.fontSize || 20) * 0.75 + 40));
  const dynTextHeight = Math.max(48, Math.ceil(textLines.length * (textEditing?.fontSize || 20) * 1.4 + 28));

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: getCursor() }}
        className="w-full h-full block touch-none"
      />

      {/* Floating Smooth Textarea for inline text editing */}
      {textEditing && (
        <div
          style={{
            position: 'absolute',
            left: `${worldToScreen(textEditing.x, textEditing.y).x}px`,
            top: `${worldToScreen(textEditing.x, textEditing.y).y}px`,
            width: `${dynTextWidth * transform.zoom}px`,
            minHeight: `${dynTextHeight * transform.zoom}px`,
            zIndex: 60,
          }}
          className="pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            value={textEditing.text}
            onChange={(e) => {
              const val = e.target.value;
              setTextEditing((prev) => (prev ? { ...prev, text: val } : null));
            }}
            onBlur={finishTextEditing}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                finishTextEditing();
              } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                finishTextEditing();
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              fontSize: `${textEditing.fontSize * transform.zoom}px`,
              fontFamily: getFontFamilyCss(textEditing.fontFamily),
              color: textEditing.color,
              lineHeight: 1.35,
              caretColor: '#6965db',
            }}
            className="w-full bg-[#1e1e26]/90 border-2 border-dashed border-[#6965db] p-2 rounded-xl outline-none resize-none shadow-2xl backdrop-blur-md overflow-hidden"
            placeholder="Type text... (Shift+Enter for newline, Ctrl+Enter to save)"
          />
          <div className="text-[10px] font-mono text-[#8a899c] mt-1 px-1 flex items-center justify-between">
            <span>Esc or Ctrl+Enter to confirm</span>
            <span>{textEditing.fontSize}px</span>
          </div>
        </div>
      )}
    </div>
  );
};
