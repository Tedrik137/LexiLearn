import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { set } from "react-hook-form";
import { Language } from "@/types/languages";
import LanguageModalButton from "./LanguageModalButton";
import { difficultyLevels } from "@/entities/difficultyLevels";
import { useRouter } from "expo-router";

interface Props {
  visible: boolean;
  setModalVisible: (visible: boolean) => void;
  language: Language;
}

export default function ProficiencyModal({
  visible,
  setModalVisible,
  language,
}: Props) {
  const [proficiency, setProficiency] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChooseProficiency = () => {
    setIsSubmitting(true);
    setModalVisible(false);
    // navigate to the quiz screen based on proficiency
    router.push(`/(main)/${language.code}?proficiency=${proficiency}`);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setModalVisible(!visible);
      }}
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedText style={styles.modalHeading}>
            Choose Current {language.name} Proficiency!
          </ThemedText>
          <Pressable
            style={[styles.buttonClose]}
            onPress={() => {
              setModalVisible(!visible);
            }}
          >
            <IconSymbol size={26} name="xmark" color={"red"} />
          </Pressable>

          {difficultyLevels.map((level) => (
            <LanguageModalButton
              width={100}
              height={50}
              size={40}
              key={level.value}
              onPress={() => {
                setProficiency(level.value);
              }}
              selected={proficiency === level.value}
              disabled={isSubmitting}
            >
              <ThemedText>{level.label}</ThemedText>
            </LanguageModalButton>
          ))}
          <Pressable
            style={[
              styles.submitButton,
              proficiency === null && styles.disabled,
            ]}
            onPress={() => {
              setModalVisible(false);
              handleChooseProficiency();
            }}
            disabled={proficiency === null || isSubmitting}
          >
            <Text style={styles.textStyle}>Submit</Text>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: 400,
    width: 350,
    rowGap: 20,
  },
  buttonClose: {
    backgroundColor: "transparent",
    position: "absolute",
    right: 5,
    top: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },

  modalHeading: {
    fontWeight: "bold",
  },
  input: {
    height: 45,
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: 150,
  },
  submitButton: {
    borderRadius: 15,
    elevation: 2,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 40,
    backgroundColor: "#328f32",
  },
  disabled: {
    opacity: 0.5,
  },
});
