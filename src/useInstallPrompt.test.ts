import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { useInstallPrompt } from "./useInstallPrompt";

const createInstallEvent = (outcome: "accepted" | "dismissed" = "accepted") => {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn<() => Promise<void>>>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  };

  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: "web" });

  return event;
};

beforeEach(() => {
  window.localStorage.clear();
});

test("captures the browser install event and prompts on request", async () => {
  const { result } = renderHook(() => useInstallPrompt());
  const installEvent = createInstallEvent("accepted");

  act(() => {
    window.dispatchEvent(installEvent);
  });

  await waitFor(() => expect(result.current.canInstall).toBe(true));

  await act(async () => {
    await result.current.installApp();
  });

  expect(installEvent.defaultPrevented).toBe(true);
  expect(installEvent.prompt).toHaveBeenCalledTimes(1);
  expect(result.current.canInstall).toBe(false);
  expect(window.localStorage.getItem("la2-install-prompt-dismissed")).toBeNull();
});

test("stores dismissal when the browser install prompt is dismissed", async () => {
  const { result } = renderHook(() => useInstallPrompt());
  const installEvent = createInstallEvent("dismissed");

  act(() => {
    window.dispatchEvent(installEvent);
  });

  await waitFor(() => expect(result.current.canInstall).toBe(true));

  await act(async () => {
    await result.current.installApp();
  });

  expect(result.current.canInstall).toBe(false);
  expect(window.localStorage.getItem("la2-install-prompt-dismissed")).toBe("true");
});

test("does not show the prompt after local dismissal", async () => {
  const { result } = renderHook(() => useInstallPrompt());

  act(() => {
    window.dispatchEvent(createInstallEvent());
  });

  await waitFor(() => expect(result.current.canInstall).toBe(true));

  act(() => {
    result.current.dismissInstallPrompt();
  });

  expect(result.current.canInstall).toBe(false);

  act(() => {
    window.dispatchEvent(createInstallEvent());
  });

  expect(result.current.canInstall).toBe(false);
});

test("hides the prompt after the app is installed", async () => {
  const { result } = renderHook(() => useInstallPrompt());

  act(() => {
    window.dispatchEvent(createInstallEvent());
  });

  await waitFor(() => expect(result.current.canInstall).toBe(true));

  act(() => {
    window.dispatchEvent(new Event("appinstalled"));
  });

  expect(result.current.canInstall).toBe(false);
});
