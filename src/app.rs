//! Leptos CSR root component for Rustly Forge WASM canvas.
//!
//! Renders the top floating toolbar (shapes, tool locking, shortcuts),
//! the left floating styling panel (stroke colors, backgrounds, width, roughness),
//! bottom zoom/undo-redo bar, and the interactive canvas viewport.

use leptos::*;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::JsCast;
use web_sys::HtmlCanvasElement;

use crate::canvas::engine::CanvasEngine;
use crate::model::element::*;
use crate::storage::local::*;

#[component]
pub fn App() -> impl IntoView {
    // Reactive application state signals
    let (active_tool, set_active_tool) = create_signal(ElementType::Rectangle);
    let (is_locked, set_is_locked) = create_signal(false);
    let (stroke_color, set_stroke_color) = create_signal("#e03131".to_string());
    let (background_color, set_background_color) = create_signal("transparent".to_string());
    let (stroke_width, set_stroke_width) = create_signal(2.0f64);
    let (roughness, set_roughness) = create_signal(1.0f32);
    let (opacity, set_opacity) = create_signal(1.0f64);
    let (zoom_level, set_zoom_level) = create_signal(100i32);
    let (menu_open, set_menu_open) = create_signal(false);

    let scene_graph = Rc::new(RefCell::new(SceneGraph::new()));
    let canvas_ref = create_node_ref::<html::Canvas>();

    // Mount canvas engine on mount
    create_effect(move |_| {
        if let Some(canvas_elem) = canvas_ref.get() {
            let html_canvas: HtmlCanvasElement = canvas_elem.unchecked_into();
            
            // Load saved elements from localStorage
            if let Some(saved_elements) = load_from_local_storage() {
                scene_graph.borrow_mut().elements = saved_elements;
            }

            if let Ok(mut engine) = CanvasEngine::new(html_canvas, scene_graph.clone()) {
                engine.active_tool = active_tool.get();
                engine.render();
            }
        }
    });

    view! {
        <div class="relative w-screen h-screen overflow-hidden bg-[#121212] text-[#e3e3e8] font-sans select-none">
            // Top Header Bar
            <header class="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                // Left Menu Toggle
                <div class="pointer-events-auto flex items-center gap-2">
                    <button
                        on:click=move |_| set_menu_open.update(|v| *v = !*v)
                        class="p-2.5 rounded-lg bg-[#232329] hover:bg-[#2b2b33] border border-[#31303b] text-white shadow-lg transition"
                        title="Main Menu"
                    >
                        <span class="text-lg leading-none">"â°"</span>
                    </button>
                    <span class="font-bold text-sm tracking-wide text-[#a5a5b5] hidden sm:inline">
                        "Rustly Forge"
                    </span>
                </div>

                // Centered Floating Toolbar
                <div class="pointer-events-auto flex items-center gap-1 p-1 bg-[#232329] border border-[#31303b] rounded-xl shadow-2xl backdrop-blur-md">
                    // Tool lock button
                    <button
                        on:click=move |_| set_is_locked.update(|l| *l = !*l)
                        class=move || format!(
                            "p-2 rounded-lg transition text-xs font-semibold {}",
                            if is_locked.get() { "bg-[#6965db] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Lock active tool"
                    >
                        "ð"
                    </button>
                    <div class="w-[1px] h-5 bg-[#3c3b47] mx-1"></div>

                    // Tools: Rect, Diamond, Ellipse, Arrow, Line, Pencil, Text
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Rectangle)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Rectangle { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Rectangle (2)"
                    >
                        "â¢"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Diamond)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Diamond { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Diamond (3)"
                    >
                        "â"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Ellipse)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Ellipse { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Ellipse (4)"
                    >
                        "â"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Arrow)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Arrow { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Arrow (5)"
                    >
                        "â"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Line)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Line { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Line (6)"
                    >
                        "â"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Freedraw)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Freedraw { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Pencil (7)"
                    >
                        "â"
                    </button>
                    <button
                        on:click=move |_| set_active_tool.set(ElementType::Text)
                        class=move || format!(
                            "p-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition {}",
                            if active_tool.get() == ElementType::Text { "bg-[#4a47b1] text-white" } else { "text-[#a5a5b5] hover:bg-[#2e2e38]" }
                        )
                        title="Text (8)"
                    >
                        "A"
                    </button>
                </div>

                // Right actions
                <div class="pointer-events-auto flex items-center gap-2">
                    <button
                        class="px-3 py-1.5 rounded-lg bg-[#2e2e38] text-xs font-medium text-white hover:bg-[#393946] border border-[#3e3d4c] transition shadow-md"
                        title="Live Collaboration E2EE"
                    >
                        "Share"
                    </button>
                </div>
            </header>

            // Left Properties Panel
            <aside class="absolute top-20 left-4 z-20 w-52 p-3 bg-[#232329]/95 backdrop-blur-md border border-[#31303b] rounded-xl shadow-2xl flex flex-col gap-3">
                <div>
                    <span class="text-[11px] font-semibold text-[#8e8d9e] uppercase tracking-wider">"Stroke"</span>
                    <div class="flex items-center gap-1.5 mt-1.5">
                        <button
                            on:click=move |_| set_stroke_color.set("#e03131".to_string())
                            class="w-6 h-6 rounded-md bg-[#e03131] border border-white/20 transition hover:scale-105"
                        />
                        <button
                            on:click=move |_| set_stroke_color.set("#2f9e44".to_string())
                            class="w-6 h-6 rounded-md bg-[#2f9e44] border border-white/20 transition hover:scale-105"
                        />
                        <button
                            on:click=move |_| set_stroke_color.set("#1971c2".to_string())
                            class="w-6 h-6 rounded-md bg-[#1971c2] border border-white/20 transition hover:scale-105"
                        />
                        <button
                            on:click=move |_| set_stroke_color.set("#f08c00".to_string())
                            class="w-6 h-6 rounded-md bg-[#f08c00] border border-white/20 transition hover:scale-105"
                        />
                        <button
                            on:click=move |_| set_stroke_color.set("#ffffff".to_string())
                            class="w-6 h-6 rounded-md bg-[#ffffff] border border-white/20 transition hover:scale-105"
                        />
                    </div>
                </div>

                <div>
                    <span class="text-[11px] font-semibold text-[#8e8d9e] uppercase tracking-wider">"Roughness"</span>
                    <div class="flex items-center gap-1 mt-1.5 bg-[#1b1b20] p-1 rounded-lg border border-[#2f2e3a]">
                        <button
                            on:click=move |_| set_roughness.set(0.0)
                            class=move || format!(
                                "flex-1 py-1 text-center text-xs rounded transition {}",
                                if roughness.get() == 0.0 { "bg-[#4a47b1] text-white" } else { "text-[#8e8d9e] hover:text-white" }
                            )
                        >
                            "Architect"
                        </button>
                        <button
                            on:click=move |_| set_roughness.set(1.0)
                            class=move || format!(
                                "flex-1 py-1 text-center text-xs rounded transition {}",
                                if roughness.get() == 1.0 { "bg-[#4a47b1] text-white" } else { "text-[#8e8d9e] hover:text-white" }
                            )
                        >
                            "Artist"
                        </button>
                        <button
                            on:click=move |_| set_roughness.set(2.5)
                            class=move || format!(
                                "flex-1 py-1 text-center text-xs rounded transition {}",
                                if roughness.get() == 2.5 { "bg-[#4a47b1] text-white" } else { "text-[#8e8d9e] hover:text-white" }
                            )
                        >
                            "Cartoonist"
                        </button>
                    </div>
                </div>
            </aside>

            // Main Canvas Element
            <canvas
                node_ref=canvas_ref
                class="w-full h-full block cursor-crosshair"
            />

            // Bottom Left Zoom & History Controls
            <div class="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-[#232329] border border-[#31303b] p-1 rounded-xl shadow-xl">
                <button
                    on:click=move |_| set_zoom_level.update(|z| *z = (*z - 10).max(10))
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2f2e3a] text-sm"
                >
                    "-"
                </button>
                <span class="text-xs font-medium px-1 text-[#b1b1c2]">
                    {move || format!("{}%", zoom_level.get())}
                </span>
                <button
                    on:click=move |_| set_zoom_level.update(|z| *z = (*z + 10).min(500))
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2f2e3a] text-sm"
                >
                    "+"
                </button>
            </div>
        </div>
    }
}
