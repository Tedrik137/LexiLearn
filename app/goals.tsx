import { Collapsible } from "@/components/Collapsible";
import React, { useEffect, useState, useCallback } from "react";
import {
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
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

type Goal = { id: string; text: string; checked: boolean };
export type GoalValue = { key: string; goals: Goal[] };

// Custom Hook to manage goals state
const useGoals = () => {
  const [goals, setGoals] = useState<Map<string, GoalValue>>(
    new Map([
      [
        "English",
        {
          key: "English",
          goals: [
            {
              id: "eng-1",
              text: "Being able to say greetings",
              checked: false,
            },
            {
              id: "eng-2",
              text: "Being able to order at a restaurant",
              checked: true,
            },
            { id: "eng-3", text: "Memorise the alphabet", checked: false },
          ],
        },
      ],
      [
        "Arabic",
        {
          key: "Arabic",
          goals: [
            { id: "ara-1", text: "Being able to say greetings", checked: true },
            {
              id: "ara-2",
              text: "Being able to order at a restaurant",
              checked: false,
            },
            { id: "ara-3", text: "Memorise the alphabet", checked: false },
          ],
        },
      ],
      [
        "French",
        {
          key: "French",
          goals: [
            { id: "fre-1", text: "Being able to say greetings", checked: true },
            {
              id: "fre-2",
              text: "Being able to order at a restaurant",
              checked: false,
            },
            { id: "fre-3", text: "Memorise the alphabet", checked: false },
          ],
        },
      ],
    ])
  );

  // Fetch goals from backend
  /* useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("https://api.example.com/goals");
        const result: GoalValue[] = await response.json();

        // Convert fetched data into a Map for efficient updates
        const goalsMap = new Map<string, GoalValue>(
          result.map((lang) => [lang.key, lang])
        );

        setGoals(goalsMap); // Update state with new goalsMap
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, []);
  */

  const toggleCheckbox = useCallback((goalId: string) => {
    setGoals((prevGoals) => {
      for (let [lang, language] of prevGoals) {
        if (language.goals.some((goal) => goal.id === goalId)) {
          const updatedGoals = language.goals.map((goal) =>
            goal.id === goalId ? { ...goal, checked: !goal.checked } : goal
          );
          return new Map(prevGoals).set(lang, {
            ...language,
            goals: updatedGoals,
          });
        }
      }
      return prevGoals;
    });
  }, []);

  // Function to save goals to backend
  /* const saveGoals = async () => {
    try {
      await fetch("https://api.example.com/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...goals.values()]),
      });
    } catch (error) {
      console.error("Error saving goals:", error);
    }
  }; */

  const addGoal = async (key: string, newGoalText: string) => {
    const newGoal: Goal = {
      id: `${key.toLowerCase()}-${Date.now()}`, // Temporary ID
      text: newGoalText,
      checked: false,
    };

    setGoals((prevGoals) => {
      const updatedGoals = new Map(prevGoals);
      const currentLanguage = updatedGoals.get(key);

      if (currentLanguage) {
        currentLanguage.goals.push(newGoal);
        updatedGoals.set(key, currentLanguage);
      }

      return updatedGoals;
    });

    // Send the goal to the backend (replace with your backend URL and API logic)
    /*await fetch("https://api.example.com/goals", {
      method: "POST", // Use POST to create a new goal
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newGoalText, languageKey: key }),
    })
      .then((response) => {
        response
          .json()
          .then((data) => {
            const { id } = data.id;
            // Update the goal in the state with the real ID
            setGoals((prevGoals) => {
              const updatedGoals = new Map(prevGoals);
              const currentLanguage = updatedGoals.get(key);

              if (currentLanguage) {
                const goalIndex = currentLanguage.goals.findIndex(
                  (goal) => goal.id === newGoal.id
                );
                if (goalIndex > -1) {
                  currentLanguage.goals[goalIndex].id = id; // Replace temporary ID with backend ID
                  updatedGoals.set(key, currentLanguage);
                }
              } else {
              }

              return updatedGoals;
            });
          })
          .catch((err) => {
            console.error("Failed to add goal:", err);
          });
      })
      .catch((err) => {
        console.error("Error syncing with backend:", err);
      });*/
  };

  return { goals, setGoals, toggleCheckbox, addGoal /*saveGoals*/ };
};

const GoalsScreen = () => {
  const { goals, toggleCheckbox, addGoal /*saveGoals */ } = useGoals();
  const [addGoalKey, setGoalKey] = useState("");
  const navigation = useNavigation();

  // Save goals when navigating away
  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", saveGoals);
    return unsubscribe;
  }, [navigation, saveGoals]);*/

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <GoalModal
        modalKey={addGoalKey}
        visible={modalVisible}
        setModalVisible={setModalVisible}
        addGoal={addGoal}
      />
      <FlatList
        data={[...goals.values()]} // Convert Map to array
        keyExtractor={(item) => item.key}
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
                    onValueChange={() => toggleCheckbox(goal.id)}
                    color={goal.checked ? "#4630EB" : undefined}
                  />
                  <Text style={styles.paragraph}>{goal.text}</Text>
                </View>
              )}
            />
          </Collapsible>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  paragraph: {
    fontSize: 17,
  },
  checkbox: {
    margin: 8,
  },
  button: {
    backgroundColor: "#3F51B5",
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    width: 140,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 19,
    marginLeft: 20,
  },
});

export default GoalsScreen;
