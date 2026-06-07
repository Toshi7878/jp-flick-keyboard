import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement matchMedia; useIsStandalone() reads it to detect PWA display mode.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom does not implement PointerEvent; FlickKeyboard relies on onPointerDown/pointermove/pointerup.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent implements PointerEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;
    altitudeAngle: number;
    azimuthAngle: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tangentialPressure = params.tangentialPressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.twist = params.twist ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
      this.isPrimary = params.isPrimary ?? false;
      this.altitudeAngle = params.altitudeAngle ?? 0;
      this.azimuthAngle = params.azimuthAngle ?? 0;
    }

    getCoalescedEvents() {
      return [];
    }

    getPredictedEvents() {
      return [];
    }
  }

  window.PointerEvent = PointerEventPolyfill;
  globalThis.PointerEvent = PointerEventPolyfill;
}

afterEach(() => {
  cleanup();
});
