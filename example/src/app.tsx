import { applyMod, type FlickEvent, FlickKeyboard, type FlickMode } from "jp-flick-keyboard";
import { useState } from "react";

export function App() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<FlickMode>("kana");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const isLineStart = text.length === 0 || text.endsWith("\n");

  const handleEvent = (event: FlickEvent) => {
    switch (event.type) {
      case "tap": {
        if (event.key.id === "mod") {
          setText((prev) => {
            if (prev.length === 0) return prev;
            const last = prev.slice(-1);
            const modded = applyMod(last);
            return modded == null ? prev : prev.slice(0, -1) + modded;
          });
          return;
        }
        setText((prev) => prev + event.key.c);
        return;
      }
      case "flick":
        setText((prev) => prev + event.char);
        return;
      case "space":
        setText((prev) => `${prev} `);
        return;
      case "delete":
        setText((prev) => prev.slice(0, -1));
        return;
      case "mod":
        return;
      case "modeSwitch":
        setMode(event.to);
        return;
    }
  };

  return (
    <div className="mx-auto flex h-dvh max-w-sm flex-col overflow-hidden bg-neutral-100">
      <div className="flex shrink-0 flex-col gap-3 p-4 pb-2">
        <h1 className="font-semibold text-lg">jp-flick-keyboard サンプル</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-white"
          >
            テーマ: {theme === "light" ? "ライト" : "ダーク"}
          </button>
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-md bg-neutral-300 px-3 py-1.5 text-neutral-800 text-sm"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="mx-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-md border border-neutral-300 bg-white p-3 text-base">
        {text || <span className="text-neutral-400">ここに入力結果が表示されます</span>}
      </div>

      <div className="shrink-0 px-4 py-2 text-neutral-500 text-xs">
        現在のモード: {mode} / 行頭: {isLineStart ? "はい" : "いいえ"}
      </div>

      <div className="shrink-0">
        <FlickKeyboard
          onEvent={handleEvent}
          theme={theme}
          mode={mode}
          isLineStart={isLineStart}
          candidateBar={
            <div
              className={`flex h-10 items-center truncate px-3 ${theme === "dark" ? "text-white" : "text-[#1A1A1A]"}`}
            >
              {text}
            </div>
          }
        />
      </div>
    </div>
  );
}
