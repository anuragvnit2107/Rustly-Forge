import { ElementType, Point } from './types';

export interface RecognizedShape {
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: Point[];
  label: string;
}

// Distance helper
function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

// Perpendicular distance from point p to line segment (p1, p2)
function pointToSegmentDist(p: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(p, p1);
  const t = Math.max(0, Math.min(1, ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq));
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  return distance(p, { x: projX, y: projY });
}

// Ramer-Douglas-Peucker polygon simplification
function ramerDouglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = pointToSegmentDist(points[i], points[0], points[end]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
    const right = ramerDouglasPeucker(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
    return [points[0], points[end]];
  }
}

/**
 * Recognizes standard geometric primitives from freehand points:
 * Circle, Ellipse, Rectangle, Square, Parabola, Triangle (Equilateral, Right, Isosceles), Line.
 */
export function recognizeShapeFromPoints(
  rawPoints: Point[],
  originX: number,
  originY: number
): RecognizedShape | null {
  if (rawPoints.length < 7) return null;

  // Transform points to world coordinates
  const pts: Point[] = rawPoints.map((p) => ({
    x: originX + p.x,
    y: originY + p.y,
  }));

  // Compute bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (width < 18 && height < 18) return null;

  const startPt = pts[0];
  const endPt = pts[pts.length - 1];
  const closingDist = distance(startPt, endPt);
  const diag = Math.hypot(width, height);
  const isClosed = closingDist < Math.max(36, diag * 0.3);

  // Compute total stroke path length
  let pathLength = 0;
  for (let i = 1; i < pts.length; i++) {
    pathLength += distance(pts[i - 1], pts[i]);
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = width / 2;
  const ry = height / 2;

  // -------------------------------------------------------------
  // 1. Check CLOSED SHAPES: Circle, Ellipse, Square, Rectangle, Triangle
  // -------------------------------------------------------------
  if (isClosed && diag > 25) {
    // 1A. Test Circle & Ellipse via normalized radial deviation
    let errorSum = 0;
    for (const p of pts) {
      const normDist = Math.hypot((p.x - cx) / Math.max(1, rx), (p.y - cy) / Math.max(1, ry));
      errorSum += Math.abs(normDist - 1);
    }
    const ellipseError = errorSum / pts.length;

    // Ellipse / Circle perimeter approximation (Ramanujan)
    const hR = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
    const approxPerimeter = Math.PI * (rx + ry) * (1 + (3 * hR) / (10 + Math.sqrt(4 - 3 * hR)));
    const perimeterRatio = pathLength / approxPerimeter;

    if (ellipseError < 0.20 && perimeterRatio > 0.75 && perimeterRatio < 1.4) {
      const aspect = width / height;
      if (aspect >= 0.82 && aspect <= 1.22) {
        // Circle (Square-aspect Ellipse)
        const size = Math.round((width + height) / 2);
        return {
          type: 'ellipse',
          x: Math.round(cx - size / 2),
          y: Math.round(cy - size / 2),
          width: size,
          height: size,
          label: 'Circle',
        };
      } else {
        // Ellipse
        return {
          type: 'ellipse',
          x: Math.round(minX),
          y: Math.round(minY),
          width: Math.round(width),
          height: Math.round(height),
          label: 'Ellipse',
        };
      }
    }

    // 1B. Polygon Simplification to test Triangle or Rectangle / Square
    const epsilon = Math.max(12, diag * 0.07);
    const simplified = ramerDouglasPeucker(pts, epsilon);
    let vertCount = simplified.length;
    // If first and last points are close, merge
    if (distance(simplified[0], simplified[simplified.length - 1]) < epsilon * 1.5) {
      vertCount -= 1;
    }

    // 1C. Test Triangle (3 vertices)
    if (vertCount === 3 || vertCount === 4) {
      // Check if it fits a triangle closely
      const corners = vertCount === 3 ? simplified.slice(0, 3) : simplified.slice(0, 3);
      if (corners.length >= 3) {
        // Find side lengths
        const s1 = distance(corners[0], corners[1]);
        const s2 = distance(corners[1], corners[2]);
        const s3 = distance(corners[2], corners[0]);
        const sides = [s1, s2, s3].sort((a, b) => a - b);

        // Check for right triangle (Pythagorean: a^2 + b^2 ~ c^2)
        const pythDiff = Math.abs(sides[0] * sides[0] + sides[1] * sides[1] - sides[2] * sides[2]);
        const pythRatio = pythDiff / (sides[2] * sides[2]);

        if (pythRatio < 0.22) {
          return {
            type: 'triangle_right',
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            label: 'Right-Angled Triangle',
          };
        }

        // Check for Isosceles (two sides nearly equal)
        const sideDiff1 = Math.abs(s1 - s2) / Math.max(s1, s2);
        const sideDiff2 = Math.abs(s2 - s3) / Math.max(s2, s3);
        const sideDiff3 = Math.abs(s3 - s1) / Math.max(s3, s1);

        if (sideDiff1 < 0.15 || sideDiff2 < 0.15 || sideDiff3 < 0.15) {
          return {
            type: 'triangle_isosceles',
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            label: 'Isosceles Triangle',
          };
        }

        return {
          type: 'triangle',
          x: Math.round(minX),
          y: Math.round(minY),
          width: Math.round(width),
          height: Math.round(height),
          label: 'Triangle',
        };
      }
    }

    // 1D. Test Rectangle / Square
    const rectPerimeter = 2 * (width + height);
    const rectRatio = pathLength / rectPerimeter;

    if (rectRatio > 0.82 && rectRatio < 1.35) {
      // Check points proximity to bounding rectangle edges
      let edgeNearbyCount = 0;
      const tol = Math.max(12, diag * 0.1);
      for (const p of pts) {
        const nearLeft = Math.abs(p.x - minX) < tol;
        const nearRight = Math.abs(p.x - maxX) < tol;
        const nearTop = Math.abs(p.y - minY) < tol;
        const nearBottom = Math.abs(p.y - maxY) < tol;
        if (nearLeft || nearRight || nearTop || nearBottom) {
          edgeNearbyCount++;
        }
      }

      if (edgeNearbyCount / pts.length > 0.75) {
        const aspect = width / height;
        if (aspect >= 0.82 && aspect <= 1.22) {
          const size = Math.round((width + height) / 2);
          return {
            type: 'rectangle',
            x: Math.round(cx - size / 2),
            y: Math.round(cy - size / 2),
            width: size,
            height: size,
            label: 'Square',
          };
        } else {
          return {
            type: 'rectangle',
            x: Math.round(minX),
            y: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            label: 'Rectangle',
          };
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Check OPEN SHAPES: Straight Line, Parabola
  // -------------------------------------------------------------
  if (!isClosed && diag > 20) {
    // 2A. Test Straight Line
    let maxLineDist = 0;
    for (const p of pts) {
      const d = pointToSegmentDist(p, startPt, endPt);
      if (d > maxLineDist) maxLineDist = d;
    }

    if (maxLineDist < Math.max(10, diag * 0.08)) {
      return {
        type: 'line',
        x: Math.round(startPt.x),
        y: Math.round(startPt.y),
        width: Math.round(endPt.x - startPt.x),
        height: Math.round(endPt.y - startPt.y),
        points: [
          { x: 0, y: 0 },
          { x: Math.round(endPt.x - startPt.x), y: Math.round(endPt.y - startPt.y) },
        ],
        label: 'Straight Line',
      };
    }

    // 2B. Test Parabola (U-curve or Arch-curve)
    // A parabola has a single significant turning point with monotonically increasing or decreasing distance
    const midIdx = Math.floor(pts.length / 2);
    const midPt = pts[midIdx];
    const chordMid = {
      x: (startPt.x + endPt.x) / 2,
      y: (startPt.y + endPt.y) / 2,
    };
    const sagitta = distance(midPt, chordMid);

    // If arc sagitta is prominent (sagitta > 20% of chord length)
    const chordLen = distance(startPt, endPt);
    if (sagitta > chordLen * 0.18 && chordLen > 30) {
      // Check that it doesn't cross chord multiple times (single lobe)
      let crossings = 0;
      for (let i = 1; i < pts.length; i++) {
        const dPrev = (pts[i - 1].x - startPt.x) * (endPt.y - startPt.y) - (pts[i - 1].y - startPt.y) * (endPt.x - startPt.x);
        const dCurr = (pts[i].x - startPt.x) * (endPt.y - startPt.y) - (pts[i].y - startPt.y) * (endPt.x - startPt.x);
        if (dPrev * dCurr < 0) crossings++;
      }

      if (crossings <= 1) {
        // Approximate smooth parabola as a quadratic bezier / points
        const controlX = 2 * chordMid.x - (startPt.x + endPt.x) / 2 + (midPt.x - chordMid.x) * 1.5;
        const controlY = 2 * chordMid.y - (startPt.y + endPt.y) / 2 + (midPt.y - chordMid.y) * 1.5;

        const parabolaPoints: Point[] = [];
        const steps = 16;
        for (let t = 0; t <= 1; t += 1 / steps) {
          const inv = 1 - t;
          const px = inv * inv * startPt.x + 2 * inv * t * controlX + t * t * endPt.x;
          const py = inv * inv * startPt.y + 2 * inv * t * controlY + t * t * endPt.y;
          parabolaPoints.push({ x: px - startPt.x, y: py - startPt.y });
        }

        return {
          type: 'freedraw',
          x: Math.round(startPt.x),
          y: Math.round(startPt.y),
          width: Math.round(width),
          height: Math.round(height),
          points: parabolaPoints,
          label: 'Parabola Curve',
        };
      }
    }
  }

  return null;
}
