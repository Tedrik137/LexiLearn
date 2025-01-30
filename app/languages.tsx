import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TouchableOpacity, StyleSheet } from "react-native";

export default function languages() {
  return (
    <ThemedView style={[styles.container]}>
      <TouchableOpacity style={[styles.button]}>
        <ThemedText style={[styles.text]}>Languages</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button]}>
        <ThemedText style={[styles.text]}>Goals</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button]}>
        <ThemedText style={[styles.text]}>Offline Lessons</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button]}>
        <ThemedText style={[styles.text]}>Placeholder</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#3F51B5",
    width: "46%",
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 20,
  },
});
