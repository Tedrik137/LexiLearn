import { Collapsible } from "@/components/Collapsible";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import GoalModal from "@/components/GoalModal";
import { SafeAreaView } from "react-native-safe-area-context";
import useGoals from "@/hooks/getGoals";
import CustomScrollView from "@/components/CustomScrollView";
import { ThemedView } from "@/components/ThemedView";

const GoalsScreen = () => {
  const { goals, toggleCheckbox, addGoal, deleteGoal, saveChangedGoals } =
    useGoals();
  const [addGoalKey, setGoalKey] = useState("");
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  // Ref to hold the latest saveChangedGoals function
  const saveChangedGoalsRef = useRef(saveChangedGoals);

  // Keep the ref updated if saveChangedGoals function instance changes
  useEffect(() => {
    saveChangedGoalsRef.current = saveChangedGoals;
  }, [saveChangedGoals]);

  // Effect for setting up navigation listeners
  useEffect(() => {
    console.log(
      "GoalsScreen: Setting up navigation listeners (useEffect with navigation dependency)."
    );
    // Flag to prevent multiple save attempts if blur and unmount happen close together
    let saveAttempted = false;

    const unsubscribeBlur = navigation.addListener("blur", async () => {
      console.log("GoalsScreen: 'blur' event triggered!");
      if (saveAttempted) {
        console.log(
          "GoalsScreen: Save already attempted (blur/unmount), skipping duplicate blur save."
        );
        return;
      }
      saveAttempted = true;
      try {
        console.log(
          "GoalsScreen: Attempting to call saveChangedGoalsRef.current on blur..."
        );
        await saveChangedGoalsRef.current(); // Use the ref
        console.log(
          "GoalsScreen: saveChangedGoalsRef.current on blur call completed."
        );
      } catch (error) {
        console.error("Failed to save goals on 'blur':", error);
      }
      // Reset flag if you want blur to be able to trigger again before unmount
      // For now, let's assume one save attempt per screen focus/unmount cycle is enough.
    });

    // Cleanup function for unmount
    return () => {
      console.log(
        "GoalsScreen: Cleanup from useEffect (navigation dependency) / Potential Unmount."
      );
      unsubscribeBlur();

      if (saveAttempted) {
        console.log(
          "GoalsScreen: Unmount cleanup - save already attempted by blur or previous unmount. Skipping."
        );
        return;
      }

      // If blur didn't fire/complete, this unmount cleanup will try to save.
      saveAttempted = true;
      console.log(
        "GoalsScreen: Component unmounting (from cleanup), attempting to save goals via ref."
      );
      saveChangedGoalsRef.current().catch((error) => {
        console.error(
          "Failed to save goals during unmount (from cleanup):",
          error
        );
      });
    };
  }, [navigation]); // Now only depends on navigation

  const deleteAlert = (key: string, id: string) =>
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          console.log("Yes");
          deleteGoal(key, id);
        },
        style: "default",
      },
    ]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <GoalModal
        modalKey={addGoalKey}
        visible={modalVisible}
        setModalVisible={setModalVisible}
        addGoal={addGoal}
      />
      <FlatList
        data={[...goals.values()]} // Convert Map to array
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <CustomScrollView
            headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
            canPopNavigation={true}
          />
        }
        renderItem={({ item }) => (
          <Collapsible title={item.key}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => {
                setModalVisible(true);
                setGoalKey(item.key);
              }}
            >
              <ThemedText style={[styles.text]}>New Goal</ThemedText>
              <IconSymbol
                size={26}
                name="widget.small.badge.plus"
                color={"white"}
              />
            </TouchableOpacity>
            <FlatList
              data={item.goals}
              keyExtractor={(goal) => goal.id} // ✅ Use goal.id instead of index
              renderItem={({ item: goal }) => (
                <View style={styles.section}>
                  <Checkbox
                    style={styles.checkbox}
                    value={goal.checked}
                    onValueChange={() => toggleCheckbox(item.key, goal.id)}
                    color={goal.checked ? "#4630EB" : undefined}
                  />
                  <Text style={styles.paragraph}>{goal.text}</Text>
                  <TouchableOpacity
                    style={[styles.delete]}
                    onPress={() => {
                      deleteAlert(item.key, goal.id);
                    }}
                  >
                    <IconSymbol size={24} name="bin.xmark" color={"white"} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </Collapsible>
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    marginRight: 15,
  },
  button: {
    backgroundColor: "#3F51B5",
    borderRadius: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 10,
    width: 140,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 19,
    marginLeft: 20,
  },
  delete: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
    borderRadius: 7,
    height: 30,
    width: 30,
    marginLeft: 15,
  },
});

export default GoalsScreen;
