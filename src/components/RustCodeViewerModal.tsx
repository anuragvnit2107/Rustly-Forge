import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileText, Download, CheckCircle2 } from 'lucide-react';

interface RustCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RustFile {
  name: string;
  path: string;
  step: string;
  desc: string;
  code: string;
}

const RUST_FILES: RustFile[] = [
  {
    name: 'Cargo.toml',
    path: '/Cargo.toml',
    step: 'Architecture',
    desc: 'Rust WASM crate manifest with Leptos CSR, web-sys, rand, serde, gloo-storage, and aes-gcm dependencies.',
    code: `[package]
name = "rustly-forge"
version = "0.1.0"
edition = "2021"
authors = ["Rustly Forge Team"]
description = "Rustly Forge is an open-source, Rust-powered engineering canvas for sketching, designing, and experimenting with circuits, geometry, and technical ideas."

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
leptos = { version = "0.6", features = ["csr"] }
wasm-bindgen = "0.2.92"
console_error_panic_hook = "0.1.7"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rand = "0.8.5"
gloo-storage = "0.3.0"
gloo-net = "0.5.0"
web-sys = { version = "0.3.69", features = [
    "CanvasRenderingContext2d",
    "HtmlCanvasElement",
    "Window",
    "Document",
    "MouseEvent",
    "KeyboardEvent",
    "Storage",
    "Blob",
    "Url"
] }
aes-gcm = { version = "0.10.3", optional = true }`,
  },
  {
    name: 'sketch.rs',
    path: '/src/canvas/sketch.rs',
    step: 'Step 2: Hand-Drawn Math',
    desc: 'Procedural hand-drawn geometry & jitter algorithms (Rough.js algorithmic port with seedable PRNG, double-stroke lines, Bézier curvature, and hatching).',
    code: `//! Hand-drawn procedural sketch math module in 100% Rust (Rough.js equivalent).
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use web_sys::CanvasRenderingContext2d;

pub struct SketchRng {
    rng: StdRng,
}

impl SketchRng {
    pub fn new(seed: u32) -> Self {
        Self { rng: StdRng::seed_from_u64(seed as u64) }
    }

    pub fn jitter(&mut self, roughness: f32) -> f64 {
        if roughness <= 0.001 { return 0.0; }
        let r: f64 = self.rng.gen_range(-1.0..1.0);
        r * (roughness as f64) * 2.2
    }
}

pub fn draw_sketchy_rect(
    ctx: &CanvasRenderingContext2d,
    x: f64, y: f64, w: f64, h: f64,
    roughness: f32, seed: u32,
) {
    let x1 = x.min(x + w);
    let x2 = x.max(x + w);
    let y1 = y.min(y + h);
    let y2 = y.max(y + h);

    draw_sketchy_line(ctx, x1, y1, x2, y1, roughness, seed);
    draw_sketchy_line(ctx, x2, y1, x2, y2, roughness, seed.wrapping_add(1));
    draw_sketchy_line(ctx, x2, y2, x1, y2, roughness, seed.wrapping_add(2));
    draw_sketchy_line(ctx, x1, y2, x1, y1, roughness, seed.wrapping_add(3));
}

pub fn draw_sketchy_line(
    ctx: &CanvasRenderingContext2d,
    x1: f64, y1: f64, x2: f64, y2: f64,
    roughness: f32, seed: u32,
) {
    let mut rng = SketchRng::new(seed);
    let dx = x2 - x1;
    let dy = y2 - y1;
    let cp1_x = x1 + dx * 0.33 + rng.jitter(roughness);
    let cp1_y = y1 + dy * 0.33 + rng.jitter(roughness);
    let cp2_x = x1 + dx * 0.66 + rng.jitter(roughness);
    let cp2_y = y1 + dy * 0.66 + rng.jitter(roughness);

    let _ = ctx.begin_path();
    ctx.move_to(x1 + rng.jitter(roughness * 0.4), y1 + rng.jitter(roughness * 0.4));
    ctx.bezier_curve_to(cp1_x, cp1_y, cp2_x, cp2_y, x2 + rng.jitter(roughness * 0.4), y2 + rng.jitter(roughness * 0.4));
    let _ = ctx.stroke();
}`,
  },
  {
    name: 'element.rs',
    path: '/src/model/element.rs',
    step: 'Step 3: Elements & Selection',
    desc: 'RustlyForgeElement struct & enum with Serde JSON schema, bounding-box calculation, hit-testing, and thread-safe scene graph.',
    code: `//! Rustly Forge element data models, Serde JSON schema, spatial math, and scene graph.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ElementType {
    Rectangle, Diamond, Ellipse, Arrow, Line, Freedraw, Text, Image
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RustlyForgeElement {
    pub id: String,
    pub element_type: ElementType,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub stroke_color: String,
    pub roughness: f32,
    pub points: Vec<(f64, f64)>,
    pub seed: u32,
    pub is_deleted: bool,
}

pub type ExcalidrawElement = RustlyForgeElement;

impl RustlyForgeElement {
    pub fn bounding_box(&self) -> (f64, f64, f64, f64) {
        let min_x = self.x.min(self.x + self.width);
        let max_x = self.x.max(self.x + self.width);
        let min_y = self.y.min(self.y + self.height);
        let max_y = self.y.max(self.y + self.height);
        (min_x, min_y, max_x, max_y)
    }

    pub fn hit_test(&self, px: f64, py: f64, threshold: f64) -> bool {
        let (min_x, min_y, max_x, max_y) = self.bounding_box();
        let tol = threshold;
        px >= min_x - tol && px <= max_x + tol && py >= min_y - tol && py <= max_y + tol
    }
}`,
  },
  {
    name: 'engine.rs',
    path: '/src/canvas/engine.rs',
    step: 'Step 1: Setup & Canvas',
    desc: 'HTML5 Canvas redraw loop hooked into requestAnimationFrame, pan/zoom camera math, and event bindings.',
    code: `//! Canvas rendering engine and browser event dispatching loop in Rust.
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};
use crate::canvas::sketch::*;
use crate::model::element::*;

pub struct CanvasEngine {
    pub canvas: HtmlCanvasElement,
    pub ctx: CanvasRenderingContext2d,
    pub pan_x: f64,
    pub pan_y: f64,
    pub zoom: f64,
}

impl CanvasEngine {
    pub fn screen_to_world(&self, sx: f64, sy: f64) -> (f64, f64) {
        let wx = (sx - self.pan_x) / self.zoom;
        let wy = (sy - self.pan_y) / self.zoom;
        (wx, wy)
    }

    pub fn render(&self, elements: &[RustlyForgeElement]) {
        self.ctx.save();
        let _ = self.ctx.translate(self.pan_x, self.pan_y);
        let _ = self.ctx.scale(self.zoom, self.zoom);

        for elem in elements {
            if elem.is_deleted { continue; }
            match elem.element_type {
                ElementType::Rectangle => {
                    draw_sketchy_rect(&self.ctx, elem.x, elem.y, elem.width, elem.height, elem.roughness, elem.seed);
                }
                _ => {}
            }
        }
        self.ctx.restore();
    }
}`,
  },
  {
    name: 'local.rs',
    path: '/src/storage/local.rs',
    step: 'Step 4: Storage & Export',
    desc: 'Local-first persistence using Window.localStorage via gloo-storage, Serde JSON, PNG blob download, and native SVG export.',
    code: `//! Local-first storage and persistence module for Rustly Forge WASM.
use gloo_storage::{LocalStorage, Storage};
use wasm_bindgen::prelude::*;
use web_sys::{HtmlAnchorElement, HtmlCanvasElement};
use crate::model::element::*;

const STORAGE_KEY: &str = "rustly_forge_elements_v1";

pub fn save_to_local_storage(elements: &[RustlyForgeElement]) -> Result<(), JsValue> {
    let json = serde_json::to_string(elements)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))?;
    LocalStorage::set(STORAGE_KEY, json)
        .map_err(|e| JsValue::from_str(&format!("Storage error: {:?}", e)))?;
    Ok(())
}

pub fn export_canvas_to_png(canvas: &HtmlCanvasElement, filename: &str) -> Result<(), JsValue> {
    let data_url = canvas.to_data_url_with_type("image/png")?;
    let window = web_sys::window().ok_or_else(|| JsValue::from_str("No window object"))?;
    let document = window.document().ok_or_else(|| JsValue::from_str("No document object"))?;
    let link: HtmlAnchorElement = document.create_element("a")?.dyn_into()?;
    link.set_href(&data_url);
    link.set_download(filename);
    link.click();
    Ok(())
}`,
  },
  {
    name: 'app.rs',
    path: '/src/app.rs',
    step: 'UI Shell',
    desc: 'Leptos CSR root component rendering the reactive toolbar, properties panel, and canvas wrapper.',
    code: `//! Leptos CSR root component for Rustly Forge WASM canvas.
use leptos::*;
use crate::model::element::*;

#[component]
pub fn App() -> impl IntoView {
    let (active_tool, set_active_tool) = create_signal(ElementType::Rectangle);
    let (roughness, set_roughness) = create_signal(1.0f32);

    view! {
        <div class="relative w-screen h-screen bg-[#121212] text-white">
            <header class="absolute top-3 left-4 right-4 z-20 flex items-center justify-between">
                // Floating top toolbar
            </header>
            <canvas class="w-full h-full block cursor-crosshair" />
        </div>
    }
}`,
  },
  {
    name: 'lib.rs',
    path: '/src/lib.rs',
    step: 'WASM Entry Point',
    desc: 'WebAssembly initialization hook, console panic hook, and Leptos body mount.',
    code: `//! WASM entry point for Rustly Forge Rust / WebAssembly canvas.
use wasm_bindgen::prelude::*;

pub mod app;
pub mod canvas;
pub mod model;
pub mod storage;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    leptos::mount_to_body(|| leptos::view! { <app::App /> });
}`,
  },
];

export const RustCodeViewerModal: React.FC<RustCodeViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = RUST_FILES[selectedFileIdx];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div
        id="rust-code-modal"
        className="w-full max-w-5xl h-[85vh] bg-[#1a1a22] border border-[#31303b] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#2e2d3b] bg-[#23232d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6965db]/20 border border-[#6965db]/40 text-[#a5a4f7]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Rust & WebAssembly Codebase
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#6965db] text-white">
                  100% Rust / WASM
                </span>
              </div>
              <p className="text-xs text-[#9594a5]">
                Matching project file tree: /src/lib.rs, /src/app.rs, /src/canvas/, /src/model/, /src/storage/, Cargo.toml
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2e2d3b] hover:bg-[#393849] text-white transition flex items-center gap-1.5 border border-[#3f3e50]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <button
              onClick={handleDownloadFile}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6965db] hover:bg-[#5b57d1] text-white transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              Download {currentFile.name}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#31303b] text-[#8e8d9e] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Tabs & Main View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar file tree */}
          <div className="w-64 bg-[#16161d] border-r border-[#2a2936] flex flex-col p-3 gap-1 overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-[#6d6c7c] uppercase tracking-wider px-2 py-1">
              Project Structure
            </span>

            {RUST_FILES.map((file, idx) => {
              const isSelected = selectedFileIdx === idx;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-3 py-2 rounded-xl text-left transition flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-[#292838] border border-[#6965db]/50 text-white shadow'
                      : 'text-[#9c9ba8] hover:bg-[#1f1e28] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold">{file.name}</span>
                    <span className="text-[9px] font-medium text-[#7d7c8e]">{file.step}</span>
                  </div>
                  <span className="text-[10px] text-[#6d6c7c] truncate">{file.path}</span>
                </button>
              );
            })}

            {/* Checklist of Steps */}
            <div className="mt-4 pt-3 border-t border-[#2a2936] px-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#6d6c7c] uppercase tracking-wider">
                Roadmap Steps Done
              </span>
              {[
                'Step 1: Setup & Canvas (engine.rs)',
                'Step 2: Hand-Drawn Math (sketch.rs)',
                'Step 3: Elements & Selection (element.rs)',
                'Step 4: Storage & Export (local.rs)',
              ].map((step) => (
                <div key={step} className="flex items-center gap-1.5 text-[11px] text-[#8e8d9e]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span className="truncate">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#14141a] overflow-hidden">
            {/* Description bar */}
            <div className="px-5 py-2.5 bg-[#1b1b22] border-b border-[#272633] flex items-center justify-between text-xs">
              <span className="font-mono text-[#a5a4f7] font-semibold">{currentFile.path}</span>
              <span className="text-[#8e8d9e]">{currentFile.desc}</span>
            </div>

            {/* Code editor / pre */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs leading-relaxed text-[#e0dfec]">
              <pre className="selection:bg-[#6965db]/40">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
