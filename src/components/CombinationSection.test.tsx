import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { CombinationSection } from "./CombinationSection";

const getImage = (elementID: string) => `/elements/${elementID}.svg`;
const getName = (elementID: string) =>
  ({
    "1": "Air",
    "2": "Fire",
    "3": "Energy",
  })[elementID];

test("renders discovered counts and rows with separators", () => {
  render(
    <CombinationSection
      title={"Combinations"}
      rows={[
        {
          combinationKey: "3:1+2",
          items: [
            { elementID: "1" },
            { elementID: "2", symbolBefore: "+" },
          ],
        },
        {
          combinationKey: "3:2+1",
          items: [
            { elementID: "2" },
            { elementID: "1", symbolBefore: "+" },
          ],
        },
      ]}
      discoveredCombinationSet={new Set(["3:1+2"])}
      getImage={getImage}
      getName={getName}
      navigateToElement={vi.fn()}
      setCombinationDiscovered={vi.fn()}
    />
  );

  expect(screen.getByRole("heading", { name: /combinations \(1\/2\)/i })).toBeInTheDocument();
  expect(screen.getAllByText("+")).toHaveLength(2);
  expect(screen.getByTestId("combination-row-3:1+2")).toBeInTheDocument();
});

test("toggles discovered state and navigates through element tiles", () => {
  const navigateToElement = vi.fn();
  const setCombinationDiscovered = vi.fn();

  render(
    <CombinationSection
      title={"Makes"}
      rows={[
        {
          combinationKey: "3:1+2",
          items: [
            { elementID: "1" },
            { elementID: "2", symbolBefore: "+" },
            { elementID: "3", symbolBefore: "=" },
          ],
        },
      ]}
      discoveredCombinationSet={new Set()}
      getImage={getImage}
      getName={getName}
      navigateToElement={navigateToElement}
      setCombinationDiscovered={setCombinationDiscovered}
    />
  );

  fireEvent.click(screen.getByRole("checkbox", { name: /discovered/i }));
  fireEvent.click(screen.getByRole("button", { name: /energy/i }));

  expect(setCombinationDiscovered).toHaveBeenCalledWith("3:1+2", true);
  expect(navigateToElement).toHaveBeenCalledWith("3");
});
