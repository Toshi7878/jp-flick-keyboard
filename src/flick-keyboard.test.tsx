import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { applyMod, dirOf, type FlickEvent, FlickKeyboard } from "./flick-keyboard";

describe("applyMod", () => {
  it("cycles a base character through its dakuten/handakuten/small forms", () => {
    expect(applyMod("あ")).toBe("ぁ");
    expect(applyMod("ぁ")).toBe("あ");
    expect(applyMod("は")).toBe("ば");
    expect(applyMod("ば")).toBe("ぱ");
    expect(applyMod("ぱ")).toBe("は");
    expect(applyMod("つ")).toBe("づ");
    expect(applyMod("づ")).toBe("っ");
    expect(applyMod("っ")).toBe("つ");
  });

  it("returns null for characters without a mod cycle", () => {
    expect(applyMod("ん")).toBeNull();
    expect(applyMod("a")).toBeNull();
  });
});

describe("dirOf", () => {
  it("returns 'c' when movement stays within the threshold", () => {
    expect(dirOf(0, 0, 26)).toBe("c");
    expect(dirOf(10, -10, 26)).toBe("c");
  });

  it("detects horizontal flicks once the threshold is exceeded", () => {
    expect(dirOf(40, 0, 26)).toBe("r");
    expect(dirOf(-40, 0, 26)).toBe("l");
  });

  it("detects vertical flicks once the threshold is exceeded", () => {
    expect(dirOf(0, 40, 26)).toBe("d");
    expect(dirOf(0, -40, 26)).toBe("u");
  });

  it("picks the axis with the larger movement", () => {
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
  it("renders the kana keyboard by default", () => {
    setup();
    expect(screen.getByText("あ")).toBeInTheDocument();
    expect(screen.getByText("ら")).toBeInTheDocument();
  });

  it("emits a tap event when a key is pressed without moving", () => {
    const { onEvent } = setup();
    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 100, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "tap", key: expect.objectContaining({ id: "a", c: "あ" }) });
  });

  it("emits a flick event when dragged past the threshold", () => {
    const { onEvent } = setup({ threshold: 10 });
    fireEvent.pointerDown(screen.getByText("あ"), { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 140, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "flick", char: "え" });
  });

  it("falls back to a tap when flicking toward a direction the key has no character for", () => {
    const { onEvent } = setup({ threshold: 10 });
    fireEvent.pointerDown(screen.getByText("小゛゜"), { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 140, clientY: 100 });
    fireEvent.pointerUp(window, { clientX: 140, clientY: 100 });

    expect(onEvent).toHaveBeenCalledWith({ type: "tap", key: expect.objectContaining({ id: "mod", c: "小" }) });
  });

  it("emits delete and space events from the function keys", () => {
    const { onEvent } = setup();
    fireEvent.click(screen.getByText("⌫"));
    expect(onEvent).toHaveBeenCalledWith({ type: "delete" });

    fireEvent.click(screen.getByText("空白"));
    expect(onEvent).toHaveBeenCalledWith({ type: "space" });
  });

  it("emits a modeSwitch event when switching to the english keyboard", () => {
    const { onEvent } = setup();
    fireEvent.click(screen.getByText("ABC"));
    expect(onEvent).toHaveBeenCalledWith({ type: "modeSwitch", to: "english" });
  });

  it("shows the line-start indicator on the mod key when isLineStart is true", () => {
    setup({ isLineStart: true });
    expect(screen.getByText("^^")).toBeInTheDocument();
  });

  it("renders the english keyboard and toggles caps without emitting an event", () => {
    const { onEvent } = setup({ mode: "english" });
    expect(screen.getByText("DEF")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText("A/a"), { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(window, { clientX: 0, clientY: 0 });

    expect(screen.getByText("a/A")).toBeInTheDocument();
    expect(screen.getByText("def")).toBeInTheDocument();
    expect(onEvent).not.toHaveBeenCalled();
  });
});
