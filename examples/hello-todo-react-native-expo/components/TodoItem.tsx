import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Todo } from "@/types/todo";

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  const handleToggle = useCallback(() => onToggle(todo.id), [onToggle, todo.id]);
  const handleDelete = useCallback(() => onDelete(todo.id), [onDelete, todo.id]);

  return (
    <View style={styles.row} testID={`todo-item-${todo.id}`}>
      <Pressable
        style={styles.checkArea}
        onPress={handleToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
      >
        <View style={[styles.checkbox, todo.completed && styles.checkboxChecked]}>
          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      <Pressable style={styles.titleArea} onPress={handleToggle}>
        <Text
          style={[styles.title, todo.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        accessibilityLabel={`Delete "${todo.title}"`}
        accessibilityRole="button"
        testID={`delete-${todo.id}`}
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  checkArea: {
    marginRight: 12,
    padding: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    ...Platform.select({ ios: { lineHeight: 16 } }),
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#111827",
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  deleteButton: {
    marginLeft: 12,
    padding: 6,
  },
  deleteText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
});
