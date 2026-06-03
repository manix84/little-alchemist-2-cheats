import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the element search", () => {
  render(<App />);
  expect(screen.getByLabelText(/elements/i)).toBeInTheDocument();
});

test("dismisses the install prompt without showing it again", async () => {
  render(<App />);

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
