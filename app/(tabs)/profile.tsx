import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import ProfileField from "@/components/ProfileField";
import { images } from "@/constants";
import { signOut, updateUser, uploadAvatar } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

const Profile = () => {
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();
  const [isUploading, setIsUploading] = useState(false);

  const avatarSource = user?.avatar ? { uri: user.avatar } : images.avatar;

  const handlePickAndUploadImage = async () => {
    try {
      // 1. Cerem permisiunea pentru galerie
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "Permission to access the camera roll is required to update your avatar.",
        );
        return;
      }

      // 2. Deschidem galeria pentru alegerea imaginii
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // <-- sintaxa actualizată
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploading(true);

      const fileData = {
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize || 0,
        uri: asset.uri,
      };

      // 3. Încărcăm în Appwrite Storage
      const avatarUrl = await uploadAvatar(fileData);

      // 4. Actualizăm documentul utilizatorului în baza de date
      if (user?.$id) {
        const updatedUser = await updateUser(user.$id, { avatar: avatarUrl });

        // 5. Actualizăm store-ul local ca să se schimbe poza imediat
        useAuthStore.setState({ user: { ...user, avatar: avatarUrl } });
        Alert.alert("Success", "Avatar updated successfully!");
      }
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  const fields = [
    { label: "Full Name", value: user?.name, icon: images.person },
    { label: "Email", value: user?.email, icon: images.envelope },
    { label: "Phone number", value: user?.phone, icon: images.phone },
    {
      label: "Address 1 - (Home)",
      value: user?.address_home,
      icon: images.location,
    },
    {
      label: "Address 2 - (Work)",
      value: user?.address_work,
      icon: images.location,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      clearCart();
      useAuthStore.setState({ user: null, isAuthenticated: false });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const confirmLogout = () =>
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: handleLogout },
    ]);

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView contentContainerClassName="pb-32 px-5 pt-5">
        <CustomHeader title="Profile" />

        <View className="flex-center mb-8">
          <View className="profile-avatar relative">
            <Image
              source={avatarSource}
              className="size-full rounded-full"
              resizeMode="cover"
            />

            {/* Indicator de încărcare peste avatar */}
            {isUploading && (
              <View className="absolute inset-0 bg-black/40 rounded-full flex-center">
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            )}

            {/* Butonul cu creion */}
            <TouchableOpacity
              onPress={handlePickAndUploadImage}
              disabled={isUploading}
              activeOpacity={0.7}
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

        <View className="bg-white rounded-2xl p-5 shadow-md shadow-black/10">
          {fields.map((field) => (
            <ProfileField
              key={field.label}
              {...field}
              value={field.value || "Not set"}
            />
          ))}
        </View>

        <View className="gap-4 mt-8">
          <CustomButton
            title="Edit Profile"
            style="!bg-white border border-primary"
            textStyle="!text-primary"
            onPress={() => router.push("/edit-profile")}
          />

          <CustomButton
            title="Logout"
            style="!bg-error/10 border border-error"
            textStyle="!text-error"
            leftIcon={
              <Image
                source={images.logout}
                className="size-5 mr-2"
                resizeMode="contain"
                tintColor="#F14141"
              />
            }
            onPress={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
