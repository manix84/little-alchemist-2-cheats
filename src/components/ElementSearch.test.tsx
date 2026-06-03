import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ElementSearch } from "./ElementSearch";

test("renders options and reports selected element IDs", async () => {
  const onSelect = vi.fn();

  render(
    <ElementSearch
      isLoading={false}
      options={[
        { id: "1", label: "Air (0/0)", image: "/elements/1.svg" },
        { id: "3", label: "Energy (1/2)", image: "/elements/3.svg" },
      ]}
      selectedOption={null}
      onSelect={onSelect}
    />
  );

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy \(1\/2\)/i }));

  expect(onSelect).toHaveBeenCalledWith("3");
});

test("shows the selected element icon in the input", () => {
  const { container } = render(
    <ElementSearch
      isLoading={false}
      options={[
        { id: "1", label: "Air (0/0)", image: "/elements/1.svg" },
        { id: "3", label: "Energy (1/2)", image: "/elements/3.svg" },
      ]}
      selectedOption={{ id: "3", label: "Energy (1/2)", image: "/elements/3.svg" }}
      onSelect={vi.fn()}
    />
  );

  expect(container.querySelector('img[src="/elements/3.svg"]')).toBeInTheDocument();
  expect(screen.getByLabelText(/elements/i)).toHaveValue("Energy (1/2)");
});
