import { ThemedView } from "./ThemedView";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { useRouter, Link } from "expo-router";

export default function ProfileGrid() {
  const router = useRouter();

  const handlePress = (route: Parameters<typeof router.push>[0]) => {
    // Add a slight delay before navigation
    setTimeout(() => {
      router.push(route);
    }, 150); // Adjust the delay time as needed
  };

  return (
    <ThemedView style={[styles.container]}>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => handlePress("/languages")}
      >
        <ThemedText style={[styles.text]}>Languages</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => handlePress("/languages")}
      >
        <ThemedText style={[styles.text]}>Goals</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => handlePress("/languages")}
      >
        <ThemedText style={[styles.text]}>Offline Lessons</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => handlePress("/languages")}
      >
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
