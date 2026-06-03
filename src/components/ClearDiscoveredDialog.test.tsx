import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ClearDiscoveredDialog } from "./ClearDiscoveredDialog";

test("confirms or cancels clearing discovered combinations", () => {
  const clearDiscoveredCombinations = vi.fn();
  const closeDialog = vi.fn();

  render(<ClearDiscoveredDialog clearDiscoveredCombinations={clearDiscoveredCombinations} closeDialog={closeDialog} />);

  expect(screen.getByRole("dialog", { name: /clear discovered combinations/i })).toHaveAccessibleDescription(
    /remove all locally saved discovered checkmarks/i
  );

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

  expect(closeDialog).toHaveBeenCalledOnce();
  expect(clearDiscoveredCombinations).toHaveBeenCalledOnce();
});
