import {
  ExcalidrawElement,
  EngineeringComponentType,
  Terminal,
  TerminalBinding,
  Point,
} from './types';
import { drawSketchyLine, drawSketchyRect, drawSketchyEllipse } from './sketchEngine';

export interface EngineeringComponentDef {
  type: EngineeringComponentType;
  name: string;
  category: 'Passives' | 'Sources' | 'Semiconductors' | 'Logic Gates' | 'ICs';
  defaultWidth: number;
  defaultHeight: number;
  defaultLabel: string;
  description: string;
  getTerminals: (width: number, height: number) => Terminal[];
}

export const ENGINEERING_COMPONENTS: EngineeringComponentDef[] = [
  {
    type: 'resistor',
    name: 'Resistor',
    category: 'Passives',
    defaultWidth: 100,
    defaultHeight: 40,
    defaultLabel: 'R 10kΩ',
    description: 'IEEE Standard zigzag fixed resistor with axial terminals',
    getTerminals: (w, h) => [
      { id: 'term_1', name: 'Pin 1', x: 0, y: h / 2, direction: 'left' },
      { id: 'term_2', name: 'Pin 2', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'capacitor',
    name: 'Capacitor',
    category: 'Passives',
    defaultWidth: 80,
    defaultHeight: 50,
    defaultLabel: 'C 100μF',
    description: 'Parallel plate capacitor with symmetric leads',
    getTerminals: (w, h) => [
      { id: 'term_1', name: 'Anode (+)', x: 0, y: h / 2, direction: 'left' },
      { id: 'term_2', name: 'Cathode (-)', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'inductor',
    name: 'Inductor',
    category: 'Passives',
    defaultWidth: 110,
    defaultHeight: 45,
    defaultLabel: 'L 10mH',
    description: '4-turn coiled wire choke inductor',
    getTerminals: (w, h) => [
      { id: 'term_1', name: 'Pin 1', x: 0, y: h / 2, direction: 'left' },
      { id: 'term_2', name: 'Pin 2', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'diode',
    name: 'Diode',
    category: 'Semiconductors',
    defaultWidth: 90,
    defaultHeight: 45,
    defaultLabel: 'D 1N4148',
    description: 'PN-junction diode with triangular anode and cathode barrier',
    getTerminals: (w, h) => [
      { id: 'anode', name: 'Anode (+)', x: 0, y: h / 2, direction: 'left' },
      { id: 'cathode', name: 'Cathode (-)', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'ground',
    name: 'Earth Ground',
    category: 'Sources',
    defaultWidth: 50,
    defaultHeight: 60,
    defaultLabel: 'GND',
    description: '0V chassis/earth reference with 3-tier decreasing horizontal bars',
    getTerminals: (w, h) => [
      { id: 'gnd_in', name: 'Ground Node', x: w / 2, y: 0, direction: 'top' },
    ],
  },
  {
    type: 'dc_source',
    name: 'DC Voltage Source',
    category: 'Sources',
    defaultWidth: 70,
    defaultHeight: 80,
    defaultLabel: 'VDC 5V',
    description: 'DC electrochemical cell / battery with positive and negative plates',
    getTerminals: (w, h) => [
      { id: 'pos', name: 'Positive (+)', x: w / 2, y: 0, direction: 'top' },
      { id: 'neg', name: 'Negative (-)', x: w / 2, y: h, direction: 'bottom' },
    ],
  },
  {
    type: 'ac_source',
    name: 'AC Voltage Source',
    category: 'Sources',
    defaultWidth: 70,
    defaultHeight: 90,
    defaultLabel: 'VAC 120V',
    description: 'Sinusoidal alternating voltage generator',
    getTerminals: (w, h) => [
      { id: 'line', name: 'Line', x: w / 2, y: 0, direction: 'top' },
      { id: 'neutral', name: 'Neutral', x: w / 2, y: h, direction: 'bottom' },
    ],
  },
  {
    type: 'and_gate',
    name: 'AND Gate',
    category: 'Logic Gates',
    defaultWidth: 100,
    defaultHeight: 65,
    defaultLabel: 'AND 7408',
    description: 'Dual input logic AND gate (Y = A · B)',
    getTerminals: (w, h) => [
      { id: 'in_a', name: 'Input A', x: 0, y: h * 0.28, direction: 'left' },
      { id: 'in_b', name: 'Input B', x: 0, y: h * 0.72, direction: 'left' },
      { id: 'out_y', name: 'Output Y', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'or_gate',
    name: 'OR Gate',
    category: 'Logic Gates',
    defaultWidth: 100,
    defaultHeight: 65,
    defaultLabel: 'OR 7432',
    description: 'Dual input logic OR gate (Y = A + B)',
    getTerminals: (w, h) => [
      { id: 'in_a', name: 'Input A', x: 4, y: h * 0.28, direction: 'left' },
      { id: 'in_b', name: 'Input B', x: 4, y: h * 0.72, direction: 'left' },
      { id: 'out_y', name: 'Output Y', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'not_gate',
    name: 'NOT Inverter',
    category: 'Logic Gates',
    defaultWidth: 85,
    defaultHeight: 50,
    defaultLabel: 'NOT 7404',
    description: 'Single input inverter gate with negation bubble (Y = ¬A)',
    getTerminals: (w, h) => [
      { id: 'in_a', name: 'Input A', x: 0, y: h / 2, direction: 'left' },
      { id: 'out_y', name: 'Output Y', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'nand_gate',
    name: 'NAND Gate',
    category: 'Logic Gates',
    defaultWidth: 105,
    defaultHeight: 65,
    defaultLabel: 'NAND 7400',
    description: 'Dual input NAND gate with bubble (Y = ¬(A · B))',
    getTerminals: (w, h) => [
      { id: 'in_a', name: 'Input A', x: 0, y: h * 0.28, direction: 'left' },
      { id: 'in_b', name: 'Input B', x: 0, y: h * 0.72, direction: 'left' },
      { id: 'out_y', name: 'Output Y', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'xor_gate',
    name: 'XOR Gate',
    category: 'Logic Gates',
    defaultWidth: 105,
    defaultHeight: 65,
    defaultLabel: 'XOR 7486',
    description: 'Exclusive-OR gate with double curved input (Y = A ⊕ B)',
    getTerminals: (w, h) => [
      { id: 'in_a', name: 'Input A', x: 0, y: h * 0.28, direction: 'left' },
      { id: 'in_b', name: 'Input B', x: 0, y: h * 0.72, direction: 'left' },
      { id: 'out_y', name: 'Output Y', x: w, y: h / 2, direction: 'right' },
    ],
  },
  {
    type: 'op_amp',
    name: 'Op-Amp',
    category: 'ICs',
    defaultWidth: 120,
    defaultHeight: 80,
    defaultLabel: 'LM741',
    description: 'Operational Amplifier with inverting (-), non-inverting (+), and output',
    getTerminals: (w, h) => [
      { id: 'inv', name: 'Inverting (-)', x: 0, y: h * 0.3, direction: 'left' },
      { id: 'noninv', name: 'Non-Inverting (+)', x: 0, y: h * 0.7, direction: 'left' },
      { id: 'out', name: 'Output', x: w, y: h * 0.5, direction: 'right' },
      { id: 'v_pos', name: 'V+ Supply', x: w * 0.45, y: 0, direction: 'top' },
      { id: 'v_neg', name: 'V- Supply', x: w * 0.45, y: h, direction: 'bottom' },
    ],
  },
];

export function getComponentDef(type: EngineeringComponentType): EngineeringComponentDef {
  const found = ENGINEERING_COMPONENTS.find((c) => c.type === type);
  return found || ENGINEERING_COMPONENTS[0];
}

export function createEngineeringElement(
  type: EngineeringComponentType,
  x: number,
  y: number,
  options?: Partial<ExcalidrawElement>
): ExcalidrawElement {
  const def = getComponentDef(type);
  const w = options?.width || def.defaultWidth;
  const h = options?.height || def.defaultHeight;
  const terminals = def.getTerminals(w, h);

  return {
    id: `eng_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: 'engineering',
    engineeringType: type,
    componentLabel: options?.componentLabel || def.defaultLabel,
    x,
    y,
    width: w,
    height: h,
    angle: 0,
    strokeColor: options?.strokeColor || '#ced4da',
    backgroundColor: options?.backgroundColor || 'transparent',
    fillStyle: options?.fillStyle || 'transparent',
    strokeWidth: options?.strokeWidth || 2,
    strokeStyle: options?.strokeStyle || 'solid',
    roughness: options?.roughness !== undefined ? options?.roughness : 0.8,
    opacity: options?.opacity !== undefined ? options?.opacity : 1,
    points: [],
    seed: Math.floor(Math.random() * 100000),
    terminals,
    ...options,
  };
}

/**
 * Get world-coordinate terminals for an engineering component
 */
export function getComponentWorldTerminals(
  element: ExcalidrawElement
): { id: string; name: string; worldX: number; worldY: number; direction?: string }[] {
  if (element.type !== 'engineering' || !element.engineeringType) return [];
  const def = getComponentDef(element.engineeringType);
  const localTerms = element.terminals || def.getTerminals(element.width, element.height);

  return localTerms.map((t) => ({
    id: t.id,
    name: t.name,
    worldX: element.x + t.x,
    worldY: element.y + t.y,
    direction: t.direction,
  }));
}

/**
 * Find nearest terminal among all canvas engineering components within threshold
 */
export function findNearestTerminal(
  elements: ExcalidrawElement[],
  x: number,
  y: number,
  threshold = 16
): {
  element: ExcalidrawElement;
  terminal: Terminal;
  worldX: number;
  worldY: number;
  distance: number;
} | null {
  let nearest: {
    element: ExcalidrawElement;
    terminal: Terminal;
    worldX: number;
    worldY: number;
    distance: number;
  } | null = null;
  let minDist = threshold;

  for (const el of elements) {
    if (el.isDeleted || el.type !== 'engineering' || !el.engineeringType) continue;
    const worldTerms = getComponentWorldTerminals(el);
    for (const wt of worldTerms) {
      const dist = Math.hypot(x - wt.worldX, y - wt.worldY);
      if (dist < minDist) {
        minDist = dist;
        nearest = {
          element: el,
          terminal: { id: wt.id, name: wt.name, x: wt.worldX - el.x, y: wt.worldY - el.y },
          worldX: wt.worldX,
          worldY: wt.worldY,
          distance: dist,
        };
      }
    }
  }

  return nearest;
}

/**
 * Draw an Engineering Schematic Symbol with sketch lines and terminal pads
 */
export function drawEngineeringComponent(
  ctx: CanvasRenderingContext2D,
  element: ExcalidrawElement,
  themeDark: boolean
) {
  const { x, y, width: w, height: h, roughness, seed, strokeColor } = element;
  const engType = element.engineeringType || 'resistor';
  const label = element.componentLabel;

  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = element.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cy = y + h / 2;
  const cx = x + w / 2;

  switch (engType) {
    case 'resistor': {
      // Left lead
      const leadLen = 22;
      drawSketchyLine(ctx, x, cy, x + leadLen, cy, roughness, seed);
      // Right lead
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 1);

      // Zigzag
      const bodyStart = x + leadLen;
      const bodyEnd = x + w - leadLen;
      const bodyWidth = bodyEnd - bodyStart;
      const peaks = 6;
      const segWidth = bodyWidth / peaks;
      const amp = h * 0.38;

      let prevX = bodyStart;
      let prevY = cy;
      for (let i = 1; i <= peaks; i++) {
        const nextX = bodyStart + i * segWidth;
        const nextY = i === peaks ? cy : cy + (i % 2 === 1 ? -amp : amp);
        drawSketchyLine(ctx, prevX, prevY, nextX, nextY, roughness, seed + i * 2);
        prevX = nextX;
        prevY = nextY;
      }
      break;
    }

    case 'capacitor': {
      const leadLen = 28;
      const plateGap = 14;
      const plateH = h * 0.75;
      // Left lead
      drawSketchyLine(ctx, x, cy, cx - plateGap / 2, cy, roughness, seed);
      // Left plate
      drawSketchyLine(
        ctx,
        cx - plateGap / 2,
        cy - plateH / 2,
        cx - plateGap / 2,
        cy + plateH / 2,
        roughness,
        seed + 2
      );
      // Right plate
      drawSketchyLine(
        ctx,
        cx + plateGap / 2,
        cy - plateH / 2,
        cx + plateGap / 2,
        cy + plateH / 2,
        roughness,
        seed + 3
      );
      // Right lead
      drawSketchyLine(ctx, cx + plateGap / 2, cy, x + w, cy, roughness, seed + 4);
      break;
    }

    case 'inductor': {
      const leadLen = 20;
      drawSketchyLine(ctx, x, cy, x + leadLen, cy, roughness, seed);
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 1);

      // 4 circular coils
      const coils = 4;
      const bodyWidth = w - leadLen * 2;
      const coilR = bodyWidth / (coils * 2);
      let currentX = x + leadLen;

      for (let i = 0; i < coils; i++) {
        const coilCenterX = currentX + coilR;
        ctx.beginPath();
        ctx.arc(coilCenterX, cy, coilR, Math.PI, 0, false);
        ctx.stroke();
        currentX += coilR * 2;
      }
      break;
    }

    case 'diode': {
      const leadLen = 22;
      drawSketchyLine(ctx, x, cy, x + leadLen, cy, roughness, seed);
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 1);

      const triLeft = x + leadLen;
      const triRight = x + w - leadLen;
      const triH = h * 0.65;

      // Triangle
      drawSketchyLine(ctx, triLeft, cy - triH / 2, triLeft, cy + triH / 2, roughness, seed + 2);
      drawSketchyLine(ctx, triLeft, cy - triH / 2, triRight, cy, roughness, seed + 3);
      drawSketchyLine(ctx, triLeft, cy + triH / 2, triRight, cy, roughness, seed + 4);

      // Cathode bar
      drawSketchyLine(ctx, triRight, cy - triH / 2, triRight, cy + triH / 2, roughness, seed + 5);
      break;
    }

    case 'ground': {
      // Top vertical lead
      drawSketchyLine(ctx, cx, y, cx, y + 25, roughness, seed);
      // 3 descending horizontal lines
      const barY = y + 25;
      drawSketchyLine(ctx, cx - 18, barY, cx + 18, barY, roughness, seed + 1);
      drawSketchyLine(ctx, cx - 11, barY + 7, cx + 11, barY + 7, roughness, seed + 2);
      drawSketchyLine(ctx, cx - 5, barY + 14, cx + 5, barY + 14, roughness, seed + 3);
      break;
    }

    case 'dc_source': {
      const plateHLong = 32;
      const plateHShort = 16;
      const gap = 10;
      // Top lead
      drawSketchyLine(ctx, cx, y, cx, cy - gap / 2, roughness, seed);
      // Top long plate (+)
      drawSketchyLine(ctx, cx - plateHLong / 2, cy - gap / 2, cx + plateHLong / 2, cy - gap / 2, roughness, seed + 1);
      // Bottom short plate (-)
      ctx.lineWidth = element.strokeWidth * 1.8;
      drawSketchyLine(ctx, cx - plateHShort / 2, cy + gap / 2, cx + plateHShort / 2, cy + gap / 2, roughness, seed + 2);
      ctx.lineWidth = element.strokeWidth;
      // Bottom lead
      drawSketchyLine(ctx, cx, cy + gap / 2, cx, y + h, roughness, seed + 3);

      // '+' and '-' labels
      ctx.font = '14px excalifont, sans-serif';
      ctx.fillText('+', cx + 18, cy - gap / 2 + 5);
      ctx.fillText('−', cx + 14, cy + gap / 2 + 5);
      break;
    }

    case 'ac_source': {
      const r = Math.min(w, h) * 0.32;
      // Leads
      drawSketchyLine(ctx, cx, y, cx, cy - r, roughness, seed);
      drawSketchyLine(ctx, cx, cy + r, cx, y + h, roughness, seed + 1);
      // Circle
      drawSketchyEllipse(ctx, cx - r, cy - r, r * 2, r * 2, roughness, seed + 2);
      // Sine wave inside
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy);
      ctx.bezierCurveTo(
        cx - r * 0.3,
        cy - r * 0.5,
        cx - r * 0.1,
        cy - r * 0.5,
        cx,
        cy
      );
      ctx.bezierCurveTo(
        cx + r * 0.1,
        cy + r * 0.5,
        cx + r * 0.3,
        cy + r * 0.5,
        cx + r * 0.6,
        cy
      );
      ctx.stroke();
      break;
    }

    case 'and_gate': {
      const leadLen = 18;
      // Inputs
      drawSketchyLine(ctx, x, y + h * 0.28, x + leadLen, y + h * 0.28, roughness, seed);
      drawSketchyLine(ctx, x, y + h * 0.72, x + leadLen, y + h * 0.72, roughness, seed + 1);
      // Output
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 2);

      const gx = x + leadLen;
      const gw = w - leadLen * 2;
      // Flat back
      drawSketchyLine(ctx, gx, y + 6, gx, y + h - 6, roughness, seed + 3);
      // Top and bottom straight lines
      drawSketchyLine(ctx, gx, y + 6, gx + gw * 0.45, y + 6, roughness, seed + 4);
      drawSketchyLine(ctx, gx, y + h - 6, gx + gw * 0.45, y + h - 6, roughness, seed + 5);
      // Semicircle arc
      ctx.beginPath();
      ctx.arc(gx + gw * 0.45, cy, (h - 12) / 2, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
      break;
    }

    case 'or_gate': {
      const leadLen = 18;
      drawSketchyLine(ctx, x, y + h * 0.28, x + leadLen + 4, y + h * 0.28, roughness, seed);
      drawSketchyLine(ctx, x, y + h * 0.72, x + leadLen + 4, y + h * 0.72, roughness, seed + 1);
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 2);

      const gx = x + leadLen;
      const tipX = x + w - leadLen;

      // Curved back
      ctx.beginPath();
      ctx.moveTo(gx, y + 6);
      ctx.quadraticCurveTo(gx + 12, cy, gx, y + h - 6);
      ctx.stroke();

      // Top curve to tip
      ctx.beginPath();
      ctx.moveTo(gx, y + 6);
      ctx.quadraticCurveTo(gx + (tipX - gx) * 0.6, y + 6, tipX, cy);
      ctx.stroke();

      // Bottom curve to tip
      ctx.beginPath();
      ctx.moveTo(gx, y + h - 6);
      ctx.quadraticCurveTo(gx + (tipX - gx) * 0.6, y + h - 6, tipX, cy);
      ctx.stroke();
      break;
    }

    case 'not_gate': {
      const leadLen = 18;
      const bubbleR = 4;
      drawSketchyLine(ctx, x, cy, x + leadLen, cy, roughness, seed);
      drawSketchyLine(ctx, x + w - leadLen + bubbleR * 2, cy, x + w, cy, roughness, seed + 1);

      const tx = x + leadLen;
      const tipX = x + w - leadLen;
      // Triangle
      drawSketchyLine(ctx, tx, cy - (h - 16) / 2, tx, cy + (h - 16) / 2, roughness, seed + 2);
      drawSketchyLine(ctx, tx, cy - (h - 16) / 2, tipX, cy, roughness, seed + 3);
      drawSketchyLine(ctx, tx, cy + (h - 16) / 2, tipX, cy, roughness, seed + 4);

      // Negation bubble
      ctx.beginPath();
      ctx.arc(tipX + bubbleR, cy, bubbleR, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'nand_gate': {
      const leadLen = 18;
      const bubbleR = 4;
      drawSketchyLine(ctx, x, y + h * 0.28, x + leadLen, y + h * 0.28, roughness, seed);
      drawSketchyLine(ctx, x, y + h * 0.72, x + leadLen, y + h * 0.72, roughness, seed + 1);
      drawSketchyLine(ctx, x + w - leadLen + bubbleR * 2, cy, x + w, cy, roughness, seed + 2);

      const gx = x + leadLen;
      const gw = w - leadLen * 2 - bubbleR * 2;
      drawSketchyLine(ctx, gx, y + 6, gx, y + h - 6, roughness, seed + 3);
      drawSketchyLine(ctx, gx, y + 6, gx + gw * 0.45, y + 6, roughness, seed + 4);
      drawSketchyLine(ctx, gx, y + h - 6, gx + gw * 0.45, y + h - 6, roughness, seed + 5);
      ctx.beginPath();
      ctx.arc(gx + gw * 0.45, cy, (h - 12) / 2, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();

      // Bubble
      ctx.beginPath();
      ctx.arc(gx + gw * 0.45 + (h - 12) / 2 + bubbleR, cy, bubbleR, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'xor_gate': {
      const leadLen = 18;
      drawSketchyLine(ctx, x, y + h * 0.28, x + leadLen, y + h * 0.28, roughness, seed);
      drawSketchyLine(ctx, x, y + h * 0.72, x + leadLen, y + h * 0.72, roughness, seed + 1);
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 2);

      const gx = x + leadLen;
      const tipX = x + w - leadLen;

      // Extra input arc for XOR
      ctx.beginPath();
      ctx.moveTo(gx - 6, y + 6);
      ctx.quadraticCurveTo(gx + 6, cy, gx - 6, y + h - 6);
      ctx.stroke();

      // Inner body arc
      ctx.beginPath();
      ctx.moveTo(gx, y + 6);
      ctx.quadraticCurveTo(gx + 12, cy, gx, y + h - 6);
      ctx.stroke();

      // Top curve to tip
      ctx.beginPath();
      ctx.moveTo(gx, y + 6);
      ctx.quadraticCurveTo(gx + (tipX - gx) * 0.6, y + 6, tipX, cy);
      ctx.stroke();

      // Bottom curve to tip
      ctx.beginPath();
      ctx.moveTo(gx, y + h - 6);
      ctx.quadraticCurveTo(gx + (tipX - gx) * 0.6, y + h - 6, tipX, cy);
      ctx.stroke();
      break;
    }

    case 'op_amp': {
      const leadLen = 20;
      // Inverting (-) and Non-inverting (+)
      drawSketchyLine(ctx, x, y + h * 0.3, x + leadLen, y + h * 0.3, roughness, seed);
      drawSketchyLine(ctx, x, y + h * 0.7, x + leadLen, y + h * 0.7, roughness, seed + 1);
      // Output
      drawSketchyLine(ctx, x + w - leadLen, cy, x + w, cy, roughness, seed + 2);

      const tx = x + leadLen;
      const tipX = x + w - leadLen;
      // Triangle body
      drawSketchyLine(ctx, tx, y + 8, tx, y + h - 8, roughness, seed + 3);
      drawSketchyLine(ctx, tx, y + 8, tipX, cy, roughness, seed + 4);
      drawSketchyLine(ctx, tx, y + h - 8, tipX, cy, roughness, seed + 5);

      // Minus and Plus signs inside
      ctx.font = '16px excalifont, sans-serif';
      ctx.fillText('−', tx + 8, y + h * 0.35);
      ctx.fillText('+', tx + 7, y + h * 0.73);
      break;
    }
  }

  // Draw Terminal connection pads (small subtle circles)
  const terminals = getComponentWorldTerminals(element);
  for (const t of terminals) {
    ctx.beginPath();
    ctx.arc(t.worldX, t.worldY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = themeDark ? '#9797a8' : '#6965db';
    ctx.fill();
  }

  // Draw Component Label
  if (label) {
    ctx.font = '13px excalifont, Comic Neue, sans-serif';
    ctx.fillStyle = themeDark ? '#ced4da' : '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, y - 6);
  }

  ctx.restore();
}

/**
 * Update bound lines/arrows when an engineering element moves
 */
export function updateBoundLines(
  elements: ExcalidrawElement[],
  movedElementId: string,
  dx: number,
  dy: number
): ExcalidrawElement[] {
  if (dx === 0 && dy === 0) return elements;

  const movedElem = elements.find((e) => e.id === movedElementId);
  if (!movedElem) return elements;

  const worldTerms = getComponentWorldTerminals(movedElem);
  const termMap = new Map<string, { x: number; y: number }>();
  for (const wt of worldTerms) {
    termMap.set(wt.id, { x: wt.worldX, y: wt.worldY });
  }

  return elements.map((el) => {
    if (el.isDeleted || (el.type !== 'line' && el.type !== 'arrow')) return el;

    let modified = false;
    let points = [...el.points];
    let newX = el.x;
    let newY = el.y;

    if (el.startBinding && el.startBinding.elementId === movedElementId) {
      const termPos = termMap.get(el.startBinding.terminalId);
      if (termPos) {
        if (points.length >= 2) {
          // Absolute start position moves, but relative offset points need recalculation
          const curStartX = el.x + points[0].x;
          const curStartY = el.y + points[0].y;
          const deltaX = termPos.x - curStartX;
          const deltaY = termPos.y - curStartY;
          newX += deltaX;
          newY += deltaY;
          // Keep second point fixed in world space by compensating
          points[1] = { x: points[1].x - deltaX, y: points[1].y - deltaY };
          modified = true;
        } else {
          newX = termPos.x;
          newY = termPos.y;
          modified = true;
        }
      }
    }

    if (el.endBinding && el.endBinding.elementId === movedElementId) {
      const termPos = termMap.get(el.endBinding.terminalId);
      if (termPos) {
        if (points.length >= 2) {
          points[1] = { x: termPos.x - newX, y: termPos.y - newY };
          modified = true;
        } else {
          points = [{ x: 0, y: 0 }, { x: termPos.x - newX, y: termPos.y - newY }];
          modified = true;
        }
      }
    }

    if (modified) {
      return {
        ...el,
        x: newX,
        y: newY,
        width: points.length >= 2 ? points[1].x : el.width,
        height: points.length >= 2 ? points[1].y : el.height,
        points,
      };
    }
    return el;
  });
}
