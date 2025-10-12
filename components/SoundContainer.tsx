import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { Audio } from "expo-av";
import { ThemedView } from "./ThemedView";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebaseConfig";
import { useAuthStore } from "@/stores/authStore";
import { RolePlayingQuiz } from "./RolePlayingScenarioQuiz";
import { ScenarioSentence } from "@/entities/rolePlayingSentences";
import { ThemedText } from "./ThemedText";

interface Props {
  moveToNextSentence: () => void;
  setQuiz: React.Dispatch<React.SetStateAction<RolePlayingQuiz>>;
  currentScenario: ScenarioSentence[];
  currentScenarioIndex: number;
  isPromptPlaying: boolean;
  quizMode: string;
  replayPrompt: () => void;
}

// Define a new preset optimized for Google Speech-to-Text
const SPEECH_RECOGNITION_PRESET = {
  isMeteringEnabled: true,
  android: {
    extension: ".amr",
    outputFormat: Audio.AndroidOutputFormat.AMR_WB,
    audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
    sampleRate: 16000,
    numberOfChannels: 1,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 16000,
    numberOfChannels: 1,
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
    bitRate: 256000,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

const SoundContainer = ({
  moveToNextSentence,
  setQuiz,
  currentScenario,
  currentScenarioIndex,
  isPromptPlaying,
  quizMode,
  replayPrompt,
}: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingURI, setRecordingURI] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
      recordingRef.current?.stopAndUnloadAsync();
    };
  }, []);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        const newPermissions = await requestPermission();
        if (newPermissions.status !== "granted") {
          Alert.alert("Permission to access the microphone is required!");
          return;
        }
      }

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

      console.log("Starting recording with speech recognition preset...");
      const { recording } = await Audio.Recording.createAsync(
        SPEECH_RECOGNITION_PRESET
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("Failed to start recording. Please try again.");
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      if (uri) {
        setRecordingURI(uri);
      } else {
        setError("Could not retrieve recording URI.");
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("Failed to stop recording. Please try again.");
    }
  }

  async function playSound() {
    if (!recordingURI) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const { sound } = await Audio.Sound.createAsync({ uri: recordingURI });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      });
      await sound.replayAsync();
    } catch (err) {
      console.error("Failed to play sound", err);
    }
  }

  async function uploadRecording(localFileUri: string): Promise<string | null> {
    try {
      console.log("Starting upload...");
      const fileExtension = Platform.OS === "ios" ? ".wav" : ".amr";
      const fileName = `user-recordings/${
        user?.uid
      }/${new Date().toISOString()}${fileExtension}`;
      const storageRef = ref(storage, fileName);

      const response = await fetch(localFileUri);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch recording from local URI. Status: ${response.status}`
        );
      }

      const blob = await response.blob();
      const snapshot = await uploadBytes(storageRef, blob);
      const gsUri = `gs://${snapshot.ref.bucket}/${snapshot.ref.fullPath}`;
      console.log("Upload successful. URI:", gsUri);

      return gsUri;
    } catch (error) {
      console.error("Error during recording upload:", error);
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your recording. Please try again."
      );
      return null;
    }
  }

  // **FIX 2: Refactor the orchestrator function**
  async function saveSound() {
    if (!recordingURI) {
      Alert.alert("No recording available to save.");
      return;
    }
    setIsSaving(true);
    try {
      // Step 1: Upload the recording and get the cloud URI.
      const cloudUri = await uploadRecording(recordingURI);

      // Step 2: Only proceed if the upload was successful.
      if (cloudUri) {
        // Step 3: Update the quiz state with the new answer.
        const expectedResponse = currentScenario[currentScenarioIndex].response;
        setQuiz((prevQuiz) => ({
          ...prevQuiz,
          answers: [
            ...prevQuiz.answers,
            {
              response: expectedResponse,
              uri: cloudUri,
            },
          ],
        }));

        // Step 4: Clean up local state for the next recording.
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setRecordingURI(null);
        setIsPlaying(false);

        // Step 5: Move to the next sentence.
        moveToNextSentence();
      }
      // If cloudUri is null, the user has already been alerted.
    } catch (err) {
      console.error(
        "An unexpected error occurred in saveAndAnalyzeSound:",
        err
      );
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      // This will now run reliably whether the upload succeeds or fails.
      setIsSaving(false);
    }
  }

  const pauseSound = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      console.warn("No sound is currently playing.");
      Alert.alert("No sound is currently playing.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.replayButton,
            isPromptPlaying && styles.disabledRecordingButton,
          ]}
          onPress={() => {
            if (!isPromptPlaying) {
              replayPrompt();
            }
          }}
        >
          <IconSymbol
            name="arrow.counterclockwise.circle.fill"
            size={44}
            color="white"
          />
        </Pressable>
        <Pressable
          style={[
            styles.micButton,
            (isSaving ||
              isPromptPlaying ||
              (quizMode === "test" && recordingURI != null)) &&
              styles.disabledRecordingButton,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={
            isSaving ||
            isPromptPlaying ||
            (quizMode === "test" && recordingURI != null)
          }
        >
          <IconSymbol
            name={isRecording ? "stop" : "mic.fill"}
            size={44}
            color="white"
          />
        </Pressable>
        {quizMode === "test" && recordingURI != null && (
          <>
            <ThemedText style={[styles.helpText]}>
              In test mode, you can only record once per sentence. You cannot
              play back your recording.
            </ThemedText>
            <ThemedText style={[styles.helpText]}></ThemedText>
          </>
        )}
        {quizMode !== "test" && (
          <Pressable
            style={[
              styles.playButton,
              (!recordingURI ||
                isSaving ||
                isPromptPlaying ||
                (quizMode === "test" && recordingURI != null)) &&
                styles.disabledPlayButton,
            ]}
            onPress={isPlaying ? pauseSound : playSound}
            disabled={
              !recordingURI ||
              isSaving ||
              isPromptPlaying ||
              (quizMode === "test" && recordingURI != null)
            }
          >
            <IconSymbol
              name={isPlaying ? "pause.fill" : "arrowtriangle.right.fill"}
              size={44}
              color="white"
            />
          </Pressable>
        )}
        <Pressable
          onPress={saveSound}
          style={[quizMode === "test" && styles.nextButton]}
          disabled={!recordingURI || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="green" />
          ) : (
            <IconSymbol
              name="arrow.right.square.fill"
              size={44}
              color={!recordingURI ? "#a5d6a7" : "green"}
            />
          )}
        </Pressable>
      </ThemedView>
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
  replayButton: {
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 20,
  },
  micButton: {
    backgroundColor: "#007AFF",
    borderRadius: 50,
    padding: 20,
  },
  playButton: {
    backgroundColor: "#34C759",
    borderRadius: 50,
    padding: 20,
  },
  disabledPlayButton: {
    backgroundColor: "#a5d6a7",
  },
  disabledRecordingButton: {
    backgroundColor: "#b0bec5",
  },
  disabledReplayButton: {
    backgroundColor: "#b0bec5",
  },
  nextButton: {
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});

export default SoundContainer;
