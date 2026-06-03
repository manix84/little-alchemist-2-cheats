import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import { PrimaryElement } from "./PrimaryElement";

test("renders the primary navigation", () => {
  const { container } = render(
    <MemoryRouter>
      <PrimaryElement
        compactLogoSrc={"/icons/app-icon.svg"}
        logoSrc={"/brand/la2-logo.svg"}
      >
        <button type={"button"}>Change element</button>
      </PrimaryElement>
    </MemoryRouter>
  );

  expect(container.querySelector('img[src="/brand/la2-logo.svg"]')).toBeInTheDocument();
  expect(container.querySelector('img[src="/icons/app-icon.svg"]')).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /back to element search/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("button", { name: /change element/i })).toBeInTheDocument();
});
