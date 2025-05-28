import React, { useState } from "react";
import { ThemedView } from "./ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import ProficiencyModal from "./ProficiencyModal";
import { languages } from "@/entities/languages";
import { Language } from "@/types/languages";
import LanguageModalOpenButton from "./LanguageModalOpenButton";

export default function HomeGrid() {
  const [modalVisible, setModalVisible] = useState(false);
  const [language, setLanguage] = useState<Language>(languages[0]);

  if (modalVisible) {
    return (
      <ThemedView style={styles.columnContainer}>
        <ProficiencyModal
          visible={modalVisible}
          setModalVisible={setModalVisible}
          language={language}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.columnContainer}>
      <ThemedText>Choose a language:</ThemedText>
      <ThemedView style={styles.container}>
        {languages.map((language) => (
          <LanguageModalOpenButton
            setModalVisible={setModalVisible}
            key={language.id}
            language={language}
            setLanguage={setLanguage}
          ></LanguageModalOpenButton>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
  },
  columnContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flex: 1,
    rowGap: 20,
  },
});
