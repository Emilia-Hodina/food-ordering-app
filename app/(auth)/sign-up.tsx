import { View, Text, Alert, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import { useState } from "react";
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import SuccessModal from "@/components/SuccessModal";

const SignUp = () => {
  const { fetchAuthenticatedUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const submit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      return Alert.alert(
        "Error",
        "Please enter valid email address & password.",
      );
    }

    setIsSubmitting(true);

    try {
      // 1. Creează contul și sesiunea în Appwrite
      await createUser({ email, password, name });

      // 2. Afișează modalul de succes (nu apelăm încă fetchAuthenticatedUser)
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToHomepage = async () => {
    // 3. Închide modalul, actualizează starea utilizatorului și navighează
    setShowSuccess(false);
    await fetchAuthenticatedUser();
    router.replace("/");
  };

  return (
    <>
      <View className="gap-10 bg-white rounded-lg p-5 mt-5">
        <CustomInput
          placeholder="Enter your full name"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
          label="Full name"
        />
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
          title="Sign Up"
          isLoading={isSubmitting}
          onPress={submit}
        />

        <View className="flex-row items-center justify-center mt-5 gap-x-1.5">
          <Text className="base-regular text-gray-100">
            Already have an account?
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="base-bold text-primary">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <SuccessModal
        visible={showSuccess}
        title="Account Created!"
        message="Your account has been created successfully. Let's get started!"
        buttonTitle="Go to Homepage"
        onPress={goToHomepage}
      />
    </>
  );
};

export default SignUp;
