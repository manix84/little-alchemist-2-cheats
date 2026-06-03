import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App";
import { RawData } from "./lib/Data";

const testData: RawData = {
  "1": {
    prime: true,
    n: "Air",
    c: ["3"],
  },
  "2": {
    prime: true,
    n: "Fire",
    c: ["3", "5"],
  },
  "3": {
    n: "Energy",
    p: [
      ["1", "2"],
      ["2", "1"],
    ],
  },
  "4": {
    prime: true,
    n: "Heat",
  },
  "5": {
    n: "Spark",
    p: [
      ["2", "4"],
      ["2", "2"],
    ],
  },
};

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(testData),
    })
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const LocationPath = () => {
  const location = useLocation();
  return <span data-testid={"location-path"}>{location.pathname}</span>;
};

const renderApp = (initialEntries = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
      <LocationPath />
    </MemoryRouter>
  );

test("renders the element search", () => {
  renderApp();
  expect(screen.getByLabelText(/elements/i)).toBeInTheDocument();
});

test("dismisses the install prompt without showing it again", async () => {
  renderApp();

  const installEvent = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  };
  installEvent.prompt = async () => undefined;
  installEvent.userChoice = Promise.resolve({ outcome: "dismissed", platform: "web" });

  fireEvent(window, installEvent);
  expect(await screen.findByText(/install app/i)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/dismiss install prompt/i));
  expect(screen.queryByText(/install app/i)).not.toBeInTheDocument();

  fireEvent(window, installEvent);
  expect(screen.queryByText(/install app/i)).not.toBeInTheDocument();
});

test("clicking an element tile navigates to that element", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy/i }));

  expect(await screen.findByRole("heading", { name: /combinations/i })).toBeInTheDocument();
  expect(screen.getByTestId("location-path")).toHaveTextContent("/elements/3");

  fireEvent.click(screen.getAllByRole("button", { name: /^air$/i })[0]);

  expect(screen.getAllByText("Air").length).toBeGreaterThan(0);
  expect(screen.getByTestId("location-path")).toHaveTextContent("/elements/1");
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});

test("loads an element from its direct URL", async () => {
  renderApp(["/elements/3"]);

  expect(await screen.findByText("Energy")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /combinations \(0\/2\)/i })).toBeInTheDocument();
});

test("renders a 404 page for unknown routes and element URLs", async () => {
  renderApp(["/missing"]);
  expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
});

test("renders a 404 page for unknown element IDs", async () => {
  renderApp(["/elements/not-real"]);
  expect(await screen.findByRole("heading", { name: /element not found/i })).toBeInTheDocument();
});

test("renders the 500 page route", () => {
  renderApp(["/500"]);
  expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
});

test("stores discovered combinations locally", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy/i }));
  fireEvent.click((await screen.findAllByRole("checkbox", { name: /discovered/i }))[0]);

  expect(JSON.parse(window.localStorage.getItem("la2-discovered-combinations") ?? "[]")).toEqual(["3:1+2"]);
});

test("stores self-combinations with the exact duplicate element recipe", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Fire" } });
  fireEvent.click(await screen.findByRole("option", { name: /fire \(0\/0\)/i }));
  fireEvent.click(screen.getByTestId("combination-row-5:2+2").querySelector("input") as HTMLInputElement);

  expect(JSON.parse(window.localStorage.getItem("la2-discovered-combinations") ?? "[]")).toEqual(["5:2+2"]);
});

test("updates discovered state even when localStorage writes fail", async () => {
  vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
    throw new Error("Storage is disabled");
  });

  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy \(0\/2\)/i }));
  fireEvent.click((await screen.findAllByRole("checkbox", { name: /discovered/i }))[0]);

  expect(screen.getByRole("heading", { name: /combinations \(1\/2\)/i })).toBeInTheDocument();
});

test("shows discovered and total combination counts after checking a recipe", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy \(0\/2\)/i }));

  expect(await screen.findByRole("heading", { name: /combinations \(0\/2\)/i })).toBeInTheDocument();

  fireEvent.click((await screen.findAllByRole("checkbox", { name: /discovered/i }))[0]);

  expect(screen.getByRole("heading", { name: /combinations \(1\/2\)/i })).toBeInTheDocument();
});

test("shows discovered and total combination counts in element options", async () => {
  window.localStorage.setItem("la2-discovered-combinations", JSON.stringify(["3:1+2"]));

  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });

  expect(await screen.findByRole("option", { name: /energy \(1\/2\)/i })).toBeInTheDocument();
});

test("moves discovered combination rows to the bottom of the list", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Energy" } });
  fireEvent.click(await screen.findByRole("option", { name: /energy/i }));

  expect(screen.getByTestId("combination-row-3:1+2")).toBeInTheDocument();
  expect(screen.getByTestId("combination-row-3:2+1")).toBeInTheDocument();

  fireEvent.click((await screen.findAllByRole("checkbox", { name: /discovered/i }))[0]);

  const rows = screen.getAllByTestId(/^combination-row-/);
  expect(rows.at(-1)).toBe(screen.getByTestId("combination-row-3:1+2"));
});

test("clears discovered combinations after danger confirmation", () => {
  window.localStorage.setItem("la2-discovered-combinations", JSON.stringify(["3:1+2"]));

  renderApp();

  fireEvent.click(screen.getByRole("button", { name: /clear discovered combinations/i }));
  expect(screen.getByRole("dialog", { name: /clear discovered combinations/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(window.localStorage.getItem("la2-discovered-combinations")).toBe(JSON.stringify(["3:1+2"]));

  fireEvent.click(screen.getByRole("button", { name: /clear discovered combinations/i }));
  fireEvent.click(screen.getByRole("button", { name: /clear all/i }));

  expect(window.localStorage.getItem("la2-discovered-combinations")).toBeNull();
  expect(screen.queryByRole("button", { name: /clear discovered combinations/i })).not.toBeInTheDocument();
});
