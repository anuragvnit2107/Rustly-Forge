export type ElementType =
  | 'selection'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'triangle'
  | 'triangle_right'
  | 'triangle_isosceles'
  | 'polygon'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'image'
  | 'eraser'
  | 'frame'
  | 'engineering';

export type EngineeringComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'diode'
  | 'ground'
  | 'dc_source'
  | 'ac_source'
  | 'and_gate'
  | 'or_gate'
  | 'not_gate'
  | 'nand_gate'
  | 'xor_gate'
  | 'op_amp';

export interface Terminal {
  id: string;
  name: string;
  x: number; // offset relative to element x
  y: number; // offset relative to element y
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

export interface TerminalBinding {
  elementId: string;
  terminalId: string;
}

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FillStyle = 'transparent' | 'solid' | 'hachure' | 'cross-hatch';

export type FontFamily = 'excalifont' | 'comic-shanns' | 'lilita-one' | 'nunito';

export interface Point {
  x: f64Number;
  y: f64Number;
}

type f64Number = number;

export interface RustlyForgeElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // in radians
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number; // 0 (architect), 1 (artist), 2.5 (cartoonist)
  opacity: number; // 0 to 1
  points: Point[]; // For line, arrow, freedraw
  text?: string;
  fontFamily?: FontFamily;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  imageDataUrl?: string;
  seed: number;
  isDeleted?: boolean;

  // Engineering & Schematic attributes
  engineeringType?: EngineeringComponentType;
  componentLabel?: string;
  terminals?: Terminal[];
  startBinding?: TerminalBinding;
  endBinding?: TerminalBinding;

  // Presentation Frame attributes
  frameTitle?: string;
  frameIndex?: number;

  // Basic Shapes attributes
  polygonSides?: number; // default 5 or 6 for regular polygon
}

/** Backwards-compatibility alias */
export type ExcalidrawElement = RustlyForgeElement;

export type TransformHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotation';

export interface ViewportTransform {
  panX: number;
  panY: number;
  zoom: number;
}

export interface CanvasPreferences {
  selectMode: 'wrap' | 'overlap';
  toolLock: boolean;
  snapToObjects: boolean;
  toggleGrid: boolean;
  zenMode: boolean;
  viewMode: boolean;
  arrowBinding: boolean;
  snapToMidpoints: boolean;
  theme: 'dark' | 'light' | 'system';
  canvasBackground: string;

  // Advanced Educational & Engineering Suite
  angleSnapping: boolean; // Dynamic angle snapping (15° multiples)
  geometricSnapping: boolean; // Smart parallel & perpendicular snapping
  showDimensions: boolean; // Real-time dimension & measurement callouts
}

