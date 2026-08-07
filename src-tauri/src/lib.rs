use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalSize, Size, WindowEvent,
};

#[tauri::command]
fn resize_window(window: tauri::Window, width: u32, height: u32) {
    let size = Size::Physical(PhysicalSize::new(width, height));
    let _ = window.set_min_size(Some(size));
    let _ = window.set_max_size(Some(size));
    let _ = window.set_size(size);
}

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window) {
    let current = window.is_always_on_top().unwrap_or(false);
    let _ = window.set_always_on_top(!current);
}

#[tauri::command]
fn hide_window(window: tauri::Window) {
    let _ = window.hide();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };

                let boss_shortcut =
                    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyH);

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app, shortcut, event| {
                            if shortcut == &boss_shortcut && event.state() == ShortcutState::Pressed {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.hide();
                                }
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(boss_shortcut)?;
            }

            let show_item = MenuItemBuilder::with_id("show", "Show").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let menu = MenuBuilder::new(app)
                .item(&show_item)
                .separator()
                .item(&quit_item)
                .build()?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Ref")
                .on_menu_event(move |app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_maximizable(false);

                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    match event {
                        WindowEvent::CloseRequested { api, .. } => {
                            api.prevent_close();
                            let _ = window_clone.hide();
                        }
                        WindowEvent::Resized(_) => {
                            if window_clone.is_maximized().unwrap_or(false) {
                                let _ = window_clone.unmaximize();
                            }
                        }
                        _ => {}
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            resize_window,
            toggle_always_on_top,
            hide_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
