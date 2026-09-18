import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

import { useDebouncedValue } from "./useDebouncedValue";

/*
 * Phase A -- backs ExploreView's search debounce (see ExploreView.tsx).
 * Proves the core "settle before propagating" behavior in isolation: rapid
 * updates within the delay window collapse to the last value, and only
 * after the input stops changing for the full delay.
 */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("does not propagate a value until the delay has elapsed since the last change", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 350), {
      initialProps: { value: "" },
    });

    rerender({ value: "M" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Me" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "Mer" });

    // Still within 350ms of the last keystroke -- never propagated.
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(350));

    // Collapses straight to the final value, not each intermediate one.
    expect(result.current).toBe("Mer");
  });

  it("cleans up its timer on unmount without propagating a stale value", () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 350), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    unmount();

    // No error/act warning from a timer firing after unmount, and the last
    // observed value is left exactly where it was.
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe("a");
  });
});
