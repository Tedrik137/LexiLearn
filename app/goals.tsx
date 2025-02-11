import { Collapsible } from "@/components/Collapsible";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";

type Goal = { id: string; text: string; checked: boolean };
type GoalValue = { key: string; goals: Goal[] };

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
      const updatedGoals = new Map(prevGoals);

      updatedGoals.forEach((language) => {
        const newGoals = language.goals.map((goal) =>
          goal.id === goalId ? { ...goal, checked: !goal.checked } : goal
        );

        updatedGoals.set(language.key, { ...language, goals: newGoals });
      });

      return updatedGoals;
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
  };

  return { goals, toggleCheckbox, saveGoals }; */

  return { goals, toggleCheckbox };
};

const GoalsScreen = () => {
  const { goals, toggleCheckbox /*saveGoals */ } = useGoals();
  const navigation = useNavigation();

  // Save goals when navigating away
  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", saveGoals);
    return unsubscribe;
  }, [navigation, saveGoals]);*/

  return (
    <View style={styles.container}>
      <FlatList
        data={[...goals.values()]} // Convert Map to array
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Collapsible title={item.key}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    margin: 8,
  },
});

export default GoalsScreen;
