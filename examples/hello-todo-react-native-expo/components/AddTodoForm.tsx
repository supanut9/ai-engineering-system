import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { ValidationError } from "@/types/todo";

interface Props {
  onAdd: (title: string) => Promise<void>;
}

export function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
    } catch (err) {
      if (err instanceof ValidationError) {
        Alert.alert("Validation error", err.message);
      } else {
        Alert.alert("Error", "Could not add todo. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [title, onAdd]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to be done?"
        placeholderTextColor="#9CA3AF"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!submitting}
        maxLength={200}
        testID="add-todo-input"
        accessibilityLabel="New todo title"
      />
      <Pressable
        style={[styles.button, (!title.trim() || submitting) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!title.trim() || submitting}
        accessibilityLabel="Add todo"
        accessibilityRole="button"
        testID="add-todo-button"
      >
        <Text style={styles.buttonText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#C7D2FE",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
