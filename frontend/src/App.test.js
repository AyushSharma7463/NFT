import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders simple NFT title", () => {
  render(<App />);
  const title = screen.getByText(/Simple NFT/i);
  expect(title).toBeInTheDocument();
});

test("renders Connect Wallet button", () => {
  render(<App />);
  const button = screen.getByText(/Connect Wallet/i);
  expect(button).toBeInTheDocument();
});

test("renders mint button", () => {
  render(<App />);
  const button = screen.getByText(/Mint for 0.001 ETH/i);
  expect(button).toBeInTheDocument();
});

test("renders owner check section", () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Token ID/i);
  expect(input).toBeInTheDocument();
});
