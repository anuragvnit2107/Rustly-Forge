//! Canvas rendering engine and browser event dispatching loop in Rust.
//!
//! Hooks into `requestAnimationFrame`, manages pan/zoom camera transformations,
//! grid rendering, and coordinates event listeners for mouse/touch interactions.

use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, MouseEvent, WheelEvent};

use crate::canvas::sketch::*;
use crate::model::element::*;

pub struct CanvasEngine {
    pub canvas: HtmlCanvasElement,
    pub ctx: CanvasRenderingContext2d,
    pub scene: Rc<RefCell<SceneGraph>>,
    pub pan_x: f64,
    pub pan_y: f64,
    pub zoom: f64,
    pub active_tool: ElementType,
    pub is_drawing: bool,
    pub current_start: (f64, f64),
    pub show_grid: bool,
    pub theme_dark: bool,
}

impl CanvasEngine {
    pub fn new(canvas: HtmlCanvasElement, scene: Rc<RefCell<SceneGraph>>) -> Result<Self, JsValue> {
        let ctx = canvas
            .get_context("2d")?
            .ok_or_else(|| JsValue::from_str("Failed to acquire 2D context"))?
            .dyn_into::<CanvasRenderingContext2d>()?;

        Ok(Self {
            canvas,
            ctx,
            scene,
            pan_x: 0.0,
            pan_y: 0.0,
            zoom: 1.0,
            active_tool: ElementType::Rectangle,
            is_drawing: false,
            current_start: (0.0, 0.0),
            show_grid: true,
            theme_dark: true,
        })
    }

    /// Resize canvas to match window client width & height with devicePixelRatio
    pub fn resize(&mut self, width: u32, height: u32, dpr: f64) {
        self.canvas.set_width((width as f64 * dpr) as u32);
        self.canvas.set_height((height as f64 * dpr) as u32);
        let _ = self.canvas.style().set_property("width", &format!("{}px", width));
        let _ = self.canvas.style().set_property("height", &format!("{}px", height));
        let _ = self.ctx.scale(dpr, dpr);
    }

    /// Converts screen client coordinates to world canvas space
    pub fn screen_to_world(&self, sx: f64, sy: f64) -> (f64, f64) {
        let wx = (sx - self.pan_x) / self.zoom;
        let wy = (sy - self.pan_y) / self.zoom;
        (wx, wy)
    }

    /// Main render loop called via requestAnimationFrame
    pub fn render(&self) {
        let width = self.canvas.client_width() as f64;
        let height = self.canvas.client_height() as f64;

        // Clear background
        self.ctx.save();
        self.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0).unwrap_or(());
        let bg_color = if self.theme_dark { "#121212" } else { "#fdfbf7" };
        self.ctx.set_fill_style(&JsValue::from_str(bg_color));
        self.ctx.fill_rect(0.0, 0.0, width, height);

        // Apply camera Pan & Zoom
        let _ = self.ctx.translate(self.pan_x, self.pan_y);
        let _ = self.ctx.scale(self.zoom, self.zoom);

        // Render subtle Rustly Forge grid
        if self.show_grid {
            self.render_grid(width, height);
        }

        // Render all elements in the scene graph
        let scene_ref = self.scene.borrow();
        for element in &scene_ref.elements {
            if element.is_deleted {
                continue;
            }
            self.render_element(element);
        }

        // Render selection bounding box & handles
        for selected_id in &scene_ref.selected_ids {
            if let Some(elem) = scene_ref.elements.iter().find(|e| &e.id == selected_id) {
                self.render_selection_bounds(elem);
            }
        }

        self.ctx.restore();
    }

    fn render_grid(&self, _w: f64, _h: f64) {
        let step = 20.0;
        let grid_color = if self.theme_dark { "rgba(255, 255, 255, 0.05)" } else { "rgba(0, 0, 0, 0.06)" };
        self.ctx.set_stroke_style(&JsValue::from_str(grid_color));
        self.ctx.set_line_width(1.0);

        // Calculate visible world viewport
        let (min_x, min_y) = self.screen_to_world(0.0, 0.0);
        let (max_x, max_y) = self.screen_to_world(self.canvas.client_width() as f64, self.canvas.client_height() as f64);

        let start_x = (min_x / step).floor() * step;
        let end_x = (max_x / step).ceil() * step;
        let start_y = (min_y / step).floor() * step;
        let end_y = (max_y / step).ceil() * step;

        let _ = self.ctx.begin_path();
        let mut x = start_x;
        while x <= end_x {
            self.ctx.move_to(x, min_y);
            self.ctx.line_to(x, max_y);
            x += step;
        }
        let mut y = start_y;
        while y <= end_y {
            self.ctx.move_to(min_x, y);
            self.ctx.line_to(max_x, y);
            y += step;
        }
        let _ = self.ctx.stroke();
    }

    fn render_element(&self, elem: &RustlyForgeElement) {
        self.ctx.save();
        self.ctx.set_stroke_style(&JsValue::from_str(&elem.stroke_color));
        self.ctx.set_line_width(elem.stroke_width);
        self.ctx.set_global_alpha(elem.opacity);

        // Handle fill if present
        if elem.background_color != "transparent" {
            match elem.fill_style {
                FillStyle::Hachure | FillStyle::CrossHatch => {
                    draw_hatching(
                        &self.ctx,
                        elem.x,
                        elem.y,
                        elem.width,
                        elem.height,
                        &elem.background_color,
                        8.0,
                        elem.roughness,
                        elem.seed,
                    );
                }
                FillStyle::Solid => {
                    self.ctx.set_fill_style(&JsValue::from_str(&elem.background_color));
                    self.ctx.fill_rect(elem.x, elem.y, elem.width, elem.height);
                }
                _ => {}
            }
        }

        match elem.element_type {
            ElementType::Rectangle => {
                draw_sketchy_rect(&self.ctx, elem.x, elem.y, elem.width, elem.height, elem.roughness, elem.seed);
            }
            ElementType::Diamond => {
                draw_sketchy_diamond(&self.ctx, elem.x, elem.y, elem.width, elem.height, elem.roughness, elem.seed);
            }
            ElementType::Ellipse => {
                draw_sketchy_ellipse(&self.ctx, elem.x, elem.y, elem.width, elem.height, elem.roughness, elem.seed);
            }
            ElementType::Arrow => {
                if elem.points.len() >= 2 {
                    let (x1, y1) = (elem.x + elem.points[0].0, elem.y + elem.points[0].1);
                    let (x2, y2) = (elem.x + elem.points[1].0, elem.y + elem.points[1].1);
                    draw_sketchy_arrow(&self.ctx, x1, y1, x2, y2, elem.roughness, elem.seed);
                } else {
                    draw_sketchy_arrow(&self.ctx, elem.x, elem.y, elem.x + elem.width, elem.y + elem.height, elem.roughness, elem.seed);
                }
            }
            ElementType::Line => {
                if elem.points.len() >= 2 {
                    let (x1, y1) = (elem.x + elem.points[0].0, elem.y + elem.points[0].1);
                    let (x2, y2) = (elem.x + elem.points[1].0, elem.y + elem.points[1].1);
                    draw_sketchy_line(&self.ctx, x1, y1, x2, y2, elem.roughness, elem.seed);
                } else {
                    draw_sketchy_line(&self.ctx, elem.x, elem.y, elem.x + elem.width, elem.y + elem.height, elem.roughness, elem.seed);
                }
            }
            ElementType::Freedraw => {
                if elem.points.len() > 1 {
                    let _ = self.ctx.begin_path();
                    let (first_x, first_y) = (elem.x + elem.points[0].0, elem.y + elem.points[0].1);
                    self.ctx.move_to(first_x, first_y);
                    for i in 1..elem.points.len() {
                        let (px, py) = (elem.x + elem.points[i].0, elem.y + elem.points[i].1);
                        self.ctx.line_to(px, py);
                    }
                    let _ = self.ctx.stroke();
                }
            }
            ElementType::Text => {
                if let Some(text) = &elem.text {
                    let font_size = elem.font_size.unwrap_or(20.0);
                    let font_family = match elem.font_family.unwrap_or_default() {
                        FontFamily::Excalifont => "Caveat, cursive",
                        FontFamily::ComicShanns => "'Comic Neue', cursive",
                        FontFamily::LilitaOne => "'Lilita One', cursive",
                        FontFamily::Nunito => "Nunito, sans-serif",
                    };
                    self.ctx.set_font(&format!("{}px {}", font_size, font_family));
                    self.ctx.set_fill_style(&JsValue::from_str(&elem.stroke_color));
                    let _ = self.ctx.fill_text(text, elem.x, elem.y + font_size);
                }
            }
            _ => {}
        }
        self.ctx.restore();
    }

    fn render_selection_bounds(&self, elem: &RustlyForgeElement) {
        let (min_x, min_y, max_x, max_y) = elem.bounding_box();
        let w = max_x - min_x;
        let h = max_y - min_y;

        self.ctx.save();
        self.ctx.set_stroke_style(&JsValue::from_str("#6965db"));
        self.ctx.set_line_width(1.5);
        let dashes = js_sys::Array::new();
        dashes.push(&JsValue::from_f64(4.0));
        dashes.push(&JsValue::from_f64(4.0));
        let _ = self.ctx.set_line_dash(&dashes);
        self.ctx.stroke_rect(min_x - 4.0, min_y - 4.0, w + 8.0, h + 8.0);

        // Draw 8 resize handle squares
        let handle_size = 8.0;
        self.ctx.set_fill_style(&JsValue::from_str("#ffffff"));
        let solid_dashes = js_sys::Array::new();
        let _ = self.ctx.set_line_dash(&solid_dashes);

        let corners = [
            (min_x - 4.0, min_y - 4.0),
            (min_x + w / 2.0, min_y - 4.0),
            (max_x + 4.0, min_y - 4.0),
            (max_x + 4.0, min_y + h / 2.0),
            (max_x + 4.0, max_y + 4.0),
            (min_x + w / 2.0, max_y + 4.0),
            (min_x - 4.0, max_y + 4.0),
            (min_x - 4.0, min_y + h / 2.0),
        ];

        for (hx, hy) in corners {
            self.ctx.fill_rect(hx - handle_size / 2.0, hy - handle_size / 2.0, handle_size, handle_size);
            self.ctx.stroke_rect(hx - handle_size / 2.0, hy - handle_size / 2.0, handle_size, handle_size);
        }
        self.ctx.restore();
    }
}
