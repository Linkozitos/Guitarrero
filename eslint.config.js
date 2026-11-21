// Configuração do ESLint (flat config).
// As regras de camada implementam a tabela "Quem pode importar quem" do CLAUDE.md (ADR-006).
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * Escapa um texto para uso literal dentro de uma expressão regular.
 * @param {string} text
 * @returns {string}
 */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Import pelo nome e por qualquer subcaminho: tree("@core") aceita "@core" e "@core/music".
 * @param {string} name
 * @returns {string}
 */
function tree(name) {
  return `${escapeRegExp(name)}(?:/|$)`;
}

/**
 * Import só pelo nome exato: exact("@modules/timbre") aceita a porta pública e nada abaixo dela.
 * @param {string} name
 * @returns {string}
 */
function exact(name) {
  return `${escapeRegExp(name)}$`;
}

const RULE_HINT = "Tabela 'Quem pode importar quem' do CLAUDE.md.";
const OTHER_MODULE_NOTE =
  "Um módulo nunca importa o outro: o que os dois usam mora em core.";
const INTERNAL_ALIASES = [
  "@app",
  "@ui-kit",
  "@core",
  "@audio",
  "@persistence",
  "@services",
  "@modules",
];
const ANY_INTERNAL = `(?:${INTERNAL_ALIASES.map(tree).join("|")})`;

// Vale em src/ e tests/: quem sai da própria pasta usa o alias, então as regras de camada
// só precisam olhar aliases e pacotes.
const PARENT_DIR_PATTERN = {
  regex: "^\\.\\.(?:/|$)",
  message:
    "Import relativo que sobe de pasta (../) é proibido: use o alias (@app, @ui-kit, @core, @audio, @persistence, @services ou @modules).",
};
const TAURI_DENIED_PATTERN = {
  regex: "^@tauri-apps/",
  caseSensitive: true,
  message: `@tauri-apps/* só entra nas camadas persistence (src/persistence e src/modules/X/persistence). ${RULE_HINT}`,
};
const TAURI_FS_DIALOG_ONLY_PATTERN = {
  regex: "^@tauri-apps/(?!plugin-fs(?:/|$)|plugin-dialog(?:/|$))",
  caseSensitive: true,
  message: `Nas camadas persistence, do Tauri só entram @tauri-apps/plugin-fs e @tauri-apps/plugin-dialog. ${RULE_HINT}`,
};

const NETWORK_MESSAGE =
  "Rede só na camada services (ADR-002): fetch, XMLHttpRequest, WebSocket e EventSource ficam em src/services.";
const NETWORK_GLOBALS = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
].map((name) => ({ name, message: NETWORK_MESSAGE }));
const NETWORK_PROPERTIES = ["window", "globalThis", "self"].map((object) => ({
  object,
  property: "fetch",
  message: NETWORK_MESSAGE,
}));
const DOM_AUDIO_MESSAGE = `Camada pura (core e domain): sem DOM nem Web Audio. ${RULE_HINT}`;
const DOM_AUDIO_GLOBALS = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "AudioContext",
  "OfflineAudioContext",
  "AudioWorkletNode",
  "MediaRecorder",
].map((name) => ({ name, message: DOM_AUDIO_MESSAGE }));

/**
 * @typedef {object} Layer
 * @property {string} name Nome da camada nas mensagens de erro.
 * @property {string[]} files Arquivos da camada (globs sem sobreposição entre camadas).
 * @property {string[]} allow Imports permitidos, montados com tree() ou exact().
 * @property {string} allowText Os imports permitidos, em texto, para a mensagem ("" = nenhum).
 * @property {boolean} strict true: nenhum pacote além dos listados em allow (core, domain e
 *   persistence). false: pacotes liberados, exceto os do Tauri.
 * @property {string} [note] Explicação extra na mensagem de erro.
 * @property {boolean} [tauriFsDialog] Persistence de módulo: libera só plugin-fs e plugin-dialog.
 * @property {boolean} [network] Só services: pode usar fetch e afins.
 * @property {boolean} [pure] Core e domain: sem DOM nem Web Audio.
 */

/**
 * @param {Layer} layer
 * @returns {string}
 */
function layerMessage(layer) {
  let rule;
  if (layer.strict) {
    rule =
      layer.allowText === ""
        ? "só importa ./ da mesma pasta"
        : `só importa ${layer.allowText} (e ./ da mesma pasta)`;
  } else {
    rule =
      layer.allowText === ""
        ? "não importa nenhuma camada do app"
        : `das camadas do app, só importa ${layer.allowText}`;
  }
  const note = layer.note === undefined ? "" : ` ${layer.note}`;
  return `Camada ${layer.name}: ${rule}.${note} ${RULE_HINT}`;
}

/**
 * Lista completa de proibições da camada. No flat config, quando duas configurações casam com o
 * mesmo arquivo, a última substitui as opções inteiras da regra; por isso cada camada repete
 * a proibição de ../ e as regras do Tauri. Os padrões não se sobrepõem: cada import proibido
 * gera uma só mensagem.
 * @param {Layer} layer
 * @returns {import("eslint").Linter.Config}
 */
function layerConfig(layer) {
  const notAllowed =
    layer.allow.length > 0 ? `(?!(?:${layer.allow.join("|")}))` : "";
  const message = layerMessage(layer);
  const patterns = layer.strict
    ? [
        PARENT_DIR_PATTERN,
        { regex: `^(?!\\.)${notAllowed}`, caseSensitive: true, message },
      ]
    : [
        PARENT_DIR_PATTERN,
        {
          regex: `^${notAllowed}${ANY_INTERNAL}`,
          caseSensitive: true,
          message,
        },
        layer.tauriFsDialog === true
          ? TAURI_FS_DIALOG_ONLY_PATTERN
          : TAURI_DENIED_PATTERN,
      ];
  const restrictedGlobals =
    layer.pure === true
      ? [...DOM_AUDIO_GLOBALS, ...NETWORK_GLOBALS]
      : NETWORK_GLOBALS;
  return {
    name: `guitarrero/camada/${layer.name}`,
    files: layer.files,
    rules: {
      "no-restricted-imports": ["error", { patterns }],
      "no-restricted-globals":
        layer.network === true ? "off" : ["error", ...restrictedGlobals],
      "no-restricted-properties":
        layer.network === true ? "off" : ["error", ...NETWORK_PROPERTIES],
    },
  };
}

/**
 * Camadas de um módulo (timbre ou tab).
 * @param {string} module
 * @returns {Layer[]}
 */
function moduleLayers(module) {
  const own = `@modules/${module}`;
  return [
    {
      name: `modules/${module} (porta pública)`,
      files: [`src/modules/${module}/*.{ts,tsx}`],
      allow: [tree(own)],
      allowText: `as camadas do próprio módulo (${own}/...)`,
      strict: false,
      note: OTHER_MODULE_NOTE,
    },
    {
      name: `modules/${module}/domain`,
      files: [`src/modules/${module}/domain/**/*.{ts,tsx}`],
      allow: [tree("@core"), tree(`${own}/domain`)],
      allowText: `@core e ${own}/domain`,
      strict: true,
      pure: true,
      note: `Domínio puro: sem pacotes. ${OTHER_MODULE_NOTE}`,
    },
    {
      name: `modules/${module}/audio`,
      files: [`src/modules/${module}/audio/**/*.{ts,tsx}`],
      allow: [
        tree("@core"),
        tree("@audio"),
        tree(`${own}/domain`),
        tree(`${own}/audio`),
      ],
      allowText: `@core, @audio e ${own}/domain`,
      strict: false,
      note: OTHER_MODULE_NOTE,
    },
    {
      name: `modules/${module}/persistence`,
      files: [`src/modules/${module}/persistence/**/*.{ts,tsx}`],
      allow: [
        tree("@core"),
        tree("@persistence"),
        tree(`${own}/domain`),
        tree(`${own}/persistence`),
      ],
      allowText: `@core, @persistence e ${own}/domain`,
      strict: false,
      tauriFsDialog: true,
      note: OTHER_MODULE_NOTE,
    },
    {
      name: `modules/${module}/state`,
      files: [`src/modules/${module}/state/**/*.{ts,tsx}`],
      allow: [
        tree("@core"),
        tree(`${own}/domain`),
        tree(`${own}/persistence`),
        tree(`${own}/state`),
      ],
      allowText: `@core, ${own}/domain e ${own}/persistence`,
      strict: false,
      note: OTHER_MODULE_NOTE,
    },
    {
      name: `modules/${module}/ui`,
      files: [`src/modules/${module}/ui/**/*.{ts,tsx}`],
      allow: [
        tree("@ui-kit"),
        tree("@core"),
        tree("@services"),
        tree(`${own}/domain`),
        tree(`${own}/audio`),
        tree(`${own}/persistence`),
        tree(`${own}/state`),
        tree(`${own}/ui`),
      ],
      allowText: `@ui-kit, @core, @services e as camadas do próprio módulo (${own}/...)`,
      strict: false,
      note: OTHER_MODULE_NOTE,
    },
  ];
}

/** @type {Layer[]} */
const LAYERS = [
  // Padrão fechado para qualquer pasta de src/ fora da arquitetura. As camadas abaixo vêm
  // depois e substituem este padrão nos arquivos delas.
  {
    name: "src (pasta fora da arquitetura)",
    files: ["src/**/*.{ts,tsx}"],
    allow: [],
    allowText: "",
    strict: false,
    note: "Pasta nova em src/ precisa entrar antes na tabela do CLAUDE.md e no eslint.config.js.",
  },
  {
    name: "src (bootstrap)",
    files: ["src/*.{ts,tsx}"],
    allow: [tree("@app"), tree("@ui-kit")],
    allowText: "@app e @ui-kit",
    strict: false,
  },
  {
    name: "app",
    files: ["src/app/**/*.{ts,tsx}"],
    allow: [
      tree("@app"),
      tree("@ui-kit"),
      tree("@core"),
      exact("@modules/timbre"),
      exact("@modules/tab"),
    ],
    allowText:
      "@ui-kit, @core e as portas públicas @modules/timbre e @modules/tab",
    strict: false,
  },
  {
    name: "ui-kit",
    files: ["src/ui-kit/**/*.{ts,tsx}"],
    allow: [tree("@ui-kit"), tree("@core")],
    allowText: "@core",
    strict: false,
  },
  {
    name: "core",
    files: ["src/core/**/*.{ts,tsx}"],
    allow: [tree("@core")],
    allowText: "@core",
    strict: true,
    pure: true,
    note: "Núcleo puro: sem pacotes (nada de React, DOM, Web Audio, Tauri, zustand ou rede).",
  },
  {
    name: "audio",
    files: ["src/audio/**/*.{ts,tsx}"],
    allow: [tree("@audio"), tree("@core")],
    allowText: "@core",
    strict: false,
  },
  {
    name: "persistence",
    files: ["src/persistence/**/*.{ts,tsx}"],
    allow: [
      tree("@persistence"),
      tree("@core"),
      tree("zod"),
      tree("@tauri-apps/plugin-fs"),
      tree("@tauri-apps/plugin-dialog"),
    ],
    allowText: "@core, zod, @tauri-apps/plugin-fs e @tauri-apps/plugin-dialog",
    strict: true,
  },
  {
    name: "services",
    files: ["src/services/**/*.{ts,tsx}"],
    allow: [tree("@services"), tree("@core")],
    allowText: "@core",
    strict: false,
    network: true,
  },
  {
    name: "modules (raiz)",
    files: ["src/modules/*.{ts,tsx}"],
    allow: [],
    allowText: "",
    strict: true,
    note: "O código dos módulos mora em src/modules/timbre e src/modules/tab.",
  },
  ...moduleLayers("timbre"),
  ...moduleLayers("tab"),
];

export default defineConfig([
  globalIgnores(
    [
      "docs/",
      "tools/",
      "_instalacao/",
      "_relatorios/",
      "_scaffold_tmp/",
      "dist/",
      "src-tauri/",
      "pnpm-lock.yaml",
      "**/*.md",
    ],
    "guitarrero/ignorados",
  ),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    name: "guitarrero/typescript",
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ...reactHooks.configs.flat.recommended,
    name: "guitarrero/react-hooks",
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
  },
  {
    name: "guitarrero/tests",
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [PARENT_DIR_PATTERN] }],
    },
  },
  ...LAYERS.map(layerConfig),
]);
