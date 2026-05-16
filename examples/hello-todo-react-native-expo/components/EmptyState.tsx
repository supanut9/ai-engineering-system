import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function EmptyState() {
  return (
    <View style={styles.container} testID="empty-state">
      <Text style={styles.icon}>📋</Text>
      <Text style={styles.title}>No todos yet</Text>
      <Text style={styles.subtitle}>Add your first todo above to get started.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
