import {
  ScenarioSentence,
  descriptions,
  scenarioPictures,
} from "@/entities/rolePlayingSentences";
import React from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useAssets } from "expo-asset";

interface Props {
  scenario: ScenarioSentence;
  scenarioName: string;
}

const width = Dimensions.get("window").width;

const RolePlayingScenario = ({ scenario, scenarioName }: Props) => {
  return (
    <ThemedView style={[styles.container]}>
      {scenarioPictures[scenarioName] && (
        <Image
          source={scenarioPictures[scenarioName]}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 8,
            marginBottom: 16,
          }}
          contentFit="cover"
        />
      )}

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
