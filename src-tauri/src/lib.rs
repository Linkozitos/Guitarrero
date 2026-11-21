// Casca nativa do Guitarrero: inicializa o Tauri e os plugins dialog e fs. Toda a regra de negócio fica no TypeScript.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
