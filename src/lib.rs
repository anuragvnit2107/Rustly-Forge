//! WASM entry point for Rustly Forge Rust / WebAssembly canvas.
//!
//! Provides the entry point `main()` or `init_wasm()` called upon WebAssembly instantiation,
//! sets up panic hooks, initializes Leptos CSR mount point, and exports JS bindings.

use wasm_bindgen::prelude::*;

pub mod app;
pub mod canvas;
pub mod model;
pub mod storage;

/// Called automatically when WASM is loaded.
#[wasm_bindgen(start)]
pub fn main() {
    // Set panic hook so Rust panics print readable stack traces in browser console
    console_error_panic_hook::set_once();

    // Mount Leptos UI component onto `#root` or `<body/>`
    leptos::mount_to_body(|| {
        leptos::view! { <app::App /> }
    });
}

/// Standalone entry point if called manually from JavaScript
#[wasm_bindgen]
pub fn run_app() -> Result<(), JsValue> {
    main();
    Ok(())
}
