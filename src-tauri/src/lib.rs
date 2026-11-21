// Casca nativa do Guitarrero: só inicializa o Tauri. Toda a regra de negócio fica no TypeScript.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
