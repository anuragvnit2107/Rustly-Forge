//! Rustly Forge element data models, Serde JSON schema, spatial math, and scene graph.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ElementType {
    Rectangle,
    Diamond,
    Ellipse,
    Arrow,
    Line,
    Freedraw,
    Text,
    Image,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StrokeStyle {
    Solid,
    Dashed,
    Dotted,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FillStyle {
    Transparent,
    Solid,
    Hachure,
    CrossHatch,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum FontFamily {
    Excalifont,
    ComicShanns,
    LilitaOne,
    Nunito,
}

impl Default for FontFamily {
    fn default() -> Self {
        FontFamily::Excalifont
    }
}

/// Core element schema matching the technical specification.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RustlyForgeElement {
    pub id: String,
    pub element_type: ElementType,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub angle: f64,
    pub stroke_color: String,
    pub background_color: String,
    pub fill_style: FillStyle,
    pub stroke_width: f64,
    pub stroke_style: StrokeStyle,
    pub roughness: f32,
    pub opacity: f64,
    pub points: Vec<(f64, f64)>,
    pub text: Option<String>,
    pub font_family: Option<FontFamily>,
    pub font_size: Option<f64>,
    pub seed: u32,
    pub is_deleted: bool,
}

/// Backwards-compatibility type alias
pub type ExcalidrawElement = RustlyForgeElement;

impl RustlyForgeElement {
    pub fn new(id: String, element_type: ElementType, x: f64, y: f64) -> Self {
        Self {
            id,
            element_type,
            x,
            y,
            width: 0.0,
            height: 0.0,
            angle: 0.0,
            stroke_color: "#e03131".to_string(),
            background_color: "transparent".to_string(),
            fill_style: FillStyle::Hachure,
            stroke_width: 2.0,
            stroke_style: StrokeStyle::Solid,
            roughness: 1.0,
            opacity: 1.0,
            points: Vec::new(),
            text: None,
            font_family: Some(FontFamily::Excalifont),
            font_size: Some(20.0),
            seed: 42,
            is_deleted: false,
        }
    }

    /// Calculate axis-aligned bounding box (min_x, min_y, max_x, max_y)
    pub fn bounding_box(&self) -> (f64, f64, f64, f64) {
        match self.element_type {
            ElementType::Freedraw | ElementType::Line | ElementType::Arrow => {
                if self.points.is_empty() {
                    return (self.x, self.y, self.x + self.width, self.y + self.height);
                }
                let mut min_x = self.x;
                let mut max_x = self.x;
                let mut min_y = self.y;
                let mut max_y = self.y;
                for (px, py) in &self.points {
                    let gx = self.x + px;
                    let gy = self.y + py;
                    if gx < min_x { min_x = gx; }
                    if gx > max_x { max_x = gx; }
                    if gy < min_y { min_y = gy; }
                    if gy > max_y { max_y = gy; }
                }
                let padding = self.stroke_width * 2.0;
                (min_x - padding, min_y - padding, max_x + padding, max_y + padding)
            }
            _ => {
                let min_x = self.x.min(self.x + self.width);
                let max_x = self.x.max(self.x + self.width);
                let min_y = self.y.min(self.y + self.height);
                let max_y = self.y.max(self.y + self.height);
                (min_x, min_y, max_x, max_y)
            }
        }
    }

    /// Hit-test: returns true if the point (px, py) touches or is inside the element
    pub fn hit_test(&self, px: f64, py: f64, threshold: f64) -> bool {
        let (min_x, min_y, max_x, max_y) = self.bounding_box();
        let tol = threshold + self.stroke_width;

        if px < min_x - tol || px > max_x + tol || py < min_y - tol || py > max_y + tol {
            return false;
        }

        match self.element_type {
            ElementType::Rectangle | ElementType::Diamond | ElementType::Ellipse | ElementType::Text => {
                if self.background_color != "transparent" {
                    // Filled element: point is inside bounding box
                    px >= min_x && px <= max_x && py >= min_y && py <= max_y
                } else {
                    // Stroke only: point is near perimeter
                    let dist_left = (px - min_x).abs();
                    let dist_right = (px - max_x).abs();
                    let dist_top = (py - min_y).abs();
                    let dist_bottom = (py - max_y).abs();

                    (dist_left <= tol || dist_right <= tol) && py >= min_y - tol && py <= max_y + tol
                        || (dist_top <= tol || dist_bottom <= tol) && px >= min_x - tol && px <= max_x + tol
                }
            }
            ElementType::Line | ElementType::Arrow => {
                if self.points.len() < 2 {
                    return false;
                }
                let p1 = (self.x + self.points[0].0, self.y + self.points[0].1);
                let p2 = (self.x + self.points[1].0, self.y + self.points[1].1);
                distance_to_segment(px, py, p1.0, p1.1, p2.0, p2.1) <= tol
            }
            ElementType::Freedraw => {
                for i in 0..self.points.len().saturating_sub(1) {
                    let p1 = (self.x + self.points[i].0, self.y + self.points[i].1);
                    let p2 = (self.x + self.points[i + 1].0, self.y + self.points[i + 1].1);
                    if distance_to_segment(px, py, p1.0, p1.1, p2.0, p2.1) <= tol {
                        return true;
                    }
                }
                false
            }
            _ => px >= min_x && px <= max_x && py >= min_y && py <= max_y,
        }
    }

    /// Move element by delta (dx, dy)
    pub fn translate(&mut self, dx: f64, dy: f64) {
        self.x += dx;
        self.y += dy;
    }
}

/// Helper function to compute distance from point (px, py) to line segment (x1, y1)-(x2, y2)
pub fn distance_to_segment(px: f64, py: f64, x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len_sq = dx * dx + dy * dy;
    if len_sq == 0.0 {
        return ((px - x1).powi(2) + (py - y1).powi(2)).sqrt();
    }
    let t = (((px - x1) * dx + (py - y1) * dy) / len_sq).clamp(0.0, 1.0);
    let proj_x = x1 + t * dx;
    let proj_y = y1 + t * dy;
    ((px - proj_x).powi(2) + (py - proj_y).powi(2)).sqrt()
}

/// Thread-safe scene graph holding all elements and selection state
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SceneGraph {
    pub elements: Vec<RustlyForgeElement>,
    pub selected_ids: Vec<String>,
}

impl SceneGraph {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_element(&mut self, element: RustlyForgeElement) {
        self.elements.push(element);
    }

    pub fn remove_element(&mut self, id: &str) {
        self.elements.retain(|e| e.id != id);
        self.selected_ids.retain(|sid| sid != id);
    }

    pub fn get_element_mut(&mut self, id: &str) -> Option<&mut RustlyForgeElement> {
        self.elements.iter_mut().find(|e| e.id == id)
    }

    pub fn select_at(&mut self, px: f64, py: f64, multi: bool) {
        // Iterate backwards (topmost element first)
        let found = self.elements.iter().rev().find(|e| !e.is_deleted && e.hit_test(px, py, 6.0));
        if let Some(elem) = found {
            let id = elem.id.clone();
            if multi {
                if !self.selected_ids.contains(&id) {
                    self.selected_ids.push(id);
                }
            } else {
                self.selected_ids = vec![id];
            }
        } else if !multi {
            self.selected_ids.clear();
        }
    }
}
