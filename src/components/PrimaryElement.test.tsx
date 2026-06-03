import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PrimaryElement } from "./PrimaryElement";

test("renders the selected primary element", () => {
  render(<PrimaryElement elementID={"3"} getImage={(elementID) => `/elements/${elementID}.svg`} getName={() => "Energy"} />);

  expect(screen.getByText("Energy")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /energy/i })).toHaveAttribute("src", "/elements/3.svg");
});
