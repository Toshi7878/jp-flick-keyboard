# jp-flick-keyboard

iOS 風の日本語フリック入力キーボード React コンポーネント。かな・英字・数字記号の3モードと、フリックプレビューのポップアップ表示を備えています。

## インストール

```bash
pnpm add jp-flick-keyboard
```

`react` / `react-dom` (>=18) と Tailwind CSS が必要です（コンポーネントは Tailwind ユーティリティクラスでスタイリングされています）。

## 使い方

```tsx
import { useState } from "react";
import { FlickKeyboard, type FlickEvent, type FlickMode, applyMod } from "jp-flick-keyboard";

function Example() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<FlickMode>("kana");

  const handleEvent = (event: FlickEvent) => {
    switch (event.type) {
      case "tap":
        if (event.key.id === "mod") {
          setText((prev) => {
            const last = prev.slice(-1);
            const modded = applyMod(last);
            return modded == null ? prev : prev.slice(0, -1) + modded;
          });
        } else {
          setText((prev) => prev + event.key.c);
        }
        break;
      case "flick":
        setText((prev) => prev + event.char);
        break;
      case "space":
        setText((prev) => `${prev} `);
        break;
      case "delete":
        setText((prev) => prev.slice(0, -1));
        break;
      case "modeSwitch":
        setMode(event.to);
        break;
    }
  };

  return <FlickKeyboard onEvent={handleEvent} mode={mode} />;
}
```

## Props

| Prop | 型 | デフォルト | 説明 |
|---|---|---|---|
| `keys` | `FlickKey[]` | `FLICK_KEYS` | かなモードで表示するキー定義 |
| `onEvent` | `(event: FlickEvent) => void` | (必須) | キー操作時に発火するイベントハンドラ |
| `theme` | `"light" \| "dark"` | `"light"` | 配色テーマ |
| `threshold` | `number` | `26` | フリック方向判定のしきい値 (px) |
| `mode` | `"kana" \| "english" \| "number"` | `"kana"` | 表示モード |
| `isLineStart` | `boolean` | `false` | 行頭かどうか（濁点キーの表示切り替えに使用） |

PWA（ホーム画面に追加して起動した状態）で動作している場合は自動検出し、ホームインジケーター分の余白（`env(safe-area-inset-bottom)`、最小 20px）をキーボード下部に追加します。

## イベント (`FlickEvent`)

- `{ type: "tap", key }` — キーをタップ（フリックなし）
- `{ type: "flick", char }` — 上下左右いずれかにフリック
- `{ type: "space" }` — スペースキー
- `{ type: "delete" }` — 削除キー（⌫）。1文字削除
- `{ type: "modeSwitch", to }` — かな/英字/数字モードの切り替え

`mod` キー（小゛゜）は `tap` イベントの `key.id === "mod"` として通知されるので、エクスポートされている `applyMod(char)` を使って直前の文字を濁点・半濁点・小書きへ循環させてください。

## サンプルアプリ

`example/` に Vite + React + Tailwind の動作確認用サンプルがあります。

```bash
pnpm install
pnpm example:dev
```

## 開発

```bash
pnpm install
pnpm build       # tsup でビルド (dist/ に ESM/CJS + 型定義を出力)
pnpm typecheck
pnpm test        # vitest + Testing Library によるユニット/コンポーネントテスト
```
