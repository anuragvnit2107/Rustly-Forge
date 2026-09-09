<img width="250" height="250" alt="RustlyForgelogo" src="https://github.com/user-attachments/assets/3cec815f-82a7-4269-af47-0a2097fd1106" />
<div align="center">
  <img src="public/assets/rustly-forge-logo.png" alt="Rustly Forge Logo" width="220" />

  # Rustly Forge

  **A Rust + WebAssembly + React engineering canvas for sketching, designing, and experimenting with circuits, geometry, and technical ideas.**

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  [![Rust](https://img.shields.io/badge/Rust-2021%20Edition-orange.svg)](https://www.rust-lang.org/)
  [![WebAssembly](https://img.shields.io/badge/WebAssembly-WASM-purple.svg)](https://webassembly.org/)
  [![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-yellow.svg)](https://vitejs.dev/)

  <p align="center">
    <a href="#about-the-project">About</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#repository-structure">Structure</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#available-scripts">Scripts</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

---

## About the Project

**Rustly Forge** is a student-built, open-source engineering workspace designed for students, educators, electrical hobbyists, and software engineers who need to quickly sketch schematics, illustrate mechanical ideas, and create technical documentation with an organic hand-drawn aesthetic.

Rather than treating digital drawings as static pixels, Rustly Forge combines the responsive reactivity of **React 19** with a high-performance **Rust / WebAssembly** computational core for scene graph management, mathematical stroke rendering, and spatial geometry.

---

## Architecture

Rustly Forge operates on a hybrid architecture that balances immediate UI reactivity with native computational efficiency:

```
┌─────────────────────────────────────────────────────────────┐
│                       Rustly Forge UI                       │
│           (React 19 + Tailwind CSS + Lucide Icons)          │
├──────────────────────────────┬──────────────────────────────┤
│       UI & State Layer       │    Interaction & Canvas      │
│  • Floating Toolbars         │  • HTML5 Canvas 2D Wrapper   │
│  • Properties Inspector      │  • Multi-Selection Marquee   │
│  • Circuit Component Drawer  │  • Pan / Zoom Viewport Math  │
│  • Presentation Controller   │  • Gesture & Input Events    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│  Client Algorithmic Helpers  ││  Rust / WebAssembly Module  │
│  • Vector Sketching Engine   ││  (wasm-bindgen + web-sys)   │
│  • RDP Shape Recognition     ││  • Scene Graph Data Model   │
│  • Terminal Pin Binding      ││  • Spatial Math & Bounds    │
│  • Palette & Theme Engine    ││  • Local-First Serde Storage│
│  • Multi-Format Serializers  ││  • Leptos CSR WASM Runner   │
└──────────────────────────────┘└─────────────────────────────┘
```

### 1. React & TypeScript Front-End
* **Application Shell (`src/App.tsx`)**: Orchestrates global application state, undo/redo history, modal dialogs, and keybindings.
* **Canvas Controller (`src/components/Canvas.tsx`)**: Manages the viewport transformation matrix (pan, zoom, device-pixel-ratio scaling), multi-element bounding boxes, transform handles, and frame slides.
* **Algorithmic Generators (`src/sketchEngine.ts`)**: Generates hand-drawn wobbly line geometry, variable-roughness arcs, arrows, and vector hachure/cross-hatch fills.
* **Circuit Modeling (`src/engineeringComponents.ts`)**: Defines engineering schematic symbols with automated terminal pin attachments and wire snapping.
* **Shape Recognition (`src/shapeRecognition.ts`)**: Implements Ramer-Douglas-Peucker (RDP) polyline simplification and geometric heuristic tests to snap rough freehand sketches into clean circles, ellipses, triangles, squares, and rectangles.

### 2. Rust & WebAssembly Core
* **Crate Definition (`Cargo.toml`)**: Configured as both `cdylib` and `rlib` targets utilizing `wasm-bindgen`, `web-sys`, `serde`, and `gloo-storage`.
* **Scene Graph & Schema (`src/model/element.rs`)**: Type-safe Rust representations of geometric elements, styling enumerations (`StrokeStyle`, `FillStyle`, `FontFamily`), and bounding-box spatial calculations.
* **Canvas Engine (`src/canvas/engine.rs` & `src/canvas/sketch.rs`)**: Direct Rust bindings to HTML5 `CanvasRenderingContext2d` via `web-sys` for camera transformations, grid drawing, and sketchy rendering routines.
* **Local Persistence (`src/storage/local.rs`)**: High-speed JSON serialization and deserialization against browser `localStorage` using `gloo-storage` and `serde_json`, with PNG and native SVG generators.
* **Leptos Entry Point (`src/lib.rs` & `src/app.rs`)**: Standalone Leptos CSR web interface and WASM instantiation hooks with `console_error_panic_hook`.

---

## Key Features

### 📐 Canvas & Drawing Tools
* **Primitive Tools**: Selection / Pointer, Rectangle, Diamond, Ellipse, Arrow, Line, Freehand Pencil, Text, Image Stamping, and Multi-type Triangles (Equilateral, Right, Isosceles).
* **Presentation Frames**: Dedicated canvas frames that group technical drawings into numbered presentation slides with step-through controls.
* **Rough / Sketch Engine**: Configurable sloppiness levels (*Architect*, *Artist*, *Cartoonist*), stroke widths (Thin, Medium, Bold), and stroke styles (Solid, Dashed, Dotted).
* **Hatching & Shading**: Organic vector interior shading including Solid, Hachure (single-diagonal), and Cross-hatch fills with customizable line spacing and angles.
* **Smart Shape Recognition**: Freehand sketches automatically classify and snap into clean geometric primitives upon completion.

### ⚡ Circuit & Engineering Components
* **Passives**: Zigzag Resistors (IEEE standard), Capacitors (anode/cathode leads), and 4-turn Inductors.
* **Sources & Grounds**: DC Voltage Sources (+/- polarity), AC Voltage Sources (sine wave), and Earth Ground symbols.
* **Semiconductors & Amplifiers**: Diodes (anode/cathode with triangle-bar symbol) and Operational Amplifiers (inverting/non-inverting terminals).
* **Logic Gates**: IEEE standard AND, OR, NOT, NAND, and XOR gates.
* **Integrated Circuits**: Configurable multi-pin IC boxes with customizable labels and pin definitions.
* **Auto-Binding Terminals**: Terminals detect nearby wires and snap connections automatically for rapid schematic creation.

### 🎨 Typography & Theming
* **Curated Technical Fonts**:
  * `Scribble` (Caveat) – Organic engineering handwriting
  * `Casual` (Comic Neue) – Clean architectural notes
  * `Heavy` (Lilita One) – Punchy header callouts
  * `CleanSans` (Nunito) – High-legibility technical specifications
* **10 Curated Themes**: Instant palette switching across Dark and Light environments (Rustly Forge Dark, Classic Slate, Cyber Glow, Blueprint, Solarized Light, Emerald Minimal, and more).

### 💾 Persistence & Export
* **Local-First Storage**: Drawings persist automatically to `localStorage` without requiring an account or network connection.
* **High-Resolution PNG Export**: Raster export with customizable pixel density scaling (1x, 2x, 3x) and optional transparent background.
* **Vector SVG Export**: Clean, scalable SVG output suitable for inclusion in academic papers, LaTeX, and web documentation.
* **Scene Graph JSON**: Portable JSON format preserving all raw element properties, z-indices, and component definitions.

### 🛠️ Interactive Developer Modals
* **Rust Architecture & Source Inspector**: Built-in interactive code viewer allowing users to examine the Rust modules (`lib.rs`, `engine.rs`, `sketch.rs`, `element.rs`, `local.rs`) and learn how the WASM pipeline is constructed.
* **Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid keyboard access to canvas actions, tools, exports, and view options.
* **Zen & View Modes**: Clean uncluttered presentation modes for focused sketching.

---

## Repository Structure

```text
rustly-forge/
├── Cargo.toml                 # Rust crate configuration & WASM dependencies
├── package.json               # Node.js dependencies & development scripts
├── vite.config.ts             # Vite bundler configuration with Tailwind CSS
├── tsconfig.json              # TypeScript compilation rules
├── metadata.json              # Applet metadata & capabilities
├── index.html                 # Main HTML entry point and Google Fonts loader
├── public/                    # Static assets served by Vite
│   ├── logo.png               # Rustly Forge primary logo
│   └── assets/
│       └── rustly-forge-logo.png
└── src/                       # Application source code
    ├── main.tsx               # React application mounting entry point
    ├── App.tsx                # Main layout, canvas toolbar & modal orchestration
    ├── index.css              # Tailwind CSS styles & liquid glass panel classes
    ├── types.ts               # Shared TypeScript types, enums, and interfaces
    ├── sketchEngine.ts        # Hand-drawn geometry algorithms & hatching math
    ├── engineeringComponents.ts# Circuit component catalog & terminal definitions
    ├── shapeRecognition.ts    # Ramer-Douglas-Peucker shape classifier
    ├── circuitPreset.ts       # Preloaded demonstration circuit schematic
    ├── themes.ts              # Theme definitions & color palette manager
    │
    ├── components/            # React UI components
    │   ├── Canvas.tsx         # HTML5 Canvas viewport & interaction controller
    │   ├── Toolbar.tsx        # Floating primary tool selection bar
    │   ├── PropertiesPanel.tsx# Stroke, fill, font, and sloppiness inspector
    │   ├── EngineeringSidebar.tsx # Schematic component library drawer
    │   ├── ExportModal.tsx    # PNG, SVG, and JSON export dialog
    │   ├── MainMenu.tsx       # Canvas settings, grid toggle & canvas background
    │   ├── CommandPalette.tsx # Keyboard-driven command search (Cmd+K)
    │   ├── RustCodeViewerModal.tsx # Rust & WASM architecture source viewer
    │   ├── ThemeModal.tsx     # Theme selector & color preview modal
    │   ├── CollabModal.tsx    # Live collaboration setup dialog
    │   ├── FontShowcaseModal.tsx   # Typography inspector & font preview
    │   └── PresentationController.tsx # Slide presentation controls
    │
    ├── lib.rs                 # Rust WASM module entry point
    ├── app.rs                 # Leptos CSR application component in Rust
    ├── canvas/                # Rust canvas engine
    │   ├── engine.rs          # 2D context manager, viewport math & animation
    │   └── sketch.rs          # Procedural sketching & jittering in Rust
    ├── model/                 # Rust data models
    │   └── element.rs         # Element structs, enums & Serde schemas
    └── storage/               # Rust storage and persistence
        └── local.rs           # gloo-storage local persistence & SVG exporter
```

---

## Getting Started

### Prerequisites

* **Node.js**: Version `18.0` or higher
* **npm**: Version `9.0` or higher (or `bun` / `pnpm`)
* *(Optional for compiling Rust WASM)*:
  * **Rust Toolchain**: `rustc` and `cargo` (edition 2021)
  * **wasm-pack**: `cargo install wasm-pack`

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rustly-forge.git
   cd rustly-forge
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Verify TypeScript compilation:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled assets will be output to the `dist/` directory.

---

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts the local Vite development server on port 3000 |
| `npm run build` | `vite build` | Compiles TypeScript and packages the production application |
| `npm run preview` | `vite preview` | Runs a local web server to preview the production build |
| `npm run lint` | `tsc --noEmit` | Runs the TypeScript compiler to validate types across the codebase |
| `npm run clean` | `rm -rf dist server.js` | Removes generated build artifacts and temporary files |

---

## Contributing

Rustly Forge is built by students and is open to anyone who wants to learn Rust, WebAssembly, computer graphics, or modern React. Contributions of all sizes are warmly welcomed!

### Good First Issues
* **Circuit Components**: Add new schematic symbols (e.g., Transformers, BJTs, MOSFETs, Zener Diodes) in `src/engineeringComponents.ts`.
* **Shape Recognition**: Refine corner-detection and circularity thresholds in `src/shapeRecognition.ts`.
* **Canvas Math**: Implement bezier-curve routing for circuit wires connecting terminal pins.
* **Themes**: Design new light or dark theme presets in `src/themes.ts`.
* **WASM Optimizations**: Benchmark and extend direct WebAssembly geometry calculations in `src/canvas/sketch.rs`.

### Workflow
1. Fork the repository and create a descriptive branch:
   ```bash
   git checkout -b feature/add-transformer-component
   ```
2. Make your modifications following existing coding patterns.
3. Verify that the TypeScript linter passes cleanly:
   ```bash
   npm run lint
   ```
4. Commit your changes with clear, concise commit messages:
   ```bash
   git commit -m "feat: add transformer circuit component with center-tap terminals"
   ```
5. Push to your fork and submit a Pull Request.

---

## Roadmap & Current Status

* **Status**: Active Open-Source Development (Alpha).
* **Current Focus**:
  * [x] Hybrid React + Rust/WASM codebase structure
  * [x] 14 fundamental circuit components with terminal pin snapping
  * [x] Rough hand-drawn vector rendering with hachure fills
  * [x] Local-first autosave, PNG, SVG, and JSON export
  * [x] Frame presentation mode & 10 custom themes
  * [ ] Direct shared-memory buffer rendering from WASM to HTML5 Canvas
  * [ ] Orthogonal auto-routing for circuit wire connections
  * [ ] Interactive circuit DC operating-point analysis
  * [ ] Real-time peer-to-peer WebRTC canvas synchronization

---

## Acknowledgments

* **The Rust & WebAssembly Community** for creating [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen), [`web-sys`](https://crates.io/crates/web-sys), and [`gloo`](https://github.com/rustwasm/gloo).
* **React & Vite Teams** for fast modern frontend iteration.
* **Rough.js** and the procedural computer graphics community for foundational research into algorithmic hand-drawn rendering and polygon hatching.
* **Lucide Icons** for the consistent icon set.

---

## License

License: Not yet specified.

