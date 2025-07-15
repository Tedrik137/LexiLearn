import { ScenarioSentence } from "@/entities/rolePlayingSentences";
import React from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { StyleSheet } from "react-native";
import { descriptions } from "@/entities/rolePlayingSentences";

interface Props {
  scenario: ScenarioSentence;
  scenarioName: string;
}

const RolePlayingScenario = ({ scenario, scenarioName }: Props) => {
  return (
    <ThemedView style={[styles.container]}>
      <ThemedText style={[styles.description]}>
        {descriptions[scenarioName]}
      </ThemedText>
      <ThemedText
        style={[styles.promptText]}
      >{`${scenario.character}: ${scenario.prompt}`}</ThemedText>
      <ThemedText
        style={[styles.responseText]}
      >{`You: ${scenario.response}`}</ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    display: "flex",
    justifyContent: "center",
    paddingVertical: 0,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  promptText: {
    fontSize: 16,
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "black",
    padding: 8,
  },
  responseText: {
    fontSize: 16,
    color: "#007AFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#007AFF",
    padding: 8,
  },
});

export default RolePlayingScenario;
