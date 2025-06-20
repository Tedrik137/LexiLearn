import * as goalFunctions from "./goals";
import * as userFunctions from "./users";
import * as audioFunctions from "./audio";

export const getGoals = goalFunctions.getGoals;
export const addGoal = goalFunctions.addGoal;
export const deleteGoal = goalFunctions.deleteGoal;
export const updateGoalCheckedStatus = goalFunctions.updateGoalCheckedStatus;

export const initializeUserData = userFunctions.initializeUserData;
export const getOrCreateTTSAudio = audioFunctions.getOrCreateTTSAudio;
