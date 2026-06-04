import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "./App";
import { RawData } from "./lib/Data";
import { createProgressTransferToken } from "./lib/progressTransfer";

const testData: RawData = {
  "1": {
    prime: true,
    n: "Air",
    s: "air",
    c: ["3"],
  },
  "2": {
    prime: true,
    n: "Fire",
    s: "fire",
    c: ["3", "5"],
  },
  "3": {
    n: "Energy",
    s: "energy",
    c: ["7"],
    p: [
      ["1", "2"],
      ["2", "1"],
    ],
  },
  "4": {
    prime: true,
    n: "Heat",
    s: "heat",
  },
  "5": {
    n: "Spark",
    s: "spark",
    p: [
      ["2", "4"],
      ["2", "2"],
    ],
  },
  "6": {
    d: "myths-and-monsters",
    n: "Deity",
    s: "deity",
  },
  "7": {
    d: "myths-and-monsters",
    n: "Ambrosia",
    s: "ambrosia",
    p: [["3", "6"]],
  },
  "8": {
    n: "Storm",
    s: "storm",
    p: [
      ["1", "2"],
      ["1", "6"],
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
  expect(screen.getByLabelText(/include myths and monsters/i)).not.toBeChecked();
  expect(screen.getByRole("button", { name: /transfer progress/i })).toBeInTheDocument();
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
  expect(screen.getByTestId("location-path")).toHaveTextContent("/elements/energy");

  fireEvent.click(screen.getAllByRole("button", { name: /^air$/i })[0]);

  expect(screen.getAllByText("Air").length).toBeGreaterThan(0);
  expect(screen.getByTestId("location-path")).toHaveTextContent("/elements/air");
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});

test("loads an element from its direct URL", async () => {
  renderApp(["/elements/energy"]);

  expect(await screen.findByRole("heading", { name: /combinations \(0\/2\)/i })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText(/elements/i)).toHaveValue("Energy (0/2)"));
  expect(screen.queryByLabelText(/include myths and monsters/i)).not.toBeInTheDocument();
});

test("renders a 404 page for unknown routes and element URLs", async () => {
  renderApp(["/missing"]);
  expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
});

test("renders a 404 page for unknown element IDs", async () => {
  renderApp(["/elements/not-real"]);
  expect(await screen.findByRole("heading", { name: /element not found/i })).toBeInTheDocument();
});

test("hides Myths and Monsters elements by default", async () => {
  renderApp(["/elements/deity"]);

  expect(await screen.findByRole("heading", { name: /element not found/i })).toBeInTheDocument();
  expect(screen.queryByLabelText(/include myths and monsters/i)).not.toBeInTheDocument();
});

test("shows Myths and Monsters elements when the stored opt-in is enabled", async () => {
  window.localStorage.setItem("la2-include-dlc-content", "true");

  renderApp(["/elements/deity"]);

  await waitFor(() => expect(screen.getByLabelText(/elements/i)).toHaveValue("Deity (0/0)"));
});

test("stores the Myths and Monsters opt-in and includes DLC recipes", async () => {
  renderApp();

  expect(screen.getByLabelText(/include myths and monsters/i)).not.toBeChecked();
  fireEvent.click(screen.getByLabelText(/include myths and monsters/i));
  expect(window.localStorage.getItem("la2-include-dlc-content")).toBe("true");

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Storm" } });
  fireEvent.click(await screen.findByRole("option", { name: /storm \(0\/2\)/i }));

  expect(await screen.findByRole("heading", { name: /combinations \(0\/2\)/i })).toBeInTheDocument();
});

test("filters recipes that use Myths and Monsters content by default", async () => {
  renderApp();

  fireEvent.change(screen.getByLabelText(/elements/i), { target: { value: "Storm" } });
  fireEvent.click(await screen.findByRole("option", { name: /storm \(0\/1\)/i }));

  expect(screen.getByRole("heading", { name: /combinations \(0\/1\)/i })).toBeInTheDocument();
});

test("opens a progress transfer QR dialog", async () => {
  renderApp();

  fireEvent.click(screen.getByRole("button", { name: /transfer progress/i }));

  expect(screen.getByRole("dialog", { name: /transfer progress/i })).toBeInTheDocument();
  expect(await screen.findByRole("img", { name: /progress transfer qr code/i })).toBeInTheDocument();
});

test("imports progress from a transfer URL", async () => {
  const progressToken = createProgressTransferToken(["3:1+2"], true);

  renderApp([`/?progress=${progressToken}`]);

  await waitFor(() => expect(screen.getByLabelText(/include myths and monsters/i)).toBeChecked());
  expect(window.localStorage.getItem("la2-discovered-combinations")).toBe(JSON.stringify(["3:1+2"]));
  expect(window.localStorage.getItem("la2-include-dlc-content")).toBe("true");
  expect(screen.getByTestId("location-path")).toHaveTextContent("/");
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
