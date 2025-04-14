import {
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { ThemedText } from "./ThemedText";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import AnimatedSubmissionButton from "./AnimatedSubmissionButton";
import { useState } from "react";

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);

  const onSubmit = async (data: FormData) => {
    setIsLoggingIn(true);
    const result = await signIn(data.email, data.password);

    if (!result.success) {
      console.log(result.error);
      // reset the form
    }
    setIsLoggingIn(false);
  };

  return (
    <View>
      <ThemedText>Email</ThemedText>
      <Controller
        control={control}
        rules={{
          required: true,
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Must be a valid email",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="abc@example.com"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="email"
      />
      {errors.email && <Text>{errors.email.message}</Text>}

      <ThemedText>Password</ThemedText>
      <Controller
        control={control}
        rules={{
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters long",
          },
          required: true,
          pattern: {
            value: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@!_%&*])/,
            message:
              "Password must have at least one uppercase and lowercase letter, one number and any special character",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="●●●●●●●●"
            value={value}
            secureTextEntry={true}
          />
        )}
        name="password"
      />
      {errors.password && <Text>{errors.password.message}</Text>}

      <AnimatedSubmissionButton
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoggingIn}
        loadingText="Logging In..."
        text="Login"
        outerBackgroundColor="#005dfc"
        innerBackgroundColor="#0045bd"
      />
    </View>
  );
}
