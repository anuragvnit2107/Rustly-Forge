//! Local-first storage and persistence module for Rustly Forge WASM.
//!
//! Handles serialization/deserialization to Window.localStorage using Serde JSON,
//! triggers browser file downloads for PNG blobs, and generates native SVG strings.

use gloo_storage::{LocalStorage, Storage};
use wasm_bindgen::prelude::*;
use web_sys::{HtmlAnchorElement, HtmlCanvasElement};

use crate::model::element::*;

const STORAGE_KEY: &str = "rustly_forge_elements_v1";

/// Saves the scene elements to browser localStorage as a JSON string
pub fn save_to_local_storage(elements: &[RustlyForgeElement]) -> Result<(), JsValue> {
    let json = serde_json::to_string(elements)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;
    LocalStorage::set(STORAGE_KEY, json)
        .map_err(|e| JsValue::from_str(&format!("Storage error: {:?}", e)))?;
    Ok(())
}

/// Loads scene elements from browser localStorage
pub fn load_from_local_storage() -> Option<Vec<RustlyForgeElement>> {
    if let Ok(json) = LocalStorage::get::<String>(STORAGE_KEY) {
        if let Ok(elements) = serde_json::from_str::<Vec<RustlyForgeElement>>(&json) {
            return Some(elements);
        }
    }
    // Fallback to legacy storage key
    if let Ok(json) = LocalStorage::get::<String>("excalidraw_rust_elements_v1") {
        if let Ok(elements) = serde_json::from_str::<Vec<RustlyForgeElement>>(&json) {
            return Some(elements);
        }
    }
    None
}

/// Exports HTMLCanvasElement content to PNG and triggers an automatic browser download
pub fn export_canvas_to_png(canvas: &HtmlCanvasElement, filename: &str) -> Result<(), JsValue> {
    let data_url = canvas.to_data_url_with_type("image/png")?;
    
    let window = web_sys::window().ok_or_else(|| JsValue::from_str("No window object"))?;
    let document = window.document().ok_or_else(|| JsValue::from_str("No document object"))?;
    
    let link: HtmlAnchorElement = document
        .create_element("a")?
        .dyn_into::<HtmlAnchorElement>()?;
    
    link.set_href(&data_url);
    link.set_download(filename);
    link.click();
    
    Ok(())
}

/// Generates a native standalone SVG string from scene elements
pub fn export_to_svg_string(elements: &[RustlyForgeElement], width: f64, height: f64, dark_mode: bool) -> String {
    let bg_color = if dark_mode { "#121212" } else { "#ffffff" };
    let mut svg = format!(
        r#"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}" viewBox="0 0 {} {}" style="background:{};">"#,
        width, height, width, height, bg_color
    );

    for elem in elements {
        if elem.is_deleted {
            continue;
        }
        match elem.element_type {
            ElementType::Rectangle => {
                svg.push_str(&format!(
                    r#"<rect x="{}" y="{}" width="{}" height="{}" stroke="{}" stroke-width="{}" fill="{}" opacity="{}" rx="4" />"#,
                    elem.x, elem.y, elem.width, elem.height, elem.stroke_color, elem.stroke_width, elem.background_color, elem.opacity
                ));
            }
            ElementType::Ellipse => {
                let rx = (elem.width / 2.0).abs();
                let ry = (elem.height / 2.0).abs();
                let cx = elem.x + elem.width / 2.0;
                let cy = elem.y + elem.height / 2.0;
                svg.push_str(&format!(
                    r#"<ellipse cx="{}" cy="{}" rx="{}" ry="{}" stroke="{}" stroke-width="{}" fill="{}" opacity="{}" />"#,
                    cx, cy, rx, ry, elem.stroke_color, elem.stroke_width, elem.background_color, elem.opacity
                ));
            }
            ElementType::Line => {
                if elem.points.len() >= 2 {
                    let (x1, y1) = (elem.x + elem.points[0].0, elem.y + elem.points[0].1);
                    let (x2, y2) = (elem.x + elem.points[1].0, elem.y + elem.points[1].1);
                    svg.push_str(&format!(
                        r#"<line x1="{}" y1="{}" x2="{}" y2="{}" stroke="{}" stroke-width="{}" opacity="{}" stroke-linecap="round" />"#,
                        x1, y1, x2, y2, elem.stroke_color, elem.stroke_width, elem.opacity
                    ));
                }
            }
            ElementType::Freedraw => {
                if !elem.points.is_empty() {
                    let mut path_data = format!("M {} {}", elem.x + elem.points[0].0, elem.y + elem.points[0].1);
                    for pt in &elem.points[1..] {
                        path_data.push_str(&format!(" L {} {}", elem.x + pt.0, elem.y + pt.1));
                    }
                    svg.push_str(&format!(
                        r#"<path d="{}" stroke="{}" stroke-width="{}" fill="none" opacity="{}" stroke-linecap="round" stroke-linejoin="round" />"#,
                        path_data, elem.stroke_color, elem.stroke_width, elem.opacity
                    ));
                }
            }
            ElementType::Text => {
                if let Some(text) = &elem.text {
                    let font_size = elem.font_size.unwrap_or(20.0);
                    svg.push_str(&format!(
                        r#"<text x="{}" y="{}" fill="{}" font-size="{}" font-family="Caveat, cursive" opacity="{}">{}</text>"#,
                        elem.x, elem.y + font_size, elem.stroke_color, font_size, elem.opacity, text
                    ));
                }
            }
            _ => {}
        }
    }

    svg.push_str("</svg>");
    svg
}
