import React, { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Todo } from "@/types/todo";
import { TodoItem } from "./TodoItem";
import { EmptyState } from "./EmptyState";

interface Props {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: Todo }) => (
      <TodoItem todo={item} onToggle={onToggle} onDelete={onDelete} />
    ),
    [onToggle, onDelete]
  );

  const keyExtractor = useCallback((item: Todo) => item.id, []);

  return (
    <FlatList
      data={todos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={todos.length === 0 ? styles.emptyContainer : undefined}
      ListEmptyComponent={<EmptyState />}
      removeClippedSubviews
      windowSize={10}
      testID="todo-list"
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
  },
});
