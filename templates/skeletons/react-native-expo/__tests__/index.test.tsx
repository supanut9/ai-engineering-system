import { render, screen } from "@testing-library/react-native";
import HomeScreen from "../app/index";

describe("HomeScreen", () => {
  it('renders the "Hello" text', () => {
    render(<HomeScreen />);
    expect(screen.getByText("Hello")).toBeTruthy();
  });
});
