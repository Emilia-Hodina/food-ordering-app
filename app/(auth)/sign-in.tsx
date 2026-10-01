import { View, Text, Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import { useState } from "react";
import { signIn } from "@/lib/appwrite";
import * as Sentry from "@sentry/react-native";
import useAuthStore from "@/store/auth.store";
import SuccessModal from "@/components/SuccessModal";

const SignIn = () => {
  const { fetchAuthenticatedUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const submit = async () => {
    const { email, password } = form;

    if (!email || !password) {
      return Alert.alert(
        "Error",
        "Please enter valid email address & password.",
      );
    }

    setIsSubmitting(true);

    try {
      // 1. Autentifică utilizatorul în Appwrite
      await signIn({ email, password });

      // 2. Declanșează afișarea modalului
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert("Error", error.message);
      Sentry.captureEvent(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToHomepage = async () => {
    // 3. Închide modalul, actualizează starea utilizatorului și redirecționează
    setShowSuccess(false);
    await fetchAuthenticatedUser();
    router.replace("/");
  };

  return (
    <>
      <View className="gap-10 bg-white rounded-lg p-5 mt-5">
        <CustomInput
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
          label="Email"
          keyboardType="email-address"
        />
        <CustomInput
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, password: text }))
          }
          label="Password"
          secureTextEntry={true}
        />

        <CustomButton
          title="Sign In"
          isLoading={isSubmitting}
          onPress={submit}
        />

        <View className="flex-row items-center justify-center mt-5 gap-x-1.5">
          <Text className="base-regular text-gray-100">
            Don't have an account?
          </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="base-bold text-primary">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <SuccessModal
        visible={showSuccess}
        title="Login Successful"
        message="You're all set to continue where you left off."
        buttonTitle="Go to Homepage"
        onPress={goToHomepage}
      />
    </>
  );
};

export default SignIn;
