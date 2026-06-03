import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the element search", () => {
  render(<App />);
  expect(screen.getByLabelText(/elements/i)).toBeInTheDocument();
});
