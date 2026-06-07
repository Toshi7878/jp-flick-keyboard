import { act, fireEvent, render, screen } from "@testing-library/react";
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
  const view = render(<FlickKeyboard onEvent={onEvent} {...props} />);
  return { onEvent, ...view };
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
    fireEvent.click(screen.getByLabelText("delete"));
    expect(onEvent).toHaveBeenCalledWith({ type: "delete" });

    fireEvent.click(screen.getByText("空白"));
    expect(onEvent).toHaveBeenCalledWith({ type: "space" });
  });

  it("delete アイコンを大きめに表示し、押したときに fill を黒くする", () => {
    setup();
    const deleteIcon = screen.getByLabelText("delete");
    const deleteShape = deleteIcon.firstElementChild;

    expect(deleteIcon).toHaveClass("h-6", "w-6");
    expect(deleteShape).toHaveClass("fill-none");

    fireEvent.pointerDown(deleteIcon);

    expect(deleteShape).toHaveClass("fill-black");
  });

  it("英字モードへの切り替えキーで modeSwitch イベントを発火する", () => {
    const { onEvent } = setup();
    fireEvent.click(screen.getByText("ABC"));
    expect(onEvent).toHaveBeenCalledWith({ type: "modeSwitch", to: "english" });
  });

  it("fnCell をタップすると light テーマの押されたフィードバック色に切り替わる", () => {
    setup();
    const fnKey = screen.getByText("ABC");

    expect(fnKey).toHaveClass("bg-[#B4B8C0]");

    fireEvent.pointerDown(fnKey);

    expect(fnKey).toHaveClass("bg-[#E3E5EA]");
  });

  it("contentCell をタップすると light テーマの押されたフィードバック色に切り替わる", () => {
    setup({ mode: "english" });
    const keyFace = screen.getByText("DEF");
    const contentKey = keyFace.parentElement;

    expect(contentKey).toHaveClass("bg-white");

    fireEvent.pointerDown(keyFace, { clientX: 100, clientY: 100 });

    expect(contentKey).toHaveClass("bg-[#E3E5EA]");

    fireEvent.pointerUp(window, { clientX: 100, clientY: 100 });
  });

  it("popup が表示される前にフリックした場合は入力される文字の quick popup を表示する", () => {
    vi.useFakeTimers();
    setup({ threshold: 10 });

    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });

    const quickPopup = screen.getByTestId("quick-flick-popup");
    expect(quickPopup).toHaveTextContent("え");
    expect(quickPopup).toHaveClass("rounded-[7px]");
    expect(quickPopup).toHaveStyle({ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId("quick-flick-popup")).toHaveTextContent("え");
    expect(screen.getByText("え")).not.toHaveClass("bg-[#2E92FA]");

    fireEvent.pointerUp(window, { clientX: 140, clientY: 100 });
    vi.useRealTimers();
  });

  it("light テーマでは popup の非選択セル背景を白にする", () => {
    vi.useFakeTimers();

    setup();
    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText("い")).toHaveClass("bg-white");

    fireEvent.pointerUp(window, { clientX: 100, clientY: 100 });
    vi.useRealTimers();
  });

  it("action がない controlCell もタップすると light テーマの押されたフィードバック色に切り替わる", () => {
    const { container } = setup();
    const controlCell = container.querySelector('[data-key-id="mod2"]');
    const controlKey = controlCell?.firstElementChild;

    expect(controlKey).toHaveClass("bg-[#B4B8C0]");

    fireEvent.pointerDown(controlCell as Element);

    expect(controlKey).toHaveClass("bg-[#E3E5EA]");

    fireEvent.pointerUp(controlCell as Element);

    expect(controlKey).toHaveClass("bg-[#E3E5EA]");
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
