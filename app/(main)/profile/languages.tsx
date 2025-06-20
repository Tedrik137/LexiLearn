import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const data = [
  { name: "English", level: "Fluent", lessons: "52" },
  { name: "Spanish", level: "Intermediate", lessons: "26" },
  { name: "French", level: "Beginner", lessons: "5" },
];

const languages = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={styles.cell}>Language</Text>
        <Text style={styles.cell}>Proficiency</Text>
        <Text style={styles.cell}>Lessons Completed</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.level}</Text>
            <Text style={styles.cell}>{item.lessons}</Text>
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
    alignItems: "center",
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
