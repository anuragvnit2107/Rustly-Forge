import { ExcalidrawElement, FillStyle, FontFamily, Point } from './types';

// Seedable PRNG (Mulberry32) for reproducible sketchy curves
export class SketchRng {
  private s: number;

  constructor(seed: number) {
    this.s = seed | 0;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  jitter(roughness: number): number {
    if (roughness <= 0.01) return 0;
    return (this.next() * 2 - 1) * roughness * 2.2;
  }
}

/**
 * Draws a hand-drawn sketchy multi-pass line between two points.
 */
export function drawSketchyLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number,
  seed: number,
  strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  if (roughness <= 0.01) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length < 0.5) return;

  const rng = new SketchRng(seed);
  const passes = roughness > 1.8 ? 2 : 2;

  for (let p = 0; p < passes; p++) {
    const cp1x = x1 + dx * 0.33 + rng.jitter(roughness);
    const cp1y = y1 + dy * 0.33 + rng.jitter(roughness);
    const cp2x = x1 + dx * 0.66 + rng.jitter(roughness);
    const cp2y = y1 + dy * 0.66 + rng.jitter(roughness);

    const sx = x1 + rng.jitter(roughness * 0.4);
    const sy = y1 + rng.jitter(roughness * 0.4);
    const ex = x2 + rng.jitter(roughness * 0.4);
    const ey = y2 + rng.jitter(roughness * 0.4);

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.stroke();
  }
}

/**
 * Draws a hand-drawn sketchy rectangle with slight curve offsets mimicking Rough.js
 */
export function drawSketchyRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number,
  seed: number,
  strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  const x1 = Math.min(x, x + w);
  const x2 = Math.max(x, x + w);
  const y1 = Math.min(y, y + h);
  const y2 = Math.max(y, y + h);

  // 4 sides with slight corner overshooting
  drawSketchyLine(ctx, x1, y1, x2, y1, roughness, seed, strokeStyle);
  drawSketchyLine(ctx, x2, y1, x2, y2, roughness, seed + 1, strokeStyle);
  drawSketchyLine(ctx, x2, y2, x1, y2, roughness, seed + 2, strokeStyle);
  drawSketchyLine(ctx, x1, y2, x1, y1, roughness, seed + 3, strokeStyle);
}

/**
 * Draws a sketchy diamond (rhombus)
 */
export function drawSketchyDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number,
  seed: number,
  strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const top = { x: cx, y };
  const right = { x: x + w, y: cy };
  const bottom = { x: cx, y: y + h };
  const left = { x, y: cy };

  drawSketchyLine(ctx, top.x, top.y, right.x, right.y, roughness, seed, strokeStyle);
  drawSketchyLine(ctx, right.x, right.y, bottom.x, bottom.y, roughness, seed + 1, strokeStyle);
  drawSketchyLine(ctx, bottom.x, bottom.y, left.x, left.y, roughness, seed + 2, strokeStyle);
  drawSketchyLine(ctx, left.x, left.y, top.x, top.y, roughness, seed + 3, strokeStyle);
}

/**
 * Draws a hand-drawn sketchy ellipse
 */
export function drawSketchyEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  roughness: number,
  seed: number
) {
  const rx = Math.abs(w / 2);
  const ry = Math.abs(h / 2);
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (roughness <= 0.01) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const rng = new SketchRng(seed);
  const pointsCount = 18;

  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    let firstX = 0;
    let firstY = 0;

    for (let i = 0; i <= pointsCount; i++) {
      const angle = (i / pointsCount) * Math.PI * 2;
      const jx = rng.jitter(roughness);
      const jy = rng.jitter(roughness);
      const px = cx + (rx + jx) * Math.cos(angle);
      const py = cy + (ry + jy) * Math.sin(angle);

      if (i === 0) {
        firstX = px;
        firstY = py;
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.lineTo(firstX, firstY);
    ctx.stroke();
  }
}

/**
 * Draws a sketchy arrow with dynamic arrowhead
 */
export function drawSketchyArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  roughness: number,
  seed: number
) {
  // Main stem
  drawSketchyLine(ctx, x1, y1, x2, y2, roughness, seed);

  // Arrowhead
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const headLen = 16;
  const headAngle = Math.PI / 6;

  const h1x = x2 - headLen * Math.cos(angle - headAngle);
  const h1y = y2 - headLen * Math.sin(angle - headAngle);
  const h2x = x2 - headLen * Math.cos(angle + headAngle);
  const h2y = y2 - headLen * Math.sin(angle + headAngle);

  drawSketchyLine(ctx, x2, y2, h1x, h1y, roughness, seed + 10);
  drawSketchyLine(ctx, x2, y2, h2x, h2y, roughness, seed + 20);
}

/**
 * Draws procedural hatching fills (single or cross-hatch)
 */
export function drawHatching(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  fillStyle: FillStyle,
  roughness: number,
  seed: number,
  clipPathFn?: (ctx: CanvasRenderingContext2D) => void
) {
  if (fillStyle === 'transparent' || !fillColor || fillColor === 'transparent') return;

  ctx.save();
  ctx.beginPath();
  if (clipPathFn) {
    clipPathFn(ctx);
    ctx.clip();
  } else {
    ctx.rect(x, y, w, h);
    ctx.clip();
  }

  if (fillStyle === 'solid') {
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = fillColor;
  ctx.lineWidth = 1.2;

  const gap = 10;
  const diag = Math.hypot(w, h);
  let curSeed = seed;

  // Primary diagonal hatch
  for (let pos = -diag; pos < diag * 2; pos += gap) {
    drawSketchyLine(
      ctx,
      x + pos,
      y,
      x + pos + diag,
      y + diag,
      roughness * 0.7,
      curSeed
    );
    curSeed += 3;
  }

  // Secondary cross-hatch if requested
  if (fillStyle === 'cross-hatch') {
    for (let pos = -diag; pos < diag * 2; pos += gap) {
      drawSketchyLine(
        ctx,
        x + pos + diag,
        y,
        x + pos,
        y + diag,
        roughness * 0.7,
        curSeed
      );
      curSeed += 5;
    }
  }

  ctx.restore();
}

/**
 * Clips exact vector geometry path prior to hatching or filling
 */
export function clipElementGeometry(ctx: CanvasRenderingContext2D, el: ExcalidrawElement) {
  ctx.beginPath();
  switch (el.type) {
    case 'rectangle':
      ctx.rect(el.x, el.y, el.width, el.height);
      break;
    case 'diamond': {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.moveTo(cx, el.y);
      ctx.lineTo(el.x + el.width, cy);
      ctx.lineTo(cx, el.y + el.height);
      ctx.lineTo(el.x, cy);
      ctx.closePath();
      break;
    }
    case 'ellipse': {
      const rx = Math.abs(el.width / 2);
      const ry = Math.abs(el.height / 2);
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      break;
    }
    case 'triangle':
    case 'triangle_isosceles': {
      ctx.moveTo(el.x + el.width / 2, el.y);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.lineTo(el.x, el.y + el.height);
      ctx.closePath();
      break;
    }
    case 'triangle_right': {
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x, el.y + el.height);
      ctx.lineTo(el.x + el.width, el.y + el.height);
      ctx.closePath();
      break;
    }
    case 'polygon': {
      const sides = el.polygonSides || 6;
      const rx = Math.abs(el.width / 2);
      const ry = Math.abs(el.height / 2);
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = cx + rx * Math.cos(a);
        const py = cy + ry * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case 'freedraw': {
      if (el.points.length > 2) {
        ctx.moveTo(el.x + el.points[0].x, el.y + el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.x + el.points[i].x, el.y + el.points[i].y);
        }
        ctx.closePath();
      } else {
        ctx.rect(el.x, el.y, el.width, el.height);
      }
      break;
    }
    default:
      ctx.rect(el.x, el.y, el.width, el.height);
      break;
  }
}

/**
 * Draws element hatching using EXACT vector geometry as a clipping path
 */
export function drawElementHatching(
  ctx: CanvasRenderingContext2D,
  el: ExcalidrawElement
) {
  if (el.fillStyle === 'transparent' || !el.backgroundColor || el.backgroundColor === 'transparent') return;

  ctx.save();
  clipElementGeometry(ctx, el);
  ctx.clip();

  if (el.fillStyle === 'solid') {
    ctx.fillStyle = el.backgroundColor;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = el.backgroundColor;
  ctx.lineWidth = 1.2;

  const minX = Math.min(el.x, el.x + el.width);
  const minY = Math.min(el.y, el.y + el.height);
  const w = Math.abs(el.width);
  const h = Math.abs(el.height);
  const gap = 10;
  const diag = Math.hypot(w, h);
  let curSeed = el.seed;

  // Primary diagonal hatch lines
  for (let pos = -diag; pos < diag * 2; pos += gap) {
    drawSketchyLine(
      ctx,
      minX + pos,
      minY,
      minX + pos + diag,
      minY + diag,
      el.roughness * 0.7,
      curSeed
    );
    curSeed += 3;
  }

  // Secondary cross-hatch if requested
  if (el.fillStyle === 'cross-hatch') {
    for (let pos = -diag; pos < diag * 2; pos += gap) {
      drawSketchyLine(
        ctx,
        minX + pos + diag,
        minY,
        minX + pos,
        minY + diag,
        el.roughness * 0.7,
        curSeed
      );
      curSeed += 5;
    }
  }

  ctx.restore();
}

/**
 * Draws sketchy triangles (equilateral, right-angled, isosceles)
 */
export function drawSketchyTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: 'equilateral' | 'right' | 'isosceles' = 'equilateral',
  roughness: number,
  seed: number,
  strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  let p1: Point, p2: Point, p3: Point;
  if (variant === 'right') {
    p1 = { x, y };
    p2 = { x, y: y + h };
    p3 = { x: x + w, y: y + h };
  } else {
    // Equilateral or Isosceles apex at center top
    p1 = { x: x + w / 2, y };
    p2 = { x: x + w, y: y + h };
    p3 = { x, y: y + h };
  }
  drawSketchyLine(ctx, p1.x, p1.y, p2.x, p2.y, roughness, seed, strokeStyle);
  drawSketchyLine(ctx, p2.x, p2.y, p3.x, p3.y, roughness, seed + 1, strokeStyle);
  drawSketchyLine(ctx, p3.x, p3.y, p1.x, p1.y, roughness, seed + 2, strokeStyle);
}

/**
 * Draws sketchy regular polygon (Pentagon, Hexagon, Octagon, etc.)
 */
export function drawSketchyPolygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sides: number = 6,
  roughness: number,
  seed: number,
  strokeStyle: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  const numSides = Math.max(3, sides || 6);
  const rx = Math.abs(w / 2);
  const ry = Math.abs(h / 2);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const pts: Point[] = [];

  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2 - Math.PI / 2;
    pts.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    });
  }

  for (let i = 0; i < numSides; i++) {
    const nextIdx = (i + 1) % numSides;
    drawSketchyLine(
      ctx,
      pts[i].x,
      pts[i].y,
      pts[nextIdx].x,
      pts[nextIdx].y,
      roughness,
      seed + i,
      strokeStyle
    );
  }
}

/**
 * Resolves CSS font string for the 4 fonts requested in Screenshot 4
 */
export function getFontFamilyCss(family: FontFamily = 'excalifont'): string {
  switch (family) {
    case 'excalifont':
      return "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive";
    case 'comic-shanns':
      return "'Comic Neue', 'Comic Sans MS', cursive";
    case 'lilita-one':
      return "'Lilita One', cursive, sans-serif";
    case 'nunito':
      return "'Nunito', sans-serif";
    default:
      return "'Caveat', cursive";
  }
}

/**
 * Calculates element bounding box (minX, minY, maxX, maxY)
 */
export function getBoundingBox(element: ExcalidrawElement): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (element.type === 'freedraw' || element.type === 'line' || element.type === 'arrow') {
    if (element.points.length === 0) {
      const minX = Math.min(element.x, element.x + element.width);
      const maxX = Math.max(element.x, element.x + element.width);
      const minY = Math.min(element.y, element.y + element.height);
      const maxY = Math.max(element.y, element.y + element.height);
      return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of element.points) {
      const gx = element.x + p.x;
      const gy = element.y + p.y;
      if (gx < minX) minX = gx;
      if (gx > maxX) maxX = gx;
      if (gy < minY) minY = gy;
      if (gy > maxY) maxY = gy;
    }
    const pad = element.strokeWidth * 2;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  if (element.type === 'text' && element.text) {
    const lines = element.text.split('\n');
    const fontSize = element.fontSize || 20;
    let maxLen = 1;
    for (const l of lines) {
      if (l.length > maxLen) maxLen = l.length;
    }
    const computedW = Math.max(element.width || 40, maxLen * fontSize * 0.65 + 16);
    const computedH = Math.max(element.height || 24, lines.length * fontSize * 1.35 + 8);
    const minX = element.x;
    const maxX = element.x + computedW;
    const minY = element.y;
    const maxY = element.y + computedH;
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Point-to-line-segment distance
 */
export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Hit test an element with tolerance
 */
export function hitTestElement(
  elem: ExcalidrawElement,
  px: number,
  py: number,
  threshold = 8
): boolean {
  if (elem.isDeleted) return false;
  const { minX, minY, maxX, maxY } = getBoundingBox(elem);
  const tol = threshold + elem.strokeWidth;

  if (px < minX - tol || px > maxX + tol || py < minY - tol || py > maxY + tol) {
    return false;
  }

  if (elem.type === 'freedraw') {
    for (let i = 0; i < elem.points.length - 1; i++) {
      const p1 = elem.points[i];
      const p2 = elem.points[i + 1];
      if (
        distanceToSegment(
          px,
          py,
          elem.x + p1.x,
          elem.y + p1.y,
          elem.x + p2.x,
          elem.y + p2.y
        ) <= tol
      ) {
        return true;
      }
    }
    return false;
  }

  if (elem.type === 'line' || elem.type === 'arrow') {
    if (elem.points.length >= 2) {
      const p1 = elem.points[0];
      const p2 = elem.points[1];
      return (
        distanceToSegment(
          px,
          py,
          elem.x + p1.x,
          elem.y + p1.y,
          elem.x + p2.x,
          elem.y + p2.y
        ) <= tol
      );
    }
    return (
      distanceToSegment(
        px,
        py,
        elem.x,
        elem.y,
        elem.x + elem.width,
        elem.y + elem.height
      ) <= tol
    );
  }

  if (
    elem.backgroundColor !== 'transparent' ||
    elem.type === 'text' ||
    elem.type === 'image' ||
    elem.type === 'engineering'
  ) {
    return px >= minX && px <= maxX && py >= minY && py <= maxY;
  }

  // Triangle outline hit test
  if (elem.type === 'triangle' || elem.type === 'triangle_right' || elem.type === 'triangle_isosceles') {
    let p1: Point, p2: Point, p3: Point;
    if (elem.type === 'triangle_right') {
      p1 = { x: elem.x, y: elem.y };
      p2 = { x: elem.x, y: elem.y + elem.height };
      p3 = { x: elem.x + elem.width, y: elem.y + elem.height };
    } else {
      p1 = { x: elem.x + elem.width / 2, y: elem.y };
      p2 = { x: elem.x + elem.width, y: elem.y + elem.height };
      p3 = { x: elem.x, y: elem.y + elem.height };
    }
    return (
      distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y) <= tol ||
      distanceToSegment(px, py, p2.x, p2.y, p3.x, p3.y) <= tol ||
      distanceToSegment(px, py, p3.x, p3.y, p1.x, p1.y) <= tol
    );
  }

  // Frame boundary hit-test
  if (elem.type === 'frame') {
    const edgeTol = 10;
    const nearLeft = Math.abs(px - minX) <= edgeTol && py >= minY && py <= maxY;
    const nearRight = Math.abs(px - maxX) <= edgeTol && py >= minY && py <= maxY;
    const nearTop = Math.abs(py - minY) <= edgeTol && px >= minX && px <= maxX;
    const nearBottom = Math.abs(py - maxY) <= edgeTol && px >= minX && px <= maxX;
    // Also title bar at top
    const inTitle = px >= minX && px <= minX + 160 && py >= minY - 24 && py <= minY;
    return nearLeft || nearRight || nearTop || nearBottom || inTitle;
  }

  // Stroke outline hit test
  const leftDist = Math.abs(px - minX);
  const rightDist = Math.abs(px - maxX);
  const topDist = Math.abs(py - minY);
  const bottomDist = Math.abs(py - maxY);

  const nearVert = (leftDist <= tol || rightDist <= tol) && py >= minY - tol && py <= maxY + tol;
  const nearHoriz = (topDist <= tol || bottomDist <= tol) && px >= minX - tol && px <= maxX + tol;

  return nearVert || nearHoriz;
}
