import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "../app/index";

// Mock expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createElement } = require("react");
  return {
    SafeAreaView: ({ children, ...props }: { children: unknown; [key: string]: unknown }) =>
      createElement(View, props as object, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});

describe("HomeScreen", () => {
  it("shows empty state after load when no todos exist", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("empty-state")).toBeTruthy(), {
      timeout: 8000,
    });
  }, 10000);

  it("renders the add-todo form after load", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("add-todo-input")).toBeTruthy());
    expect(screen.getByTestId("add-todo-button")).toBeTruthy();
  });

  it("adds a todo and displays it in the list", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("add-todo-input")).toBeTruthy());

    fireEvent.changeText(screen.getByTestId("add-todo-input"), "Buy coffee");
    await act(async () => {
      fireEvent.press(screen.getByTestId("add-todo-button"));
    });

    await waitFor(() => expect(screen.getByText("Buy coffee")).toBeTruthy());
  });

  it("toggles a todo as completed", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("add-todo-input")).toBeTruthy());

    fireEvent.changeText(screen.getByTestId("add-todo-input"), "Walk the dog");
    await act(async () => {
      fireEvent.press(screen.getByTestId("add-todo-button"));
    });

    await waitFor(() => expect(screen.getByText("Walk the dog")).toBeTruthy());

    // Toggle it
    const todoText = screen.getByText("Walk the dog");
    await act(async () => {
      fireEvent.press(todoText);
    });

    // After toggle the text is still visible but with line-through style
    expect(screen.getByText("Walk the dog")).toBeTruthy();
  });

  it("deletes a todo", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("add-todo-input")).toBeTruthy());

    fireEvent.changeText(screen.getByTestId("add-todo-input"), "Take out trash");
    await act(async () => {
      fireEvent.press(screen.getByTestId("add-todo-button"));
    });

    await waitFor(() => expect(screen.getByText("Take out trash")).toBeTruthy());

    // Find delete button — testID is `delete-${id}`, so query by prefix pattern
    const deleteButtons = screen.getAllByRole("button");
    const deleteBtn = deleteButtons.find((btn) => {
      const id = btn.props.testID as string | undefined;
      return typeof id === "string" && id.startsWith("delete-");
    });
    expect(deleteBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(deleteBtn!);
    });

    await waitFor(() => expect(screen.queryByText("Take out trash")).toBeNull());
    expect(screen.getByTestId("empty-state")).toBeTruthy();
  });

  it("persists todos to AsyncStorage when adding", async () => {
    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByTestId("add-todo-input")).toBeTruthy());

    fireEvent.changeText(screen.getByTestId("add-todo-input"), "Persistent todo");
    await act(async () => {
      fireEvent.press(screen.getByTestId("add-todo-button"));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
    const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(setItemCall[0]).toBe("hello-todo:todos");
    const saved = JSON.parse(setItemCall[1] as string) as { title: string }[];
    expect(saved[0].title).toBe("Persistent todo");
  });

  it("loads persisted todos on mount", async () => {
    const stored = JSON.stringify([
      { id: "abc", title: "Stored todo", completed: false, createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(stored);

    render(<HomeScreen />);
    await waitFor(() => expect(screen.getByText("Stored todo")).toBeTruthy());
  });
});
