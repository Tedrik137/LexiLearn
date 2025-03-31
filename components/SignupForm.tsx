import { Text, View, TextInput, Button, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { ThemedText } from "./ThemedText";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

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

  const onSubmit = async (data: FormData) => {
    const result = await signUp(data.email, data.password, data.displayName);

    if (!result.success) {
      console.log(result.error);
    }
  };

  const password = watch("password");

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

      <ThemedText>Display Name</ThemedText>
      <Controller
        control={control}
        rules={{
          required: true,
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
      {errors.displayName && <Text>{errors.displayName.message}</Text>}

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

      <ThemedText>Confirm Password</ThemedText>
      <Controller
        control={control}
        rules={{
          validate: (value) => value == password || "Passwords do not match",
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
      {errors.confirmPassword && <Text>{errors.confirmPassword.message}</Text>}

      <Button
        color="#328f32"
        title="Sign Up"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
