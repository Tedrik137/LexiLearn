import { ThemedView } from "./ThemedView";
import { Button, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { useRouter, Link } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileGrid() {
  const { user, signOut } = useAuthStore(
    useShallow((state) => ({ user: state.user, signOut: state.signOut }))
  );

  const router = useRouter();

  const handlePress = (route: Parameters<typeof router.push>[0]) => {
    router.push(route);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      // handle successfull sign out
      console.log("Signed Out");
    } else {
      console.error(result.error);
    }
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
        onPress={() => handlePress("/goals")}
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
      <ThemedText>Welcome {user?.displayName}</ThemedText>
      <Button title="Sign Out" onPress={handleSignOut} />
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
