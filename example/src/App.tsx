import { useState } from "react";
import { applyMod, type FlickEvent, FlickKeyboard, type FlickMode } from "jp-flick-keyboard";

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
    <div className="mx-auto flex min-h-screen max-w-sm flex-col gap-4 bg-neutral-100 p-4">
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
          className="rounded-md bg-neutral-300 px-3 py-1.5 text-sm text-neutral-800"
        >
          クリア
        </button>
      </div>

      <div className="min-h-24 whitespace-pre-wrap rounded-md border border-neutral-300 bg-white p-3 text-base">
        {text || <span className="text-neutral-400">ここに入力結果が表示されます</span>}
      </div>

      <div className="text-neutral-500 text-xs">
        現在のモード: {mode} / 行頭: {isLineStart ? "はい" : "いいえ"}
      </div>

      <div className="mt-auto -mx-4 -mb-4">
        <FlickKeyboard onEvent={handleEvent} theme={theme} mode={mode} isLineStart={isLineStart} />
      </div>
    </div>
  );
}
