import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
} from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

interface Props {
  visible: boolean;
  setModalVisible: (visible: boolean) => void;
  modalKey: string;
  addGoal: (key: string, newGoalText: string) => void;
}

const GoalModal = ({ visible, setModalVisible, modalKey, addGoal }: Props) => {
  const [newGoal, onChangeNewGoal] = useState("");

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addGoal(modalKey, newGoal); // Add new goal
      onChangeNewGoal(""); // Reset the input field
      setModalVisible(false); // Close the modal
    } else {
      Alert.alert("Please enter a goal text!");
    }
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
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalHeading}>New {modalKey} Goal!</Text>
          <Pressable
            style={[styles.buttonClose]}
            onPress={() => {
              setModalVisible(!visible);
            }}
          >
            <IconSymbol size={26} name="xmark" color={"red"} />
          </Pressable>
          <TextInput
            style={styles.input}
            onChangeText={onChangeNewGoal}
            placeholder="Goal"
            value={newGoal}
          />

          <Pressable
            style={[styles.button]}
            onPress={() => {
              handleAddGoal();
              setModalVisible(!visible);
            }}
          >
            <Text style={styles.textStyle}>Add</Text>
            <IconSymbol
              size={21}
              name="widget.small.badge.plus"
              color={"white"}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

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
    height: 175,
    width: 300,
  },
  button: {
    borderRadius: 15,
    elevation: 2,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 40,
    backgroundColor: "#2196F3",
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
});

export default GoalModal;
