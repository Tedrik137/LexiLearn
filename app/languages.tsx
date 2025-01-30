import { Stack } from "expo-router";
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const data = [
  { name: "English", level: "Fluent", placeholder: "Placeholder" },
  { name: "Spanish", level: "Intermediate", placeholder: "Placeholder" },
  { name: "French", level: "Beginner", placeholder: "Placeholder" },
];

const languages = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={styles.cell}>Language</Text>
        <Text style={styles.cell}>Proficiency Level</Text>
        <Text style={styles.cell}>Placeholder</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.level}</Text>
            <Text style={styles.cell}>{item.placeholder}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { margin: 40 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
  },
  header: {
    backgroundColor: "#f1f8ff",
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
});

export default languages;
