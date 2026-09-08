//! Hand-drawn procedural sketch math module in 100% Rust (Rough.js equivalent).
//!
//! Generates jittered Bézier curves, multi-stroke sketchy lines, hatching fills,
//! sketchy rectangles, ellipses, diamonds, and arrows natively using seedable PRNG.

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use web_sys::CanvasRenderingContext2d;

/// Simple PRNG helper for deterministic jitter based on element seed
pub struct SketchRng {
    rng: StdRng,
}

impl SketchRng {
    pub fn new(seed: u32) -> Self {
        Self {
            rng: StdRng::seed_from_u64(seed as u64),
        }
    }

    /// Return an offset value centered at 0 with amplitude proportional to roughness
    pub fn jitter(&mut self, roughness: f32) -> f64 {
        if roughness <= 0.001 {
            return 0.0;
        }
        let r: f64 = self.rng.gen_range(-1.0..1.0);
        r * (roughness as f64) * 2.2
    }
}

/// Draws a sketchy multi-pass line between two points with Bézier curvature and jitter
pub fn draw_sketchy_line(
    ctx: &CanvasRenderingContext2d,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    roughness: f32,
    seed: u32,
) {
    if roughness <= 0.01 {
        let _ = ctx.begin_path();
        ctx.move_to(x1, y1);
        ctx.line_to(x2, y2);
        let _ = ctx.stroke();
        return;
    }

    let mut rng = SketchRng::new(seed);
    let passes = if roughness > 1.8 { 2 } else { 2 };

    for pass in 0..passes {
        let pass_seed_offset = pass as f64 * 100.0;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let length = (dx * dx + dy * dy).sqrt();
        if length < 0.5 {
            continue;
        }

        // Two control points for cubic Bézier with natural bowing
        let t1 = 0.33;
        let t2 = 0.66;

        let cp1_x = x1 + dx * t1 + rng.jitter(roughness);
        let cp1_y = y1 + dy * t1 + rng.jitter(roughness);
        let cp2_x = x1 + dx * t2 + rng.jitter(roughness);
        let cp2_y = y1 + dy * t2 + rng.jitter(roughness);

        let start_x = x1 + rng.jitter(roughness * 0.5);
        let start_y = y1 + rng.jitter(roughness * 0.5);
        let end_x = x2 + rng.jitter(roughness * 0.5);
        let end_y = y2 + rng.jitter(roughness * 0.5);

        let _ = ctx.begin_path();
        ctx.move_to(start_x, start_y);
        ctx.bezier_curve_to(cp1_x, cp1_y, cp2_x, cp2_y, end_x, end_y);
        let _ = ctx.stroke();
    }
}

/// Draws a hand-drawn rectangle mimicking Rough.js with double-stroked jittered edges
pub fn draw_sketchy_rect(
    ctx: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    roughness: f32,
    seed: u32,
) {
    let x1 = x.min(x + w);
    let x2 = x.max(x + w);
    let y1 = y.min(y + h);
    let y2 = y.max(y + h);

    // Top
    draw_sketchy_line(ctx, x1, y1, x2, y1, roughness, seed);
    // Right
    draw_sketchy_line(ctx, x2, y1, x2, y2, roughness, seed.wrapping_add(1));
    // Bottom
    draw_sketchy_line(ctx, x2, y2, x1, y2, roughness, seed.wrapping_add(2));
    // Left
    draw_sketchy_line(ctx, x1, y2, x1, y1, roughness, seed.wrapping_add(3));
}

/// Draws a sketchy diamond (rhombus)
pub fn draw_sketchy_diamond(
    ctx: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    roughness: f32,
    seed: u32,
) {
    let cx = x + w / 2.0;
    let cy = y + h / 2.0;
    let top = (cx, y);
    let right = (x + w, cy);
    let bottom = (cx, y + h);
    let left = (x, cy);

    draw_sketchy_line(ctx, top.0, top.1, right.0, right.1, roughness, seed);
    draw_sketchy_line(ctx, right.0, right.1, bottom.0, bottom.1, roughness, seed.wrapping_add(1));
    draw_sketchy_line(ctx, bottom.0, bottom.1, left.0, left.1, roughness, seed.wrapping_add(2));
    draw_sketchy_line(ctx, left.0, left.1, top.0, top.1, roughness, seed.wrapping_add(3));
}

/// Draws a hand-drawn ellipse using multi-point jittered splines
pub fn draw_sketchy_ellipse(
    ctx: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    roughness: f32,
    seed: u32,
) {
    let rx = (w / 2.0).abs();
    let ry = (h / 2.0).abs();
    let cx = x + w / 2.0;
    let cy = y + h / 2.0;

    if roughness <= 0.01 {
        let _ = ctx.begin_path();
        let _ = ctx.ellipse(cx, cy, rx, ry, 0.0, 0.0, std::f64::consts::TAU);
        let _ = ctx.stroke();
        return;
    }

    let mut rng = SketchRng::new(seed);
    let num_points = 16;

    for pass in 0..2 {
        let _ = ctx.begin_path();
        let mut first_pt = (0.0, 0.0);

        for i in 0..=num_points {
            let angle = (i as f64 / num_points as f64) * std::f64::consts::TAU;
            let jx = rng.jitter(roughness);
            let jy = rng.jitter(roughness);
            let px = cx + (rx + jx) * angle.cos();
            let py = cy + (ry + jy) * angle.sin();

            if i == 0 {
                first_pt = (px, py);
                ctx.move_to(px, py);
            } else {
                ctx.line_to(px, py);
            }
        }
        ctx.line_to(first_pt.0, first_pt.1);
        let _ = ctx.stroke();
    }
}

/// Draws a hand-drawn arrow with dynamic sketchy arrowhead
pub fn draw_sketchy_arrow(
    ctx: &CanvasRenderingContext2d,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    roughness: f32,
    seed: u32,
) {
    // Shaft
    draw_sketchy_line(ctx, x1, y1, x2, y2, roughness, seed);

    // Arrowhead calculations
    let dx = x2 - x1;
    let dy = y2 - y1;
    let angle = dy.atan2(dx);
    let head_len = 16.0;
    let head_angle = std::f64::consts::FRAC_PI_6; // 30 degrees

    let h1_x = x2 - head_len * (angle - head_angle).cos();
    let h1_y = y2 - head_len * (angle - head_angle).sin();
    let h2_x = x2 - head_len * (angle + head_angle).cos();
    let h2_y = y2 - head_len * (angle + head_angle).sin();

    draw_sketchy_line(ctx, x2, y2, h1_x, h1_y, roughness, seed.wrapping_add(10));
    draw_sketchy_line(ctx, x2, y2, h2_x, h2_y, roughness, seed.wrapping_add(20));
}

/// Draws procedural hatching lines inside a rectangular bounding box
pub fn draw_hatching(
    ctx: &CanvasRenderingContext2d,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
    color: &str,
    gap: f64,
    roughness: f32,
    seed: u32,
) {
    ctx.save();
    let _ = ctx.begin_path();
    let _ = ctx.rect(x, y, w, h);
    let _ = ctx.clip();

    ctx.set_stroke_style(&wasm_bindgen::JsValue::from_str(color));
    let mut current_seed = seed;
    let diagonal = (w * w + h * h).sqrt();
    let mut pos = -diagonal;

    while pos < diagonal * 2.0 {
        draw_sketchy_line(
            ctx,
            x + pos,
            y,
            x + pos + diagonal,
            y + diagonal,
            roughness * 0.7,
            current_seed,
        );
        pos += gap;
        current_seed = current_seed.wrapping_add(7);
    }

    ctx.restore();
}
