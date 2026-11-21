import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Caminho absoluto de uma pasta do projeto, a partir da raiz (onde está este arquivo). */
function fromRoot(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

// Aliases de camada (ADR-006): os mesmos de "paths" no tsconfig.app.json.
// O Vitest herda estes aliases pelo vitest.config.ts.
const layerAliases = {
  "@app": fromRoot("./src/app"),
  "@ui-kit": fromRoot("./src/ui-kit"),
  "@core": fromRoot("./src/core"),
  "@audio": fromRoot("./src/audio"),
  "@persistence": fromRoot("./src/persistence"),
  "@services": fromRoot("./src/services"),
  "@modules": fromRoot("./src/modules"),
};

// Endereço do servidor de desenvolvimento quando o app roda em outro aparelho
// (usado só pelo Tauri mobile; no Windows fica vazio).
const tauriDevHost = process.env.TAURI_DEV_HOST;
const remoteHost =
  tauriDevHost !== undefined && tauriDevHost.length > 0 ? tauriDevHost : null;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: layerAliases,
  },
  // Opções do Vite para o Tauri:
  // 1. não esconder os erros do Rust no terminal;
  clearScreen: false,
  server: {
    // 2. o Tauri espera a porta fixa 1420 e falha se ela estiver ocupada;
    port: 1420,
    strictPort: true,
    host: remoteHost ?? false,
    ...(remoteHost === null
      ? {}
      : { hmr: { protocol: "ws", host: remoteHost, port: 1421 } }),
    // 3. não observar a pasta src-tauri.
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
