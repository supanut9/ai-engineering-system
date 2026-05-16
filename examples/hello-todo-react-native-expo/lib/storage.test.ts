import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadTodos, saveTodos } from "./storage";
import { Todo } from "@/types/todo";

const STORAGE_KEY = "hello-todo:todos";

const mockTodos: Todo[] = [
  {
    id: "1",
    title: "Test todo",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Another todo",
    completed: true,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("saveTodos", () => {
  it("serialises todos to AsyncStorage", async () => {
    await saveTodos(mockTodos);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(mockTodos)
    );
  });

  it("persists an empty array", async () => {
    await saveTodos([]);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, "[]");
  });
});

describe("loadTodos", () => {
  it("returns parsed todos from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockTodos)
    );
    const result = await loadTodos();
    expect(result).toEqual(mockTodos);
  });

  it("returns empty array when key is absent", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await loadTodos();
    expect(result).toEqual([]);
  });

  it("returns empty array on corrupted JSON", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("not-json{{{");
    const result = await loadTodos();
    expect(result).toEqual([]);
  });

  it("returns empty array when stored value is not an array", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ not: "an array" })
    );
    const result = await loadTodos();
    expect(result).toEqual([]);
  });

  it("round-trips: save then load returns the same todos", async () => {
    // save
    await saveTodos(mockTodos);
    const savedArg = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1] as string;

    // simulate load reading that value
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedArg);
    const result = await loadTodos();
    expect(result).toEqual(mockTodos);
  });
});
