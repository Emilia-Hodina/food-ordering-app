import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import CustomInput from "@/components/CustomInput";
import { images } from "@/constants";
import { updateUser, uploadAvatar } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { CustomInputProps, UpdateUserParams } from "@/type";

const FIELDS: {
  key: keyof UpdateUserParams;
  label: string;
  placeholder: string;
  keyboardType?: CustomInputProps["keyboardType"];
}[] = [
  { key: "name", label: "Full name", placeholder: "Enter your full name" },
  {
    key: "phone",
    label: "Phone number",
    placeholder: "Enter your phone number",
    keyboardType: "phone-pad",
  },
  {
    key: "address_home",
    label: "Address 1 - (Home)",
    placeholder: "Enter your home address",
  },
  {
    key: "address_work",
    label: "Address 2 - (Work)",
    placeholder: "Enter your work address",
  },
];

const EditProfile = () => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatar);

  const [form, setForm] = useState<UpdateUserParams>({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address_home: user?.address_home ?? "",
    address_work: user?.address_work ?? "",
  });

  const handlePickAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return Alert.alert(
          "Permission Denied",
          "Permission to access camera roll is required.",
        );
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setIsUploading(true);

        const newAvatarUrl = await uploadAvatar({
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize || 0,
          uri: asset.uri,
        });

        setAvatarUri(newAvatarUrl);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async () => {
    if (!user) return;

    if (!form.name?.trim()) {
      return Alert.alert("Error", "Please enter your name.");
    }

    const params: UpdateUserParams = {
      name: form.name.trim(),
      phone: form.phone?.trim() ?? "",
      address_home: form.address_home?.trim() ?? "",
      address_work: form.address_work?.trim() ?? "",
      avatar: avatarUri,
    };

    setIsSubmitting(true);

    try {
      const updated = await updateUser(user.$id, params);
      useAuthStore.setState({ user: updated });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSource = avatarUri ? { uri: avatarUri } : images.avatar;

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="px-5 pt-3 pb-24"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          <CustomHeader title="Edit Profile" />

          {/* Avatar edit */}
          <View className="flex-center my-6">
            <View className="profile-avatar relative">
              <Image
                source={avatarSource}
                className="size-full rounded-full"
                resizeMode="cover"
              />

              {isUploading && (
                <View className="absolute inset-0 bg-black/40 rounded-full flex-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}

              <TouchableOpacity
                onPress={handlePickAvatar}
                disabled={isUploading}
                activeOpacity={0.8}
                className="profile-edit"
              >
                <Image
                  source={images.pencil}
                  className="size-3"
                  resizeMode="contain"
                  tintColor="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Inputs */}
          <View className="gap-6">
            {FIELDS.map(({ key, ...field }) => (
              <CustomInput
                key={key}
                {...field}
                value={form[key]}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, [key]: text }))
                }
              />
            ))}

            <CustomButton
              title="Save changes"
              isLoading={isSubmitting || isUploading}
              onPress={submit}
              style="mt-2"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
