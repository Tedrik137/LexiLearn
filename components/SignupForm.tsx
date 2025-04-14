import { Text, View, TextInput } from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { ThemedText } from "./ThemedText";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import AnimatedSubmissionButton from "./AnimatedSubmissionButton";

type FormData = {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpForm() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const signUp = useAuthStore((state) => state.signUp);
  const [signingUp, setSigningUp] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSigningUp(true);
    const result = await signUp(data.email, data.password, data.displayName);

    if (!result.success) {
      console.log(result.error);
      // Reset form
    }
    setSigningUp(false);
  };

  const password = watch("password");

  return (
    <View>
      <ThemedText>Email</ThemedText>
      <Controller
        control={control}
        rules={{
          required: "Email is required",
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
      {errors.email && <ThemedText>{errors.email.message}</ThemedText>}

      <ThemedText>Display Name</ThemedText>
      <Controller
        control={control}
        rules={{
          required: "Display name is required",
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="User123"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="displayName"
      />
      {errors.displayName && (
        <ThemedText>{errors.displayName.message}</ThemedText>
      )}

      <ThemedText>Password</ThemedText>
      <Controller
        control={control}
        rules={{
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters long",
          },
          pattern: {
            value: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@!_%&*])/,
            message:
              "Password must have at least one uppercase and lowercase letter, one number, and one special character",
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
      {errors.password && <ThemedText>{errors.password.message}</ThemedText>}

      <ThemedText>Confirm Password</ThemedText>
      <Controller
        control={control}
        rules={{
          required: "Confirm password is required",
          validate: (value) => value === password || "Passwords do not match",
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
        name="confirmPassword"
      />
      {errors.confirmPassword && (
        <ThemedText>{errors.confirmPassword.message}</ThemedText>
      )}

      <AnimatedSubmissionButton
        onPress={handleSubmit(onSubmit)}
        isLoading={signingUp}
        text="Sign Up"
        loadingText="Signing Up..."
        outerBackgroundColor="#328f32"
        innerBackgroundColor="#186318"
      />
    </View>
  );
}
