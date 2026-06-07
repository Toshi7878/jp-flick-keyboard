import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { applyMod, dirOf, type FlickEvent, FlickKeyboard } from "./flick-keyboard";

describe("applyMod", () => {
  it("濁点・半濁点・小書きの順で文字を循環させる", () => {
    expect(applyMod("あ")).toBe("ぁ");
    expect(applyMod("ぁ")).toBe("あ");
    expect(applyMod("は")).toBe("ば");
    expect(applyMod("ば")).toBe("ぱ");
    expect(applyMod("ぱ")).toBe("は");
    expect(applyMod("つ")).toBe("づ");
    expect(applyMod("づ")).toBe("っ");
    expect(applyMod("っ")).toBe("つ");
  });

  it("循環対象でない文字は null を返す", () => {
    expect(applyMod("ん")).toBeNull();
    expect(applyMod("a")).toBeNull();
  });
});

describe("dirOf", () => {
  it("移動量がしきい値以内の場合は 'c' を返す", () => {
    expect(dirOf(0, 0, 26)).toBe("c");
    expect(dirOf(10, -10, 26)).toBe("c");
  });

  it("しきい値を超えた横方向のフリックを検出する", () => {
    expect(dirOf(40, 0, 26)).toBe("r");
    expect(dirOf(-40, 0, 26)).toBe("l");
  });

  it("しきい値を超えた縦方向のフリックを検出する", () => {
    expect(dirOf(0, 40, 26)).toBe("d");
    expect(dirOf(0, -40, 26)).toBe("u");
  });

  it("移動量の大きい軸の方向を優先する", () => {
    expect(dirOf(50, 10, 26)).toBe("r");
    expect(dirOf(10, 50, 26)).toBe("d");
  });
});

function setup(props?: Partial<React.ComponentProps<typeof FlickKeyboard>>) {
  const onEvent = vi.fn<(event: FlickEvent) => void>();
  render(<FlickKeyboard onEvent={onEvent} {...props} />);
  return { onEvent };
}

describe("FlickKeyboard", () => {
  it("デフォルトでかなキーボードを表示する", () => {
    setup();
    expect(screen.getByText("あ")).toBeInTheDocument();
    expect(screen.getByText("ら")).toBeInTheDocument();
  });

  it("動かさずに離すと tap イベントを発火する", () => {
    const { onEvent } = setup();
    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 100, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "tap", key: expect.objectContaining({ id: "a", c: "あ" }) });
  });

  it("しきい値を超えてドラッグすると flick イベントを発火する", () => {
    const { onEvent } = setup({ threshold: 10 });
    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 140, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "flick", char: "え" });
  });

  it("文字が割り当てられていない方向へフリックした場合は tap にフォールバックする", () => {
    const { onEvent } = setup({ threshold: 10 });
    fireEvent.pointerDown(screen.getByText("小゛゜"), { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 140, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "tap", key: expect.objectContaining({ id: "mod", c: "小" }) });
  });

  it("削除キーとスペースキーがそれぞれ delete / space イベントを発火する", () => {
    const { onEvent } = setup();
    fireEvent.click(screen.getByText("⌫"));
    expect(onEvent).toHaveBeenCalledWith({ type: "delete" });

    fireEvent.click(screen.getByText("空白"));
    expect(onEvent).toHaveBeenCalledWith({ type: "space" });
  });

  it("英字モードへの切り替えキーで modeSwitch イベントを発火する", () => {
    const { onEvent } = setup();
    fireEvent.click(screen.getByText("ABC"));
    expect(onEvent).toHaveBeenCalledWith({ type: "modeSwitch", to: "english" });
  });

  it("isLineStart が true のとき mod キーに行頭インジケーターを表示する", () => {
    setup({ isLineStart: true });
    expect(screen.getByText("^^")).toBeInTheDocument();
  });

  it("英字キーボードを表示し、caps キーはイベントを発火せずに大文字/小文字を切り替える", () => {
    const { onEvent } = setup({ mode: "english" });
    expect(screen.getByText("DEF")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText("A/a"), { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(window, { clientX: 0, clientY: 0 });

    expect(screen.getByText("a/A")).toBeInTheDocument();
    expect(screen.getByText("def")).toBeInTheDocument();
    expect(onEvent).not.toHaveBeenCalled();
  });
});
