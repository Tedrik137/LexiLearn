import { useEffect, useState, useRef } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { Audio } from "expo-av";
import { ThemedView } from "./ThemedView";

interface Props {
  currentScenarioIndex: number;
  saveCurrentSound: (sound: Audio.Sound) => void;
}

const SoundContainer = ({ currentScenarioIndex, saveCurrentSound }: Props) => {
  // State hooks for values that drive UI re-renders
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingURI, setRecordingURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref hooks to hold mutable objects without causing re-renders
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // This effect runs ONLY when the component unmounts to clean up resources.
  useEffect(() => {
    return () => {
      console.log("Mic component unmounting. Cleaning up resources...");
      if (soundRef.current) {
        console.log("Unloading sound object.");
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        console.log("Unloading recording object.");
        // This ensures an active recording is stopped and cleaned up.
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []); // Empty dependency array ensures this runs only on unmount.

  useEffect(() => {
    console.log(
      "Mic component mounted. Resetting states and preparing for new recording."
    );

    if (soundRef.current) {
      // save the current sound and reset the recording and sound states
      saveCurrentSound(soundRef.current);
    }

    setRecordingURI(null);
    setIsPlaying(false);
    setIsRecording(false);
    setError(null);
  }, [currentScenarioIndex]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        const newPermissions = await requestPermission();
        if (newPermissions.status !== "granted") {
          Alert.alert("Permission to access the microphone is required!");
          return;
        }
      }

      // Clean up previous sound before starting a new recording
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setRecordingURI(null);
      setIsPlaying(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording...");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      console.log("Recording started.");
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("Failed to start recording. Please try again.");
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    console.log("Stopping recording...");

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (!uri) {
        setError("Could not retrieve recording URI.");
        return;
      }
      console.log("Recording stopped and stored at", uri);
      setRecordingURI(uri);
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("Failed to stop recording. Please try again.");
    }
  }

  async function playSound() {
    if (!recordingURI) return;
    console.log("Attempting to play sound from URI:", recordingURI);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("Creating new sound object for playback...");
      const { sound } = await Audio.Sound.createAsync({ uri: recordingURI });
      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await sound.replayAsync();
      console.log("Playback started.");
    } catch (err) {
      console.error("Failed to play sound", err);
      setError("Failed to play sound. Please try again.");
    }
  }

  async function pauseSound() {
    if (!soundRef.current) return;
    console.log("Pausing sound...");
    try {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      console.log("Playback paused.");
    } catch (err) {
      console.error("Failed to pause sound", err);
    }
  }

  async function saveSound() {
    if (!recordingURI) {
      Alert.alert("No recording available to save.");
      return;
    }

    try {
      if (!soundRef.current) {
        console.log("Creating sound object for saving...");
        const { sound } = await Audio.Sound.createAsync({ uri: recordingURI });
        soundRef.current = sound;
      }

      const sound = soundRef.current;

      // clean up current sound and recording before saving and moving onto next question
      setRecordingURI(null);
      setIsPlaying(false);
      setIsRecording(false);
      recordingRef.current = null;
      soundRef.current = null;

      console.log("Saving current sound...");
      saveCurrentSound(sound);
      console.log("Sound saved successfully.");
    } catch (err) {
      console.error("Failed to save sound", err);
      setError("Failed to save sound. Please try again.");
      Alert.alert("Error", "Failed to save sound. Please try again.");
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.micButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <IconSymbol
          name={isRecording ? "stop" : "mic.fill"}
          size={36}
          color="white"
        />
      </Pressable>

      <Pressable
        style={[styles.playButton, !recordingURI && styles.disabledButton]}
        onPress={!isPlaying ? playSound : pauseSound}
        disabled={!recordingURI}
      >
        <IconSymbol
          name={isPlaying ? "pause.fill" : "arrowtriangle.right.fill"}
          size={36}
          color="white"
        />
      </Pressable>

      <Pressable
        onPress={saveSound}
        style={[styles.nextButton]}
        disabled={!recordingURI}
      >
        <IconSymbol
          name="arrow.right.square.fill"
          size={44}
          color={!recordingURI ? "#a5d6a7" : "green"}
        />
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    position: "relative",
  },
  micButton: {
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 20,
    margin: 10,
  },
  playButton: {
    backgroundColor: "#34C759",
    borderRadius: 50,
    padding: 20,
    margin: 10,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7", // A lighter, disabled-looking green
  },
  nextButton: {
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
    position: "absolute",
    right: 0,
  },
});

export default SoundContainer;
