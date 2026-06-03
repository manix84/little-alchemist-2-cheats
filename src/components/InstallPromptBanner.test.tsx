import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { InstallPromptBanner } from "./InstallPromptBanner";

test("installs or dismisses from the prompt banner", () => {
  const dismissInstallPrompt = vi.fn();
  const installApp = vi.fn();

  render(<InstallPromptBanner dismissInstallPrompt={dismissInstallPrompt} installApp={installApp} />);

  expect(screen.getByRole("status")).toHaveTextContent(/install app/i);

  fireEvent.click(screen.getByRole("button", { name: /^install$/i }));
  fireEvent.click(screen.getByRole("button", { name: /dismiss install prompt/i }));

  expect(installApp).toHaveBeenCalledOnce();
  expect(dismissInstallPrompt).toHaveBeenCalledOnce();
});
