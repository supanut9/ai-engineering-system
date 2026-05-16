import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTodos } from "@/hooks/useTodos";
import { TodoList } from "@/components/TodoList";
import { AddTodoForm } from "@/components/AddTodoForm";

export default function HomeScreen() {
  const { todos, loading, add, toggle, remove } = useTodos();

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" testID="loading-indicator" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar style="auto" />
      <AddTodoForm onAdd={add} />
      <TodoList todos={todos} onToggle={toggle} onDelete={remove} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
});
