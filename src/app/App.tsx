import { useState } from "react";
import { Guitar, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { TabScreen } from "@modules/tab";
import { TimbreScreen } from "@modules/timbre";

type ModuleId = "timbre" | "tab";

interface ModuleEntry {
  readonly id: ModuleId;
  readonly label: string;
  readonly Icon: LucideIcon;
}

/** Módulos do Guitarrero, na ordem dos botões da barra superior. */
const MODULES: readonly ModuleEntry[] = [
  { id: "timbre", label: "Timbre", Icon: SlidersHorizontal },
  { id: "tab", label: "TAB", Icon: Guitar },
];

interface ModuleButtonProps {
  readonly entry: ModuleEntry;
  readonly isActive: boolean;
  readonly onSelect: (id: ModuleId) => void;
}

/**
 * Botão de módulo: alvo de 40 x 40 px no mínimo. O estado aberto vem só do aria-current
 * (sublinhado amber e texto principal); ao abrir o app nenhum botão tem esse atributo.
 * O foco pelo teclado usa o anel global de src/ui-kit/theme/global.css.
 */
function ModuleButton({ entry, isActive, onSelect }: ModuleButtonProps) {
  const { id, label, Icon } = entry;
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={() => {
        onSelect(id);
      }}
      className="relative inline-flex h-10 min-w-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-2 transition-colors after:absolute after:inset-x-4 after:bottom-1 after:h-0 after:border-b-2 after:border-transparent hover:bg-bg-2 hover:text-fg-1 motion-reduce:transition-none aria-[current=page]:text-fg-1 aria-[current=page]:after:border-accent-amber"
    >
      <Icon aria-hidden="true" size={20} />
      {label}
    </button>
  );
}

/** Abertura neutra, padrão aprovado pelo Link: nenhum módulo selecionado. */
function ModulePrompt() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-xl font-semibold text-fg-1">Escolha um módulo</h1>
      <p className="text-fg-2">
        Use os botões Timbre ou TAB na barra superior.
      </p>
    </div>
  );
}

function ModuleScreen({ moduleId }: { readonly moduleId: ModuleId }) {
  switch (moduleId) {
    case "timbre":
      return <TimbreScreen />;
    case "tab":
      return <TabScreen />;
  }
}

/** Shell da janela: barra superior com os módulos e área central. */
export function App() {
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-8 border-b border-bg-2 bg-bg-1 px-8">
        <span className="text-xl font-semibold text-fg-1">Guitarrero</span>
        <nav aria-label="Módulos">
          <ul className="flex items-center gap-2">
            {MODULES.map((entry) => (
              <li key={entry.id}>
                <ModuleButton
                  entry={entry}
                  isActive={activeModule === entry.id}
                  onSelect={setActiveModule}
                />
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center p-8">
        {activeModule === null ? (
          <ModulePrompt />
        ) : (
          <ModuleScreen moduleId={activeModule} />
        )}
      </main>
    </div>
  );
}
