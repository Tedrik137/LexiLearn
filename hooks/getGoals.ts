import { useEffect, useState, useCallback } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebaseConfig";

type Goal = { id: string; text: string; checked: boolean };
export type GoalValue = { uid: string; key: string; goals: Goal[] };

const functions = getFunctions();

// Custom Hook to manage goals state
const useGoals = () => {
  const [goals, setGoals] = useState<Map<string, GoalValue>>(
    new Map<string, GoalValue>()
  );
  const [initialGoals, setInitialGoals] = useState<Map<string, GoalValue>>(
    new Map<string, GoalValue>()
  );

  // Fetch goals from backend
  useEffect(() => {
    const getGoals = httpsCallable(functions, "getGoals");
    getGoals()
      .then((result) => {
        const data = result.data as GoalValue[];
        console.log("useGoals: Fetched goals data:", data);

        const goalsMap = new Map<string, GoalValue>();

        if (Array.isArray(data)) {
          data.forEach((goal) => {
            if (goal && goal.key) {
              goalsMap.set(goal.key, { ...goal, goals: goal.goals || [] });
            } else {
              console.warn(
                "useGoals: Goal data is missing key or goals:",
                goal
              );
            }
          });
        } else {
          console.warn("useGoals: Fetched data is not an array:", data);
        }

        setGoals(goalsMap);
        setInitialGoals(goalsMap); // Store a deep copy for comparison later
      })
      .catch((error) => {
        console.error("Error fetching goals: ", error);

        const defaultGoals = new Map([
          [
            "English",
            {
              uid: auth.currentUser ? auth.currentUser.uid : "0",
              key: "English",
              goals: [],
            },
          ],
          [
            "Arabic",
            {
              uid: auth.currentUser ? auth.currentUser.uid : "0",
              key: "Arabic",
              goals: [],
            },
          ],
          [
            "French",
            {
              uid: auth.currentUser ? auth.currentUser.uid : "0",
              key: "French",
              goals: [],
            },
          ],
          [
            "Japanese",
            {
              uid: auth.currentUser ? auth.currentUser.uid : "0",
              key: "Japanese",
              goals: [],
            },
          ],
        ]);

        setGoals(defaultGoals);
        setInitialGoals(defaultGoals); // Store a deep copy for comparison later
      });
  }, []);

  const toggleCheckbox = useCallback((languageKey: string, goalId: string) => {
    setGoals((prevGoals) => {
      const newGoalsMap = new Map(prevGoals);
      const currentLanguageData = newGoalsMap.get(languageKey);
      if (currentLanguageData) {
        const updatedLanguageGoals = currentLanguageData.goals.map((goal) =>
          goal.id === goalId ? { ...goal, checked: !goal.checked } : goal
        );
        newGoalsMap.set(languageKey, {
          ...currentLanguageData,
          goals: updatedLanguageGoals,
        });
      }
      return newGoalsMap;
    });
  }, []);

  const saveChangedGoals = useCallback(async () => {
    const updateGoalStatusCallable = httpsCallable(
      functions,
      "updateGoalCheckedStatus"
    );
    const promises = [];

    for (const [langKey, currentLangData] of goals) {
      const initialLangData = initialGoals.get(langKey);
      for (const currentGoal of currentLangData.goals) {
        const initialGoal = initialLangData?.goals.find(
          (g) => g.id === currentGoal.id
        );
        // If goal is new (not in initialGoals) or checked status has changed
        if (!initialGoal || initialGoal.checked !== currentGoal.checked) {
          console.log(
            `Goal ${currentGoal.id} in ${langKey} checked status changed to ${currentGoal.checked}. Saving.`
          );
          promises.push(
            updateGoalStatusCallable({
              languageKey: langKey,
              goalId: currentGoal.id,
              checked: currentGoal.checked,
            })
          );
        }
      }
    }

    if (promises.length === 0) {
      console.log("No goal status changes to save.");
      return;
    }

    try {
      await Promise.all(promises);
      console.log("Changed goal statuses saved successfully.");
      setInitialGoals(new Map(goals)); // Update initialGoals to current state after successful save
    } catch (error) {
      console.error("Error saving changed goal statuses:", error);
      // Potentially show an error to the user
    }
  }, [goals, initialGoals]);

  const addGoal = async (key: string, newGoalText: string) => {
    // Optimistically add the new goal to the state with a temp ID

    const tempID = `${key.toLowerCase()}-${Date.now()}`;

    const newGoal: Goal = {
      id: tempID,
      text: newGoalText,
      checked: false,
    };

    setGoals((prevGoals) => {
      const updatedGoalMap = new Map(prevGoals);
      const currentLanguage = updatedGoalMap.get(key);

      if (currentLanguage) {
        currentLanguage.goals.push(newGoal);
        updatedGoalMap.set(key, currentLanguage);
      }

      return updatedGoalMap;
    });

    const createGoal = httpsCallable(functions, "addGoal");

    try {
      const result = await createGoal({ language: key, text: newGoalText });

      const newGoal = result.data as Goal;

      setGoals((prevGoals) => {
        const updatedGoalMap = new Map(prevGoals);
        const currentLanguage = updatedGoalMap.get(key);

        if (currentLanguage) {
          const updatedGoals = currentLanguage.goals.map((goal) => {
            if (goal.id === tempID) {
              return { ...goal, id: newGoal.id }; // Replace temp ID with real ID
            }
            return goal; // Keep other goals unchanged
          });

          updatedGoalMap.set(key, { ...currentLanguage, goals: updatedGoals });
        }
        return updatedGoalMap;
      });
    } catch (error) {
      console.error("Error adding goal:", error);

      // Rollback the optimistic update if the backend call fails
      setGoals((prevGoals) => {
        const revertedGoalMap = new Map(prevGoals);
        const currentLanguage = revertedGoalMap.get(key);

        if (currentLanguage) {
          // Remove the temporary goal
          currentLanguage.goals = currentLanguage.goals.filter(
            (goal) => goal.id !== tempID
          );
          revertedGoalMap.set(key, currentLanguage);
        }

        return revertedGoalMap;
      });
    }
  };

  const deleteGoal = async (languageKey: string, goalId: string) => {
    let deletedGoal: Goal | undefined;

    // Optimistically remove the goal from the state
    setGoals((prevGoals) => {
      const updatedGoalsMap = new Map(prevGoals);
      const currentLanguage = updatedGoalsMap.get(languageKey);

      if (currentLanguage) {
        // Find the goal to delete
        const updatedGoals = currentLanguage.goals.filter((goal) => {
          if (goal.id === goalId) {
            deletedGoal = goal; // Store the deleted goal for rollback
            return false;
          }
          return true;
        });

        updatedGoalsMap.set(languageKey, {
          ...currentLanguage,
          goals: updatedGoals,
        });
      }

      return updatedGoalsMap;
    });

    const deleteGoalFunction = httpsCallable(functions, "deleteGoal");

    try {
      await deleteGoalFunction({ language: languageKey, id: goalId });

      console.log("Successfully deleted goal:", deletedGoal);
    } catch (error) {
      console.error("Error deleting goal:", error);
      // If the deletion fails, revert the optimistic update
      setGoals((prevGoals) => {
        const revertedGoals = new Map(prevGoals);
        const currentLanguage = revertedGoals.get(languageKey);

        if (currentLanguage && deletedGoal) {
          revertedGoals.set(languageKey, {
            ...currentLanguage,
            goals: [...currentLanguage.goals, deletedGoal], // Restore the deleted goal
          });
        }

        return revertedGoals;
      });
    }
  };

  return {
    goals,
    toggleCheckbox,
    addGoal,
    deleteGoal,
    saveChangedGoals,
  };
};

export default useGoals;
